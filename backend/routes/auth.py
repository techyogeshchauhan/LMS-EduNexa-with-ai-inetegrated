from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required, 
    get_jwt_identity, get_jwt
)
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from datetime import datetime, timedelta
import re
import secrets
import hashlib

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    # At least 8 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special char
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    return True

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'role']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        if not validate_password(data['password']):
            return jsonify({'error': 'Password must be at least 8 characters with uppercase, lowercase, digit, and special character'}), 400
        
        # Validate role
        valid_roles = ['student', 'teacher', 'super_admin']
        if data['role'] not in valid_roles:
            return jsonify({'error': 'Invalid role'}), 400
        
        # Check if user already exists
        db = current_app.db
        existing_user = db.users.find_one({'email': data['email']})
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Role-specific validation
        user_data = {
            'name': data['name'],
            'email': data['email'].lower(),
            'password': generate_password_hash(data['password']),
            'role': data['role'],
            'phone': data.get('phone', ''),
            'profile_pic': data.get('profile_pic', ''),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'is_active': True
        }
        
        if data['role'] == 'student':
            # Student-specific fields
            required_student_fields = ['rollNumber', 'department', 'year']
            for field in required_student_fields:
                if field not in data or not data[field]:
                    field_name = 'Roll Number' if field == 'rollNumber' else field.title()
                    return jsonify({'error': f'{field_name} is required for students'}), 400
            
            # Check if roll number already exists
            existing_roll = db.users.find_one({'roll_number': data['rollNumber']})
            if existing_roll:
                return jsonify({'error': 'Roll number already exists'}), 409
            
            user_data.update({
                'roll_number': data['rollNumber'],
                'department': data['department'],
                'year': data['year'],
                'semester': data.get('semester', ''),
                'enrolled_courses': [],
                'completed_courses': [],
                'total_points': 0,
                'badges': []
            })
            
        elif data['role'] == 'teacher':
            # Teacher-specific fields
            required_teacher_fields = ['employeeId', 'department', 'designation']
            for field in required_teacher_fields:
                if field not in data or not data[field]:
                    field_name = 'Employee ID' if field == 'employeeId' else field.title()
                    return jsonify({'error': f'{field_name} is required for teachers'}), 400
            
            # Check if employee ID already exists
            existing_emp = db.users.find_one({'employee_id': data['employeeId']})
            if existing_emp:
                return jsonify({'error': 'Employee ID already exists'}), 409
            
            user_data.update({
                'employee_id': data['employeeId'],
                'department': data['department'],
                'designation': data['designation'],
                'courses_created': [],
                'specializations': data.get('specializations', [])
            })
        
        elif data['role'] == 'super_admin':
            # Super Admin-specific fields
            user_data.update({
                'employee_id': data.get('employeeId', ''),
                'department': data.get('department', 'System Administration'),
                'designation': data.get('designation', 'Super Administrator'),
                'permissions': ['all']  # Super admin has all permissions
            })
        
        # Insert user into database
        result = db.users.insert_one(user_data)
        
        # Create access and refresh tokens
        access_token = create_access_token(identity=str(result.inserted_id))
        refresh_token = create_refresh_token(identity=str(result.inserted_id))
        
        # Store refresh token in database
        db.refresh_tokens.insert_one({
            'user_id': str(result.inserted_id),
            'token_hash': hashlib.sha256(refresh_token.encode()).hexdigest(),
            'created_at': datetime.utcnow(),
            'expires_at': datetime.utcnow() + timedelta(days=7),
            'is_active': True
        })
        
        # Return user data (without password)
        user_data.pop('password')
        user_data['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user_data,
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user by email
        db = current_app.db
        user = db.users.find_one({'email': data['email'].lower()})
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check if user is active
        if not user.get('is_active', True):
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Verify password
        if not check_password_hash(user['password'], data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Create access and refresh tokens
        user_id = str(user['_id'])
        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)
        
        # Store refresh token in database
        db.refresh_tokens.insert_one({
            'user_id': user_id,
            'token_hash': hashlib.sha256(refresh_token.encode()).hexdigest(),
            'created_at': datetime.utcnow(),
            'expires_at': datetime.utcnow() + timedelta(days=7),
            'is_active': True
        })
        
        # Update last login
        db.users.update_one(
            {'_id': user['_id']},
            {'$set': {'last_login': datetime.utcnow()}}
        )
        
        # Return user data (without password)
        user.pop('password')
        user['_id'] = user_id
        
        return jsonify({
            'message': 'Login successful',
            'user': user,
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Remove password from response
        user.pop('password', None)
        user['_id'] = str(user['_id'])
        
        return jsonify({'user': user}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        db = current_app.db
        
        # Fields that can be updated
        updatable_fields = ['name', 'phone', 'profile_pic', 'department', 'year', 'semester', 'designation']
        update_data = {}
        
        for field in updatable_fields:
            if field in data:
                if field == 'profile_pic':
                    # Validate profile picture data
                    profile_pic = data[field]
                    if profile_pic and not profile_pic.startswith('data:image/'):
                        return jsonify({'error': 'Invalid profile picture format'}), 400
                    # Limit base64 image size (approximately 5MB when encoded)
                    if profile_pic and len(profile_pic) > 7000000:  # ~5MB in base64
                        return jsonify({'error': 'Profile picture too large. Maximum size is 5MB'}), 400
                
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        update_data['updated_at'] = datetime.utcnow()
        
        # Update user
        result = db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'User not found'}), 404
        
        # Get updated user
        user = db.users.find_one({'_id': ObjectId(user_id)})
        user.pop('password', None)
        user['_id'] = str(user['_id'])
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        # Validate new password strength
        if not validate_password(data['new_password']):
            return jsonify({'error': 'New password must be at least 8 characters with uppercase, lowercase, digit, and special character'}), 400
        
        db = current_app.db
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verify current password
        if not check_password_hash(user['password'], data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Update password
        new_password_hash = generate_password_hash(data['new_password'])
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {
                'password': new_password_hash,
                'updated_at': datetime.utcnow()
            }}
        )
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_reset_token():
    """Generate a secure reset token"""
    return secrets.token_urlsafe(32)

def hash_token(token):
    """Hash a token for secure storage"""
    return hashlib.sha256(token.encode()).hexdigest()

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email'):
            return jsonify({'error': 'Email is required'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        db = current_app.db
        user = db.users.find_one({'email': data['email'].lower()})
        
        # Always return success to prevent email enumeration
        if not user:
            return jsonify({'message': 'If an account with that email exists, a password reset link has been sent'}), 200
        
        # Check if user is active
        if not user.get('is_active', True):
            return jsonify({'message': 'If an account with that email exists, a password reset link has been sent'}), 200
        
        # Generate reset token
        reset_token = generate_reset_token()
        token_hash = hash_token(reset_token)
        expires_at = datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
        
        # Store reset token in database
        db.password_resets.insert_one({
            'user_id': user['_id'],
            'token_hash': token_hash,
            'expires_at': expires_at,
            'created_at': datetime.utcnow(),
            'used': False
        })
        
        # In a real application, you would send an email here
        # For demo purposes, we'll return the token (remove this in production)
        return jsonify({
            'message': 'If an account with that email exists, a password reset link has been sent',
            'reset_token': reset_token  # Remove this in production
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('token') or not data.get('new_password'):
            return jsonify({'error': 'Reset token and new password are required'}), 400
        
        # Validate new password strength
        if not validate_password(data['new_password']):
            return jsonify({'error': 'New password must be at least 8 characters with uppercase, lowercase, digit, and special character'}), 400
        
        db = current_app.db
        token_hash = hash_token(data['token'])
        
        # Find valid reset token
        reset_record = db.password_resets.find_one({
            'token_hash': token_hash,
            'expires_at': {'$gt': datetime.utcnow()},
            'used': False
        })
        
        if not reset_record:
            return jsonify({'error': 'Invalid or expired reset token'}), 400
        
        # Get user
        user = db.users.find_one({'_id': reset_record['user_id']})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is active
        if not user.get('is_active', True):
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Update password
        new_password_hash = generate_password_hash(data['new_password'])
        db.users.update_one(
            {'_id': user['_id']},
            {'$set': {
                'password': new_password_hash,
                'updated_at': datetime.utcnow()
            }}
        )
        
        # Mark token as used
        db.password_resets.update_one(
            {'_id': reset_record['_id']},
            {'$set': {'used': True, 'used_at': datetime.utcnow()}}
        )
        
        # Clean up expired tokens
        db.password_resets.delete_many({
            'expires_at': {'$lt': datetime.utcnow()}
        })
        
        return jsonify({'message': 'Password reset successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify-reset-token', methods=['POST'])
def verify_reset_token():
    try:
        data = request.get_json()
        
        if not data.get('token'):
            return jsonify({'error': 'Reset token is required'}), 400
        
        db = current_app.db
        token_hash = hash_token(data['token'])
        
        # Check if token is valid
        reset_record = db.password_resets.find_one({
            'token_hash': token_hash,
            'expires_at': {'$gt': datetime.utcnow()},
            'used': False
        })
        
        if not reset_record:
            return jsonify({'valid': False, 'error': 'Invalid or expired reset token'}), 400
        
        # Get user info
        user = db.users.find_one({'_id': reset_record['user_id']})
        if not user:
            return jsonify({'valid': False, 'error': 'User not found'}), 404
        
        return jsonify({
            'valid': True,
            'user_email': user['email'],
            'expires_at': reset_record['expires_at'].isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        # Get the JWT token identifier
        jti = get_jwt()['jti']
        user_id = get_jwt_identity()
        
        # Add token to blacklist (in production, use Redis or database)
        from app import blacklisted_tokens
        blacklisted_tokens.add(jti)
        
        # Deactivate all refresh tokens for this user
        db = current_app.db
        db.refresh_tokens.update_many(
            {'user_id': user_id, 'is_active': True},
            {'$set': {'is_active': False, 'revoked_at': datetime.utcnow()}}
        )
        
        return jsonify({'message': 'Successfully logged out'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        user_id = get_jwt_identity()
        
        # Get the refresh token from request
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({'error': 'Refresh token is required'}), 400
        
        db = current_app.db
        
        # Verify refresh token exists and is active
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        stored_token = db.refresh_tokens.find_one({
            'user_id': user_id,
            'token_hash': token_hash,
            'is_active': True,
            'expires_at': {'$gt': datetime.utcnow()}
        })
        
        if not stored_token:
            return jsonify({'error': 'Invalid or expired refresh token'}), 401
        
        # Check if user still exists and is active
        user = db.users.find_one({'_id': ObjectId(user_id), 'is_active': True})
        if not user:
            return jsonify({'error': 'User not found or inactive'}), 401
        
        # Create new access token
        new_access_token = create_access_token(identity=user_id)
        
        # Optionally create new refresh token and deactivate old one
        new_refresh_token = create_refresh_token(identity=user_id)
        
        # Deactivate old refresh token
        db.refresh_tokens.update_one(
            {'_id': stored_token['_id']},
            {'$set': {'is_active': False, 'revoked_at': datetime.utcnow()}}
        )
        
        # Store new refresh token
        db.refresh_tokens.insert_one({
            'user_id': user_id,
            'token_hash': hashlib.sha256(new_refresh_token.encode()).hexdigest(),
            'created_at': datetime.utcnow(),
            'expires_at': datetime.utcnow() + timedelta(days=7),
            'is_active': True
        })
        
        return jsonify({
            'access_token': new_access_token,
            'refresh_token': new_refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/validate-token', methods=['GET'])
@jwt_required()
def validate_token():
    try:
        user_id = get_jwt_identity()
        jwt_data = get_jwt()
        
        db = current_app.db
        user = db.users.find_one({'_id': ObjectId(user_id), 'is_active': True})
        
        if not user:
            return jsonify({'valid': False, 'error': 'User not found or inactive'}), 401
        
        return jsonify({
            'valid': True,
            'user_id': user_id,
            'expires_at': datetime.fromtimestamp(jwt_data['exp']).isoformat(),
            'issued_at': datetime.fromtimestamp(jwt_data['iat']).isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 401

@auth_bp.route('/logout-all', methods=['POST'])
@jwt_required()
def logout_all():
    try:
        user_id = get_jwt_identity()
        
        # Add current token to blacklist
        jti = get_jwt()['jti']
        from app import blacklisted_tokens
        blacklisted_tokens.add(jti)
        
        # Deactivate all refresh tokens for this user
        db = current_app.db
        db.refresh_tokens.update_many(
            {'user_id': user_id, 'is_active': True},
            {'$set': {'is_active': False, 'revoked_at': datetime.utcnow()}}
        )
        
        # In a production environment, you would also invalidate all access tokens
        # This could be done by storing a "tokens_valid_after" timestamp for each user
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'tokens_valid_after': datetime.utcnow()}}
        )
        
        return jsonify({'message': 'Successfully logged out from all devices'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/cleanup-tokens', methods=['POST'])
@jwt_required()
def cleanup_tokens():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'super_admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Run token cleanup
        from utils.token_cleanup import cleanup_expired_tokens, cleanup_inactive_refresh_tokens
        
        expired_result = cleanup_expired_tokens(db)
        inactive_result = cleanup_inactive_refresh_tokens(db)
        
        return jsonify({
            'message': 'Token cleanup completed',
            'expired_tokens_cleaned': expired_result,
            'inactive_tokens_cleaned': inactive_result
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/token-stats', methods=['GET'])
@jwt_required()
def get_token_stats():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'super_admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get token statistics
        current_time = datetime.utcnow()
        
        active_refresh_tokens = db.refresh_tokens.count_documents({
            'is_active': True,
            'expires_at': {'$gt': current_time}
        })
        
        expired_refresh_tokens = db.refresh_tokens.count_documents({
            'expires_at': {'$lt': current_time}
        })
        
        inactive_refresh_tokens = db.refresh_tokens.count_documents({
            'is_active': False
        })
        
        active_reset_tokens = db.password_resets.count_documents({
            'used': False,
            'expires_at': {'$gt': current_time}
        })
        
        expired_reset_tokens = db.password_resets.count_documents({
            'expires_at': {'$lt': current_time}
        })
        
        return jsonify({
            'refresh_tokens': {
                'active': active_refresh_tokens,
                'expired': expired_refresh_tokens,
                'inactive': inactive_refresh_tokens
            },
            'password_reset_tokens': {
                'active': active_reset_tokens,
                'expired': expired_reset_tokens
            },
            'server_start_time': current_app.config.get('SERVER_START_TIME', 'Unknown')
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500