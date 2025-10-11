# EduNexa LMS - Complete Project Documentation for SDC Team

## 📋 Project Overview

**EduNexa LMS** is a comprehensive AI-Integrated Learning Management System built with modern web technologies. The system provides a complete educational platform for students, teachers, and administrators with advanced features including AI-powered learning assistance, real-time notifications, video management, analytics, and more.

### Key Highlights
- **Full-Stack Application**: React + TypeScript frontend with Flask + Python backend
- **AI Integration**: Google Gemini AI for personalized learning, chatbot, and content generation
- **Real-Time Features**: Live notifications, progress tracking, and status updates
- **Role-Based Access**: Separate interfaces for Students, Teachers, and Admins
- **Mobile Responsive**: Fully responsive design for all devices
- **Secure Authentication**: JWT-based authentication with token management

---

## 🏗️ System Architecture

### Technology Stack

#### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom hooks

#### Backend
- **Framework**: Flask 3.0.0 (Python)
- **Database**: MongoDB (PyMongo 4.6.1)
- **Authentication**: Flask-JWT-Extended 4.6.0
- **AI Integration**: Google Generative AI (Gemini)
- **File Processing**: PyPDF2, Pillow
- **Security**: Werkzeug, bcrypt
- **CORS**: Flask-CORS 4.0.0
- **Production Server**: Gunicorn 21.2.0

#### Database
- **Type**: MongoDB (NoSQL)
- **Collections**: users, courses, enrollments, assignments, quizzes, submissions, notifications, videos, progress, analytics

---

## 📁 Project Structure

```
edunexa-lms/
│
├── backend/                          # Flask Backend Application
│   ├── routes/                       # API Route Modules
│   │   ├── auth.py                  # Authentication & Authorization
│   │   ├── courses.py               # Course Management
│   │   ├── assignments.py           # Assignment System
│   │   ├── quizzes.py               # Quiz Management
│   │   ├── users.py                 # User Management (Admin)
│   │   ├── ai.py                    # AI Features (Chatbot, Recommendations)
│   │   ├── analytics.py             # System Analytics
│   │   ├── learner_analytics.py     # Student Learning Analytics
│   │   ├── notifications.py         # Notification System
│   │   ├── videos.py                # Video Management
│   │   └── progress.py              # Progress Tracking
│   │
│   ├── utils/                       # Utility Modules
│   │   ├── db_init.py              # Database Initialization & Sample Data
│   │   └── token_cleanup.py        # JWT Token Cleanup
│   │
│   ├── uploads/                     # File Upload Storage
│   │   └── videos/                 # Video Files
│   │
│   ├── app.py                       # Main Flask Application
│   ├── requirements.txt             # Python Dependencies
│   ├── .env.example                 # Environment Variables Template
│   ├── gunicorn_config.py          # Gunicorn Configuration
│   └── README.md                    # Backend Documentation
│
├── src/                             # React Frontend Application
│   ├── components/                  # React Components
│   │   ├── admin/                  # Admin Dashboard Components
│   │   ├── ai/                     # AI Features Components
│   │   ├── analytics/              # Analytics Components
│   │   ├── assignments/            # Assignment Components
│   │   ├── auth/                   # Authentication Components
│   │   ├── common/                 # Shared/Common Components
│   │   ├── courses/                # Course Components
│   │   ├── dashboard/              # Dashboard Components
│   │   ├── layout/                 # Layout Components (Header, Sidebar)
│   │   ├── notifications/          # Notification Components
│   │   ├── profile/                # User Profile Components
│   │   ├── quizzes/                # Quiz Components
│   │   └── students/               # Student-specific Components
│   │
│   ├── contexts/                    # React Context Providers
│   │   ├── AuthContext.tsx         # Authentication State Management
│   │   └── LMSContext.tsx          # LMS Global State Management
│   │
│   ├── hooks/                       # Custom React Hooks
│   │   └── useTokenExpiration.ts   # Token Expiration Management
│   │
│   ├── pages/                       # Page Components
│   │   ├── Notifications.tsx       # Notifications Page
│   │   └── VideoManagement.tsx     # Video Management Page
│   │
│   ├── config/                      # Configuration Files
│   │   └── api.ts                  # API Configuration
│   │
│   ├── utils/                       # Utility Functions
│   │   ├── navigation.ts           # Navigation Helpers
│   │   └── tokenHelper.ts          # Token Management Utilities
│   │
│   ├── App.tsx                      # Main App Component
│   ├── main.tsx                     # Application Entry Point
│   └── index.css                    # Global Styles
│
├── public/                          # Static Assets
├── package.json                     # Frontend Dependencies
├── vite.config.ts                   # Vite Configuration
├── tailwind.config.js               # Tailwind CSS Configuration
├── tsconfig.json                    # TypeScript Configuration
├── .env.example                     # Frontend Environment Template
├── setup.md                         # Complete Setup Guide
├── README.md                        # Project README
├── AI_FEATURES.md                   # AI Features Documentation
└── QUICK_START_GUIDE.md            # Quick Start Testing Guide
```

