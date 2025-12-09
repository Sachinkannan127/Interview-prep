import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { interviewAPI, questionsAPI } from '../services/api';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Brain, Play, TrendingUp, LogOut, RefreshCw, Target } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [practiceSessions, setPracticeSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    // Refresh data when window/tab becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };

    // Refresh data when window gains focus
    const handleFocus = () => {
      loadData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load interviews
      const interviewData = await interviewAPI.getUserInterviews();
      setInterviews(interviewData.interviews || []);
      
      // Load practice sessions
      const practiceData = await questionsAPI.getPracticeHistory(20);
      setPracticeSessions(practiceData.sessions || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - InterviewAI</title>
        <meta name="description" content="Track your interview progress, view practice sessions, and monitor your performance with detailed analytics." />
        <meta name="keywords" content="dashboard, analytics, interview history, progress tracking" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200">
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-2xl font-bold text-primary-500">
          <Brain className="w-8 h-8" />
          <span>InterviewAI</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/practice')} className="btn-secondary">
            Practice
          </button>
          <button onClick={handleLogout} className="btn-secondary flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-dark-800 mb-4">Welcome back!</h1>
          <p className="text-dark-600">Ready to practice your interview skills?</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 fade-in">
          <div className="card slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-600 text-sm">Total Interviews</p>
                <p className="text-3xl font-bold text-dark-800">{interviews.length}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-primary-500" />
            </div>
          </div>

          <div className="card slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-600 text-sm">Interview Avg Score</p>
                <p className="text-3xl font-bold text-dark-800">
                  {interviews.length > 0
                    ? Math.round(interviews.reduce((acc, i) => acc + (i.overallScore || 0), 0) / interviews.length)
                    : 0}
                </p>
              </div>
              <Brain className="w-12 h-12 text-primary-500" />
            </div>
          </div>

          <div className="card slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-600 text-sm">Practice Sessions</p>
                <p className="text-3xl font-bold text-dark-800">{practiceSessions.length}</p>
              </div>
              <Target className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white cursor-pointer hover:scale-105 transition-transform slide-up" onClick={() => navigate('/interview/setup')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Start New</p>
                <p className="text-2xl font-bold">Interview</p>
              </div>
              <Play className="w-12 h-12" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-dark-800">Recent Interviews</h2>
            <button
              onClick={loadData}
              disabled={loading}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          {loading ? (
            <p className="text-dark-600">Loading...</p>
          ) : interviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-dark-600 mb-4">No interviews yet</p>
              <button onClick={() => navigate('/interview/setup')} className="btn-primary">
                Start Your First Interview
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-4 bg-dark-50 rounded-lg hover:bg-dark-200 transition-colors">
                  <div className="flex-1 cursor-pointer" onClick={() => {
                    if (interview.status === 'completed') {
                      navigate(`/interview/results/${interview.id}`);
                    } else {
                      navigate(`/interview/session/${interview.id}`);
                    }
                  }}>
                    <p className="font-medium text-dark-800">{interview.config?.type || 'Interview'}</p>
                    <p className="text-sm text-dark-600">
                      {interview.config?.role} - {interview.config?.difficulty}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-sm text-dark-600">{interview.status}</p>
                      {interview.overallScore && (
                        <p className="font-bold text-primary-600">{interview.overallScore}/100</p>
                      )}
                    </div>
                    {interview.status === 'completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/interview/results/${interview.id}`);
                        }}
                        className="btn-secondary text-xs px-3 py-1"
                      >
                        View Results
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Practice Sessions Section */}
        <div className="card mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-dark-800">Recent Practice Sessions</h2>
            <button onClick={() => navigate('/practice')} className="btn-primary">
              Start Practice
            </button>
          </div>
          {loading ? (
            <p className="text-dark-600">Loading...</p>
          ) : practiceSessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-dark-600 mb-4">No practice sessions yet</p>
              <button onClick={() => navigate('/practice')} className="btn-primary">
                Start Your First Practice Session
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {practiceSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <div>
                    <p className="font-medium text-dark-800">{session.category} - {session.difficulty}</p>
                    <p className="text-sm text-dark-600">
                      {session.questionsAnswered || 0} questions • {session.averageScore ? Math.round(session.averageScore) : 0}% avg score
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-dark-600">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                    <p className="font-bold text-green-600">
                      {session.averageScore ? Math.round(session.averageScore) : 0}/100
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
    </>
  );
}
