from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from bson import ObjectId
from datetime import datetime

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is super admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'super_admin':
            return jsonify({'error': 'Super Admin access required'}), 403
        
        # Get query parameters
        role = request.args.get('role')
        department = request.args.get('department')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        # Build query
        query = {}
        if role:
            query['role'] = role
        if department:
            query['department'] = department
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'email': {'$regex': search, '$options': 'i'}},
                {'roll_no': {'$regex': search, '$options': 'i'}},
                {'employee_id': {'$regex': search, '$options': 'i'}}
            ]
        
        # Get total count
        total = db.users.count_documents(query)
        
        # Get users with pagination
        users = list(db.users.find(query)
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .sort('created_at', -1))
        
        # Remove passwords and convert ObjectId
        for user in users:
            user.pop('password', None)
            user['_id'] = str(user['_id'])
        
        return jsonify({
            'users': users,
            'total': total,
            'page': page,
            'limit': limit,
            'total_pages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<target_user_id>', methods=['GET'])
@jwt_required()
def get_user(target_user_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get current user
        current_user = db.users.find_one({'_id': ObjectId(user_id)})
        
        # Check permissions - users can view their own profile, admins can view any
        if current_user['role'] != 'admin' and user_id != target_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get target user
        target_user = db.users.find_one({'_id': ObjectId(target_user_id)})
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Remove password
        target_user.pop('password', None)
        target_user['_id'] = str(target_user['_id'])
        
        # Add additional info based on role
        if target_user['role'] == 'student':
            # Get enrolled courses
            enrollments = list(db.enrollments.find({'student_id': target_user_id}))
            enrolled_courses = []
            for enrollment in enrollments:
                course = db.courses.find_one({'_id': ObjectId(enrollment['course_id'])})
                if course:
                    enrolled_courses.append({
                        'course_id': str(course['_id']),
                        'title': course['title'],
                        'progress': enrollment.get('progress', 0),
                        'enrolled_at': enrollment['enrolled_at']
                    })
            target_user['enrolled_courses_details'] = enrolled_courses
            
            # Get assignment submissions
            submissions = db.submissions.count_documents({'student_id': target_user_id})
            target_user['total_submissions'] = submissions
            
            # Get quiz attempts
            attempts = db.quiz_attempts.count_documents({'student_id': target_user_id})
            target_user['total_quiz_attempts'] = attempts
            
        elif target_user['role'] == 'teacher':
            # Get created courses
            courses = list(db.courses.find({'teacher_id': target_user_id}))
            created_courses = []
            for course in courses:
                enrollment_count = db.enrollments.count_documents({'course_id': str(course['_id'])})
                created_courses.append({
                    'course_id': str(course['_id']),
                    'title': course['title'],
                    'enrolled_students': enrollment_count,
                    'created_at': course['created_at']
                })
            target_user['created_courses_details'] = created_courses
        
        return jsonify({'user': target_user}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<target_user_id>', methods=['PUT'])
@jwt_required()
def update_user(target_user_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get current user
        current_user = db.users.find_one({'_id': ObjectId(user_id)})
        
        # Check permissions
        if current_user['role'] != 'admin' and user_id != target_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get target user
        target_user = db.users.find_one({'_id': ObjectId(target_user_id)})
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Fields that can be updated by user themselves
        user_updatable_fields = ['name', 'phone', 'profile_pic']
        
        # Additional fields that can be updated by admin
        admin_updatable_fields = [
            'email', 'role', 'department', 'year', 'semester', 'designation',
            'specializations', 'is_active'
        ]
        
        update_data = {}
        
        # Allow user to update their own basic fields
        if user_id == target_user_id:
            for field in user_updatable_fields:
                if field in data:
                    update_data[field] = data[field]
        
        # Allow admin to update additional fields
        if current_user['role'] == 'admin':
            for field in admin_updatable_fields:
                if field in data:
                    update_data[field] = data[field]
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        update_data['updated_at'] = datetime.utcnow()
        
        # Update user
        db.users.update_one(
            {'_id': ObjectId(target_user_id)},
            {'$set': update_data}
        )
        
        # Get updated user
        updated_user = db.users.find_one({'_id': ObjectId(target_user_id)})
        updated_user.pop('password', None)
        updated_user['_id'] = str(updated_user['_id'])
        
        return jsonify({
            'message': 'User updated successfully',
            'user': updated_user
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<target_user_id>/deactivate', methods=['POST'])
@jwt_required()
def deactivate_user(target_user_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is admin or super admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Check if target user exists
        target_user = db.users.find_one({'_id': ObjectId(target_user_id)})
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent admin from deactivating themselves
        if user_id == target_user_id:
            return jsonify({'error': 'Cannot deactivate your own account'}), 400
        
        # Deactivate user
        db.users.update_one(
            {'_id': ObjectId(target_user_id)},
            {'$set': {
                'is_active': False,
                'updated_at': datetime.utcnow()
            }}
        )
        
        return jsonify({'message': 'User deactivated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<target_user_id>/activate', methods=['POST'])
@jwt_required()
def activate_user(target_user_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is admin or super admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Check if target user exists
        target_user = db.users.find_one({'_id': ObjectId(target_user_id)})
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Activate user
        db.users.update_one(
            {'_id': ObjectId(target_user_id)},
            {'$set': {
                'is_active': True,
                'updated_at': datetime.utcnow()
            }}
        )
        
        return jsonify({'message': 'User activated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<target_user_id>/reset-password', methods=['POST'])
@jwt_required()
def reset_user_password(target_user_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is admin or super admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Check if target user exists
        target_user = db.users.find_one({'_id': ObjectId(target_user_id)})
        if not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        new_password = data.get('new_password')
        
        if not new_password:
            return jsonify({'error': 'New password is required'}), 400
        
        # Validate password strength
        if len(new_password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        # Update password
        hashed_password = generate_password_hash(new_password)
        db.users.update_one(
            {'_id': ObjectId(target_user_id)},
            {'$set': {
                'password': hashed_password,
                'updated_at': datetime.utcnow()
            }}
        )
        
        return jsonify({'message': 'Password reset successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/bulk-import', methods=['POST'])
@jwt_required()
def bulk_import_users():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is admin or super admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        users_data = data.get('users', [])
        
        if not users_data:
            return jsonify({'error': 'No users data provided'}), 400
        
        created_users = []
        errors = []
        
        for i, user_data in enumerate(users_data):
            try:
                # Validate required fields
                required_fields = ['name', 'email', 'role']
                for field in required_fields:
                    if field not in user_data or not user_data[field]:
                        errors.append(f'Row {i+1}: {field} is required')
                        continue
                
                # Check if user already exists
                existing_user = db.users.find_one({'email': user_data['email']})
                if existing_user:
                    errors.append(f'Row {i+1}: User with email {user_data["email"]} already exists')
                    continue
                
                # Set default password if not provided
                password = user_data.get('password', 'TempPass@123')
                
                # Create user
                new_user = {
                    'name': user_data['name'],
                    'email': user_data['email'].lower(),
                    'password': generate_password_hash(password),
                    'role': user_data['role'],
                    'phone': user_data.get('phone', ''),
                    'profile_pic': user_data.get('profile_pic', ''),
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow(),
                    'is_active': True
                }
                
                # Add role-specific fields
                if user_data['role'] == 'student':
                    new_user.update({
                        'roll_no': user_data.get('roll_no', ''),
                        'department': user_data.get('department', ''),
                        'year': user_data.get('year', ''),
                        'semester': user_data.get('semester', ''),
                        'enrolled_courses': [],
                        'completed_courses': [],
                        'total_points': 0,
                        'badges': []
                    })
                elif user_data['role'] == 'teacher':
                    new_user.update({
                        'employee_id': user_data.get('employee_id', ''),
                        'department': user_data.get('department', ''),
                        'designation': user_data.get('designation', ''),
                        'courses_created': [],
                        'specializations': user_data.get('specializations', [])
                    })
                
                result = db.users.insert_one(new_user)
                new_user['_id'] = str(result.inserted_id)
                new_user.pop('password')
                created_users.append(new_user)
                
            except Exception as e:
                errors.append(f'Row {i+1}: {str(e)}')
        
        return jsonify({
            'message': f'Bulk import completed. {len(created_users)} users created.',
            'created_users': created_users,
            'errors': errors
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_user_statistics():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is admin or super admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get user statistics
        total_users = db.users.count_documents({})
        active_users = db.users.count_documents({'is_active': True})
        students = db.users.count_documents({'role': 'student'})
        teachers = db.users.count_documents({'role': 'teacher'})
        admins = db.users.count_documents({'role': 'admin'})
        
        # Get recent registrations (last 30 days)
        thirty_days_ago = datetime.utcnow().replace(day=1)  # Simplified to month start
        recent_registrations = db.users.count_documents({
            'created_at': {'$gte': thirty_days_ago}
        })
        
        # Get department-wise distribution
        pipeline = [
            {'$match': {'role': {'$in': ['student', 'teacher']}}},
            {'$group': {'_id': '$department', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}}
        ]
        department_stats = list(db.users.aggregate(pipeline))
        
        return jsonify({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': total_users - active_users,
            'students': students,
            'teachers': teachers,
            'admins': admins,
            'recent_registrations': recent_registrations,
            'department_distribution': department_stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500