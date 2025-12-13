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
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <Header />

        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Settings</span>
          </h1>

          <div className="grid gap-6 max-w-4xl">
            {/* Account Settings */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Account</h2>
                  <p className="text-slate-400 text-sm">Manage your account settings</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50 border border-slate-700">
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-slate-400 text-sm">{auth.currentUser?.email || 'Not signed in'}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full btn-secondary text-red-400 hover:text-red-300 hover:border-red-500/50"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Appearance</h2>
                  <p className="text-slate-400 text-sm">Customize your interface</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50 border border-slate-700">
                  <div>
                    <p className="text-white font-medium">Theme</p>
                    <p className="text-slate-400 text-sm">Choose your preferred color scheme</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isDarkMode
                        ? 'bg-indigo-500 text-white'
                        : 'bg-yellow-400 text-slate-900'
                    }`}
                  >
                    {isDarkMode ? '🌙 Dark' : '☀️ Light'}
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Notifications</h2>
                  <p className="text-slate-400 text-sm">Manage notification preferences</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50 border border-slate-700">
                  <div>
                    <p className="text-white font-medium">Practice Reminders</p>
                    <p className="text-slate-400 text-sm">Get notified about practice sessions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50 border border-slate-700">
                  <div>
                    <p className="text-white font-medium">Email Updates</p>
                    <p className="text-slate-400 text-sm">Receive updates about new features</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Privacy & Security</h2>
                  <p className="text-slate-400 text-sm">Control your data and security</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <p className="text-sm text-slate-300">
                    🔒 Your data is encrypted and stored securely with Firebase. We never share your personal information with third parties.
                  </p>
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
