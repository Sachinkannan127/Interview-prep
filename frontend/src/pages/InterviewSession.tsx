import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import { detectFillerWords, calculateWordCount, calculateConfidenceScore, formatDuration } from '../utils/metrics';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    wordCount: 0,
    fillerCount: 0,
    confidenceScore: 0,
    responseTime: 0,
  });
  const timerRef = useRef<any>(null);

  useEffect(() => {
    loadInterview();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const loadInterview = async () => {
    try {
      const data = await interviewAPI.getInterview(id!);
      setInterview(data);
      if (data.qa && data.qa.length > 0) {
        const lastQA = data.qa[data.qa.length - 1];
        setCurrentQuestion(lastQA.questionText);
      } else {
        const question = data.firstQuestion || 'Loading first question...';
        setCurrentQuestion(question);
      }
    } catch (error: any) {
      console.error('Failed to load interview:', error);
      toast.error(error?.response?.data?.detail || 'Failed to load interview. Please try again.');
      navigate('/dashboard');
    }
  };

  const updateMetrics = (text: string) => {
    const wordCount = calculateWordCount(text);
    const fillerCount = detectFillerWords(text);
    const confidenceScore = calculateConfidenceScore(text, fillerCount, wordCount);
    const responseTime = startTime ? (Date.now() - startTime) / 1000 : 0;
    
    setMetrics({ wordCount, fillerCount, confidenceScore, responseTime });
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    if (!startTime) {
      setStartTime(Date.now());
    }
    
    const elapsedMs = startTime ? Date.now() - startTime : 0;

    setLoading(true);

    try {
      const response = await interviewAPI.submitAnswer(id!, answer.trim(), elapsedMs);
      
      // Get score from evaluation
      const score = response.evaluation?.score || 0;
      
      // Show appropriate feedback based on score
      if (score >= 85) {
        toast.success('Excellent answer! 🌟');
      } else if (score >= 70) {
        toast.success('Good job! 👍');
      } else {
        toast('Keep going! 💪');
      }
      
      if (response.nextQuestion) {
        setCurrentQuestion(response.nextQuestion);
        setAnswer('');
        setStartTime(null);
        setMetrics({ wordCount: 0, fillerCount: 0, confidenceScore: 0, responseTime: 0 });
      } else {
        toast.success('Interview completed!');
        await interviewAPI.finishInterview(id!);
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Submit answer error:', error);
      toast.error(error?.response?.data?.detail || error.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishInterview = async () => {
    if (confirm('Are you sure you want to end this interview?')) {
      try {
        await interviewAPI.finishInterview(id!);
        toast.success('Interview completed! View your results below.');
        navigate(`/interview/results/${id}`);
      } catch (error) {
        toast.error('Failed to end interview');
      }
    }
  };

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 flex items-center justify-center">
        <div className="animate-pulse text-primary-500 text-xl">Loading interview...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 py-8 px-6 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-dark-800">Interview in Progress</h2>
                <button onClick={handleFinishInterview} className="btn-secondary text-sm">
                  End Interview
                </button>
              </div>
              
              <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-6 rounded">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-primary-700 font-medium mb-1">Question</p>
                    <p className="text-dark-800">{currentQuestion}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-dark-700 mb-2">Your Answer</label>
                <div>
                  <textarea
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      updateMetrics(e.target.value);
                      if (!startTime) setStartTime(Date.now());
                    }}
                    className="input min-h-32 mb-3"
                    placeholder="Type your answer here..."
                  />
                  <button onClick={handleSubmitAnswer} disabled={loading} className="btn-primary flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    {loading ? 'Submitting...' : 'Submit Answer'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-bold text-dark-800 mb-4">Live Metrics</h3>
              <div className="space-y-4">
                <MetricCard label="Response Time" value={formatDuration((startTime ? Date.now() - startTime : 0))} />
                <MetricCard label="Word Count" value={metrics.wordCount.toString()} />
                <MetricCard label="Filler Words" value={metrics.fillerCount.toString()} />
                <MetricCard label="Confidence" value={`${metrics.confidenceScore}%`} color={metrics.confidenceScore >= 70 ? 'text-green-600' : metrics.confidenceScore >= 40 ? 'text-yellow-600' : 'text-red-600'} />
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-dark-800 mb-4">Interview Info</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-dark-600">Type:</span> <span className="font-medium text-dark-800">{interview.config?.type}</span></p>
                <p><span className="text-dark-600">Role:</span> <span className="font-medium text-dark-800">{interview.config?.role}</span></p>
                <p><span className="text-dark-600">Difficulty:</span> <span className="font-medium text-dark-800">{interview.config?.difficulty}</span></p>
                <p><span className="text-dark-600">Duration:</span> <span className="font-medium text-dark-800">{interview.config?.durationMinutes} min</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color = 'text-dark-800' }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-dark-600">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}
