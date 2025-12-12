from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime

class InterviewConfig(BaseModel):
    type: Literal['technical', 'behavioral', 'hr', 'case-study', 'aptitude']
    subType: Optional[Literal['dsa', 'system-design', 'java', 'react', 'dotnet', 'python', 'nodejs', 'angular', 'spring-boot', 'microservices', 'cloud', 'devops', 'database', 'fresher', 'star']] = None
    industry: str
    role: str
    company: Optional[str] = None
    difficulty: Literal['entry', 'mid', 'senior']
    durationMinutes: Literal[15, 30, 45, 60]
    videoEnabled: bool = True

class StartInterviewRequest(BaseModel):
    config: InterviewConfig

class SubmitAnswerRequest(BaseModel):
    answerText: str
    elapsedMs: int
    partialTranscript: Optional[str] = None

class QuestionAnswer(BaseModel):
    questionId: str
    questionText: str
    answerText: str
    startTs: int
    endTs: int
    aiScore: Optional[float] = None
    aiFeedback: Optional[str] = None
    modelAnswer: Optional[str] = None

class InterviewMetrics(BaseModel):
    avgResponseTime: float
    fillerCount: int
    confidenceScore: float
    wordCount: int
    speakingPace: Optional[float] = None

class Interview(BaseModel):
    id: str
    userId: str
    config: InterviewConfig
    startedAt: datetime
    endedAt: Optional[datetime] = None
    status: Literal['in_progress', 'completed']
    transcript: str = ""
    qa: List[QuestionAnswer] = []
    overallScore: Optional[float] = None
    metrics: Optional[InterviewMetrics] = None

class AIEvaluation(BaseModel):
    score: float
    feedback: str
    modelAnswer: str
    strengths: List[str]
    improvements: List[str]

class AIResponse(BaseModel):
    type: Literal['question', 'evaluation', 'follow-up']
    nextQuestion: Optional[str] = None
    evaluation: Optional[AIEvaluation] = None

class PracticeQuestion(BaseModel):
    question: str
    answer: str
    score: float
    feedback: str
    answeredAt: datetime

class PracticeSession(BaseModel):
    id: str
    userId: str
    category: str
    difficulty: str
    startedAt: datetime
    endedAt: Optional[datetime] = None
    questions: List[PracticeQuestion] = []
    averageScore: Optional[float] = None
    totalQuestions: int = 0
    completedQuestions: int = 0
