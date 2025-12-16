from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import google.generativeai as genai
import os

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class ChatMessage(BaseModel):
    message: str

@router.post("/assistant")
async def chat_assistant(chat_message: ChatMessage):
    """
    AI Interview Assistant - provides interview tips, answers questions, and gives guidance
    """
    try:
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        # Use same model configuration as gemini_service
        model_name = os.getenv('GEMINI_MODEL', 'gemma-3-27b-it')
        model = genai.GenerativeModel(model_name)
        
        # System prompt to guide the AI assistant
        prompt = f"""You are an expert interview coach and career advisor with 20+ years of experience. 
Your role is to help candidates prepare for job interviews by:
- Answering questions about interview techniques and strategies
- Providing sample answers to common interview questions
- Giving tips on behavioral, technical, and case interviews
- Suggesting best practices for resume, body language, and communication
- Offering personalized feedback and guidance

User's question: {chat_message.message}

Provide a helpful, professional, and encouraging response. Keep your answer concise but comprehensive (2-4 paragraphs).
Use bullet points where appropriate for clarity."""

        print(f"[OK] Processing chat request: {chat_message.message[:50]}...")
        response = model.generate_content(prompt)
        response_text = response.text
        print("[OK] Generated AI response successfully")
        
        return JSONResponse(content={
            "response": response_text,
            "status": "success"
        })
        
    except Exception as e:
        print(f"[ERROR] Chat assistant failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process your request: {str(e)}"
        )
