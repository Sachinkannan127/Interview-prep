from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import google.generativeai as genai
import os
from typing import Dict, List
import PyPDF2
import io
import docx
import re

router = APIRouter()

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(io.BytesIO(file_content))
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading DOCX: {str(e)}")

def extract_text_from_txt(file_content: bytes) -> str:
    """Extract text from TXT file"""
    try:
        return file_content.decode('utf-8', errors='ignore').strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading TXT: {str(e)}")

def parse_resume_analysis(response_text: str) -> Dict:
    """Parse the AI response into structured data"""
    try:
        # Extract score
        score_match = re.search(r'Score:\s*(\d+)', response_text, re.IGNORECASE)
        score = int(score_match.group(1)) if score_match else 75
        
        # Extract sections
        strengths = []
        improvements = []
        recommendations = []
        
        # Split by sections
        sections = response_text.split('\n\n')
        current_section = None
        
        for section in sections:
            section = section.strip()
            if 'strength' in section.lower() and ':' in section:
                current_section = 'strengths'
                continue
            elif 'improvement' in section.lower() and ':' in section:
                current_section = 'improvements'
                continue
            elif 'recommendation' in section.lower() and ':' in section:
                current_section = 'recommendations'
                continue
            
            # Extract bullet points
            lines = section.split('\n')
            for line in lines:
                line = line.strip()
                if line and (line.startswith('-') or line.startswith('•') or line.startswith('*')):
                    clean_line = re.sub(r'^[-•*]\s*', '', line)
                    if current_section == 'strengths':
                        strengths.append(clean_line)
                    elif current_section == 'improvements':
                        improvements.append(clean_line)
                    elif current_section == 'recommendations':
                        recommendations.append(clean_line)
        
        return {
            'score': min(max(score, 0), 100),  # Ensure score is between 0-100
            'strengths': strengths[:5],  # Limit to 5 items
            'improvements': improvements[:5],
            'recommendations': recommendations[:5]
        }
    except Exception as e:
        print(f"[WARNING] Error parsing resume analysis: {str(e)}")
        # Return default structure if parsing fails
        return {
            'score': 75,
            'strengths': ['Resume received and processed'],
            'improvements': ['Could not parse detailed analysis'],
            'recommendations': ['Please try uploading again']
        }

@router.post("/analyze-resume")
async def analyze_resume(resume: UploadFile = File(...)):
    """
    Analyze a resume and provide ATS score, strengths, improvements, and recommendations
    """
    try:
        # Check file type
        if resume.content_type not in [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ]:
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload PDF, DOC, DOCX, or TXT file"
            )
        
        # Read file content
        file_content = await resume.read()
        
        # Extract text based on file type
        if resume.content_type == 'application/pdf':
            resume_text = extract_text_from_pdf(file_content)
        elif resume.content_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            resume_text = extract_text_from_docx(file_content)
        elif resume.content_type == 'text/plain':
            resume_text = extract_text_from_txt(file_content)
        else:
            # For .doc files, try to read as text
            resume_text = extract_text_from_txt(file_content)
        
        if not resume_text or len(resume_text) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract enough text from the resume. Please ensure the file is not empty or corrupted."
            )
        
        # Generate analysis using Gemini AI
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""You are an expert resume analyzer and ATS (Applicant Tracking System) consultant. 
Analyze the following resume and provide:

1. An overall ATS compatibility score (0-100)
2. Key strengths (3-5 points)
3. Areas for improvement (3-5 points)
4. Specific recommendations to improve the resume (3-5 points)

Resume Content:
{resume_text[:4000]}

Format your response exactly like this:

Score: [number between 0-100]

Strengths:
- [strength 1]
- [strength 2]
- [strength 3]

Areas for Improvement:
- [improvement 1]
- [improvement 2]
- [improvement 3]

Recommendations:
- [recommendation 1]
- [recommendation 2]
- [recommendation 3]

Be specific, actionable, and professional in your analysis."""

        print("[OK] Sending resume to Gemini AI for analysis...")
        response = model.generate_content(prompt)
        response_text = response.text
        print("[OK] Received analysis from Gemini AI")
        
        # Parse the response
        analysis = parse_resume_analysis(response_text)
        
        return JSONResponse(content=analysis)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Resume analysis failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze resume: {str(e)}"
        )
