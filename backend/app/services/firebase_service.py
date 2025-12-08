import os
import firebase_admin
from firebase_admin import credentials, firestore, auth, initialize_app
from dotenv import load_dotenv

load_dotenv()

class FirebaseService:
    def __init__(self):
        try:
            cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
            else:
                # For deployment with environment variables
                cred = credentials.ApplicationDefault()
            
            initialize_app(cred, {
                'projectId': os.getenv('FIREBASE_PROJECT_ID'),
            })
            
            self.db = firestore.client()
            self.initialized = True
        except Exception as e:
            print(f"Warning: Firebase not initialized: {str(e)}")
            print("Backend will run without Firebase functionality")
            self.db = None
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
        if not self.initialized:
            raise ValueError("Firebase not initialized")
        doc_ref = self.db.collection('interviews').document()
        interview_data['id'] = doc_ref.id
        doc_ref.set(interview_data)
        return interview_data
    
    def get_interview(self, interview_id: str):
        if not self.initialized:
            return None
        doc = self.db.collection('interviews').document(interview_id).get()
        return doc.to_dict() if doc.exists else None
    
    def update_interview(self, interview_id: str, data: dict):
        if not self.initialized:
            raise ValueError("Firebase not initialized")
        self.db.collection('interviews').document(interview_id).update(data)
    
    def get_user_interviews(self, user_id: str, limit: int = 10):
        if not self.initialized:
            return []
        docs = self.db.collection('interviews')\
            .where('userId', '==', user_id)\
            .order_by('startedAt', direction=firestore.Query.DESCENDING)\
            .limit(limit)\
            .stream()
        return [doc.to_dict() for doc in docs]

firebase_service = FirebaseService()
