from fastapi import APIRouter, Depends, HTTPException, Request
from datetime import datetime
from app.models.schemas import StartInterviewRequest, SubmitAnswerRequest
from app.services.firebase_service import firebase_service
from app.services.gemini_service import gemini_service
from app.middleware.auth import get_current_user
from pydantic import BaseModel
from typing import List
import uuid

router = APIRouter(prefix="/api/interviews", tags=["interviews"])

class QuestionSetRequest(BaseModel):
    config: dict
    count: int = 5

class RegenerateQuestionRequest(BaseModel):
    config: dict
    questionId: str

class StartWithQuestionsRequest(BaseModel):
    config: dict
    questions: List[dict]

@router.post("/start")
async def start_interview(request: Request, req: StartInterviewRequest, user: dict = Depends(get_current_user)):
    try:
        print(f"Starting interview for user: {user['uid']}")
        print(f"Interview config: {req.config.dict()}")
        
        # Generate first question using Gemini
        first_question = gemini_service.generate_first_question(
            config=req.config.dict(),
            user_profile=user
        )
        
        # Create interview document
        interview_data = {
            "userId": user['uid'],
            "config": req.config.dict(),
            "startedAt": datetime.now().isoformat(),
            "status": "in_progress",
            "transcript": "",
            "qa": [],
            "firstQuestion": first_question
        }
        
        interview = firebase_service.create_interview(interview_data)
        
        print(f"Interview created with ID: {interview['id']}")
        
        return {
            "interviewId": interview['id'],
            "firstQuestion": first_question
        }
    except Exception as e:
        print(f"Error starting interview: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")

