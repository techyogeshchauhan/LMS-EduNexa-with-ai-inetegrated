# Token Expiration and Session Management

This document explains the token expiration and session management features implemented in the EduNexa LMS.

## Overview

The system now includes comprehensive token expiration handling to improve security:

- **Access tokens expire in 2 hours** (reduced from 24 hours)
- **Refresh tokens expire in 7 days**
- **Automatic token refresh** when access tokens expire
- **Session invalidation** when server restarts
- **Token blacklisting** for secure logout
- **Periodic token validation** every 5 minutes

## Backend Features

### 1. Token Configuration
- Access tokens: 2 hours expiration
- Refresh tokens: 7 days expiration
- Server restart invalidates all existing tokens

### 2. New Authentication Endpoints

#### POST `/api/auth/logout`
Logs out the current session and blacklists the access token.

#### POST `/api/auth/logout-all`
Logs out from all devices by invalidating all refresh tokens for the user.

#### POST `/api/auth/refresh`
Refreshes the access token using a valid refresh token.
```json
{
  "refresh_token": "your_refresh_token_here"
}
```

#### GET `/api/auth/validate-token`
Validates the current access token and returns expiration info.

#### POST `/api/auth/cleanup-tokens` (Admin only)
Manually triggers cleanup of expired tokens.

#### GET `/api/auth/token-stats` (Admin only)
Returns statistics about active/expired tokens.

### 3. Token Security Features

- **Blacklist Management**: Revoked tokens are stored in memory (use Redis in production)
- **Server Restart Protection**: Tokens issued before server restart are automatically invalid
- **Database Cleanup**: Expired tokens are automatically cleaned up
- **Refresh Token Rotation**: New refresh tokens are issued on each refresh

## Frontend Features

### 1. Automatic Token Management

The `ApiClient` class automatically:
- Detects expired access tokens
- Refreshes tokens before making API calls
- Handles token refresh failures gracefully
- Emits events when tokens can't be refreshed

### 2. Token Expiration Warning

The `TokenExpirationWarning` component shows a notification when the session is about to expire:
- Appears 5 minutes before token expiration
- Allows users to extend their session
- Can be dismissed temporarily
- Automatically refreshes tokens when requested

### 3. Authentication Context

The `AuthContext` provides:
- Automatic token validation every 5 minutes
- Graceful handling of token expiration
- User logout when tokens become invalid
- Token refresh functionality

### 4. Custom Hooks

#### `useTokenExpiration(warningThresholdMinutes)`
Returns information about token expiration:
```typescript
const { isExpiringSoon, timeUntilExpiration, shouldRefresh } = useTokenExpiration(5);
```

#### `useFormattedTimeUntilExpiration(timeUntilExpiration)`
Formats time until expiration in a human-readable format:
```typescript
const formattedTime = useFormattedTimeUntilExpiration(timeUntilExpiration);
// Returns: "4m 32s" or "45s"
```

## Usage Examples

### Login with Token Storage
```typescript
import { authAPI } from '../config/api';

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await authAPI.login(email, password);
    // Tokens are automatically stored in localStorage
    console.log('Login successful:', response.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Logout from Current Device
```typescript
import { useAuth } from '../contexts/AuthContext';

const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // User is logged out and tokens are cleared
};
```

### Logout from All Devices
```typescript
import { useAuth } from '../contexts/AuthContext';

const { logoutAll } = useAuth();

const handleLogoutAll = async () => {
  await logoutAll();
  // User is logged out from all devices
};
```

### Manual Token Refresh
```typescript
import { authAPI } from '../config/api';

const handleRefreshToken = async () => {
  try {
    await authAPI.refreshToken();
    console.log('Token refreshed successfully');
  } catch (error) {
    console.error('Token refresh failed:', error);
    // User will be logged out automatically
  }
};
```

## Security Considerations

### Production Recommendations

1. **Use Redis for Token Blacklist**: Replace in-memory blacklist with Redis
2. **Secure Token Storage**: Consider using httpOnly cookies instead of localStorage
3. **Rate Limiting**: Implement rate limiting on auth endpoints
4. **Token Encryption**: Encrypt refresh tokens in database
5. **Audit Logging**: Log all authentication events

### Environment Variables

Add these to your `.env` file:
```env
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ACCESS_TOKEN_EXPIRES=2h
JWT_REFRESH_TOKEN_EXPIRES=7d
```

## Monitoring and Maintenance

### Token Cleanup
The system automatically cleans up expired tokens on server startup. For production:

1. Set up a cron job to run token cleanup periodically
2. Monitor token statistics using the admin endpoints
3. Set up alerts for unusual token activity

### Database Indexes
Create indexes for better performance:
```javascript
// MongoDB indexes
db.refresh_tokens.createIndex({ "user_id": 1, "is_active": 1 })
db.refresh_tokens.createIndex({ "expires_at": 1 })
db.password_resets.createIndex({ "expires_at": 1 })
```

## Troubleshooting

### Common Issues

1. **"Token has expired" errors**: Check if automatic refresh is working
2. **Infinite refresh loops**: Ensure refresh token is valid and not expired
3. **Session lost after server restart**: This is expected behavior for security
4. **Token warning not showing**: Check if `TokenExpirationWarning` component is rendered

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

This will log token refresh attempts and validation failures to the console.