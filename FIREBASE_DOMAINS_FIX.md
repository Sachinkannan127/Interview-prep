# 🔧 Firebase Authorized Domains Fix

## ⚠️ Current Issue
**Error:** "Firebase Setup Required: Please add 'localhost' to authorized domains in Firebase Console"

This happens when Firebase Authentication blocks requests from unauthorized domains.

---

## ✅ SOLUTION - Add Authorized Domains

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **seigai-a9256**
3. Click **Authentication** in the left sidebar
4. Click on the **Settings** tab (gear icon)
5. Scroll down to **Authorized domains**

### Step 2: Add Required Domains

Click **Add domain** and add these domains one by one:

**For Local Development:**
```
localhost
127.0.0.1
```

**For Production (Vercel):**
```
interview-prep-eta-two.vercel.app
```

**Your Custom Domain (if any):**
```
your-custom-domain.com
```

### Step 3: Save and Test

After adding all domains:
1. ✅ Click **Add** for each domain
2. ✅ Wait 1-2 minutes for changes to propagate
3. ✅ Refresh your application
4. ✅ Try authentication again

---

## 📋 Complete Domain List

Here's what you need to add:

| Domain | Purpose | Status |
|--------|---------|--------|
| `localhost` | Local dev | ⚠️ ADD THIS |
| `127.0.0.1` | Local dev (IP) | ⚠️ ADD THIS |
| `interview-prep-eta-two.vercel.app` | Production | ⚠️ ADD THIS |

---

## 🔍 How to Find Your Vercel Domain

If you're unsure of your Vercel domain:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project: **interview-prep-ba88**
3. Look for the **Domains** section
4. Copy the `.vercel.app` domain
5. Add it to Firebase authorized domains

---

## 🚀 Quick Fix Commands

### Option 1: Using Firebase CLI (Recommended)
```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init

# Deploy Firebase config
firebase deploy --only hosting
```

### Option 2: Manual Configuration (Faster)
Just follow the steps above in the Firebase Console - takes 2 minutes!

---

## 🔐 Authentication Methods Affected

This issue affects these authentication methods:
- ✅ Google Sign-In
- ✅ Facebook Login
- ✅ Twitter Login
- ✅ GitHub Login
- ⚠️ Email/Password (usually works without this fix)

**Current Workaround:** Use Email/Password login as mentioned in the error message.

---

## ✨ After Fixing

Once you add the domains:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh the application (F5)
3. Try signing in with Google or other providers
4. Authentication should work! ✅

---

## 🐛 Still Having Issues?

If problems persist after adding domains:

**Check 1: Verify API Keys**
```bash
# Check .env file has correct Firebase config
cat frontend/.env.local
```

**Check 2: Clear Firebase Auth State**
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**Check 3: Verify Firebase Config**
- Make sure `VITE_FIREBASE_API_KEY` matches Firebase Console
- Check that Firebase project ID is `seigai-a9256`
- Verify authentication methods are enabled in Firebase Console

---

## 📝 Summary

**Action Required:**
1. Go to Firebase Console → Authentication → Settings
2. Add `localhost` and `127.0.0.1` to authorized domains
3. Add your Vercel domain to authorized domains
4. Wait 1-2 minutes
5. Refresh and test

**Time Required:** 2-3 minutes

**This will fix:** Authentication on both local and production environments
