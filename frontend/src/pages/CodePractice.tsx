import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Code, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet';

export default function CodePractice() {
  const navigate = useNavigate();
  const [savedCode, setSavedCode] = useState<{[key: string]: string}>({});

  const handleCodeChange = (code: string, language: string) => {
    setSavedCode(prev => ({ ...prev, [language]: code }));
  };

  return (
    <>
      <Helmet>
        <title>Code Practice - Interview Prep</title>
        <meta name="description" content="Practice coding with our interactive code editor supporting multiple languages" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => navigate('/practice')}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Practice
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Code Practice</h1>
                  <p className="text-slate-400">Write and execute code in multiple languages</p>
                </div>
              </div>
            </div>

            {/* Code Editor Section */}
            <div className="card p-6 mb-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-2">Interactive Code Editor</h2>
                <p className="text-slate-400 text-sm">
                  Write your code, provide input, and run it instantly. Supports Python, JavaScript, Java, C++, and C.
                </p>
              </div>

              <div className="h-[600px]">
                <CodeEditor 
                  initialCode={savedCode['python'] || undefined}
                  initialLanguage="python"
                  onCodeChange={(code) => handleCodeChange(code, 'python')}
                />
              </div>
            </div>

            {/* Quick Tips */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-400" />
                  Coding Tips
                </h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Start with pseudocode to plan your solution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Test with edge cases (empty input, large numbers, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Consider time and space complexity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Use meaningful variable and function names</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Add comments to explain complex logic</span>
                  </li>
                </ul>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-400" />
                  Supported Languages
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">Python</span>
                    <span className="text-xs text-slate-400">v3.x</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">JavaScript</span>
                    <span className="text-xs text-slate-400">Node.js</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">TypeScript</span>
                    <span className="text-xs text-slate-400">ts-node</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">Java</span>
                    <span className="text-xs text-slate-400">JDK 11+</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">C++</span>
                    <span className="text-xs text-slate-400">C++17</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">C</span>
                    <span className="text-xs text-slate-400">C11</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">Go</span>
                    <span className="text-xs text-slate-400">1.18+</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">Rust</span>
                    <span className="text-xs text-slate-400">Latest</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">Ruby</span>
                    <span className="text-xs text-slate-400">2.7+</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">PHP</span>
                    <span className="text-xs text-slate-400">7.4+</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">Swift</span>
                    <span className="text-xs text-slate-400">5.x</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">Kotlin</span>
                    <span className="text-xs text-slate-400">1.5+</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">R</span>
                    <span className="text-xs text-slate-400">4.x</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">Perl</span>
                    <span className="text-xs text-slate-400">5.x</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">Bash</span>
                    <span className="text-xs text-slate-400">4.x+</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">C#</span>
                    <span className="text-xs text-slate-400">.NET 5+</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                    <span className="text-white">Scala</span>
                    <span className="text-xs text-slate-400">2.13+</span>
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
