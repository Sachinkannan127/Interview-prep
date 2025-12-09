from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from app.middleware.auth import get_current_user, require_admin
from app.services.gemini_service import gemini_service
from typing import Optional

router = APIRouter(prefix="/api/questions", tags=["questions"])

class PracticeAnswerRequest(BaseModel):
    question: str
    answer: str
    category: str

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
    count: int = Query(5, ge=1, le=10, description="Number of questions to generate")
):
    """Generate AI-powered practice questions"""
    try:
        questions = gemini_service.generate_practice_questions(category, difficulty, count)
        if not questions:
            raise HTTPException(status_code=500, detail="Failed to generate questions")
        return {"questions": questions, "count": len(questions)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

@router.post("/evaluate")
async def evaluate_practice_answer(request: PracticeAnswerRequest):
    """Evaluate a practice answer with AI feedback"""
    try:
        evaluation = gemini_service.evaluate_practice_answer(
            question=request.question,
            answer=request.answer,
            category=request.category
        )
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluating answer: {str(e)}")
