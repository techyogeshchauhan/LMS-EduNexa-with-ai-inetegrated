# Google OAuth Setup Instructions

## Backend Setup

### 1. Install Required Python Packages
```bash
cd backend
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

### 2. Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** or **Google Identity Services**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add Authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://localhost:3000`
7. Add Authorized redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:5000/api/auth/google/callback`
8. Copy your **Client ID** and **Client Secret**

### 3. Update .env File
Replace the placeholder values in `backend/.env`:
```env
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-here
```

## Frontend Setup

### 1. Install Google OAuth Library
```bash
npm install @react-oauth/google
# or
yarn add @react-oauth/google
```

### 2. The frontend code has been updated to use Google OAuth

## Testing

1. Start the backend server:
```bash
cd backend
python app.py
```

2. Start the frontend:
```bash
npm run dev
```

3. Click the "Google" button on the login page
4. Sign in with your Google account
5. You'll be automatically logged in or registered

## How It Works

1. User clicks "Google" button
2. Google Sign-In popup appears
3. User authenticates with Google
4. Google returns an ID token
5. Frontend sends the token to backend `/api/auth/google/login`
6. Backend verifies the token with Google
7. Backend creates or logs in the user
8. Backend returns JWT tokens
9. User is logged in to the application

## Security Notes

- Never commit your `.env` file with real credentials
- Use environment variables in production
- The Google Client ID can be public, but keep the Client Secret private
- Tokens are verified server-side for security
