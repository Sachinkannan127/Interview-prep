from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    context: str = "general"

class ChatResponse(BaseModel):
    response: str

@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    AI Chat assistant for interview help
    """
    try:
        # Create context-aware prompt
        system_prompt = """You are an AI Interview Assistant. Your role is to:
        - Help candidates prepare for interviews
        - Explain technical concepts clearly
        - Provide interview tips and strategies
        - Answer questions about interview processes
        - Give constructive feedback
        
        Be concise, helpful, and encouraging. Keep responses under 150 words."""
        
        full_prompt = f"{system_prompt}\n\nUser Question: {request.message}\n\nAssistant:"
        
        # Use Gemini to generate response
        response = gemini_service.generate_chat_response(full_prompt)
        
        return ChatResponse(response=response)
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate chat response"
        )
