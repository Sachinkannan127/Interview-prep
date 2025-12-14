# 🚀 Render Backend Deployment Guide

## Prerequisites
- Render account (https://render.com)
- GitHub repository with your code
- Firebase service account credentials
- Gemini API key

## Step 1: Prepare Firebase Credentials

You have two options for Firebase on Render:

### Option A: Environment Variable (Recommended)
1. Open `backend/.env.vercel` file
2. Copy the entire FIREBASE_PRIVATE_KEY value (with \n characters)
3. You'll add these as environment variables in Render

### Option B: Upload Credentials File
1. You'll upload `firebase-credentials.json` as a secret file in Render dashboard

## Step 2: Deploy to Render

### Using Render Dashboard:

1. **Go to** https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `interview-prep-api`
   - **Region:** Oregon (or your preference)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free

5. Click **Create Web Service**

## Step 3: Add Environment Variables in Render

Go to your service → **Environment** tab and add:

### Required Variables:

```
ENVIRONMENT=production
```

```
GEMINI_API_KEY=AIzaSyB6JK456VXRVsRpHxc5bS9McbWOTsZ2APs
```

### Firebase Variables (Individual - Recommended):

```
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=seigai-a9256
FIREBASE_PRIVATE_KEY_ID=499147c5f2cacfd6aa12eb23b81606f63a482ede
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@seigai-a9256.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=103616296905344667713
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40seigai-a9256.iam.gserviceaccount.com
```

**FIREBASE_PRIVATE_KEY** (copy from `.env.vercel`):
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDBtm1CUZ1AsiLr
ivQ+lZLzV+msdK+iHtGnUNAFVxhxJD4dnFnwyXG+u6tonexfYFdC22w/SzhEGI2Z
RTISrqSqWAoHI1nB3DNRCpsLQIaFqoK1vEzE8d6TGywivgH/jw/hLU7GV6iTB7e8
37c22AHxcFhg+18twuebRGNxYLjwlwlN83zy2hcI+2O2Ji1VoBB8V4fy0xEnvBlP
k+rEKa6hnOVzscugmZOBQCTJ1jAucEV7fNtKfJkGutM6peAp+02Kcr2a5yTPW4YI
/a4o2zvyXjOr4JJZD8OrWu9xwkMjYbq/nz3h/o7OqpFwxdFNgvg1IcL47hfRqgB9
JYcOyW0rAgMBAAECggEAF+N5Yd5SuDG/oLCIIlerwZqr1HqnViTa0fljTeVJvFot
1tT7Onh9MHpQTxx6k+B7omEQ3lVWYP9uJuKjpC4pXGBzDCJN5VxUb8ARErgoXr+C
UwsfpIH3YsjNDpPEB1ILMUe3GTqiLU+cVwx3uam1w6KJI5ycRjZs/XbXlJnK9NBU
Uew2gWEQy9ERZGG8z++oni51PphreUXC29u1L2VF0z7cDExYsDYjCjGFj1/NL2VI
YUJqPBLtnSSOPRy91yInZ4fPGs/aSMMYqX2LAF+ex1VNqVDm9LvnYhESjx1Fm6GY
kSwMyX/iHvtp97z5a/bvUeRfQ7sFSM2BxO3dMAURMQKBgQDy1dabqGJC6jic5Qlm
DETr2cfp0+/K2WM4xF2rTKn4TJyuDeX8qt8vF0GRqwZu3Sa1s0Xq7bFsz2wzzSX6
9DZ1BoPOblLkJQGBRxZy8gmQM7ROj1OGGvH5wPewEs9ZjcF4xxT6o6SyY0TFyG6u
xUmF7lSPqkeMcE8QuMUYRlMfvwKBgQDMNthB+hb1uz3D646lJp/82xlcM94T43+0
+HlNn1T5qEkHV1b1ZWOgJKvIfx/wedEjoBalZzWs0MzmdE93HE1ZcaZgrci8TnMP
cfK+3ASRfMbAWTkZfpSBEDGPkSDBZDzar1m8w67TheSX7UylMd28wDDw6ZjkVIiH
6+tLLwTNlQKBgQDxLdTh8FD3aK0llozJH7JsFHZrFCV68IGNZeoqMhA2HdEXRZKA
ai0UFiL3TEctYNQLbqwocj7fdPtgT4ZDQr27aOcL5aLKGL7v6Oyw6Rb6c3/G7q7j
6GsfxLm71FK//PyEuiVp8ZGn4tPxI+paBnPJYzX1IgfBweGlF/4Y5++y/QKBgAmm
ede8UsNwAr40bnw9dAgF7o/d35u+/3T03P6fDevyWOkg5noYPXn+4aNK5p59kzWE
xi0w0GeHQneNfYfabYlRhpRBAiBr8KIFN3xvd0PMyrOiQ8GBqtDijAUFza915i5L
ZQk3khZq2F+ZliqkTZ8y0d1AnLoFiKIrsuXNpgN1AoGBANQVeEUMo5SKmmXBrwDG
lOdJJiC1KWYK3k+Z9AuUHHDIuIzZANVb55v63LZsrHkdvWJggRNCIr0g+MfIn7aB
9CRQgDNdzLPV0CtlyKNIO+qQiedItDcgV3gjK7O43zJ1zx7mT4SyFe3p1eUBhfiA
buDxWYaOLbEbfQpEeZryNl78
-----END PRIVATE KEY-----
```

### Optional:

```
CORS_ORIGINS=https://interview-prep-eta-two.vercel.app,http://localhost:5173
GEMINI_MODEL=gemma-3-27b-it
```

## Step 4: Save and Deploy

1. Click **Save Changes**
2. Render will automatically deploy
3. Wait 2-3 minutes for build and deployment

## Step 5: Get Your Backend URL

After deployment, your backend will be available at:
```
https://interview-prep-api.onrender.com
```

Test it:
- Health: https://interview-prep-api.onrender.com/health
- API Info: https://interview-prep-api.onrender.com/

## Step 6: Update Frontend

Update `frontend/.env.production`:
```
VITE_API_BASE_URL=https://interview-prep-api.onrender.com
```

## Troubleshooting

### Check Logs
- Go to your service in Render dashboard
- Click **Logs** tab
- Look for initialization messages

### Common Issues

**Firebase Not Connecting:**
- Verify FIREBASE_PRIVATE_KEY has actual line breaks (not \n strings)
- Check all Firebase env vars are set

**Build Fails:**
- Check `requirements.txt` is complete
- Verify Python version compatibility

**Service Crashes:**
- Check logs for specific error
- Verify GEMINI_API_KEY is set
- Ensure port is read from $PORT env var

## Using render.yaml (Alternative)

If you prefer, you can use the `render.yaml` file already in your repo:

1. Push changes to GitHub
2. In Render: New → Blueprint
3. Connect your repo
4. Render will use `render.yaml` configuration
5. Add secret environment variables in dashboard

## Free Tier Notes

- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30-60 seconds
- Consider paid plan for production use

---

**Your backend is ready for Render deployment! 🚀**
