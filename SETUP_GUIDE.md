# AI Interview Prep Simulator - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Firebase project
- Google Cloud project with Gemini API access
- Git

## Step 1: Firebase Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Enable Google
4. Enable Firestore Database:
   - Go to Firestore Database → Create database
   - Start in **test mode** (we'll deploy security rules later)
   - Choose your region
5. Enable Storage (for future PDF reports):
   - Go to Storage → Get Started

### Get Firebase Configuration

1. **Frontend Config (Web App)**:
   - Go to Project Settings → General → Your apps
   - Click "Add app" → Web (</> icon)
   - Register app and copy the config object
   
2. **Backend Config (Service Account)**:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `firebase-credentials.json` in backend directory

## Step 2: Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Save the key for environment configuration

## Step 3: Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd Interview-prep

# Frontend setup
cd frontend
npm install
cp .env.example .env
# Edit .env and add your Firebase config

# Backend setup
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your API keys
```

## Step 4: Configure Environment Variables

### Frontend `.env`

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:8000
```

### Backend `.env`

```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
CORS_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app
```

Place `firebase-credentials.json` in the backend directory.

## Step 5: Deploy Firestore Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project root
firebase init firestore
# Select your project
# Accept default firestore.rules location

# Deploy rules
firebase deploy --only firestore:rules
```

## Step 6: Run Locally

### Terminal 1 - Backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on http://localhost:8000

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on http://localhost:5173

## Step 7: Test the Application

1. Open http://localhost:5173
2. Sign up with email/password or Google
3. Configure an interview
4. Start practicing!

## Step 8: Deploy to Production

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import project from GitHub
4. Add environment variables in Vercel dashboard
5. Deploy

### Backend (Render)

1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Select `backend` directory as root
5. Set build command: `pip install -r requirements.txt`
6. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Add environment variables
8. Deploy

### Update CORS

After deploying frontend, update backend `.env`:

```env
CORS_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

And redeploy backend.

## Troubleshooting

### Firebase Admin SDK initialization fails
- Ensure `firebase-credentials.json` is in the correct location
- Check file permissions
- Verify FIREBASE_PROJECT_ID matches your project

### Gemini API errors
- Verify API key is correct
- Check API quotas in Google Cloud Console
- Ensure billing is enabled

### CORS errors
- Check CORS_ORIGINS includes your frontend URL
- Restart backend after changing .env

### Speech recognition not working
- Use Chrome/Edge browser (best compatibility)
- Allow microphone permissions
- HTTPS required in production

## Admin User Setup

To make a user admin:

1. User signs up normally
2. Go to Firebase Console → Firestore
3. Find the user document in `users` collection
4. Edit the document and set `role: "admin"`

## Next Steps

- Configure admin panel features
- Add more question categories
- Implement PDF report generation
- Add progress charts
- Set up monitoring and analytics

## Support

For issues, check:
- Browser console for frontend errors
- Backend terminal for API errors
- Firebase Console for auth/database issues
