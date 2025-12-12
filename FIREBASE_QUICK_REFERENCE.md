# 🔥 Firebase Quick Reference

## Current Status
- ✅ Backend supports both Firebase Firestore and in-memory mock storage
- ✅ Automatically falls back to mock storage if Firebase not configured
- ✅ Frontend Firebase auth already configured
- ⚠️ Need Firebase credentials for persistent data storage

## Firebase Storage Modes

### 1. Mock Storage (Development)
- **Status**: Currently Active
- **Data Persistence**: In-memory (lost on server restart)
- **Setup Required**: None
- **Use Case**: Development, testing, quick prototyping

### 2. Firestore Storage (Production)
- **Status**: Ready to activate
- **Data Persistence**: Permanent (cloud database)
- **Setup Required**: Firebase credentials
- **Use Case**: Production, data persistence required

## How to Enable Firebase (3 Steps)

### Step 1: Create Firebase Project
```
1. Go to https://console.firebase.google.com/
2. Click "Add Project"
3. Name: "interview-prep"
4. Enable Firestore Database
5. Enable Authentication (Email/Password)
```

### Step 2: Get Credentials

**For Backend:**
```
1. Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as: backend/firebase-credentials.json
```

**For Frontend:**
```
1. Project Settings → Your Apps → Web
2. Copy config object
3. Add to frontend/.env as VITE_FIREBASE_* variables
```

### Step 3: Update .env Files

**backend/.env:**
```env
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
FIREBASE_PROJECT_ID=your-actual-project-id
```

**frontend/.env:**
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc...
```

## Backend Status Messages

### ✅ Success
```
✅ Firebase initialized successfully - Database connected
```
→ Firestore is active, data persists permanently

### ⚠️ Mock Mode
```
⚠ No Firebase credentials found
ℹ Backend will run with in-memory storage for development
```
→ Mock storage is active, data is temporary

### ❌ Error
```
⚠ Firebase initialization failed: [error details]
```
→ Check credentials file, project ID, and permissions

## Firestore Collections

Once Firebase is enabled, these collections will be created automatically:

### 1. `interviews`
```javascript
{
  id: "uuid",
  userId: "firebase_auth_uid",
  interviewType: "technical" | "behavioral" | "aptitude",
  difficulty: "entry" | "mid" | "senior",
  company: "Google",
  questions: [...],
  responses: [...],
  metrics: {...},
  status: "completed",
  createdAt: "timestamp"
}
```

### 2. `practice_sessions`
```javascript
{
  id: "uuid",
  userId: "firebase_auth_uid",
  category: "DSA" | "Aptitude",
  question: "...",
  answer: "...",
  evaluation: "...",
  score: 8.5,
  createdAt: "timestamp"
}
```

### 3. `users`
```javascript
{
  userId: "firebase_auth_uid",
  email: "user@example.com",
  displayName: "John Doe",
  createdAt: "timestamp",
  lastLogin: "timestamp"
}
```

## Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /interviews/{interviewId} {
      allow read, write: if request.auth != null && 
                          resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /practice_sessions/{sessionId} {
      allow read, write: if request.auth != null && 
                          resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == userId;
    }
  }
}
```

## Testing Firebase Integration

### 1. Check Backend Logs
```bash
cd backend
python main.py
# Look for: "✅ Firebase initialized successfully"
```

### 2. Create Test Interview
```bash
# In frontend:
1. Login to app
2. Create new interview
3. Complete interview
4. Check Firebase Console → Firestore → interviews collection
```

### 3. Verify Data Persistence
```bash
# Restart backend server
python main.py

# Check if interview history still shows in dashboard
# If yes → Firebase working
# If no → Still using mock storage
```

## Common Issues & Fixes

### Issue: "Mock Firebase credentials detected"
**Fix:** Ensure `firebase-credentials.json` contains real credentials, not placeholder values

### Issue: "Permission denied" errors
**Fix:** Update Firestore security rules, ensure user is authenticated

### Issue: "Project ID mismatch"
**Fix:** Verify `FIREBASE_PROJECT_ID` in .env matches credentials file

### Issue: "Invalid credentials"
**Fix:** Re-download credentials from Firebase Console, check JSON formatting

## Production Deployment

### Render/Railway (Backend)
```env
# Add environment variable:
FIREBASE_CREDENTIALS=<paste entire JSON content>
```

### Vercel/Netlify (Frontend)
```env
# Add all VITE_FIREBASE_* variables in dashboard
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Resources

- 📖 [Full Firebase Setup Guide](FIREBASE_SETUP.md)
- 🔗 [Firebase Console](https://console.firebase.google.com/)
- 📚 [Firebase Documentation](https://firebase.google.com/docs)
- 🔐 [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**Quick Check**: Run `python backend/main.py` and look for the Firebase initialization message. If you see ✅, you're connected to Firestore. If you see ⚠️, you're using mock storage.
