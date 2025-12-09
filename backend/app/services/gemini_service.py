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
        print(f"=== GEMINI: generate_first_question called ===")
        print(f"Initialized: {self.initialized}")
        print(f"Config: {config}")
        
        if not self.initialized:
            print("WARNING: Gemini not initialized, using fallback questions")
            # Fallback questions when AI is not available
            sub_type = config.get('subType', 'dsa')
            fallback_questions = {
                'technical': {
                    'dsa': {
                        'entry': "Write a function to reverse a string in your preferred language.",
                        'mid': "Implement a function to find the longest substring without repeating characters.",
                        'senior': "Design an algorithm to find the median of two sorted arrays with O(log(m+n)) complexity."
                    },
                    'java': {
                        'entry': "Explain the difference between == and .equals() in Java.",
                        'mid': "How does garbage collection work in Java? Explain the different types of GC.",
                        'senior': "Design a thread-safe singleton class in Java with lazy initialization."
                    },
                    'react': {
                        'entry': "What is the difference between state and props in React?",
                        'mid': "Explain React hooks and how useEffect works. Give practical examples.",
                        'senior': "How would you optimize a React application with large lists? Discuss virtualization and memoization."
                    },
                    'dotnet': {
                        'entry': "What is the difference between value types and reference types in C#?",
                        'mid': "Explain async/await in C# and when you would use it.",
                        'senior': "Design a microservices architecture using .NET Core with proper error handling and resilience."
                    },
                    'python': {
                        'entry': "What is the difference between lists and tuples in Python?",
                        'mid': "Explain decorators in Python and give a practical example.",
                        'senior': "How would you design a scalable web scraping system using Python?"
                    },
                    'nodejs': {
                        'entry': "What is the event loop in Node.js and how does it work?",
                        'mid': "Explain the difference between callbacks, promises, and async/await in Node.js.",
                        'senior': "Design a scalable REST API with Node.js that handles 10,000 concurrent requests."
                    },
                    'angular': {
                        'entry': "What is dependency injection in Angular?",
                        'mid': "Explain the difference between ngOnInit and constructor in Angular components.",
                        'senior': "How would you implement lazy loading and route guards in a large Angular application?"
                    },
                    'spring-boot': {
                        'entry': "What is Spring Boot and how is it different from Spring Framework?",
                        'mid': "Explain dependency injection in Spring Boot and the different types of autowiring.",
                        'senior': "Design a microservices architecture using Spring Boot with service discovery and API Gateway."
                    },
                    'microservices': {
                        'entry': "What are microservices and how are they different from monolithic architecture?",
                        'mid': "Explain service discovery and API Gateway patterns in microservices.",
                        'senior': "Design a distributed transaction management system for microservices with saga pattern."
                    },
                    'cloud': {
                        'entry': "What is the difference between IaaS, PaaS, and SaaS?",
                        'mid': "Explain AWS Lambda and when you would use serverless architecture.",
                        'senior': "Design a multi-region, highly available cloud architecture with auto-scaling and disaster recovery."
                    },
                    'devops': {
                        'entry': "What is CI/CD and why is it important?",
                        'mid': "Explain Docker containers and how they differ from virtual machines.",
                        'senior': "Design a complete CI/CD pipeline with automated testing, security scanning, and blue-green deployment."
                    },
                    'database': {
                        'entry': "What is the difference between SQL and NoSQL databases?",
                        'mid': "Explain database normalization and give examples up to 3NF.",
                        'senior': "Design a database schema for a social media platform handling millions of users with optimal query performance."
                    },
                    'fresher': {
                        'entry': "What are the four pillars of Object-Oriented Programming?",
                        'mid': "Explain the difference between abstract classes and interfaces.",
                        'senior': "How would you approach learning a new programming language or framework?"
                    },
                    'system-design': {
                        'entry': "What factors do you consider when designing a scalable system?",
                        'mid': "Design a URL shortener service like bit.ly.",
                        'senior': "Design a distributed caching system like Redis with high availability and consistency."
                    }
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
            
            if interview_type == 'technical' and sub_type in fallback_questions['technical']:
                return fallback_questions['technical'][sub_type].get(difficulty, fallback_questions['technical'][sub_type]['mid'])
            
            return fallback_questions.get(interview_type, fallback_questions['technical']['dsa']).get(difficulty, "Tell me about your experience with software development.")
        
        prompt = self._build_first_question_prompt(config, user_profile)
        try:
            print(f"=== GEMINI: Calling API with prompt ===")
            print(f"Prompt length: {len(prompt)} chars")
            response = self.flash_model.generate_content(prompt)
            question = self._extract_question(response.text)
            print(f"=== GEMINI: Success! Generated question ===")
            print(f"Question: {question[:100]}...")
            return question
        except Exception as e:
            print(f"=== GEMINI: API ERROR ===")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            import traceback
            traceback.print_exc()
            # Fallback to predefined questions
            self.initialized = False  # Disable for subsequent calls
            print("Falling back to predefined questions")
            return self.generate_first_question(config, user_profile)
    
    def evaluate_and_generate_next(self, config: dict, qa_history: list, current_answer: str):
        print(f"=== GEMINI: evaluate_and_generate_next called ===")
        print(f"Initialized: {self.initialized}")
        print(f"QA History length: {len(qa_history)}")
        
        if not self.initialized:
            print("WARNING: Gemini not initialized, using fallback evaluation")
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
            print(f"=== GEMINI: Calling evaluation API ===")
            print(f"Prompt length: {len(prompt)} chars")
            response = self.pro_model.generate_content(prompt)
            result = self._parse_evaluation_response(response.text)
            print(f"=== GEMINI: Evaluation success ===")
            print(f"Score: {result.get('score')}, Next: {result.get('nextQuestion', 'N/A')[:50]}")
            return result
        except Exception as e:
            print(f"=== GEMINI: Evaluation API ERROR ===")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            import traceback
            traceback.print_exc()
            # Fallback to predefined evaluation
            self.initialized = False  # Disable for subsequent calls
            print("Falling back to predefined evaluation")
            return self.evaluate_and_generate_next(config, qa_history, current_answer)
    
    def _build_first_question_prompt(self, config: dict, user_profile: dict = None):
        interview_type = config.get('type', 'technical')
        sub_type = config.get('subType', '')
        role = config.get('role', 'Software Engineer')
        company = config.get('company', '')
        difficulty = config.get('difficulty', 'mid')
        
        company_context = f" at {company}" if company else ""
        
        prompt = f"""You are an expert interviewer conducting a {interview_type} interview for a {role} position{company_context} at {difficulty} level.

"""
        
        if interview_type == 'technical' and sub_type:
            tech_contexts = {
                'java': 'Focus on Java core concepts, OOP, collections, multithreading, JVM, Spring framework',
                'react': 'Focus on React hooks, component lifecycle, state management, Redux, performance optimization',
                'dotnet': 'Focus on .NET framework, C#, ASP.NET, Entity Framework, LINQ, design patterns',
                'python': 'Focus on Python core concepts, data structures, OOP, decorators, generators, Django/Flask',
                'nodejs': 'Focus on Node.js, Express, async/await, event loop, REST APIs, microservices',
                'angular': 'Focus on Angular components, services, dependency injection, RxJS, TypeScript',
                'spring-boot': 'Focus on Spring Boot, dependency injection, REST APIs, JPA, microservices architecture',
                'microservices': 'Focus on microservices patterns, API Gateway, service discovery, containerization, Kubernetes',
                'cloud': 'Focus on cloud platforms (AWS/Azure/GCP), serverless, containers, scalability, DevOps',
                'devops': 'Focus on CI/CD, Docker, Kubernetes, Jenkins, Git, infrastructure as code, monitoring',
                'database': 'Focus on SQL, database design, normalization, indexing, transactions, NoSQL, query optimization',
                'fresher': 'Focus on basic programming concepts, OOP, data structures, simple algorithms suitable for fresh graduates',
                'dsa': 'Focus on algorithms, data structures, problem-solving, time/space complexity',
                'system-design': 'Focus on scalability, architecture, trade-offs, distributed systems'
            }
            
            if sub_type in tech_contexts:
                prompt += f"{tech_contexts[sub_type]}\n\n"
        
        prompt += f"""Generate the first interview question. Make it relevant, realistic, and appropriate for the difficulty level.

For technical interviews:
- Entry level: Focus on fundamental concepts, basic syntax, common patterns
- Mid level: Test practical experience, problem-solving, design decisions
- Senior level: Architecture, scalability, trade-offs, complex scenarios

For behavioral interviews:
- Use STAR format questions (Situation, Task, Action, Result)
- Focus on real-world scenarios relevant to the role

For HR interviews:
- Ask about motivation, career goals, company fit
- Cultural alignment and soft skills

Important guidelines:
1. Ask ONE clear, specific question
2. Make it conversational and professional
3. Ensure it's relevant to the role and difficulty level
4. Keep it concise (1-3 sentences)
5. For coding questions, specify language preference if applicable

Return ONLY the question text, nothing else."""

        return prompt
    
    def _build_evaluation_prompt(self, config: dict, qa_history: list, current_answer: str):
        interview_type = config.get('type', 'technical')
        sub_type = config.get('subType', '')
        company = config.get('company', '')
        difficulty = config.get('difficulty', 'mid')
        
        history_text = "\n".join([
            f"Q: {qa['questionText']}\nA: {qa['answerText']}" 
            for qa in qa_history[-3:]  # Last 3 Q&A for context
        ])
        
        company_context = f" at {company}" if company else ""
        tech_context = f" focusing on {sub_type}" if sub_type else ""
        
        prompt = f"""You are an expert interviewer evaluating a candidate's response in a {interview_type} interview{tech_context}{company_context} at {difficulty} level.

Previous Q&A:
{history_text}

Current Answer:
{current_answer}

Evaluate the answer and provide:
1. Score (0-100) - Be realistic and consider the difficulty level and technology context
2. Feedback (what was good, what could be improved) - Be specific to the technology/sub-type
3. A model/ideal answer - Include technology-specific best practices
4. List of strengths (2-3 points)
5. List of improvements (2-3 points)
6. Next follow-up question (or "INTERVIEW_COMPLETE" if enough questions asked) - Make it relevant to {sub_type if sub_type else interview_type}

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
    
    def generate_question_set(self, config: dict, count: int = 5) -> list:
        """Generate a complete set of interview questions upfront"""
        print(f"=== GEMINI: generate_question_set called ===")
        print(f"Initialized: {self.initialized}, Count: {count}")
        
        if not self.initialized:
            print("WARNING: Gemini not initialized, using fallback questions")
            # Return fallback questions
            category = config.get('type', 'technical')
            difficulty = config.get('difficulty', 'mid')
            fallback = self._get_fallback_questions(category, difficulty, count)
            return [q['question'] for q in fallback]
        
        interview_type = config.get('type', 'technical')
        sub_type = config.get('subType', '')
        difficulty = config.get('difficulty', 'mid')
        role = config.get('role', 'Software Engineer')
        company = config.get('company', '')
        
        company_context = f" at {company}" if company else ""
        tech_context = f" focusing on {sub_type}" if sub_type else ""
        
        prompt = f"""You are an expert interviewer preparing a {interview_type} interview{tech_context}{company_context} at {difficulty} level for a {role} position.

Generate exactly {count} diverse interview questions that:
1. Cover different aspects of the role and technology
2. Progress naturally in complexity
3. Are realistic and commonly asked in actual interviews
4. Are specific to {sub_type if sub_type else interview_type}

Difficulty Guidelines:
- entry: Basic concepts, foundational knowledge, simple problem-solving
- mid: Intermediate complexity, practical experience, real-world scenarios
- senior: Advanced topics, architecture, leadership, complex problem-solving

Return ONLY the questions, one per line, numbered 1-{count}. No additional text or formatting."""
        
        try:
            print(f"=== GEMINI: Calling API for question set ===")
            response = self.flash_model.generate_content(prompt)
            questions_text = response.text.strip()
            
            # Parse numbered questions
            lines = questions_text.split('\n')
            questions = []
            for line in lines:
                line = line.strip()
                if line and any(line.startswith(f"{i}.") or line.startswith(f"{i})") for i in range(1, count + 2)):
                    # Remove number prefix
                    question = line.split('.', 1)[-1].split(')', 1)[-1].strip()
                    if question:
                        questions.append(question)
            
            # Ensure we have the right count
            if len(questions) < count:
                print(f"WARNING: Only got {len(questions)} questions, expected {count}")
                # Pad with fallback questions if needed
                category = config.get('type', 'technical')
                difficulty = config.get('difficulty', 'mid')
                fallback = self._get_fallback_questions(category, difficulty, count - len(questions))
                questions.extend([q['question'] for q in fallback])
            
            questions = questions[:count]  # Trim to exact count
            
            print(f"=== GEMINI: Successfully generated {len(questions)} questions ===")
            return questions
            
        except Exception as e:
            print(f"=== GEMINI: API ERROR in question set generation ===")
            print(f"Error: {str(e)}")
            import traceback
            traceback.print_exc()
            # Fallback to predefined questions
            category = config.get('type', 'technical')
            difficulty = config.get('difficulty', 'mid')
            fallback = self._get_fallback_questions(category, difficulty, count)
            return [q['question'] for q in fallback]

gemini_service = GeminiService()
