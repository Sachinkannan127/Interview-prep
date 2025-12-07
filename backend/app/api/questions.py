from fastapi import APIRouter, Depends
from app.middleware.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/questions", tags=["questions"])

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
