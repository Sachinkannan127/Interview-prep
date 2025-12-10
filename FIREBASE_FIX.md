# Firebase "Unauthorized Domain" Error - Quick Fix

## Problem
Getting error: `Firebase: Error (auth/unauthorized-domain)` when clicking "Continue with Google"

## Solution

### Option 1: Fix Firebase Settings (Recommended - 2 minutes)

1. **Go to Firebase Console**: https://console.firebase.google.com/project/seigai-a9256/authentication/settings

2. **Scroll to "Authorized domains" section**

3. **Check if `localhost` is listed**:
   - ✅ If YES: Make sure you're accessing the app at `http://localhost:5173` (not `127.0.0.1`)
   - ❌ If NO: Click **"Add domain"** and add: `localhost`

4. **Click Save** and **refresh your browser**

5. **Try Google Sign-In again** - should work now!

---

### Option 2: Use Email/Password Login (Works Now)

**Temporary workaround** until Firebase is configured:

1. On the login page, use the **Email/Password** form instead of Google button
2. Create an account with any email (e.g., `test@example.com` / `password123`)
3. This works immediately without Firebase domain configuration

---

## Common Issues

### Issue: Still getting error after adding localhost
**Fix**: 
- Clear browser cache and cookies
- Use incognito/private window
- Make sure you're at `http://localhost:5173` exactly (not `http://127.0.0.1:5173`)

### Issue: "localhost" is already in authorized domains
**Fix**: 
- Check if there's a typo or extra space
- Remove and re-add it
- Wait 1-2 minutes for Firebase to propagate changes

---

## How to Access Your Firebase Project

Your project: **seigai-a9256**

Direct links:
- Console: https://console.firebase.google.com/project/seigai-a9256
- Authentication: https://console.firebase.google.com/project/seigai-a9256/authentication/users
- Settings: https://console.firebase.google.com/project/seigai-a9256/authentication/settings

---

## Current Status

✅ **Email/Password login** - Working now
⚠️ **Google Sign-In** - Needs Firebase configuration
✅ **Warning banner added** - Shows helpful message on login page
✅ **Better error handling** - Shows clear instructions if error occurs
