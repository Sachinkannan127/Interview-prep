# Firebase Integration Setup Guide

Your application already has Firebase integration built-in! Here's how to enable it:

## 🔥 Current Status

The backend is currently running with **in-memory storage** (data resets on restart). To enable **persistent Firebase storage**, follow these steps:

## 📋 Step-by-Step Setup

### 1. Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/project/seigai-a9256/settings/serviceaccounts/adminsdk)
2. Click **Generate new private key**
3. Click **Generate key** in the confirmation dialog
4. Save the downloaded JSON file

### 2. Add Credentials to Backend

**Option A: Local Development (Recommended)**
1. Rename the downloaded file to `firebase-credentials.json`
2. Copy it to: `s:\pro\Interview-prep\backend\firebase-credentials.json`
3. Restart your backend server

**Option B: Environment Variable (Production)**
1. Open the downloaded JSON file
2. Copy the entire contents
3. Set environment variable:
   ```bash
   FIREBASE_CREDENTIALS='{"type":"service_account",...}'
   ```

### 3. Update Backend .env (if needed)

Make sure your `backend/.env` has:
```env
FIREBASE_PROJECT_ID=seigai-a9256
```

### 4. Restart Backend Server

```bash
cd backend
python main.py
```

You should see:
```
✅ Firebase initialized successfully - Database connected
```

## ✅ What Firebase Stores

Once enabled, Firebase will automatically store:

### 📊 Collections Created:

1. **users**
   - User profiles
   - Authentication data
   - User preferences
   - Last active timestamps

2. **interviews**
   - Interview sessions
   - Configuration (type, difficulty, duration)
   - Q&A transcript
   - Scores and feedback
   - Start/end timestamps

3. **practice_sessions**
   - Practice question sessions
   - Individual question attempts
   - Performance metrics
   - Time spent per question
   - Answer evaluations

### 🔄 Data Flow:

```
Frontend (React) → Firebase Auth → Get User Token
                       ↓
Backend API → Verify Token → Firebase Firestore
                       ↓
            Store/Retrieve Data → Return to Frontend
```

## 🔐 Security

The service account credentials allow:
- ✅ Full read/write to Firestore database
- ✅ User authentication verification
- ✅ Secure server-side operations
- ❌ Users can't directly access sensitive data

### Firestore Security Rules

Make sure your Firestore rules allow authenticated access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Interviews - users can only access their own
    match /interviews/{interviewId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Practice sessions - users can only access their own
    match /practice_sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

## 🧪 Verify Integration

1. **Start backend** and check logs for: `✅ Firebase initialized successfully`
2. **Login** to your app at `http://localhost:5173`
3. **Start an interview** - data will be saved to Firestore
4. **Check Firebase Console**: [Firestore Database](https://console.firebase.google.com/project/seigai-a9256/firestore/databases)
5. You should see `interviews` and `practice_sessions` collections

## 🚨 Troubleshooting

### Error: "Firebase not initialized, using in-memory storage"
- **Cause**: Missing or invalid credentials
- **Fix**: Follow steps 1-3 above

### Error: "Invalid token"
- **Cause**: Frontend Firebase config mismatch
- **Fix**: Verify `.env` in frontend matches Firebase project

### Error: "Permission denied"
- **Cause**: Firestore security rules too strict
- **Fix**: Update rules in Firebase Console → Firestore → Rules

## 📁 File Structure

```
backend/
├── firebase-credentials.json          # Your service account key (gitignored)
├── firebase-credentials.json.example  # Template
├── app/
│   └── services/
│       └── firebase_service.py        # Firebase integration (already done!)
└── .env                               # Firebase project ID
```

## 🎉 Benefits of Firebase Integration

✅ **Persistent Storage** - Data survives server restarts
✅ **Real-time Sync** - Changes sync across devices
✅ **Scalable** - Handles millions of users
✅ **Secure** - Built-in authentication
✅ **Analytics** - Track usage in Firebase Console
✅ **Backup** - Automatic backups available
✅ **Free Tier** - Generous limits for development

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/project/seigai-a9256)
- [Firestore Database](https://console.firebase.google.com/project/seigai-a9256/firestore)
- [Authentication](https://console.firebase.google.com/project/seigai-a9256/authentication)
- [Service Accounts](https://console.firebase.google.com/project/seigai-a9256/settings/serviceaccounts/adminsdk)

## 💡 Quick Test

```bash
# In backend directory
python -c "from app.services.firebase_service import firebase_service; print('Initialized:', firebase_service.initialized)"
```

Should output: `Initialized: True`

---

**Need Help?** Check the backend logs or Firebase Console for detailed error messages.
