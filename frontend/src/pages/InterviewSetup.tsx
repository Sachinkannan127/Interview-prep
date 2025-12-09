import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Check } from 'lucide-react';

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
    avatarEnabled: false,
    videoEnabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);

  const testCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission(true);
      toast.success('✅ Camera access granted! You can now start the interview.');
    } catch (error: any) {
      console.error('Camera test failed:', error);
      let errorMsg = 'Camera access failed. ';
      
      if (error.name === 'NotAllowedError') {
        errorMsg += 'Please click the 🔒 icon in your address bar, allow camera access, and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMsg += 'No camera detected. Please connect a camera.';
      } else if (error.name === 'NotReadableError') {
        errorMsg += 'Camera is being used by another application.';
      } else {
        errorMsg += error.message;
      }
      
      toast.error(errorMsg, { duration: 8000 });
    }
  };

  const handleStart = async () => {
    if ((config.videoEnabled || config.avatarEnabled) && !cameraPermission) {
      toast.error('Please test your camera first by clicking the "Test Camera" button.');
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

  const handlePreviewQuestions = () => {
    if ((config.videoEnabled || config.avatarEnabled) && !cameraPermission) {
      toast.error('Please test your camera first by clicking the "Test Camera" button.');
      return;
    }
    navigate('/interview/preview', { state: { config } });
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

            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
              <input 
                type="checkbox" 
                id="avatar" 
                checked={config.avatarEnabled} 
                onChange={(e) => {
                  setConfig({ ...config, avatarEnabled: e.target.checked });
                  if (!e.target.checked) {
                    setCameraPermission(false);
                  }
                }} 
                className="w-5 h-5" 
              />
              <label htmlFor="avatar" className="text-sm font-semibold text-white cursor-pointer">🤖 Enable AI Interviewer Avatar (Face-to-Face)</label>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
              <input 
                type="checkbox" 
                id="video" 
                checked={config.videoEnabled} 
                onChange={(e) => {
                  setConfig({ ...config, videoEnabled: e.target.checked });
                  if (!e.target.checked && !config.avatarEnabled) {
                    setCameraPermission(false);
                  }
                }} 
                className="w-5 h-5" 
              />
              <label htmlFor="video" className="text-sm font-semibold text-white cursor-pointer">📹 Enable Video Response (Record Your Answers)</label>
            </div>

            {(config.avatarEnabled || config.videoEnabled) && (
              <div className="rounded-xl p-5" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '2px solid rgba(59, 130, 246, 0.3)' }}>
                <p className="text-blue-300 font-semibold mb-4 flex items-center gap-2">
                  📹 Camera Setup Required
                </p>
                <button
                  onClick={testCamera}
                  disabled={cameraPermission}
                  className={`w-full flex items-center justify-center gap-2 mb-4 px-6 py-3 rounded-xl font-semibold transition-all ${
                    cameraPermission 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
                      : 'btn-secondary'
                  }`}
                >
                  {cameraPermission ? <Check className="w-5 h-5" /> : '📹'}
                  {cameraPermission ? 'Camera Ready ✓' : 'Test Camera'}
                </button>
                <div className="text-xs text-blue-200 bg-blue-950/30 p-3 rounded-lg">
                  <p className="font-semibold mb-2">If permission denied:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Click the 🔒 or 📹 icon at the LEFT of your address bar</li>
                    <li>Find "Camera" and change to "Allow"</li>
                    <li>Click "Test Camera" again</li>
                  </ol>
                </div>
              </div>
            )}

            <button onClick={handleStart} disabled={loading} className="btn-primary w-full text-lg py-4">
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

            <button 
              onClick={handlePreviewQuestions} 
              disabled={loading} 
              className="btn-secondary w-full text-lg py-4 mt-4"
            >
              <span className="flex items-center justify-center gap-2">
                Preview & Customize Questions 👁️
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
