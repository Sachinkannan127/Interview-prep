from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from app.middleware.auth import get_current_user, require_admin
from app.services.gemini_service import gemini_service
from app.services.firebase_service import firebase_service
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api/questions", tags=["questions"])

class PracticeAnswerRequest(BaseModel):
    question: str
    answer: str
    category: str
    sessionId: Optional[str] = None

# Placeholder for future question bank functionality
SAMPLE_QUESTIONS = [
    {
        "id": "1",
        "text": "Explain the difference between let, const, and var in JavaScript",
        "category": "technical",
        "difficulty": "entry",
        "tags": ["javascript", "fundamentals"]
    },
    {
        "id": "2",
        "text": "Describe a time when you had to work with a difficult team member",
        "category": "behavioral",
        "difficulty": "mid",
        "tags": ["teamwork", "conflict-resolution"]
    }
]

@router.get("")
async def get_questions(category: str = None, difficulty: str = None):
    questions = SAMPLE_QUESTIONS
    
    if category:
        questions = [q for q in questions if q['category'] == category]
    if difficulty:
        questions = [q for q in questions if q['difficulty'] == difficulty]
    
    return questions

@router.get("/generate")
async def generate_practice_questions(
    category: str = Query(..., description="Question category: technical, behavioral, hr"),
    difficulty: str = Query(..., description="Difficulty level: entry, mid, senior"),
    count: int = Query(5, ge=1, le=10, description="Number of questions to generate"),
    current_user: dict = Depends(get_current_user)
):
    """Generate AI-powered practice questions and create a new practice session"""
    try:
        questions = gemini_service.generate_practice_questions(category, difficulty, count)
        if not questions:
            raise HTTPException(status_code=500, detail="Failed to generate questions")
        
        # Create a new practice session
        session_data = {
            'userId': current_user['uid'],
            'category': category,
            'difficulty': difficulty,
            'startedAt': datetime.utcnow().isoformat(),
            'totalQuestions': len(questions),
            'completedQuestions': 0,
            'questions': [],
            'averageScore': None
        }
        session = firebase_service.create_practice_session(session_data)
        
        return {
            "questions": questions,
            "count": len(questions),
            "sessionId": session['id']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

@router.post("/evaluate")
async def evaluate_practice_answer(
    request: PracticeAnswerRequest,
    current_user: dict = Depends(get_current_user)
):
    """Evaluate a practice answer with AI feedback and save to session"""
    try:
        evaluation = gemini_service.evaluate_practice_answer(
            question=request.question,
            answer=request.answer,
            category=request.category
        )
        
        # Save the answer to the practice session
        if request.sessionId:
            session = firebase_service.get_practice_session(request.sessionId)
            if session:
                # Add this question/answer to the session
                question_data = {
                    'question': request.question,
                    'answer': request.answer,
                    'score': evaluation['score'],
                    'feedback': evaluation['feedback'],
                    'answeredAt': datetime.utcnow().isoformat()
                }
                
                if 'questions' not in session:
                    session['questions'] = []
                session['questions'].append(question_data)
                session['completedQuestions'] = len(session['questions'])
                
                # Calculate average score
                scores = [q['score'] for q in session['questions']]
                session['averageScore'] = sum(scores) / len(scores) if scores else 0
                
                # Update the session
                firebase_service.update_practice_session(request.sessionId, {
                    'questions': session['questions'],
                    'completedQuestions': session['completedQuestions'],
                    'averageScore': session['averageScore']
                })
        
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluating answer: {str(e)}")

@router.post("/finish-session/{session_id}")
async def finish_practice_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark a practice session as completed"""
    try:
        session = firebase_service.get_practice_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if session['userId'] != current_user['uid']:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        firebase_service.update_practice_session(session_id, {
            'endedAt': datetime.utcnow().isoformat()
        })
        
        return {"message": "Session completed", "sessionId": session_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finishing session: {str(e)}")

@router.get("/history")
async def get_practice_history(
    limit: int = Query(20, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """Get user's practice history"""
    try:
        sessions = firebase_service.get_user_practice_sessions(current_user['uid'], limit)
        return {"sessions": sessions, "count": len(sessions)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")

@router.get("/session/{session_id}")
async def get_practice_session_detail(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get details of a specific practice session"""
    try:
        session = firebase_service.get_practice_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if session['userId'] != current_user['uid']:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching session: {str(e)}")

