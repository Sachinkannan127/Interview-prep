import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import { speechService } from '../services/speech';
import { detectFillerWords, calculateWordCount, calculateConfidenceScore, formatDuration } from '../utils/metrics';
import AIAvatar from '../components/AIAvatar';
import toast from 'react-hot-toast';
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    wordCount: 0,
    fillerCount: 0,
    confidenceScore: 0,
    responseTime: 0,
  });
  const timerRef = useRef<any>(null);

  useEffect(() => {
    loadInterview();
    return () => {
      speechService.stopListening();
      speechService.stopSpeaking();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const loadInterview = async () => {
    try {
      const data = await interviewAPI.getInterview(id!);
      setInterview(data);
      if (data.qa && data.qa.length > 0) {
        const lastQA = data.qa[data.qa.length - 1];
        setCurrentQuestion(lastQA.questionText);
      } else {
        setCurrentQuestion(data.firstQuestion || 'Loading first question...');
      }
      
      if (data.config?.voiceEnabled && data.firstQuestion) {
        speakQuestion(data.firstQuestion);
      }
    } catch (error) {
      toast.error('Failed to load interview');
      navigate('/dashboard');
    }
  };

  const speakQuestion = (text: string) => {
    setIsSpeaking(true);
    speechService.speak(text, () => {
      setIsSpeaking(false);
      if (interview?.config?.voiceEnabled) {
        startListening();
      }
    });
  };

  const startListening = () => {
    if (!speechService.isSupported()) {
      toast.error('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Check and request microphone permission explicitly
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        console.log('Microphone permission granted, starting recognition');
        if (!startTime) setStartTime(Date.now());
        
        setIsListening(true);
        speechService.startListening(
          (newTranscript, isFinal) => {
            setTranscript(newTranscript);
            if (isFinal) {
              setAnswer((prev) => prev + ' ' + newTranscript);
              setTranscript('');
            }
            updateMetrics(answer + ' ' + newTranscript);
          },
          (error) => {
            console.error('Speech error:', error);
            toast.error(typeof error === 'string' ? error : 'Speech recognition error. Please check microphone permissions.');
            setIsListening(false);
          }
        );

        timerRef.current = setInterval(() => {
          // Timer for tracking response time
        }, 1000);
      })
      .catch((error) => {
        console.error('Microphone permission error:', error);
        let errorMessage = 'Microphone access denied.';
        
        if (error.name === 'NotAllowedError') {
          errorMessage = '🎤 Microphone permission denied. To fix this:\n\n1. Click the 🔒 (or camera/mic) icon in your browser address bar\n2. Find "Microphone" in the permissions list\n3. Change it from "Block" to "Allow"\n4. Refresh this page and try again';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone detected. Please connect a microphone and try again.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Microphone is already in use by another application. Please close other apps using the microphone and try again.';
        }
        
        toast.error(errorMessage, { duration: 8000 });
      });
  };

  const stopListening = () => {
    speechService.stopListening();
    setIsListening(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const updateMetrics = (text: string) => {
    const wordCount = calculateWordCount(text);
    const fillerCount = detectFillerWords(text);
    const confidenceScore = calculateConfidenceScore(text, fillerCount, wordCount);
    const responseTime = startTime ? (Date.now() - startTime) / 1000 : 0;
    
    setMetrics({ wordCount, fillerCount, confidenceScore, responseTime });
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() && !transcript.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    const finalAnswer = answer + ' ' + transcript;
    const elapsedMs = startTime ? Date.now() - startTime : 0;

    setLoading(true);
    stopListening();

    try {
      const response = await interviewAPI.submitAnswer(id!, finalAnswer.trim(), elapsedMs);
      
      if (response.nextQuestion) {
        setCurrentQuestion(response.nextQuestion);
        setAnswer('');
        setTranscript('');
        setStartTime(null);
        setMetrics({ wordCount: 0, fillerCount: 0, confidenceScore: 0, responseTime: 0 });
        
        if (interview?.config?.voiceEnabled) {
          speakQuestion(response.nextQuestion);
        }
      } else {
        toast.success('Interview completed!');
        await interviewAPI.finishInterview(id!);
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit answer');
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
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 py-8 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* AI Avatar Section */}
            {interview.config?.voiceEnabled && interview.config?.avatarEnabled && (
              <div className="card">
                <AIAvatar 
                  isSpeaking={isSpeaking} 
                  message={isSpeaking ? "I'm asking you a question..." : "Listening to your answer..."}
                  enabled={true}
                />
              </div>
            )}

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-dark-800">Interview in Progress</h2>
                <button onClick={handleFinishInterview} className="btn-secondary text-sm">
                  End Interview
                </button>
              </div>
              
              <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-6 rounded">
                <div className="flex items-start gap-3">
                  {isSpeaking && <Volume2 className="w-6 h-6 text-primary-600 animate-pulse-slow" />}
                  {!isSpeaking && <VolumeX className="w-6 h-6 text-primary-600" />}
                  <div className="flex-1">
                    <p className="text-sm text-primary-700 font-medium mb-1">AI Interviewer</p>
                    <p className="text-dark-800">{currentQuestion}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-dark-700 mb-2">Your Answer</label>
                {interview.config?.voiceEnabled ? (
                  <div>
                    <div className="bg-dark-50 border border-dark-300 rounded-lg p-4 min-h-32 mb-3">
                      {!answer && !transcript && !isListening && (
                        <p className="text-dark-400 italic">Click "Start Recording" to speak your answer...</p>
                      )}
                      <p className="text-dark-800">{answer}</p>
                      {transcript && (
                        <p className="text-primary-600 italic">
                          {transcript}
                          <span className="inline-block w-2 h-4 bg-primary-600 ml-1 animate-pulse"></span>
                        </p>
                      )}
                      {isListening && !transcript && (
                        <p className="text-primary-600 italic flex items-center gap-2">
                          <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                          Listening...
                        </p>
                      )}
                    </div>
                    {!speechService.isSupported() && (
                      <div className="bg-orange-50 border border-orange-300 rounded-lg p-3 mb-3">
                        <p className="text-orange-800 text-sm">
                          ⚠️ Speech recognition requires Chrome, Edge, or Safari browser
                        </p>
                      </div>
                    )}
                    {speechService.isSupported() && (
                      <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 mb-3">
                        <p className="text-blue-800 text-sm font-medium mb-2">
                          🎤 First time using microphone?
                        </p>
                        <div className="bg-white rounded p-2 mb-2">
                          <p className="text-blue-900 text-xs font-semibold mb-1">Quick Fix for "Permission Denied":</p>
                          <ol className="text-blue-800 text-xs space-y-1 ml-4 list-decimal">
                            <li>Look for 🔒 or 🎤 icon at the LEFT side of your browser's address bar (where the URL is)</li>
                            <li>Click that icon</li>
                            <li>Find "Microphone" and change it to "Allow"</li>
                            <li>Refresh this page (press F5)</li>
                            <li>Click "Start Recording" again</li>
                          </ol>
                        </div>
                        <p className="text-blue-700 text-xs">
                          💡 The browser will ask permission the first time you click "Start Recording"
                        </p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={isListening ? stopListening : startListening}
                        className={`btn-primary flex items-center gap-2 ${isListening ? 'bg-red-600 hover:bg-red-700' : ''}`}
                        disabled={isSpeaking || !speechService.isSupported()}
                      >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        {isListening ? 'Stop Recording' : 'Start Recording'}
                      </button>
                      <button onClick={handleSubmitAnswer} disabled={loading || isListening} className="btn-secondary flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Submit Answer
                      </button>
                    </div>
                  </div>
                ) : (
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
                )}
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
