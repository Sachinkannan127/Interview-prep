# Firebase Authentication Setup Guide

## Issue: Unauthorized Domain Error

When using Google Sign-In on localhost, you may see:
```
Firebase Setup Required: Please add "localhost" to authorized domains in Firebase Console.
```

## Solution: Add Localhost to Firebase Authorized Domains

### Step-by-Step Instructions:

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Select Your Project**
   - Click on project: `seigai-a9256`

3. **Navigate to Authentication Settings**
   - In the left sidebar, click **Authentication**
   - Click the **Settings** tab at the top
   - Scroll down to **Authorized domains** section

4. **Add Localhost**
   - Click **Add domain** button
   - Enter: `localhost`
   - Click **Add**

5. **Verify Setup**
   - You should see `localhost` in the authorized domains list
   - Also verify these default domains are present:
     - `seigai-a9256.firebaseapp.com`
     - `seigai-a9256.web.app`

6. **Test Google Sign-In**
   - Refresh your application at `http://localhost:5173`
   - Click "Continue with Google"
   - Google Sign-In should now work without errors

## Alternative: Use Email/Password Authentication

Email/Password authentication works immediately without domain authorization:

### Create Account:
1. Go to: `http://localhost:5173/auth`
2. Click **Sign Up** tab
3. Enter:
   - Email: your-email@example.com
   - Password: (minimum 6 characters)
   - Name: Your Name
4. Click **Create Account**

### Login:
1. Enter your registered email and password
2. Click **Sign In**
3. You'll be redirected to the dashboard

## Production Deployment

When deploying to production (Vercel), add your production domain:

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Click **Add domain**
3. Enter your Vercel domain: `your-app.vercel.app`
4. Click **Add**

## Troubleshooting

### Error: "auth/unauthorized-domain"
- **Cause**: Domain not in Firebase authorized domains list
- **Fix**: Follow steps above to add the domain

### Error: "auth/configuration-not-found"
- **Cause**: Firebase project not properly configured
- **Fix**: Verify `.env` file has correct Firebase credentials

### Error: "auth/invalid-api-key"
- **Cause**: Incorrect Firebase API key
- **Fix**: Check `VITE_FIREBASE_API_KEY` in `.env` file

## Current Firebase Configuration

From your `.env` file:
```
VITE_FIREBASE_PROJECT_ID=seigai-a9256
VITE_FIREBASE_AUTH_DOMAIN=seigai-a9256.firebaseapp.com
```

Firebase Console URL for your project:
https://console.firebase.google.com/project/seigai-a9256/authentication/providers

## Need Help?

If you're still experiencing issues:
1. Clear browser cache and cookies
2. Try incognito/private browsing mode
3. Check browser console for detailed error messages
4. Verify Firebase project is on the Blaze (pay-as-you-go) plan if using advanced features
