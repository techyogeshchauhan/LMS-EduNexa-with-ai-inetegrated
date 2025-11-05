# Quick Start Guide - Assignment Management System

## 🚀 System Status

### Servers Running:
- ✅ Backend: `http://localhost:5000`
- ✅ Frontend: `http://localhost:5174`

## 📝 Test Credentials

### Teacher Account:
```
Email: teacher01@datams.edu
Password: Teach@2025
Role: teacher
```

### Student Accounts:
```
Student 1:
Email: student01@datams.edu
Password: Stud@2025
Role: student

Student 2:
Email: student02@datams.edu
Password: Stud@2025
Role: student

Student 3:
Email: student03@datams.edu
Password: Stud@2025
Role: student
```

## 🧪 Testing Steps

### Test 1: Student Assignment Submission

1. **Login as Student**
   - Go to: `http://localhost:5174`
   - Login with: `student01@datams.edu` / `Stud@2025`
   - Select role: `student`

2. **Navigate to Assignments**
   - Option A: Click "Assignments" in sidebar
   - Option B: Go to test page: `http://localhost:5174/test/assignments`

3. **Submit Assignment**
   - Find an assignment with "Pending" status
   - Click "Submit" or "Test Submit" button
   - Fill in text content (required)
   - Optionally upload a file
   - Click "Submit Assignment"

4. **Verify Submission**
   - ✅ Success toast should appear
   - ✅ Status should change to "Submitted"
   - ✅ Button should change to "View"
   - ✅ Submission timestamp should appear

### Test 2: Teacher Receives Notification

1. **Logout from Student Account**
   - Click profile icon → Logout

2. **Login as Teacher**
   - Login with: `teacher01@datams.edu` / `Teach@2025`
   - Select role: `teacher`

3. **Check Notifications**
   - Click bell icon (🔔) in top right
   - Should see: "New Assignment Submission"
   - Notification should show student name and assignment title

4. **View Assignments**
   - Click "Assignments" in sidebar
   - Should see list of all assignments
   - Should see submission count for each assignment

### Test 3: Teacher Grades Assignment

1. **Open Assignment Details**
   - Click "View Submissions" on any assignment
   - Should see list of all student submissions

2. **Review Submission**
   - See student details (name, roll number, email)
   - See submission content (text + file)
   - See submission timestamp
   - See current status (Pending Review)

3. **Grade the Submission**
   - Click "Grade" button
   - Enter grade (e.g., 85)
   - Enter feedback (e.g., "Good work! Keep it up!")
   - Click "Submit Grade"

4. **Verify Grading**
   - ✅ Success toast should appear
   - ✅ Status should change to "Graded"
   - ✅ Grade should display on submission card
   - ✅ Feedback should be visible

### Test 4: Student Receives Grade Notification

1. **Logout from Teacher Account**

2. **Login as Student Again**
   - Login with: `student01@datams.edu` / `Stud@2025`

3. **Check Notifications**
   - Click bell icon (🔔)
   - Should see: "Assignment Graded"
   - Notification should show grade and percentage

4. **View Grade**
   - Go to Assignments page
   - Assignment status should be "Graded"
   - Should see grade (e.g., 85/100)
   - Should see feedback from teacher

## 🎯 Quick Test URLs

### For Students:
- Dashboard: `http://localhost:5174/dashboard`
- Assignments: `http://localhost:5174/assignments`
- Test Page: `http://localhost:5174/test/assignments`
- Course Details: `http://localhost:5174/courses/detail`

### For Teachers:
- Dashboard: `http://localhost:5174/dashboard`
- Assignments: `http://localhost:5174/assignments`
- Test Page: `http://localhost:5174/test`

### For Everyone:
- Quick Test: `http://localhost:5174/test`
- Notifications: `http://localhost:5174/notifications`

## ✅ Expected Results

### After Student Submission:
- ✅ Assignment status: pending → submitted
- ✅ Teacher gets notification
- ✅ Submission appears in teacher's view
- ✅ Submission timestamp recorded

### After Teacher Grading:
- ✅ Submission status: submitted → graded
- ✅ Student gets notification
- ✅ Grade visible to student
- ✅ Feedback visible to student

## 🔧 Troubleshooting

### If page doesn't load:
1. Check if both servers are running
2. Clear browser cache (Ctrl + Shift + R)
3. Check browser console for errors (F12)

### If login fails:
1. Verify credentials are correct
2. Check backend is running on port 5000
3. Check MongoDB is running

### If assignment submission fails:
1. Make sure you're logged in as student
2. Check if text content is filled
3. Check browser console for errors
4. Verify backend API is accessible

### If notifications don't appear:
1. Refresh the page
2. Click the bell icon to open notifications
3. Check if backend notification route is working

## 📊 Features to Test

### Student Features:
- [ ] Login as student
- [ ] View assignments list
- [ ] Submit assignment with text
- [ ] Submit assignment with file
- [ ] View submission status
- [ ] Receive grade notification
- [ ] View grade and feedback

### Teacher Features:
- [ ] Login as teacher
- [ ] View all assignments
- [ ] See submission counts
- [ ] View individual submissions
- [ ] Grade submissions
- [ ] Provide feedback
- [ ] Edit grades
- [ ] Receive submission notifications

### System Features:
- [ ] Real-time status updates
- [ ] Toast notifications
- [ ] File upload validation
- [ ] Due date warnings
- [ ] Responsive design
- [ ] Error handling

## 🎉 Success Criteria

System is working correctly if:
1. ✅ Student can submit assignments
2. ✅ Teacher receives notifications
3. ✅ Teacher can view submissions
4. ✅ Teacher can grade submissions
5. ✅ Student receives grade notifications
6. ✅ All status updates work in real-time
7. ✅ No console errors
8. ✅ UI is responsive and user-friendly

## 📞 Support

If you encounter any issues:
1. Check this guide first
2. Review browser console (F12)
3. Check Network tab for API errors
4. Verify both servers are running
5. Check MongoDB connection

---

**System Ready!** 🚀 Start testing from Test 1 above.