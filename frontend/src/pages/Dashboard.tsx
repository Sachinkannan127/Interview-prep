import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { Brain, Play, TrendingUp, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    if (!auth.currentUser) return;
    
    try {
      const q = query(
        collection(db, 'interviews'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('startedAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInterviews(data);
    } catch (error) {
      console.error('Error loading interviews:', error);
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

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-600 text-sm">Total Interviews</p>
                <p className="text-3xl font-bold text-dark-800">{interviews.length}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-primary-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-600 text-sm">Avg Score</p>
                <p className="text-3xl font-bold text-dark-800">
                  {interviews.length > 0
                    ? Math.round(interviews.reduce((acc, i) => acc + (i.overallScore || 0), 0) / interviews.length)
                    : 0}
                </p>
              </div>
              <Brain className="w-12 h-12 text-primary-500" />
            </div>
          </div>

          <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/interview/setup')}>
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
          <h2 className="text-2xl font-bold text-dark-800 mb-6">Recent Interviews</h2>
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
                <div key={interview.id} className="flex items-center justify-between p-4 bg-dark-50 rounded-lg hover:bg-dark-200 transition-colors cursor-pointer" onClick={() => navigate(`/interview/session/${interview.id}`)}>
                  <div>
                    <p className="font-medium text-dark-800">{interview.config?.type || 'Interview'}</p>
                    <p className="text-sm text-dark-600">
                      {interview.config?.role} - {interview.config?.difficulty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-dark-600">{interview.status}</p>
                    {interview.overallScore && (
                      <p className="font-bold text-primary-600">{interview.overallScore}/100</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
