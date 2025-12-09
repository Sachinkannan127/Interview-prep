export interface User {
  uid: string;
  email: string;
  name: string;
  targetRole: string;
  experienceLevel: 'entry' | 'mid' | 'senior';
  industriesOfInterest: string[];
  role: 'user' | 'admin';
  createdAt: Date;
  lastActive: Date;
}

export interface InterviewConfig {
  type: 'technical' | 'behavioral' | 'hr' | 'case-study';
  subType?: 'dsa' | 'system-design' | 'java' | 'react' | 'dotnet' | 'python' | 'nodejs' | 'angular' | 'spring-boot' | 'microservices' | 'cloud' | 'devops' | 'database' | 'fresher' | 'star';
  industry: string;
  role: string;
  company?: string;
  difficulty: 'entry' | 'mid' | 'senior';
  durationMinutes: 15 | 30 | 45 | 60;
  voiceEnabled: boolean;
}

export interface QuestionAnswer {
  questionId: string;
  questionText: string;
  answerText: string;
  startTs: number;
  endTs: number;
  aiScore?: number;
  aiFeedback?: string;
  modelAnswer?: string;
}

export interface Interview {
  id: string;
  userId: string;
  config: InterviewConfig;
  startedAt: Date;
  endedAt?: Date;
  status: 'in_progress' | 'completed';
  transcript: string;
  qa: QuestionAnswer[];
  overallScore?: number;
  metrics?: InterviewMetrics;
}

export interface InterviewMetrics {
  avgResponseTime: number;
  fillerCount: number;
  confidenceScore: number;
  wordCount: number;
  speakingPace?: number;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: string;
  tags: string[];
}

export interface AIResponse {
  type: 'question' | 'evaluation' | 'follow-up';
  nextQuestion?: string;
  evaluation?: {
    score: number;
    feedback: string;
    modelAnswer: string;
    strengths: string[];
    improvements: string[];
  };
}
