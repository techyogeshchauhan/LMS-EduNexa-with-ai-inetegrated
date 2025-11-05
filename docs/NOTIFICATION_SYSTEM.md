# Notification System Implementation

## Overview
Implemented a complete notification system with read/unread tracking that updates dynamically across the application.

## Features

### Backend (Python/Flask)
- **New Routes** (`backend/routes/notifications.py`):
  - `GET /api/notifications` - Get all notifications (with optional `unread_only` filter)
  - `POST /api/notifications/<id>/read` - Mark a notification as read
  - `POST /api/notifications/read-all` - Mark all notifications as read
  - `GET /api/notifications/unread-count` - Get count of unread notifications
  - `DELETE /api/notifications/<id>` - Delete a notification
  - `POST /api/notifications/test` - Create test notifications (for testing)

- **Helper Function**: `create_notification()` - Can be called from other routes to create notifications

### Frontend (React/TypeScript)

#### 1. **API Integration** (`src/config/api.ts`)
- Added `notificationsAPI` with methods for all notification operations
- Endpoints for fetching, marking as read, and deleting notifications

#### 2. **Header Component** (`src/components/layout/Header.tsx`)
- Shows unread notification count badge (only when > 0)
- Shows unread message count badge (only when > 0)
- Auto-refreshes every 30 seconds
- Badge displays "9+" for counts > 9

#### 3. **Sidebar Component** (`src/components/layout/StudentSidebar.tsx`)
- Dynamic badges for:
  - Notifications (unread count)
  - Discussions/Messages (unread count)
  - Assignments (pending count)
- Badges only appear when count > 0
- Auto-refreshes every 30 seconds

#### 4. **Notifications Page** (`src/pages/Notifications.tsx`)
- Full-featured notifications interface
- Filter tabs: "All" and "Unread"
- Mark individual notifications as read
- "Mark All as Read" button
- Delete individual notifications
- Color-coded by type (info, success, warning, error)
- Shows timestamp and optional links
- Empty states for no notifications

## How It Works

### Notification Badge Behavior
1. **Badges only appear when there are unread items**
2. **When you visit/read notifications:**
   - Click "Mark as Read" button → Badge count decreases
   - Click "Mark All as Read" → All badges disappear
   - Click a notification link → That notification is marked as read
3. **Auto-refresh:** Counts update every 30 seconds automatically

### Database Schema
```javascript
{
  user_id: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error',
  link: string (optional),
  read: boolean,
  created_at: datetime,
  read_at: datetime (optional)
}
```

## Testing

### Create Test Notifications
```bash
# Using curl (replace TOKEN with your JWT token)
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Or use the browser console:
```javascript
// After logging in
fetch('http://localhost:5000/api/notifications/test', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
}).then(r => r.json()).then(console.log);
```

## Integration with Other Features

To create notifications from other routes:

```python
from routes.notifications import create_notification

# In any route handler
create_notification(
    db=current_app.db,
    user_id=student_id,
    title='Assignment Graded',
    message=f'Your assignment "{assignment_title}" has been graded.',
    notification_type='success',
    link=f'/assignments/{assignment_id}'
)
```

## Future Enhancements
- Real-time notifications using WebSockets
- Push notifications
- Email notifications
- Notification preferences/settings
- Notification categories and filtering
- Bulk actions (delete all read, etc.)
