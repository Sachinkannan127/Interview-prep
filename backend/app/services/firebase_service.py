import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, auth, initialize_app
from dotenv import load_dotenv

load_dotenv()

class FirebaseService:
    def __init__(self):
        self.initialized = False
        self.db = None
        
        try:
            # Option 1: Try environment variable (for production deployment)
            firebase_creds_env = os.getenv('FIREBASE_CREDENTIALS')
            
            # Option 2: Try credentials file path
            cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')
            
            # Option 3: Check for project ID to determine if we should initialize
            project_id = os.getenv('FIREBASE_PROJECT_ID')
            
            cred = None
            
            # Priority 1: Environment variable with JSON credentials (production)
            if firebase_creds_env:
                try:
                    cred_dict = json.loads(firebase_creds_env)
                    cred = credentials.Certificate(cred_dict)
                    print("✓ Firebase credentials loaded from environment variable")
                except json.JSONDecodeError:
                    print("Warning: Invalid JSON in FIREBASE_CREDENTIALS environment variable")
            
            # Priority 2: Credentials file (local development)
            elif cred_path and os.path.exists(cred_path):
                # Check if it's a mock file
                with open(cred_path, 'r') as f:
                    content = f.read()
                    if 'MOCK_PRIVATE_KEY' in content or 'your_' in content:
                        print("⚠ Mock Firebase credentials detected")
                        print("ℹ Backend will run with in-memory storage for development")
                        self.mock_storage = {}
                        return
                
                cred = credentials.Certificate(cred_path)
                print(f"✓ Firebase credentials loaded from file: {cred_path}")
            
            # Priority 3: Application Default Credentials (Google Cloud)
            elif not cred and project_id and project_id != 'your_firebase_project_id':
                try:
                    cred = credentials.ApplicationDefault()
                    print("✓ Firebase credentials loaded from Application Default")
                except:
                    pass
            
            # If no credentials found, use mock storage
            if not cred:
                print("⚠ No Firebase credentials found")
                print("ℹ Backend will run with in-memory storage for development")
                print("ℹ To enable Firebase:")
                print("  1. Place firebase-credentials.json in backend/ folder")
                print("  2. Or set FIREBASE_CREDENTIALS environment variable")
                print("  3. See FIREBASE_SETUP.md for detailed instructions")
                self.mock_storage = {}
                return
            
            # Initialize Firebase with credentials
            if not firebase_admin._apps:
                initialize_app(cred, {
                    'projectId': project_id,
                })
            
            self.db = firestore.client()
            self.initialized = True
            print("✅ Firebase initialized successfully - Database connected")
        except Exception as e:
            print(f"⚠ Firebase initialization failed: {str(e)}")
            print("ℹ Backend will run with in-memory storage for development")
            self.mock_storage = {}
            self.initialized = False
    
    def verify_token(self, token: str):
        if not self.initialized:
            raise ValueError("Firebase not initialized")
        try:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception as e:
            raise ValueError(f"Invalid token: {str(e)}")
    
    def get_user(self, uid: str):
        if not self.initialized:
            return None
        doc = self.db.collection('users').document(uid).get()
        return doc.to_dict() if doc.exists else None
    
    def create_interview(self, interview_data: dict):
        print(f"=== FIREBASE: create_interview called ===")
        print(f"Initialized: {self.initialized}")
        print(f"User ID: {interview_data.get('userId')}")
        
        if not self.initialized:
            print("WARNING: Firebase not initialized, using in-memory storage")
            # Use in-memory storage for development
            import uuid
            interview_id = str(uuid.uuid4())
            interview_data['id'] = interview_id
            if not hasattr(self, 'mock_storage'):
                self.mock_storage = {}
            if 'interviews' not in self.mock_storage:
                self.mock_storage['interviews'] = {}
            self.mock_storage['interviews'][interview_id] = interview_data
            print(f"Saved to mock storage with ID: {interview_id}")
            return interview_data
        
        doc_ref = self.db.collection('interviews').document()
        interview_data['id'] = doc_ref.id
        doc_ref.set(interview_data)
        print(f"=== FIREBASE: Interview created in Firestore with ID: {doc_ref.id} ===")
        return interview_data
    
    def get_interview(self, interview_id: str):
        if not self.initialized:
            # Use in-memory storage for development
            if hasattr(self, 'mock_storage') and 'interviews' in self.mock_storage:
                return self.mock_storage['interviews'].get(interview_id)
            return None
        doc = self.db.collection('interviews').document(interview_id).get()
        return doc.to_dict() if doc.exists else None
    
    def update_interview(self, interview_id: str, data: dict):
        print(f"=== FIREBASE: update_interview called ===")
        print(f"Interview ID: {interview_id}")
        print(f"Update keys: {list(data.keys())}")
        
        if not self.initialized:
            print("WARNING: Firebase not initialized, updating mock storage")
            # Use in-memory storage for development
            if hasattr(self, 'mock_storage') and 'interviews' in self.mock_storage:
                if interview_id in self.mock_storage['interviews']:
                    self.mock_storage['interviews'][interview_id].update(data)
                    print(f"Updated mock storage for interview {interview_id}")
                else:
                    print(f"WARNING: Interview {interview_id} not found in mock storage")
            return
        
        self.db.collection('interviews').document(interview_id).update(data)
        print(f"=== FIREBASE: Interview {interview_id} updated in Firestore ===")
        return
    
    def get_user_interviews(self, user_id: str, limit: int = 10):
        if not self.initialized:
            # Use in-memory storage for development
            if hasattr(self, 'mock_storage') and 'interviews' in self.mock_storage:
                user_interviews = [v for v in self.mock_storage['interviews'].values() if v.get('userId') == user_id]
                return sorted(user_interviews, key=lambda x: x.get('startedAt', ''), reverse=True)[:limit]
            return []
        docs = self.db.collection('interviews')\
            .where('userId', '==', user_id)\
            .order_by('startedAt', direction=firestore.Query.DESCENDING)\
            .limit(limit)\
            .stream()
        return [doc.to_dict() for doc in docs]
    
    def create_practice_session(self, session_data: dict):
        if not self.initialized:
            # Use in-memory storage for development
            import uuid
            session_id = str(uuid.uuid4())
            session_data['id'] = session_id
            if not hasattr(self, 'mock_storage'):
                self.mock_storage = {}
            if 'practice_sessions' not in self.mock_storage:
                self.mock_storage['practice_sessions'] = {}
            self.mock_storage['practice_sessions'][session_id] = session_data
            return session_data
        doc_ref = self.db.collection('practice_sessions').document()
        session_data['id'] = doc_ref.id
        doc_ref.set(session_data)
        return session_data
    
    def update_practice_session(self, session_id: str, data: dict):
        if not self.initialized:
            # Use in-memory storage for development
            if hasattr(self, 'mock_storage') and 'practice_sessions' in self.mock_storage:
                if session_id in self.mock_storage['practice_sessions']:
                    self.mock_storage['practice_sessions'][session_id].update(data)
            return
        self.db.collection('practice_sessions').document(session_id).update(data)
    
    def get_practice_session(self, session_id: str):
        if not self.initialized:
            # Use in-memory storage for development
            if hasattr(self, 'mock_storage') and 'practice_sessions' in self.mock_storage:
                return self.mock_storage['practice_sessions'].get(session_id)
            return None
        doc = self.db.collection('practice_sessions').document(session_id).get()
        return doc.to_dict() if doc.exists else None
    
    def get_user_practice_sessions(self, user_id: str, limit: int = 20):
        if not self.initialized:
            # Use in-memory storage for development
            if hasattr(self, 'mock_storage') and 'practice_sessions' in self.mock_storage:
                user_sessions = [v for v in self.mock_storage['practice_sessions'].values() if v.get('userId') == user_id]
                return sorted(user_sessions, key=lambda x: x.get('startedAt', ''), reverse=True)[:limit]
            return []
        docs = self.db.collection('practice_sessions')\
            .where('userId', '==', user_id)\
            .order_by('startedAt', direction=firestore.Query.DESCENDING)\
            .limit(limit)\
            .stream()
        return [doc.to_dict() for doc in docs]

firebase_service = FirebaseService()
