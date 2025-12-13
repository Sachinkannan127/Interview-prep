import { useState } from 'react';
import { Play, Copy, Trash2, Loader, CheckCircle, XCircle, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  execution_time: number;
  exit_code?: number;
}

const LANGUAGES = [
  { id: 'python', name: 'Python', starter: '# Write your Python code here\nprint("Hello, World!")' },
  { id: 'javascript', name: 'JavaScript', starter: '// Write your JavaScript code here\nconsole.log("Hello, World!");' },
  { id: 'typescript', name: 'TypeScript', starter: '// Write your TypeScript code here\nconst message: string = "Hello, World!";\nconsole.log(message);' },
  { id: 'java', name: 'Java', starter: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
  { id: 'cpp', name: 'C++', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
  { id: 'c', name: 'C', starter: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
  { id: 'go', name: 'Go', starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}' },
  { id: 'rust', name: 'Rust', starter: 'fn main() {\n    println!("Hello, World!");\n}' },
  { id: 'ruby', name: 'Ruby', starter: '# Write your Ruby code here\nputs "Hello, World!"' },
  { id: 'php', name: 'PHP', starter: '<?php\n// Write your PHP code here\necho "Hello, World!\\n";' },
  { id: 'swift', name: 'Swift', starter: '// Write your Swift code here\nprint("Hello, World!")' },
  { id: 'kotlin', name: 'Kotlin', starter: 'fun main() {\n    println("Hello, World!")\n}' },
  { id: 'r', name: 'R', starter: '# Write your R code here\nprint("Hello, World!")' },
  { id: 'perl', name: 'Perl', starter: '#!/usr/bin/perl\n# Write your Perl code here\nprint "Hello, World!\\n";' },
  { id: 'bash', name: 'Bash', starter: '#!/bin/bash\n# Write your Bash script here\necho "Hello, World!"' },
  { id: 'csharp', name: 'C#', starter: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}' },
  { id: 'scala', name: 'Scala', starter: 'object Main extends App {\n  println("Hello, World!")\n}' }
];

export default function CodeEditor({ 
  initialCode, 
  initialLanguage = 'python',
  onCodeChange,
  readOnly = false 
}: CodeEditorProps) {
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(initialCode || LANGUAGES.find(l => l.id === initialLanguage)?.starter || '');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    const starterCode = LANGUAGES.find(l => l.id === newLanguage)?.starter || '';
    handleCodeChange(starterCode);
  };

  const executeCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    setIsExecuting(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8001/api/code/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code,
          language,
          input
        })
      });

      if (!response.ok) {
        throw new Error('Failed to execute code');
      }

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast.success('Code executed successfully!');
      } else {
        toast.error('Code execution failed');
      }
    } catch (error) {
      console.error('Execution error:', error);
      toast.error('Failed to execute code. Make sure the backend is running.');
      setResult({
        success: false,
        output: '',
        error: 'Failed to connect to execution server',
        execution_time: 0
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const clearCode = () => {
    const starterCode = LANGUAGES.find(l => l.id === language)?.starter || '';
    handleCodeChange(starterCode);
    setResult(null);
    toast.success('Code cleared!');
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={readOnly}
            className="px-3 py-1.5 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-indigo-500 focus:outline-none text-sm"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
          <div className="text-xs text-gray-400">
            {LANGUAGES.find(l => l.id === language)?.name} Editor
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <button
                onClick={copyCode}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Copy code"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={clearCode}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Clear code"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={executeCode}
            disabled={isExecuting || readOnly}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors text-sm font-medium"
          >
            {isExecuting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Code
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            readOnly={readOnly}
            className="flex-1 w-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
            style={{
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              lineHeight: '1.5',
              tabSize: 4
            }}
            placeholder="Write your code here..."
            spellCheck={false}
          />
        </div>

        {/* Output Panel */}
        <div className="w-96 flex flex-col border-l border-gray-700 bg-gray-850">
          {/* Input Section */}
          <div className="p-3 border-b border-gray-700">
            <label className="block text-xs font-semibold text-gray-400 mb-2">
              Input (stdin):
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input for your program..."
              className="w-full px-3 py-2 bg-gray-900 text-gray-100 text-sm font-mono rounded border border-gray-600 focus:border-indigo-500 focus:outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Output Section */}
          <div className="flex-1 flex flex-col overflow-hidden p-3">
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-400">Output:</span>
            </div>
            
            {result ? (
              <div className="flex-1 overflow-auto">
                {/* Status Header */}
                <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded ${
                  result.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                }`}>
                  {result.success ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Success</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Error</span>
                    </>
                  )}
                  {result.execution_time > 0 && (
                    <span className="ml-auto text-xs">
                      {result.execution_time.toFixed(3)}s
                    </span>
                  )}
                </div>

                {/* Output */}
                {result.output && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">stdout:</div>
                    <pre className="p-3 bg-gray-900 rounded text-sm text-gray-100 font-mono whitespace-pre-wrap break-words">
                      {result.output}
                    </pre>
                  </div>
                )}

                {/* Error */}
                {result.error && (
                  <div>
                    <div className="text-xs text-red-400 mb-1">stderr:</div>
                    <pre className="p-3 bg-red-900/20 rounded text-sm text-red-300 font-mono whitespace-pre-wrap break-words">
                      {result.error}
                    </pre>
                  </div>
                )}

                {!result.output && !result.error && (
                  <div className="text-sm text-gray-500 italic">
                    No output
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                <div className="text-center">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Click "Run Code" to see output</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
