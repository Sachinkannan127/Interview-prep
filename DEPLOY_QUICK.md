# Quick Deployment Guide

## 🚀 Deploy to Production

### Prerequisites
- [x] Gemini API Key from https://makersuite.google.com/app/apikey
- [x] Firebase project setup
- [x] GitHub repository
- [x] Vercel account
- [x] Render.com account (or Railway/Fly.io)

### Step 1: Deploy Backend (5 minutes)

#### Option A: Render.com (Recommended - Free Tier)
1. Go to https://render.com and sign in
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `interview-prep-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   ```
   GEMINI_API_KEY=your_gemini_key
   FIREBASE_PROJECT_ID=seigai-a9256
   FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
   CORS_ORIGINS=http://localhost:5173
   ```
6. Click **Create Web Service**
7. Wait for deployment (2-3 minutes)
8. **Copy your backend URL** (e.g., `https://interview-prep-api.onrender.com`)

#### Option B: Railway.app (Alternative)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up
railway open
```

### Step 2: Deploy Frontend (3 minutes)

1. Go to https://vercel.com and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com
   VITE_FIREBASE_API_KEY=AIzaSyCmKXvrNT_t58EL4P5YyzRlEQtCwDghFo4
   VITE_FIREBASE_AUTH_DOMAIN=seigai-a9256.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=seigai-a9256
   VITE_FIREBASE_STORAGE_BUCKET=seigai-a9256.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=31155161952
   VITE_FIREBASE_APP_ID=1:31155161952:web:4064aac7ef96f480da2c05
   ```
6. Click **Deploy**
7. **Copy your frontend URL** (e.g., `https://interview-prep.vercel.app`)

### Step 3: Update CORS (2 minutes)

1. Go back to your backend hosting (Render.com)
2. Navigate to **Environment Variables**
3. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://interview-prep.vercel.app,http://localhost:5173
   ```
4. Click **Save** → Backend will auto-redeploy

### Step 4: Test Production (1 minute)

1. Open your frontend URL
2. Click **Sign In**
3. Authenticate with Google
4. Start an interview
5. Submit an answer
6. Verify AI feedback works

## ✅ Deployment Complete!

Your app is now live:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-api.onrender.com
- **Features**: Full AI-powered interview simulator

## 🔧 Local Development

Keep developing locally:

```bash
# Backend (Terminal 1)
cd backend
uvicorn main:app --reload --port 8001

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## 📊 Monitor Your App

### Render.com
- View logs: Dashboard → Your Service → Logs
- Monitor usage: Dashboard → Your Service → Metrics

### Vercel
- View logs: Dashboard → Your Project → Deployments → View Logs
- Analytics: Dashboard → Your Project → Analytics

## 🐛 Troubleshooting

**Backend fails to start:**
- Check Gemini API key is valid
- Verify environment variables are set
- Check logs for specific errors

**Frontend shows 404:**
- Verify `VITE_API_BASE_URL` points to backend
- Check backend CORS includes frontend URL
- Ensure backend is running

**AI features not working:**
- Verify Gemini API key has quota
- Check backend logs for API errors
- Test API endpoint: `https://your-backend.com/api/questions`

## 🎉 Next Steps

- [ ] Set up custom domain
- [ ] Add Firebase real credentials for persistence
- [ ] Enable Firebase Analytics
- [ ] Set up monitoring/alerts
- [ ] Add more interview types
- [ ] Implement admin dashboard

---

**Need help?** Check the logs or open an issue on GitHub.
