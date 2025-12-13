import subprocess
import tempfile
import os
import json
from typing import Dict, Any
import time

class CodeExecutor:
    """Service to execute code in various programming languages safely"""
    
    # Language configurations
    LANGUAGES = {
        'python': {
            'extension': '.py',
            'command': 'python',
            'compile': None
        },
        'javascript': {
            'extension': '.js',
            'command': 'node',
            'compile': None
        },
        'typescript': {
            'extension': '.ts',
            'command': 'ts-node',
            'compile': None
        },
        'java': {
            'extension': '.java',
            'command': 'java',
            'compile': 'javac',
            'className': 'Main'
        },
        'cpp': {
            'extension': '.cpp',
            'command': None,  # Will run compiled executable
            'compile': 'g++'
        },
        'c': {
            'extension': '.c',
            'command': None,  # Will run compiled executable
            'compile': 'gcc'
        },
        'go': {
            'extension': '.go',
            'command': 'go',
            'compile': None,
            'runArgs': ['run']
        },
        'rust': {
            'extension': '.rs',
            'command': None,  # Will run compiled executable
            'compile': 'rustc'
        },
        'ruby': {
            'extension': '.rb',
            'command': 'ruby',
            'compile': None
        },
        'php': {
            'extension': '.php',
            'command': 'php',
            'compile': None
        },
        'swift': {
            'extension': '.swift',
            'command': 'swift',
            'compile': None
        },
        'kotlin': {
            'extension': '.kt',
            'command': 'kotlin',
            'compile': 'kotlinc',
            'compileArgs': ['-include-runtime', '-d']
        },
        'r': {
            'extension': '.r',
            'command': 'Rscript',
            'compile': None
        },
        'perl': {
            'extension': '.pl',
            'command': 'perl',
            'compile': None
        },
        'bash': {
            'extension': '.sh',
            'command': 'bash',
            'compile': None
        },
        'csharp': {
            'extension': '.cs',
            'command': None,
            'compile': 'csc',
            'compileArgs': ['/out:']
        },
        'scala': {
            'extension': '.scala',
            'command': 'scala',
            'compile': 'scalac'
        }
    }
    
    def __init__(self):
        self.timeout = 10  # seconds
        self.max_output_size = 10000  # characters
    
    def execute(self, code: str, language: str, input_data: str = "") -> Dict[str, Any]:
        """
        Execute code in specified language
        
        Args:
            code: Source code to execute
            language: Programming language (17 languages supported)
            input_data: Input to provide to the program
            
        Returns:
            Dict with output, error, execution_time, and status
        """
        if language not in self.LANGUAGES:
            available_langs = ', '.join(sorted(self.LANGUAGES.keys()))
            return {
                'success': False,
                'output': '',
                'error': f'Unsupported language: {language}. Available: {available_langs}',
                'execution_time': 0
            }
        
        lang_config = self.LANGUAGES[language]
        
        try:
            # Create temporary directory for execution
            with tempfile.TemporaryDirectory() as temp_dir:
                # Create source file
                file_path = os.path.join(temp_dir, f'main{lang_config["extension"]}')
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(code)
                
                start_time = time.time()
                
                # Compile if needed
                if lang_config['compile']:
                    compile_result = self._compile(file_path, temp_dir, lang_config)
                    if not compile_result['success']:
                        return compile_result
                
                # Execute
                result = self._run(file_path, temp_dir, lang_config, input_data)
                
                execution_time = time.time() - start_time
                result['execution_time'] = round(execution_time, 3)
                
                return result
                
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': f'Execution error: {str(e)}',
                'execution_time': 0
            }
    
    def _compile(self, file_path: str, temp_dir: str, lang_config: Dict) -> Dict[str, Any]:
        """Compile the source code"""
        try:
            if lang_config['compile'] in ['gcc', 'g++']:
                # C/C++ compilation
                output_file = os.path.join(temp_dir, 'main.exe' if os.name == 'nt' else 'main')
                compile_cmd = [lang_config['compile'], file_path, '-o', output_file]
            elif lang_config['compile'] == 'javac':
                # Java compilation
                compile_cmd = ['javac', file_path]
            elif lang_config['compile'] == 'rustc':
                # Rust compilation
                output_file = os.path.join(temp_dir, 'main.exe' if os.name == 'nt' else 'main')
                compile_cmd = ['rustc', file_path, '-o', output_file]
            elif lang_config['compile'] == 'kotlinc':
                # Kotlin compilation
                jar_file = os.path.join(temp_dir, 'main.jar')
                compile_cmd = ['kotlinc', file_path]
                if 'compileArgs' in lang_config:
                    compile_cmd.extend(lang_config['compileArgs'])
                    compile_cmd.append(jar_file)
            elif lang_config['compile'] == 'csc':
                # C# compilation
                output_file = os.path.join(temp_dir, 'main.exe')
                compile_cmd = ['csc', f'/out:{output_file}', file_path, '/nologo']
            elif lang_config['compile'] == 'scalac':
                # Scala compilation
                compile_cmd = ['scalac', file_path]
            else:
                return {'success': False, 'output': '', 'error': 'Unknown compiler'}
            
            process = subprocess.run(
                compile_cmd,
                capture_output=True,
                text=True,
                timeout=self.timeout,
                cwd=temp_dir
            )
            
            if process.returncode != 0:
                return {
                    'success': False,
                    'output': '',
                    'error': f'Compilation error:\n{process.stderr}',
                    'execution_time': 0
                }
            
            return {'success': True}
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'output': '',
                'error': 'Compilation timeout',
                'execution_time': 0
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': f'Compilation error: {str(e)}',
                'execution_time': 0
            }
    
    def _run(self, file_path: str, temp_dir: str, lang_config: Dict, input_data: str) -> Dict[str, Any]:
        """Run the compiled/interpreted code"""
        try:
            # Prepare command based on language
            if lang_config['extension'] == '.py':
                cmd = ['python', file_path]
            elif lang_config['extension'] == '.js':
                cmd = ['node', file_path]
            elif lang_config['extension'] == '.ts':
                cmd = ['ts-node', file_path]
            elif lang_config['extension'] == '.java':
                # Java requires class name
                cmd = ['java', '-cp', temp_dir, 'Main']
            elif lang_config['extension'] == '.go':
                cmd = ['go', 'run', file_path]
            elif lang_config['extension'] == '.rb':
                cmd = ['ruby', file_path]
            elif lang_config['extension'] == '.php':
                cmd = ['php', file_path]
            elif lang_config['extension'] == '.swift':
                cmd = ['swift', file_path]
            elif lang_config['extension'] == '.r':
                cmd = ['Rscript', file_path]
            elif lang_config['extension'] == '.pl':
                cmd = ['perl', file_path]
            elif lang_config['extension'] == '.sh':
                cmd = ['bash', file_path]
            elif lang_config['extension'] == '.scala':
                # Run compiled Scala class
                class_name = os.path.splitext(os.path.basename(file_path))[0]
                cmd = ['scala', '-cp', temp_dir, class_name]
            elif lang_config['compile'] in ['gcc', 'g++', 'rustc']:
                # Run compiled C/C++/Rust executable
                output_file = os.path.join(temp_dir, 'main.exe' if os.name == 'nt' else 'main')
                cmd = [output_file]
            elif lang_config['compile'] == 'kotlinc':
                # Run compiled Kotlin jar
                jar_file = os.path.join(temp_dir, 'main.jar')
                cmd = ['kotlin', jar_file]
            elif lang_config['compile'] == 'csc':
                # Run compiled C# executable
                output_file = os.path.join(temp_dir, 'main.exe')
                cmd = [output_file]
            else:
                cmd = [lang_config['command'], file_path]
            
            # Execute with timeout
            process = subprocess.run(
                cmd,
                input=input_data,
                capture_output=True,
                text=True,
                timeout=self.timeout,
                cwd=temp_dir
            )
            
            # Truncate output if too large
            output = process.stdout
            if len(output) > self.max_output_size:
                output = output[:self.max_output_size] + '\n... (output truncated)'
            
            error = process.stderr
            if len(error) > self.max_output_size:
                error = error[:self.max_output_size] + '\n... (error truncated)'
            
            return {
                'success': process.returncode == 0,
                'output': output,
                'error': error if process.returncode != 0 else '',
                'exit_code': process.returncode
            }
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'output': '',
                'error': f'Execution timeout (>{self.timeout}s). Your code took too long to execute.',
                'execution_time': self.timeout
            }
        except FileNotFoundError as e:
            # Provide helpful installation instructions
            install_guide = {
                'python': 'Install from https://python.org',
                'node': 'Install from https://nodejs.org',
                'ts-node': 'Run: npm install -g ts-node typescript',
                'javac': 'Install JDK from https://www.oracle.com/java/technologies/downloads/',
                'java': 'Install JDK from https://www.oracle.com/java/technologies/downloads/',
                'g++': 'Install MinGW from https://www.mingw-w64.org/',
                'gcc': 'Install MinGW from https://www.mingw-w64.org/',
                'go': 'Install from https://go.dev/dl/ or run: winget install GoLang.Go',
                'rustc': 'Install from https://rustup.rs/',
                'ruby': 'Install from https://www.ruby-lang.org/ or run: winget install RubyInstallerTeam.Ruby',
                'php': 'Install from https://www.php.net/ or run: winget install PHP.PHP',
                'swift': 'Install from https://www.swift.org/download/',
                'kotlinc': 'Install from https://kotlinlang.org/docs/command-line.html',
                'kotlin': 'Install from https://kotlinlang.org/docs/command-line.html',
                'Rscript': 'Install R from https://cran.r-project.org/ or run: winget install RProject.R',
                'perl': 'Install from https://www.perl.org/ or run: winget install StrawberryPerl.StrawberryPerl',
                'bash': 'Install Git Bash from https://git-scm.com/',
                'csc': 'Install .NET SDK from https://dotnet.microsoft.com/ or run: winget install Microsoft.DotNet.SDK.8',
                'scala': 'Install from https://www.scala-lang.org/download/',
                'scalac': 'Install from https://www.scala-lang.org/download/'
            }
            
            compiler_cmd = lang_config.get('compile') or lang_config.get('command', 'unknown')
            install_msg = install_guide.get(compiler_cmd, 'Check language installation documentation')
            
            return {
                'success': False,
                'output': '',
                'error': f'❌ {compiler_cmd} is not installed or not in PATH.\n\n📥 Installation: {install_msg}\n\nAfter installation, restart the backend server.',
                'execution_time': 0
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': f'Runtime error: {str(e)}',
                'execution_time': 0
            }

# Singleton instance
code_executor = CodeExecutor()
