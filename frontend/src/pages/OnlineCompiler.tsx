import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Code, CheckCircle, XCircle, Download, Terminal, Zap, Shield, Clock, Globe } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function OnlineCompiler() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'features' | 'languages' | 'guide'>('features');

  const languages = [
    { name: 'Python', version: '3.x', status: 'ready', icon: '🐍', category: 'Scripting' },
    { name: 'JavaScript', version: 'Node.js', status: 'ready', icon: '🟨', category: 'Web' },
    { name: 'TypeScript', version: 'ts-node', status: 'ready', icon: '🔷', category: 'Web' },
    { name: 'Java', version: 'JDK 11+', status: 'ready', icon: '☕', category: 'Enterprise' },
    { name: 'C++', version: 'C++17', status: 'optional', icon: '⚡', category: 'Systems' },
    { name: 'C', version: 'C11', status: 'optional', icon: '🔧', category: 'Systems' },
    { name: 'Go', version: '1.18+', status: 'optional', icon: '🐹', category: 'Backend' },
    { name: 'Rust', version: 'Latest', status: 'optional', icon: '🦀', category: 'Systems' },
    { name: 'Ruby', version: '2.7+', status: 'optional', icon: '💎', category: 'Scripting' },
    { name: 'PHP', version: '7.4+', status: 'optional', icon: '🐘', category: 'Web' },
    { name: 'Swift', version: '5.x', status: 'optional', icon: '🐦', category: 'Mobile' },
    { name: 'Kotlin', version: '1.5+', status: 'optional', icon: '🎯', category: 'Mobile' },
    { name: 'R', version: '4.x', status: 'optional', icon: '📊', category: 'Data Science' },
    { name: 'Perl', version: '5.x', status: 'optional', icon: '🐪', category: 'Scripting' },
    { name: 'Bash', version: '4.x+', status: 'optional', icon: '💻', category: 'Shell' },
    { name: 'C#', version: '.NET 5+', status: 'optional', icon: '#️⃣', category: 'Enterprise' },
    { name: 'Scala', version: '2.13+', status: 'optional', icon: '⚖️', category: 'JVM' },
  ];

  return (
    <>
      <Helmet>
        <title>Online Code Compiler - 17 Programming Languages</title>
        <meta name="description" content="Execute code online in 17+ programming languages with our secure, fast, and free online compiler" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 flex flex-col">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-6">
              <Code className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Online Code Compiler
            </h1>
            <p className="text-xl text-slate-400 mb-6 max-w-2xl mx-auto">
              Execute code in <span className="text-indigo-400 font-bold">17 programming languages</span> instantly. 
              No setup required. Fast, secure, and free.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/practice/code')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Start Coding Now
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all"
              >
                View Guide
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="card max-w-6xl mx-auto">
            <div className="flex border-b border-slate-700 mb-6">
              <button
                onClick={() => setActiveTab('features')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'features'
                    ? 'text-indigo-400 border-b-2 border-indigo-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab('languages')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'languages'
                    ? 'text-indigo-400 border-b-2 border-indigo-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Supported Languages (17)
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'guide'
                    ? 'text-indigo-400 border-b-2 border-indigo-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Quick Start Guide
              </button>
            </div>

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Globe className="w-8 h-8 text-indigo-400 mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">17 Languages</h3>
                  <p className="text-slate-400">
                    Support for Python, JavaScript, TypeScript, Java, C++, C, Go, Rust, Ruby, PHP, Swift, Kotlin, R, Perl, Bash, C#, and Scala.
                  </p>
                </div>

                <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Zap className="w-8 h-8 text-yellow-400 mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">Instant Execution</h3>
                  <p className="text-slate-400">
                    Fast compilation and execution. See results in milliseconds. No waiting, no delays.
                  </p>
                </div>

                <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Shield className="w-8 h-8 text-green-400 mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">Secure Sandbox</h3>
                  <p className="text-slate-400">
                    Code runs in isolated environments with timeout protection. Your data stays safe.
                  </p>
                </div>

                <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Clock className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">Real-time Feedback</h3>
                  <p className="text-slate-400">
                    See stdout, stderr, execution time, and exit codes. Debug with detailed error messages.
                  </p>
                </div>

                <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Terminal className="w-8 h-8 text-cyan-400 mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">stdin Support</h3>
                  <p className="text-slate-400">
                    Provide custom input to your programs. Test with different data sets easily.
                  </p>
                </div>

                <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Code className="w-8 h-8 text-pink-400 mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">Smart Editor</h3>
                  <p className="text-slate-400">
                    Monospace font, starter templates, copy/clear functions. Professional coding experience.
                  </p>
                </div>
              </div>
            )}

            {/* Languages Tab */}
            {activeTab === 'languages' && (
              <div>
                <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-indigo-400 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-bold">4 Languages Ready to Use</span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Python, JavaScript, TypeScript, and Java are pre-installed and working immediately.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {languages.map((lang) => (
                    <div
                      key={lang.name}
                      className={`p-4 rounded-lg border ${
                        lang.status === 'ready'
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-slate-800/50 border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{lang.icon}</span>
                          <span className="font-bold text-white">{lang.name}</span>
                        </div>
                        {lang.status === 'ready' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div className="text-sm text-slate-400 mb-1">{lang.version}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">
                          {lang.category}
                        </span>
                        <span className={`text-xs ${lang.status === 'ready' ? 'text-green-400' : 'text-yellow-400'}`}>
                          {lang.status === 'ready' ? '✅ Ready' : '⚠️ Optional'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <Download className="w-5 h-5" />
                    <span className="font-bold">Install Additional Languages</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">
                    Optional languages can be installed on your server. See our{' '}
                    <a href="/docs/installation" className="text-indigo-400 hover:underline">
                      Installation Guide
                    </a>{' '}
                    for instructions.
                  </p>
                </div>
              </div>
            )}

            {/* Guide Tab */}
            {activeTab === 'guide' && (
              <div className="prose prose-invert max-w-none">
                <h3 className="text-2xl font-bold text-white mb-4">How to Use the Online Compiler</h3>

                <div className="space-y-6">
                  <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <h4 className="text-xl font-bold text-white">Access the Compiler</h4>
                    </div>
                    <p className="text-slate-400 ml-11">
                      Navigate to <span className="text-indigo-400 font-mono">Practice → Code Practice Editor</span> from the dashboard,
                      or click "Start Coding Now" above.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <h4 className="text-xl font-bold text-white">Select Language</h4>
                    </div>
                    <p className="text-slate-400 ml-11">
                      Choose from 17 programming languages in the dropdown. A starter template will load automatically.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <h4 className="text-xl font-bold text-white">Write Code</h4>
                    </div>
                    <p className="text-slate-400 ml-11">
                      Type or paste your code in the editor. Modify the starter template or write from scratch.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                        4
                      </div>
                      <h4 className="text-xl font-bold text-white">Provide Input (Optional)</h4>
                    </div>
                    <p className="text-slate-400 ml-11">
                      If your program needs input, enter it in the "Input (stdin)" panel on the right.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                        5
                      </div>
                      <h4 className="text-xl font-bold text-white">Run & View Results</h4>
                    </div>
                    <p className="text-slate-400 ml-11">
                      Click "Run Code" to execute. See output, errors, and execution time in the output panel.
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                  <h4 className="text-lg font-bold text-white mb-3">💡 Pro Tips</h4>
                  <ul className="space-y-2 text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400">•</span>
                      <span>Use "Copy" button to save your code to clipboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400">•</span>
                      <span>Use "Clear" to reset to starter template</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400">•</span>
                      <span>Execution timeout is 10 seconds - optimize long-running code</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400">•</span>
                      <span>Check stderr output for compilation/runtime errors</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="card max-w-4xl mx-auto mt-12 text-center p-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Coding?</h2>
            <p className="text-slate-400 mb-6">
              Access our full-featured online compiler with 17 programming languages. Perfect for learning, practicing, and technical interviews.
            </p>
            <button
              onClick={() => navigate('/practice/code')}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold text-lg transition-all flex items-center gap-3 mx-auto"
            >
              <Code className="w-6 h-6" />
              Open Code Editor
              <Zap className="w-5 h-5" />
            </button>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
