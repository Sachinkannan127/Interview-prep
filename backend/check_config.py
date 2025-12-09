#!/usr/bin/env python3
"""
Diagnostic script to check InterviewAI backend configuration
Run this to verify Firebase and Gemini setup
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

def check_env_var(name, required=False):
    """Check if environment variable is set"""
    value = os.getenv(name)
    if value and value not in ['your_gemini_api_key_here', 'your_firebase_project_id']:
        print(f"✅ {name}: Set")
        return True
    else:
        if required:
            print(f"❌ {name}: NOT SET (Required for production)")
        else:
            print(f"⚠️  {name}: NOT SET (Optional, will use fallback)")
        return False

def check_file_exists(path, name):
    """Check if file exists"""
    if path and os.path.exists(path):
        print(f"✅ {name}: Found at {path}")
        return True
    else:
        print(f"⚠️  {name}: Not found (will use mock mode)")
        return False

def check_gemini():
    """Check Gemini configuration"""
    print("\n=== Gemini AI Configuration ===")
    has_key = check_env_var('GEMINI_API_KEY', required=False)
    
    if has_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
            model = genai.GenerativeModel('gemini-1.5-flash')
            print("✅ Gemini API: Successfully initialized")
            print("   → Dynamic questions will be generated")
            return True
        except Exception as e:
            print(f"❌ Gemini API: Failed to initialize - {str(e)}")
            print("   → Will use fallback questions")
            return False
    else:
        print("   → Will use fallback questions (this is fine for testing)")
        return False

def check_firebase():
    """Check Firebase configuration"""
    print("\n=== Firebase Configuration ===")
    has_project = check_env_var('FIREBASE_PROJECT_ID', required=False)
    cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
    has_creds = check_file_exists(cred_path, 'Firebase Credentials')
    
    if has_project and has_creds:
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore
            
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print("✅ Firebase: Successfully initialized")
            print("   → Data will be saved to Firestore")
            return True
        except Exception as e:
            print(f"❌ Firebase: Failed to initialize - {str(e)}")
            print("   → Will use in-memory storage")
            return False
    else:
        print("   → Will use in-memory storage (this is fine for testing)")
        return False

def check_dependencies():
    """Check Python dependencies"""
    print("\n=== Python Dependencies ===")
    required = [
        'fastapi',
        'uvicorn',
        'python-dotenv',
        'google-generativeai',
        'firebase-admin'
    ]
    
    all_good = True
    for package in required:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}: Installed")
        except ImportError:
            print(f"❌ {package}: NOT INSTALLED")
            all_good = False
    
    return all_good

def main():
    print("=" * 60)
    print("InterviewAI Backend Diagnostic")
    print("=" * 60)
    
    # Check dependencies
    deps_ok = check_dependencies()
    
    if not deps_ok:
        print("\n⚠️  Install missing dependencies:")
        print("   cd backend")
        print("   pip install -r requirements.txt")
        return
    
    # Check Gemini
    gemini_ok = check_gemini()
    
    # Check Firebase
    firebase_ok = check_firebase()
    
    # Summary
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    
    if gemini_ok and firebase_ok:
        print("🎉 Full Production Mode")
        print("   - Gemini AI generating dynamic questions")
        print("   - Firebase saving data to Firestore")
    elif gemini_ok and not firebase_ok:
        print("⚠️  Partial Production Mode")
        print("   - Gemini AI generating dynamic questions ✅")
        print("   - Using in-memory storage (data not persisted) ⚠️")
    elif not gemini_ok and firebase_ok:
        print("⚠️  Partial Production Mode")
        print("   - Using fallback questions ⚠️")
        print("   - Firebase saving data to Firestore ✅")
    else:
        print("🧪 Development Mode")
        print("   - Using fallback questions (this is fine for testing)")
        print("   - Using in-memory storage (data not persisted)")
        print("\n   This is perfect for development and testing!")
    
    print("\n" + "=" * 60)
    print("Next Steps")
    print("=" * 60)
    
    if not gemini_ok:
        print("\nTo enable Gemini AI:")
        print("1. Get API key: https://makersuite.google.com/app/apikey")
        print("2. Add to backend/.env:")
        print("   GEMINI_API_KEY=your_actual_key_here")
        print("3. Restart backend server")
    
    if not firebase_ok:
        print("\nTo enable Firebase:")
        print("1. Create Firebase project: https://console.firebase.google.com/")
        print("2. Download service account JSON")
        print("3. Add to backend/.env:")
        print("   FIREBASE_PROJECT_ID=your_project_id")
        print("   FIREBASE_CREDENTIALS_PATH=path/to/service-account.json")
        print("4. Restart backend server")
    
    if gemini_ok and firebase_ok:
        print("\n✅ All systems configured! Ready for production.")
        print("\nRun backend:")
        print("   cd backend")
        print("   python -m uvicorn main:app --reload")
    else:
        print("\n✅ Development mode ready! You can test the app.")
        print("\nRun backend:")
        print("   cd backend")
        print("   python -m uvicorn main:app --reload")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nDiagnostic cancelled.")
        sys.exit(0)
