import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Brain, Mic, TrendingUp, Shield } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>InterviewAI - Master Your Interviews with AI</title>
        <meta name="description" content="Practice realistic mock interviews with AI-powered feedback. Track your progress and improve your interview skills with InterviewAI." />
        <meta name="keywords" content="AI interview, mock interview, interview practice, career preparation, job interview" />
      </Helmet>
      <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Header showAuthButton={true} />

      <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        <div className="text-center max-w-5xl mx-auto mb-16 sm:mb-20 fade-in">
          {/* AI Avatar Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              {/* Animated AI Avatar */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-amber-500 to-purple-600 animate-spin-slow" style={{ animationDuration: '8s' }} />
              <div className="absolute inset-2 rounded-full bg-dark-50 flex items-center justify-center">
                <div className="text-6xl sm:text-7xl animate-bounce" style={{ animationDuration: '2s' }}>
                  💼
                </div>
              </div>
              {/* Pulse Rings */}
              <div className="absolute -inset-4 rounded-full border-2 border-purple-400/30 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute -inset-8 rounded-full border-2 border-amber-400/20 animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
            </div>
          </div>
          
          <div className="inline-block mb-4 sm:mb-6 px-4 sm:px-6 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm">
            <span className="text-purple-300 text-xs sm:text-sm font-medium">🚀 Powered by Advanced AI Technology</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 sm:mb-8 leading-tight px-2">
            <span className="bg-gradient-to-r from-purple-400 via-amber-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              Master Your Interviews
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-purple-500 bg-clip-text text-transparent">
              with AI Precision
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
            Experience next-generation interview preparation with AI-powered feedback, 
            real-time analysis, and personalized coaching to ace your dream job.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <button onClick={() => navigate('/auth')} className="btn-primary text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 group w-full sm:w-auto">
              Start Practicing Now
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button onClick={() => navigate('/auth')} className="btn-secondary text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 w-full sm:w-auto">
              View Demo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 fade-in px-4">
          <FeatureCard
            icon={<Brain className="w-12 h-12 text-primary-500" />}
            title="AI-Powered"
            description="Advanced AI conducts realistic interviews and provides detailed evaluations"
          />
          <FeatureCard
            icon={<Mic className="w-12 h-12 text-primary-500" />}
            title="Voice Mode"
            description="Practice with speech-to-text and text-to-speech for natural conversations"
          />
          <FeatureCard
            icon={<TrendingUp className="w-12 h-12 text-primary-500" />}
            title="Track Progress"
            description="Monitor your improvement over time with detailed analytics"
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12 text-primary-500" />}
            title="Secure & Private"
            description="Your data is encrypted and protected with Firebase security"
          />
        </div>
      </main>
      
      <Footer />
    </div>
    </>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="card text-center group hover:scale-105">
      <div className="flex justify-center mb-6 relative">
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
        </div>
        <div className="relative">{icon}</div>
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-slate-300 leading-relaxed">{description}</p>
    </div>
  );
}
