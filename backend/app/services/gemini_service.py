import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.flash_model = genai.GenerativeModel('gemini-1.5-flash')
        self.pro_model = genai.GenerativeModel('gemini-1.5-pro')
    
    def generate_first_question(self, config: dict, user_profile: dict = None):
        prompt = self._build_first_question_prompt(config, user_profile)
        response = self.flash_model.generate_content(prompt)
        return self._extract_question(response.text)
    
    def evaluate_and_generate_next(self, config: dict, qa_history: list, current_answer: str):
        prompt = self._build_evaluation_prompt(config, qa_history, current_answer)
        response = self.pro_model.generate_content(prompt)
        return self._parse_evaluation_response(response.text)
    
    def _build_first_question_prompt(self, config: dict, user_profile: dict = None):
        interview_type = config.get('type', 'technical')
        role = config.get('role', 'Software Engineer')
        difficulty = config.get('difficulty', 'mid')
        
        prompt = f"""You are an expert interviewer conducting a {interview_type} interview for a {role} position at {difficulty} level.

Generate the first interview question. Make it relevant, realistic, and appropriate for the difficulty level.

For technical interviews:
- DSA: Focus on algorithms, data structures, problem-solving
- System Design: Focus on scalability, architecture, trade-offs

For behavioral interviews:
- Use STAR method framework
- Focus on past experiences, leadership, teamwork

For HR interviews:
- Focus on motivations, culture fit, career goals

Return only the question text, nothing else."""
        
        return prompt
    
    def _build_evaluation_prompt(self, config: dict, qa_history: list, current_answer: str):
        interview_type = config.get('type', 'technical')
        difficulty = config.get('difficulty', 'mid')
        
        history_text = "\n".join([
            f"Q: {qa['questionText']}\nA: {qa['answerText']}" 
            for qa in qa_history[-3:]  # Last 3 Q&A for context
        ])
        
        prompt = f"""You are an expert interviewer evaluating a candidate's response in a {interview_type} interview at {difficulty} level.

Previous Q&A:
{history_text}

Current Answer:
{current_answer}

Evaluate the answer and provide:
1. Score (0-100)
2. Feedback (what was good, what could be improved)
3. A model/ideal answer
4. List of strengths (2-3 points)
5. List of improvements (2-3 points)
6. Next follow-up question (or "INTERVIEW_COMPLETE" if enough questions asked)

Return response as JSON:
{{
  "score": 75,
  "feedback": "...",
  "modelAnswer": "...",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "nextQuestion": "..." or "INTERVIEW_COMPLETE"
}}"""
        
        return prompt
    
    def _extract_question(self, text: str) -> str:
        # Clean up response to get just the question
        return text.strip().replace('"', '').replace("'", "")
    
    def _parse_evaluation_response(self, text: str) -> dict:
        try:
            # Try to extract JSON from response
            start_idx = text.find('{')
            end_idx = text.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                # Fallback parsing
                return {
                    "score": 70,
                    "feedback": "Good attempt. Continue practicing.",
                    "modelAnswer": "A comprehensive answer would cover...",
                    "strengths": ["Clear communication"],
                    "improvements": ["Add more specific examples"],
                    "nextQuestion": "Can you elaborate on your experience with..."
                }
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            return {
                "score": 70,
                "feedback": text[:200],
                "modelAnswer": "See feedback for improvement areas.",
                "strengths": ["Effort shown"],
                "improvements": ["More detail needed"],
                "nextQuestion": "Let's move to the next topic..."
            }

gemini_service = GeminiService()
