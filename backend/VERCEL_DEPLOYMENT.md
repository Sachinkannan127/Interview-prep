# Vercel Backend Deployment Guide

## Prerequisites

1. A Vercel account (https://vercel.com)
2. Firebase project with credentials
3. Gemini API key

## Step-by-Step Deployment

### 1. Prepare Your Firebase Credentials

First, download your Firebase service account credentials:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `seigai-a9256`
3. Click the gear icon → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Save the JSON file

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```powershell
# Install Vercel CLI
npm install -g vercel

# Navigate to backend directory
cd backend

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Set **Root Directory** to `backend`
5. Framework Preset: **Other**
6. Build Command: (leave empty)
7. Output Directory: (leave empty)
8. Install Command: `pip install -r requirements.txt`

### 3. Configure Environment Variables in Vercel

Go to your project settings → **Environment Variables** and add:

#### Required Variables:

```
ENVIRONMENT=production
GEMINI_API_KEY=AIzaSyB6JK456VXRVsRpHxc5bS9McbWOTsZ2APs
```

#### Firebase Option 1: Individual Variables (Recommended for Vercel)

Open your `firebase-credentials.json` file and add each field as a separate environment variable:

```
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=seigai-a9256
FIREBASE_PRIVATE_KEY_ID=<from your JSON file>
FIREBASE_PRIVATE_KEY=<from your JSON file - keep the \n characters>
FIREBASE_CLIENT_EMAIL=<from your JSON file>
FIREBASE_CLIENT_ID=<from your JSON file>
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=<from your JSON file>
```

**Important for `FIREBASE_PRIVATE_KEY`:**
- Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters in the string
- Wrap it in quotes if needed

#### Firebase Option 2: Single JSON Variable (Alternative)

```
FIREBASE_CREDENTIALS=<paste entire firebase-credentials.json content as a single line>
```

#### Optional Variables:

```
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
ALLOWED_HOSTS=your-backend.vercel.app
GEMINI_MODEL=gemma-3-27b-it
```

### 4. Update Frontend Configuration

After deployment, update your frontend `.env` file:

```env
VITE_API_BASE_URL=https://your-backend.vercel.app
```

Replace `your-backend.vercel.app` with your actual Vercel deployment URL.

### 5. Update CORS Settings

Update the `CORS_ORIGINS` environment variable in Vercel to include your frontend URL:

```
CORS_ORIGINS=https://your-frontend.vercel.app,https://your-custom-domain.com,http://localhost:5173
```

### 6. Test Your Deployment

1. Visit `https://your-backend.vercel.app/health` - should return `{"status": "healthy"}`
2. Visit `https://your-backend.vercel.app/` - should return API information
3. Test authentication from your frontend

## Troubleshooting

### Firebase Not Connecting

**Error:** "Firebase not initialized"

**Solutions:**
1. Verify all environment variables are set correctly in Vercel
2. Check that `FIREBASE_PRIVATE_KEY` includes `\n` characters
3. Ensure the private key is wrapped in quotes
4. Try using individual environment variables instead of JSON

**Check logs:**
```powershell
vercel logs your-backend.vercel.app
```

### CORS Errors

**Error:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**
1. Add your frontend URL to `CORS_ORIGINS` in Vercel environment variables
2. Redeploy: `vercel --prod`

### Import Errors

**Error:** "ModuleNotFoundError"

**Solution:**
1. Ensure `requirements.txt` includes all dependencies
2. Check that `mangum` is in requirements.txt (for Vercel serverless)
3. Redeploy

## Environment Variable Format Example

Here's how your Firebase credentials should look in Vercel:

```
FIREBASE_TYPE=service_account

FIREBASE_PROJECT_ID=seigai-a9256

FIREBASE_PRIVATE_KEY_ID=abc123def456...

FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@seigai-a9256.iam.gserviceaccount.com

FIREBASE_CLIENT_ID=123456789012345678901
```

**Note:** The private key must include `\n` for line breaks and should be wrapped in quotes.

## Vercel-Specific Configuration

The backend includes:
- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `api/index.py` - Serverless function entry point using Mangum
- ✅ Firebase support for individual environment variables
- ✅ Automatic mock storage fallback for testing

## Next Steps

1. Deploy backend to Vercel
2. Configure environment variables
3. Test health endpoint
4. Update frontend `.env` with new backend URL
5. Deploy frontend to Vercel
6. Test end-to-end authentication

## Monitoring

View your deployment logs:
```powershell
vercel logs
```

View recent deployments:
```powershell
vercel ls
```

## Support

- Vercel Documentation: https://vercel.com/docs
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
- Gemini API: https://ai.google.dev/docs
