import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Menu, Settings, Sun, Moon, Mail, Phone, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  showAuthButton?: boolean;
}

export default function Header({ showAuthButton = false }: HeaderProps) {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [showContact, setShowContact] = useState(false);

  return (
    <>
      <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="relative">
            <Brain className="w-8 sm:w-10 h-8 sm:h-10 text-blue-500 animate-pulse" />
            <div className="absolute inset-0 w-8 sm:w-10 h-8 sm:h-10 bg-blue-600/30 rounded-full blur-xl" />
          </div>
          <span className="bg-gradient-to-r from-blue-400 via-amber-500 to-blue-400 bg-clip-text text-transparent font-extrabold hidden sm:inline">
            InterviewAI
          </span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 border border-slate-700 hover:border-blue-700/50 transition-all"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-blue-600" />
            )}
          </button>

          {/* Contact Us */}
          <button
            onClick={() => setShowContact(true)}
            className="p-2 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 border border-slate-700 hover:border-blue-700/50 transition-all"
            title="Contact Us"
          >
            <Mail className="w-5 h-5 text-blue-500" />
          </button>

          {/* Settings */}
          <button
            className="p-2 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 border border-slate-700 hover:border-blue-700/50 transition-all"
            title="Settings"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-5 h-5 text-blue-500" />
          </button>

          {/* Menu */}
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 border border-slate-700 hover:border-indigo-500/50 transition-all"
            title="Menu"
          >
            <Menu className="w-5 h-5 text-indigo-400" />
          </button>

          {showAuthButton && (
            <button onClick={() => navigate('/auth')} className="btn-primary hidden sm:block">
              Get Started →
            </button>
          )}
        </div>
      </nav>

      {/* Menu Sidebar */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMenu(false)} />
          <div className="relative ml-auto w-80 bg-dark-900 border-l border-indigo-500/30 shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Menu
                </h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 rounded-lg hover:bg-dark-800/50 transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                <button
                  onClick={() => { navigate('/dashboard'); setShowMenu(false); }}
                  className="w-full text-left px-4 py-3 rounded-lg bg-dark-800/50 hover:bg-indigo-500/20 border border-slate-700 hover:border-indigo-500/50 text-white transition-all"
                >
                  🏠 Dashboard
                </button>
                <button
                  onClick={() => { navigate('/practice'); setShowMenu(false); }}
                  className="w-full text-left px-4 py-3 rounded-lg bg-dark-800/50 hover:bg-indigo-500/20 border border-slate-700 hover:border-indigo-500/50 text-white transition-all"
                >
                  🎯 Practice
                </button>
                <button
                  onClick={() => { navigate('/interview/setup'); setShowMenu(false); }}
                  className="w-full text-left px-4 py-3 rounded-lg bg-dark-800/50 hover:bg-indigo-500/20 border border-slate-700 hover:border-indigo-500/50 text-white transition-all"
                >
                  🎤 Start Interview
                </button>
                <button
                  onClick={() => { navigate('/settings'); setShowMenu(false); }}
                  className="w-full text-left px-4 py-3 rounded-lg bg-dark-800/50 hover:bg-indigo-500/20 border border-slate-700 hover:border-indigo-500/50 text-white transition-all"
                >
                  ⚙️ Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowContact(false)} />
          <div className="relative bg-dark-900 rounded-2xl border border-indigo-500/30 shadow-2xl max-w-md w-full p-8">
            <button
              onClick={() => setShowContact(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dark-800/50 transition-all"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Contact Us
            </h2>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-dark-800/50 border border-indigo-500/20">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Email</p>
                  <a href="mailto:support@interviewai.com" className="text-white font-medium hover:text-indigo-400 transition-colors">
                    support@interviewai.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-dark-800/50 border border-indigo-500/20">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Phone</p>
                  <a href="tel:+1234567890" className="text-white font-medium hover:text-indigo-400 transition-colors">
                    +1 (234) 567-890
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                <p className="text-sm text-slate-300">
                  📧 We typically respond within 24 hours. For urgent matters, please call us directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
