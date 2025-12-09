from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.firebase_service import firebase_service
import os

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    # Development mode: bypass authentication if Firebase is not initialized
    if not firebase_service.initialized:
        return {
            'uid': 'dev-user-123',
            'email': 'dev@example.com',
            'name': 'Development User',
            'role': 'user'
        }
    
    if not credentials:
        raise HTTPException(status_code=401, detail="Authorization token required")
    
    token = credentials.credentials
    try:
        decoded_token = firebase_service.verify_token(token)
        user_id = decoded_token['uid']
        user = firebase_service.get_user(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {**user, 'uid': user_id}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication error: {str(e)}")

async def require_admin(user: dict = Security(get_current_user)):
    # Development mode: allow admin access
    if not firebase_service.initialized:
        return {
            'uid': 'dev-admin-123',
            'email': 'admin@example.com',
            'name': 'Development Admin',
            'role': 'admin'
        }
    
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
