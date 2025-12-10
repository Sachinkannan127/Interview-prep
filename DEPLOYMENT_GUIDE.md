# Deployment Guide

This guide will help you deploy the Interview Prep Simulator to production.

## Prerequisites

- Node.js 18+ installed
- Python 3.11+ installed
- Firebase project set up
- Gemini API key from Google AI Studio
- GitHub account (for deployment)

## Backend Deployment (Render)

### 1. Prepare Firebase Credentials

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `firebase-credentials.json` in the backend directory
4. **IMPORTANT**: Add `firebase-credentials.json` to `.gitignore`

### 2. Set Up Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `interview-prep-api`
   - **Region**: Oregon (or closest to your users)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120`

### 3. Set Environment Variables on Render

Go to Environment tab and add:

```
ENVIRONMENT=production
GEMINI_API_KEY=your-actual-gemini-api-key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
CORS_ORIGINS=https://your-frontend-domain.vercel.app,https://www.your-domain.com
ALLOWED_HOSTS=interview-prep-api.onrender.com
PYTHON_VERSION=3.11.0
LOG_LEVEL=INFO
```

### 4. Upload Firebase Credentials

- In Render dashboard, go to your service
- Navigate to "Environment" → "Secret Files"
- Add a new secret file:
  - **Filename**: `firebase-credentials.json`
  - **Content**: Paste your Firebase credentials JSON

### 5. Deploy

- Click "Manual Deploy" → "Deploy latest commit"
- Wait for the build to complete
- Your API will be available at: `https://interview-prep-api.onrender.com`

## Frontend Deployment (Vercel)

### 1. Prepare Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your actual values:

```env
VITE_API_BASE_URL=https://interview-prep-api.onrender.com
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 2. Set Up Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Set Environment Variables on Vercel

Go to Settings → Environment Variables and add all the VITE_ variables from your `.env` file.

**Important**: Add these for all environments (Production, Preview, Development).

### 4. Deploy

- Click "Deploy"
- Wait for the build to complete
- Your app will be available at: `https://your-project.vercel.app`

## Firebase Configuration

### 1. Update Firebase Authentication

1. Go to Firebase Console → Authentication → Settings
2. Add authorized domains:
   - `your-project.vercel.app`
   - `your-custom-domain.com` (if applicable)

### 2. Update Firestore Rules

Deploy the `firestore.rules` file:

```bash
firebase deploy --only firestore:rules
```

## Post-Deployment Checklist

- [ ] Backend health check works: `https://your-api.onrender.com/health`
- [ ] Frontend loads correctly
- [ ] Firebase authentication works
- [ ] Interview creation and question generation works
- [ ] Webcam functionality works
- [ ] Practice mode works
- [ ] User dashboard displays data correctly

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| ENVIRONMENT | Environment mode | No | development |
| PORT | Server port | No | 8001 |
| GEMINI_API_KEY | Google Gemini API key | Yes | - |
| FIREBASE_PROJECT_ID | Firebase project ID | Yes | - |
| FIREBASE_CREDENTIALS_PATH | Path to Firebase credentials | Yes | ./firebase-credentials.json |
| CORS_ORIGINS | Allowed origins (comma-separated) | No | localhost URLs |
| ALLOWED_HOSTS | Allowed hosts (comma-separated) | No | * |
| LOG_LEVEL | Logging level | No | INFO |

### Frontend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_API_BASE_URL | Backend API URL | Yes |
| VITE_FIREBASE_API_KEY | Firebase API key | Yes |
| VITE_FIREBASE_AUTH_DOMAIN | Firebase auth domain | Yes |
| VITE_FIREBASE_PROJECT_ID | Firebase project ID | Yes |
| VITE_FIREBASE_STORAGE_BUCKET | Firebase storage bucket | Yes |
| VITE_FIREBASE_MESSAGING_SENDER_ID | Firebase messaging sender ID | Yes |
| VITE_FIREBASE_APP_ID | Firebase app ID | Yes |

## Troubleshooting

### Backend Issues

**Build fails on Render:**
- Check that `requirements.txt` has all dependencies
- Verify Python version is 3.11
- Check build logs for specific errors

**API returns 500 errors:**
- Check environment variables are set correctly
- Verify Firebase credentials are uploaded
- Check Gemini API key is valid
- Review logs in Render dashboard

**CORS errors:**
- Ensure your frontend domain is in `CORS_ORIGINS`
- Check that protocol (https://) is included

### Frontend Issues

**Build fails on Vercel:**
- Check that all dependencies are in `package.json`
- Verify environment variables are set
- Check TypeScript errors

**API calls fail:**
- Verify `VITE_API_BASE_URL` points to your backend
- Check backend CORS configuration
- Ensure backend is running

**Firebase authentication fails:**
- Check Firebase configuration variables
- Verify authorized domains in Firebase Console
- Check browser console for specific errors

## Monitoring and Maintenance

### Backend Monitoring
- Check Render dashboard for performance metrics
- Review logs for errors
- Monitor API response times

### Frontend Monitoring
- Check Vercel analytics
- Review browser console for errors
- Monitor Core Web Vitals

## Updating the Application

### Backend Updates
1. Push changes to GitHub
2. Render will auto-deploy (if enabled)
3. Or manually deploy from Render dashboard

### Frontend Updates
1. Push changes to GitHub
2. Vercel will auto-deploy
3. Check preview deployment before merging to main

## Security Best Practices

1. **Never commit sensitive data:**
   - Add `.env` to `.gitignore`
   - Use environment variables for all secrets
   - Don't commit `firebase-credentials.json`

2. **Keep dependencies updated:**
   ```bash
   # Backend
   pip list --outdated
   
   # Frontend
   npm outdated
   ```

3. **Review Firebase security rules regularly**

4. **Enable rate limiting** (consider using Render's rate limiting features)

5. **Monitor for suspicious activity** in Firebase and Render dashboards

## Cost Optimization

### Render (Free Tier)
- 750 hours/month free
- Spins down after 15 minutes of inactivity
- Cold start: ~30 seconds

### Vercel (Free Tier)
- 100GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS

### Firebase (Spark Plan)
- 50K reads/day
- 20K writes/day
- 1GB storage

## Support

If you encounter issues:
1. Check the logs in Render/Vercel dashboard
2. Review Firebase Console for auth/database errors
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
