# Complete Google OAuth Login Setup Guide

## Overview
This guide will help you implement Google OAuth login/signup in your EduNexa LMS application.

## Backend Setup Complete ✅

The backend has been configured with:
- Google OAuth route at `/api/auth/google/login`
- Token verification and user creation/login logic
- Support for both new user registration and existing user login

## What You Need To Do

### 1. Install Backend Dependencies

```bash
cd backend
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

### 2. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API** or **Google Identity Services**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen:
   - Add your app name: "EduNexa LMS"
   - Add your email
   - Add authorized domains if needed
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: "EduNexa Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:5173`
     - `http://localhost:5000/api/auth/google/callback`
7. Copy your **Client ID** and **Client Secret**

### 3. Update Environment Variables

Edit `backend/.env` and replace the placeholder values:

```env
GOOGLE_CLIENT_ID=your-actual-client-id-from-google-console.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret-from-google-console
```

### 4. Add Google Script to Frontend

Edit `index.html` in your project root and add this script in the `<head>` section:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EduNexa LMS</title>
    
    <!-- Google Sign-In Script -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 5. Create Environment Variable for Frontend

Create or edit `.env` in your project root (not in backend folder):

```env
VITE_GOOGLE_CLIENT_ID=your-actual-client-id-from-google-console.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:5000/api
```

### 6. Update LoginForm Component

The `GoogleLoginButton` component has been created. Now update `src/components/auth/LoginForm.tsx`:

Add this import at the top:
```typescript
import { GoogleLoginButton } from './GoogleLoginButton';
```

Replace the Google button in the Social Login section with:
```typescript
<GoogleLoginButton role={selectedRole} />
```

The Facebook button can be disabled (already done in the code).

## How It Works

1. **User clicks Google button** → Google Sign-In popup appears
2. **User authenticates** → Google returns an ID token (credential)
3. **Frontend sends token** → POST to `/api/auth/google/login`
4. **Backend verifies token** → Validates with Google servers
5. **Backend checks user**:
   - If user exists → Login
   - If new user → Create account with Google info
6. **Backend returns JWT** → Access and refresh tokens
7. **User is logged in** → Redirected to dashboard

## Testing

1. Start backend:
```bash
cd backend
python app.py
```

2. Start frontend:
```bash
npm run dev
```

3. Go to `http://localhost:5173`
4. Click the Google button
5. Sign in with your Google account
6. You should be logged in automatically!

## Features

- ✅ Automatic user creation for new Google users
- ✅ Login for existing users
- ✅ Profile picture from Google
- ✅ Role selection (student/teacher)
- ✅ Secure token verification
- ✅ Same JWT authentication as regular login
- ✅ Works with existing user management

## Troubleshooting

### "Google Sign-In not loaded"
- Make sure the Google script is added to `index.html`
- Check browser console for errors
- Verify the script URL is correct

### "Invalid Google token"
- Check that `GOOGLE_CLIENT_ID` in `.env` matches your Google Console
- Verify the Client ID is for a Web application
- Make sure authorized origins are configured correctly

### "User not created"
- Check backend logs for errors
- Verify MongoDB is running
- Check that all required fields are being sent

### Button doesn't work
- Open browser console (F12)
- Check for JavaScript errors
- Verify `GoogleLoginButton` component is imported correctly

## Security Notes

- ✅ Token verification happens server-side
- ✅ Google ID is stored to prevent duplicate accounts
- ✅ Random secure password generated for Google users
- ✅ Same authentication flow as regular users
- ⚠️ Never commit `.env` files with real credentials
- ⚠️ Use environment variables in production

## Next Steps

After Google login works:
1. Test with multiple Google accounts
2. Test role switching (student/teacher)
3. Verify profile pictures load correctly
4. Test logout and re-login
5. Deploy to production with production credentials

## Production Deployment

For production:
1. Get production Google OAuth credentials
2. Add production URLs to authorized origins
3. Update environment variables
4. Use HTTPS for all URLs
5. Enable proper CORS settings
6. Monitor authentication logs

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs
3. Verify all environment variables are set
4. Test with demo accounts first
5. Ensure MongoDB is running

---

**Files Modified:**
- ✅ `backend/routes/auth.py` - Added Google OAuth route
- ✅ `backend/.env` - Added Google credentials (placeholders)
- ✅ `src/config/api.ts` - Added Google login endpoint
- ✅ `src/contexts/AuthContext.tsx` - Added googleLogin method
- ✅ `src/components/auth/GoogleLoginButton.tsx` - Created new component

**Ready to use after completing steps 1-6 above!**
