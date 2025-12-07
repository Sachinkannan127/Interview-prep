# Quick Start Guide 🚀

Get up and running in 5 minutes!

## Step 1: Install Dependencies (2 min)

### Frontend
```bash
cd frontend
npm install
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Step 2: Configure Firebase (2 min)

1. Create Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email + Google)
3. Enable Firestore Database
4. Get web config from Project Settings
5. Download service account JSON from Project Settings → Service Accounts

## Step 3: Set Environment Variables (1 min)

### Frontend `.env`
```bash
cd frontend
cp .env.example .env
# Edit .env with your Firebase config
```

### Backend `.env`
```bash
cd backend
cp .env.example .env
# Edit .env with Gemini API key and Firebase config
# Place firebase-credentials.json in backend folder
```

## Step 4: Get Gemini API Key (30 sec)

1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Add to backend `.env`

## Step 5: Run! (30 sec)

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 🎉

## Troubleshooting

**Port already in use?**
```bash
# Change frontend port in vite.config.ts
# Change backend port: uvicorn main:app --reload --port 8001
```

**Firebase errors?**
- Check API keys in .env
- Verify firebase-credentials.json path
- Enable Firestore and Authentication in Firebase Console

**Gemini API errors?**
- Verify API key
- Check quotas in Google Cloud Console

Need more help? See [SETUP_GUIDE.md](SETUP_GUIDE.md)
