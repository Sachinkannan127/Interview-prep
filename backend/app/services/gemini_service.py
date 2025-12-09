import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key and api_key != 'your_gemini_api_key_here':
            try:
                genai.configure(api_key=api_key)
                # Use the stable Gemini models - correct model names for API v1
                self.flash_model = genai.GenerativeModel('gemini-1.5-flash')
                self.pro_model = genai.GenerativeModel('gemini-1.5-pro')
                self.initialized = True
                print("Success: Gemini AI initialized successfully")
            except Exception as e:
                print(f"Warning: Failed to initialize Gemini AI: {e}")
                print("Backend will run with fallback questions")
                self.flash_model = None
                self.pro_model = None
                self.initialized = False
        else:
            print("Warning: Gemini API key not configured")
            print("Backend will run with fallback questions")
            self.flash_model = None
            self.pro_model = None
            self.initialized = False
    
    def generate_first_question(self, config: dict, user_profile: dict = None):
        if not self.initialized:
            # Fallback questions when AI is not available
            fallback_questions = {
                'technical': {
                    'entry': "Explain the difference between let, const, and var in JavaScript.",
                    'mid': "How would you implement a binary search algorithm?",
                    'senior': "Design a scalable microservices architecture for an e-commerce platform."
                },
                'behavioral': {
                    'entry': "Tell me about a time when you had to learn something new quickly.",
                    'mid': "Describe a situation where you had to work with a difficult team member.",
                    'senior': "How have you handled a major project failure in the past?"
                },
                'hr': {
                    'entry': "Why do you want to work for our company?",
                    'mid': "Where do you see yourself in 3-5 years?",
                    'senior': "How would you describe your leadership style?"
                }
            }
            
            interview_type = config.get('type', 'technical')
            difficulty = config.get('difficulty', 'mid')
            
            return fallback_questions.get(interview_type, fallback_questions['technical']).get(difficulty, fallback_questions['technical']['mid'])
        
        prompt = self._build_first_question_prompt(config, user_profile)
        try:
            response = self.flash_model.generate_content(prompt)
            return self._extract_question(response.text)
        except Exception as e:
            print(f"Gemini API error: {e}")
            # Fallback to predefined questions
            self.initialized = False  # Disable for subsequent calls
            return self.generate_first_question(config, user_profile)
    
    def evaluate_and_generate_next(self, config: dict, qa_history: list, current_answer: str):
        if not self.initialized:
            # Fallback evaluation when AI is not available
            score = 75  # Default good score
            feedback = "Good answer! You demonstrated solid understanding."
            
            # Generate next question based on history
            question_count = len(qa_history) + 1
            if question_count >= 5:
                return {
                    "score": score,
                    "feedback": feedback,
                    "modelAnswer": "A comprehensive answer would show clear understanding and examples.",
                    "strengths": ["Clear communication", "Good structure"],
                    "improvements": ["Add more specific examples"],
                    "nextQuestion": "INTERVIEW_COMPLETE"
                }
            
            # Simple next questions
            next_questions = [
                "Can you provide a specific example from your experience?",
                "How would you handle this situation differently now?",
                "What challenges did you face and how did you overcome them?",
                "Can you elaborate on the technical details?",
                "What was the outcome and what did you learn?"
            ]
            
            return {
                "score": score,
                "feedback": feedback,
                "modelAnswer": "A strong answer includes specific examples and demonstrates problem-solving skills.",
                "strengths": ["Good understanding", "Clear explanation"],
                "improvements": ["Add more technical details"],
                "nextQuestion": next_questions[question_count % len(next_questions)]
            }
        prompt = self._build_evaluation_prompt(config, qa_history, current_answer)
        try:
            response = self.pro_model.generate_content(prompt)
            return self._parse_evaluation_response(response.text)
        except Exception as e:
            print(f"Gemini API error: {e}")
            # Fallback to predefined evaluation
            self.initialized = False  # Disable for subsequent calls
            return self.evaluate_and_generate_next(config, qa_history, current_answer)
            return self.evaluate_and_generate_next(config, qa_history, current_answer)
    
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
    def generate_practice_questions(self, category: str, difficulty: str, count: int = 5):
        """Generate multiple practice questions for quick practice mode"""
        if not self.initialized:
            return self._get_fallback_questions(category, difficulty, count)
        
        prompt = f"""Generate {count} {category} interview questions at {difficulty} level.

Category Guidelines:
- technical: Programming, algorithms, system design, data structures
- behavioral: STAR method questions about past experiences
- hr: Career goals, company fit, motivations

Difficulty Levels:
- entry: Basic concepts, foundational knowledge
- mid: Intermediate complexity, practical experience
- senior: Advanced topics, leadership, architecture

Return as JSON array:
[
  {{
    "question": "...",
    "category": "{category}",
    "difficulty": "{difficulty}",
    "hints": ["hint1", "hint2"],
    "topics": ["topic1", "topic2"]
  }}
]"""
        
        try:
            response = self.flash_model.generate_content(prompt)
            questions = self._parse_questions_response(response.text)
            if questions:
                return questions
        except Exception as e:
            print(f"Gemini API error in practice questions: {e}")
        
        # Return fallback questions if AI fails
        return self._get_fallback_questions(category, difficulty, count)
    
    def evaluate_practice_answer(self, question: str, answer: str, category: str):
        """Quick evaluation for practice mode"""
        if not self.initialized:
            return {
                "score": 75,
                "feedback": "Your answer shows understanding. Keep practicing!",
                "keyPoints": ["Consider adding more details", "Good structure"]
            }
        
        prompt = f"""Evaluate this {category} interview answer:

Question: {question}
Answer: {answer}

Provide brief evaluation with:
1. Score (0-100)
2. Short feedback (2-3 sentences)
3. Key points (2-3 bullet points)

Return as JSON:
{{
  "score": 85,
  "feedback": "...",
  "keyPoints": ["...", "..."]
}}"""
        
        try:
            response = self.flash_model.generate_content(prompt)
            return self._parse_practice_evaluation(response.text)
        except Exception as e:
            print(f"Gemini API error in practice evaluation: {e}")
            return {
                "score": 70,
                "feedback": "Thank you for your response. Keep practicing!",
                "keyPoints": ["Good effort", "Practice more examples"]
            }
    
    def _parse_questions_response(self, text: str) -> list:
        try:
            start_idx = text.find('[')
            end_idx = text.rfind(']') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = text[start_idx:end_idx]
                return json.loads(json_str)
        except Exception as e:
            print(f"Error parsing questions: {e}")
        return []
    
    def _parse_practice_evaluation(self, text: str) -> dict:
        try:
            start_idx = text.find('{')
            end_idx = text.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = text[start_idx:end_idx]
                return json.loads(json_str)
        except:
            pass
        return {
            "score": 70,
            "feedback": "Good attempt!",
            "keyPoints": ["Keep practicing"]
        }
    
    def _get_fallback_questions(self, category: str, difficulty: str, count: int) -> list:
        """Fallback questions when AI is not available"""
        import random
        
        fallback_questions = {
            "technical": [
                {"question": "Explain the difference between == and === in JavaScript", "category": "technical", "difficulty": "entry", "hints": ["Type coercion", "Strict equality"], "topics": ["javascript", "operators"]},
                {"question": "What is the time complexity of binary search?", "category": "technical", "difficulty": "entry", "hints": ["Divide and conquer", "Logarithmic"], "topics": ["algorithms", "complexity"]},
                {"question": "Explain how closures work in JavaScript", "category": "technical", "difficulty": "mid", "hints": ["Scope", "Function memory"], "topics": ["javascript", "closures"]},
                {"question": "What is the difference between SQL and NoSQL databases?", "category": "technical", "difficulty": "mid", "hints": ["Structure", "Scalability"], "topics": ["databases", "architecture"]},
                {"question": "Explain the concept of Big O notation", "category": "technical", "difficulty": "entry", "hints": ["Algorithm efficiency", "Time complexity"], "topics": ["algorithms", "performance"]},
                {"question": "Design a URL shortening service like bit.ly", "category": "technical", "difficulty": "senior", "hints": ["Database design", "Hashing", "Distributed systems"], "topics": ["system-design", "scalability"]},
                {"question": "How would you implement a rate limiter?", "category": "technical", "difficulty": "senior", "hints": ["Token bucket", "Sliding window"], "topics": ["system-design", "algorithms"]},
                {"question": "What are the differences between REST and GraphQL?", "category": "technical", "difficulty": "mid", "hints": ["Query flexibility", "API design"], "topics": ["api", "architecture"]},
            ],
            "behavioral": [
                {"question": "Tell me about a time you faced a difficult challenge at work", "category": "behavioral", "difficulty": "mid", "hints": ["STAR method", "Specific example"], "topics": ["problem-solving", "resilience"]},
                {"question": "Describe a situation where you had to work with a difficult team member", "category": "behavioral", "difficulty": "mid", "hints": ["Conflict resolution", "Communication"], "topics": ["teamwork", "communication"]},
                {"question": "Tell me about a time you failed and what you learned from it", "category": "behavioral", "difficulty": "mid", "hints": ["Self-awareness", "Growth mindset"], "topics": ["learning", "resilience"]},
                {"question": "Describe a situation where you had to meet a tight deadline", "category": "behavioral", "difficulty": "mid", "hints": ["Time management", "Prioritization"], "topics": ["productivity", "pressure"]},
                {"question": "Tell me about a time you had to learn something new quickly", "category": "behavioral", "difficulty": "entry", "hints": ["Learning approach", "Adaptability"], "topics": ["learning", "growth"]},
                {"question": "Describe a situation where you showed leadership", "category": "behavioral", "difficulty": "senior", "hints": ["Initiative", "Team influence"], "topics": ["leadership", "influence"]},
            ],
            "hr": [
                {"question": "Why do you want to work for our company?", "category": "hr", "difficulty": "entry", "hints": ["Research company", "Align with values"], "topics": ["motivation", "culture-fit"]},
                {"question": "Where do you see yourself in 5 years?", "category": "hr", "difficulty": "entry", "hints": ["Career goals", "Growth"], "topics": ["career-planning", "ambition"]},
                {"question": "What are your salary expectations?", "category": "hr", "difficulty": "mid", "hints": ["Market research", "Value proposition"], "topics": ["negotiation", "compensation"]},
                {"question": "Why are you leaving your current job?", "category": "hr", "difficulty": "mid", "hints": ["Stay positive", "Growth focused"], "topics": ["career-transition", "motivation"]},
                {"question": "What is your greatest strength?", "category": "hr", "difficulty": "entry", "hints": ["Job relevant", "Specific examples"], "topics": ["self-awareness", "skills"]},
                {"question": "What is your greatest weakness?", "category": "hr", "difficulty": "entry", "hints": ["Show self-awareness", "Improvement steps"], "topics": ["self-awareness", "growth"]},
            ]
        }
        
        questions = fallback_questions.get(category, fallback_questions["technical"])
        # Shuffle and return requested count
        random.shuffle(questions)
        return questions[:count]

gemini_service = GeminiService()
