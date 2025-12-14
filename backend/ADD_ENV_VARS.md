# Add Environment Variables to Vercel

## Critical: Your backend will NOT work without these!

Go to: **https://vercel.com/pro25xyzs-projects/backend/settings/environment-variables**

## Step 1: Add Required Variables

### 1. ENVIRONMENT
```
production
```

### 2. GEMINI_API_KEY  
```
AIzaSyB6JK456VXRVsRpHxc5bS9McbWOTsZ2APs
```

## Step 2: Add Firebase Variables (from .env.vercel)

Open `.env.vercel` and copy these:

### 3. FIREBASE_TYPE
```
service_account
```

### 4. FIREBASE_PROJECT_ID
```
seigai-a9256
```

### 5. FIREBASE_PRIVATE_KEY_ID
```
499147c5f2cacfd6aa12eb23b81606f63a482ede
```

### 6. FIREBASE_PRIVATE_KEY
**IMPORTANT:** Copy the ENTIRE private key from `.env.vercel` including:
- `-----BEGIN PRIVATE KEY-----`  
- All the encoded content with `\n` characters
- `-----END PRIVATE KEY-----`

The value should look like:
```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG...\n-----END PRIVATE KEY-----\n
```

### 7. FIREBASE_CLIENT_EMAIL
```
firebase-adminsdk-fbsvc@seigai-a9256.iam.gserviceaccount.com
```

### 8. FIREBASE_CLIENT_ID
```
103616296905344667713
```

### 9. FIREBASE_AUTH_URI
```
https://accounts.google.com/o/oauth2/auth
```

### 10. FIREBASE_TOKEN_URI
```
https://oauth2.googleapis.com/token
```

### 11. FIREBASE_AUTH_PROVIDER_CERT_URL
```
https://www.googleapis.com/oauth2/v1/certs
```

### 12. FIREBASE_CLIENT_CERT_URL
```
https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40seigai-a9256.iam.gserviceaccount.com
```

## Step 3: Optional CORS Configuration

### 13. CORS_ORIGINS (Optional but recommended)
```
https://interview-prep-eta-two.vercel.app,http://localhost:5173
```

## After Adding All Variables

1. Vercel will automatically redeploy
2. Wait 30-60 seconds
3. Test: https://backend-io2olkpy1-pro25xyzs-projects.vercel.app/health
4. Should return: `{"status": "healthy"}`

## Update Frontend

Update `frontend/.env`:
```
VITE_API_BASE_URL=https://backend-io2olkpy1-pro25xyzs-projects.vercel.app
```

Then redeploy frontend.

---

**Current Status:**
- ✅ Backend code fixed and deployed
- ✅ Local backend running on http://localhost:8001  
- ⏳ **NEXT STEP:** Add environment variables to Vercel
- ⏳ Test Vercel deployment
- ⏳ Update and deploy frontend
