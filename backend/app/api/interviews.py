from fastapi import APIRouter, Depends, HTTPException, Request
from datetime import datetime
from app.models.schemas import StartInterviewRequest, SubmitAnswerRequest
from app.services.firebase_service import firebase_service
from app.services.gemini_service import gemini_service
from app.middleware.auth import get_current_user
import uuid

router = APIRouter(prefix="/api/interviews", tags=["interviews"])

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
        
        # Evaluate answer and get next question using Gemini
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
        
        # Check if interview is complete
        next_question = result.get('nextQuestion', '')
        if next_question == "INTERVIEW_COMPLETE" or len(updated_qa) >= 10:
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
        
        # Calculate overall score
        scores = [qa.get('aiScore', 0) for qa in interview['qa'] if qa.get('aiScore')]
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
