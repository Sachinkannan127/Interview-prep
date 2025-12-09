import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    company: '',
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
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto max-w-3xl relative z-10">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 sm:mb-8 transition-colors group text-sm sm:text-base">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <div className="card">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 sm:mb-3">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Configure Your Interview</span>
          </h1>
          <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">Customize your practice session to match your goals 🎯</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">💼 Interview Type</label>
              <select value={config.type} onChange={(e) => setConfig({ ...config, type: e.target.value as any })} className="input">
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="hr">HR Round</option>
                <option value="case-study">Case Study</option>
              </select>
            </div>

            {config.type === 'technical' && (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">💻 Technical Sub-type</label>
                <select value={config.subType} onChange={(e) => setConfig({ ...config, subType: e.target.value as any })} className="input">
                  <option value="dsa">DSA & Algorithms</option>
                  <option value="system-design">System Design</option>
                  <option value="java">Java</option>
                  <option value="react">React</option>
                  <option value="dotnet">.NET</option>
                  <option value="python">Python</option>
                  <option value="nodejs">Node.js</option>
                  <option value="angular">Angular</option>
                  <option value="spring-boot">Spring Boot</option>
                  <option value="microservices">Microservices</option>
                  <option value="cloud">Cloud (AWS/Azure/GCP)</option>
                  <option value="devops">DevOps</option>
                  <option value="database">Database & SQL</option>
                  <option value="fresher">Fresher / General</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">🏢 Target Company (Optional)</label>
              <select value={config.company} onChange={(e) => setConfig({ ...config, company: e.target.value })} className="input">
                <option value="">Any Company</option>
                <option value="TCS">TCS (Tata Consultancy Services)</option>
                <option value="Infosys">Infosys</option>
                <option value="Wipro">Wipro</option>
                <option value="HCL">HCL Technologies</option>
                <option value="Tech Mahindra">Tech Mahindra</option>
                <option value="Cognizant">Cognizant (CTS)</option>
                <option value="Accenture">Accenture</option>
                <option value="Capgemini">Capgemini</option>
                <option value="LTI">LTIMindtree</option>
                <option value="Mphasis">Mphasis</option>
                <option value="Google">Google</option>
                <option value="Microsoft">Microsoft</option>
                <option value="Amazon">Amazon</option>
                <option value="Meta">Meta (Facebook)</option>
                <option value="Apple">Apple</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">🏭 Industry</label>
              <select value={config.industry} onChange={(e) => setConfig({ ...config, industry: e.target.value })} className="input">
                <option value="Software Engineering">Software Engineering</option>
                <option value="Data Science">Data Science</option>
                <option value="Product Management">Product Management</option>
                <option value="Finance">Finance</option>
                <option value="Consulting">Consulting</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">📝 Role</label>
              <input type="text" value={config.role} onChange={(e) => setConfig({ ...config, role: e.target.value })} className="input" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">🎯 Difficulty Level</label>
              <select value={config.difficulty} onChange={(e) => setConfig({ ...config, difficulty: e.target.value as any })} className="input">
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">⏱️ Duration (minutes)</label>
              <select value={config.durationMinutes} onChange={(e) => setConfig({ ...config, durationMinutes: parseInt(e.target.value) as any })} className="input">
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
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
              <label htmlFor="voice" className="text-sm font-semibold text-white cursor-pointer">🎤 Enable Voice Mode (Speech-to-Text)</label>
            </div>

            {config.voiceEnabled && (
              <div className="rounded-xl p-5" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '2px solid rgba(59, 130, 246, 0.3)' }}>
                <p className="text-blue-300 font-semibold mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Microphone Setup Required
                </p>
                <button
                  onClick={testMicrophone}
                  disabled={micTested}
                  className={`w-full flex items-center justify-center gap-2 mb-4 px-6 py-3 rounded-xl font-semibold transition-all ${
                    micTested 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
                      : 'btn-secondary'
                  }`}
                >
                  {micTested ? <Check className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {micTested ? 'Microphone Ready ✓' : 'Test Microphone'}
                </button>
                <div className="text-xs text-blue-200 bg-blue-950/30 p-3 rounded-lg">
                  <p className="font-semibold mb-2">If permission denied:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Click the 🔒 or 🎤 icon at the LEFT of your address bar</li>
                    <li>Find "Microphone" and change to "Allow"</li>
                    <li>Click "Test Microphone" again</li>
                  </ol>
                </div>
              </div>
            )}

            <button onClick={handleStart} disabled={loading} className="btn-primary w-full mt-8 text-lg py-4">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Starting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Start Interview 🚀
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
