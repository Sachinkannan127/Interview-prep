import os
from firebase_admin import credentials, firestore, auth, initialize_app
from dotenv import load_dotenv

load_dotenv()

class FirebaseService:
    def __init__(self):
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
    
    def verify_token(self, token: str):
        try:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception as e:
            raise ValueError(f"Invalid token: {str(e)}")
    
    def get_user(self, uid: str):
        doc = self.db.collection('users').document(uid).get()
        return doc.to_dict() if doc.exists else None
    
    def create_interview(self, interview_data: dict):
        doc_ref = self.db.collection('interviews').document()
        interview_data['id'] = doc_ref.id
        doc_ref.set(interview_data)
        return interview_data
    
    def get_interview(self, interview_id: str):
        doc = self.db.collection('interviews').document(interview_id).get()
        return doc.to_dict() if doc.exists else None
    
    def update_interview(self, interview_id: str, data: dict):
        self.db.collection('interviews').document(interview_id).update(data)
    
    def get_user_interviews(self, user_id: str, limit: int = 10):
        docs = self.db.collection('interviews')\
            .where('userId', '==', user_id)\
            .order_by('startedAt', direction=firestore.Query.DESCENDING)\
            .limit(limit)\
            .stream()
        return [doc.to_dict() for doc in docs]

firebase_service = FirebaseService()
