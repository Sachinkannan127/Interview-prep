import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { interviewAPI, questionsAPI } from '../services/api';
import { Brain, Play, TrendingUp, RefreshCw, Target, FileText, Download, Code, Zap, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import jsPDF from 'jspdf';

export default function Dashboard() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [practiceSessions, setPracticeSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [userInput, setUserInput] = useState('');
  const [aiThinking, setAiThinking] = useState(false);

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

  const downloadQuestionPaper = (company: string, year: number, type: string, questions: number, difficulty: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(`${company} Interview Questions`, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Year ${year} | ${type} | ${difficulty} Level`, pageWidth / 2, 30, { align: 'center' });

    yPosition = 55;
    doc.setTextColor(0, 0, 0);

    // Question bank based on company and type
    const questionBanks: Record<string, string[]> = {
      'Google-Technical': [
        'Q1. Explain how you would design a URL shortening service like bit.ly.',
        'Q2. Implement a function to find the longest palindromic substring in a given string.',
        'Q3. How would you design a distributed cache system?',
        'Q4. Explain the difference between processes and threads.',
        'Q5. Design a rate limiter for an API service.',
        'Q6. Implement a binary search tree and its traversal methods.',
        'Q7. How would you handle millions of concurrent users in a web application?',
        'Q8. Explain MapReduce and its use cases.',
        'Q9. Design a notification system that can send emails, SMS, and push notifications.',
        'Q10. Implement an LRU (Least Recently Used) cache.'
      ],
      'Amazon-Behavioral + Technical': [
        'Q1. Tell me about a time when you faced a tight deadline.',
        'Q2. How do you prioritize tasks when working on multiple projects?',
        'Q3. Implement a function to reverse a linked list.',
        'Q4. Describe a situation where you had to deal with ambiguity.',
        'Q5. Explain the CAP theorem in distributed systems.',
        'Q6. Tell me about a time you failed and what you learned.',
        'Q7. How would you design Amazon\'s product recommendation system?',
        'Q8. Describe your approach to debugging a production issue.',
        'Q9. Implement a function to find the k-th largest element in an array.',
        'Q10. How do you ensure code quality in your projects?'
      ],
      'Microsoft-System Design': [
        'Q1. Design a file storage system like Dropbox or Google Drive.',
        'Q2. How would you architect a real-time chat application?',
        'Q3. Design a social media feed like Twitter or Facebook.',
        'Q4. Explain how you would build a video streaming service.',
        'Q5. Design a payment gateway system.',
        'Q6. How would you implement a distributed job scheduler?',
        'Q7. Design an online multiplayer gaming system.',
        'Q8. Explain the architecture of a content delivery network (CDN).',
        'Q9. Design a parking lot management system.',
        'Q10. How would you build a search autocomplete feature?'
      ],
      'Meta-Coding': [
        'Q1. Implement a function to detect a cycle in a linked list.',
        'Q2. Find the median of two sorted arrays.',
        'Q3. Implement a trie data structure for autocomplete.',
        'Q4. Design and implement a thread-safe singleton pattern.',
        'Q5. Solve the "N-Queens" problem using backtracking.',
        'Q6. Implement a binary heap and heapsort algorithm.',
        'Q7. Find the shortest path in a weighted graph (Dijkstra\'s algorithm).',
        'Q8. Implement a function to serialize and deserialize a binary tree.',
        'Q9. Design a data structure for LFU (Least Frequently Used) cache.',
        'Q10. Solve the "Word Ladder" problem using BFS.'
      ],
      'TCS-Aptitude': [
        'Q1. If a train travels 60 km in 45 minutes, what is its speed in km/h?',
        'Q2. Find the next number in the series: 2, 6, 12, 20, 30, ?',
        'Q3. A can complete a work in 12 days, B in 18 days. How long together?',
        'Q4. If 20% of A = 30% of B, what is the ratio of A to B?',
        'Q5. The average of 5 numbers is 27. If one number is excluded, average is 25. Find the excluded number.',
        'Q6. A profit of 20% is made by selling an article for Rs. 240. What is the cost price?',
        'Q7. In a class of 60 students, 30 play cricket, 25 play football. 10 play both. How many play neither?',
        'Q8. If DELHI is coded as 73541 and CALCUTTA as 82589662, how is CALICUT coded?',
        'Q9. A clock shows 3:15. What is the angle between hour and minute hands?',
        'Q10. Find the compound interest on Rs. 10000 at 10% per annum for 2 years.'
      ],
      'Infosys-Aptitude + Technical': [
        'Q1. Explain the difference between abstract class and interface in Java.',
        'Q2. If the ratio of boys to girls is 3:2 and there are 45 boys, how many girls?',
        'Q3. What is polymorphism? Provide examples.',
        'Q4. A vendor buys oranges at Rs. 2 for 3 oranges and sells at Rs. 1 per orange. Find profit%.',
        'Q5. Explain the SOLID principles in object-oriented programming.',
        'Q6. Find the missing number: 8, 27, 64, 125, ?, 343',
        'Q7. What is the difference between SQL and NoSQL databases?',
        'Q8. If a = 5, b = 3, what is the value of (a++ + ++b) * 2?',
        'Q9. Explain the concept of normalization in databases.',
        'Q10. A bag contains 5 red, 4 blue, and 3 green balls. What is the probability of drawing a blue ball?'
      ],
      'Wipro-Communication + Technical': [
        'Q1. Introduce yourself and describe your career goals.',
        'Q2. Explain the HTTP request-response cycle.',
        'Q3. How do you handle conflicts in a team environment?',
        'Q4. What is the difference between GET and POST methods?',
        'Q5. Describe a challenging project you worked on.',
        'Q6. Explain RESTful API design principles.',
        'Q7. How do you stay updated with the latest technology trends?',
        'Q8. What are the advantages of using version control systems like Git?',
        'Q9. Why do you want to work for our company?',
        'Q10. Explain the concept of Agile methodology.'
      ],
      'Accenture-Aptitude': [
        'Q1. If 25% of a number is 75, what is 40% of that number?',
        'Q2. Complete the series: 1, 4, 9, 16, 25, ?',
        'Q3. A person covers a distance at 40 km/h and returns at 60 km/h. Find average speed.',
        'Q4. If the cost price is Rs. 800 and selling price is Rs. 1000, find the profit percentage.',
        'Q5. Find the odd one out: 3, 5, 11, 14, 17, 21',
        'Q6. If A:B = 2:3 and B:C = 4:5, find A:B:C',
        'Q7. How many two-digit numbers are divisible by 7?',
        'Q8. A sum of money doubles itself in 5 years at simple interest. In how many years will it triple?',
        'Q9. Find the value of x: (x + 5) / 3 = 7',
        'Q10. The ages of A and B are in ratio 5:3. After 4 years, ratio becomes 11:7. Find their present ages.'
      ]
    };

    const key = `${company}-${type}`;
    const selectedQuestions = questionBanks[key] || [
      'Q1. Sample question 1 for this company and type.',
      'Q2. Sample question 2 for this company and type.',
      'Q3. Sample question 3 for this company and type.',
      'Q4. Sample question 4 for this company and type.',
      'Q5. Sample question 5 for this company and type.',
    ];

    // Add questions
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Sample Questions:', 15, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    selectedQuestions.forEach((question) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      const lines = doc.splitTextToSize(question, pageWidth - 30);
      lines.forEach((line: string) => {
        doc.text(line, 15, yPosition);
        yPosition += 6;
      });
      yPosition += 4;
    });

    // Footer
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition = pageHeight - 30;
    doc.setFillColor(240, 240, 240);
    doc.rect(0, yPosition - 10, pageWidth, 30, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total Questions: ${questions} | Difficulty: ${difficulty}`, pageWidth / 2, yPosition, { align: 'center' });
    doc.text('For more questions, visit: www.interviewai.com', pageWidth / 2, yPosition + 7, { align: 'center' });
    doc.text(`© ${new Date().getFullYear()} InterviewAI - All Rights Reserved`, pageWidth / 2, yPosition + 14, { align: 'center' });

    // Save PDF
    doc.save(`${company}_${year}_${type.replace(/\s+/g, '_')}_Questions.pdf`);
    toast.success(`Downloaded ${company} ${year} question paper PDF!`);
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setResumeFile(file);
      toast.success('Resume uploaded successfully!');
    }
  };

  const analyzeResume = async () => {
    if (!resumeFile) {
      toast.error('Please upload a resume first');
      return;
    }

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const response = await fetch('http://localhost:8001/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Resume analysis error:', errorData);
        throw new Error(errorData.detail || 'Failed to analyze resume');
      }

      const data = await response.json();
      setResumeAnalysis(data);
      toast.success('Resume analyzed successfully!');
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      toast.error(error.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const closeResumeModal = () => {
    setShowResumeModal(false);
    setResumeFile(null);
    setResumeAnalysis(null);
  };

  const sendAIMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { role: 'user', content: userInput };
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setAiThinking(true);

    try {
      const response = await fetch('http://localhost:8001/api/chat/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });

      if (!response.ok) throw new Error('AI response failed');

      const data = await response.json();
      const aiMessage = { role: 'assistant', content: data.response };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try asking your question again.' 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiThinking(false);
    }
  };

  const closeAIAssistant = () => {
    setShowAIAssistant(false);
    setChatMessages([]);
    setUserInput('');
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Header />

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Welcome back!</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg">Ready to level up your interview skills? 🚀</p>
        </div>

        {/* Main Action Cards - Three Equal Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 sm:mb-12 fade-in">
          {/* Aptitude Test Card */}
          <div className="card group hover:scale-105 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 hover:border-blue-500/50 transition-all cursor-pointer" onClick={() => {
            navigate('/interview/setup', { state: { defaultType: 'aptitude', defaultDifficulty: 'mid' } });
          }}>
            <div className="text-center p-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-4xl shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform">🧮</div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">Aptitude & Reasoning</h2>
              <p className="text-slate-300 text-sm mb-4">Quantitative, Logical & Verbal Reasoning</p>
              <div className="space-y-2 text-xs text-slate-400 mb-4">
                <div>📊 Data Interpretation</div>
                <div>🔢 Number Series</div>
                <div>🧠 Logical Puzzles</div>
              </div>
              <button className="btn-primary w-full text-base py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">Start Test →</button>
            </div>
          </div>

          {/* Behavioral Interview Card */}
          <div className="card group hover:scale-105 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-2 border-teal-500/30 hover:border-teal-500/50 transition-all cursor-pointer" onClick={() => {
            toast.success('AI Avatar Mock Interview coming soon! 🚀');
            navigate('/interview/setup');
          }}>
            <div className="text-center p-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center text-4xl shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform">🎭</div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent mb-3">Behavioral Round</h2>
              <p className="text-slate-300 text-sm mb-4">Soft Skills & Communication Practice</p>
              <div className="space-y-2 text-xs text-slate-400 mb-4">
                <div>💬 AI Avatar Simulation</div>
                <div>🎯 STAR Method</div>
                <div>📹 Video Analysis</div>
              </div>
              <button className="btn-primary w-full text-base py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">Start Interview →</button>
            </div>
          </div>

          {/* Technical Interview Card */}
          <div className="card group hover:scale-105 bg-gradient-to-br from-slate-500/10 to-gray-500/10 border-2 border-slate-500/30 hover:border-slate-500/50 transition-all cursor-pointer" onClick={() => {
            toast.success('AI Avatar Mock Interview coming soon! 🚀');
            navigate('/interview/setup');
          }}>
            <div className="text-center p-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-600 to-gray-600 flex items-center justify-center text-4xl shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform">💼</div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-slate-400 to-gray-400 bg-clip-text text-transparent mb-3">Technical Round</h2>
              <p className="text-slate-300 text-sm mb-4">DSA, System Design & Coding</p>
              <div className="space-y-2 text-xs text-slate-400 mb-4">
                <div>⚡ Live Coding</div>
                <div>🏗️ System Design</div>
                <div>🤖 AI Evaluation</div>
              </div>
              <button className="btn-primary w-full text-base py-3 bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700">Start Interview →</button>
            </div>
          </div>
        </div>

        {/* Code Compiler Highlight Card */}
        <div className="card group hover:scale-105 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 border-2 border-teal-500/40 hover:border-teal-500/60 transition-all cursor-pointer mb-8 fade-in" onClick={() => navigate('/practice/code')}>
          <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Code className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">Online Code Compiler</h2>
                <p className="text-slate-300 text-base mb-2">Execute code in <span className="text-teal-400 font-bold">17 programming languages</span> instantly</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded">🐍 Python</span>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">🟨 JavaScript</span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">☕ Java</span>
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">⚡ C++</span>
                  <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded">+13 more</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button className="btn-primary px-8 py-4 text-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 flex items-center gap-3 whitespace-nowrap">
                <Zap className="w-5 h-5" />
                Start Coding
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/compiler');
                }}
                className="btn-secondary text-sm px-4 py-2"
              >
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* AI Tools Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 sm:mb-12 fade-in">
          {/* AI Assistant Card */}
          <div className="card group hover:scale-105 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/40 hover:border-purple-500/60 transition-all cursor-pointer" onClick={() => {
            setShowAIAssistant(true);
          }}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🤖</span>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI Interview Assistant</h2>
                  <p className="text-slate-400 text-sm">Get instant help & guidance</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-4">Your personal AI companion for interview preparation. Ask questions, get tips, and receive instant feedback on your answers.</p>
              <div className="space-y-2 text-xs text-slate-400 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">💡</span>
                  <span>Smart answer suggestions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">🎯</span>
                  <span>Real-time feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">📚</span>
                  <span>Interview tips & strategies</span>
                </div>
              </div>
              <button className="btn-primary w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Launch Assistant →
              </button>
            </div>
          </div>

          {/* AI Resume Analyzer Card */}
          <div className="card group hover:scale-105 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/40 hover:border-amber-500/60 transition-all cursor-pointer" onClick={() => {
            setShowResumeModal(true);
          }}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <span className="text-3xl">📄</span>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">AI Resume Analyzer</h2>
                  <p className="text-slate-400 text-sm">Optimize your resume</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-4">Upload your resume and get AI-powered insights, ATS score, and personalized recommendations to improve your chances.</p>
              <div className="space-y-2 text-xs text-slate-400 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">📊</span>
                  <span>ATS compatibility score</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">🎯</span>
                  <span>Keyword optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">✨</span>
                  <span>Professional suggestions</span>
                </div>
              </div>
              <button className="btn-primary w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                Analyze Resume →
              </button>
            </div>
          </div>
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

        {/* Interview History */}
        <div className="card mb-8 sm:mb-12 fade-in">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Interview History</h2>
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

        {/* Previous Year Question Papers Collection */}
        <div className="card mb-8 sm:mb-12 fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
                📚 Previous Year Question Papers
              </h2>
              <p className="text-slate-300 text-sm sm:text-base">Download and practice with actual interview questions from top companies</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { company: 'Google', year: 2024, type: 'Technical', questions: 50, difficulty: 'Senior' },
              { company: 'Amazon', year: 2024, type: 'Behavioral + Technical', questions: 45, difficulty: 'Mid-Senior' },
              { company: 'Microsoft', year: 2024, type: 'System Design', questions: 30, difficulty: 'Senior' },
              { company: 'Meta', year: 2023, type: 'Coding', questions: 60, difficulty: 'Mid-Senior' },
              { company: 'TCS', year: 2024, type: 'Aptitude', questions: 100, difficulty: 'Entry-Mid' },
              { company: 'Infosys', year: 2024, type: 'Aptitude + Technical', questions: 80, difficulty: 'Entry' },
              { company: 'Wipro', year: 2023, type: 'Communication + Technical', questions: 70, difficulty: 'Entry-Mid' },
              { company: 'Accenture', year: 2024, type: 'Aptitude', questions: 90, difficulty: 'Entry' },
            ].map((paper, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-6 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl flex-shrink-0">
                    📄
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg mb-1">{paper.company} - {paper.year}</h3>
                    <p className="text-sm text-slate-400 mb-1">
                      {paper.type} • {paper.questions} Questions • {paper.difficulty}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-medium">
                        {paper.type}
                      </span>
                      <span className="px-2 py-1 rounded bg-pink-500/20 text-pink-300 text-xs font-medium">
                        {paper.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success(`Viewing ${paper.company} ${paper.year} question paper`);
                    }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium text-sm flex items-center gap-2 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadQuestionPaper(paper.company, paper.year, paper.type, paper.questions, paper.difficulty);
                    }}
                    className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 border border-purple-500/30 hover:border-purple-500/50 text-white font-medium text-sm flex items-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Practice Sessions Section */}
        <div className="card mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Recent Practice Sessions</h2>
            <button onClick={() => navigate('/practice')} className="btn-primary bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              Start Practice
            </button>
          </div>
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : practiceSessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <Target className="w-10 h-10 text-white" />
              </div>
              <p className="text-slate-300 mb-4">No practice sessions yet</p>
              <button onClick={() => navigate('/practice')} className="btn-primary">
                Start Your First Practice Session
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {practiceSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-5 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-500/40">
                  <div>
                    <p className="font-bold text-white text-lg mb-1">{session.category} - {session.difficulty}</p>
                    <p className="text-sm text-slate-400">
                      {session.questionsAnswered || 0} questions • {session.averageScore ? Math.round(session.averageScore) : 0}% avg score
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400 mb-1">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                    <p className="font-extrabold text-2xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      {session.averageScore ? Math.round(session.averageScore) : 0}/100
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>

    {/* Resume Analyzer Modal */}
    {showResumeModal && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeResumeModal}>
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-amber-500/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 p-6 flex items-center justify-between border-b border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white">AI Resume Analyzer</h2>
                <p className="text-amber-100 text-sm">Upload and analyze your resume</p>
              </div>
            </div>
            <button onClick={closeResumeModal} className="p-2 hover:bg-white/20 rounded-lg transition-all">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {!resumeAnalysis ? (
              <>
                {/* File Upload Section */}
                <div className="border-2 border-dashed border-amber-500/30 rounded-xl p-8 hover:border-amber-500/50 transition-all bg-amber-500/5">
                  <div className="text-center">
                    <Upload className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Upload Your Resume</h3>
                    <p className="text-slate-400 mb-4">Supported formats: PDF, DOC, DOCX, TXT (Max 5MB)</p>
                    
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="inline-block btn-primary bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 cursor-pointer"
                    >
                      Choose File
                    </label>
                    
                    {resumeFile && (
                      <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center justify-center gap-2 text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">{resumeFile.name}</span>
                          <span className="text-sm text-slate-400">({(resumeFile.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analysis Button */}
                {resumeFile && (
                  <button
                    onClick={analyzeResume}
                    disabled={analyzing}
                    className="w-full btn-primary bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {analyzing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        Analyze Resume
                      </>
                    )}
                  </button>
                )}
              </>
            ) : (
              <>
                {/* Analysis Results */}
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/40 rounded-xl p-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-4">Overall ATS Score</h3>
                    <div className="relative w-40 h-40 mx-auto">
                      <svg className="transform -rotate-90 w-40 h-40">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="rgba(245, 158, 11, 0.2)"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="url(#gradient)"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(resumeAnalysis.score / 100) * 440} 440`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#ea580c" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div>
                          <p className="text-5xl font-extrabold text-amber-400">{resumeAnalysis.score}</p>
                          <p className="text-sm text-slate-400">out of 100</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strengths */}
                  {resumeAnalysis.strengths && resumeAnalysis.strengths.length > 0 && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        <h3 className="text-xl font-bold text-white">Strengths</h3>
                      </div>
                      <ul className="space-y-2">
                        {resumeAnalysis.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-slate-300">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {resumeAnalysis.improvements && resumeAnalysis.improvements.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="w-6 h-6 text-amber-400" />
                        <h3 className="text-xl font-bold text-white">Areas for Improvement</h3>
                      </div>
                      <ul className="space-y-2">
                        {resumeAnalysis.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-slate-300">
                            <span className="text-amber-400 mt-1">→</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {resumeAnalysis.recommendations && resumeAnalysis.recommendations.length > 0 && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Brain className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xl font-bold text-white">AI Recommendations</h3>
                      </div>
                      <ul className="space-y-2">
                        {resumeAnalysis.recommendations.map((recommendation: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-slate-300">
                            <span className="text-purple-400 mt-1">💡</span>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setResumeFile(null);
                        setResumeAnalysis(null);
                      }}
                      className="flex-1 btn-secondary py-3"
                    >
                      Analyze Another Resume
                    </button>
                    <button
                      onClick={closeResumeModal}
                      className="flex-1 btn-primary bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 py-3"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )}

    {/* AI Assistant Modal */}
    {showAIAssistant && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeAIAssistant}>
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/30 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between border-b border-purple-500/30 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center animate-pulse">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white">AI Interview Assistant</h2>
                <p className="text-purple-100 text-sm">Ask me anything about interviews!</p>
              </div>
            </div>
            <button onClick={closeAIAssistant} className="p-2 hover:bg-white/20 rounded-lg transition-all">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-6 animate-bounce">
                  <span className="text-5xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">How can I help you today?</h3>
                <p className="text-slate-400 mb-6 max-w-lg">I can help you with interview questions, provide tips, suggest best practices, and give feedback on your answers.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  <button 
                    onClick={() => setUserInput('What are common behavioral interview questions?')}
                    className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition-all text-left"
                  >
                    <p className="text-purple-400 font-medium mb-1">💬 Behavioral Questions</p>
                    <p className="text-slate-400 text-sm">Common behavioral interview questions</p>
                  </button>
                  <button 
                    onClick={() => setUserInput('How do I answer "Tell me about yourself"?')}
                    className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl hover:bg-pink-500/20 transition-all text-left"
                  >
                    <p className="text-pink-400 font-medium mb-1">🎯 Answer Tips</p>
                    <p className="text-slate-400 text-sm">How to structure your answers</p>
                  </button>
                  <button 
                    onClick={() => setUserInput('What should I prepare for a technical interview?')}
                    className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl hover:bg-amber-500/20 transition-all text-left"
                  >
                    <p className="text-amber-400 font-medium mb-1">💻 Technical Prep</p>
                    <p className="text-slate-400 text-sm">Technical interview preparation</p>
                  </button>
                  <button 
                    onClick={() => setUserInput('What are STAR method examples?')}
                    className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl hover:bg-teal-500/20 transition-all text-left"
                  >
                    <p className="text-teal-400 font-medium mb-1">⭐ STAR Method</p>
                    <p className="text-slate-400 text-sm">STAR method examples and tips</p>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🤖</span>
                      </div>
                    )}
                    <div className={`max-w-[70%] p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' 
                        : 'bg-slate-700/50 border border-slate-600 text-slate-100'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">👤</span>
                      </div>
                    )}
                  </div>
                ))}
                {aiThinking && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🤖</span>
                    </div>
                    <div className="bg-slate-700/50 border border-slate-600 p-4 rounded-2xl">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-700 p-4 bg-slate-800/50">
            <div className="flex gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendAIMessage()}
                placeholder="Ask me anything about interviews..."
                className="flex-1 input bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                disabled={aiThinking}
              />
              <button
                onClick={sendAIMessage}
                disabled={!userInput.trim() || aiThinking}
                className="btn-primary bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiThinking ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Send</span>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">Press Enter to send • Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
