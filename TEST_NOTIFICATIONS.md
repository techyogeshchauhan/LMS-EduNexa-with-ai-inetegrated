# Testing the Notification System

## Quick Start Guide

### 1. Start the Backend
```bash
cd backend
python app.py
```

The server should start on `http://localhost:5000`

### 2. Start the Frontend
```bash
npm run dev
```

The frontend should start on `http://localhost:5173`

### 3. Login to the Application
- Use your existing credentials
- Or create a new account

### 4. Create Test Notifications

#### Option A: Using Browser Console
After logging in, open the browser console (F12) and run:

```javascript
fetch('http://localhost:5000/api/notifications/test', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Created notifications:', data);
  alert('Test notifications created! Check the header and sidebar badges.');
  // Refresh the page to see the badges
  setTimeout(() => window.location.reload(), 1000);
});
```

#### Option B: Using curl
```bash
# Replace YOUR_TOKEN with your actual JWT token from localStorage
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Verify the Features

#### ✅ Check Header Badges
- Look at the top-right corner
- You should see a red badge with "4" on the bell icon
- The badge should only appear when there are unread notifications

#### ✅ Check Sidebar Badges
- Look at the left sidebar
- The "Notifications" menu item should show a red badge with "4"
- Other items (Assignments, Discussions) show "0" or no badge

#### ✅ Visit Notifications Page
1. Click on the bell icon or "Notifications" in the sidebar
2. You should see 4 test notifications:
   - "New Assignment Posted" (info - blue)
   - "Quiz Graded" (success - green)
   - "Assignment Due Soon" (warning - yellow)
   - "Welcome to EduNexa!" (info - blue)

#### ✅ Mark as Read
1. Click the checkmark icon on any notification
2. Watch the badge count decrease
3. The notification background changes from colored to white

#### ✅ Mark All as Read
1. Click the "Mark All as Read" button at the top
2. All badges should disappear
3. All notifications turn white

#### ✅ Filter Notifications
1. Click the "Unread" tab
2. Only unread notifications appear
3. Click "All" to see everything again

#### ✅ Delete Notifications
1. Click the trash icon on any notification
2. The notification is removed
3. Badge count updates accordingly

#### ✅ Auto-Refresh
- Wait 30 seconds
- The badge counts refresh automatically
- No need to reload the page

### 6. Integration with Other Features

The notification system is ready to be integrated with other features:

#### Example: Create notification when assignment is graded
```python
# In backend/routes/assignments.py
from routes.notifications import create_notification

# After grading an assignment
create_notification(
    db=current_app.db,
    user_id=student_id,
    title='Assignment Graded',
    message=f'Your assignment "{assignment_title}" has been graded. Score: {grade}/100',
    notification_type='success',
    link=f'/assignments/detail?id={assignment_id}'
)
```

#### Example: Create notification for new course enrollment
```python
# In backend/routes/courses.py
from routes.notifications import create_notification

# After enrolling in a course
create_notification(
    db=current_app.db,
    user_id=user_id,
    title='Course Enrollment Successful',
    message=f'You have successfully enrolled in "{course_title}"',
    notification_type='success',
    link=f'/courses/detail?id={course_id}'
)
```

## Troubleshooting

### Badges not showing?
1. Check browser console for errors
2. Verify the backend is running
3. Check that you're logged in (JWT token exists)
4. Try creating test notifications again

### Notifications not updating?
1. The system auto-refreshes every 30 seconds
2. You can manually refresh the page
3. Check network tab for API call errors

### Backend errors?
1. Check MongoDB is running
2. Verify the notifications collection exists
3. Check backend console for error messages

## API Endpoints Reference

```
GET    /api/notifications                    - Get all notifications
GET    /api/notifications?unread_only=true   - Get only unread
POST   /api/notifications/:id/read           - Mark as read
POST   /api/notifications/read-all           - Mark all as read
DELETE /api/notifications/:id                - Delete notification
GET    /api/notifications/unread-count       - Get unread count
POST   /api/notifications/test               - Create test notifications
```

## Success Criteria

✅ Badges appear only when there are unread items  
✅ Badge counts are accurate  
✅ Clicking "Mark as Read" updates badges immediately  
✅ "Mark All as Read" clears all badges  
✅ Deleting notifications updates counts  
✅ Auto-refresh works (every 30 seconds)  
✅ Notifications page displays correctly  
✅ Filter tabs work (All/Unread)  
✅ Color coding by type works  
✅ Links navigate correctly  

## Next Steps

1. **Integrate with existing features**:
   - Add notifications when assignments are graded
   - Add notifications for new course materials
   - Add notifications for quiz results
   - Add notifications for discussion replies

2. **Enhance the system**:
   - Add real-time updates using WebSockets
   - Add email notifications
   - Add notification preferences
   - Add notification categories
   - Add push notifications

3. **Analytics**:
   - Track notification open rates
   - Monitor which notifications are most engaging
   - Optimize notification timing

Enjoy your new notification system! 🎉
