# 🚀 Quick Deployment Guide - Vercel Backend

## What Was Fixed

Your backend is now configured to work with Vercel deployment with proper Firebase authentication. The following changes were made:

### ✅ Files Added/Updated:

1. **`backend/vercel.json`** - Vercel deployment configuration
2. **`backend/api/index.py`** - Serverless function entry point using Mangum
3. **`backend/app/services/firebase_service.py`** - Updated to support individual environment variables
4. **`backend/requirements.txt`** - Added `mangum` for serverless compatibility
5. **`backend/setup_vercel_env.py`** - Helper script to extract Firebase credentials
6. **`backend/VERCEL_DEPLOYMENT.md`** - Comprehensive deployment guide

### 🔧 Key Improvements:

1. **Firebase Credentials Loading**: Now supports three methods:
   - JSON string in `FIREBASE_CREDENTIALS` env var
   - Individual environment variables (Vercel-friendly)
   - Local `firebase-credentials.json` file (development)

2. **Serverless Compatibility**: Added Mangum adapter for Vercel's serverless platform

3. **Better Error Handling**: Improved logging and fallback to mock storage

## 🎯 Next Steps to Deploy

### Step 1: Run the Setup Script

```powershell
cd backend
python setup_vercel_env.py
```

This will:
- Read your `firebase-credentials.json`
- Output all environment variables needed for Vercel
- Create a `.env.vercel` file for reference

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```powershell
# Install Vercel CLI (if not installed)
npm install -g vercel

# Navigate to backend directory
cd backend

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Set **Root Directory** to `backend`
5. Click "Deploy"

### Step 3: Add Environment Variables in Vercel

After running `setup_vercel_env.py`, copy the environment variables to Vercel:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables (from the script output):

**Required:**
```
ENVIRONMENT=production
GEMINI_API_KEY=AIzaSyB6JK456VXRVsRpHxc5bS9McbWOTsZ2APs
```

**Firebase (from setup_vercel_env.py output):**
```
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=seigai-a9256
FIREBASE_PRIVATE_KEY_ID=<from script>
FIREBASE_PRIVATE_KEY=<from script - include \n characters>
FIREBASE_CLIENT_EMAIL=<from script>
FIREBASE_CLIENT_ID=<from script>
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=<from script>
```

**Optional:**
```
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
GEMINI_MODEL=gemma-3-27b-it
```

4. Click **Save** for each variable
5. Redeploy the project

### Step 4: Update Frontend Configuration

After backend deployment, get your Vercel backend URL (e.g., `https://your-backend.vercel.app`) and update:

**`frontend/.env`:**
```env
VITE_API_BASE_URL=https://your-backend.vercel.app
```

### Step 5: Update CORS in Vercel

Update the `CORS_ORIGINS` environment variable to include your frontend:

```
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173,http://localhost:5174
```

Then redeploy.

### Step 6: Test Your Deployment

1. **Health Check**: Visit `https://your-backend.vercel.app/health`
   - Should return: `{"status": "healthy"}`

2. **API Info**: Visit `https://your-backend.vercel.app/`
   - Should return API information

3. **Test Authentication**: Try logging in from your frontend

## 🔍 Troubleshooting

### Firebase Not Connecting

**Symptom:** Logs show "Firebase not initialized"

**Solution:**
1. Run `python setup_vercel_env.py` again
2. Verify all Firebase environment variables in Vercel dashboard
3. Make sure `FIREBASE_PRIVATE_KEY` includes `\n` characters
4. Check Vercel logs: `vercel logs`

### CORS Errors

**Symptom:** Frontend shows CORS errors

**Solution:**
1. Add your frontend URL to `CORS_ORIGINS` in Vercel
2. Format: `https://frontend.vercel.app,http://localhost:5173`
3. Redeploy backend

### Import Errors

**Symptom:** "ModuleNotFoundError: No module named 'X'"

**Solution:**
1. Ensure the module is in `requirements.txt`
2. Check that `mangum>=0.17.0` is included
3. Redeploy

## 📝 Useful Commands

```powershell
# View deployment logs
vercel logs

# List recent deployments
vercel ls

# Deploy to production
vercel --prod

# Open project in dashboard
vercel open
```

## 🎓 Learn More

- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Detailed deployment guide
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

## ✅ Checklist

- [ ] Run `python setup_vercel_env.py`
- [ ] Deploy backend to Vercel
- [ ] Add all environment variables in Vercel dashboard
- [ ] Test health endpoint
- [ ] Update frontend `.env` with backend URL
- [ ] Update CORS_ORIGINS in Vercel
- [ ] Test authentication from frontend
- [ ] Deploy frontend to Vercel

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel logs: `vercel logs`
2. Verify environment variables in Vercel dashboard
3. Test locally first: `uvicorn main:app --reload`
4. Review [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed troubleshooting

---

**Your backend is now ready for Vercel deployment with Firebase authentication! 🎉**
