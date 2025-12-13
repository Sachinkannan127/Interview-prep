import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        print("\n" + "="*60)
        print("GEMINI SERVICE INITIALIZATION")
        print("="*60)
        
        api_key = os.getenv('GEMINI_API_KEY')
        print(f"API Key present: {api_key is not None}")
        print(f"API Key length: {len(api_key) if api_key else 0}")
        print(f"API Key starts with: {api_key[:10] if api_key and len(api_key) > 10 else 'N/A'}...")
        
        # Allow model override via environment variable
        model_name = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')
        if api_key and api_key != 'your_gemini_api_key_here':
            try:
                print("Configuring Gemini API...")
                genai.configure(api_key=api_key)
                print("Creating model instances...")
                # Use model_name for question generation (default: gemini-2.5-flash, can be gemma-3-27b)
                self.flash_model = genai.GenerativeModel(model_name)
                self.pro_model = genai.GenerativeModel(model_name)
                self.initialized = True
                print("✅ SUCCESS: Gemini AI initialized successfully")
                print(f"Flash Model: {self.flash_model._model_name}")
                print(f"Pro Model: {self.pro_model._model_name}")
                print(f"⚠️  Note: Using {model_name} for question generation")
                print("⚠️  Rate limit depends on selected model")
            except Exception as e:
                print(f"❌ ERROR: Failed to initialize Gemini AI")
                print(f"Error type: {type(e).__name__}")
                print(f"Error message: {str(e)}")
                import traceback
                traceback.print_exc()
                print("Backend will run with fallback questions")
                self.flash_model = None
                self.pro_model = None
                self.initialized = False
        else:
            print("❌ WARNING: Gemini API key not configured or invalid")
            print("Backend will run with fallback questions")
            self.flash_model = None
            self.pro_model = None
            self.initialized = False
        
        print("="*60 + "\n")
    
    def generate_first_question(self, config: dict, user_profile: dict = None):
        print("\n" + "="*60)
        print("GENERATE FIRST QUESTION")
        print("="*60)
        print(f"Initialized: {self.initialized}")
        print(f"Flash Model: {self.flash_model}")
        print(f"Pro Model: {self.pro_model}")
        print(f"Config received: {json.dumps(config, indent=2)}")
        print(f"User profile: {user_profile is not None}")
        
        if not self.initialized:
            print("❌ WARNING: Gemini not initialized, using fallback")
            return self._get_fallback_first_question(config)
        
        print("\n--- Building prompt ---")
        prompt = self._build_first_question_prompt(config, user_profile)
        print(f"Prompt length: {len(prompt)} characters")
        print(f"Prompt preview (first 200 chars):\n{prompt[:200]}...")
        
        try:
            print("\n--- Calling Gemini API ---")
            print(f"Using model: {self.flash_model._model_name if self.flash_model else 'None'}")
            print("Sending request to Gemini...")
            
            response = self.flash_model.generate_content(prompt)
            
            print("\n✅ API Response received!")
            print(f"Response type: {type(response)}")
            print(f"Response has text: {hasattr(response, 'text')}")
            
            if hasattr(response, 'text'):
                print(f"Response text length: {len(response.text)} chars")
                print(f"Response preview: {response.text[:200]}...")
                question = self._extract_question(response.text)
                print(f"\n✅ SUCCESS: Question generated!")
                print(f"Final question: {question}")
                print("="*60 + "\n")
                return question
            else:
                print("❌ ERROR: Response has no text attribute")
                print(f"Response object: {response}")
                raise Exception("Invalid response from Gemini API")
                
        except Exception as e:
            error_str = str(e)
            print(f"\n❌ GEMINI API ERROR")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {error_str}")
            
            # Check if it's a quota/rate limit error
            if ("429" in error_str or 
                "quota" in error_str.lower() or 
                "rate limit" in error_str.lower() or
                "exceeded your current quota" in error_str.lower() or
                "free_tier" in error_str.lower()):
                print("⚠️  QUOTA EXCEEDED: Using fallback questions")
                print(f"Quota error detected: {error_str[:200]}...")
                return self._get_fallback_first_question(config)
            
            print(f"Error details:")
            import traceback
            traceback.print_exc()
            print("="*60 + "\n")
            
            # For other errors, also use fallback
            print("⚠️  Using fallback due to API error")
            return self._get_fallback_first_question(config)
    
    def evaluate_and_generate_next(self, config: dict, qa_history: list, current_answer: str):
        print("\n" + "="*60)
        print("EVALUATE AND GENERATE NEXT")
        print("="*60)
        print(f"Initialized: {self.initialized}")
        print(f"Pro Model: {self.pro_model}")
        print(f"QA History length: {len(qa_history)}")
        print(f"Current answer length: {len(current_answer)} chars")
        print(f"Config: {json.dumps(config, indent=2)}")
        
        if not self.initialized:
            print("❌ WARNING: Gemini not initialized, using fallback")
            return self._get_fallback_evaluation(qa_history, current_answer, config)
            
        print("\n--- Building evaluation prompt ---")
        prompt = self._build_evaluation_prompt(config, qa_history, current_answer)
        print(f"Prompt length: {len(prompt)} characters")
        print(f"Prompt preview (first 300 chars):\n{prompt[:300]}...")
        
        try:
            print("\n--- Calling Gemini Evaluation API ---")
            print(f"Using model: {self.pro_model._model_name if self.pro_model else 'None'}")
            print("Sending evaluation request to Gemini...")
            
            response = self.pro_model.generate_content(prompt)
            
            print("\n✅ API Response received!")
            print(f"Response type: {type(response)}")
            print(f"Response has text: {hasattr(response, 'text')}")
            
            if hasattr(response, 'text'):
                print(f"Response text length: {len(response.text)} chars")
                print(f"Response preview: {response.text[:300]}...")
                result = self._parse_evaluation_response(response.text)
                print(f"\n✅ SUCCESS: Evaluation complete!")
                print(f"Score: {result.get('score')}")
                print(f"Next question: {result.get('nextQuestion', 'N/A')[:80]}...")
                print("="*60 + "\n")
                return result
            else:
                print("❌ ERROR: Response has no text attribute")
                print(f"Response object: {response}")
                raise Exception("Invalid response from Gemini API")
                
        except Exception as e:
            error_str = str(e)
            print(f"\n❌ GEMINI EVALUATION API ERROR")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {error_str}")
            
            # Check if it's a quota/rate limit error
            if ("429" in error_str or 
                "quota" in error_str.lower() or 
                "rate limit" in error_str.lower() or
                "exceeded your current quota" in error_str.lower() or
                "free_tier" in error_str.lower()):
                print("⚠️  QUOTA EXCEEDED: Using fallback evaluation")
                print(f"Quota error detected: {error_str[:200]}...")
                return self._get_fallback_evaluation(qa_history, current_answer, config)
            
            print(f"Error details:")
            import traceback
            traceback.print_exc()
            print("="*60 + "\n")
            
            # For other errors, also use fallback
            print("⚠️  Using fallback evaluation due to API error")
            return self._get_fallback_evaluation(qa_history, current_answer, config)
    
    def _build_first_question_prompt(self, config: dict, user_profile: dict = None):
        interview_type = config.get('type', 'technical')
        sub_type = config.get('subType', '')
        role = config.get('role', 'Software Engineer')
        company = config.get('company', '')
        difficulty = config.get('difficulty', 'mid')
        industry = config.get('industry', 'Technology')
        
        company_context = f" at {company}" if company else ""
        
        # Company-specific question contexts
        company_specific_contexts = {
            'Google': 'Google values scalability, algorithms, and system design. Questions often focus on large-scale distributed systems, data structures, and optimization.',
            'Amazon': 'Amazon emphasizes leadership principles, scalability, and customer obsession. Questions often include behavioral scenarios and system design for e-commerce scale.',
            'Microsoft': 'Microsoft focuses on software engineering fundamentals, Azure cloud, and collaborative problem-solving. Questions include system design and technology integration.',
            'Meta': 'Meta (Facebook) emphasizes social media scale, real-time systems, and data-driven decisions. Questions focus on scalability, performance, and user experience.',
            'Apple': 'Apple values attention to detail, user experience, and system optimization. Questions focus on performance, design patterns, and integration.',
            'Netflix': 'Netflix emphasizes microservices, cloud architecture (AWS), and streaming at scale. Questions focus on distributed systems and real-time data processing.',
            'Uber': 'Uber focuses on real-time systems, location-based services, and high availability. Questions include system design for global-scale operations.',
            'Airbnb': 'Airbnb values user experience, marketplace design, and scalable systems. Questions focus on marketplace dynamics and multi-sided platforms.',
            'LinkedIn': 'LinkedIn emphasizes social networking scale, data processing, and professional networking features. Questions focus on graph algorithms and social features.',
            'Twitter': 'Twitter focuses on real-time data streams, high-throughput systems, and content distribution. Questions emphasize scalability and performance.',
            'Salesforce': 'Salesforce emphasizes CRM systems, multi-tenancy, and enterprise software. Questions focus on business logic and scalable SaaS architectures.',
            'Oracle': 'Oracle focuses on database systems, enterprise software, and cloud infrastructure. Questions emphasize data management and enterprise solutions.',
            'IBM': 'IBM values enterprise solutions, cloud computing, and AI integration. Questions focus on enterprise architecture and legacy system integration.',
            'Spotify': 'Spotify emphasizes music streaming, recommendation systems, and real-time data. Questions focus on audio streaming and personalization algorithms.',
            'Adobe': 'Adobe focuses on creative software, document processing, and cloud services. Questions emphasize multimedia processing and user experience.',
            'PayPal': 'PayPal emphasizes payment processing, fraud detection, and financial security. Questions focus on secure transactions and distributed systems.',
            'Stripe': 'Stripe focuses on payment APIs, financial infrastructure, and developer experience. Questions emphasize API design and financial systems.',
            'Shopify': 'Shopify values e-commerce platforms, merchant tools, and scalability. Questions focus on multi-tenant systems and e-commerce features.',
            'Zoom': 'Zoom emphasizes video streaming, real-time communication, and quality of service. Questions focus on WebRTC and video processing.',
            'Slack': 'Slack focuses on real-time messaging, collaboration tools, and integration platforms. Questions emphasize messaging systems and APIs.',
            'TCS': 'TCS (Tata Consultancy Services) focuses on aptitude, logical reasoning, and coding fundamentals. Questions include number series, data interpretation, and basic programming.',
            'Infosys': 'Infosys emphasizes problem-solving, quantitative aptitude, and verbal reasoning. Questions include puzzles, pseudocode, and database queries.',
            'Wipro': 'Wipro focuses on logical reasoning, verbal ability, and quantitative aptitude. Questions include pattern recognition, sentence correction, and data sufficiency.',
            'Cognizant': 'Cognizant (CTS) emphasizes analytical skills, programming logic, and aptitude. Questions include coding, number systems, and logical deduction.',
            'Accenture': 'Accenture focuses on critical thinking, problem-solving, and communication. Questions include case analysis, coding, and attention to detail.',
        }
        
        prompt = f"""You are an expert interviewer conducting a {interview_type} interview for a {role} position{company_context} at {difficulty} level in the {industry} industry.

"""
        
        # Add company-specific context if available
        if company and company in company_specific_contexts:
            prompt += f"""Company Context for {company}:
{company_specific_contexts[company]}

Consider {company}'s technology stack, engineering culture, and common interview patterns when generating questions.

"""
        
        if interview_type == 'technical' and sub_type:
            tech_contexts = {
                'java': '''Focus on Java core concepts, OOP, collections, multithreading, JVM internals, Spring framework, design patterns.
Common topics: Concurrency, memory management, generics, Spring Boot, Hibernate, REST APIs, microservices with Java.''',
                
                'react': '''Focus on React hooks, component lifecycle, state management (Redux, Context API), performance optimization, Virtual DOM.
Common topics: useEffect, useMemo, useCallback, React Router, SSR/SSG with Next.js, testing with Jest/React Testing Library.''',
                
                'dotnet': '''Focus on .NET framework, C# language features, ASP.NET Core, Entity Framework, LINQ, async/await, dependency injection.
Common topics: Middleware, Web APIs, Blazor, SignalR, microservices with .NET, Azure integration, performance optimization.''',
                
                'python': '''Focus on Python core concepts, data structures, OOP, decorators, generators, async programming, Django/Flask.
Common topics: List comprehensions, context managers, metaclasses, FastAPI, data science libraries, web scraping, testing with pytest.''',
                
                'nodejs': '''Focus on Node.js event loop, Express.js, async/await, streams, buffers, REST APIs, microservices, npm ecosystem.
Common topics: Middleware, authentication (JWT, OAuth), database integration (MongoDB, PostgreSQL), WebSockets, error handling, clustering.''',
                
                'angular': '''Focus on Angular components, services, dependency injection, RxJS, TypeScript, routing, forms, change detection.
Common topics: Observables, pipes, directives, lazy loading, state management (NgRx), testing with Jasmine/Karma, Angular Universal.''',
                
                'spring-boot': '''Focus on Spring Boot auto-configuration, dependency injection, REST APIs, JPA/Hibernate, security, microservices.
Common topics: Spring Data, Spring Security, Spring Cloud, service discovery (Eureka), API Gateway, circuit breakers, Docker deployment.''',
                
                'microservices': '''Focus on microservices patterns, service discovery, API Gateway, inter-service communication, distributed transactions.
Common topics: Saga pattern, event sourcing, CQRS, service mesh, containerization (Docker), orchestration (Kubernetes), monitoring, tracing.''',
                
                'cloud': '''Focus on cloud platforms (AWS/Azure/GCP), serverless architecture, containers, scalability, DevOps practices.
Common topics: EC2, Lambda, S3, RDS, VPC, load balancers, auto-scaling, CloudFormation/Terraform, cost optimization, security best practices.''',
                
                'devops': '''Focus on CI/CD pipelines, Docker, Kubernetes, Jenkins, GitLab CI, infrastructure as code, monitoring, logging.
Common topics: Container orchestration, Helm charts, Prometheus, Grafana, ELK stack, blue-green deployment, canary releases, GitOps.''',
                
                'database': '''Focus on SQL, database design, normalization, indexing, transactions, query optimization, NoSQL databases.
Common topics: Joins, subqueries, stored procedures, triggers, ACID properties, CAP theorem, MongoDB, Redis, PostgreSQL, sharding, replication.''',
                
                'fresher': '''Focus on programming fundamentals, OOP concepts, basic data structures, simple algorithms, problem-solving approach.
Common topics: Arrays, strings, loops, functions, classes, inheritance, polymorphism, basic sorting/searching, code quality.''',
                
                'dsa': '''Focus on algorithms, data structures, time/space complexity analysis, problem-solving strategies, coding patterns.
Common topics: Arrays, linked lists, trees, graphs, dynamic programming, greedy algorithms, backtracking, sliding window, two pointers.''',
                
                'system-design': '''Focus on scalability, high availability, distributed systems, architecture patterns, trade-offs, capacity planning.
Common topics: Load balancing, caching, database sharding, microservices vs monolith, CAP theorem, consistency patterns, message queues.'''
            }
            
            if sub_type in tech_contexts:
                prompt += f"""{tech_contexts[sub_type]}

"""
        
        if interview_type == 'aptitude':
            prompt += f"""Focus on aptitude and reasoning questions commonly asked in placement drives and competitive exams.

Categories to cover:
- Quantitative Aptitude: Speed-distance-time, profit-loss, percentage, ratio-proportion, time-work, pipes-cisterns, trains, boats-streams
- Logical Reasoning: Number series, pattern recognition, coding-decoding, blood relations, seating arrangement, direction sense, syllogisms
- Verbal Reasoning: Synonyms, antonyms, analogies, sentence completion, reading comprehension
- Data Interpretation: Tables, bar graphs, pie charts, line graphs, data sufficiency
- Probability & Statistics: Basic probability, permutations, combinations
- Puzzles: Logic puzzles, optimization problems, strategy games

Difficulty levels:
- Entry: Basic concepts, simple calculations, direct formula application
- Mid: Multi-step problems, pattern analysis, TCS/Infosys/Wipro level questions
- Senior: Complex puzzles, optimization, Google/Microsoft interview style brain teasers

"""
        
        prompt += f"""Generate the first interview question. Make it relevant, realistic, and appropriate for the difficulty level.

For aptitude interviews:
- Entry level: Basic formulas, simple calculations, pattern recognition
- Mid level: Multi-step problems, company-specific previous year questions
- Senior level: Complex puzzles, optimization, creative problem-solving

For technical interviews:
- Entry level: Focus on fundamental concepts, basic syntax, common patterns, simple problem-solving
- Mid level: Test practical experience, problem-solving, design decisions, real-world scenarios
- Senior level: Architecture, scalability, trade-offs, complex scenarios, leadership, system design
- IMPORTANT: Only ask technical questions related to coding, system design, algorithms, data structures, frameworks, and software engineering concepts

For behavioral interviews:
- Use STAR format questions (Situation, Task, Action, Result)
- Focus on communication skills, teamwork, interpersonal dynamics, conflict resolution, leadership
- Assess soft skills such as: communication, collaboration, adaptability, emotional intelligence, problem-solving in team contexts
- Ask about scenarios like: handling difficult teammates, giving/receiving feedback, presenting ideas, active listening, negotiation
- IMPORTANT: Only ask behavioral/communication questions. No technical coding or algorithm questions

For HR interviews:
- Ask about motivation, career goals, company fit, cultural alignment
- Explore soft skills, work style, and long-term aspirations

Important guidelines:
1. Ask ONE clear, specific question that is commonly asked in real interviews
2. Make it conversational and professional
3. Ensure it's highly relevant to the role, technology, and difficulty level
4. Keep it concise (1-3 sentences)
5. For coding questions, specify language preference if applicable
6. If a company is specified, tailor the question to their known interview style and focus areas
7. **CRITICAL**: For technical interviews, ONLY ask technical questions (coding, design, algorithms). For behavioral interviews, ONLY ask communication/soft skill questions (teamwork, conflict resolution, leadership)

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
            raise Exception("Gemini AI is not initialized. Please check your API key configuration.")
        
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
            raise Exception("Failed to parse questions from AI response")
        except Exception as e:
            print(f"Gemini API error in practice questions: {e}")
            raise Exception(f"Failed to generate practice questions: {str(e)}")
    
    def evaluate_practice_answer(self, question: str, answer: str, category: str):
        """Quick evaluation for practice mode"""
        if not self.initialized:
            raise Exception("Gemini AI is not initialized. Please check your API key configuration.")
        
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
            raise Exception(f"Failed to evaluate practice answer: {str(e)}")
    
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
    
    def _get_fallback_first_question(self, config: dict) -> str:
        """Get a fallback first question when AI is not available or quota exceeded"""
        import random
        
        category = config.get('type', 'technical')
        difficulty = config.get('difficulty', 'mid')
        
        # Get fallback questions for the category and difficulty
        fallback_questions = self._get_fallback_questions(category, difficulty, 10)
        
        if fallback_questions:
            # Pick a random question
            question_obj = random.choice(fallback_questions)
            return question_obj['question']
        
        # Ultimate fallback if no questions found
        return "Tell me about yourself and your background in software development."
    
    def _get_fallback_evaluation(self, qa_history: list, current_answer: str, config: dict) -> dict:
        """Get a fallback evaluation when AI is not available or quota exceeded"""
        word_count = len(current_answer.split())
        char_count = len(current_answer)
        
        # Simple scoring based on answer length and content
        base_score = 65
        
        # Bonus for longer, more detailed answers
        if word_count > 50:
            base_score += 10
        elif word_count > 25:
            base_score += 5
        
        # Bonus for using technical terms (simple heuristic)
        technical_terms = ['algorithm', 'data', 'structure', 'function', 'class', 'method', 'api', 'database', 'server', 'client']
        found_terms = sum(1 for term in technical_terms if term.lower() in current_answer.lower())
        base_score += min(found_terms * 2, 10)
        
        score = min(95, max(55, base_score))
        
        # Generate feedback based on score
        if score >= 85:
            feedback = "Excellent answer! You demonstrated strong understanding and clear communication."
        elif score >= 75:
            feedback = "Good answer! You covered the key points well."
        elif score >= 65:
            feedback = "Decent answer. Consider providing more specific examples and technical details."
        else:
            feedback = "This answer could be improved with more depth and specific examples."
        
        # Generate key points based on answer content
        key_points = []
        if word_count > 20:
            key_points.append("Provided a detailed response")
        if found_terms > 0:
            key_points.append("Used relevant technical terminology")
        if len(current_answer.split('.')) > 2:
            key_points.append("Structured answer with multiple points")
        
        if not key_points:
            key_points = ["Consider adding more specific examples", "Practice explaining technical concepts clearly"]
        
        return {
            "score": score,
            "feedback": feedback,
            "keyPoints": key_points,
            "nextQuestion": self._get_fallback_first_question(config)  # Generate next question
        }
    
    def _get_fallback_questions(self, category: str, difficulty: str, count: int) -> list:
        """Comprehensive fallback questions when AI is not available"""
        import random
        
        fallback_questions = {
            "aptitude": [
                # Logical Reasoning - Entry Level
                {"question": "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?", "category": "aptitude", "difficulty": "entry", "hints": ["Syllogism", "Transitive property"], "topics": ["logical-reasoning", "deduction"]},
                {"question": "Find the odd one out: 2, 5, 10, 17, 26, 37", "category": "aptitude", "difficulty": "entry", "hints": ["Pattern recognition", "Number series"], "topics": ["logical-reasoning", "patterns"]},
                {"question": "If CAT = 3120, what is DOG?", "category": "aptitude", "difficulty": "entry", "hints": ["Letter-to-number coding", "Position values"], "topics": ["coding-decoding", "patterns"]},
                {"question": "A clock shows 3:15. What is the angle between the hour and minute hands?", "category": "aptitude", "difficulty": "entry", "hints": ["Each hour = 30°", "Minute hand position"], "topics": ["clock-problems", "angles"]},
                
                # Quantitative Aptitude - Entry Level
                {"question": "A train 100m long passes a pole in 10 seconds. What is its speed in km/hr?", "category": "aptitude", "difficulty": "entry", "hints": ["Speed = Distance/Time", "Convert m/s to km/hr"], "topics": ["speed-distance-time", "trains"]},
                {"question": "If the cost price of 12 pens equals the selling price of 10 pens, what is the profit percentage?", "category": "aptitude", "difficulty": "entry", "hints": ["Profit = SP - CP", "Percentage formula"], "topics": ["profit-loss", "percentage"]},
                {"question": "A sum of money doubles itself in 5 years at simple interest. In how many years will it triple?", "category": "aptitude", "difficulty": "entry", "hints": ["SI = PRT/100", "Rate calculation"], "topics": ["simple-interest", "time-calculation"]},
                {"question": "The ratio of boys to girls in a class is 3:2. If there are 45 students, how many are girls?", "category": "aptitude", "difficulty": "entry", "hints": ["Total parts = 3+2", "Calculate one part"], "topics": ["ratio-proportion", "basic-math"]},
                
                # Verbal Reasoning - Entry Level
                {"question": "Find the synonym of ABUNDANCE: (a) Scarcity (b) Plenty (c) Lack (d) Shortage", "category": "aptitude", "difficulty": "entry", "hints": ["Means plenty/large quantity"], "topics": ["vocabulary", "synonyms"]},
                {"question": "Complete: Engineer : Building :: Sculptor : ?", "category": "aptitude", "difficulty": "entry", "hints": ["What does a sculptor create?"], "topics": ["analogies", "relationships"]},
                
                # Data Interpretation - Entry Level
                {"question": "A pie chart shows: Sales 40%, Marketing 25%, R&D 20%, Others 15%. If the total budget is $100,000, what is the R&D budget?", "category": "aptitude", "difficulty": "entry", "hints": ["20% of total", "Simple percentage"], "topics": ["data-interpretation", "percentage"]},
                
                # Logical Reasoning - Mid Level (TCS/Infosys/Wipro style)
                {"question": "Five friends are sitting in a row. A is not at either end. B is to the left of C. D is between B and E. Who is in the middle?", "category": "aptitude", "difficulty": "mid", "hints": ["Draw positions", "Eliminate possibilities"], "topics": ["seating-arrangement", "logical-reasoning"]},
                {"question": "In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written?", "category": "aptitude", "difficulty": "mid", "hints": ["Reverse and shift", "Pattern analysis"], "topics": ["coding-decoding", "ciphers"]},
                {"question": "How many times do the hands of a clock coincide in a day?", "category": "aptitude", "difficulty": "mid", "hints": ["Not 24!", "11 times in 12 hours"], "topics": ["clock-problems", "frequency"]},
                {"question": "A man walks 5 km towards East, turns right and walks 3 km, then turns right and walks 5 km. How far is he from the starting point?", "category": "aptitude", "difficulty": "mid", "hints": ["Draw the path", "Pythagoras theorem"], "topics": ["direction-sense", "geometry"]},
                
                # Quantitative Aptitude - Mid Level (Accenture/Cognizant style)
                {"question": "Two trains 150m and 200m long are running in opposite directions at 54 km/hr and 36 km/hr. In how many seconds will they cross each other?", "category": "aptitude", "difficulty": "mid", "hints": ["Relative speed = sum", "Total distance = sum of lengths"], "topics": ["trains", "relative-speed"]},
                {"question": "A cistern has two pipes. One fills it in 4 hours and the other empties it in 6 hours. If both are opened, in how many hours will the cistern be filled?", "category": "aptitude", "difficulty": "mid", "hints": ["Work done per hour", "Net fill rate"], "topics": ["pipes-cisterns", "work-time"]},
                {"question": "The average age of 10 students is 20 years. If the teacher's age is included, the average becomes 22 years. What is the teacher's age?", "category": "aptitude", "difficulty": "mid", "hints": ["Total age before and after"], "topics": ["averages", "age-problems"]},
                {"question": "A person invested money in two schemes A and B at 10% and 12% simple interest. If the total interest after 1 year is ₹840 and ratio of investment is 2:3, find total investment.", "category": "aptitude", "difficulty": "mid", "hints": ["Let investments be 2x and 3x"], "topics": ["simple-interest", "ratio"]},
                {"question": "If 20 workers can complete a work in 30 days, how many workers are needed to complete it in 20 days?", "category": "aptitude", "difficulty": "mid", "hints": ["Total work = workers × days", "Inverse proportion"], "topics": ["work-time", "inverse-proportion"]},
                {"question": "A mixture contains milk and water in ratio 5:3. If 16 liters of water is added, the ratio becomes 5:7. Find the initial quantity of milk.", "category": "aptitude", "difficulty": "mid", "hints": ["Let initial quantities be 5x and 3x"], "topics": ["mixture-alligation", "ratio"]},
                
                # Data Interpretation - Mid Level
                {"question": "A bar graph shows quarterly sales: Q1=$50k, Q2=$75k, Q3=$60k, Q4=$90k. What is the percentage increase from Q1 to Q4?", "category": "aptitude", "difficulty": "mid", "hints": ["% increase = (increase/original) × 100"], "topics": ["data-interpretation", "percentage"]},
                {"question": "A table shows production of 5 companies over 3 years. Company A produced 200, 250, 300 units. Company B produced 180, 220, 280. Which company had higher growth rate?", "category": "aptitude", "difficulty": "mid", "hints": ["Calculate percentage growth"], "topics": ["data-interpretation", "comparison"]},
                
                # Probability & Statistics - Mid Level
                {"question": "What is the probability of getting at least one head when three coins are tossed?", "category": "aptitude", "difficulty": "mid", "hints": ["P(at least one) = 1 - P(none)", "Total outcomes = 8"], "topics": ["probability", "coins"]},
                {"question": "In how many ways can 5 people be arranged in a row?", "category": "aptitude", "difficulty": "mid", "hints": ["Permutation", "5!"], "topics": ["permutation-combination", "arrangements"]},
                
                # Pattern Recognition (Google/Amazon style) - Mid Level
                {"question": "Find the next number in series: 1, 4, 9, 16, 25, ?", "category": "aptitude", "difficulty": "mid", "hints": ["Perfect squares"], "topics": ["number-series", "patterns"]},
                {"question": "Find the missing number: 2, 6, 12, 20, 30, ?", "category": "aptitude", "difficulty": "mid", "hints": ["Difference of differences", "n(n+1)"], "topics": ["number-series", "patterns"]},
                
                # Logical Reasoning - Senior Level (Microsoft/Google style)
                {"question": "You have 8 balls, one is heavier. Using a balance scale only twice, how do you find the heavier ball?", "category": "aptitude", "difficulty": "senior", "hints": ["Divide into groups of 3-3-2", "First weighing narrows down"], "topics": ["logical-puzzles", "optimization"]},
                {"question": "100 prisoners are lined up. Each can see all prisoners in front but not behind. A hat (red or blue) is placed on each head. Starting from the back, each must say their hat color. How to maximize survivors?", "category": "aptitude", "difficulty": "senior", "hints": ["Parity strategy", "Even/odd count"], "topics": ["logical-puzzles", "strategy"]},
                {"question": "A bridge can hold 2 people max. 4 people need to cross with times: 1, 2, 5, 10 minutes. They need a flashlight. What's the minimum time?", "category": "aptitude", "difficulty": "senior", "hints": ["Send fast ones back", "Optimize pairs"], "topics": ["optimization", "logical-puzzles"]},
                {"question": "You're in a room with 3 switches outside. Each controls a bulb inside (you can't see). You can flip switches, then enter once. How to determine which switch controls which bulb?", "category": "aptitude", "difficulty": "senior", "hints": ["Use heat", "Time factor"], "topics": ["logical-puzzles", "creative-thinking"]},
                
                # Quantitative Aptitude - Senior Level
                {"question": "A and B can complete a work in 12 days, B and C in 15 days, C and A in 20 days. How long will A, B, and C together take?", "category": "aptitude", "difficulty": "senior", "hints": ["Find individual work rates", "Add all three rates"], "topics": ["work-time", "equations"]},
                {"question": "A merchant marks his goods 25% above cost price and gives a discount of 10%. What is his profit percentage?", "category": "aptitude", "difficulty": "senior", "hints": ["Let CP = 100", "Calculate step by step"], "topics": ["profit-loss", "discount"]},
                {"question": "A cistern can be filled by two pipes A and B in 2 hours and 3 hours respectively. An outlet pipe C can empty it in 4 hours. If all three are opened together, in how many hours will the cistern be filled?", "category": "aptitude", "difficulty": "senior", "hints": ["Net rate = A + B - C"], "topics": ["pipes-cisterns", "work-time"]},
                
                # Probability & Combinations - Senior Level
                {"question": "In how many ways can 7 people be seated around a circular table if 2 specific people must not sit together?", "category": "aptitude", "difficulty": "senior", "hints": ["Circular permutation", "Subtract when together"], "topics": ["permutation-combination", "circular"]},
                {"question": "A bag contains 5 red, 4 blue, and 3 green balls. What is the probability of drawing 3 balls such that all are of different colors?", "category": "aptitude", "difficulty": "senior", "hints": ["5C1 × 4C1 × 3C1 / 12C3"], "topics": ["probability", "combinations"]},
                
                # Data Sufficiency (TCS/Infosys)
                {"question": "Is x > y? (I) x² > y² (II) x³ > y³. Which statement(s) is/are sufficient?", "category": "aptitude", "difficulty": "senior", "hints": ["Consider negative numbers", "Statement II alone"], "topics": ["data-sufficiency", "inequalities"]},
                
                # Previous Year Questions from Top Companies
                # TCS CodeVita/NQT Style
                {"question": "A number when divided by 5 leaves remainder 3, when divided by 7 leaves remainder 4. What is the smallest such number?", "category": "aptitude", "difficulty": "mid", "hints": ["Chinese remainder theorem", "LCM approach"], "topics": ["number-theory", "remainders"]},
                {"question": "How many 4-digit numbers can be formed using digits 1-5 without repetition that are divisible by 4?", "category": "aptitude", "difficulty": "mid", "hints": ["Last 2 digits divisible by 4"], "topics": ["permutation-combination", "divisibility"]},
                
                # Infosys Previous Year
                {"question": "A can do a work in 15 days, B in 20 days. They work together for 4 days, then A leaves. In how many more days will B finish the remaining work?", "category": "aptitude", "difficulty": "mid", "hints": ["Calculate work done in 4 days", "Find remaining work"], "topics": ["work-time", "partnership"]},
                
                # Wipro Previous Year
                {"question": "The sum of three numbers is 98. The ratio of first to second is 2:3 and second to third is 5:8. Find the second number.", "category": "aptitude", "difficulty": "mid", "hints": ["Make ratios comparable", "10:15:24"], "topics": ["ratio-proportion", "equations"]},
                
                # Cognizant Previous Year
                {"question": "A sum of ₹12,000 is divided among A, B, C such that A gets 40% more than B, and B gets 20% more than C. Find C's share.", "category": "aptitude", "difficulty": "mid", "hints": ["Let C = x, B = 1.2x, A = 1.68x"], "topics": ["percentage", "distribution"]},
                
                # Accenture Previous Year
                {"question": "A boat travels 24 km upstream and 28 km downstream in 5 hours. Same boat travels 30 km upstream and 21 km downstream in 6.5 hours. Find speed of boat in still water.", "category": "aptitude", "difficulty": "senior", "hints": ["Let boat speed = b, stream = s", "Solve simultaneous equations"], "topics": ["boats-streams", "equations"]},
            ],
            "technical": [
                # DSA - Entry Level
                {"question": "What is the time complexity of binary search?", "category": "technical", "difficulty": "entry", "hints": ["Divide and conquer", "O(log n)"], "topics": ["dsa", "algorithms"]},
                {"question": "Explain the difference between an array and a linked list", "category": "technical", "difficulty": "entry", "hints": ["Memory layout", "Access time"], "topics": ["dsa", "data-structures"]},
                {"question": "What is a stack and where is it used?", "category": "technical", "difficulty": "entry", "hints": ["LIFO", "Function calls"], "topics": ["dsa", "data-structures"]},
                {"question": "Explain Big O notation with examples", "category": "technical", "difficulty": "entry", "hints": ["Time complexity", "Growth rate"], "topics": ["dsa", "complexity"]},
                
                # DSA - Mid Level
                {"question": "How do you detect a cycle in a linked list?", "category": "technical", "difficulty": "mid", "hints": ["Floyd's algorithm", "Two pointers"], "topics": ["dsa", "algorithms"]},
                {"question": "Implement a LRU cache with O(1) operations", "category": "technical", "difficulty": "mid", "hints": ["HashMap + DoublyLinkedList", "eviction policy"], "topics": ["dsa", "design"]},
                {"question": "Explain different tree traversal algorithms", "category": "technical", "difficulty": "mid", "hints": ["Inorder, Preorder, Postorder", "BFS vs DFS"], "topics": ["dsa", "trees"]},
                
                # DSA - Senior Level
                {"question": "Design and implement a consistent hashing algorithm", "category": "technical", "difficulty": "senior", "hints": ["Hash ring", "Load balancing"], "topics": ["dsa", "distributed-systems"]},
                {"question": "Explain dynamic programming with a complex example", "category": "technical", "difficulty": "senior", "hints": ["Memoization", "Optimal substructure"], "topics": ["dsa", "algorithms"]},
                
                # System Design - Entry Level
                {"question": "What is horizontal vs vertical scaling?", "category": "technical", "difficulty": "entry", "hints": ["Scale out vs scale up", "Load distribution"], "topics": ["system-design", "scalability"]},
                {"question": "Explain what a load balancer does", "category": "technical", "difficulty": "entry", "hints": ["Traffic distribution", "High availability"], "topics": ["system-design", "infrastructure"]},
                
                # System Design - Mid Level
                {"question": "Design a URL shortening service like bit.ly", "category": "technical", "difficulty": "mid", "hints": ["Base62 encoding", "Database design"], "topics": ["system-design", "scalability"]},
                {"question": "How would you design a distributed cache?", "category": "technical", "difficulty": "mid", "hints": ["Cache eviction", "Consistency"], "topics": ["system-design", "caching"]},
                {"question": "Explain the CAP theorem with real examples", "category": "technical", "difficulty": "mid", "hints": ["Consistency, Availability, Partition tolerance"], "topics": ["system-design", "distributed-systems"]},
                
                # System Design - Senior Level
                {"question": "Design a globally distributed social media feed like Twitter", "category": "technical", "difficulty": "senior", "hints": ["Fan-out on write vs read", "Eventual consistency"], "topics": ["system-design", "scalability"]},
                {"question": "Design a rate limiting system for an API gateway", "category": "technical", "difficulty": "senior", "hints": ["Token bucket", "Sliding window"], "topics": ["system-design", "security"]},
                
                # Java - Entry Level
                {"question": "What is the difference between == and equals() in Java?", "category": "technical", "difficulty": "entry", "hints": ["Reference vs value", "Object comparison"], "topics": ["java", "fundamentals"]},
                {"question": "Explain Java access modifiers", "category": "technical", "difficulty": "entry", "hints": ["public, private, protected", "Encapsulation"], "topics": ["java", "oop"]},
                
                # Java - Mid Level
                {"question": "How does HashMap work internally in Java?", "category": "technical", "difficulty": "mid", "hints": ["Hashing, buckets", "Collision handling"], "topics": ["java", "collections"]},
                {"question": "Explain Java Stream API and its benefits", "category": "technical", "difficulty": "mid", "hints": ["Functional programming", "Lazy evaluation"], "topics": ["java", "streams"]},
                {"question": "What are Java memory leaks and how do you prevent them?", "category": "technical", "difficulty": "mid", "hints": ["GC roots", "Strong references"], "topics": ["java", "memory-management"]},
                
                # Java - Senior Level
                {"question": "Explain Java concurrency utilities and best practices", "category": "technical", "difficulty": "senior", "hints": ["Executors, CompletableFuture", "Thread safety"], "topics": ["java", "concurrency"]},
                
                # React - Entry Level
                {"question": "What is the difference between state and props in React?", "category": "technical", "difficulty": "entry", "hints": ["Mutable vs immutable", "Data flow"], "topics": ["react", "fundamentals"]},
                {"question": "Explain the Virtual DOM in React", "category": "technical", "difficulty": "entry", "hints": ["Reconciliation", "Performance"], "topics": ["react", "internals"]},
                
                # React - Mid Level
                {"question": "How does useEffect hook work?", "category": "technical", "difficulty": "mid", "hints": ["Dependencies array", "Cleanup function"], "topics": ["react", "hooks"]},
                {"question": "Explain React Context API and when to use it", "category": "technical", "difficulty": "mid", "hints": ["Props drilling", "Global state"], "topics": ["react", "state-management"]},
                {"question": "What are React optimization techniques?", "category": "technical", "difficulty": "mid", "hints": ["useMemo, useCallback", "React.memo"], "topics": ["react", "performance"]},
                
                # React - Senior Level
                {"question": "Design a scalable React application architecture", "category": "technical", "difficulty": "senior", "hints": ["Component patterns", "State management"], "topics": ["react", "architecture"]},
                
                # Python - Entry Level
                {"question": "What are list comprehensions in Python?", "category": "technical", "difficulty": "entry", "hints": ["Concise syntax", "Filtering"], "topics": ["python", "fundamentals"]},
                {"question": "Explain the difference between list and tuple", "category": "technical", "difficulty": "entry", "hints": ["Mutable vs immutable", "Performance"], "topics": ["python", "data-structures"]},
                
                # Python - Mid Level
                {"question": "How do decorators work in Python?", "category": "technical", "difficulty": "mid", "hints": ["Function wrappers", "@ syntax"], "topics": ["python", "advanced"]},
                {"question": "Explain Python generators and yield", "category": "technical", "difficulty": "mid", "hints": ["Lazy evaluation", "Memory efficiency"], "topics": ["python", "generators"]},
                {"question": "What is the GIL in Python?", "category": "technical", "difficulty": "mid", "hints": ["Global Interpreter Lock", "Threading limitations"], "topics": ["python", "concurrency"]},
                
                # Python - Senior Level
                {"question": "Explain Python metaclasses and their use cases", "category": "technical", "difficulty": "senior", "hints": ["Class creation", "ORM implementations"], "topics": ["python", "advanced"]},
                
                # Node.js - Entry Level
                {"question": "What is the Node.js event loop?", "category": "technical", "difficulty": "entry", "hints": ["Non-blocking I/O", "Callback queue"], "topics": ["nodejs", "fundamentals"]},
                {"question": "Explain callback functions in Node.js", "category": "technical", "difficulty": "entry", "hints": ["Asynchronous operations", "Error-first callbacks"], "topics": ["nodejs", "async"]},
                
                # Node.js - Mid Level
                {"question": "How do you handle errors in Express.js middleware?", "category": "technical", "difficulty": "mid", "hints": ["Error handling middleware", "next(err)"], "topics": ["nodejs", "express"]},
                {"question": "Explain streams in Node.js", "category": "technical", "difficulty": "mid", "hints": ["Readable, Writable", "Pipe"], "topics": ["nodejs", "streams"]},
                
                # Node.js - Senior Level
                {"question": "Design a scalable Node.js microservices architecture", "category": "technical", "difficulty": "senior", "hints": ["Service communication", "Load balancing"], "topics": ["nodejs", "architecture"]},
                
                # Database - Entry Level
                {"question": "What is the difference between SQL and NoSQL?", "category": "technical", "difficulty": "entry", "hints": ["Schema", "Scalability"], "topics": ["database", "fundamentals"]},
                {"question": "Explain database normalization", "category": "technical", "difficulty": "entry", "hints": ["1NF, 2NF, 3NF", "Redundancy"], "topics": ["database", "design"]},
                
                # Database - Mid Level
                {"question": "What are database indexes and how do they work?", "category": "technical", "difficulty": "mid", "hints": ["B-tree", "Query performance"], "topics": ["database", "optimization"]},
                {"question": "Explain ACID properties in databases", "category": "technical", "difficulty": "mid", "hints": ["Atomicity, Consistency", "Transactions"], "topics": ["database", "transactions"]},
                
                # Database - Senior Level
                {"question": "Design a database sharding strategy", "category": "technical", "difficulty": "senior", "hints": ["Partition key", "Rebalancing"], "topics": ["database", "scalability"]},
                
                # Cloud - Mid Level
                {"question": "What are the benefits of serverless architecture?", "category": "technical", "difficulty": "mid", "hints": ["Auto-scaling", "Pay-per-use"], "topics": ["cloud", "serverless"]},
                {"question": "Explain container orchestration with Kubernetes", "category": "technical", "difficulty": "mid", "hints": ["Pods, Services", "Auto-scaling"], "topics": ["cloud", "kubernetes"]},
                
                # DevOps - Mid Level
                {"question": "Explain CI/CD pipeline best practices", "category": "technical", "difficulty": "mid", "hints": ["Automated testing", "Deployment stages"], "topics": ["devops", "ci-cd"]},
                {"question": "What is Infrastructure as Code?", "category": "technical", "difficulty": "mid", "hints": ["Terraform, CloudFormation", "Version control"], "topics": ["devops", "iac"]},
                
                # Microservices - Mid Level
                {"question": "What are the challenges of microservices?", "category": "technical", "difficulty": "mid", "hints": ["Distributed systems", "Network latency"], "topics": ["microservices", "challenges"]},
                {"question": "Explain service discovery in microservices", "category": "technical", "difficulty": "mid", "hints": ["Service registry", "Health checks"], "topics": ["microservices", "architecture"]},
                
                # General - All Levels
                {"question": "What are RESTful API design principles?", "category": "technical", "difficulty": "mid", "hints": ["HTTP methods", "Stateless"], "topics": ["api", "design"]},
                {"question": "Explain OAuth 2.0 authentication flow", "category": "technical", "difficulty": "mid", "hints": ["Authorization code", "Access tokens"], "topics": ["security", "auth"]},
            ],
            "behavioral": [
                # Entry Level
                {"question": "Tell me about a time you had to learn something new quickly", "category": "behavioral", "difficulty": "entry", "hints": ["Learning approach", "Adaptability"], "topics": ["learning", "growth"]},
                {"question": "Describe a challenging bug you fixed", "category": "behavioral", "difficulty": "entry", "hints": ["Problem-solving", "Technical approach"], "topics": ["debugging", "problem-solving"]},
                {"question": "How do you handle feedback on your work?", "category": "behavioral", "difficulty": "entry", "hints": ["Growth mindset", "Constructive response"], "topics": ["feedback", "improvement"]},
                {"question": "Tell me about a successful project you completed", "category": "behavioral", "difficulty": "entry", "hints": ["Impact", "Your contribution"], "topics": ["achievement", "delivery"]},
                
                # Mid Level
                {"question": "Tell me about a time you faced a difficult challenge at work", "category": "behavioral", "difficulty": "mid", "hints": ["STAR method", "Problem-solving"], "topics": ["problem-solving", "resilience"]},
                {"question": "Describe a situation where you had to work with a difficult team member", "category": "behavioral", "difficulty": "mid", "hints": ["Conflict resolution", "Communication"], "topics": ["teamwork", "communication"]},
                {"question": "Tell me about a time you failed and what you learned", "category": "behavioral", "difficulty": "mid", "hints": ["Self-awareness", "Growth mindset"], "topics": ["learning", "resilience"]},
                {"question": "Describe a situation where you had to meet a tight deadline", "category": "behavioral", "difficulty": "mid", "hints": ["Time management", "Prioritization"], "topics": ["productivity", "pressure"]},
                {"question": "Tell me about a time you disagreed with a technical decision", "category": "behavioral", "difficulty": "mid", "hints": ["Technical reasoning", "Collaboration"], "topics": ["decision-making", "teamwork"]},
                {"question": "Describe a project where you had to balance competing priorities", "category": "behavioral", "difficulty": "mid", "hints": ["Trade-offs", "Stakeholder management"], "topics": ["prioritization", "decision-making"]},
                
                # Senior Level
                {"question": "Describe your experience leading a technical team", "category": "behavioral", "difficulty": "senior", "hints": ["Leadership style", "Team development"], "topics": ["leadership", "management"]},
                {"question": "Tell me about a time you made an architectural decision", "category": "behavioral", "difficulty": "senior", "hints": ["Technical trade-offs", "Long-term impact"], "topics": ["architecture", "decision-making"]},
                {"question": "How do you mentor junior developers?", "category": "behavioral", "difficulty": "senior", "hints": ["Coaching approach", "Knowledge transfer"], "topics": ["mentorship", "leadership"]},
                {"question": "Describe a time you drove a major technical initiative", "category": "behavioral", "difficulty": "senior", "hints": ["Vision", "Execution"], "topics": ["leadership", "initiative"]},
                {"question": "How do you handle disagreements about technical direction?", "category": "behavioral", "difficulty": "senior", "hints": ["Influence", "Consensus building"], "topics": ["leadership", "collaboration"]},
            ],
            "hr": [
                # Entry Level
                {"question": "Why do you want to work for our company?", "category": "hr", "difficulty": "entry", "hints": ["Research company", "Align with values"], "topics": ["motivation", "culture-fit"]},
                {"question": "Where do you see yourself in 5 years?", "category": "hr", "difficulty": "entry", "hints": ["Career goals", "Growth"], "topics": ["career-planning", "ambition"]},
                {"question": "What is your greatest strength?", "category": "hr", "difficulty": "entry", "hints": ["Job relevant", "Specific examples"], "topics": ["self-awareness", "skills"]},
                {"question": "What is your greatest weakness?", "category": "hr", "difficulty": "entry", "hints": ["Self-awareness", "Improvement steps"], "topics": ["self-awareness", "growth"]},
                {"question": "Why did you choose this career path?", "category": "hr", "difficulty": "entry", "hints": ["Passion", "Journey"], "topics": ["career", "motivation"]},
                {"question": "What motivates you at work?", "category": "hr", "difficulty": "entry", "hints": ["Intrinsic motivation", "Work preferences"], "topics": ["motivation", "values"]},
                
                # Mid Level
                {"question": "What are your salary expectations?", "category": "hr", "difficulty": "mid", "hints": ["Market research", "Value proposition"], "topics": ["negotiation", "compensation"]},
                {"question": "Why are you leaving your current job?", "category": "hr", "difficulty": "mid", "hints": ["Stay positive", "Growth focused"], "topics": ["career-transition", "motivation"]},
                {"question": "How do you handle work-life balance?", "category": "hr", "difficulty": "mid", "hints": ["Boundaries", "Productivity"], "topics": ["wellness", "balance"]},
                {"question": "Describe your ideal work environment", "category": "hr", "difficulty": "mid", "hints": ["Team dynamics", "Culture preferences"], "topics": ["culture-fit", "preferences"]},
                {"question": "How do you stay updated with technology trends?", "category": "hr", "difficulty": "mid", "hints": ["Learning resources", "Continuous learning"], "topics": ["learning", "growth"]},
                {"question": "What do you know about our company and products?", "category": "hr", "difficulty": "mid", "hints": ["Research", "Interest"], "topics": ["preparation", "interest"]},
                
                # Senior Level
                {"question": "What is your leadership philosophy?", "category": "hr", "difficulty": "senior", "hints": ["Leadership style", "Team development"], "topics": ["leadership", "management"]},
                {"question": "How do you build high-performing teams?", "category": "hr", "difficulty": "senior", "hints": ["Hiring", "Team culture"], "topics": ["leadership", "team-building"]},
                {"question": "Describe your approach to technical decision-making", "category": "hr", "difficulty": "senior", "hints": ["Trade-offs", "Stakeholders"], "topics": ["decision-making", "leadership"]},
                {"question": "How do you handle underperforming team members?", "category": "hr", "difficulty": "senior", "hints": ["Coaching", "Performance management"], "topics": ["management", "leadership"]},
                {"question": "What's your vision for the next 3-5 years in your career?", "category": "hr", "difficulty": "senior", "hints": ["Strategic thinking", "Impact"], "topics": ["career-planning", "vision"]},
            ],
            "case-study": [
                {"question": "A major client is experiencing downtime. Walk me through your incident response", "category": "case-study", "difficulty": "mid", "hints": ["Communication", "Root cause analysis"], "topics": ["incident-management", "problem-solving"]},
                {"question": "Our API response time has doubled in the last week. How would you investigate?", "category": "case-study", "difficulty": "mid", "hints": ["Monitoring", "Profiling"], "topics": ["performance", "debugging"]},
                {"question": "Design a strategy to migrate a monolithic application to microservices", "category": "case-study", "difficulty": "senior", "hints": ["Incremental migration", "Risk mitigation"], "topics": ["architecture", "migration"]},
                {"question": "How would you improve the deployment process for a team releasing multiple times a day?", "category": "case-study", "difficulty": "mid", "hints": ["CI/CD", "Automation"], "topics": ["devops", "process"]},
            ]
        }
        
        questions = fallback_questions.get(category, fallback_questions["technical"])
        # Filter by difficulty if specified
        if difficulty:
            filtered = [q for q in questions if q["difficulty"] == difficulty]
            if filtered:
                questions = filtered
        # Shuffle and return requested count
        random.shuffle(questions)
        return questions[:count]
    
    def generate_question_set(self, config: dict, count: int = 5) -> list:
        """Generate a complete set of interview questions upfront"""
        print(f"=== GEMINI: generate_question_set called ===")
        print(f"Initialized: {self.initialized}, Count: {count}")
        
        if not self.initialized:
            raise Exception("Gemini AI is not initialized. Please check your API key configuration.")
        
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
                raise Exception(f"Only got {len(questions)} questions, expected {count}")
            
            questions = questions[:count]  # Trim to exact count
            
            print(f"=== GEMINI: Generated {len(questions)} questions ===")
            return questions
            
        except Exception as e:
            print(f"=== GEMINI: API ERROR in question set ===")
            print(f"Error: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Failed to generate question set: {str(e)}")
    
    def generate_chat_response(self, prompt: str) -> str:
        """Generate response for AI chat assistant"""
        if not self.initialized:
            return "I'm here to help with interview preparation! Ask me about technical concepts, interview strategies, or career advice."
        
        try:
            response = self.flash_model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Chat API error: {e}")
            return "I'm here to help! Could you rephrase your question?"
            
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

    def _get_fallback_practice_questions(self, category: str, difficulty: str, count: int = 5):
        questions_pool = {
            'technical': {
                'entry': [
                    'What are the four pillars of Object-Oriented Programming?',
                    'Explain the difference between stack and heap memory.',
                    'What is the difference between GET and POST HTTP methods?',
                    'How do you reverse a string in your preferred language?',
                    'What is the time complexity of binary search?'
                ],
                'mid': [
                    'Explain the SOLID principles in software design.',
                    'How does a HashMap work internally?',
                    'What is the difference between Authentication and Authorization?',
                    'How would you find duplicates in an array efficiently?',
                    'Explain the CAP theorem in distributed systems.'
                ],
                'senior': [
                    'Design a microservices architecture for an e-commerce platform.',
                    'How would you implement database sharding?',
                    'Explain eventual consistency and when to use it.',
                    'Design a rate limiter for an API.',
                    'How would you handle cache invalidation in a distributed system?'
                ]
            },
            'behavioral': {
                'entry': ['Tell me about a time you learned a new technology quickly.', 'Describe a challenging bug you fixed.'],
                'mid': ['Describe a situation where you disagreed with a technical decision.', 'How do you handle trade-offs in project planning?'],
                'senior': ['Describe your experience leading a technical team.', 'How do you make architectural decisions?']
            },
            'hr': {
                'entry': ['Why do you want to work here?', 'What are your career goals?'],
                'mid': ['Where do you see yourself in 5 years?', 'Describe your ideal work environment.'],
                'senior': ['What is your leadership philosophy?', 'How do you build high-performing teams?']
            }
        }
        questions_list = questions_pool.get(category, {}).get(difficulty, questions_pool['technical']['mid'])
        return [
            {
                'question': q,
                'category': category,
                'difficulty': difficulty,
                'hints': ['Think about best practices and real-world applications'],
                'topics': [category]
            }
            for q in questions_list[:count]
        ]

    def _get_fallback_practice_evaluation(self, answer: str):
        word_count = len(answer.split())
        score = min(85, max(65, 65 + (word_count // 8)))
        return {
            'score': score,
            'feedback': 'Good answer! Keep practicing to improve further.',
            'keyPoints': [
                'Shows understanding of the topic',
                'Continue practicing for better depth'
            ]
        }

gemini_service = GeminiService()
