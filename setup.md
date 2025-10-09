# EduNexa LMS - Complete Setup Guide

This guide will help you set up the complete EduNexa AI-Integrated Learning Management System with Flask backend and React frontend.

## 🏗️ Project Structure

```
project/
├── backend/                 # Flask Backend
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example       # Backend environment template
│   ├── routes/            # API routes
│   └── utils/             # Utilities and database init
├── src/                   # React Frontend
│   ├── components/        # React components
│   ├── contexts/         # React contexts
│   ├── config/           # API configuration
│   └── ...
├── .env.example          # Frontend environment template
├── package.json          # Frontend dependencies
└── setup.md             # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Python 3.8+** - [Download Python](https://python.org/downloads/)
2. **Node.js 16+** - [Download Node.js](https://nodejs.org/)
3. **MongoDB** - [Install MongoDB](https://docs.mongodb.com/manual/installation/)
4. **Google Gemini API Key** - [Get API Key](https://makersuite.google.com/app/apikey)

### Step 1: Clone and Setup Backend

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

# Install Python dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env    # Windows
cp .env.example .env      # macOS/Linux

# Edit .env file with your configuration
```

### Step 2: Configure Backend Environment

Edit `backend/.env` file:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/edunexa_lms

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production

# AI Configuration (Gemini API)
GEMINI_API_KEY=your-gemini-api-key-here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

### Step 3: Setup Frontend

```bash
# Navigate to project root (where package.json is)
cd ..

# Install Node.js dependencies
npm install

# Copy environment file
copy .env.example .env    # Windows
cp .env.example .env      # macOS/Linux
```

### Step 4: Configure Frontend Environment

Edit `.env` file in project root:

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

### Step 5: Start MongoDB

Make sure MongoDB is running:

```bash
# Windows (if installed as service)
net start MongoDB

# macOS (with Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Or run directly
mongod
```

### Step 6: Start Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment if not already active
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Start Flask server
python app.py
```

Backend will start on: `http://localhost:5000`

### Step 7: Start Frontend Development Server

```bash
# In a new terminal, navigate to project root
cd ..

# Start React development server
npm run dev
```

Frontend will start on: `http://localhost:5173`

## 🔐 Test Credentials

The system comes with pre-configured test accounts:

### Students
- **Email**: `student01@datams.edu` | **Password**: `Stud@2025`
- **Email**: `student02@datams.edu` | **Password**: `Stud@2025`
- **Email**: `student03@datams.edu` | **Password**: `Stud@2025`

### Teachers
- **Email**: `teacher01@datams.edu` | **Password**: `Teach@2025`
- **Email**: `teacher02@datams.edu` | **Password**: `Teach@2025`

### Admins
- **Email**: `admin@datams.edu` | **Password**: `Admin@2025`
- **Email**: `superadmin@datams.edu` | **Password**: `Admin@123456`

## 🎯 Features Overview

### For Students
- **Dashboard**: View enrolled courses, progress, and upcoming assignments
- **Courses**: Browse and enroll in available courses
- **Assignments**: Submit assignments and view grades
- **Quizzes**: Take quizzes with instant feedback
- **AI Assistant**: Get personalized learning help and recommendations
- **Analytics**: Track learning progress and performance

### For Teachers
- **Course Management**: Create and manage courses
- **Content Upload**: Add materials, assignments, and quizzes
- **Student Monitoring**: View student progress and performance
- **Grading**: Grade assignments and provide feedback
- **AI Tools**: Generate quizzes automatically from content
- **Analytics**: Detailed course and student analytics

### For Admins
- **User Management**: Manage students, teachers, and other admins
- **System Analytics**: Overall system performance and usage
- **Course Oversight**: Monitor all courses and activities
- **Bulk Operations**: Import users and manage system settings

### AI Features
- **Chatbot**: 24/7 AI assistant for learning support
- **Content Summarization**: Automatically summarize PDFs and documents
- **Quiz Generation**: Create quizzes from course content using AI
- **Personalized Recommendations**: Course and learning path suggestions
- **Learning Analytics**: AI-powered insights into learning patterns

## 🛠️ Development

### Backend Development

```bash
# Navigate to backend
cd backend

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install new dependencies
pip install package_name
pip freeze > requirements.txt

# Run with auto-reload
python app.py
```

### Frontend Development

```bash
# Install new dependencies
npm install package_name

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Management

```bash
# Connect to MongoDB
mongo

# Use the database
use edunexa_lms

# View collections
show collections

# View users
db.users.find().pretty()

# View courses
db.courses.find().pretty()
```

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGO_URI in backend/.env
   - Verify MongoDB is accessible on the specified port

2. **Backend Import Errors**
   - Activate virtual environment
   - Install missing dependencies: `pip install -r requirements.txt`

3. **Frontend Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version: `node --version` (should be 16+)

4. **API Connection Issues**
   - Verify backend is running on port 5000
   - Check VITE_API_BASE_URL in frontend .env
   - Ensure CORS is properly configured

5. **AI Features Not Working**
   - Verify GEMINI_API_KEY is set in backend/.env
   - Check API key validity
   - Ensure internet connection for AI API calls

### Logs and Debugging

- **Backend logs**: Check terminal where Flask is running
- **Frontend logs**: Check browser console (F12)
- **MongoDB logs**: Check MongoDB log files or terminal output

## 📚 API Documentation

The backend provides a comprehensive REST API. Key endpoints:

- **Authentication**: `/api/auth/*`
- **Courses**: `/api/courses/*`
- **Assignments**: `/api/assignments/*`
- **Quizzes**: `/api/quizzes/*`
- **Users**: `/api/users/*`
- **AI Features**: `/api/ai/*`
- **Analytics**: `/api/analytics/*`

For detailed API documentation, see `backend/README.md`.

## 🚀 Production Deployment

### Backend Deployment

1. Set environment to production
2. Use a production WSGI server (Gunicorn)
3. Set up MongoDB with authentication
4. Configure reverse proxy (Nginx)
5. Set up SSL certificates

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy the `dist` folder to a web server
3. Configure environment variables for production API URL

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check this setup guide
2. Review the troubleshooting section
3. Check existing issues in the repository
4. Create a new issue with detailed information

---

**Happy Learning with EduNexa LMS! 🎓✨**