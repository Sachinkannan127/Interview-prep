import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Sparkles, Clock, Target, CheckCircle, XCircle, History } from 'lucide-react';
import { questionsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Question {
  question: string;
  category: string;
  difficulty: string;
  hints?: string[];
  topics?: string[];
}

interface Evaluation {
  score: number;
  feedback: string;
  keyPoints: string[];
}

export default function Practice() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('technical');
  const [difficulty, setDifficulty] = useState('entry');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [score, setScore] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const response = await questionsAPI.generatePracticeQuestions(category, difficulty, 5);
      setQuestions(response.questions);
      setSessionId(response.sessionId);
      setCurrentIndex(0);
      setAnswer('');
      setEvaluation(null);
      setScore([]);
      setStarted(true);
      toast.success('Practice questions generated!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setLoading(true);
    try {
      const result = await questionsAPI.evaluatePracticeAnswer({
        question: questions[currentIndex].question,
        answer: answer,
        category: category,
        sessionId: sessionId || undefined
      });
      setEvaluation(result);
      setScore([...score, result.score]);
      toast.success('Answer evaluated and saved!');
    } catch (error: any) {
      toast.error('Failed to evaluate answer');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer('');
      setEvaluation(null);
      setShowHints(false);
    }
  };

  const handleFinish = async () => {
    const avgScore = score.reduce((a, b) => a + b, 0) / score.length;
    
    // Mark session as complete
    if (sessionId) {
      try {
        await questionsAPI.finishPracticeSession(sessionId);
      } catch (error) {
        console.error('Failed to mark session as complete:', error);
      }
    }
    
    toast.success(`Practice complete! Average score: ${avgScore.toFixed(1)}/100`);
    setStarted(false);
    setQuestions([]);
    setScore([]);
    setSessionId(null);
  };

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const avgScore = score.length > 0 ? score.reduce((a, b) => a + b, 0) / score.length : 0;

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-dark-600 hover:text-dark-800 mb-8">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="card">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-3xl font-bold text-dark-800 mb-2">AI Practice Mode</h1>
              <p className="text-dark-600">Generate custom practice questions with instant AI feedback</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="input"
                >
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="hr">HR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Difficulty</label>
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)} 
                  className="input"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                </select>
              </div>

              <button 
                onClick={generateQuestions} 
                disabled={loading} 
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate 5 Practice Questions
                  </>
                )}
              </button>

              <button 
                onClick={() => setShowHistory(true)} 
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                View Practice History
              </button>

              <div className="text-center pt-4">
                <button onClick={() => navigate('/interview/setup')} className="text-primary-600 hover:text-primary-700 text-sm">
                  Or start a full interview session →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 py-12 px-6">
      <div className="container mx-auto max-w-4xl">
        <button onClick={() => setStarted(false)} className="flex items-center gap-2 text-dark-600 hover:text-dark-800 mb-8">
          <ArrowLeft className="w-5 h-5" />
          Back to Setup
        </button>

        {/* Progress Bar */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-dark-700">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-dark-600">
              {score.length > 0 ? `Avg Score: ${avgScore.toFixed(1)}/100` : 'No scores yet'}
            </span>
          </div>
          <div className="w-full bg-dark-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium text-primary-600 capitalize">{currentQuestion.category}</span>
            </div>
            <span className="text-xs px-2 py-1 bg-dark-100 text-dark-700 rounded capitalize">
              {currentQuestion.difficulty}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-dark-800 mb-4">
            {currentQuestion.question}
          </h2>

          {currentQuestion.hints && currentQuestion.hints.length > 0 && (
            <div className="mb-4">
              <button 
                onClick={() => setShowHints(!showHints)} 
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {showHints ? 'Hide Hints' : 'Show Hints'}
              </button>
              {showHints && (
                <ul className="mt-2 space-y-1">
                  {currentQuestion.hints.map((hint, idx) => (
                    <li key={idx} className="text-sm text-dark-600">• {hint}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="input min-h-[150px] mb-4"
            disabled={evaluation !== null}
          />

          {!evaluation ? (
            <button 
              onClick={handleSubmitAnswer} 
              disabled={loading || !answer.trim()} 
              className="btn-primary w-full"
            >
              {loading ? 'Evaluating...' : 'Submit Answer'}
            </button>
          ) : (
            <div className="space-y-4">
              {/* Score */}
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {evaluation.score >= 70 ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Target className="w-6 h-6 text-orange-600" />
                  )}
                  <span className="font-medium text-dark-800">Score</span>
                </div>
                <span className="text-2xl font-bold text-primary-600">{evaluation.score}/100</span>
              </div>

              {/* Feedback */}
              <div className="p-4 bg-dark-50 rounded-lg">
                <h3 className="font-medium text-dark-800 mb-2">Feedback</h3>
                <p className="text-dark-700">{evaluation.feedback}</p>
              </div>

              {/* Key Points */}
              {evaluation.keyPoints && evaluation.keyPoints.length > 0 && (
                <div className="p-4 bg-dark-50 rounded-lg">
                  <h3 className="font-medium text-dark-800 mb-2">Key Points</h3>
                  <ul className="space-y-1">
                    {evaluation.keyPoints.map((point, idx) => (
                      <li key={idx} className="text-sm text-dark-700">• {point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-4">
                {currentIndex < questions.length - 1 ? (
                  <button onClick={handleNextQuestion} className="btn-primary flex-1">
                    Next Question →
                  </button>
                ) : (
                  <button onClick={handleFinish} className="btn-primary flex-1">
                    Finish Practice
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Score Summary */}
        {score.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-dark-800">Progress Summary</h3>
              <div className="text-right">
                <div className="text-xs text-dark-600">Average Score</div>
                <div className={`text-2xl font-bold ${
                  avgScore >= 80 ? 'text-green-600' : 
                  avgScore >= 60 ? 'text-orange-600' : 
                  'text-red-600'
                }`}>
                  {avgScore.toFixed(1)}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {score.map((s, idx) => (
                <div 
                  key={idx} 
                  className={`flex-1 min-w-[60px] text-center p-3 rounded ${
                    s >= 80 ? 'bg-green-100 text-green-700' : 
                    s >= 60 ? 'bg-orange-100 text-orange-700' : 
                    'bg-red-100 text-red-700'
                  }`}
                >
                  <div className="text-xs mb-1">Q{idx + 1}</div>
                  <div className="font-bold text-lg">{s}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Show history view
  if (showHistory) {
    return <PracticeHistory onBack={() => setShowHistory(false)} />;
  }
}

// Practice History Component
function PracticeHistory({ onBack }: { onBack: () => void }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await questionsAPI.getPracticeHistory();
      setSessions(data.sessions || []);
    } catch (error) {
      toast.error('Failed to load practice history');
    } finally {
      setLoading(false);
    }
  };

  const viewSessionDetails = async (sessionId: string) => {
    try {
      const session = await questionsAPI.getPracticeSession(sessionId);
      setSelectedSession(session);
    } catch (error) {
      toast.error('Failed to load session details');
    }
  };

  if (selectedSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <button onClick={() => setSelectedSession(null)} className="flex items-center gap-2 text-dark-600 hover:text-dark-800 mb-8">
            <ArrowLeft className="w-5 h-5" />
            Back to History
          </button>

          <div className="card mb-6">
            <h2 className="text-2xl font-bold text-dark-800 mb-4">Session Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-sm text-dark-600">Category</div>
                <div className="font-medium text-dark-800 capitalize">{selectedSession.category}</div>
              </div>
              <div>
                <div className="text-sm text-dark-600">Difficulty</div>
                <div className="font-medium text-dark-800 capitalize">{selectedSession.difficulty}</div>
              </div>
              <div>
                <div className="text-sm text-dark-600">Questions</div>
                <div className="font-medium text-dark-800">{selectedSession.completedQuestions}/{selectedSession.totalQuestions}</div>
              </div>
              <div>
                <div className="text-sm text-dark-600">Average Score</div>
                <div className="font-medium text-dark-800">{selectedSession.averageScore?.toFixed(1) || 'N/A'}/100</div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedSession.questions?.map((q: any, idx: number) => (
                <div key={idx} className="border border-dark-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-dark-800">Question {idx + 1}</h3>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      q.score >= 80 ? 'bg-green-100 text-green-700' :
                      q.score >= 60 ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Score: {q.score}/100
                    </span>
                  </div>
                  <p className="text-dark-700 mb-3">{q.question}</p>
                  <div className="bg-dark-50 p-3 rounded mb-2">
                    <div className="text-sm text-dark-600 mb-1">Your Answer:</div>
                    <div className="text-dark-800">{q.answer}</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-sm text-blue-600 mb-1">Feedback:</div>
                    <div className="text-dark-800">{q.feedback}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 py-12 px-6">
      <div className="container mx-auto max-w-4xl">
        <button onClick={onBack} className="flex items-center gap-2 text-dark-600 hover:text-dark-800 mb-8">
          <ArrowLeft className="w-5 h-5" />
          Back to Practice
        </button>

        <div className="card">
          <h2 className="text-2xl font-bold text-dark-800 mb-6">Practice History</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-dark-600 mt-4">Loading history...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-dark-400 mx-auto mb-4" />
              <p className="text-dark-600">No practice sessions yet</p>
              <button onClick={onBack} className="btn-primary mt-4">
                Start Your First Practice
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div 
                  key={session.id} 
                  className="border border-dark-200 rounded-lg p-4 hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => viewSessionDetails(session.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${session.endedAt ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                      <div>
                        <div className="font-medium text-dark-800 capitalize">{session.category} - {session.difficulty}</div>
                        <div className="text-sm text-dark-600">
                          {new Date(session.startedAt).toLocaleDateString()} at {new Date(session.startedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-dark-800">
                        {session.averageScore?.toFixed(1) || 'N/A'}
                      </div>
                      <div className="text-sm text-dark-600">{session.completedQuestions}/{session.totalQuestions} completed</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

