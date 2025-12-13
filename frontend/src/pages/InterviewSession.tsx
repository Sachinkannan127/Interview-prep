import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import { detectFillerWords, calculateWordCount, calculateConfidenceScore, formatDuration } from '../utils/metrics';
import toast from 'react-hot-toast';
import { Send, Video, VideoOff, MessageCircle, X, Home, Clock } from 'lucide-react';
import { InterviewConfig } from '../types';

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
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [interviewEndTime, setInterviewEndTime] = useState<number | null>(null);
  const [metrics, setMetrics] = useState({
    wordCount: 0,
    fillerCount: 0,
    confidenceScore: 0,
    responseTime: 0,
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadInterview();
    return () => {
      console.log('InterviewSession unmounting, cleaning up...');
      if (stream) {
        console.log('Stopping camera on unmount...');
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  // Timer countdown effect
  useEffect(() => {
    if (interview && interviewEndTime) {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Start countdown timer
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.floor((interviewEndTime - now) / 1000));
        setRemainingTime(timeLeft);

        // Auto-end interview when time runs out
        if (timeLeft === 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          toast.error('Time is up! Interview ended automatically.');
          handleFinishInterview();
        }

        // Warning at 5 minutes
        if (timeLeft === 300) {
          toast('⏰ 5 minutes remaining!', { icon: '⚠️', duration: 5000 });
        }

        // Warning at 1 minute
        if (timeLeft === 60) {
          toast('⏰ 1 minute remaining!', { icon: '🚨', duration: 5000 });
        }
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [interview, interviewEndTime]);

  useEffect(() => {
    if (interview?.config?.videoEnabled && !stream && !isCameraOn) {
      console.log('Auto-starting camera for video-enabled interview...');
      // Auto-start camera after a brief delay to ensure page is ready
      const timer = setTimeout(() => {
        startCamera();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [interview, stream, isCameraOn]);

  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      });
      console.log('Camera stream obtained:', mediaStream);
      setStream(mediaStream);
      setIsCameraOn(true);
      
      // Wait for next tick to ensure videoRef is available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
          });
          console.log('Video element updated');
        } else {
          console.error('Video ref not available');
        }
      }, 100);
      
      toast.success('Camera enabled');
    } catch (error: any) {
      console.error('Camera access error:', error);
      toast.error(`Failed to access camera: ${error.message || 'Please check permissions'}`);
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

  const generateFallbackQuestion = (config: InterviewConfig): string => {
    const { type, difficulty, company } = config;
    
    // Fallback questions organized by type and difficulty
    const fallbackQuestions = {
      technical: {
        entry: [
          "What is the difference between == and === in JavaScript?",
          "Explain the concept of Big O notation with examples.",
          "What is the time complexity of binary search?",
          "Explain the difference between an array and a linked list.",
          "What are the four pillars of Object-Oriented Programming?"
        ],
        mid: [
          "How does a HashMap work internally in Java?",
          "Explain the difference between SQL and NoSQL databases.",
          "What are closures in JavaScript and how do they work?",
          "Explain the CAP theorem in distributed systems.",
          "How do you handle asynchronous operations in Node.js?"
        ],
        senior: [
          "Design a URL shortening service like bit.ly.",
          "How would you implement a distributed cache?",
          "Explain microservices architecture and its challenges.",
          "Design a rate limiting system for an API.",
          "How would you handle database sharding?"
        ]
      },
      behavioral: {
        entry: [
          "Tell me about a time you learned something new quickly.",
          "Describe a challenging bug you fixed.",
          "How do you handle feedback on your work?",
          "Tell me about a successful project you completed.",
          "Why did you choose this career path?"
        ],
        mid: [
          "Tell me about a time you faced a difficult challenge at work.",
          "Describe a situation where you had to work with a difficult team member.",
          "Tell me about a time you failed and what you learned.",
          "Describe a situation where you had to meet a tight deadline.",
          "Tell me about a time you disagreed with a technical decision."
        ],
        senior: [
          "Describe your experience leading a technical team.",
          "Tell me about a time you made an architectural decision.",
          "How do you mentor junior developers?",
          "Describe a time you drove a major technical initiative.",
          "How do you handle disagreements about technical direction?"
        ]
      },
      hr: {
        entry: [
          "Why do you want to work for our company?",
          "Where do you see yourself in 5 years?",
          "What is your greatest strength?",
          "What is your greatest weakness?",
          "Why did you choose this career path?"
        ],
        mid: [
          "What are your salary expectations?",
          "Why are you leaving your current job?",
          "How do you handle work-life balance?",
          "Describe your ideal work environment.",
          "How do you stay updated with technology trends?"
        ],
        senior: [
          "What is your leadership philosophy?",
          "How do you build high-performing teams?",
          "Describe your approach to technical decision-making.",
          "How do you handle underperforming team members?",
          "What's your vision for the next 3-5 years in your career?"
        ]
      },
      'case-study': {
        entry: [
          "A website is running slowly. How would you investigate?",
          "How would you explain a complex technical concept to a non-technical person?",
          "What steps would you take to learn a new programming language?",
          "How would you debug a problem you can't reproduce?",
          "How would you prioritize multiple tasks with competing deadlines?"
        ],
        mid: [
          "A major client is experiencing downtime. Walk me through your incident response.",
          "Our API response time has doubled. How would you investigate?",
          "How would you improve the deployment process for a team releasing multiple times a day?",
          "Design a strategy to migrate a monolithic application to microservices.",
          "How would you handle a security vulnerability in production?"
        ],
        senior: [
          "Design a globally distributed social media feed like Twitter.",
          "How would you architect a system to handle 1 billion daily active users?",
          "Design a real-time collaborative editing system like Google Docs.",
          "How would you implement a recommendation system for an e-commerce platform?",
          "Design a monitoring and alerting system for a large-scale distributed system."
        ]
      }
    };

    // Get questions for the specific type and difficulty
    const typeQuestions = fallbackQuestions[type as keyof typeof fallbackQuestions] || fallbackQuestions.technical;
    const difficultyQuestions = typeQuestions[difficulty as keyof typeof typeQuestions] || typeQuestions.mid;
    
    // Return a random question from the appropriate category
    const randomIndex = Math.floor(Math.random() * difficultyQuestions.length);
    let question = difficultyQuestions[randomIndex];
    
    // Add company context if available
    if (company && company !== 'General') {
      const companyContexts: { [key: string]: string } = {
        'Google': ' (considering Google\'s focus on scalability and algorithms)',
        'Amazon': ' (considering Amazon\'s leadership principles and customer obsession)',
        'Microsoft': ' (considering Microsoft\'s enterprise and cloud focus)',
        'Meta': ' (considering Meta\'s scale and real-time systems)',
        'Apple': ' (considering Apple\'s design and user experience focus)',
        'Netflix': ' (considering Netflix\'s streaming and cloud architecture)',
        'Uber': ' (considering Uber\'s real-time and location-based systems)',
        'Airbnb': ' (considering Airbnb\'s marketplace and trust systems)',
        'LinkedIn': ' (considering LinkedIn\'s professional networking)',
        'Twitter': ' (considering Twitter\'s real-time content distribution)',
        'Salesforce': ' (considering Salesforce\'s CRM and enterprise software)',
        'Oracle': ' (considering Oracle\'s database and enterprise solutions)',
        'IBM': ' (considering IBM\'s enterprise and AI solutions)',
        'Spotify': ' (considering Spotify\'s music streaming and personalization)',
        'Adobe': ' (considering Adobe\'s creative software and cloud services)',
        'PayPal': ' (considering PayPal\'s payment processing and security)',
        'Stripe': ' (considering Stripe\'s payment APIs and developer experience)',
        'Shopify': ' (considering Shopify\'s e-commerce platforms)',
        'Zoom': ' (considering Zoom\'s video communication and quality)',
        'Slack': ' (considering Slack\'s real-time messaging and collaboration)'
      };
      
      if (companyContexts[company]) {
        question += companyContexts[company];
      }
    }
    
    return question;
  };

  const loadInterview = async () => {
    try {
      const data = await interviewAPI.getInterview(id!);
      console.log('Interview loaded:', data);
      setInterview(data);
      
      // Calculate interview end time based on duration
      console.log('Interview data:', {
        hasDuration: !!data.config?.durationMinutes,
        durationMinutes: data.config?.durationMinutes,
        hasStartedAt: !!data.startedAt,
        startedAt: data.startedAt
      });
      
      if (data.config?.durationMinutes && data.startedAt) {
        const startTime = new Date(data.startedAt).getTime();
        const durationMs = data.config.durationMinutes * 60 * 1000;
        const endTime = startTime + durationMs;
        setInterviewEndTime(endTime);
        
        const now = Date.now();
        const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
        setRemainingTime(timeLeft);
        
        console.log(`Interview duration: ${data.config.durationMinutes} minutes`);
        console.log(`Started at: ${new Date(data.startedAt).toLocaleTimeString()}`);
        console.log(`End time: ${new Date(endTime).toLocaleTimeString()}`);
        console.log(`Time remaining: ${Math.floor(timeLeft / 60)} minutes ${timeLeft % 60} seconds`);
      } else {
        console.warn('Timer not initialized - missing duration or startedAt', {
          duration: data.config?.durationMinutes,
          startedAt: data.startedAt
        });
      }
      
      if (data.qa && data.qa.length > 0) {
        const lastQA = data.qa[data.qa.length - 1];
        setCurrentQuestion(lastQA.questionText);
        console.log('Resuming interview at question:', data.qa.length + 1);
      } else {
        const question = data.firstQuestion || 'Loading first question...';
        setCurrentQuestion(question);
        console.log('Starting new interview with first question');
        // Start timer for first question
        setStartTime(Date.now());
      }
      
      // Show welcome message
      toast.success('Interview session started! Good luck! 🚀');
    } catch (error: any) {
      console.error('Failed to load interview:', error);
      
      // Try to generate fallback question if interview config is available
      if (interview?.config) {
        console.log('API failed, generating client-side fallback question...');
        const fallbackQuestion = generateFallbackQuestion(interview.config);
        setCurrentQuestion(fallbackQuestion);
        setStartTime(Date.now());
        toast('Using offline mode - some features may be limited');
        return;
      }
      
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
        setStartTime(Date.now()); // Start timer for next question
        setMetrics({ wordCount: 0, fillerCount: 0, confidenceScore: 0, responseTime: 0 });
        console.log('Moving to next question');
      } else {
        // Stop camera when interview completes
        if (stream) {
          console.log('Stopping camera on interview completion...');
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
          setIsCameraOn(false);
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        }
        
        toast.success('Interview completed! 🎉 Generating your results...');
        await interviewAPI.finishInterview(id!);
        setTimeout(() => {
          navigate(`/interview/results/${id}`);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Submit answer error:', error);
      
      // Generate fallback question if API fails
      if (interview?.config) {
        console.log('API failed, generating client-side fallback question...');
        const fallbackQuestion = generateFallbackQuestion(interview.config);
        setCurrentQuestion(fallbackQuestion);
        setAnswer('');
        setStartTime(Date.now());
        setMetrics({ wordCount: 0, fillerCount: 0, confidenceScore: 0, responseTime: 0 });
        console.log('Moving to fallback question');
        
        // Provide basic feedback for the answer
        const wordCount = answer.trim().split(/\s+/).length;
        if (wordCount > 50) {
          toast.success('Good detailed answer! Moving to next question...');
        } else if (wordCount > 20) {
          toast('Nice answer! Let\'s continue...');
        } else {
          toast('Thanks for your answer! Here\'s the next question...');
        }
        return;
      }
      
      toast.error(error?.response?.data?.detail || error.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishInterview = async () => {
    if (confirm('Are you sure you want to end this interview?')) {
      try {
        // Stop camera before finishing
        if (stream) {
          console.log('Stopping camera on interview finish...');
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
          setIsCameraOn(false);
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        }
        
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
      {/* Video Camera - Show when video is enabled */}
      {interview?.config?.videoEnabled && (
        <div className="fixed top-4 right-4 z-50" style={{ width: '192px' }}>
          <div className="relative bg-dark-800 rounded-lg shadow-2xl overflow-hidden border-2 border-primary-500" style={{ width: '192px', height: '144px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover bg-black ${!isCameraOn || !stream ? 'hidden' : ''}`}
              style={{ transform: 'scaleX(-1)' }}
              onLoadedMetadata={() => {
                console.log('Video metadata loaded');
                console.log('Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
              }}
              onPlay={() => console.log('Video playing')}
              onError={(e) => console.error('Video error:', e)}
            />
            {(!isCameraOn || !stream) && (
              <div className="absolute inset-0 flex items-center justify-center bg-dark-700">
                <div className="text-center px-4">
                  <VideoOff className="w-8 h-8 text-dark-400 mx-auto mb-2" />
                  <p className="text-xs text-dark-500 mb-2">
                    {stream && !isCameraOn ? 'Camera Paused' : stream ? 'Starting...' : 'Camera Off'}
                  </p>
                  {!stream && (
                    <button 
                      onClick={startCamera}
                      className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded transition-colors"
                    >
                      Turn On
                    </button>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={toggleCamera}
              className="absolute bottom-2 right-2 p-2 bg-dark-900/80 rounded-full hover:bg-dark-900 transition-colors shadow-lg z-10"
              title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isCameraOn ? (
                <Video className="w-4 h-4 text-green-400" />
              ) : (
                <VideoOff className="w-4 h-4 text-red-400" />
              )}
            </button>
          </div>
          {/* Debug info */}
          <div className="mt-2 text-xs text-white bg-dark-900/80 p-2 rounded text-center">
            <div>Status: <span className={isCameraOn ? 'text-green-400' : 'text-red-400'}>{isCameraOn ? 'ON' : 'OFF'}</span></div>
            <div>Stream: <span className={stream ? 'text-green-400' : 'text-red-400'}>{stream ? 'Active' : 'None'}</span></div>
            {videoRef.current?.videoWidth && (
              <div className="text-blue-400">{videoRef.current.videoWidth}x{videoRef.current.videoHeight}</div>
            )}
          </div>
        </div>
      )}

      {/* AI Chatbot Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center text-white"
        title="AI Assistant"
      >
        {showChat ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* AI Chatbot Panel */}
      {showChat && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-slate-900 rounded-xl shadow-2xl border-2 border-emerald-500/30 flex flex-col">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-t-xl">
            <h3 className="text-white font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              AI Interview Assistant
            </h3>
            <p className="text-emerald-100 text-xs mt-1">Ask me anything about your interview!</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center text-slate-400 text-sm py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                <p>Ask me for interview tips, technical help, or clarification!</p>
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                    : 'bg-slate-800 text-slate-200 border border-emerald-500/20'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-emerald-500/20 rounded-lg p-3 text-sm text-slate-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-emerald-500/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-emerald-500/20"
                disabled={chatLoading}
              />
              <button
                onClick={handleChatSubmit}
                disabled={chatLoading || !chatInput.trim()}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
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
                <div className="flex gap-2">
                  {/* Timer Display */}
                  {interviewEndTime && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${
                      remainingTime <= 60 ? 'bg-red-100 text-red-700 animate-pulse' : 
                      remainingTime <= 300 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      <Clock className="w-4 h-4" />
                      <span>
                        {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                  <button onClick={() => navigate('/dashboard')} className="btn-secondary text-sm flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    Home
                  </button>
                  <button onClick={handleFinishInterview} className="btn-secondary text-sm">
                    End Interview
                  </button>
                </div>
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
                <p><strong>Type:</strong> {interview?.config?.type}</p>
                <p><strong>Difficulty:</strong> {interview?.config?.difficulty}</p>
                <p><strong>Company:</strong> {interview?.config?.company || 'General'}</p>
                <p><strong>Questions:</strong> {interview?.qa?.length || 0} answered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color = 'text-dark-800' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-dark-600">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}
