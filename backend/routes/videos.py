from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from bson import ObjectId
from datetime import datetime
import os
import uuid

videos_bp = Blueprint('videos', __name__)

# Configuration
UPLOAD_FOLDER = 'uploads/videos'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def require_teacher(f):
    """Decorator to ensure only teachers can access the endpoint"""
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        db = current_app.db
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.get('role') != 'teacher':
            return jsonify({'error': 'Only teachers can upload videos'}), 403
        
        return f(*args, **kwargs)
    
    decorated_function.__name__ = f.__name__
    return decorated_function

@videos_bp.route('/upload', methods=['POST'])
@require_teacher
def upload_video():
    """Upload a video file (teachers only)"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if file is in request
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({'error': f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'}), 400
        
        # Get additional metadata from form data
        title = request.form.get('title', '')
        description = request.form.get('description', '')
        course_id = request.form.get('courseId', '')
        
        # Generate unique filename
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Create video document in database
        video_doc = {
            'filename': unique_filename,
            'originalFilename': secure_filename(file.filename),
            'title': title or secure_filename(file.filename),
            'description': description,
            'filePath': file_path,
            'fileSize': file_size,
            'uploadedBy': ObjectId(user_id),
            'courseId': ObjectId(course_id) if course_id else None,
            'uploadedAt': datetime.utcnow(),
            'views': 0,
            'status': 'active'
        }
        
        result = db.videos.insert_one(video_doc)
        video_id = str(result.inserted_id)
        
        # Update course if courseId provided
        if course_id:
            db.courses.update_one(
                {'_id': ObjectId(course_id)},
                {
                    '$push': {
                        'videos': {
                            'videoId': ObjectId(video_id),
                            'title': video_doc['title'],
                            'addedAt': datetime.utcnow()
                        }
                    }
                }
            )
        
        return jsonify({
            'message': 'Video uploaded successfully',
            'videoId': video_id,
            'videoUrl': f'/api/videos/stream/{video_id}',
            'filename': unique_filename,
            'title': video_doc['title']
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@videos_bp.route('/stream/<video_id>', methods=['GET'])
@jwt_required()
def stream_video(video_id):
    """Stream a video file"""
    try:
        db = current_app.db
        
        # Get video document
        video = db.videos.find_one({'_id': ObjectId(video_id)})
        if not video:
            return jsonify({'error': 'Video not found'}), 404
        
        # Increment view count
        db.videos.update_one(
            {'_id': ObjectId(video_id)},
            {'$inc': {'views': 1}}
        )
        
        # Get the directory and filename
        directory = os.path.dirname(video['filePath'])
        filename = video['filename']
        
        return send_from_directory(directory, filename, as_attachment=False)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@videos_bp.route('/list', methods=['GET'])
@jwt_required()
def list_videos():
    """List all videos (with optional course filter)"""
    try:
        db = current_app.db
        user_id = get_jwt_identity()
        
        # Get query parameters
        course_id = request.args.get('courseId')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        # Build query
        query = {'status': 'active'}
        if course_id:
            query['courseId'] = ObjectId(course_id)
        
        # Get user to check role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        # If student, only show videos from enrolled courses
        if user.get('role') == 'student':
            enrolled_courses = user.get('enrolledCourses', [])
            query['courseId'] = {'$in': [ObjectId(c) for c in enrolled_courses]}
        
        # Get total count
        total = db.videos.count_documents(query)
        
        # Get videos with pagination
        videos = list(db.videos.find(query)
                     .sort('uploadedAt', -1)
                     .skip((page - 1) * limit)
                     .limit(limit))
        
        # Format response
        video_list = []
        for video in videos:
            uploader = db.users.find_one({'_id': video['uploadedBy']})
            video_list.append({
                'id': str(video['_id']),
                'title': video['title'],
                'description': video.get('description', ''),
                'filename': video['originalFilename'],
                'fileSize': video['fileSize'],
                'uploadedBy': {
                    'id': str(video['uploadedBy']),
                    'name': uploader.get('name', 'Unknown') if uploader else 'Unknown'
                },
                'uploadedAt': video['uploadedAt'].isoformat(),
                'views': video.get('views', 0),
                'videoUrl': f'/api/videos/stream/{str(video["_id"])}'
            })
        
        return jsonify({
            'videos': video_list,
            'total': total,
            'page': page,
            'limit': limit,
            'totalPages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@videos_bp.route('/<video_id>', methods=['GET'])
@jwt_required()
def get_video(video_id):
    """Get video details"""
    try:
        db = current_app.db
        
        video = db.videos.find_one({'_id': ObjectId(video_id)})
        if not video:
            return jsonify({'error': 'Video not found'}), 404
        
        uploader = db.users.find_one({'_id': video['uploadedBy']})
        
        return jsonify({
            'id': str(video['_id']),
            'title': video['title'],
            'description': video.get('description', ''),
            'filename': video['originalFilename'],
            'fileSize': video['fileSize'],
            'uploadedBy': {
                'id': str(video['uploadedBy']),
                'name': uploader.get('name', 'Unknown') if uploader else 'Unknown'
            },
            'uploadedAt': video['uploadedAt'].isoformat(),
            'views': video.get('views', 0),
            'videoUrl': f'/api/videos/stream/{video_id}'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@videos_bp.route('/<video_id>', methods=['DELETE'])
@require_teacher
def delete_video(video_id):
    """Delete a video (teachers only)"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        video = db.videos.find_one({'_id': ObjectId(video_id)})
        if not video:
            return jsonify({'error': 'Video not found'}), 404
        
        # Check if user is the uploader
        if str(video['uploadedBy']) != user_id:
            return jsonify({'error': 'You can only delete your own videos'}), 403
        
        # Delete file from filesystem
        if os.path.exists(video['filePath']):
            os.remove(video['filePath'])
        
        # Delete from database
        db.videos.delete_one({'_id': ObjectId(video_id)})
        
        # Remove from courses
        db.courses.update_many(
            {},
            {'$pull': {'videos': {'videoId': ObjectId(video_id)}}}
        )
        
        return jsonify({'message': 'Video deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@videos_bp.route('/<video_id>', methods=['PUT'])
@require_teacher
def update_video(video_id):
    """Update video metadata (teachers only)"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        data = request.get_json()
        
        video = db.videos.find_one({'_id': ObjectId(video_id)})
        if not video:
            return jsonify({'error': 'Video not found'}), 404
        
        # Check if user is the uploader
        if str(video['uploadedBy']) != user_id:
            return jsonify({'error': 'You can only update your own videos'}), 403
        
        # Update fields
        update_data = {}
        if 'title' in data:
            update_data['title'] = data['title']
        if 'description' in data:
            update_data['description'] = data['description']
        
        if update_data:
            db.videos.update_one(
                {'_id': ObjectId(video_id)},
                {'$set': update_data}
            )
        
        return jsonify({'message': 'Video updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
