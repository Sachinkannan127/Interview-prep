import { useNavigate } from 'react-router-dom';
import { Brain, Mic, TrendingUp, Shield } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200">
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-2xl font-bold text-primary-500">
          <Brain className="w-8 h-8" />
          <span>InterviewAI</span>
        </div>
        <button onClick={() => navigate('/auth')} className="btn-primary">
          Get Started
        </button>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Master Your Interviews with AI
          </h1>
          <p className="text-xl text-dark-600 mb-8">
            Practice realistic mock interviews, get instant AI-powered feedback, and track your progress.
          </p>
          <button onClick={() => navigate('/auth')} className="btn-primary text-lg px-8 py-4">
            Start Practicing Now
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="card text-center hover:scale-105 transition-transform duration-200">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-dark-800">{title}</h3>
      <p className="text-dark-600">{description}</p>
    </div>
  );
}
