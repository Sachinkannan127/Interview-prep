# Multi-Language Support - Installation Guide

## 🎯 Overview
The Code Compiler now supports **17 programming languages**! This guide will help you install the necessary compilers and interpreters.

## 📊 Supported Languages

| Language | Status | Installer | Command Check |
|----------|--------|-----------|---------------|
| Python ✅ | Installed | [python.org](https://python.org) | `python --version` |
| JavaScript ✅ | Installed | [nodejs.org](https://nodejs.org) | `node --version` |
| TypeScript | Optional | `npm install -g ts-node typescript` | `ts-node --version` |
| Java | Optional | [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) | `javac --version` |
| C++ | Optional | [MinGW-w64](https://www.mingw-w64.org/) | `g++ --version` |
| C | Optional | [MinGW-w64](https://www.mingw-w64.org/) | `gcc --version` |
| Go | Optional | [go.dev](https://go.dev/dl/) | `go version` |
| Rust | Optional | [rustup.rs](https://rustup.rs/) | `rustc --version` |
| Ruby | Optional | [ruby-lang.org](https://www.ruby-lang.org/en/downloads/) | `ruby --version` |
| PHP | Optional | [php.net](https://www.php.net/downloads) | `php --version` |
| Swift | Optional | [swift.org](https://www.swift.org/download/) | `swift --version` |
| Kotlin | Optional | [kotlinlang.org](https://kotlinlang.org/docs/command-line.html) | `kotlinc -version` |
| R | Optional | [r-project.org](https://www.r-project.org/) | `Rscript --version` |
| Perl | Optional | [perl.org](https://www.perl.org/get.html) | `perl --version` |
| Bash | Built-in | Git Bash (Windows) | `bash --version` |
| C# | Optional | [.NET SDK](https://dotnet.microsoft.com/download) | `csc` or `dotnet --version` |
| Scala | Optional | [scala-lang.org](https://www.scala-lang.org/download/) | `scala -version` |

---

## 🚀 Quick Installation (Windows)

### 1. Essential Languages (Recommended)

These are the most commonly used languages in interviews:

#### Python (Already Installed ✅)
```powershell
python --version  # Verify: Python 3.13
```

#### JavaScript/Node.js (Already Installed ✅)
```powershell
node --version    # Verify: v24.11.1
npm --version
```

#### TypeScript
```powershell
npm install -g ts-node typescript
ts-node --version
```

#### Java (JDK 17+)
1. Download from [Oracle JDK](https://www.oracle.com/java/technologies/downloads/)
2. Install and add to PATH
3. Verify:
```powershell
javac --version
java --version
```

#### C/C++ (MinGW)
1. Download [MinGW-w64](https://www.mingw-w64.org/downloads/)
2. Or use [w64devkit](https://github.com/skeeto/w64devkit/releases)
3. Add to PATH
4. Verify:
```powershell
gcc --version
g++ --version
```

---

### 2. Additional Languages (Optional)

#### Go
```powershell
# Download and install from https://go.dev/dl/
go version
```

#### Rust
```powershell
# Install via rustup
# Download from https://rustup.rs/
rustc --version
cargo --version
```

#### Ruby
```powershell
# Download from https://rubyinstaller.org/ (Windows)
ruby --version
```

#### PHP
```powershell
# Download from https://windows.php.net/download/
php --version
```

#### Kotlin
```powershell
# Install via SDKMAN or download binary
# https://kotlinlang.org/docs/command-line.html
kotlinc -version
```

#### R
```powershell
# Download from https://cran.r-project.org/
Rscript --version
```

#### Perl (Usually pre-installed on Windows)
```powershell
perl --version
```

#### C# (.NET SDK)
```powershell
# Download from https://dotnet.microsoft.com/download
dotnet --version
# Or install Visual Studio for csc compiler
```

#### Scala
```powershell
# Requires Java JDK first
# Download from https://www.scala-lang.org/download/
scala -version
scalac -version
```

---

## 🔧 PATH Configuration

After installing, ensure executables are in your system PATH:

### Check PATH
```powershell
$env:PATH -split ';'
```

### Add to PATH (PowerShell - Current Session)
```powershell
$env:PATH += ";C:\path\to\compiler"
```

### Add to PATH (Permanent - Windows)
1. Open System Properties → Environment Variables
2. Edit `Path` variable
3. Add compiler installation directories
4. Restart terminal/IDE

---

## ✅ Verification Script

Create a test script to check all installations:

```powershell
# check-compilers.ps1
Write-Host "`nChecking installed compilers...`n" -ForegroundColor Cyan

$compilers = @(
    @{Name="Python"; Command="python --version"},
    @{Name="Node.js"; Command="node --version"},
    @{Name="TypeScript"; Command="ts-node --version"},
    @{Name="Java"; Command="javac --version"},
    @{Name="C++"; Command="g++ --version"},
    @{Name="C"; Command="gcc --version"},
    @{Name="Go"; Command="go version"},
    @{Name="Rust"; Command="rustc --version"},
    @{Name="Ruby"; Command="ruby --version"},
    @{Name="PHP"; Command="php --version"},
    @{Name="Swift"; Command="swift --version"},
    @{Name="Kotlin"; Command="kotlinc -version"},
    @{Name="R"; Command="Rscript --version"},
    @{Name="Perl"; Command="perl --version"},
    @{Name="Bash"; Command="bash --version"},
    @{Name=".NET/C#"; Command="dotnet --version"},
    @{Name="Scala"; Command="scala -version"}
)

foreach ($compiler in $compilers) {
    try {
        $result = Invoke-Expression $compiler.Command 2>&1
        if ($LASTEXITCODE -eq 0 -or $result) {
            Write-Host "✅ $($compiler.Name) - Installed" -ForegroundColor Green
        } else {
            Write-Host "❌ $($compiler.Name) - Not Found" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $($compiler.Name) - Not Found" -ForegroundColor Red
    }
}
```

Run it:
```powershell
.\check-compilers.ps1
```

---

## 🐧 Linux Installation

### Ubuntu/Debian
```bash
# Essential
sudo apt update
sudo apt install -y python3 nodejs npm default-jdk gcc g++ make

# TypeScript
sudo npm install -g ts-node typescript

# Additional
sudo apt install -y golang rustc ruby php perl r-base scala

# Kotlin (via SDKMAN)
curl -s "https://get.sdkman.io" | bash
sdk install kotlin
```

### Fedora/RHEL
```bash
# Essential
sudo dnf install -y python3 nodejs java-17-openjdk-devel gcc gcc-c++

# Additional
sudo dnf install -y golang rust cargo ruby php perl R scala
```

---

## 🍎 macOS Installation

### Using Homebrew
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Essential languages
brew install python node openjdk gcc

# TypeScript
npm install -g ts-node typescript

# Additional languages
brew install go rust ruby php perl r kotlin-compiler scala swift
```

---

## 🧪 Testing Individual Languages

### Python Test
```python
# test.py
print("Hello from Python!")
```
```powershell
python test.py
```

### JavaScript Test
```javascript
// test.js
console.log("Hello from JavaScript!");
```
```powershell
node test.js
```

### Java Test
```java
// Main.java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}
```
```powershell
javac Main.java
java Main
```

### C++ Test
```cpp
// test.cpp
#include <iostream>
int main() {
    std::cout << "Hello from C++!" << std::endl;
    return 0;
}
```
```powershell
g++ test.cpp -o test
.\test
```

### Go Test
```go
// test.go
package main
import "fmt"
func main() {
    fmt.Println("Hello from Go!")
}
```
```powershell
go run test.go
```

### Rust Test
```rust
// test.rs
fn main() {
    println!("Hello from Rust!");
}
```
```powershell
rustc test.rs
.\test
```

---

## 📝 Notes

### Minimum Requirements for Interview Platform
For **basic functionality**, you only need:
- ✅ **Python** (Already installed)
- ✅ **JavaScript/Node.js** (Already installed)

For **technical interviews**, additionally install:
- **Java** (Most common for DSA interviews)
- **C++** (Competitive programming, system programming)
- **TypeScript** (Modern web development)

### Performance Considerations
- Compiled languages (C, C++, Rust, Go) are faster but have compilation overhead
- Interpreted languages (Python, JavaScript, Ruby, PHP) start instantly
- JVM languages (Java, Kotlin, Scala) have warmup time but good performance

### Security Note
All code execution is:
- ⏱️ Time-limited (10 seconds)
- 📦 Sandboxed in temp directories
- 🔒 Process-isolated
- 🚫 No network access by default

---

## 🆘 Troubleshooting

### "Command not found"
- Verify installation: Run version check command
- Check PATH: Ensure executable directory is in PATH
- Restart terminal: Close and reopen terminal/IDE

### Compilation Errors
- **Java**: Ensure class name is `Main`
- **C/C++**: Check for syntax errors with `-Wall` flag
- **Rust**: Run `rustc --explain E0xxx` for error codes

### Runtime Errors
- Check code syntax in local editor first
- Verify input format matches expected
- Review error messages carefully

### Permission Issues
- Run terminal as Administrator (Windows)
- Use `sudo` for installations (Linux/Mac)
- Check file permissions

---

## 🔗 Quick Reference

### Documentation
- [CODE_COMPILER_FEATURE.md](CODE_COMPILER_FEATURE.md) - Technical details
- [CODE_COMPILER_QUICKSTART.md](CODE_COMPILER_QUICKSTART.md) - User guide

### Support Matrix
| OS | Python | JS | Java | C/C++ | Go | Rust | Others |
|----|--------|----|----|-------|----|----|--------|
| Windows ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ Varies |
| Linux ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| macOS ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🎓 Recommended Setup for Students

**Minimum (Works immediately):**
- ✅ Python
- ✅ JavaScript

**Recommended (Most interviews):**
- ✅ Python
- ✅ JavaScript
- Java
- C++
- TypeScript

**Complete (All platforms):**
- All 17 languages installed

---

## 📞 Need Help?

1. Check version commands above
2. Verify PATH configuration
3. Restart backend server after installation
4. Test with simple Hello World programs
5. Check backend logs for detailed errors

Happy coding! 🚀
