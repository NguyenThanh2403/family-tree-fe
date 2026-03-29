# OAuth2 Authentication Implementation Guide

## Overview

This guide covers the complete OAuth2 implementation for Google and Facebook SSO integration, along with flexible username/email login support.

## ✅ Implemented Features

### 1. **Flexible Login System**
- Users can now login using either **username** OR **email** with the same password
- Backward compatible with existing username-only login
- Single endpoint handles both authentication methods

### 2. **OAuth2 Social Login**
- **Google OAuth2** integration
- **Facebook OAuth2** integration  
- Automatic user registration for new OAuth2 users
- Profile picture and user info synchronization

### 3. **CORS Configuration**
- Full CORS support for `localhost:3000` (React frontend)
- Supports all HTTP methods (GET, POST, PUT, DELETE, OPTIONS, PATCH)
- Credentials and custom headers enabled

## 🚀 Quick Start

### Step 1: Configure OAuth2 Providers

Update `src/main/resources/application.properties`:

```properties
# Google OAuth2 Setup
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET

# Facebook OAuth2 Setup  
spring.security.oauth2.client.registration.facebook.client-id=YOUR_FACEBOOK_APP_ID
spring.security.oauth2.client.registration.facebook.client-secret=YOUR_FACEBOOK_APP_SECRET
```

### Step 2: Get OAuth2 Credentials

#### Google OAuth2
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set redirect URI: `http://localhost:8080/login/oauth2/code/google`
6. Copy Client ID and Secret to application.properties

#### Facebook OAuth2  
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. Set redirect URI: `http://localhost:8080/login/oauth2/code/facebook`
5. Copy App ID and Secret to application.properties

### Step 3: Frontend Integration

```javascript
// Regular login (username or email)
const loginData = {
    loginIdentifier: "john@example.com", // or "john_doe"
    password: "password123"
};

fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
});

// Get OAuth2 login URLs
const googleUrl = await fetch('http://localhost:8080/api/v1/auth/oauth2/google')
    .then(res => res.json())
    .then(data => data.data);

// Redirect to OAuth2 provider
window.location.href = googleUrl;
```

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/login` | Login with username/email | `{loginIdentifier, password}` |
| POST | `/api/v1/auth/register` | Register new user | `{username, email, password, firstName, lastName}` |
| GET | `/api/v1/auth/oauth2/google` | Get Google OAuth2 URL | - |
| GET | `/api/v1/auth/oauth2/facebook` | Get Facebook OAuth2 URL | - |

### OAuth2 Flow

1. **Frontend** calls `/api/v1/auth/oauth2/{provider}` to get authorization URL
2. **Frontend** redirects user to the OAuth2 provider
3. **Provider** authenticates user and redirects to backend callback
4. **Backend** processes OAuth2 response and redirects to frontend with tokens
5. **Frontend** receives tokens in URL parameters and stores them

## 🔧 Technical Implementation

### Key Components

```
src/main/java/com/familytree/auth/
├── service/
│   ├── OAuth2UserService.java              # Handles OAuth2 user processing
│   ├── OAuth2UserInfo.java                 # Abstract OAuth2 user info
│   ├── GoogleOAuth2UserInfo.java           # Google-specific user info
│   ├── FacebookOAuth2UserInfo.java         # Facebook-specific user info
│   └── OAuth2UserInfoFactory.java          # Factory for OAuth2 providers
├── security/
│   ├── OAuth2AuthenticationSuccessHandler.java  # OAuth2 success handling
│   └── OAuth2AuthenticationFailureHandler.java  # OAuth2 failure handling
└── entity/
    └── User.java                           # Updated with OAuth2 fields
```

### Database Schema Changes

New fields added to `users` table:

```sql
ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN oauth_id VARCHAR(255);  
ALTER TABLE users ADD COLUMN picture_url TEXT;
```

### CORS Configuration

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    return source;
}
```

## 🧪 Testing

### Local Testing Setup

1. **Start the application**: 
   ```bash
   ./mvnw spring-boot:run
   ```

2. **Open test page**: 
   Open `oauth2-test.html` in browser at `http://localhost:3000` (serve via local web server)

3. **Test scenarios**:
   - Regular login with username
   - Regular login with email  
   - Google OAuth2 login
   - Facebook OAuth2 login
   - User registration

### Expected Behavior

**Regular Login Response:**
```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
    "tokenType": "Bearer",
    "userId": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "expiresIn": 600
  }
}
```

**OAuth2 Redirect URL:**
```
http://localhost:3000/oauth2/redirect?token=ACCESS_TOKEN&refreshToken=REFRESH_TOKEN&success=true
```

## 🚨 Security Features

### OAuth2 User Processing

1. **Email Validation**: OAuth2 users must have valid email
2. **Provider Consistency**: Users can't switch between OAuth2 providers
3. **Automatic Registration**: New OAuth2 users are automatically registered
4. **Profile Sync**: User profile updates from OAuth2 provider on each login

### Token Security

- JWT tokens work the same for OAuth2 and regular users
- Redis-based token blacklist for immediate logout
- 10-minute access token expiration
- 7-day refresh token expiration

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**: 
   - Ensure frontend runs on `localhost:3000`
   - Check browser developer tools for CORS-related errors

2. **OAuth2 Redirect Mismatch**:
   - Verify redirect URIs in OAuth2 provider settings
   - Check application.properties configuration

3. **Token Issues**:
   - Ensure tokens are stored correctly in frontend
   - Check Redis for blacklisted tokens: `redis-cli keys "token_blacklist:*"`

### Debug Logging

Add to application.properties for detailed OAuth2 logs:
```properties
logging.level.org.springframework.security.oauth2=DEBUG
logging.level.com.familytree.auth.service.OAuth2UserService=DEBUG
```

## 📋 Production Checklist

- [ ] Replace placeholder OAuth2 credentials with real ones
- [ ] Update redirect URIs for production domain
- [ ] Configure HTTPS for OAuth2 callbacks
- [ ] Set up proper error handling for OAuth2 failures
- [ ] Test all OAuth2 flows in production environment
- [ ] Monitor OAuth2 user registration and login metrics

## 🎯 Future Enhancements

- Add more OAuth2 providers (GitHub, Twitter, etc.)
- Implement OAuth2 account linking for existing users
- Add OAuth2 scope management for additional permissions
- Implement OAuth2 token refresh for long-lived sessions