---

## 🚀 Installation & Setup

### Prerequisites

Before starting, ensure you have the following installed:

1. **Python 3.8+** - [Download](https://python.org/downloads/)
2. **Node.js 16+** - [Download](https://nodejs.org/)
3. **MongoDB** - [Install Guide](https://docs.mongodb.com/manual/installation/)
4. **Google Gemini API Key** (Optional for AI features) - [Get Key](https://makersuite.google.com/app/apikey)

### Step-by-Step Setup

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
copy .env.example .env    # Windows
cp .env.example .env      # macOS/Linux
```

**Configure backend/.env:**
```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/edunexa_lms

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production

# AI Configuration (Optional - Gemini API)
GEMINI_API_KEY=your-gemini-api-key-here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

#### 2. Frontend Setup

```bash
# Navigate to project root
cd ..

# Install Node.js dependencies
npm install

# Copy environment template
copy .env.example .env    # Windows
cp .env.example .env      # macOS/Linux
```

**Configure .env:**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=EduNexa LMS
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DARK_MODE=true
```

#### 3. Start MongoDB

```bash
# Windows (if installed as service)
net start MongoDB

# macOS (with Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod
```

#### 4. Start Backend Server

```bash
cd backend
venv\Scripts\activate    # Windows
source venv/bin/activate # macOS/Linux
python app.py
```

**Backend runs on:** `http://localhost:5000`

#### 5. Start Frontend Development Server

```bash
# In new terminal, from project root
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

---

## 🔐 Test Credentials

The system comes pre-configured with test accounts for all roles:

### Students
| Email | Password | Role |
|-------|----------|------|
| student01@datams.edu | Stud@2025 | student |
| student02@datams.edu | Stud@2025 | student |
| student03@datams.edu | Stud@2025 | student |

### Teachers
| Email | Password | Role |
|-------|----------|------|
| teacher01@datams.edu | Teach@2025 | teacher |
| teacher02@datams.edu | Teach@2025 | teacher |

### Admins
| Email | Password | Role |
|-------|----------|------|
| admin@datams.edu | Admin@2025 | admin |
| superadmin@datams.edu | Admin@123456 | admin |

---

## 🎯 Core Features

### For Students

#### 1. Dashboard
- View enrolled courses with progress tracking
- Upcoming assignments and deadlines
- Recent grades and performance metrics
- Quick access to active courses
- Learning analytics and insights

#### 2. Course Management
- Browse available courses by category
- Enroll in courses
- Access course materials (PDFs, videos, documents)
- Track course progress
- View learning objectives and prerequisites

#### 3. Assignment System
- View all assignments with due dates
- Submit assignments (text + file upload)
- Track submission status (Pending, Submitted, Graded)
- View grades and teacher feedback
- Resubmit assignments if allowed

#### 4. Quiz System
- Take quizzes with multiple question types
- Instant feedback on quiz attempts
- View quiz history and scores
- Timed quizzes with auto-submission
- Multiple attempts if allowed

#### 5. AI Learning Assistant
- **AI Chatbot**: 24/7 learning support and Q&A
- **Personalized Learning Path**: Custom study plans based on goals
- **Smart Recommendations**: Course and resource suggestions
- **Study Tips**: AI-powered learning strategies
- **Content Summarization**: Automatic PDF/document summaries

#### 6. Analytics & Progress
- Learning progress visualization
- Performance trends over time
- Strengths and weaknesses analysis
- Time spent on courses
- Achievement badges and points

#### 7. Notifications
- Real-time notifications for:
  - Assignment grades
  - New course materials
  - Upcoming deadlines
  - Quiz results
  - System announcements

### For Teachers

#### 1. Course Creation & Management
- Create and publish courses
- Upload course materials (PDFs, videos, documents)
- Set course prerequisites and objectives
- Manage course visibility and enrollment
- Edit and update course content

#### 2. Assignment Management
- Create assignments with detailed instructions
- Set due dates and maximum scores
- View all student submissions
- Download submitted files
- Track submission statistics

#### 3. Grading System
- Grade student submissions
- Provide detailed feedback
- Bulk grading options
- Grade history and analytics
- Export grades to CSV

#### 4. Quiz Creation
- Create quizzes with multiple question types:
  - Multiple Choice
  - True/False
  - Short Answer
  - Essay Questions
- Set time limits and attempt restrictions
- Auto-grading for objective questions
- Manual grading for subjective questions

#### 5. Student Monitoring
- View enrolled students
- Track individual student progress
- Monitor assignment completion rates
- Identify struggling students
- View detailed student analytics

#### 6. AI Tools for Teachers
- **Auto Quiz Generation**: Generate quizzes from course content
- **Content Analysis**: AI-powered content insights
- **Student Performance Prediction**: Identify at-risk students
- **Personalized Feedback**: AI-assisted feedback generation

#### 7. Analytics Dashboard
- Course performance metrics
- Student engagement statistics
- Assignment submission trends
- Quiz performance analysis
- Detailed reports and exports

### For Administrators

#### 1. User Management
- Create, edit, and delete users
- Manage user roles (Student, Teacher, Admin)
- Bulk user import from CSV
- Activate/deactivate user accounts
- Reset user passwords
- View user activity logs

#### 2. System Analytics
- Total users, courses, and enrollments
- System usage statistics
- Active users and engagement metrics
- Storage and resource usage
- Performance monitoring

#### 3. Course Oversight
- View all courses across the system
- Monitor course quality and content
- Approve/reject course publications
- Manage course categories
- Archive inactive courses

#### 4. Content Moderation
- Review user-generated content
- Manage reported issues
- Monitor system activity
- Handle user complaints
- Enforce platform policies

#### 5. System Configuration
- Configure system settings
- Manage feature flags
- Set up integrations
- Configure AI services
- Backup and restore data

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication Endpoints

```
POST   /api/auth/register          # User registration
POST   /api/auth/login             # User login
GET    /api/auth/profile           # Get user profile
PUT    /api/auth/profile           # Update user profile
POST   /api/auth/change-password   # Change password
POST   /api/auth/logout            # Logout user
POST   /api/auth/refresh           # Refresh JWT token
```

### Course Endpoints

```
GET    /api/courses/               # Get all courses
POST   /api/courses/               # Create course (Teacher/Admin)
GET    /api/courses/:id            # Get course details
PUT    /api/courses/:id            # Update course
DELETE /api/courses/:id            # Delete course
POST   /api/courses/:id/enroll     # Enroll in course
POST   /api/courses/:id/unenroll   # Unenroll from course
POST   /api/courses/:id/materials  # Upload course material
GET    /api/courses/:id/students   # Get enrolled students
```

### Assignment Endpoints

```
GET    /api/assignments/                    # Get assignments
POST   /api/assignments/                    # Create assignment
GET    /api/assignments/:id                 # Get assignment details
PUT    /api/assignments/:id                 # Update assignment
DELETE /api/assignments/:id                 # Delete assignment
POST   /api/assignments/:id/submit          # Submit assignment
GET    /api/assignments/:id/submissions     # Get all submissions
POST   /api/assignments/submissions/:id/grade  # Grade submission
```

### Quiz Endpoints

```
GET    /api/quizzes/               # Get quizzes
POST   /api/quizzes/               # Create quiz
GET    /api/quizzes/:id            # Get quiz details
PUT    /api/quizzes/:id            # Update quiz
DELETE /api/quizzes/:id            # Delete quiz
POST   /api/quizzes/:id/attempt    # Attempt quiz
GET    /api/quizzes/:id/attempts   # Get quiz attempts
POST   /api/quizzes/:id/grade      # Grade quiz attempt
```

### User Management Endpoints (Admin)

```
GET    /api/users/                 # Get all users
GET    /api/users/:id              # Get user details
PUT    /api/users/:id              # Update user
DELETE /api/users/:id              # Delete user
POST   /api/users/:id/activate     # Activate user
POST   /api/users/:id/deactivate   # Deactivate user
POST   /api/users/:id/reset-password  # Reset password
POST   /api/users/bulk-import      # Bulk import users
GET    /api/users/statistics       # Get user statistics
```

### AI Feature Endpoints

```
POST   /api/ai/chat                # AI chatbot
POST   /api/ai/summarize           # Summarize content
POST   /api/ai/generate-quiz       # Generate quiz from content
GET    /api/ai/recommendations     # Get personalized recommendations
POST   /api/ai/learning-path       # Generate learning path
GET    /api/ai/chat-history        # Get chat history
GET    /api/ai/chat/welcome        # Get welcome message
```

### Analytics Endpoints

```
GET    /api/analytics/dashboard         # Dashboard analytics
GET    /api/analytics/course/:id        # Course analytics
GET    /api/analytics/student/:id       # Student analytics
GET    /api/analytics/system            # System analytics (Admin)
GET    /api/learner-analytics/progress  # Student progress
GET    /api/learner-analytics/performance  # Student performance
```

### Notification Endpoints

```
GET    /api/notifications          # Get user notifications
POST   /api/notifications          # Create notification
PUT    /api/notifications/:id/read # Mark as read
DELETE /api/notifications/:id      # Delete notification
POST   /api/notifications/mark-all-read  # Mark all as read
```

### Video Management Endpoints

```
GET    /api/videos/                # Get videos
POST   /api/videos/upload          # Upload video
GET    /api/videos/:id             # Get video details
DELETE /api/videos/:id             # Delete video
GET    /api/videos/:id/stream      # Stream video
```

### Progress Tracking Endpoints

```
GET    /api/progress/course/:id    # Get course progress
POST   /api/progress/update        # Update progress
GET    /api/progress/student/:id   # Get student progress
```

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Token Expiration**: 2-hour access tokens, 7-day refresh tokens
- **Token Blacklisting**: Revoked tokens are tracked
- **Password Hashing**: Bcrypt for secure password storage
- **Role-Based Access Control**: Separate permissions for each role

### Data Security
- **Input Validation**: All inputs are validated and sanitized
- **SQL Injection Prevention**: MongoDB parameterized queries
- **XSS Protection**: Content sanitization
- **CORS Configuration**: Restricted cross-origin requests
- **File Upload Validation**: Type and size restrictions

### Session Management
- **Server Restart Invalidation**: Tokens invalidated on server restart
- **Manual Token Revocation**: Users can logout from all devices
- **Automatic Cleanup**: Expired tokens are cleaned periodically

---

## 🧪 Testing Guide

### Quick Testing Steps

1. **Start both servers** (backend on :5000, frontend on :5173)
2. **Login as Student** (student01@datams.edu / Stud@2025)
3. **Test Student Features**:
   - View dashboard
   - Browse courses
   - Submit assignment
   - Take quiz
   - Chat with AI assistant
4. **Login as Teacher** (teacher01@datams.edu / Teach@2025)
5. **Test Teacher Features**:
   - Create course
   - Create assignment
   - Grade submissions
   - View analytics
6. **Login as Admin** (admin@datams.edu / Admin@2025)
7. **Test Admin Features**:
   - Manage users
   - View system analytics
   - Bulk import users

### Test URLs
- Dashboard: `http://localhost:5173/dashboard`
- Assignments: `http://localhost:5173/assignments`
- Courses: `http://localhost:5173/courses`
- Test Page: `http://localhost:5173/test`

---

## 🛠️ Development Guidelines

### Backend Development

```bash
# Activate virtual environment
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Install new package
pip install package_name
pip freeze > requirements.txt

# Run with auto-reload
python app.py
```

### Frontend Development

```bash
# Install new package
npm install package_name

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Database Management

```bash
# Connect to MongoDB
mongo

# Use database
use edunexa_lms

# View collections
show collections

# Query examples
db.users.find().pretty()
db.courses.find().pretty()
db.assignments.find().pretty()
```

---

## 🚀 Deployment

### Backend Deployment (Production)

1. **Set environment to production**
```env
FLASK_ENV=production
FLASK_DEBUG=False
```

2. **Use Gunicorn**
```bash
gunicorn -c gunicorn_config.py app:app
```

3. **Configure Nginx reverse proxy**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

4. **Set up SSL with Let's Encrypt**
```bash
certbot --nginx -d your-domain.com
```

### Frontend Deployment

1. **Build the application**
```bash
npm run build
```

2. **Deploy dist folder** to:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Your own web server

3. **Update environment variables** for production API URL

### Database Deployment

1. **Use MongoDB Atlas** (recommended) or self-hosted MongoDB
2. **Enable authentication**
3. **Set up backups**
4. **Configure network access**

---

## 🔧 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Solution:
- Ensure MongoDB is running
- Check MONGO_URI in .env
- Verify port 27017 is not blocked
```

#### Backend Import Errors
```
Solution:
- Activate virtual environment
- Run: pip install -r requirements.txt
- Check Python version (3.8+)
```

#### Frontend Build Errors
```
Solution:
- Delete node_modules: rm -rf node_modules
- Clear cache: npm cache clean --force
- Reinstall: npm install
```

#### API Connection Issues
```
Solution:
- Verify backend is running on port 5000
- Check VITE_API_BASE_URL in .env
- Check browser console for CORS errors
```

#### AI Features Not Working
```
Solution:
- Verify GEMINI_API_KEY in backend/.env
- Check API key validity
- System works with fallback mode if no API key
```

### Debug Tips

- **Backend logs**: Check terminal where Flask is running
- **Frontend logs**: Open browser console (F12)
- **Network requests**: Check Network tab in browser DevTools
- **MongoDB logs**: Check MongoDB terminal output

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String, // "student", "teacher", "admin"
  phone: String,
  profile_pic: String,
  created_at: Date,
  updated_at: Date,
  is_active: Boolean,
  
  // Student fields
  roll_no: String,
  department: String,
  year: String,
  semester: String,
  enrolled_courses: [String],
  completed_courses: [String],
  total_points: Number,
  badges: [String],
  
  // Teacher fields
  employee_id: String,
  designation: String,
  courses_created: [String],
  specializations: [String]
}
```

### Courses Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  teacher_id: String,
  difficulty: String,
  duration: String,
  prerequisites: [String],
  learning_objectives: [String],
  thumbnail: String,
  is_active: Boolean,
  is_public: Boolean,
  max_students: Number,
  created_at: Date,
  updated_at: Date
}
```

### Assignments Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  course_id: String,
  teacher_id: String,
  due_date: Date,
  max_score: Number,
  instructions: String,
  attachments: [String],
  created_at: Date,
  updated_at: Date
}
```

---

## 📞 Support & Contact

### For Technical Issues
1. Check this documentation
2. Review troubleshooting section
3. Check existing issues in repository
4. Contact development team

### For Feature Requests
1. Document the feature requirement
2. Submit through proper channels
3. Include use cases and benefits

### For Bug Reports
1. Describe the issue clearly
2. Include steps to reproduce
3. Provide error messages/screenshots
4. Mention environment details

---

## 📝 Additional Documentation

- **setup.md**: Complete setup guide with detailed instructions
- **AI_FEATURES.md**: AI features documentation and configuration
- **QUICK_START_GUIDE.md**: Quick testing guide for all features
- **backend/README.md**: Backend-specific documentation

---

## 🎓 Project Team

**Project**: EduNexa LMS - AI-Integrated Learning Management System  
**Institution**: Data Management Systems  
**Purpose**: Educational platform for modern learning

---

## 📄 License

This project is licensed under the MIT License.

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Status**: Production Ready

---

## 🎉 Getting Started Checklist

- [ ] Install Python 3.8+
- [ ] Install Node.js 16+
- [ ] Install MongoDB
- [ ] Clone repository
- [ ] Setup backend (install dependencies, configure .env)
- [ ] Setup frontend (install dependencies, configure .env)
- [ ] Start MongoDB
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Login with test credentials
- [ ] Test core features
- [ ] Review documentation
- [ ] Ready for development!

---

**For any questions or support, please refer to the documentation files or contact the development team.**
