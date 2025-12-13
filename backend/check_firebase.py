"""
Firebase Integration Status Checker
Run this to check if Firebase is properly configured
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.firebase_service import firebase_service

print("="*70)
print("FIREBASE INTEGRATION STATUS CHECK")
print("="*70)

print(f"\n📊 Firebase Service Status")
print(f"   Initialized: {'✅ YES' if firebase_service.initialized else '❌ NO (using mock storage)'}")
print(f"   Database Connected: {'✅ YES' if firebase_service.db else '❌ NO'}")

if firebase_service.initialized:
    print("\n✅ SUCCESS: Firebase is active!")
    print("   Your data is being stored in Firestore.")
    print("   Collections:")
    print("   - users")
    print("   - interviews")
    print("   - practice_sessions")
    print("\n🔗 View your data:")
    print("   https://console.firebase.google.com/project/seigai-a9256/firestore")
else:
    print("\n⚠️  WARNING: Firebase not initialized")
    print("   Using in-memory storage (data lost on restart)")
    print("\n📋 To enable Firebase:")
    print("   1. Download credentials from Firebase Console")
    print("   2. Save as: backend/firebase-credentials.json")
    print("   3. Restart backend server")
    print("\n📖 Documentation:")
    print("   - Quick Start: FIREBASE_QUICKSTART.md")
    print("   - Full Guide: FIREBASE_INTEGRATION.md")

print("\n" + "="*70)

# Check credentials file
cred_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-credentials.json')
print(f"\n📁 Credentials File Check")
if os.path.exists(cred_path):
    with open(cred_path, 'r') as f:
        content = f.read()
        if 'MOCK' in content or 'YOUR_' in content:
            print("   ⚠️  Mock credentials detected")
            print("   Replace with real credentials from Firebase Console")
        else:
            print("   ✅ Credentials file exists")
            if not firebase_service.initialized:
                print("   ⚠️  But Firebase not initialized - check for errors in logs")
else:
    print("   ❌ Credentials file not found")
    print("   Expected location: backend/firebase-credentials.json")

print("\n" + "="*70)
