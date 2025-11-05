# Teacher Assignment Management Guide

## Overview
Complete assignment management system for teachers with submission tracking, grading, and notifications.

## Features Implemented

### 1. **Assignment Dashboard**
- View all assignments created by teacher
- See submission counts for each assignment
- Quick access to review submissions
- Course-wise assignment organization

### 2. **Submission Management**
- View all student submissions for each assignment
- See student details (name, roll number, email)
- View submission content (text + files)
- Track submission timestamps
- Filter by graded/pending status

### 3. **Grading System**
- Grade each submission individually
- Provide detailed feedback to students
- Edit grades and feedback after initial grading
- Automatic notification to students when graded
- Grade validation (0 to max_points)

### 4. **Notifications**
- Teacher receives notification when student submits assignment
- Student receives notification when assignment is graded
- Real-time notification updates
- Notification includes grade and feedback

### 5. **Statistics**
- Total submissions count
- Graded vs pending submissions
- Assignment completion tracking
- Student performance overview

## How to Use

### For Teachers:

#### Step 1: Access Assignment Dashboard
1. Login as teacher
2. Navigate to "Assignments" from sidebar
3. View all your assignments with submission counts

#### Step 2: Review Submissions
1. Click "View Submissions" on any assignment
2. See list of all student submissions
3. View submission details:
   - Student information
   - Submission content
   - Submission timestamp
   - Current status (pending/graded)

#### Step 3: Grade Submissions
1. Click "Grade" button on any submission
2. Enter grade (0 to max_points)
3. Provide feedback (optional but recommended)
4. Click "Submit Grade"
5. Student receives automatic notification

#### Step 4: Edit Grades
1. Click "Edit Grade" on graded submissions
2. Update grade or feedback
3. Save changes
4. Student receives updated notification

### For Students:

#### Step 1: Submit Assignment
1. Login as student
2. Go to course details or assignments page
3. Click "Submit" on pending assignment
4. Fill in text content and/or upload file
5. Click "Submit Assignment"
6. Teacher receives notification

#### Step 2: Check Grade
1. View assignment status (changes to "Submitted")
2. Wait for teacher to grade
3. Receive notification when graded
4. View grade and feedback

## API Endpoints Used

### Teacher Endpoints:
- `GET /api/assignments/` - Get all assignments
- `GET /api/assignments/{id}` - Get assignment with submissions
- `POST /api/assignments/submissions/{id}/grade` - Grade submission

### Student Endpoints:
- `GET /api/assignments/` - Get enrolled course assignments
- `POST /api/assignments/{id}/submit` - Submit assignment

### Notification Endpoints:
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/{id}/read` - Mark as read

## Test Credentials

### Teacher Account:
- Email: `teacher01@datams.edu`
- Password: `Teach@2025`
- Role: teacher

### Student Accounts:
- Email: `student01@datams.edu`
- Password: `Stud@2025`
- Role: student

- Email: `student02@datams.edu`
- Password: `Stud@2025`
- Role: student

## Testing Workflow

### Complete Test Scenario:

1. **Student Submits Assignment**
   - Login as student01@datams.edu
   - Navigate to assignments
   - Submit an assignment
   - Verify success message
   - Check status changes to "Submitted"

2. **Teacher Receives Notification**
   - Login as teacher01@datams.edu
   - Check notifications (bell icon)
   - See "New Assignment Submission" notification
   - Click notification to view submission

3. **Teacher Grades Assignment**
   - Go to Assignments page
   - Click "View Submissions" on assignment
   - See student01's submission
   - Click "Grade" button
   - Enter grade (e.g., 85/100)
   - Add feedback (e.g., "Good work! Improve on...")
   - Submit grade

4. **Student Receives Grade Notification**
   - Login back as student01@datams.edu
   - Check notifications
   - See "Assignment Graded" notification
   - View grade and feedback
   - Check assignment status is "Graded"

## Database Collections

### submissions
```javascript
{
  _id: ObjectId,
  assignment_id: String,
  student_id: String,
  course_id: String,
  text_content: String,
  file_path: String,
  file_name: String,
  submitted_at: DateTime,
  status: String, // 'submitted' or 'graded'
  grade: Number,
  feedback: String,
  graded_at: DateTime,
  graded_by: String
}
```

### notifications
```javascript
{
  _id: ObjectId,
  user_id: String,
  title: String,
  message: String,
  type: String, // 'info', 'success', 'warning', 'error'
  link: String,
  read: Boolean,
  created_at: DateTime,
  read_at: DateTime
}
```

## UI Components

### TeacherAssignmentView.tsx
- Main teacher assignment management interface
- Submission listing and details
- Grading modal
- Statistics dashboard

### CourseDetailPage.tsx
- Student assignment submission interface
- Assignment listing
- Submission modal
- Status tracking

### Toast.tsx
- Success/error notifications
- Auto-dismiss after 5 seconds
- Closeable manually

## Features Summary

✅ Teacher can view all assignments
✅ Teacher can see submission counts
✅ Teacher can view individual submissions
✅ Teacher can grade submissions
✅ Teacher can provide feedback
✅ Teacher can edit grades
✅ Teacher receives notifications on new submissions
✅ Student can submit assignments
✅ Student receives notifications when graded
✅ Real-time status updates
✅ File upload support
✅ Validation and error handling
✅ Responsive design

## Next Steps (Optional Enhancements)

1. Bulk grading for multiple submissions
2. Grade distribution analytics
3. Late submission handling
4. Plagiarism detection
5. Assignment templates
6. Rubric-based grading
7. Peer review system
8. Assignment versioning
9. Export grades to CSV
10. Email notifications

## Support

For issues or questions:
- Check browser console for errors
- Verify backend is running on port 5000
- Verify frontend is running on port 5175
- Check MongoDB connection
- Review API response in Network tab