import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, User, Bell, Shield, Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import toast from 'react-hot-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Settings - InterviewAI</title>
        <meta name="description" content="Manage your account settings and preferences" />
      </Helmet>
      <div className="min-h-screen relative overflow-hidden">
        {/* Professional Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-gradient-to-tl from-amber-600/10 to-orange-600/10 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-slate-700/5 to-slate-800/5 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <Header />

        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-400 mb-6 transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="mb-10 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">Settings</span>
            </h1>
            <p className="text-slate-400 text-lg">Manage your account, preferences, and security</p>
          </div>

          <div className="grid gap-6 max-w-5xl animate-fade-in-up">
            {/* Account Settings */}
            <div className="card group hover:border-blue-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700/50">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Account</h2>
                  <p className="text-slate-400 text-sm">Manage your account settings</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                  <div>
                    <p className="text-white font-semibold mb-1">Email Address</p>
                    <p className="text-slate-400 text-sm">{auth.currentUser?.email || 'Not signed in'}</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                    <span className="text-green-400 text-xs font-medium">✓ Verified</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3.5 rounded-xl font-semibold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="card group hover:border-purple-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700/50">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Palette className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Appearance</h2>
                  <p className="text-slate-400 text-sm">Customize your interface</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                  <div>
                    <p className="text-white font-semibold mb-1">Theme Mode</p>
                    <p className="text-slate-400 text-sm">Choose your preferred color scheme</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 shadow-blue-500/30'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 shadow-amber-500/30'
                    }`}
                  >
                    {isDarkMode ? '🌙 Dark' : '☀️ Light'}
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="card group hover:border-cyan-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/10">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700/50">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Bell className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Notifications</h2>
                  <p className="text-slate-400 text-sm">Manage notification preferences</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                  <div className="flex-1">
                    <p className="text-white font-semibold mb-1">Practice Reminders</p>
                    <p className="text-slate-400 text-sm">Get notified about practice sessions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800/50 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-blue-700 shadow-lg"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                  <div className="flex-1">
                    <p className="text-white font-semibold mb-1">Email Updates</p>
                    <p className="text-slate-400 text-sm">Receive updates about new features</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800/50 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-blue-700 shadow-lg"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="card group hover:border-emerald-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/10">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700/50">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Privacy & Security</h2>
                  <p className="text-slate-400 text-sm">Control your data and security</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mt-0.5">
                      <span className="text-xl">🔒</span>
                    </div>
                    <div>
                      <p className="text-emerald-400 font-semibold mb-2">End-to-End Encryption</p>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Your data is encrypted and stored securely with Firebase. We never share your personal information with third parties. All interview sessions and personal data are protected with industry-standard security measures.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                    <p className="text-blue-400 font-semibold text-sm mb-1">🛡️ Data Protection</p>
                    <p className="text-slate-400 text-xs">GDPR Compliant</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                    <p className="text-amber-400 font-semibold text-sm mb-1">🔐 Secure Storage</p>
                    <p className="text-slate-400 text-xs">Firebase Cloud</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
