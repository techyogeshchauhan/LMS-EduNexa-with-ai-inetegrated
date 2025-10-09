from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from routes.notifications import create_notification

assignments_bp = Blueprint('assignments', __name__)

@assignments_bp.route('/', methods=['GET'])
@jwt_required()
def get_assignments():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get user to check role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Build query based on user role
        if user['role'] == 'student':
            # Get assignments from enrolled courses
            enrollments = list(db.enrollments.find({'student_id': user_id}))
            course_ids = [enrollment['course_id'] for enrollment in enrollments]
            assignments = list(db.assignments.find({'course_id': {'$in': course_ids}}))
            
            # Add submission status for each assignment
            for assignment in assignments:
                assignment['_id'] = str(assignment['_id'])
                submission = db.submissions.find_one({
                    'assignment_id': str(assignment['_id']),
                    'student_id': user_id
                })
                assignment['submission_status'] = 'submitted' if submission else 'pending'
                if submission:
                    assignment['submission'] = {
                        'submitted_at': submission['submitted_at'],
                        'grade': submission.get('grade'),
                        'feedback': submission.get('feedback', '')
                    }
                
                # Get course info
                course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
                if course:
                    assignment['course_title'] = course['title']
        
        elif user['role'] == 'teacher':
            # Get assignments from courses created by teacher
            courses = list(db.courses.find({'teacher_id': user_id}))
            course_ids = [str(course['_id']) for course in courses]
            assignments = list(db.assignments.find({'course_id': {'$in': course_ids}}))
            
            # Add submission count for each assignment
            for assignment in assignments:
                assignment['_id'] = str(assignment['_id'])
                submission_count = db.submissions.count_documents({
                    'assignment_id': str(assignment['_id'])
                })
                assignment['submission_count'] = submission_count
                
                # Get course info
                course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
                if course:
                    assignment['course_title'] = course['title']
        
        else:  # admin
            assignments = list(db.assignments.find())
            for assignment in assignments:
                assignment['_id'] = str(assignment['_id'])
                # Get course info
                course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
                if course:
                    assignment['course_title'] = course['title']
        
        return jsonify({'assignments': assignments}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@assignments_bp.route('/<assignment_id>', methods=['GET'])
@jwt_required()
def get_assignment(assignment_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get assignment
        assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
        if not assignment:
            return jsonify({'error': 'Assignment not found'}), 404
        
        # Check permissions
        user = db.users.find_one({'_id': ObjectId(user_id)})
        course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
        
        if user['role'] == 'student':
            # Check if student is enrolled in the course
            enrollment = db.enrollments.find_one({
                'course_id': assignment['course_id'],
                'student_id': user_id
            })
            if not enrollment:
                return jsonify({'error': 'Access denied'}), 403
        elif user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        assignment['_id'] = str(assignment['_id'])
        
        # Get course info
        if course:
            assignment['course_title'] = course['title']
        
        # If student, get their submission
        if user['role'] == 'student':
            submission = db.submissions.find_one({
                'assignment_id': assignment_id,
                'student_id': user_id
            })
            if submission:
                submission['_id'] = str(submission['_id'])
                assignment['submission'] = submission
        
        # If teacher, get all submissions
        elif user['role'] == 'teacher':
            submissions = list(db.submissions.find({'assignment_id': assignment_id}))
            for submission in submissions:
                submission['_id'] = str(submission['_id'])
                # Get student info
                student = db.users.find_one({'_id': ObjectId(submission['student_id'])})
                if student:
                    submission['student_name'] = student['name']
                    submission['student_email'] = student['email']
                    submission['roll_no'] = student.get('roll_no', '')
            assignment['submissions'] = submissions
        
        return jsonify({'assignment': assignment}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@assignments_bp.route('/', methods=['POST'])
@jwt_required()
def create_assignment():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is teacher or admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Only teachers and admins can create assignments'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'course_id', 'due_date']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if course exists and user has permission
        course = db.courses.find_one({'_id': ObjectId(data['course_id'])})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        if user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Parse due date
        try:
            due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid due date format'}), 400
        
        # Create assignment
        assignment_data = {
            'title': data['title'],
            'description': data['description'],
            'course_id': data['course_id'],
            'instructions': data.get('instructions', ''),
            'due_date': due_date,
            'max_points': data.get('max_points', 100),
            'submission_type': data.get('submission_type', 'file'),  # 'file', 'text', 'both'
            'allowed_file_types': data.get('allowed_file_types', []),
            'max_file_size': data.get('max_file_size', 10),  # MB
            'is_active': True,
            'created_by': user_id,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.assignments.insert_one(assignment_data)
        assignment_data['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Assignment created successfully',
            'assignment': assignment_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@assignments_bp.route('/<assignment_id>', methods=['PUT'])
@jwt_required()
def update_assignment(assignment_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get assignment and check permissions
        assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
        if not assignment:
            return jsonify({'error': 'Assignment not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
        
        if user['role'] != 'admin' and (user['role'] != 'teacher' or course['teacher_id'] != user_id):
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Fields that can be updated
        updatable_fields = [
            'title', 'description', 'instructions', 'due_date', 'max_points',
            'submission_type', 'allowed_file_types', 'max_file_size', 'is_active'
        ]
        
        update_data = {}
        for field in updatable_fields:
            if field in data:
                if field == 'due_date':
                    try:
                        update_data[field] = datetime.fromisoformat(data[field].replace('Z', '+00:00'))
                    except ValueError:
                        return jsonify({'error': 'Invalid due date format'}), 400
                else:
                    update_data[field] = data[field]
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        update_data['updated_at'] = datetime.utcnow()
        
        # Update assignment
        db.assignments.update_one(
            {'_id': ObjectId(assignment_id)},
            {'$set': update_data}
        )
        
        # Get updated assignment
        updated_assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
        updated_assignment['_id'] = str(updated_assignment['_id'])
        
        return jsonify({
            'message': 'Assignment updated successfully',
            'assignment': updated_assignment
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@assignments_bp.route('/<assignment_id>/submit', methods=['POST'])
@jwt_required()
def submit_assignment(assignment_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is student
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'student':
            return jsonify({'error': 'Only students can submit assignments'}), 403
        
        # Get assignment
        assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
        if not assignment:
            return jsonify({'error': 'Assignment not found'}), 404
        
        # Check if student is enrolled in the course
        enrollment = db.enrollments.find_one({
            'course_id': assignment['course_id'],
            'student_id': user_id
        })
        if not enrollment:
            return jsonify({'error': 'Not enrolled in this course'}), 403
        
        # Check if assignment is still active and not past due
        if not assignment.get('is_active', True):
            return jsonify({'error': 'Assignment is no longer active'}), 400
        
        if datetime.utcnow() > assignment['due_date']:
            return jsonify({'error': 'Assignment deadline has passed'}), 400
        
        # Check if already submitted
        existing_submission = db.submissions.find_one({
            'assignment_id': assignment_id,
            'student_id': user_id
        })
        if existing_submission:
            return jsonify({'error': 'Assignment already submitted'}), 409
        
        data = request.get_json()
        
        # Validate submission based on type
        submission_type = assignment.get('submission_type', 'file')
        if submission_type in ['text', 'both'] and not data.get('text_content'):
            return jsonify({'error': 'Text content is required'}), 400
        
        if submission_type in ['file', 'both'] and not data.get('file_path'):
            return jsonify({'error': 'File is required'}), 400
        
        # Create submission
        submission_data = {
            'assignment_id': assignment_id,
            'student_id': user_id,
            'course_id': assignment['course_id'],
            'text_content': data.get('text_content', ''),
            'file_path': data.get('file_path', ''),
            'file_name': data.get('file_name', ''),
            'submitted_at': datetime.utcnow(),
            'status': 'submitted',
            'grade': None,
            'feedback': '',
            'graded_at': None,
            'graded_by': None
        }
        
        result = db.submissions.insert_one(submission_data)
        submission_data['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Assignment submitted successfully',
            'submission': submission_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@assignments_bp.route('/submissions/<submission_id>/grade', methods=['POST'])
@jwt_required()
def grade_submission(submission_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is teacher or admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Only teachers and admins can grade submissions'}), 403
        
        # Get submission
        submission = db.submissions.find_one({'_id': ObjectId(submission_id)})
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        # Check permissions
        assignment = db.assignments.find_one({'_id': ObjectId(submission['assignment_id'])})
        course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
        
        if user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Validate grade
        if 'grade' not in data:
            return jsonify({'error': 'Grade is required'}), 400
        
        try:
            grade = float(data['grade'])
            max_points = assignment.get('max_points', 100)
            if grade < 0 or grade > max_points:
                return jsonify({'error': f'Grade must be between 0 and {max_points}'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid grade format'}), 400
        
        # Update submission
        update_data = {
            'grade': grade,
            'feedback': data.get('feedback', ''),
            'status': 'graded',
            'graded_at': datetime.utcnow(),
            'graded_by': user_id
        }
        
        db.submissions.update_one(
            {'_id': ObjectId(submission_id)},
            {'$set': update_data}
        )
        
        # Update student's total points
        db.users.update_one(
            {'_id': ObjectId(submission['student_id'])},
            {'$inc': {'total_points': grade}}
        )
        
        # Create notification for student
        try:
            percentage = (grade / max_points) * 100
            notification_type = 'success' if percentage >= 70 else 'warning' if percentage >= 50 else 'error'
            
            create_notification(
                db=db,
                user_id=submission['student_id'],
                title='Assignment Graded',
                message=f'Your assignment "{assignment["title"]}" has been graded. Score: {grade}/{max_points} ({percentage:.1f}%)',
                notification_type=notification_type,
                link=f'/assignments/detail?id={assignment["_id"]}'
            )
        except Exception as notif_error:
            # Don't fail the grading if notification fails
            print(f"Failed to create notification: {notif_error}")
        
        return jsonify({'message': 'Submission graded successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500