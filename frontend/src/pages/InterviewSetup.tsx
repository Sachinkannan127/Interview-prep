import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Mic, Check } from 'lucide-react';

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    type: 'technical',
    subType: 'dsa',
    industry: 'Software Engineering',
    role: 'Software Engineer',
    difficulty: 'mid',
    durationMinutes: 30,
    voiceEnabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [micTested, setMicTested] = useState(false);

  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicTested(true);
      toast.success('✅ Microphone access granted! You can now start the interview.');
    } catch (error: any) {
      console.error('Microphone test failed:', error);
      let errorMsg = 'Microphone test failed. ';
      
      if (error.name === 'NotAllowedError') {
        errorMsg += 'Please click the 🔒 icon in your address bar, allow microphone access, and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMsg += 'No microphone detected. Please connect a microphone.';
      } else if (error.name === 'NotReadableError') {
        errorMsg += 'Microphone is being used by another application.';
      } else {
        errorMsg += error.message;
      }
      
      toast.error(errorMsg, { duration: 8000 });
    }
  };

  const handleStart = async () => {
    if (config.voiceEnabled && !micTested) {
      toast.error('Please test your microphone first by clicking the "Test Microphone" button.');
      return;
    }

    setLoading(true);
    try {
      const response = await interviewAPI.startInterview(config);
      toast.success('Interview started!');
      navigate(`/interview/session/${response.interviewId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 py-12 px-6">
      <div className="container mx-auto max-w-3xl">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-dark-600 hover:text-dark-800 mb-8">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="card">
          <h1 className="text-3xl font-bold text-dark-800 mb-8">Configure Your Interview</h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Interview Type</label>
              <select value={config.type} onChange={(e) => setConfig({ ...config, type: e.target.value as any })} className="input">
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="hr">HR Round</option>
                <option value="case-study">Case Study</option>
              </select>
            </div>

            {config.type === 'technical' && (
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Sub-type</label>
                <select value={config.subType} onChange={(e) => setConfig({ ...config, subType: e.target.value as any })} className="input">
                  <option value="dsa">DSA & Algorithms</option>
                  <option value="system-design">System Design</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Industry</label>
              <select value={config.industry} onChange={(e) => setConfig({ ...config, industry: e.target.value })} className="input">
                <option value="Software Engineering">Software Engineering</option>
                <option value="Data Science">Data Science</option>
                <option value="Product Management">Product Management</option>
                <option value="Finance">Finance</option>
                <option value="Consulting">Consulting</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Role</label>
              <input type="text" value={config.role} onChange={(e) => setConfig({ ...config, role: e.target.value })} className="input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Difficulty Level</label>
              <select value={config.difficulty} onChange={(e) => setConfig({ ...config, difficulty: e.target.value as any })} className="input">
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Duration (minutes)</label>
              <select value={config.durationMinutes} onChange={(e) => setConfig({ ...config, durationMinutes: parseInt(e.target.value) as any })} className="input">
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="voice" 
                checked={config.voiceEnabled} 
                onChange={(e) => {
                  setConfig({ ...config, voiceEnabled: e.target.checked });
                  if (!e.target.checked) setMicTested(false);
                }} 
                className="w-5 h-5" 
              />
              <label htmlFor="voice" className="text-sm font-medium text-dark-700">Enable Voice Mode (Speech-to-Text)</label>
            </div>

            {config.voiceEnabled && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <p className="text-blue-900 font-medium mb-3">🎤 Microphone Setup Required</p>
                <button
                  onClick={testMicrophone}
                  disabled={micTested}
                  className={`btn-secondary w-full flex items-center justify-center gap-2 mb-3 ${
                    micTested ? 'bg-green-600 hover:bg-green-700 text-white' : ''
                  }`}
                >
                  {micTested ? <Check className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {micTested ? 'Microphone Ready ✓' : 'Test Microphone'}
                </button>
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">If permission denied:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Click the 🔒 or 🎤 icon at the LEFT of your address bar</li>
                    <li>Find "Microphone" and change to "Allow"</li>
                    <li>Click "Test Microphone" again</li>
                  </ol>
                </div>
              </div>
            )}

            <button onClick={handleStart} disabled={loading} className="btn-primary w-full mt-8">
              {loading ? 'Starting...' : 'Start Interview'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
