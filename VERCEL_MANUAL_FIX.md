# VERCEL DEPLOYMENT - MANUAL FIX REQUIRED

## ❌ Problem
The Vercel project settings have "Root Directory" set to "frontend", causing the deployment path to become "S:\pro\Interview-prep\frontend\frontend" which doesn't exist.

## ✅ SOLUTION - Update Vercel Project Settings

### Step-by-Step Instructions

**1. Open Your Browser**

**2. Go to This Exact URL:**
```
https://vercel.com/pro25xyzs-projects/interview-prep-ba88/settings
```

**3. Scroll Down to "General" Section**

**4. Find "Root Directory"**
- You'll see a text field that currently says: `frontend`
- This is the problem!

**5. Fix the Root Directory**
- Click on the Root Directory field
- **DELETE** everything in it (make it completely empty)
- OR type just a dot: `.`
- DO NOT leave "frontend" in there

**6. Click "Save"** at the bottom

**7. Return to Terminal and Run:**
```powershell
cd S:\pro\Interview-prep\frontend
vercel --prod
```

---

## 📸 Visual Guide

**What you should see in Vercel Settings:**

```
┌─────────────────────────────────────┐
│ Root Directory                      │
│                                     │
│ [                              ]    │  ← This should be EMPTY or "."
│                                     │
│ ❌ WRONG: frontend                  │
│ ✅ RIGHT: (empty) or .              │
└─────────────────────────────────────┘
```

---

## 🎯 Alternative: Create New Vercel Project

If you can't change the settings (permissions issue), create a new project:

### Option A: Via Vercel Dashboard (Easier)

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repo: `Sachinkannan127/Interview-prep`
4. **IMPORTANT:** Set these values:
   - **Root Directory:** Leave EMPTY (do not set to "frontend")
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Add Environment Variables (copy from `.env.production`):
   - VITE_API_BASE_URL
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID
6. Click "Deploy"

### Option B: Delete Old Project First

If you want to replace the old project:

1. Go to: https://vercel.com/pro25xyzs-projects/interview-prep-ba88/settings
2. Scroll to bottom → "Delete Project"
3. Confirm deletion
4. Then follow "Option A" above to create fresh

---

## 🚫 Why Command Line Doesn't Work

The Vercel CLI automatically links to existing projects with the same name. Once linked, it uses the project settings from the Vercel dashboard, which we cannot override from the command line.

**The Root Directory setting is stored on Vercel's servers**, not in your local files, so we must change it through the web interface.

---

## ✅ After Fixing

Once you've updated the settings or created a new project:

```powershell
# Navigate to frontend folder
cd S:\pro\Interview-prep\frontend

# Remove old config (if updating existing project)
Remove-Item -Recurse -Force .vercel

# Deploy
vercel --prod
```

This should work without errors! ✅

---

## 📋 Environment Variables to Add

If creating a new project, add these in Vercel dashboard:

```env
VITE_API_BASE_URL=https://interview-prep-api.onrender.com
VITE_FIREBASE_API_KEY=AIzaSyCmKXvrNT_t58EL4P5YyzRlEQtCwDghFo4
VITE_FIREBASE_AUTH_DOMAIN=seigai-a9256.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seigai-a9256
VITE_FIREBASE_STORAGE_BUCKET=seigai-a9256.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=31155161952
VITE_FIREBASE_APP_ID=1:31155161952:web:4064aac7ef96f480da2c05
```

---

## 🎉 Success Indicators

After fixing, you'll see:

```
✓ Uploaded 5 files
✓ Production: https://interview-prep-xxxx.vercel.app
```

Then your site will be live! 🚀

---

## ⏱️ Time Required

- **Option 1** (Fix settings): 1 minute
- **Option 2** (New project): 5 minutes

Both are easy - just need to use the Vercel web interface!
