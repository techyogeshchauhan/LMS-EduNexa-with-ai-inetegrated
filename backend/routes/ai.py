from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import google.generativeai as genai
import os
import PyPDF2
import io
import re

ai_bp = Blueprint('ai', __name__)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("⚠️  Warning: GEMINI_API_KEY not found. AI features will use fallback responses.")

def extract_text_from_pdf(pdf_content):
    """Extract text from PDF content"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error extracting PDF text: {str(e)}"

def generate_fallback_learning_path(goal, timeframe, enrolled_courses, user):
    """Generate a structured learning path when AI is not available"""
    
    course_titles = [course['title'] for course in enrolled_courses] if enrolled_courses else ['your current courses']
    department = user.get('department', 'your field of study')
    
    # Determine study hours based on timeframe
    if timeframe == 'week':
        study_hours = "10-15 hours"
        weekly_plan = "Focus on current course materials, complete pending assignments, and review challenging topics"
    elif timeframe == 'semester':
        study_hours = "8-12 hours per week"
        weekly_plan = "Build strong foundations, develop skills progressively, and prepare for assessments"
    else:  # month
        study_hours = "10-15 hours per week"
        weekly_plan = "Catch up on materials, strengthen weak areas, and practice consistently"
    
    return f"""### 🎯 {timeframe.title()} Learning Plan

**Goal:** {goal}

**Focus Areas:** {', '.join(course_titles[:3])}{'...' if len(course_titles) > 3 else ''}

**Study Time:** {study_hours}

**Action Plan:** {weekly_plan}

**Quick Tips:**
- Set daily study goals and track progress
- Review material regularly using active recall
- Join study groups for collaborative learning
- Take breaks to maintain focus

*Click "New Path" to generate a custom plan for different goals*"""

def generate_welcome_message(user_name, enrolled_courses):
    """Generate a personalized welcome message for new chat sessions"""
    courses_text = ", ".join(enrolled_courses) if enrolled_courses else "your courses"
    
    return f"""## 👋 Hello {user_name}! Welcome to Your AI Study Assistant!

### 🎓 I'm Here to Help You Succeed!

I'm your personal AI tutor, ready to assist you with **{courses_text}** and much more!

### 🚀 Here's How I Can Help You:

#### 📚 **Course Support**
- Explain difficult concepts and topics
- Provide study strategies for each subject
- Help you understand course materials better

#### 📝 **Assignment & Quiz Guidance**
- Break down complex assignments into manageable steps
- Offer study tips for upcoming quizzes
- Help you prepare for exams effectively

#### 🎯 **Personalized Learning**
- Create custom study schedules
- Recommend learning resources
- Track your progress and suggest improvements

#### 💡 **Study Tips & Motivation**
- Share proven study techniques
- Help you stay motivated and focused
- Provide time management strategies

### 🌟 **Quick Start Ideas:**
- *"Help me understand [specific topic]"*
- *"What should I focus on for my upcoming quiz?"*
- *"Can you create a study plan for this week?"*
- *"I'm struggling with [subject], can you help?"*

### 💬 **Let's Get Started!**
What would you like to work on today? I'm here to make your learning journey easier and more enjoyable! 😊

*Just type your question below and I'll provide detailed, helpful guidance!*"""