@router.post("/{interview_id}/answer")
async def submit_answer(
    interview_id: str,
    request: SubmitAnswerRequest,
    user: dict = Depends(get_current_user)
):
    try:
        # Get interview
        interview = firebase_service.get_interview(interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        if interview['userId'] != user['uid']:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Get current question (last one or first question)
        if interview['qa']:
            current_question = interview['qa'][-1]['questionText']
        else:
            current_question = interview.get('firstQuestion', '')
        
        # Evaluate answer using Gemini
        result = gemini_service.evaluate_and_generate_next(
            config=interview['config'],
            qa_history=interview['qa'],
            current_answer=request.answerText
        )
        
        # Create QA entry
        qa_entry = {
            "questionId": str(uuid.uuid4()),
            "questionText": current_question,
            "answerText": request.answerText,
            "startTs": int(datetime.now().timestamp() * 1000) - request.elapsedMs,
            "endTs": int(datetime.now().timestamp() * 1000),
            "aiScore": result.get('score'),
            "aiFeedback": result.get('feedback'),
            "modelAnswer": result.get('modelAnswer')
        }
        
        # Update interview
        updated_qa = interview['qa'] + [qa_entry]
        firebase_service.update_interview(interview_id, {
            "qa": updated_qa,
            "transcript": interview.get('transcript', '') + f"\nQ: {current_question}\nA: {request.answerText}\n"
        })
        
        # Determine next question
        # Check if we have pre-generated questions
        pre_generated_questions = interview.get('questions', [])
        if pre_generated_questions and len(updated_qa) < len(pre_generated_questions):
            # Use next pre-generated question
            next_question = pre_generated_questions[len(updated_qa)]
        else:
            # Use AI-generated next question or mark complete
            next_question = result.get('nextQuestion', '')
        
        # Check if interview is complete
        if next_question == "INTERVIEW_COMPLETE" or len(updated_qa) >= 10 or (pre_generated_questions and len(updated_qa) >= len(pre_generated_questions)):
            return {
                "nextQuestion": None,
                "evaluation": result,
                "completed": True
            }
        
        return {
            "nextQuestion": next_question,
            "evaluation": result,
            "completed": False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit answer: {str(e)}")

@router.post("/{interview_id}/finish")
async def finish_interview(interview_id: str, user: dict = Depends(get_current_user)):
    try:
        interview = firebase_service.get_interview(interview_id)
        if not interview or interview['userId'] != user['uid']:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Calculate overall score from evaluation scores
        scores = []
        for qa in interview['qa']:
            if qa.get('evaluation') and qa['evaluation'].get('score'):
                scores.append(qa['evaluation']['score'])
            elif qa.get('aiScore'):
                scores.append(qa['aiScore'])
        overall_score = sum(scores) / len(scores) if scores else 0
        
        # Calculate metrics
        response_times = [
            (qa['endTs'] - qa['startTs']) / 1000 
            for qa in interview['qa']
        ]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        firebase_service.update_interview(interview_id, {
            "status": "completed",
            "endedAt": datetime.now(),
            "overallScore": round(overall_score, 1),
            "metrics": {
                "avgResponseTime": round(avg_response_time, 2),
                "fillerCount": 0,  # Client-side calculated
                "confidenceScore": 0,  # Client-side calculated
                "wordCount": 0  # Client-side calculated
            }
        })
        
        return {
            "reportId": interview_id,
            "overallScore": round(overall_score, 1)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to finish interview: {str(e)}")

@router.get("/{interview_id}")
async def get_interview(interview_id: str, user: dict = Depends(get_current_user)):
    interview = firebase_service.get_interview(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    if interview['userId'] != user['uid'] and user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return interview

@router.get("")
async def get_user_interviews(user: dict = Depends(get_current_user)):
    interviews = firebase_service.get_user_interviews(user['uid'])
    return {"interviews": interviews}

@router.get("/{interview_id}/ai-feedback")
async def get_ai_feedback(interview_id: str, user: dict = Depends(get_current_user)):
    """Get comprehensive AI feedback on the entire interview"""
    try:
        interview = firebase_service.get_interview(interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        if interview['userId'] != user['uid']:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Generate comprehensive feedback
        qa_history = interview.get('qa', [])
        if not qa_history:
            return {"feedback": "No answers submitted yet"}
        
        # Calculate aggregate metrics
        scores = [qa.get('aiScore', 0) for qa in qa_history if qa.get('aiScore')]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # Collect all feedback
        feedback_summary = {
            "overallScore": round(avg_score, 1),
            "totalQuestions": len(qa_history),
            "answeredQuestions": len([qa for qa in qa_history if qa.get('answerText')]),
            "averageScore": round(avg_score, 1),
            "strengths": [],
            "improvements": [],
            "detailedFeedback": []
        }
        
        # Aggregate strengths and improvements
        all_strengths = []
        all_improvements = []
        
        for qa in qa_history:
            if 'strengths' in qa:
                all_strengths.extend(qa['strengths'])
            if 'improvements' in qa:
                all_improvements.extend(qa['improvements'])
        
        # Get unique items
        feedback_summary['strengths'] = list(set(all_strengths))[:5]
        feedback_summary['improvements'] = list(set(all_improvements))[:5]
        
        # Add detailed feedback per question
        for i, qa in enumerate(qa_history):
            feedback_summary['detailedFeedback'].append({
                "questionNumber": i + 1,
                "question": qa.get('questionText', ''),
                "score": qa.get('aiScore', 0),
                "feedback": qa.get('aiFeedback', ''),
                "modelAnswer": qa.get('modelAnswer', '')
            })
        
        return feedback_summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get AI feedback: {str(e)}")

@router.post("/generate-question-set")
async def generate_question_set(
    request: QuestionSetRequest,
    user: dict = Depends(get_current_user)
):
    """Generate a full set of questions before starting the interview"""
    try:
        questions = gemini_service.generate_question_set(
            config=request.config,
            count=request.count
        )
        
        # Format questions with IDs
        formatted_questions = [
            {
                "id": str(uuid.uuid4()),
                "text": q,
                "order": i
            }
            for i, q in enumerate(questions)
        ]
        
        return {
            "questions": formatted_questions,
            "count": len(formatted_questions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")

@router.post("/regenerate-question")
async def regenerate_question(
    request: RegenerateQuestionRequest,
    user: dict = Depends(get_current_user)
):
    """Regenerate a single question"""
    try:
        new_question = gemini_service.generate_first_question(
            config=request.config,
            user_profile=user
        )
        
        return {
            "question": {
                "id": request.questionId,
                "text": new_question,
                "order": 0  # Will be updated by frontend
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to regenerate question: {str(e)}")

@router.post("/start-with-questions")
async def start_with_questions(
    request: StartWithQuestionsRequest,
    user: dict = Depends(get_current_user)
):
    """Start interview with pre-generated questions"""
    try:
        # Create interview document with pre-generated questions
        interview_data = {
            "userId": user['uid'],
            "config": request.config,
            "startedAt": datetime.now().isoformat(),
            "status": "in_progress",
            "transcript": "",
            "qa": [],
            "questions": [q['text'] for q in request.questions],
            "currentQuestionIndex": 0,
            "firstQuestion": request.questions[0]['text'] if request.questions else ""
        }
        
        interview = firebase_service.create_interview(interview_data)
        
        return {
            "interviewId": interview['id'],
            "firstQuestion": interview['firstQuestion']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")
        
        for qa in qa_history:
            if qa.get('aiFeedback'):
                feedback_summary["detailedFeedback"].append({
                    "question": qa.get('questionText'),
                    "answer": qa.get('answerText'),
                    "score": qa.get('aiScore'),
                    "feedback": qa.get('aiFeedback'),
                    "modelAnswer": qa.get('modelAnswer')
                })
        
        return feedback_summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get AI feedback: {str(e)}")
