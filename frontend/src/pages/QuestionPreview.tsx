import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, RefreshCw, Play, Sparkles } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  order: number;
}

export default function QuestionPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const config = location.state?.config;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  useEffect(() => {
    if (!config) {
      toast.error('No configuration found');
      navigate('/dashboard');
      return;
    }
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const response = await interviewAPI.generateQuestionSet(config);
      setQuestions(response.questions);
      toast.success('Questions generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate questions');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const regenerateQuestion = async (questionId: string) => {
    setRegenerating(questionId);
    try {
      const response = await interviewAPI.regenerateQuestion(config, questionId);
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? response.question : q
      ));
      toast.success('Question regenerated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to regenerate question');
    } finally {
      setRegenerating(null);
    }
  };

  const regenerateAll = async () => {
    setLoading(true);
    try {
      const response = await interviewAPI.generateQuestionSet(config);
      setQuestions(response.questions);
      toast.success('All questions regenerated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to regenerate questions');
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async () => {
    setLoading(true);
    try {
      const response = await interviewAPI.startInterviewWithQuestions(config, questions);
      toast.success('Interview started!');
      navigate(`/interview/session/${response.interviewId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start interview');
      setLoading(false);
    }
  };

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-pulse" />
          <div className="text-xl text-dark-700">Generating questions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <button 
          onClick={() => navigate('/interview/setup')} 
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 sm:mb-8 transition-colors group text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Setup
        </button>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Review Questions
                </span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">
                Preview and customize your interview questions 🎯
              </p>
            </div>
            <button
              onClick={regenerateAll}
              disabled={loading}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Regenerate All
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {questions.map((question, index) => (
              <div key={question.id} className="border border-slate-700 rounded-lg p-4 bg-slate-800/50 hover:bg-slate-800/70 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-xs text-slate-400">Question {index + 1}</span>
                    </div>
                    <p className="text-slate-200 text-base">{question.text}</p>
                  </div>
                  <button
                    onClick={() => regenerateQuestion(question.id)}
                    disabled={regenerating === question.id || loading}
                    className="btn-ghost p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                    title="Regenerate this question"
                  >
                    <RefreshCw className={`w-4 h-4 ${regenerating === question.id ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={startInterview}
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-lg py-4"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Interview with These Questions
                </>
              )}
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              💡 <strong>Tip:</strong> You can regenerate individual questions or all questions before starting. 
              Each regeneration will create a new unique question maintaining the same difficulty and topic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
