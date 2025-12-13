import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { interviewAPI, questionsAPI } from '../services/api';
import { Brain, Play, TrendingUp, RefreshCw, Target, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import jsPDF from 'jspdf';

export default function Dashboard() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [practiceSessions, setPracticeSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    selectedQuestions.forEach((question, index) => {
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
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
          <div className="card group hover:scale-105 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 hover:border-orange-500/50 transition-all cursor-pointer" onClick={() => {
            navigate('/interview/setup', { state: { defaultType: 'aptitude', defaultDifficulty: 'mid' } });
          }}>
            <div className="text-center p-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-4xl shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform">🧮</div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-3">Aptitude & Reasoning</h2>
              <p className="text-slate-300 text-sm mb-4">Quantitative, Logical & Verbal Reasoning</p>
              <div className="space-y-2 text-xs text-slate-400 mb-4">
                <div>📊 Data Interpretation</div>
                <div>🔢 Number Series</div>
                <div>🧠 Logical Puzzles</div>
              </div>
              <button className="btn-primary w-full text-base py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">Start Test →</button>
            </div>
          </div>

          {/* Behavioral Interview Card */}
          <div className="card group hover:scale-105 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer" onClick={() => {
            toast.success('AI Avatar Mock Interview coming soon! 🚀');
            navigate('/interview/setup');
          }}>
            <div className="text-center p-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform">🎭</div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">Behavioral Round</h2>
              <p className="text-slate-300 text-sm mb-4">Soft Skills & Communication Practice</p>
              <div className="space-y-2 text-xs text-slate-400 mb-4">
                <div>💬 AI Avatar Simulation</div>
                <div>🎯 STAR Method</div>
                <div>📹 Video Analysis</div>
              </div>
              <button className="btn-primary w-full text-base py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">Start Interview →</button>
            </div>
          </div>

          {/* Technical Interview Card */}
          <div className="card group hover:scale-105 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 hover:border-blue-500/50 transition-all cursor-pointer" onClick={() => {
            toast.success('AI Avatar Mock Interview coming soon! 🚀');
            navigate('/interview/setup');
          }}>
            <div className="text-center p-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-4xl shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform">💼</div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">Technical Round</h2>
              <p className="text-slate-300 text-sm mb-4">DSA, System Design & Coding</p>
              <div className="space-y-2 text-xs text-slate-400 mb-4">
                <div>⚡ Live Coding</div>
                <div>🏗️ System Design</div>
                <div>🤖 AI Evaluation</div>
              </div>
              <button className="btn-primary w-full text-base py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">Start Interview →</button>
            </div>
          </div>
        </div>

        {/* Aptitude Test Difficulty Levels - Detailed */}
        <div className="card mb-8 sm:mb-12 fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">🎯 Aptitude & Reasoning - Choose Your Level</h2>
              <p className="text-slate-300 text-sm sm:text-base">Select difficulty based on your preparation stage</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
            <div className="p-8 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 hover:border-green-500/50 transition-all cursor-pointer hover:scale-105" onClick={() => {
              navigate('/interview/setup', { state: { defaultType: 'aptitude', defaultDifficulty: 'entry' } });
            }}>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-4xl shadow-lg flex-shrink-0">📚</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Entry Level</h3>
                  <p className="text-slate-300 text-sm mb-3">Perfect for beginners</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div>✓ Number Series & Patterns</div>
                    <div>✓ Basic Percentage & Ratio</div>
                    <div>✓ Simple Speed & Time</div>
                    <div>✓ Pattern Recognition</div>
                  </div>
                </div>
                <button className="btn-secondary px-6 py-3 text-sm">Start →</button>
              </div>
            </div>
            
            <div className="p-8 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-all cursor-pointer hover:scale-105" onClick={() => {
              navigate('/interview/setup', { state: { defaultType: 'aptitude', defaultDifficulty: 'mid' } });
            }}>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-4xl shadow-lg flex-shrink-0">🎓</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Mid Level</h3>
                  <p className="text-slate-300 text-sm mb-3">TCS, Infosys, Wipro style</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div>✓ Data Interpretation</div>
                    <div>✓ Work-Time-Pipes Problems</div>
                    <div>✓ Probability & Combinations</div>
                    <div>✓ Company Previous Papers</div>
                  </div>
                </div>
                <button className="btn-secondary px-6 py-3 text-sm">Start →</button>
              </div>
            </div>
            
            <div className="p-8 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border-2 border-red-500/30 hover:border-red-500/50 transition-all cursor-pointer hover:scale-105" onClick={() => {
              navigate('/interview/setup', { state: { defaultType: 'aptitude', defaultDifficulty: 'senior' } });
            }}>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-4xl shadow-lg flex-shrink-0">🏆</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Senior Level</h3>
                  <p className="text-slate-300 text-sm mb-3">Google, Microsoft style</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div>✓ Optimization Problems</div>
                    <div>✓ Advanced Logical Puzzles</div>
                    <div>✓ Strategy & Game Theory</div>
                    <div>✓ Brain Teasers</div>
                  </div>
                </div>
                <button className="btn-secondary px-6 py-3 text-sm">Start →</button>
              </div>
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
          <div className="flex items-center justify-between mb-6">
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
                      downloadQuestionPaper(paper.company, paper.year, paper.type, paper.questions);
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
    </>
  );
}
