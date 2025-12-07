import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

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

  const handleStart = async () => {
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
              <input type="checkbox" id="voice" checked={config.voiceEnabled} onChange={(e) => setConfig({ ...config, voiceEnabled: e.target.checked })} className="w-5 h-5" />
              <label htmlFor="voice" className="text-sm font-medium text-dark-700">Enable Voice Mode (Speech-to-Text)</label>
            </div>

            <button onClick={handleStart} disabled={loading} className="btn-primary w-full mt-8">
              {loading ? 'Starting...' : 'Start Interview'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
