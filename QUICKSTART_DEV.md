# Quick Start Guide - Development & Deployment

## 🚀 Quick Development Setup

### Prerequisites
```bash
# Required
- Node.js 18+ 
- Python 3.11+
- Git
- Firebase account
- Gemini API key
```

### 1. Clone & Install

```powershell
# Clone repository
git clone <your-repo-url>
cd Interview-prep

# Backend setup
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Frontend setup
cd ..\frontend
npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
GEMINI_API_KEY=your-key-here
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:8001
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Run Development Servers

**Terminal 1 - Backend:**
```powershell
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

---

## 📦 Quick Deployment

### Backend → Render

1. **Create Service**
   - Go to Render → New Web Service
   - Connect GitHub repo
   - Root directory: `backend`

2. **Configure**
   ```yaml
   Build Command: pip install --upgrade pip && pip install -r requirements.txt
   Start Command: gunicorn main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
   ```

3. **Environment Variables**
   ```
   ENVIRONMENT=production
   GEMINI_API_KEY=<your-key>
   FIREBASE_PROJECT_ID=<your-project-id>
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```

4. **Upload firebase-credentials.json** as secret file

5. **Deploy** ✅

### Frontend → Vercel

1. **Import Project**
   - Go to Vercel → Add New Project
   - Import from GitHub
   - Root directory: `frontend`

2. **Configure**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   VITE_FIREBASE_API_KEY=<your-key>
   VITE_FIREBASE_AUTH_DOMAIN=<your-domain>
   VITE_FIREBASE_PROJECT_ID=<your-project-id>
   VITE_FIREBASE_STORAGE_BUCKET=<your-bucket>
   VITE_FIREBASE_MESSAGING_SENDER_ID=<your-id>
   VITE_FIREBASE_APP_ID=<your-app-id>
   ```

4. **Deploy** ✅

---

## 🧪 Quick Testing

### Test Backend
```powershell
# Health check
curl http://localhost:8001/health

# Test imports
cd backend
python -c "import main; print('✅ Backend OK')"
```

### Test Frontend
```powershell
# Build test
cd frontend
npm run build

# Type check
npm run type-check
```

### Test Integration
1. Start both servers
2. Open http://localhost:5173
3. Sign up/Login
4. Create interview
5. Answer questions
6. Check results

---

## 🔥 Common Commands

### Development
```powershell
# Backend
cd backend
python main.py                    # Start server
python -m pytest                  # Run tests

# Frontend
cd frontend
npm run dev                       # Start dev server
npm run build                     # Production build
npm run preview                   # Preview build
npm run type-check               # Check TypeScript
```

### Database (Firebase)
```powershell
# Deploy Firestore rules
firebase deploy --only firestore:rules

# View logs
firebase functions:log
```

### Deployment
```powershell
# Render (automatic from Git push)
git push origin main

# Vercel (automatic from Git push)
git push origin main

# Manual Render deploy
# Use Render dashboard → Manual Deploy

# Manual Vercel deploy
cd frontend
vercel --prod
```

---

## 🐛 Quick Troubleshooting

### Backend Won't Start
```powershell
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Check environment
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('API Key:', bool(os.getenv('GEMINI_API_KEY')))"
```

### Frontend Won't Build
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

### CORS Errors
1. Check `CORS_ORIGINS` in backend `.env`
2. Ensure frontend URL is included
3. Restart backend server

### Firebase Auth Errors
1. Check Firebase config in frontend `.env`
2. Verify authorized domains in Firebase Console
3. Check browser console for specific errors

---

## 📚 Documentation

- **Full Deployment**: See `DEPLOYMENT_GUIDE.md`
- **Checklist**: See `PRE_DEPLOYMENT_CHECKLIST.md`
- **Updates**: See `DEPLOYMENT_UPDATE_SUMMARY.md`
- **Setup**: See `SETUP_GUIDE.md`

---

## 🎯 Environment Variables Quick Reference

### Required Backend Variables
- `GEMINI_API_KEY` - From Google AI Studio
- `FIREBASE_PROJECT_ID` - From Firebase Console
- `FIREBASE_CREDENTIALS_PATH` - Path to credentials JSON

### Required Frontend Variables
- `VITE_API_BASE_URL` - Backend URL
- `VITE_FIREBASE_*` - Firebase config (7 variables)

### Optional Variables
- `ENVIRONMENT` - development/production (backend)
- `LOG_LEVEL` - Logging level (backend)
- `PORT` - Server port (backend)

---

## 🆘 Need Help?

### Check Logs
**Render**: Dashboard → Your Service → Logs
**Vercel**: Dashboard → Your Project → Deployments → View Function Logs
**Firebase**: Console → Project → Usage

### Common Issues
1. **Port already in use**: Kill process or use different port
2. **Module not found**: Reinstall dependencies
3. **API key invalid**: Regenerate in Google AI Studio
4. **Firebase error**: Check credentials file

### Get Support
- Check documentation in this repo
- Review error logs
- Test with minimal configuration
- Verify environment variables

---

*Quick reference for developers - Last updated: December 10, 2025*
