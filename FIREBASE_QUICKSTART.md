# Firebase Integration - Quick Setup

## 🎯 Your Application Already Has Firebase Integration!

The code is ready, you just need to add your Firebase service account credentials.

## ⚡ Quick Setup (3 Steps)

### Step 1: Download Firebase Credentials

1. Open: https://console.firebase.google.com/project/seigai-a9256/settings/serviceaccounts/adminsdk
2. Click **"Generate new private key"**
3. Click **"Generate key"** to download JSON file

### Step 2: Save Credentials

Save the downloaded file as:
```
s:\pro\Interview-prep\backend\firebase-credentials.json
```

### Step 3: Restart Backend

```bash
cd s:\pro\Interview-prep\backend
python main.py
```

Look for: `✅ Firebase initialized successfully - Database connected`

## ✅ That's It!

Your data is now stored in Firebase Firestore instead of memory!

## 📊 What Gets Stored

### Firestore Collections (Auto-created):

1. **`users`** - User profiles, preferences, last active
2. **`interviews`** - Interview sessions, transcripts, scores
3. **`practice_sessions`** - Practice questions, answers, performance

### Data Example:

```javascript
// Firestore Structure
seigai-a9256
├── users/
│   └── {userId}
│       ├── email: "user@example.com"
│       ├── name: "John Doe"
│       ├── createdAt: Timestamp
│       └── role: "user"
├── interviews/
│   └── {interviewId}
│       ├── userId: "abc123"
│       ├── config: {...}
│       ├── qa: [...]
│       ├── score: 85
│       └── status: "completed"
└── practice_sessions/
    └── {sessionId}
        ├── userId: "abc123"
        ├── questions: [...]
        ├── answers: [...]
        └── performance: {...}
```

## 🔍 Verify It's Working

### Method 1: Check Backend Logs
```
✅ Firebase initialized successfully - Database connected
```

### Method 2: Check Firebase Console
1. Go to: https://console.firebase.google.com/project/seigai-a9256/firestore
2. You should see `interviews` and `practice_sessions` collections after using the app

### Method 3: Run Test Command
```bash
cd backend
python -c "from app.services.firebase_service import firebase_service; print('✅ Firebase Active' if firebase_service.initialized else '❌ Using Mock Storage')"
```

## 🚀 Production Deployment

For Render/Vercel deployment, add environment variable:

```bash
# Instead of file, use environment variable
FIREBASE_CREDENTIALS={"type":"service_account","project_id":"seigai-a9256",...}
```

Copy the entire JSON content from your credentials file.

## 🔒 Security Notes

- ✅ `firebase-credentials.json` is gitignored (secure)
- ✅ Never commit credentials to Git
- ✅ Service account has admin access to your Firestore
- ✅ Frontend uses Firebase Auth tokens (secure)

## 📱 Frontend is Already Configured

Your frontend at `frontend/.env` is already set up:
```
VITE_FIREBASE_PROJECT_ID=seigai-a9256
VITE_FIREBASE_AUTH_DOMAIN=seigai-a9256.firebaseapp.com
```

No changes needed on frontend!

## 🆘 Problems?

**"Mock Firebase credentials detected"**
→ You're using mock file, download real credentials

**"Firebase not initialized"**
→ Check credentials file exists at correct path

**"Permission denied"**
→ Update Firestore security rules in Firebase Console

---

**Full Documentation**: See [FIREBASE_INTEGRATION.md](FIREBASE_INTEGRATION.md)
