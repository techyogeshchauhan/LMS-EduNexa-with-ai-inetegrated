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
        
        # Calculate video watch progress
        video_materials = [m for m in materials if m.get('type') == 'video']
        total_video_progress = 0
        
        if video_materials:
            for video in video_materials:
                watch_data = db.watch_progress.find_one({
                    'student_id': user_id,
                    'material_id': str(video['_id'])
                })
                if watch_data:
                    total_video_progress += watch_data.get('progress_percentage', 0)
            
            # Average video progress
            avg_video_progress = total_video_progress / len(video_materials) if video_materials else 0
        else:
            avg_video_progress = 0
        
        # Calculate overall progress (weighted: 70% videos, 30% other materials)
        if total_materials > 0:
            if video_materials:
                video_weight = len(video_materials) / total_materials
                other_weight = 1 - video_weight
                progress_percentage = (avg_video_progress * video_weight * 100) + (completed_count / total_materials * 100 * other_weight)
            else:
                progress_percentage = (completed_count / total_materials * 100)
        else:
            progress_percentage = 0
        
        # Get assignments progress
        assignments = list(db.assignments.find({'course_id': course_id}))
        total_assignments = len(assignments)
        
        submitted_assignments = db.submissions.count_documents({
            'course_id': course_id,
            'student_id': user_id
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
        print("print video id -", video_id)
        # Get material
        material = db.materials.find_one({'content': video_id})
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

@progress_bp.route('/video/<video_id>/status', methods=['GET'])
@jwt_required()
def get_video_progress(video_id):
    """Get student's progress for a specific video"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get watch progress
        watch_data = db.watch_progress.find_one({
            'student_id': user_id,
            'material_id': video_id
        })
        
        if not watch_data:
            return jsonify({
                'watch_time': 0,
                'total_duration': 0,
                'progress_percentage': 0
            }), 200
        
        return jsonify({
            'watch_time': watch_data.get('watch_time', 0),
            'total_duration': watch_data.get('total_duration', 0),
            'progress_percentage': watch_data.get('progress_percentage', 0),
            'last_watched': watch_data.get('last_watched').isoformat() if watch_data.get('last_watched') else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@progress_bp.route('/course/<course_id>/videos', methods=['GET'])
@jwt_required()
def get_course_videos(course_id):
    """Get all videos in a course with watch statistics (for teachers)"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is teacher
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'teacher':
            return jsonify({'error': 'Only teachers can view video statistics'}), 403
        
        # Check if teacher owns the course
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course or course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get all video materials for this course
        video_materials = list(db.materials.find({
            'course_id': course_id,
            'type': 'video'
        }))
        
        # Get enrolled students count
        enrolled_students = db.enrollments.count_documents({'course_id': course_id})
        
        videos_data = []
        for video in video_materials:
            video_id = str(video['_id'])
            
            # Get watch statistics for this video
            watch_records = list(db.watch_progress.find({'material_id': video_id}))
            
            total_views = len(watch_records)
            total_watch_time = sum(record.get('watch_time', 0) for record in watch_records)
            avg_completion = sum(record.get('progress_percentage', 0) for record in watch_records) / total_views if total_views > 0 else 0
            
            # Get video file info
            video_info = db.videos.find_one({'_id': ObjectId(video.get('content', video_id))})
            
            videos_data.append({
                'id': video_id,
                'title': video.get('title', 'Untitled'),
                'description': video.get('description', ''),
                'content_id': video.get('content'),
                'uploaded_at': video.get('created_at'),
                'file_size': video_info.get('fileSize') if video_info else None,
                'file_path': video_info.get('filePath') if video_info else None,
                'statistics': {
                    'total_views': total_views,
                    'total_watch_time_seconds': total_watch_time,
                    'total_watch_time_formatted': f"{int(total_watch_time // 3600)}h {int((total_watch_time % 3600) // 60)}m",
                    'avg_completion_percentage': round(avg_completion, 2),
                    'enrolled_students': enrolled_students,
                    'view_rate': round((total_views / enrolled_students * 100), 2) if enrolled_students > 0 else 0
                }
            })
        
        return jsonify({
            'course_id': course_id,
            'course_title': course.get('title'),
            'total_videos': len(videos_data),
            'enrolled_students': enrolled_students,
            'videos': videos_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500