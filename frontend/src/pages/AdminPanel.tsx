import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function AdminPanel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 py-12 px-6">
      <div className="container mx-auto max-w-4xl">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-dark-600 hover:text-dark-800 mb-8">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="card text-center py-12">
          <Shield className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-800 mb-4">Admin Panel</h2>
          <p className="text-dark-600">Question management and analytics coming soon!</p>
        </div>
      </div>
    </div>
  );
}
