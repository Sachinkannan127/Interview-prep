import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // For development, continue without auth token
    console.log('Auth token not available, continuing without authentication');
  }
  return config;
});

export const interviewAPI = {
  startInterview: async (config: any) => {
    const response = await apiClient.post('/api/interviews/start', { config });
    return response.data;
  },

  submitAnswer: async (interviewId: string, answerText: string, elapsedMs: number) => {
    const response = await apiClient.post(`/api/interviews/${interviewId}/answer`, {
      answerText,
      elapsedMs,
    });
    return response.data;
  },

  finishInterview: async (interviewId: string) => {
    const response = await apiClient.post(`/api/interviews/${interviewId}/finish`);
    return response.data;
  },

  getInterview: async (interviewId: string) => {
    const response = await apiClient.get(`/api/interviews/${interviewId}`);
    return response.data;
  },

  getUserInterviews: async () => {
    const response = await apiClient.get('/api/interviews');
    return response.data;
  },
};

export const questionsAPI = {
  getQuestions: async (category?: string, difficulty?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    const response = await apiClient.get(`/api/questions?${params.toString()}`);
    return response.data;
  },

  generatePracticeQuestions: async (category: string, difficulty: string, count: number = 5) => {
    const response = await apiClient.get('/api/questions/generate', {
      params: { category, difficulty, count }
    });
    return response.data;
  },

  evaluatePracticeAnswer: async (data: { 
    question: string; 
    answer: string; 
    category: string;
    sessionId?: string;
  }) => {
    const response = await apiClient.post('/api/questions/evaluate', data);
    return response.data;
  },

  finishPracticeSession: async (sessionId: string) => {
    const response = await apiClient.post(`/api/questions/finish-session/${sessionId}`);
    return response.data;
  },

  getPracticeHistory: async (limit: number = 20) => {
    const response = await apiClient.get('/api/questions/history', {
      params: { limit }
    });
    return response.data;
  },

  getPracticeSession: async (sessionId: string) => {
    const response = await apiClient.get(`/api/questions/session/${sessionId}`);
    return response.data;
  },
};

export default apiClient;
