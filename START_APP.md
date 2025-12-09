# 🚀 How to Start the Interview AI Application

## Quick Start (2 Steps)

### Step 1: Start Backend Server
Open a **new PowerShell terminal** and run:
```powershell
cd S:\pro\Interview-prep\backend
python main.py
```

**Keep this terminal open!** You should see:
```
✓ Gemini AI initialized successfully
✓ Uvicorn running on http://0.0.0.0:8001
```

---

### Step 2: Start Frontend Server
Open **another PowerShell terminal** and run:
```powershell
cd S:\pro\Interview-prep\frontend
npm run dev
```

**Keep this terminal open too!** You should see:
```
✓ VITE ready
✓ Local: http://localhost:5173/
```

---

## 🌐 Access the Application

Open your browser and go to:
- **http://localhost:5173** or **http://localhost:5174**

---

## ✅ Features Available

- ✨ **AI Mock Interviews** - Practice with Gemini AI
- 📝 **Custom Questions** - Create your own practice sessions
- 🎯 **Real-time Feedback** - Get instant AI evaluation
- 📥 **Download Results** - Export your interview performance
- 🚀 **SEO Optimized** - All pages have proper meta tags
- 🎨 **Smooth Animations** - Beautiful UI transitions

---

## 🛑 How to Stop

Press **Ctrl+C** in each terminal window to stop the servers.

---

## 🔧 Troubleshooting

### Port Already in Use (Backend)
```powershell
# Find and kill the process on port 8001
netstat -ano | findstr :8001
taskkill /PID <PID_NUMBER> /F

# Then start backend again
cd S:\pro\Interview-prep\backend
python main.py
```

### Port Already in Use (Frontend)
```powershell
# Find and kill the process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F

# Then start frontend again
cd S:\pro\Interview-prep\frontend
npm run dev
```

### Backend Not Responding
1. Make sure `.env` file exists in `backend/` folder
2. Check that `GEMINI_API_KEY` is set (or use mock mode)
3. Verify `firebase-credentials.json` exists (or use mock mode)

### npm Errors
**Always run npm commands in the `frontend` folder**, not in `backend`!

```powershell
# ✅ Correct
cd S:\pro\Interview-prep\frontend
npm install
npm run dev

# ❌ Wrong
cd S:\pro\Interview-prep\backend
npm run dev  # This will fail!
```

---

## 📦 First Time Setup

If this is your first time running the app:

```powershell
# 1. Install backend dependencies
cd S:\pro\Interview-prep\backend
pip install -r requirements.txt

# 2. Install frontend dependencies
cd S:\pro\Interview-prep\frontend
npm install

# 3. Create .env file in backend folder
# Copy from .env.example and add your API keys

# 4. Start both servers (see Quick Start above)
```

---

## 🎉 Enjoy Your Interview Prep!

Everything is set up and ready to go. Happy practicing! 💪
