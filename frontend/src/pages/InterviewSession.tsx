import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import { detectFillerWords, calculateWordCount, calculateConfidenceScore, formatDuration } from '../utils/metrics';
import toast from 'react-hot-toast';
import { Send, Video, VideoOff, MessageCircle, X } from 'lucide-react';

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'ai', text: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    wordCount: 0,
    fillerCount: 0,
    confidenceScore: 0,
    responseTime: 0,
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    loadInterview();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [id]);

  useEffect(() => {
    if (interview?.config?.videoEnabled && !stream) {
      startCamera();
    }
  }, [interview]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(mediaStream);
      setIsCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      toast.success('Camera enabled');
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const toggleCamera = () => {
    if (isCameraOn && stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      toast('Camera turned off');
    } else {
      startCamera();
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Call Gemini API for chat response
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context: 'interview' })
      });
      
      if (!response.ok) throw new Error('Chat failed');
      
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'I can help you with interview tips, technical concepts, or answer questions about your interview. What would you like to know?' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const loadInterview = async () => {
    try {
      const data = await interviewAPI.getInterview(id!);
      setInterview(data);
      if (data.qa && data.qa.length > 0) {
        const lastQA = data.qa[data.qa.length - 1];
        setCurrentQuestion(lastQA.questionText);
      } else {
        const question = data.firstQuestion || 'Loading first question...';
        setCurrentQuestion(question);
      }
    } catch (error: any) {
      console.error('Failed to load interview:', error);
      toast.error(error?.response?.data?.detail || 'Failed to load interview. Please try again.');
      navigate('/dashboard');
    }
  };

  const updateMetrics = (text: string) => {
    const wordCount = calculateWordCount(text);
    const fillerCount = detectFillerWords(text);
    const confidenceScore = calculateConfidenceScore(text, fillerCount, wordCount);
    const responseTime = startTime ? (Date.now() - startTime) / 1000 : 0;
    
    setMetrics({ wordCount, fillerCount, confidenceScore, responseTime });
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    if (!startTime) {
      setStartTime(Date.now());
    }
    
    const elapsedMs = startTime ? Date.now() - startTime : 0;

    setLoading(true);

    try {
      const response = await interviewAPI.submitAnswer(id!, answer.trim(), elapsedMs);
      
      // Get score from evaluation
      const score = response.evaluation?.score || 0;
      
      // Show appropriate feedback based on score
      if (score >= 85) {
        toast.success('Excellent answer! 🌟');
      } else if (score >= 70) {
        toast.success('Good job! 👍');
      } else {
        toast('Keep going! 💪');
      }
      
      if (response.nextQuestion) {
        setCurrentQuestion(response.nextQuestion);
        setAnswer('');
        setStartTime(null);
        setMetrics({ wordCount: 0, fillerCount: 0, confidenceScore: 0, responseTime: 0 });
      } else {
        toast.success('Interview completed!');
        await interviewAPI.finishInterview(id!);
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Submit answer error:', error);
      toast.error(error?.response?.data?.detail || error.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishInterview = async () => {
    if (confirm('Are you sure you want to end this interview?')) {
      try {
        await interviewAPI.finishInterview(id!);
        toast.success('Interview completed! View your results below.');
        navigate(`/interview/results/${id}`);
      } catch (error) {
        toast.error('Failed to end interview');
      }
    }
  };

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 flex items-center justify-center">
        <div className="animate-pulse text-primary-500 text-xl">Loading interview...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 py-8 px-6 relative">
      {/* Video Camera */}
      {interview?.config?.videoEnabled && (
        <div className="fixed top-4 right-4 z-50">
          <div className="relative bg-dark-800 rounded-lg shadow-2xl overflow-hidden border-2 border-primary-500">
            {isCameraOn && stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-48 h-36 object-cover bg-black"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : (
              <div className="w-48 h-36 flex items-center justify-center bg-dark-700">
                <div className="text-center px-4">
                  <VideoOff className="w-8 h-8 text-dark-400 mx-auto mb-2" />
                  <p className="text-xs text-dark-500 mb-2">Camera Off</p>
                  <button 
                    onClick={startCamera}
                    className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded transition-colors"
                  >
                    Turn On
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={toggleCamera}
              className="absolute bottom-2 right-2 p-2 bg-dark-900/80 rounded-full hover:bg-dark-900 transition-colors shadow-lg"
              title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isCameraOn ? (
                <Video className="w-4 h-4 text-green-400" />
              ) : (
                <VideoOff className="w-4 h-4 text-red-400" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI Chatbot Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white"
        title="AI Assistant"
      >
        {showChat ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* AI Chatbot Panel */}
      {showChat && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-dark-800 rounded-lg shadow-2xl border border-primary-500 flex flex-col">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-t-lg">
            <h3 className="text-white font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              AI Interview Assistant
            </h3>
            <p className="text-indigo-200 text-xs mt-1">Ask me anything about your interview!</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center text-dark-400 text-sm py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-dark-500" />
                <p>Ask me for interview tips, technical help, or clarification!</p>
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-dark-700 text-slate-200'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-dark-700 rounded-lg p-3 text-sm text-slate-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-dark-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 bg-dark-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={chatLoading}
              />
              <button
                onClick={handleChatSubmit}
                disabled={chatLoading || !chatInput.trim()}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-600 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-dark-800">Interview in Progress</h2>
                <button onClick={handleFinishInterview} className="btn-secondary text-sm">
                  End Interview
                </button>
              </div>
              
              <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-6 rounded">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-primary-700 font-medium mb-1">Question</p>
                    <p className="text-dark-800">{currentQuestion}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-dark-700 mb-2">Your Answer</label>
                <div>
                  <textarea
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      updateMetrics(e.target.value);
                      if (!startTime) setStartTime(Date.now());
                    }}
                    className="input min-h-32 mb-3"
                    placeholder="Type your answer here..."
                  />
                  <button onClick={handleSubmitAnswer} disabled={loading} className="btn-primary flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    {loading ? 'Submitting...' : 'Submit Answer'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-bold text-dark-800 mb-4">Live Metrics</h3>
              <div className="space-y-4">
                <MetricCard label="Response Time" value={formatDuration((startTime ? Date.now() - startTime : 0))} />
                <MetricCard label="Word Count" value={metrics.wordCount.toString()} />
                <MetricCard label="Filler Words" value={metrics.fillerCount.toString()} />
                <MetricCard label="Confidence" value={`${metrics.confidenceScore}%`} color={metrics.confidenceScore >= 70 ? 'text-green-600' : metrics.confidenceScore >= 40 ? 'text-yellow-600' : 'text-red-600'} />
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-dark-800 mb-4">Interview Info</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-dark-600">Type:</span> <span className="font-medium text-dark-800">{interview.config?.type}</span></p>
                <p><span className="text-dark-600">Role:</span> <span className="font-medium text-dark-800">{interview.config?.role}</span></p>
                <p><span className="text-dark-600">Difficulty:</span> <span className="font-medium text-dark-800">{interview.config?.difficulty}</span></p>
                <p><span className="text-dark-600">Duration:</span> <span className="font-medium text-dark-800">{interview.config?.durationMinutes} min</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color = 'text-dark-800' }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-dark-600">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}
