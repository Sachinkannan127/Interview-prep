# Firebase Setup Guide

## Overview
This guide will help you set up Firebase for your Interview Prep application to enable persistent data storage.

## Prerequisites
- Firebase account (https://firebase.google.com/)
- Node.js and Python installed
- Access to Firebase Console

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `interview-prep` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create Project"

## Step 2: Enable Firestore Database

1. In Firebase Console, go to "Build" → "Firestore Database"
2. Click "Create Database"
3. Choose location (closest to your users)
4. Start in **Production mode** or **Test mode**:
   - **Test mode**: Good for development (30 days access)
   - **Production mode**: Requires security rules

### Firestore Security Rules

Add these rules in the "Rules" tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Interviews collection - users can only access their own interviews
    match /interviews/{interviewId} {
      allow read, write: if request.auth != null && 
                          resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                    request.resource.data.userId == request.auth.uid;
    }
    
    // Practice sessions - users can only access their own sessions
    match /practice_sessions/{sessionId} {
      allow read, write: if request.auth != null && 
                          resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                    request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Step 3: Enable Authentication

1. Go to "Build" → "Authentication"
2. Click "Get Started"
3. Enable authentication providers:
   - **Email/Password**: Click "Enable" toggle
   - **Google** (optional): Add OAuth 2.0 credentials
4. Save changes

## Step 4: Get Firebase Credentials

### For Frontend (Web App)

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Web" icon (</>) to add web app
4. Register app with nickname: "Interview Prep Frontend"
5. Copy the config object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc..."
};
```

6. Create `.env` file in `frontend/` folder:

```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc...
```

### For Backend (Admin SDK)

1. In Firebase Console, go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `firebase-credentials.json` in `backend/` folder
4. **IMPORTANT**: Add `firebase-credentials.json` to `.gitignore`

Example `firebase-credentials.json` structure:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-...@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

5. Create `.env` file in `backend/` folder (if not exists):

```bash
# Firebase Admin SDK
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemma-3-27b-it

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
ENVIRONMENT=development
```

## Step 5: Verify Setup

### Test Frontend Connection

The frontend Firebase configuration is in `frontend/src/services/firebase.ts`. It automatically reads from environment variables.

### Test Backend Connection

1. Start the backend:
   ```bash
   cd backend
   python main.py
   ```

2. Check logs for:
   ```
   INFO: Firebase initialized successfully
   ```

3. If you see:
   ```
   Info: Mock Firebase credentials detected
   ```
   Then Firebase credentials are not properly configured.

## Step 6: Database Collections

The application uses these Firestore collections:

### 1. `users` Collection
```javascript
{
  userId: "firebase_auth_uid",
  email: "user@example.com",
  displayName: "John Doe",
  createdAt: "2024-01-01T00:00:00Z",
  lastLogin: "2024-01-15T10:30:00Z"
}
```

### 2. `interviews` Collection
```javascript
{
  id: "interview_uuid",
  userId: "firebase_auth_uid",
  interviewType: "technical",
  difficulty: "mid",
  company: "Google",
  role: "Software Engineer",
  questions: [...],
  responses: [...],
  metrics: {...},
  status: "completed",
  startedAt: "2024-01-15T10:00:00Z",
  completedAt: "2024-01-15T10:45:00Z"
}
```

### 3. `practice_sessions` Collection
```javascript
{
  id: "session_uuid",
  userId: "firebase_auth_uid",
  category: "DSA",
  difficulty: "mid",
  question: "...",
  answer: "...",
  evaluation: "...",
  score: 8.5,
  createdAt: "2024-01-15T11:00:00Z"
}
```

## Troubleshooting

### Error: "Mock Firebase credentials detected"
- **Solution**: Ensure `firebase-credentials.json` exists in `backend/` folder
- Verify file path in `.env`: `FIREBASE_CREDENTIALS_PATH=firebase-credentials.json`

### Error: "Permission denied" in Firestore
- **Solution**: Check Firestore security rules
- Ensure user is authenticated
- Verify `userId` matches `request.auth.uid`

### Error: "Firebase app not initialized"
- **Solution**: Check frontend `.env` file has all `VITE_FIREBASE_*` variables
- Restart Vite dev server: `npm run dev`

### Error: "Invalid credentials"
- **Solution**: Re-download service account key from Firebase Console
- Ensure JSON file is valid (check for formatting issues)

## Production Deployment

### Backend (Render)

1. Add Firebase credentials as environment variable:
   ```bash
   FIREBASE_CREDENTIALS=<paste entire JSON content>
   ```

2. Update `firebase_service.py` to read from environment variable

### Frontend (Vercel)

1. Add environment variables in Vercel dashboard:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

2. Redeploy the application

## Security Best Practices

1. **Never commit credentials** to git
   - Add to `.gitignore`:
     ```
     firebase-credentials.json
     .env
     .env.local
     ```

2. **Use environment-specific configs**
   - Development: Test mode Firestore
   - Production: Production mode with strict security rules

3. **Implement rate limiting** on API endpoints

4. **Enable Firebase App Check** for additional security

5. **Rotate credentials** periodically

## Testing

### Test Interview Creation

1. Start frontend and backend
2. Login to application
3. Create a new interview
4. Check Firestore Console → `interviews` collection
5. Verify document appears with correct `userId`

### Test Practice Session

1. Go to Practice page
2. Generate a question
3. Submit answer
4. Check Firestore Console → `practice_sessions` collection

## Support

- Firebase Documentation: https://firebase.google.com/docs
- Firestore Guides: https://firebase.google.com/docs/firestore
- Firebase Authentication: https://firebase.google.com/docs/auth

## Next Steps

After Firebase setup:
1. ✅ Test user authentication
2. ✅ Create sample interview
3. ✅ Verify data persists in Firestore
4. ✅ Test practice session storage
5. ✅ Configure backup rules
6. ✅ Set up Firebase monitoring

---

**Last Updated**: 2024
**Version**: 1.0
