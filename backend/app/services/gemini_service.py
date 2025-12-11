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
        
        if api_key and api_key != 'your_gemini_api_key_here':
            try:
                print("Configuring Gemini API...")
                genai.configure(api_key=api_key)
                print("Creating model instances...")
                # Use gemini-2.5-flash for question generation
                self.flash_model = genai.GenerativeModel('gemini-2.5-flash')
                self.pro_model = genai.GenerativeModel('gemini-2.5-flash')
                self.initialized = True
                print("✅ SUCCESS: Gemini AI initialized successfully")
                print(f"Flash Model: {self.flash_model._model_name}")
                print(f"Pro Model: {self.pro_model._model_name}")
                print("⚠️  Note: Using gemini-2.5-flash for question generation")
                print("⚠️  Rate limit: 5 requests per minute per model")
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
            if "429" in error_str or "quota" in error_str.lower() or "rate limit" in error_str.lower():
                print("⚠️  QUOTA EXCEEDED: Using fallback questions")
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
            if "429" in error_str or "quota" in error_str.lower() or "rate limit" in error_str.lower():
                print("⚠️  QUOTA EXCEEDED: Using fallback evaluation")
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
        
        prompt += f"""Generate the first interview question. Make it relevant, realistic, and appropriate for the difficulty level.

For technical interviews:
- Entry level: Focus on fundamental concepts, basic syntax, common patterns, simple problem-solving
- Mid level: Test practical experience, problem-solving, design decisions, real-world scenarios
- Senior level: Architecture, scalability, trade-offs, complex scenarios, leadership, system design

For behavioral interviews:
- Use STAR format questions (Situation, Task, Action, Result)
- Focus on real-world scenarios relevant to the role and company culture
- Assess teamwork, conflict resolution, leadership, and problem-solving

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
    
    def _get_fallback_questions(self, category: str, difficulty: str, count: int) -> list:
        """Comprehensive fallback questions when AI is not available"""
        import random
        
        fallback_questions = {
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
