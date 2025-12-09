import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './services/firebase';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import QuestionPreview from './pages/QuestionPreview';
import InterviewSession from './pages/InterviewSession';
import InterviewResults from './pages/InterviewResults';
import Practice from './pages/Practice';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 flex items-center justify-center">
        <div className="animate-pulse text-primary-500 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
        <Route path="/interview/setup" element={user ? <InterviewSetup /> : <Navigate to="/auth" />} />
        <Route path="/interview/preview" element={user ? <QuestionPreview /> : <Navigate to="/auth" />} />
        <Route path="/interview/session/:id" element={user ? <InterviewSession /> : <Navigate to="/auth" />} />
        <Route path="/interview/results/:id" element={user ? <InterviewResults /> : <Navigate to="/auth" />} />
        <Route path="/practice" element={user ? <Practice /> : <Navigate to="/auth" />} />
        <Route path="/admin" element={user ? <AdminPanel /> : <Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