def generate_fallback_response(prompt, context=""):
    """Generate a helpful fallback response when AI is not available"""
    
    # Simple keyword-based responses
    prompt_lower = prompt.lower()
    
    if any(word in prompt_lower for word in ['study', 'learn', 'help', 'how']):
        return f"""## 📚 Great Question!

### 🎯 Here's Some General Study Advice:

- **Create a study schedule** and stick to it consistently
- **Break down complex topics** into smaller, manageable chunks
- **Use active learning techniques** like summarization and self-testing
- **Take regular breaks** to maintain focus and retention
- **Join study groups** or find study partners for collaborative learning

### 💡 Study Tips:
1. **Set specific goals** for each study session
2. **Use the Pomodoro Technique** (25 minutes focused study, 5-minute break)
3. **Review material regularly** instead of cramming
4. **Practice with past quizzes** and assignments

### 🚀 Next Steps:
Check your course materials and assignments in your dashboard. If you need specific help with a topic, try rephrasing your question or contact your instructor.

Keep up the great work! 😊

*Note: AI assistant is currently in basic mode. For enhanced features, please contact your administrator.*"""
    
    elif any(word in prompt_lower for word in ['assignment', 'homework', 'task']):
        return f"""## 📝 Assignment Help

### 🎯 General Assignment Tips:

- **Read the instructions carefully** and understand what's being asked
- **Break the assignment into smaller tasks** and tackle them one by one
- **Start early** to avoid last-minute stress
- **Create an outline** before you begin writing or coding
- **Review your work** before submitting

### 💡 Getting Started:
1. **Understand the requirements** - what format, length, and criteria are expected?
2. **Research thoroughly** using reliable sources
3. **Create a timeline** with milestones leading to the due date
4. **Ask for help** if you're stuck on specific concepts

### 🚀 Resources:
- Check your course materials for relevant examples
- Review similar assignments you've completed
- Reach out to classmates or your instructor for clarification

You've got this! 💪

*Note: For personalized assignment help, please ensure the AI service is properly configured.*"""
    
    else:
        return f"""## 👋 Hello! I'm Here to Help

### 🎓 I'm Your Study Assistant

Thank you for your question! While I'm currently running in basic mode, I'm still here to support your learning journey.

### 🚀 How I Can Help:
- **Study strategies and techniques**
- **Assignment planning and organization**
- **General academic advice**
- **Learning tips and motivation**

### 💡 Try Asking About:
- *"How can I improve my study habits?"*
- *"What's the best way to prepare for exams?"*
- *"How do I manage my time better?"*
- *"Can you help me understand this concept?"*

### 🔧 For Enhanced Features:
Contact your administrator to enable full AI capabilities for personalized responses, course-specific help, and advanced learning path generation.

Feel free to ask me anything about studying and learning! 😊"""

