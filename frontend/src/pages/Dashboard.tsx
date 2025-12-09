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
      <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold">
          <div className="relative">
            <Brain className="w-8 sm:w-10 h-8 sm:h-10 text-indigo-400 animate-pulse" />
            <div className="absolute inset-0 w-8 sm:w-10 h-8 sm:h-10 bg-indigo-500/30 rounded-full blur-xl" />
          </div>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-extrabold hidden sm:inline">InterviewAI</span>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-extrabold sm:hidden">AI</span>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <button onClick={() => navigate('/practice')} className="btn-secondary text-sm sm:text-base">
            <span className="hidden sm:inline">🎯 Practice</span>
            <span className="sm:hidden">🎯</span>
          </button>
          <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 text-sm sm:text-base">
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Welcome back!</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg">Ready to level up your interview skills? 🚀</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 fade-in">
          <div className="card group hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Total Interviews</p>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{interviews.length}</p>
              </div>
              <div className="relative">
                <TrendingUp className="w-12 h-12 text-cyan-400 relative z-10" />
                <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all" />
              </div>
            </div>
          </div>

          <div className="card group hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Avg Score</p>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                  {interviews.length > 0
                    ? Math.round(interviews.reduce((acc, i) => acc + (i.overallScore || 0), 0) / interviews.length)
                    : 0}
                </p>
              </div>
              <div className="relative">
                <Brain className="w-12 h-12 text-emerald-400 relative z-10" />
                <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all" />
              </div>
            </div>
          </div>

          <div className="card group hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Practice Sessions</p>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">{practiceSessions.length}</p>
              </div>
              <div className="relative">
                <Target className="w-12 h-12 text-purple-400 relative z-10" />
                <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all" />
              </div>
            </div>
          </div>

          <div className="card group cursor-pointer hover:scale-105 relative overflow-hidden" onClick={() => navigate('/interview/setup')}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm font-medium mb-2">✨ Start New</p>
                <p className="text-3xl font-extrabold text-white">Interview</p>
              </div>
              <Play className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Recent Interviews</h2>
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
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <p className="text-slate-300 mb-6 text-lg">No interviews yet. Start your journey!</p>
              <button onClick={() => navigate('/interview/setup')} className="btn-primary">
                Start Your First Interview →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-5 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                  }}
                  onClick={() => {
                    if (interview.status === 'completed') {
                      navigate(`/interview/results/${interview.id}`);
                    } else {
                      navigate(`/interview/session/${interview.id}`);
                    }
                  }}>
                  <div className="flex-1">
                    <p className="font-bold text-white text-lg mb-1">{interview.config?.type || 'Interview'}</p>
                    <p className="text-sm text-slate-400">
                      {interview.config?.role} • {interview.config?.difficulty}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-sm text-slate-400 capitalize mb-1">{interview.status}</p>
                      {interview.overallScore && (
                        <p className="font-extrabold text-2xl bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">{interview.overallScore}/100</p>
                      )}
                    </div>
                    {interview.status === 'completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/interview/results/${interview.id}`);
                        }}
                        className="btn-secondary text-sm px-4 py-2"
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
