from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime

progress_bp = Blueprint('progress', __name__)

@progress_bp.route('/course/<course_id>', methods=['GET'])
@jwt_required()
def get_course_progress(course_id):
    """Get student's progress for a specific course"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is student
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'student':
            return jsonify({'error': 'Only students can view progress'}), 403
        
        # Get enrollment
        enrollment = db.enrollments.find_one({
            'course_id': course_id,
            'student_id': user_id
        })
        
        if not enrollment:
            return jsonify({'error': 'Not enrolled in this course'}), 404
        
        # Get course materials
        materials = list(db.materials.find({'course_id': course_id}))
        total_materials = len(materials)
        
        # Get completed materials
        completed_materials = enrollment.get('completed_materials', [])
        completed_count = len(completed_materials)
        
        # Calculate progress percentage
        progress_percentage = (completed_count / total_materials * 100) if total_materials > 0 else 0
        
        # Get assignments progress
        assignments = list(db.assignments.find({'course_id': course_id}))
        total_assignments = len(assignments)
        
        submitted_assignments = db.submissions.count_documents({
            'course_id': course_id,
            'student_id': user_id
        })
        
        # Get quiz progress
        quizzes = list(db.quizzes.find({'course_id': course_id}))
        total_quizzes = len(quizzes)
        
        completed_quizzes = db.quiz_attempts.count_documents({
            'student_id': user_id,
            'quiz_id': {'$in': [str(quiz['_id']) for quiz in quizzes]},
            'completed': True
        })
        
        progress_data = {
            'course_id': course_id,
            'student_id': user_id,
            'overall_progress': progress_percentage,
            'materials': {
                'total': total_materials,
                'completed': completed_count,
                'completed_ids': completed_materials
            },
            'assignments': {
                'total': total_assignments,
                'submitted': submitted_assignments
            },
            'quizzes': {
                'total': total_quizzes,
                'completed': completed_quizzes
            },
            'last_accessed': enrollment.get('last_accessed', enrollment.get('enrolled_at'))
        }
        
        return jsonify({'progress': progress_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@progress_bp.route('/material/<material_id>/complete', methods=['POST'])
@jwt_required()
def mark_material_complete(material_id):
    """Mark a material as completed"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is student
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'student':
            return jsonify({'error': 'Only students can mark materials as complete'}), 403
        
        # Get material
        material = db.materials.find_one({'_id': ObjectId(material_id)})
        if not material:
            return jsonify({'error': 'Material not found'}), 404
        
        course_id = material['course_id']
        
        # Check enrollment
        enrollment = db.enrollments.find_one({
            'course_id': course_id,
            'student_id': user_id
        })
        
        if not enrollment:
            return jsonify({'error': 'Not enrolled in this course'}), 404
        
        # Add material to completed list if not already there
        completed_materials = enrollment.get('completed_materials', [])
        if material_id not in completed_materials:
            completed_materials.append(material_id)
            
            # Update enrollment
            db.enrollments.update_one(
                {'_id': enrollment['_id']},
                {
                    '$set': {
                        'completed_materials': completed_materials,
                        'last_accessed': datetime.utcnow()
                    }
                }
            )
            
            # Update overall progress
            total_materials = db.materials.count_documents({'course_id': course_id})
            progress = (len(completed_materials) / total_materials * 100) if total_materials > 0 else 0
            
            db.enrollments.update_one(
                {'_id': enrollment['_id']},
                {'$set': {'progress': progress}}
            )
        
        return jsonify({'message': 'Material marked as complete'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@progress_bp.route('/video/<video_id>/watch-time', methods=['POST'])
@jwt_required()
def update_watch_time(video_id):
    """Update video watch time for progress tracking"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        data = request.get_json()
        
        watch_time = data.get('watch_time', 0)  # in seconds
        total_duration = data.get('total_duration', 0)  # in seconds
        
        # Get material
        material = db.materials.find_one({'_id': ObjectId(video_id)})
        if not material:
            return jsonify({'error': 'Video not found'}), 404
        
        # Update or create watch progress
        watch_progress = {
            'student_id': user_id,
            'material_id': video_id,
            'course_id': material['course_id'],
            'watch_time': watch_time,
            'total_duration': total_duration,
            'progress_percentage': (watch_time / total_duration * 100) if total_duration > 0 else 0,
            'last_watched': datetime.utcnow()
        }
        
        # Upsert watch progress
        db.watch_progress.update_one(
            {'student_id': user_id, 'material_id': video_id},
            {'$set': watch_progress},
            upsert=True
        )
        
        # If watched more than 80%, mark as complete
        if watch_progress['progress_percentage'] >= 80:
            # Mark material as complete
            enrollment = db.enrollments.find_one({
                'course_id': material['course_id'],
                'student_id': user_id
            })
            
            if enrollment:
                completed_materials = enrollment.get('completed_materials', [])
                if video_id not in completed_materials:
                    completed_materials.append(video_id)
                    
                    db.enrollments.update_one(
                        {'_id': enrollment['_id']},
                        {
                            '$set': {
                                'completed_materials': completed_materials,
                                'last_accessed': datetime.utcnow()
                            }
                        }
                    )
        
        return jsonify({'message': 'Watch time updated'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500