def generate_explanation(topic, context=""):
    """Generate detailed explanation of a topic"""
    if not GEMINI_API_KEY:
        return f"""## 📚 Understanding {topic}

### 🎯 Key Concepts:
This is a fundamental concept in your course. Let me break it down:

- **Definition**: {topic} is an important concept that builds on previous knowledge
- **Why it matters**: Understanding this helps you grasp more advanced topics
- **Real-world application**: This concept is used in practical scenarios

### 💡 Simple Explanation:
Think of it like this: [simplified analogy would go here]

### 📝 Study Tips:
1. Review your course materials on this topic
2. Practice with examples
3. Connect it to what you already know
4. Ask your instructor for clarification if needed

Need more details? Feel free to ask! 😊"""
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        You are a patient and knowledgeable tutor. Explain the following topic in simple, easy-to-understand terms.
        
        Topic: {topic}
        Student Context: {context}
        
        Provide:
        1. A clear definition
        2. Why it's important
        3. A simple analogy or example
        4. Real-world applications
        5. Common misconceptions to avoid
        6. Study tips
        
        Use markdown formatting with headers (##, ###), bullet points, and emojis.
        Keep it conversational and encouraging.
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return generate_fallback_response(topic, context)

def generate_summary(content, context=""):
    """Generate a concise summary"""
    if not GEMINI_API_KEY:
        return f"""## 📝 Summary

### Key Points:
- Main concept 1
- Main concept 2
- Main concept 3

### Important Takeaways:
Focus on understanding the core concepts and how they connect.

### Study Recommendation:
Review these key points regularly and practice applying them.

*For a more detailed summary, ensure AI features are properly configured.*"""
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        Summarize the following content into clear, concise bullet points.
        Focus on the most important concepts and key takeaways.
        
        Content: {content}
        Student Context: {context}
        
        Format:
        ## 📝 Summary
        
        ### Key Points:
        - [Main points]
        
        ### Important Takeaways:
        - [What to remember]
        
        ### Study Tips:
        - [How to use this information]
        
        Keep it brief but comprehensive. Use emojis and markdown.
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return generate_fallback_response(content, context)

def generate_quiz_help(question, context=""):
    """Help with quiz questions without giving direct answers"""
    if not GEMINI_API_KEY:
        return f"""## 🎯 Quiz Help

### 📚 Approach This Question:
1. **Read carefully**: Make sure you understand what's being asked
2. **Identify key concepts**: What topics does this relate to?
3. **Eliminate wrong answers**: Rule out obviously incorrect options
4. **Think it through**: Use your knowledge to reason through the answer

### 💡 Study Strategy:
- Review your course materials on this topic
- Practice similar questions
- Understand the underlying concepts, not just memorize

### 🚀 You've Got This!
Take your time and trust your preparation. Good luck! 😊"""
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        A student needs help with a quiz question. DO NOT give the direct answer.
        Instead, guide them to think through it themselves.
        
        Question: {question}
        Student Context: {context}
        
        Provide:
        1. Hints about what concepts to review
        2. Strategies for approaching this type of question
        3. Related topics to study
        4. Encouragement
        
        DO NOT reveal the answer. Help them learn to solve it themselves.
        Use markdown formatting with emojis.
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return generate_fallback_response(question, context)

def generate_qa_response(question, context=""):
    """Answer questions about course materials"""
    if not GEMINI_API_KEY:
        return generate_fallback_response(question, context)
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        You are a helpful tutor answering a student's question about their course material.
        
        Question: {question}
        Student Context: {context}
        
        Provide a clear, comprehensive answer that:
        1. Directly addresses the question
        2. Explains the reasoning
        3. Provides examples if helpful
        4. Suggests related topics to explore
        5. Encourages further learning
        
        Use markdown formatting with headers, bullet points, and emojis.
        Be friendly and encouraging.
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return generate_fallback_response(question, context)

def generate_ai_response(prompt, context=""):
    """Generate AI response using Gemini or fallback"""
    
    # Check if Gemini API is available
    if not GEMINI_API_KEY:
        return generate_fallback_response(prompt, context)
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        full_prompt = f"""
        You are an AI learning assistant for EduNexa LMS, a friendly and knowledgeable tutor who helps students succeed.
        
        Student Context: {context}
        Student Question: {prompt}
        
        IMPORTANT FORMATTING RULES:
        1. Always use proper markdown formatting with headers (##, ###)
        2. Use bullet points (-) and numbered lists where appropriate
        3. Include emojis to make responses more engaging
        4. Structure your response with clear sections
        5. Keep responses conversational but professional
        6. Always end with an encouraging note or next steps
        
        RESPONSE STRUCTURE:
        - Start with a friendly greeting acknowledging their question
        - Use ## for main headings and ### for subheadings
        - Provide actionable advice with bullet points
        - Include relevant examples when helpful
        - End with encouragement and offer further help
        
        EXAMPLE FORMAT:
        ## 📚 Great Question About [Topic]!
        
        ### 🎯 Here's What You Need to Know:
        - Point 1 with explanation
        - Point 2 with details
        
        ### 💡 My Recommendations:
        1. First actionable step
        2. Second actionable step
        
        ### 🚀 Next Steps:
        Brief summary of what to do next.
        
        Feel free to ask if you need clarification on anything! 😊
        
        Now respond to the student's question in this style.
        """
        
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return generate_fallback_response(prompt, context)

@ai_bp.route('/chat/welcome', methods=['GET'])
@jwt_required()
def get_welcome_message():
    """Get personalized welcome message for chat"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get user info
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        enrolled_courses = []
        if user['role'] == 'student':
            # Get enrolled courses
            enrollments = list(db.enrollments.find({'student_id': user_id}))
            if enrollments:
                course_ids = [enrollment['course_id'] for enrollment in enrollments]
                courses = list(db.courses.find({'_id': {'$in': [ObjectId(cid) for cid in course_ids]}}))
                enrolled_courses = [course['title'] for course in courses]
        
        welcome_message = generate_welcome_message(user['name'], enrolled_courses)
        
        return jsonify({
            'message': welcome_message,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def ai_chat():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        data = request.get_json()
        message = data.get('message', '').strip()
        chat_type = data.get('type', 'general')  # general, explain, summarize, quiz, qa
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Get user context for personalized responses
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        # Build comprehensive context
        context_parts = [f"User: {user['name']}", f"Role: {user['role']}"]
        
        if user['role'] == 'student':
            # Get enrolled courses
            enrollments = list(db.enrollments.find({'student_id': user_id}))
            if enrollments:
                course_ids = [enrollment['course_id'] for enrollment in enrollments]
                courses = list(db.courses.find({'_id': {'$in': [ObjectId(cid) for cid in course_ids]}}))
                course_titles = [course['title'] for course in courses]
                context_parts.append(f"Enrolled courses: {', '.join(course_titles)}")
            
            # Get recent performance
            quiz_attempts = list(db.quiz_attempts.find({'student_id': user_id}).sort('submitted_at', -1).limit(5))
            if quiz_attempts:
                avg_score = sum(attempt.get('score', 0) for attempt in quiz_attempts) / len(quiz_attempts)
                context_parts.append(f"Recent quiz average: {avg_score:.1f}%")
            
            # Get weak areas
            if quiz_attempts:
                weak_courses = []
                for attempt in quiz_attempts:
                    if attempt.get('score', 0) < 70:
                        course = db.courses.find_one({'_id': ObjectId(attempt.get('course_id', ''))})
                        if course:
                            weak_courses.append(course['title'])
                if weak_courses:
                    context_parts.append(f"Areas needing improvement: {', '.join(set(weak_courses))}")
        
        context = "; ".join(context_parts)
        
        # Generate AI response based on type
        if chat_type == 'explain':
            ai_response = generate_explanation(message, context)
        elif chat_type == 'summarize':
            ai_response = generate_summary(message, context)
        elif chat_type == 'quiz':
            ai_response = generate_quiz_help(message, context)
        elif chat_type == 'qa':
            ai_response = generate_qa_response(message, context)
        else:
            ai_response = generate_ai_response(message, context)
        
        # Save chat history
        chat_data = {
            'user_id': user_id,
            'message': message,
            'response': ai_response,
            'type': chat_type,
            'timestamp': datetime.utcnow(),
            'context': context
        }
        
        db.chat_history.insert_one(chat_data)
        
        return jsonify({
            'response': ai_response,
            'timestamp': datetime.utcnow().isoformat(),
            'type': chat_type
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/summarize', methods=['POST'])
@jwt_required()
def summarize_content():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        content = data.get('content', '').strip()
        content_type = data.get('type', 'text')  # text, pdf, url
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        # Extract text based on content type
        if content_type == 'pdf':
            # Assuming content is base64 encoded PDF
            import base64
            try:
                pdf_content = base64.b64decode(content)
                text_content = extract_text_from_pdf(pdf_content)
            except Exception as e:
                return jsonify({'error': f'Failed to process PDF: {str(e)}'}), 400
        else:
            text_content = content
        
        # Limit content length for API
        if len(text_content) > 10000:
            text_content = text_content[:10000] + "..."
        
        # Generate summary using AI
        prompt = f"""
        Please provide a concise summary of the following educational content. 
        Focus on key concepts, main points, and important details that students should remember.
        
        Content:
        {text_content}
        
        Summary:
        """
        
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            summary = response.text
        except Exception as e:
            return jsonify({'error': f'Failed to generate summary: {str(e)}'}), 500
        
        # Save summary
        summary_data = {
            'user_id': user_id,
            'original_content': text_content[:1000],  # Store first 1000 chars
            'summary': summary,
            'content_type': content_type,
            'created_at': datetime.utcnow()
        }
        
        db.summaries.insert_one(summary_data)
        
        return jsonify({
            'summary': summary,
            'word_count_original': len(text_content.split()),
            'word_count_summary': len(summary.split())
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/generate-quiz', methods=['POST'])
@jwt_required()
def generate_quiz():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is teacher or admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Only teachers and admins can generate quizzes'}), 403
        
        data = request.get_json()
        content = data.get('content', '').strip()
        course_id = data.get('course_id')
        num_questions = data.get('num_questions', 5)
        difficulty = data.get('difficulty', 'medium')
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        if not course_id:
            return jsonify({'error': 'Course ID is required'}), 400
        
        # Check if course exists and user has permission
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        if user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Generate quiz using AI
        prompt = f"""
        Based on the following educational content, generate {num_questions} multiple choice questions 
        with difficulty level: {difficulty}.
        
        For each question, provide:
        1. The question text
        2. Four options (A, B, C, D)
        3. The correct answer (A, B, C, or D)
        4. A brief explanation of why the answer is correct
        
        Content:
        {content[:5000]}  # Limit content length
        
        Format the response as JSON with this structure:
        {{
            "questions": [
                {{
                    "question": "Question text here?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": "A",
                    "explanation": "Explanation here"
                }}
            ]
        }}
        """
        
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            
            # Parse the AI response
            import json
            # Extract JSON from response
            response_text = response.text
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            
            if json_match:
                quiz_data = json.loads(json_match.group())
                questions = quiz_data.get('questions', [])
            else:
                # Fallback: create a simple structure
                questions = [{
                    "question": "Sample question generated from content",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": "A",
                    "explanation": "This is a sample explanation"
                }]
            
        except Exception as e:
            return jsonify({'error': f'Failed to generate quiz: {str(e)}'}), 500
        
        # Format questions for database
        formatted_questions = []
        for q in questions:
            formatted_questions.append({
                'question': q.get('question', ''),
                'type': 'mcq',
                'options': q.get('options', []),
                'correct_answer': q.get('correct_answer', 'A'),
                'explanation': q.get('explanation', '')
            })
        
        # Save generated quiz
        quiz_data = {
            'title': f'AI Generated Quiz - {course["title"]}',
            'description': f'Auto-generated quiz based on course content (Difficulty: {difficulty})',
            'course_id': course_id,
            'questions': formatted_questions,
            'time_limit': 0,
            'max_attempts': 3,
            'shuffle_questions': True,
            'show_results': True,
            'is_active': False,  # Set to inactive by default
            'created_by': user_id,
            'generated_by_ai': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.quizzes.insert_one(quiz_data)
        quiz_data['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Quiz generated successfully',
            'quiz': quiz_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get user
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'student':
            return jsonify({'error': 'Recommendations are only available for students'}), 403
        
        # Get user's learning data
        enrollments = list(db.enrollments.find({'student_id': user_id}))
        enrolled_course_ids = [enrollment['course_id'] for enrollment in enrollments]
        
        # Get enrolled courses
        enrolled_courses = list(db.courses.find({
            '_id': {'$in': [ObjectId(cid) for cid in enrolled_course_ids]}
        }))
        
        # Get quiz attempts and scores
        quiz_attempts = list(db.quiz_attempts.find({'student_id': user_id}))
        
        # Get assignment submissions
        submissions = list(db.submissions.find({'student_id': user_id}))
        
        # Analyze performance
        weak_areas = []
        strong_areas = []
        
        # Analyze quiz performance
        if quiz_attempts:
            avg_score = sum(attempt.get('score', 0) for attempt in quiz_attempts) / len(quiz_attempts)
            
            # Get courses with low performance
            course_performance = {}
            for attempt in quiz_attempts:
                course_id = attempt['course_id']
                if course_id not in course_performance:
                    course_performance[course_id] = []
                course_performance[course_id].append(attempt.get('score', 0))
            
            for course_id, scores in course_performance.items():
                avg_course_score = sum(scores) / len(scores)
                course = db.courses.find_one({'_id': ObjectId(course_id)})
                if course:
                    if avg_course_score < 70:
                        weak_areas.append(course['title'])
                    elif avg_course_score > 85:
                        strong_areas.append(course['title'])
        
        # Get available courses for recommendations
        available_courses = list(db.courses.find({
            '_id': {'$nin': [ObjectId(cid) for cid in enrolled_course_ids]},
            'is_active': True
        }))
        
        # Generate AI-powered recommendations
        context = f"""
        Student Profile:
        - Department: {user.get('department', 'Not specified')}
        - Year: {user.get('year', 'Not specified')}
        - Enrolled Courses: {[course['title'] for course in enrolled_courses]}
        - Strong Areas: {strong_areas}
        - Areas for Improvement: {weak_areas}
        - Total Points: {user.get('total_points', 0)}
        """
        
        # Get course recommendations
        course_recommendations = []
        if available_courses:
            # Simple recommendation based on department and category
            for course in available_courses[:5]:  # Limit to 5 recommendations
                course['_id'] = str(course['_id'])
                course_recommendations.append(course)
        
        # Generate study tips
        study_tips = [
            "Review your quiz results to identify knowledge gaps",
            "Create a study schedule and stick to it",
            "Use active learning techniques like summarization",
            "Join study groups for collaborative learning",
            "Take regular breaks to improve retention"
        ]
        
        if weak_areas:
            study_tips.insert(0, f"Focus extra time on: {', '.join(weak_areas)}")
        
        return jsonify({
            'course_recommendations': course_recommendations,
            'study_tips': study_tips,
            'performance_summary': {
                'strong_areas': strong_areas,
                'weak_areas': weak_areas,
                'total_points': user.get('total_points', 0),
                'courses_enrolled': len(enrolled_courses),
                'quizzes_attempted': len(quiz_attempts),
                'assignments_submitted': len(submissions)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/chat-history', methods=['GET'])
@jwt_required()
def get_chat_history():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        # Get chat history
        chat_history = list(db.chat_history.find({'user_id': user_id})
                           .sort('timestamp', -1)
                           .skip((page - 1) * limit)
                           .limit(limit))
        
        # Convert ObjectId to string
        for chat in chat_history:
            chat['_id'] = str(chat['_id'])
        
        total = db.chat_history.count_documents({'user_id': user_id})
        
        return jsonify({
            'chat_history': chat_history,
            'total': total,
            'page': page,
            'limit': limit,
            'total_pages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/learning-path', methods=['POST'])
@jwt_required()
def generate_learning_path():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is student
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'student':
            return jsonify({'error': 'Learning paths are only available for students'}), 403
        
        data = request.get_json()
        goal = data.get('goal', '').strip()
        timeframe = data.get('timeframe', 'month')  # week, month, semester
        
        if not goal:
            return jsonify({'error': 'Learning goal is required'}), 400
        
        # Get user's current progress
        enrollments = list(db.enrollments.find({'student_id': user_id}))
        enrolled_courses = []
        for enrollment in enrollments:
            course = db.courses.find_one({'_id': ObjectId(enrollment['course_id'])})
            if course:
                enrolled_courses.append({
                    'title': course['title'],
                    'progress': enrollment.get('progress', 0)
                })
        
        # Generate learning path using AI or fallback
        if GEMINI_API_KEY:
            prompt = f"""
            Create a personalized learning path for a student with the following profile:
            
            Goal: {goal}
            Timeframe: {timeframe}
            Current Courses: {[course['title'] for course in enrolled_courses]}
            Department: {user.get('department', 'Not specified')}
            
            Provide a structured learning path with:
            1. Weekly milestones
            2. Recommended study hours per week
            3. Key topics to focus on
            4. Suggested resources or activities
            
            Format as a practical, actionable plan using markdown formatting.
            """
            
            try:
                model = genai.GenerativeModel('gemini-2.5-flash')
                response = model.generate_content(prompt)
                learning_path = response.text
            except Exception as e:
                print(f"Gemini API error in learning path: {str(e)}")
                learning_path = generate_fallback_learning_path(goal, timeframe, enrolled_courses, user)
        else:
            learning_path = generate_fallback_learning_path(goal, timeframe, enrolled_courses, user)
        
        # Save learning path
        path_data = {
            'user_id': user_id,
            'goal': goal,
            'timeframe': timeframe,
            'learning_path': learning_path,
            'created_at': datetime.utcnow(),
            'is_active': True
        }
        
        result = db.learning_paths.insert_one(path_data)
        path_data['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Learning path generated successfully',
            'learning_path': path_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500