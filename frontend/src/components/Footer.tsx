import { Brain, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-slate-800 bg-dark-900/50 backdrop-blur-lg mt-20">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <Brain className="w-8 h-8 text-indigo-400" />
                <div className="absolute inset-0 w-8 h-8 bg-indigo-500/30 rounded-full blur-xl" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                InterviewAI
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Master your interviews with AI-powered practice and feedback.
            </p>
            <div className="flex gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-dark-800/50 hover:bg-indigo-500/20 border border-slate-700 hover:border-indigo-500/50 flex items-center justify-center transition-all">
                <Github className="w-5 h-5 text-slate-400 hover:text-indigo-400" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-dark-800/50 hover:bg-indigo-500/20 border border-slate-700 hover:border-indigo-500/50 flex items-center justify-center transition-all">
                <Twitter className="w-5 h-5 text-slate-400 hover:text-indigo-400" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-dark-800/50 hover:bg-indigo-500/20 border border-slate-700 hover:border-indigo-500/50 flex items-center justify-center transition-all">
                <Linkedin className="w-5 h-5 text-slate-400 hover:text-indigo-400" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-bold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/practice')} className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Practice
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/interview/setup')} className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Mock Interviews
                </button>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Interview Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Question Bank
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="mailto:support@interviewai.com" className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {currentYear} InterviewAI. All rights reserved.
            </p>
            <p className="text-slate-500 text-xs">
              Powered by Interview • Built with ❤️
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
