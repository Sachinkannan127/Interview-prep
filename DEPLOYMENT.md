# Deployment Guide - AI Interview Prep Simulator

## Environment Variables Required

### Frontend (Vercel)
Add these to your Vercel project's Environment Variables:

```
VITE_FIREBASE_API_KEY=AIzaSyCmKXvrNT_t58EL4P5YyzRlEQtCwDghFo4
VITE_FIREBASE_AUTH_DOMAIN=seigai-a9256.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seigai-a9256
VITE_FIREBASE_STORAGE_BUCKET=seigai-a9256.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=31155161952
VITE_FIREBASE_APP_ID=1:31155161952:web:4064aac7ef96f480da2c05
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

### Backend (Render.com or similar)
Add these to your backend hosting environment variables:

```
GEMINI_API_KEY=your_actual_gemini_api_key
FIREBASE_PROJECT_ID=seigai-a9256
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
```

## Deployment Steps

### 1. Get Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy and save it securely

### 2. Setup Firebase Service Account (for backend)
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key (downloads a JSON file)
3. Upload this JSON file to your backend hosting (or use environment variables)

### 3. Deploy Frontend to Vercel
1. Push your code to GitHub
2. Go to Vercel dashboard → New Project
3. Import your GitHub repository
4. Set **Root Directory** to `frontend`
5. Add all environment variables listed above
6. Click **Deploy**

### 4. Deploy Backend to Render.com (or Railway/Fly.io)
1. Create new account on Render.com
2. Create new **Web Service**
3. Connect your GitHub repository
4. Set **Root Directory** to `backend`
5. Set **Build Command**: `pip install -r requirements.txt`
6. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Add all backend environment variables
8. Click **Deploy**

### 5. Update Frontend VITE_API_BASE_URL
1. After backend is deployed, copy the backend URL
2. Go to Vercel → Your Project → Settings → Environment Variables
3. Update `VITE_API_BASE_URL` with your backend URL
4. Redeploy frontend

### 6. Update CORS_ORIGINS in Backend
1. Go to your backend hosting → Environment Variables
2. Update `CORS_ORIGINS` with your Vercel frontend URL
3. Redeploy backend

## Testing Deployment

1. Open your Vercel frontend URL
2. Sign in with Google (Firebase Auth)
3. Start an interview
4. Verify AI generates questions (requires Gemini API key)
5. Submit answers and check AI feedback

## AI Features Enabled

✅ **AI Question Generation** - Gemini generates interview questions  
✅ **AI Answer Evaluation** - Gemini evaluates answers with scores  
✅ **AI Feedback** - Comprehensive feedback with strengths/improvements  
✅ **Model Answers** - AI provides ideal answers  
✅ **Adaptive Questions** - Follow-up questions based on previous answers  

## API Endpoints

- `POST /api/interviews/start` - Start interview (AI generates first question)
- `POST /api/interviews/{id}/answer` - Submit answer (AI evaluates and generates next question)
- `POST /api/interviews/{id}/finish` - Complete interview
- `GET /api/interviews/{id}/ai-feedback` - Get comprehensive AI feedback
- `GET /api/interviews/{id}` - Get interview details
- `GET /api/interviews` - Get user's interviews

## Local Development

### Backend:
```bash
cd backend
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

### Frontend:
```bash
cd frontend
npm run dev
```

## Troubleshooting

**Backend not working:**
- Check if Gemini API key is valid
- Verify Firebase credentials are correct
- Check CORS settings

**Frontend blank page:**
- Check browser console for errors
- Verify Firebase config values
- Ensure backend URL is correct

**AI features not working:**
- Verify Gemini API key is set
- Check backend logs for Gemini errors
- Ensure API key has quota remaining

## Support

For issues, check:
- Backend logs in Render.com/Railway
- Frontend logs in Vercel
- Browser console for frontend errors
