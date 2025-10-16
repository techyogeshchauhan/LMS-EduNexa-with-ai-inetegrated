from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from routes.notifications import create_notification

courses_bp = Blueprint('courses', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'avi', 'mov', 'mkv', 'webm', 'jpg', 'jpeg', 'png'}
VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'webm'}

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
VIDEO_FOLDER = os.path.join(UPLOAD_FOLDER, 'videos')
os.makedirs(VIDEO_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def is_video_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in VIDEO_EXTENSIONS

@courses_bp.route('/', methods=['GET'])
@jwt_required()
def get_courses():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get user to check role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Build query based on user role
        query = {}
        if user['role'] == 'teacher':
            query['teacher_id'] = user_id
        elif user['role'] == 'student':
            # Get all active courses or enrolled courses
            query = {'is_active': True}
        
        # Get courses
        courses = list(db.courses.find(query))
        
        # Convert ObjectId to string and add teacher info
        for course in courses:
            course['_id'] = str(course['_id'])
            course['course_id'] = str(course['_id'])
            
            # Get teacher info
            teacher = db.users.find_one({'_id': ObjectId(course['teacher_id'])})
            if teacher:
                course['teacher_name'] = teacher['name']
                course['teacher_email'] = teacher['email']
            
            # Get enrollment count
            enrollment_count = db.enrollments.count_documents({'course_id': str(course['_id'])})
            course['enrolled_students'] = enrollment_count
            
            # Check if current user is enrolled (for students)
            if user['role'] == 'student':
                enrollment = db.enrollments.find_one({
                    'course_id': str(course['_id']),
                    'student_id': user_id
                })
                course['is_enrolled'] = enrollment is not None
                if enrollment:
                    course['enrollment_date'] = enrollment['enrolled_at']
                    course['progress'] = enrollment.get('progress', 0)
        
        return jsonify({'courses': courses}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>', methods=['GET'])
@jwt_required()
def get_course(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get course
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        # Get user to check permissions
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        # Check if user has access to this course
        if user['role'] == 'student':
            enrollment = db.enrollments.find_one({
                'course_id': course_id,
                'student_id': user_id
            })
            if not enrollment and not course.get('is_public', False):
                return jsonify({'error': 'Access denied'}), 403
        elif user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Convert ObjectId to string
        course['_id'] = str(course['_id'])
        course['course_id'] = str(course['_id'])
        
        # Get teacher info
        teacher = db.users.find_one({'_id': ObjectId(course['teacher_id'])})
        if teacher:
            course['teacher_name'] = teacher['name']
            course['teacher_email'] = teacher['email']
        
        # Get materials
        materials = list(db.materials.find({'course_id': course_id}))
        for material in materials:
            material['_id'] = str(material['_id'])
        course['materials'] = materials
        
        # Get assignments
        assignments = list(db.assignments.find({'course_id': course_id}))
        for assignment in assignments:
            assignment['_id'] = str(assignment['_id'])
        course['assignments'] = assignments
        
        # Get quizzes
        quizzes = list(db.quizzes.find({'course_id': course_id}))
        for quiz in quizzes:
            quiz['_id'] = str(quiz['_id'])
        course['quizzes'] = quizzes
        
        return jsonify({'course': course}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/', methods=['POST'])
@jwt_required()
def create_course():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is teacher or admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Only teachers and admins can create courses'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'category']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create course
        course_data = {
            'title': data['title'],
            'description': data['description'],
            'category': data['category'],
            'teacher_id': user_id,
            'difficulty': data.get('difficulty', 'Beginner'),
            'duration': data.get('duration', ''),
            'prerequisites': data.get('prerequisites', []),
            'learning_objectives': data.get('learning_objectives', []),
            'thumbnail': data.get('thumbnail', ''),
            'is_active': True,
            'is_public': data.get('is_public', True),
            'max_students': data.get('max_students', 0),  # 0 means unlimited
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.courses.insert_one(course_data)
        course_id = str(result.inserted_id)
        
        # Process modules and create materials
        modules = data.get('modules', [])
        for module in modules:
            for lesson in module.get('lessons', []):
                if lesson.get('content') and lesson.get('title'):
                    material_data = {
                        'course_id': course_id,
                        'title': lesson['title'],
                        'description': lesson.get('description', ''),
                        'type': lesson.get('type', 'video'),
                        'content': lesson['content'],  # This is the video ID
                        'order': lesson.get('order', 0),
                        'is_required': lesson.get('is_required', False),
                        'uploaded_by': user_id,
                        'created_at': datetime.utcnow()
                    }
                    db.materials.insert_one(material_data)
        
        # Update teacher's courses_created list
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$push': {'courses_created': course_id}}
        )
        
        course_data['_id'] = course_id
        course_data['course_id'] = course_id
        
        return jsonify({
            'message': 'Course created successfully',
            'course': course_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>', methods=['PUT'])
@jwt_required()
def update_course(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get course and check permissions
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'admin' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Fields that can be updated
        updatable_fields = [
            'title', 'description', 'category', 'difficulty', 'duration',
            'prerequisites', 'learning_objectives', 'thumbnail', 'is_active',
            'is_public', 'max_students'
        ]
        
        update_data = {}
        for field in updatable_fields:
            if field in data:
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        update_data['updated_at'] = datetime.utcnow()
        
        # Update course
        db.courses.update_one(
            {'_id': ObjectId(course_id)},
            {'$set': update_data}
        )
        
        # Get updated course
        updated_course = db.courses.find_one({'_id': ObjectId(course_id)})
        updated_course['_id'] = str(updated_course['_id'])
        
        return jsonify({
            'message': 'Course updated successfully',
            'course': updated_course
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>/enroll', methods=['POST'])
@jwt_required()
def enroll_course(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is student
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'student':
            return jsonify({'error': 'Only students can enroll in courses'}), 403
        
        # Check if course exists
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        if not course.get('is_active', True):
            return jsonify({'error': 'Course is not active'}), 400
        
        # Check if already enrolled
        existing_enrollment = db.enrollments.find_one({
            'course_id': course_id,
            'student_id': user_id
        })
        if existing_enrollment:
            return jsonify({'error': 'Already enrolled in this course'}), 409
        
        # Check max students limit
        if course.get('max_students', 0) > 0:
            current_enrollments = db.enrollments.count_documents({'course_id': course_id})
            if current_enrollments >= course['max_students']:
                return jsonify({'error': 'Course is full'}), 400
        
        # Create enrollment
        enrollment_data = {
            'course_id': course_id,
            'student_id': user_id,
            'enrolled_at': datetime.utcnow(),
            'progress': 0,
            'completed_materials': [],
            'completed_assignments': [],
            'completed_quizzes': [],
            'is_active': True
        }
        
        db.enrollments.insert_one(enrollment_data)
        
        # Update user's enrolled courses
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$push': {'enrolled_courses': course_id}}
        )
        
        # Create notification for student
        try:
            create_notification(
                db=db,
                user_id=user_id,
                title='Course Enrollment Successful',
                message=f'You have successfully enrolled in "{course["title"]}". Start learning now!',
                notification_type='success',
                link=f'/courses/detail?id={course_id}'
            )
        except Exception as notif_error:
            print(f"Failed to create notification: {notif_error}")
        
        return jsonify({'message': 'Successfully enrolled in course'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>/unenroll', methods=['POST'])
@jwt_required()
def unenroll_course(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if enrolled
        enrollment = db.enrollments.find_one({
            'course_id': course_id,
            'student_id': user_id
        })
        if not enrollment:
            return jsonify({'error': 'Not enrolled in this course'}), 404
        
        # Remove enrollment
        db.enrollments.delete_one({
            'course_id': course_id,
            'student_id': user_id
        })
        
        # Update user's enrolled courses
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$pull': {'enrolled_courses': course_id}}
        )
        
        return jsonify({'message': 'Successfully unenrolled from course'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>/upload-video', methods=['POST'])
@jwt_required()
def upload_video(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check permissions
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'admin' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Check if video file is present
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        video_file = request.files['video']
        if video_file.filename == '':
            return jsonify({'error': 'No video file selected'}), 400
        
        if not is_video_file(video_file.filename):
            return jsonify({'error': 'Invalid video file format'}), 400
        
        # Get form data
        title = request.form.get('title')
        description = request.form.get('description', '')
        order = request.form.get('order', 0)
        duration = request.form.get('duration', '')
        
        if not title:
            return jsonify({'error': 'Video title is required'}), 400
        
        # Save video file
        filename = secure_filename(video_file.filename)
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{course_id}_{timestamp}_{filename}"
        video_path = os.path.join(VIDEO_FOLDER, unique_filename)
        video_file.save(video_path)
        
        # Create video material record
        video_data = {
            'course_id': course_id,
            'title': title,
            'description': description,
            'type': 'video',
            'filename': unique_filename,
            'file_path': video_path,
            'url': f'/api/courses/videos/{unique_filename}',
            'duration': duration,
            'order': int(order),
            'is_required': True,
            'uploaded_by': user_id,
            'created_at': datetime.utcnow(),
            'views': 0,
            'completed_by': []
        }
        
        result = db.materials.insert_one(video_data)
        video_data['_id'] = str(result.inserted_id)
        video_data['material_id'] = str(result.inserted_id)
        
        # Notify enrolled students
        enrollments = db.enrollments.find({'course_id': course_id})
        for enrollment in enrollments:
            try:
                create_notification(
                    db=db,
                    user_id=enrollment['student_id'],
                    title='New Video Added',
                    message=f'A new video "{title}" has been added to {course["title"]}',
                    notification_type='info',
                    link=f'/courses/detail?id={course_id}'
                )
            except:
                pass
        
        return jsonify({
            'message': 'Video uploaded successfully',
            'video': video_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/videos/<filename>', methods=['GET'])
@jwt_required()
def serve_video(filename):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Find the video material
        video = db.materials.find_one({'filename': filename, 'type': 'video'})
        if not video:
            return jsonify({'error': 'Video not found'}), 404
        
        # Check if user has access to this video's course
        course = db.courses.find_one({'_id': ObjectId(video['course_id'])})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        # Check access permissions
        has_access = False
        if user['role'] == 'teacher' and course['teacher_id'] == user_id:
            has_access = True
        elif user['role'] == 'student':
            enrollment = db.enrollments.find_one({
                'course_id': video['course_id'],
                'student_id': user_id
            })
            has_access = enrollment is not None
        elif user['role'] == 'admin':
            has_access = True
        
        if not has_access:
            return jsonify({'error': 'Access denied'}), 403
        
        # Increment view count
        db.materials.update_one(
            {'_id': video['_id']},
            {'$inc': {'views': 1}}
        )
        
        return send_from_directory(VIDEO_FOLDER, filename)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>/materials', methods=['POST'])
@jwt_required()
def upload_material(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check permissions
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'admin' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'type', 'content']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create material
        material_data = {
            'course_id': course_id,
            'title': data['title'],
            'description': data.get('description', ''),
            'type': data['type'],  # 'pdf', 'video', 'document', 'link'
            'content': data['content'],  # file path or URL
            'order': data.get('order', 0),
            'is_required': data.get('is_required', False),
            'uploaded_by': user_id,
            'created_at': datetime.utcnow()
        }
        
        result = db.materials.insert_one(material_data)
        material_data['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Material uploaded successfully',
            'material': material_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>/progress', methods=['POST'])
@jwt_required()
def update_progress(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if student is enrolled
        enrollment = db.enrollments.find_one({
            'course_id': course_id,
            'student_id': user_id
        })
        if not enrollment:
            return jsonify({'error': 'Not enrolled in this course'}), 403
        
        data = request.get_json()
        material_id = data.get('material_id')
        completed = data.get('completed', False)
        watch_time = data.get('watch_time', 0)
        
        if not material_id:
            return jsonify({'error': 'Material ID is required'}), 400
        
        # Update completed materials
        if completed:
            db.enrollments.update_one(
                {'_id': enrollment['_id']},
                {
                    '$addToSet': {'completed_materials': material_id},
                    '$set': {'last_accessed': datetime.utcnow()}
                }
            )
            
            # Mark material as completed by this user
            db.materials.update_one(
                {'_id': ObjectId(material_id)},
                {'$addToSet': {'completed_by': user_id}}
            )
        
        # Calculate overall progress
        total_materials = db.materials.count_documents({'course_id': course_id, 'is_required': True})
        completed_materials = len(enrollment.get('completed_materials', []))
        
        if total_materials > 0:
            progress = (completed_materials / total_materials) * 100
            db.enrollments.update_one(
                {'_id': enrollment['_id']},
                {'$set': {'progress': round(progress, 2)}}
            )
        
        # Track video watch time
        if watch_time > 0:
            db.video_progress.update_one(
                {
                    'student_id': user_id,
                    'material_id': material_id,
                    'course_id': course_id
                },
                {
                    '$set': {
                        'watch_time': watch_time,
                        'last_watched': datetime.utcnow()
                    }
                },
                upsert=True
            )
        
        return jsonify({'message': 'Progress updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>/students', methods=['GET'])
@jwt_required()
def get_course_students(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check permissions
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['admin', 'teacher'] or (user['role'] == 'teacher' and course['teacher_id'] != user_id):
            return jsonify({'error': 'Access denied'}), 403
        
        # Get enrollments
        enrollments = list(db.enrollments.find({'course_id': course_id}))
        
        students = []
        for enrollment in enrollments:
            student = db.users.find_one({'_id': ObjectId(enrollment['student_id'])})
            if student:
                student_data = {
                    'id': str(student['_id']),
                    'name': student['name'],
                    'email': student['email'],
                    'roll_no': student.get('roll_no', ''),
                    'department': student.get('department', ''),
                    'enrolled_at': enrollment['enrolled_at'],
                    'progress': enrollment.get('progress', 0),
                    'is_active': enrollment.get('is_active', True)
                }
                students.append(student_data)
        
        return jsonify({'students': students}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500