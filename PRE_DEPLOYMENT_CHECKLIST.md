# Pre-Deployment Checklist

Use this checklist to ensure everything is ready before deploying to production.

## 📋 Backend Preparation

### Environment Setup
- [ ] Create `.env` file from `.env.example`
- [ ] Set `ENVIRONMENT=production` in production environment
- [ ] Configure valid `GEMINI_API_KEY`
- [ ] Set correct `FIREBASE_PROJECT_ID`
- [ ] Upload `firebase-credentials.json` (DO NOT commit to Git)
- [ ] Update `CORS_ORIGINS` with actual frontend URL(s)
- [ ] Configure `ALLOWED_HOSTS` for production
- [ ] Set `RELOAD=false` for production stability

### Dependencies
- [ ] All dependencies listed in `requirements.txt`
- [ ] Test installation: `pip install -r requirements.txt`
- [ ] No version conflicts
- [ ] Gunicorn included for production server

### Code Quality
- [ ] No syntax errors: `python -m py_compile main.py`
- [ ] All imports work correctly
- [ ] Logging configured properly
- [ ] Error handling in place

### Security
- [ ] Firebase credentials NOT in Git
- [ ] `.env` file in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] CORS properly configured
- [ ] Trusted host middleware enabled for production

### Testing
- [ ] Health check endpoint works: `/health`
- [ ] Root endpoint works: `/`
- [ ] API endpoints tested locally
- [ ] Firebase authentication works
- [ ] Gemini API integration works

---

## 🎨 Frontend Preparation

### Environment Setup
- [ ] Create `.env` file from `.env.example`
- [ ] Set `VITE_API_BASE_URL` to backend URL
- [ ] Configure all Firebase environment variables:
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`

### Dependencies
- [ ] All dependencies in `package.json`
- [ ] Test installation: `npm install`
- [ ] No dependency warnings or conflicts
- [ ] Latest compatible versions

### Build & Testing
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Preview build works: `npm run preview`
- [ ] No console errors in browser

### Code Quality
- [ ] All TypeScript types correct
- [ ] No unused imports
- [ ] Proper error handling
- [ ] Loading states implemented

### Security
- [ ] `.env` file in `.gitignore`
- [ ] No API keys in code
- [ ] HTTPS enforced in production
- [ ] Security headers configured

---

## 🔥 Firebase Configuration

### Authentication
- [ ] Authentication enabled in Firebase Console
- [ ] Email/Password provider enabled
- [ ] Google Sign-In configured (optional)
- [ ] Authorized domains added:
  - [ ] `localhost` (for development)
  - [ ] Your Vercel domain
  - [ ] Your custom domain (if applicable)

### Firestore Database
- [ ] Firestore database created
- [ ] Security rules deployed
- [ ] Indexes created (if needed)
- [ ] Test data added/removed

### Security Rules
- [ ] `firestore.rules` file reviewed
- [ ] Rules deployed: `firebase deploy --only firestore:rules`
- [ ] Rules tested in Firebase Console

---

## 🚀 Deployment Platforms

### Render (Backend)

#### Account Setup
- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Payment method added (if needed)

#### Service Configuration
- [ ] Web service created
- [ ] Correct repository selected
- [ ] Root directory: `backend`
- [ ] Environment: Python 3
- [ ] Build command configured
- [ ] Start command configured
- [ ] Health check path set: `/health`

#### Environment Variables
- [ ] All variables from `.env.example` added
- [ ] `ENVIRONMENT=production`
- [ ] `CORS_ORIGINS` includes frontend URL
- [ ] Sensitive variables marked as secret

#### Secret Files
- [ ] `firebase-credentials.json` uploaded as secret file
- [ ] File path matches `FIREBASE_CREDENTIALS_PATH`

#### Domain & SSL
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

### Vercel (Frontend)

#### Account Setup
- [ ] Vercel account created
- [ ] GitHub repository connected

#### Project Configuration
- [ ] New project created
- [ ] Framework preset: Vite
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`

#### Environment Variables
- [ ] All VITE_ variables added to Vercel
- [ ] Variables set for all environments:
  - [ ] Production
  - [ ] Preview
  - [ ] Development
- [ ] `VITE_API_BASE_URL` points to backend

#### Domain & SSL
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)
- [ ] Domain added to Firebase authorized domains

---

## 🧪 Post-Deployment Testing

### Backend Verification
- [ ] Health check: `https://your-api.onrender.com/health`
- [ ] Root endpoint: `https://your-api.onrender.com/`
- [ ] API documentation: `https://your-api.onrender.com/docs`
- [ ] CORS headers present
- [ ] Logs show no errors

### Frontend Verification
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Login/Signup functional
- [ ] Interview creation works
- [ ] Question generation works
- [ ] Webcam access works
- [ ] Practice mode works
- [ ] Dashboard displays correctly

### Integration Testing
- [ ] Frontend can communicate with backend
- [ ] Authentication flow complete
- [ ] Create new interview session
- [ ] Answer questions
- [ ] Complete interview
- [ ] View results
- [ ] Practice mode end-to-end

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] API response time < 2 seconds
- [ ] No memory leaks
- [ ] Mobile responsiveness

### Security Testing
- [ ] HTTPS enforced
- [ ] Authentication required for protected routes
- [ ] CORS working correctly
- [ ] No sensitive data exposed
- [ ] Security headers present

---

## 📊 Monitoring Setup

### Backend Monitoring
- [ ] Enable Render logging
- [ ] Set up error alerts
- [ ] Monitor resource usage
- [ ] Check for cold starts

### Frontend Monitoring
- [ ] Enable Vercel Analytics
- [ ] Monitor Core Web Vitals
- [ ] Track deployment status
- [ ] Review error logs

### Firebase Monitoring
- [ ] Enable authentication monitoring
- [ ] Monitor database usage
- [ ] Check quota limits
- [ ] Review security rules audit

---

## 📝 Documentation

- [ ] README.md updated with deployment info
- [ ] DEPLOYMENT_GUIDE.md complete
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Known issues documented

---

## 🎯 Final Checklist

### Pre-Launch
- [ ] All environment variables set correctly
- [ ] All secrets secured
- [ ] Build succeeds on both platforms
- [ ] Health checks passing
- [ ] SSL certificates active
- [ ] Domain DNS configured

### Launch
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Integration tests passing
- [ ] No critical errors in logs

### Post-Launch
- [ ] Monitor for 24 hours
- [ ] Check error rates
- [ ] Verify user flows
- [ ] Performance acceptable
- [ ] Users can register and use app

---

## 🆘 Rollback Plan

If deployment fails:

1. **Backend Rollback:**
   - Render: Deploy previous commit
   - Check logs for errors
   - Verify environment variables

2. **Frontend Rollback:**
   - Vercel: Rollback to previous deployment
   - Check build logs
   - Verify environment variables

3. **Database Issues:**
   - Restore Firestore from backup
   - Review security rules
   - Check indexes

---

## 📞 Support Resources

- **Render:** https://render.com/docs
- **Vercel:** https://vercel.com/docs
- **Firebase:** https://firebase.google.com/docs
- **Vite:** https://vitejs.dev/guide/
- **FastAPI:** https://fastapi.tiangolo.com/

---

## ✅ Ready to Deploy?

Once all items are checked:

1. Commit and push all changes
2. Deploy backend to Render
3. Wait for backend to be healthy
4. Deploy frontend to Vercel
5. Test complete user flow
6. Monitor for issues

**Good luck! 🚀**
