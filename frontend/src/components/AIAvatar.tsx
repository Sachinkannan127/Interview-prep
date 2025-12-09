import { useState, useEffect, useRef } from 'react';
import { Volume2, Video, VideoOff } from 'lucide-react';

interface AIAvatarProps {
  isSpeaking: boolean;
  message?: string;
  onAnimationEnd?: () => void;
  enabled: boolean;
  reaction?: 'positive' | 'neutral' | 'thinking' | 'encouraging' | null;
  score?: number;
}

export default function AIAvatar({ isSpeaking, message, onAnimationEnd, enabled, reaction, score }: AIAvatarProps) {
  const [avatarEnabled, setAvatarEnabled] = useState(enabled);
  const [expression, setExpression] = useState<'neutral' | 'happy' | 'thinking' | 'talking' | 'excellent' | 'encouraging'>('neutral');
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isSpeaking) {
      setExpression('talking');
      // Animate talking
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else if (reaction) {
      // Show reaction based on feedback
      if (reaction === 'positive' && score && score >= 85) {
        setExpression('excellent');
      } else if (reaction === 'encouraging') {
        setExpression('encouraging');
      } else if (reaction === 'thinking') {
        setExpression('thinking');
      } else {
        setExpression('happy');
      }
      
      // Return to neutral after 3 seconds
      setTimeout(() => {
        setExpression('neutral');
      }, 3000);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setExpression('neutral');
      if (onAnimationEnd) {
        onAnimationEnd();
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpeaking, reaction, score, onAnimationEnd]);

  if (!avatarEnabled) {
    return (
      <div className="flex items-center justify-center p-4">
        <button
          onClick={() => setAvatarEnabled(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <Video className="w-5 h-5" />
          Enable AI Interviewer
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Avatar Container */}
      <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
        
        {/* Avatar Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`relative w-48 h-48 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 shadow-lg transition-all duration-300 ${
            isSpeaking ? 'scale-110 shadow-2xl' : 'scale-100'
          }`}>
            {/* Face */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Eyes */}
              <div className="absolute top-16 left-0 right-0 flex justify-center gap-8">
                <div className={`w-3 h-3 rounded-full bg-white transition-all duration-200 ${
                  expression === 'thinking' ? 'h-1' : 
                  expression === 'excellent' ? 'w-4 h-4' : 'h-3'
                }`} />
                <div className={`w-3 h-3 rounded-full bg-white transition-all duration-200 ${
                  expression === 'thinking' ? 'h-1' : 
                  expression === 'excellent' ? 'w-4 h-4' : 'h-3'
                }`} />
              </div>
              
              {/* Mouth */}
              <div className="absolute bottom-16 left-0 right-0 flex justify-center">
                {expression === 'talking' ? (
                  <div className="w-16 h-8 rounded-full bg-white/80 animate-pulse" />
                ) : expression === 'happy' || expression === 'excellent' ? (
                  <div className="w-16 h-4 bg-white rounded-full" style={{ 
                    clipPath: 'ellipse(50% 100% at 50% 0%)' 
                  }} />
                ) : expression === 'encouraging' ? (
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                ) : (
                  <div className="w-12 h-1 rounded-full bg-white/60" />
                )}
              </div>
              
              {/* Special effects for excellent response */}
              {expression === 'excellent' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl animate-ping">⭐</div>
                </div>
              )}
            </div>
            
            {/* Speaking Indicator */}
            {isSpeaking && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-bounce">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        </div>
        
        {/* Audio Waveform */}
        {isSpeaking && (
          <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary-400 rounded-full"
                style={{
                  height: `${Math.random() * 40 + 10}px`,
                  animation: `wave ${Math.random() * 0.5 + 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        )}
        
        {/* Message Display */}
        {message && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-sm text-slate-200 text-center">{message}</p>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => setAvatarEnabled(false)}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors"
          title="Disable avatar"
        >
          <VideoOff className="w-4 h-4 text-slate-300" />
        </button>
      </div>
      
      {/* Status Indicator */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-sm text-slate-300">
            {isSpeaking ? 'AI is speaking...' : 'Listening...'}
          </span>
        </div>
      </div>

      {/* Waveform Animation Styles */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
      `}</style>
    </div>
  );
}
