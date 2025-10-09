from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime

quizzes_bp = Blueprint('quizzes', __name__)

@quizzes_bp.route('/', methods=['GET'])
@jwt_required()
def get_quizzes():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get user to check role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Build query based on user role
        if user['role'] == 'student':
            # Get quizzes from enrolled courses
            enrollments = list(db.enrollments.find({'student_id': user_id}))
            course_ids = [enrollment['course_id'] for enrollment in enrollments]
            quizzes = list(db.quizzes.find({'course_id': {'$in': course_ids}}))
            
            # Add attempt status for each quiz
            for quiz in quizzes:
                quiz['_id'] = str(quiz['_id'])
                attempts = list(db.quiz_attempts.find({
                    'quiz_id': str(quiz['_id']),
                    'student_id': user_id
                }))
                quiz['attempts'] = len(attempts)
                quiz['max_attempts'] = quiz.get('max_attempts', 1)
                quiz['can_attempt'] = len(attempts) < quiz['max_attempts']
                
                if attempts:
                    # Get best score
                    best_attempt = max(attempts, key=lambda x: x.get('score', 0))
                    quiz['best_score'] = best_attempt.get('score', 0)
                    quiz['last_attempt'] = attempts[-1]['attempted_at']
                
                # Get course info
                course = db.courses.find_one({'_id': ObjectId(quiz['course_id'])})
                if course:
                    quiz['course_title'] = course['title']
        
        elif user['role'] == 'teacher':
            # Get quizzes from courses created by teacher
            courses = list(db.courses.find({'teacher_id': user_id}))
            course_ids = [str(course['_id']) for course in courses]
            quizzes = list(db.quizzes.find({'course_id': {'$in': course_ids}}))
            
            # Add attempt statistics for each quiz
            for quiz in quizzes:
                quiz['_id'] = str(quiz['_id'])
                attempts = list(db.quiz_attempts.find({'quiz_id': str(quiz['_id'])}))
                quiz['total_attempts'] = len(attempts)
                
                if attempts:
                    scores = [attempt.get('score', 0) for attempt in attempts]
                    quiz['average_score'] = sum(scores) / len(scores)
                    quiz['highest_score'] = max(scores)
                    quiz['lowest_score'] = min(scores)
                
                # Get course info
                course = db.courses.find_one({'_id': ObjectId(quiz['course_id'])})
                if course:
                    quiz['course_title'] = course['title']
        
        else:  # admin
            quizzes = list(db.quizzes.find())
            for quiz in quizzes:
                quiz['_id'] = str(quiz['_id'])
                # Get course info
                course = db.courses.find_one({'_id': ObjectId(quiz['course_id'])})
                if course:
                    quiz['course_title'] = course['title']
        
        return jsonify({'quizzes': quizzes}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quizzes_bp.route('/<quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz(quiz_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get quiz
        quiz = db.quizzes.find_one({'_id': ObjectId(quiz_id)})
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        # Check permissions
        user = db.users.find_one({'_id': ObjectId(user_id)})
        course = db.courses.find_one({'_id': ObjectId(quiz['course_id'])})
        
        if user['role'] == 'student':
            # Check if student is enrolled in the course
            enrollment = db.enrollments.find_one({
                'course_id': quiz['course_id'],
                'student_id': user_id
            })
            if not enrollment:
                return jsonify({'error': 'Access denied'}), 403
        elif user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        quiz['_id'] = str(quiz['_id'])
        
        # Get course info
        if course:
            quiz['course_title'] = course['title']
        
        # For students, hide correct answers and add attempt info
        if user['role'] == 'student':
            # Remove correct answers from questions
            for question in quiz.get('questions', []):
                question.pop('correct_answer', None)
                question.pop('explanation', None)
            
            # Get student's attempts
            attempts = list(db.quiz_attempts.find({
                'quiz_id': quiz_id,
                'student_id': user_id
            }))
            quiz['attempts'] = len(attempts)
            quiz['max_attempts'] = quiz.get('max_attempts', 1)
            quiz['can_attempt'] = len(attempts) < quiz['max_attempts']
            
            if attempts:
                quiz['best_score'] = max(attempt.get('score', 0) for attempt in attempts)
                quiz['last_attempt'] = attempts[-1]['attempted_at']
        
        # For teachers, add attempt statistics
        elif user['role'] == 'teacher':
            attempts = list(db.quiz_attempts.find({'quiz_id': quiz_id}))
            quiz['total_attempts'] = len(attempts)
            
            if attempts:
                scores = [attempt.get('score', 0) for attempt in attempts]
                quiz['average_score'] = sum(scores) / len(scores)
                quiz['statistics'] = {
                    'total_students': len(set(attempt['student_id'] for attempt in attempts)),
                    'average_score': sum(scores) / len(scores),
                    'highest_score': max(scores),
                    'lowest_score': min(scores)
                }
        
        return jsonify({'quiz': quiz}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quizzes_bp.route('/', methods=['POST'])
@jwt_required()
def create_quiz():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is teacher or admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Only teachers and admins can create quizzes'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'course_id', 'questions']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if course exists and user has permission
        course = db.courses.find_one({'_id': ObjectId(data['course_id'])})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        if user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Validate questions
        questions = data['questions']
        if not isinstance(questions, list) or len(questions) == 0:
            return jsonify({'error': 'At least one question is required'}), 400
        
        for i, question in enumerate(questions):
            required_q_fields = ['question', 'type', 'options', 'correct_answer']
            for field in required_q_fields:
                if field not in question:
                    return jsonify({'error': f'Question {i+1}: {field} is required'}), 400
            
            if question['type'] not in ['mcq', 'true_false', 'short_answer']:
                return jsonify({'error': f'Question {i+1}: Invalid question type'}), 400
        
        # Parse dates if provided
        start_time = None
        end_time = None
        if data.get('start_time'):
            try:
                start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'error': 'Invalid start time format'}), 400
        
        if data.get('end_time'):
            try:
                end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'error': 'Invalid end time format'}), 400
        
        # Create quiz
        quiz_data = {
            'title': data['title'],
            'description': data.get('description', ''),
            'course_id': data['course_id'],
            'questions': questions,
            'time_limit': data.get('time_limit', 0),  # minutes, 0 = no limit
            'max_attempts': data.get('max_attempts', 1),
            'start_time': start_time,
            'end_time': end_time,
            'shuffle_questions': data.get('shuffle_questions', False),
            'show_results': data.get('show_results', True),
            'is_active': True,
            'created_by': user_id,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.quizzes.insert_one(quiz_data)
        quiz_data['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Quiz created successfully',
            'quiz': quiz_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quizzes_bp.route('/<quiz_id>/attempt', methods=['POST'])
@jwt_required()
def attempt_quiz(quiz_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is student
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'student':
            return jsonify({'error': 'Only students can attempt quizzes'}), 403
        
        # Get quiz
        quiz = db.quizzes.find_one({'_id': ObjectId(quiz_id)})
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        # Check if student is enrolled in the course
        enrollment = db.enrollments.find_one({
            'course_id': quiz['course_id'],
            'student_id': user_id
        })
        if not enrollment:
            return jsonify({'error': 'Not enrolled in this course'}), 403
        
        # Check if quiz is active and within time bounds
        if not quiz.get('is_active', True):
            return jsonify({'error': 'Quiz is not active'}), 400
        
        current_time = datetime.utcnow()
        if quiz.get('start_time') and current_time < quiz['start_time']:
            return jsonify({'error': 'Quiz has not started yet'}), 400
        
        if quiz.get('end_time') and current_time > quiz['end_time']:
            return jsonify({'error': 'Quiz has ended'}), 400
        
        # Check attempt limit
        existing_attempts = list(db.quiz_attempts.find({
            'quiz_id': quiz_id,
            'student_id': user_id
        }))
        
        max_attempts = quiz.get('max_attempts', 1)
        if len(existing_attempts) >= max_attempts:
            return jsonify({'error': 'Maximum attempts reached'}), 400
        
        data = request.get_json()
        answers = data.get('answers', {})
        
        # Calculate score
        total_questions = len(quiz['questions'])
        correct_answers = 0
        detailed_results = []
        
        for i, question in enumerate(quiz['questions']):
            question_id = str(i)
            student_answer = answers.get(question_id, '')
            correct_answer = question['correct_answer']
            
            is_correct = False
            if question['type'] in ['mcq', 'true_false']:
                is_correct = student_answer.lower() == correct_answer.lower()
            elif question['type'] == 'short_answer':
                # Simple string matching for short answers
                is_correct = student_answer.lower().strip() == correct_answer.lower().strip()
            
            if is_correct:
                correct_answers += 1
            
            detailed_results.append({
                'question_id': question_id,
                'question': question['question'],
                'student_answer': student_answer,
                'correct_answer': correct_answer,
                'is_correct': is_correct,
                'explanation': question.get('explanation', '')
            })
        
        score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
        
        # Create attempt record
        attempt_data = {
            'quiz_id': quiz_id,
            'student_id': user_id,
            'course_id': quiz['course_id'],
            'answers': answers,
            'score': score,
            'correct_answers': correct_answers,
            'total_questions': total_questions,
            'attempted_at': datetime.utcnow(),
            'time_taken': data.get('time_taken', 0),  # seconds
            'detailed_results': detailed_results if quiz.get('show_results', True) else []
        }
        
        result = db.quiz_attempts.insert_one(attempt_data)
        attempt_data['_id'] = str(result.inserted_id)
        
        # Update student's total points
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$inc': {'total_points': score}}
        )
        
        # Update enrollment progress if this is the first attempt
        if len(existing_attempts) == 0:
            db.enrollments.update_one(
                {'course_id': quiz['course_id'], 'student_id': user_id},
                {'$push': {'completed_quizzes': quiz_id}}
            )
        
        response_data = {
            'message': 'Quiz submitted successfully',
            'score': score,
            'correct_answers': correct_answers,
            'total_questions': total_questions,
            'attempt_id': str(result.inserted_id)
        }
        
        # Include detailed results if allowed
        if quiz.get('show_results', True):
            response_data['detailed_results'] = detailed_results
        
        return jsonify(response_data), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quizzes_bp.route('/<quiz_id>/attempts', methods=['GET'])
@jwt_required()
def get_quiz_attempts(quiz_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get quiz and check permissions
        quiz = db.quizzes.find_one({'_id': ObjectId(quiz_id)})
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        course = db.courses.find_one({'_id': ObjectId(quiz['course_id'])})
        
        if user['role'] == 'student':
            # Students can only see their own attempts
            attempts = list(db.quiz_attempts.find({
                'quiz_id': quiz_id,
                'student_id': user_id
            }))
        elif user['role'] == 'teacher' and course['teacher_id'] == user_id:
            # Teachers can see all attempts for their quiz
            attempts = list(db.quiz_attempts.find({'quiz_id': quiz_id}))
            
            # Add student info for each attempt
            for attempt in attempts:
                student = db.users.find_one({'_id': ObjectId(attempt['student_id'])})
                if student:
                    attempt['student_name'] = student['name']
                    attempt['student_email'] = student['email']
                    attempt['roll_no'] = student.get('roll_no', '')
        elif user['role'] == 'admin':
            # Admins can see all attempts
            attempts = list(db.quiz_attempts.find({'quiz_id': quiz_id}))
            
            # Add student info for each attempt
            for attempt in attempts:
                student = db.users.find_one({'_id': ObjectId(attempt['student_id'])})
                if student:
                    attempt['student_name'] = student['name']
                    attempt['student_email'] = student['email']
        else:
            return jsonify({'error': 'Access denied'}), 403
        
        # Convert ObjectId to string
        for attempt in attempts:
            attempt['_id'] = str(attempt['_id'])
        
        return jsonify({'attempts': attempts}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500