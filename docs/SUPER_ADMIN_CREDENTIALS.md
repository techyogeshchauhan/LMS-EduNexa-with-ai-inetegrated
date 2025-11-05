# Super Admin Access

## Overview
Super Admin accounts cannot be created through the registration endpoint. Only login is available for super admin users.

## Default Super Admin Credentials

**Email:** `superadmin@datams.edu`  
**Password:** `Admin@123456`

## Important Notes

1. **No Signup for Super Admin**: The registration endpoint (`/api/auth/register`) only accepts `student` and `teacher` roles. Any attempt to register with `super_admin` role will be rejected with an error.

2. **Login Only**: Super admin users can only login using the `/api/auth/login` endpoint with the credentials above.

3. **Database Initialization**: The super admin account is automatically created when the database is initialized for the first time.

4. **Google OAuth**: Google OAuth registration also restricts role creation to `student` and `teacher` only.

## Changes Made

### Backend Changes (`backend/routes/auth.py`)

1. **Registration Endpoint** - Updated valid roles:
   ```python
   valid_roles = ['student', 'teacher']  # Removed 'super_admin'
   ```

2. **Error Message** - Updated to be more specific:
   ```
   "Invalid role. Only student and teacher roles are allowed for registration"
   ```

3. **Removed Super Admin Registration Logic** - Removed the code block that handled super admin specific fields during registration.

4. **Google OAuth** - Added explicit comment to clarify only student/teacher roles are allowed.

## Security Recommendation

⚠️ **Important**: Change the default super admin password after first login for security purposes using the "Change Password" feature in the profile settings.
