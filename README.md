# AI-Powered Interview Prep Simulator 🎯

A comprehensive AI-powered mock interview platform that conducts realistic interviews, analyzes candidate responses, and provides personalized feedback using Google Gemini AI.

![Tech Stack](https://img.shields.io/badge/React-18.3-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green) ![Firebase](https://img.shields.io/badge/Firebase-10.8-orange) ![Gemini](https://img.shields.io/badge/Gemini-1.5-purple)

## ✨ Features

### MVP (Implemented)

- ✅ **User Authentication**: Email/Password + Google Sign-in with Firebase
- ✅ **Interview Configuration**: Multiple types (Technical, Behavioral, HR, Case Study)
- ✅ **AI Interview Conductor**: Powered by Google Gemini (1.5-pro & 1.5-flash)
- ✅ **Voice Mode**: Speech-to-text and text-to-speech using Web Speech API
- ✅ **Real-time Metrics**: Response time, word count, filler detection, confidence score
- ✅ **Interview History**: Track all past interviews with scores
- ✅ **Admin Role**: Special permissions for question management
- ✅ **Secure**: Firebase security rules and authentication middleware

### Coming Soon

- 📊 Advanced analytics dashboard with charts
- 📄 PDF report generation
- 📚 Expanded question bank
- 👥 Community-contributed questions
- 📈 Progress tracking over time

## 🏗️ Architecture

```
Frontend (React + TypeScript + Vite)
    ↓ (HTTP + Firebase Auth Token)
Backend (FastAPI + Python)
    ↓ (Gemini API)
Google Gemini AI (Question Generation + Evaluation)
    ↓
Firebase (Firestore + Auth + Storage)
```

## 🚀 Tech Stack

### Frontend
- **React 18.3** with TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Firebase SDK** - Auth, Firestore
- **Web Speech API** - Voice input/output
- **Axios** - HTTP client
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Python 3.11+**
- **FastAPI** - Modern async API framework
- **Google Gemini API** - AI interview conductor
- **Firebase Admin SDK** - Authentication & Firestore
- **Pydantic** - Data validation

### Infrastructure
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management
- **Firebase Storage** - File storage (future)
- **Vercel** - Frontend hosting
- **Render** - Backend hosting

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- Firebase project
- Google Gemini API key

### Quick Start

```bash
# Clone repository
git clone <your-repo-url>
cd Interview-prep

# Frontend setup
cd frontend
npm install
cp .env.example .env
# Edit .env with your Firebase config
npm run dev

# Backend setup (new terminal)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with API keys and Firebase credentials
uvicorn main:app --reload
```

**See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions.**

## 🔑 Environment Variables

### Frontend `.env`
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:8000
```

### Backend `.env`
```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
CORS_ORIGINS=http://localhost:5173
```

## 🎮 Usage

1. **Sign Up/Login** - Create account or use Google Sign-in
2. **Configure Interview** - Choose type, role, difficulty, duration
3. **Start Interview** - AI asks contextual questions
4. **Answer** - Type or speak your responses
5. **Get Feedback** - Receive AI evaluation and next question
6. **Review** - Check scores and improvement areas

## 📁 Project Structure

```
Interview-prep/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── services/        # API & Firebase services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Helper functions
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   └── middleware/     # Auth middleware
│   ├── requirements.txt
│   └── main.py
├── firestore.rules         # Security rules
└── README.md
```

## 🔒 Security

- Firebase Authentication with JWT tokens
- Firestore security rules (users can only access their data)
- CORS protection
- Admin role for privileged operations
- Environment variable protection

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Push to GitHub, then:
# 1. Import project in Vercel
# 2. Add environment variables
# 3. Deploy
```

### Backend (Render)
```bash
# Push to GitHub, then:
# 1. Create Web Service in Render
# 2. Connect repository
# 3. Set build/start commands
# 4. Add environment variables
# 5. Deploy
```

## 🤝 Contributing

Contributions welcome! Please read contribution guidelines first.

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Firebase for backend services
- Vercel & Render for hosting

## 📞 Support

For issues and questions:
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Review browser console and backend logs
- Open an issue on GitHub

---

**Built with ❤️ using React, FastAPI, and Google Gemini**
