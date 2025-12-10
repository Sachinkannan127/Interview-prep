import axios, { AxiosError } from 'axios';
import { auth } from './firebase';

// Determine API URL based on environment
const getApiBaseUrl = (): string => {
  // Check if we're in production (Vercel)
  const prodApiUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (prodApiUrl) {
    return prodApiUrl;
  }
  
  // Default to localhost for development
  return 'http://localhost:8001';
};

const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  withCredentials: false, // Set to true if using cookies
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Auth token not available:', error);
      // Continue without auth token for public endpoints
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      const message = data?.detail || data?.message || error.message;

      // Don't retry on client errors (4xx)
      if (status >= 400 && status < 500) {
        console.error(`Client Error (${status}):`, message);
        return Promise.reject(new Error(message));
      }

      // Retry on server errors (5xx) - max 3 attempts
      if (status >= 500 && !originalRequest._retry) {
        originalRequest._retry = true;
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

        if (originalRequest._retryCount <= 2) {
          console.warn(`Retrying request (attempt ${originalRequest._retryCount + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retryCount));
          return apiClient(originalRequest);
        }
      }

      console.error(`Server Error (${status}):`, message);
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Network error - no response received
      console.error('Network Error:', error.message);
      return Promise.reject(
        new Error('Unable to connect to server. Please check your internet connection and try again.')
      );
    } else {
      console.error('Request Error:', error.message);
      return Promise.reject(error);
    }
  }
);

export const interviewAPI = {
  startInterview: async (config: any) => {
    const response = await apiClient.post('/api/interviews/start', { config });
    return response.data;
  },

  generateQuestionSet: async (config: any, count: number = 5) => {
    const response = await apiClient.post('/api/interviews/generate-question-set', { config, count });
    return response.data;
  },

  regenerateQuestion: async (config: any, questionId: string) => {
    const response = await apiClient.post('/api/interviews/regenerate-question', { config, questionId });
    return response.data;
  },

  startInterviewWithQuestions: async (config: any, questions: any[]) => {
    const response = await apiClient.post('/api/interviews/start-with-questions', { config, questions });
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
