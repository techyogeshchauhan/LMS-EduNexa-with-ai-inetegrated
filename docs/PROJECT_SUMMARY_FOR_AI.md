# EduNexa LMS - Quick Summary for AI Understanding

## 🎯 Project Overview
**EduNexa** is a full-stack AI-integrated Learning Management System built with Flask (Python) backend and React (TypeScript) frontend.

## 🏗️ Architecture
```
React Frontend (TypeScript + TailwindCSS)
    ↕ REST API
Flask Backend (Python + JWT Auth)
    ↕ Database Queries
MongoDB Database
    ↕ AI API
Google Gemini AI
```

## 👥 User Roles
1. **Students**: Enroll in courses, submit assignments, track progress, use AI chatbot
2. **Teachers**: Create courses, upload materials, grade assignments, monitor students
3. **Admins**: Manage users, system analytics, full access

## 🚀 Core Features

### 1. Authentication
- JWT-based (2hr access, 7-day refresh tokens)
- Google OAuth support
- Password reset with tokens
- Multi-device logout

### 2. Course Management
- Create/edit courses with modules
- Upload videos, PDFs, documents
- Enrollment system with limits
- Progress tracking (0-100%)

### 3. Assignment System
- Create assignments with due dates
- File/text submissions
- Grading with feedback
- Automatic notifications

### 4. AI Features (Google Gemini)
- Conversational chatbot
- Content summarization
- Learning path generation
- Personalized recommendations
- Fallback responses when AI unavailable

### 5. Video Management
- Upload videos (max 100MB)
- Streaming with JWT protection
- Watch progress tracking (auto-complete at 80%)
- View analytics

### 6. Analytics & Monitoring
- Student performance scoring (0-100)
- Learning pace detection (fast/normal/slow)
- Engagement alerts (inactive, low grades, overdue)
- Course-level statistics
- System-wide metrics (admin)

### 7. Progress Tracking
- Material completion tracking
- Video watch time recording
- Assignment submission tracking
- Overall course progress calculation

### 8. Notifications
- Real-time notifications (info, success, warning, error)
- Unread count tracking
- Mark as read/delete
- Auto-notifications for events

## 📡 Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile
- `POST /api/auth/logout` - Logout

### Courses
- `GET /api/courses/` - List courses
- `POST /api/courses/` - Create course
- `POST /api/courses/<id>/enroll` - Enroll
- `POST /api/courses/<id>/materials` - Upload material

### Assignments
- `GET /api/assignments/` - List assignments
- `POST /api/assignments/` - Create assignment
- `POST /api/assignments/<id>/submit` - Submit
- `POST /api/assignments/submissions/<id>/grade` - Grade

### AI
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/summarize` - Summarize content
- `POST /api/ai/learning-path` - Generate learning path
- `GET /api/ai/recommendations` - Get recommendations

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/teacher/dashboard` - Teacher stats
- `GET /api/learner-analytics/performance-analysis` - Student analysis
- `GET /api/learner-analytics/performance-alerts` - Engagement alerts

### Progress
- `GET /api/progress/course/<id>` - Course progress
- `POST /api/progress/material/<id>/complete` - Mark complete
- `POST /api/progress/video/<id>/watch-time` - Update watch time

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/<id>/read` - Mark as read
- `GET /api/notifications/unread-count` - Unread count

## 🗄️ Database Collections

1. **users** - User accounts (students, teachers, admins)
2. **courses** - Course information
3. **enrollments** - Student-course relationships
4. **materials** - Course materials (videos, docs)
5. **assignments** - Assignment details
6. **submissions** - Student submissions
7. **videos** - Video metadata
8. **watch_progress** - Video watch tracking
9. **notifications** - User notifications
10. **chat_history** - AI chat conversations
11. **learning_paths** - Generated learning paths
12. **refresh_tokens** - JWT refresh tokens
13. **password_resets** - Password reset tokens

## 🔐 Security Features
- Password hashing (Werkzeug PBKDF2)
- JWT token blacklisting
- Token rotation on refresh
- Server restart invalidates old tokens
- CORS configuration
- Input validation and sanitization
- File upload restrictions

## 🎨 Frontend Structure
```
src/
├── components/     # React components
│   ├── auth/      # Login, Register
│   ├── dashboard/ # Dashboards
│   ├── courses/   # Course components
│   ├── assignments/ # Assignment components
│   ├── ai/        # AI chatbot
│   ├── analytics/ # Analytics views
│   └── common/    # Reusable components
├── contexts/      # React Context (Auth, LMS)
├── services/      # API calls
├── types/         # TypeScript types
└── utils/         # Helper functions
```

## 🛠️ Tech Stack

**Backend:**
- Flask (Python 3.8+)
- MongoDB (NoSQL)
- JWT (Flask-JWT-Extended)
- Google Gemini AI
- PyPDF2 (PDF processing)

**Frontend:**
- React 18.3+ (TypeScript)
- Vite (Build tool)
- TailwindCSS (Styling)
- Lucide React (Icons)
- Context API (State management)

## 📊 Key Metrics

**Performance Scoring:**
- Assignment performance: 60% weight
- Course progress: 40% weight
- Result: 0-100 score

**Learning Pace:**
- Fast: >2% progress/day, >6 submissions/month
- Slow: <0.5% progress/day, <3 submissions/month
- Normal: Between fast and slow

**Engagement Score (0-100):**
- Progress > 0: +30 points
- Recent activity (7 days): +30 points
- Progress ≥ 50%: +20 points
- Submissions ≥ 80% of assignments: +20 points

**Risk Levels:**
- High: Performance < 50 or slow pace
- Medium: Performance < 70
- Low: Performance ≥ 70

## 🚀 Deployment

**Backend:**
```bash
gunicorn -c gunicorn_config.py app:app
```

**Frontend:**
```bash
npm run build
# Deploy dist/ folder
```

**Environment Variables:**
```env
MONGO_URI=mongodb://...
JWT_SECRET_KEY=...
GEMINI_API_KEY=...
FRONTEND_URL=https://...
```

## 🧪 Test Credentials

**Student:** student01@datams.edu / Stud@2025  
**Teacher:** teacher01@datams.edu / Teach@2025  
**Admin:** admin@datams.edu / Admin@2025

---

**This summary provides all essential information needed to understand and work with the EduNexa LMS project.**
