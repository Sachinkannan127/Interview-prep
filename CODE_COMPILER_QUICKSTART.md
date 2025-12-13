# Code Compiler Quick Start Guide

## 🚀 What is the Code Compiler?

The Code Compiler is an integrated code execution feature that allows you to:
- Write and run code in **5 programming languages** (Python, JavaScript, Java, C++, C)
- Test your solutions during **technical interviews**
- Practice coding in a **standalone editor**
- Get **instant feedback** on your code execution

---

## 📋 Prerequisites

Ensure the following are installed on your system:

| Language | Requirement | Check Command | Install Link |
|----------|------------|---------------|--------------|
| Python | Version 3.x | `python --version` | [python.org](https://python.org) |
| JavaScript | Node.js (latest LTS) | `node --version` | [nodejs.org](https://nodejs.org) |
| Java | JDK 11+ | `javac --version` | [oracle.com/java](https://www.oracle.com/java/technologies/downloads/) |
| C++ | g++ compiler | `g++ --version` | [MinGW](https://www.mingw-w64.org/) (Windows) |
| C | gcc compiler | `gcc --version` | [MinGW](https://www.mingw-w64.org/) (Windows) |

### ✅ Current Status
- ✅ Python 3.13 - Installed
- ✅ Node.js v24.11.1 - Installed
- ⚠️ Java - Check with `javac --version`
- ⚠️ C++ - Check with `g++ --version`
- ⚠️ C - Check with `gcc --version`

---

## 🎯 How to Use

### Option 1: During Technical Interviews

1. **Start a Technical Interview**
   - Go to Dashboard → "Start New Interview"
   - Select interview type: **Technical** or **Coding**
   - Configure and start interview

2. **Open Code Editor**
   - During interview, click **"Open Code Editor"** button
   - A code editor panel will appear below the question

3. **Write and Test Code**
   - Select your preferred language from dropdown
   - Write your solution
   - Provide input (if needed)
   - Click **"Run Code"** to test
   - View output and errors

4. **Submit Answer**
   - Your code is automatically saved
   - Type your explanation in the answer box
   - Submit when ready

### Option 2: Standalone Code Practice

1. **Navigate to Code Practice**
   - Go to Dashboard → **"Practice"**
   - Click **"Code Practice Editor"** button

2. **Start Coding**
   - Full-screen code editor opens
   - Select language from dropdown
   - Write your code

3. **Execute and Test**
   - Provide input in the input panel (optional)
   - Click **"Run Code"**
   - View results in output panel

4. **Learn and Improve**
   - Check coding tips on the right
   - Try different languages
   - Practice various problems

---

## 💡 Code Editor Features

### Toolbar Actions
- **Language Selector**: Switch between Python, JavaScript, Java, C++, C
- **Run Code**: Execute your code
- **Copy Code**: Copy to clipboard
- **Clear Code**: Reset to starter template

### Input/Output Panel
- **Input (stdin)**: Provide input for your program
- **Output**: See execution results
  - ✅ Success indicator (green)
  - ❌ Error indicator (red)
  - ⏱️ Execution time
  - 📝 stdout output
  - ⚠️ stderr errors

---

## 📝 Example Code

### Python Example
```python
# Write your Python code here
name = input("Enter your name: ")
print(f"Hello, {name}!")
```

**Input:**
```
Alice
```

**Output:**
```
Hello, Alice!
```

### JavaScript Example
```javascript
// Write your JavaScript code here
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Enter your name: ', name => {
  console.log(`Hello, ${name}!`);
  readline.close();
});
```

### Java Example
```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
    }
}
```

### C++ Example
```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    cout << "Enter your name: ";
    getline(cin, name);
    cout << "Hello, " << name << "!" << endl;
    return 0;
}
```

### C Example
```c
#include <stdio.h>

int main() {
    char name[100];
    printf("Enter your name: ");
    fgets(name, sizeof(name), stdin);
    printf("Hello, %s!", name);
    return 0;
}
```

---

## ⚙️ Technical Details

### Execution Limits
- **Timeout**: 10 seconds maximum
- **Output Size**: 10,000 characters maximum
- **Memory**: System default limits

### Security
- ✅ Code runs in isolated temporary directories
- ✅ Process timeout protection
- ✅ No shell command injection
- ✅ Automatic cleanup after execution
- ✅ Authentication required

### Compilation
- **Java**: Compiled with `javac`, executed with `java`
- **C++**: Compiled with `g++`, generates executable
- **C**: Compiled with `gcc`, generates executable
- **Python/JavaScript**: Interpreted directly

---

## 🐛 Troubleshooting

### "Failed to execute code"
- ✅ Check if the language runtime is installed
- ✅ Verify backend server is running
- ✅ Check browser console for errors

### "Compilation error"
- ✅ Check your code syntax
- ✅ Ensure class name is `Main` for Java
- ✅ Include necessary headers/imports

### "Execution timeout"
- ✅ Your code is taking too long (>10 seconds)
- ✅ Check for infinite loops
- ✅ Optimize your algorithm

### "Command not found"
- ✅ Install the required compiler/interpreter
- ✅ Ensure it's in your system PATH
- ✅ Restart the backend server after installation

---

## 🎓 Coding Tips

1. **Plan First**: Write pseudocode before coding
2. **Test Edge Cases**: Empty inputs, large numbers, special characters
3. **Use Comments**: Explain complex logic
4. **Check Complexity**: Consider time and space complexity
5. **Handle Errors**: Add input validation and error handling
6. **Meaningful Names**: Use descriptive variable and function names

---

## 🔗 Quick Links

- **API Endpoint**: `POST /api/code/execute`
- **Component**: `frontend/src/components/CodeEditor.tsx`
- **Service**: `backend/app/services/code_executor.py`
- **Documentation**: [CODE_COMPILER_FEATURE.md](CODE_COMPILER_FEATURE.md)

---

## 📞 Need Help?

If you encounter issues:
1. Check this guide
2. Review error messages carefully
3. Verify all prerequisites are installed
4. Check backend logs for detailed errors
5. Ensure your code compiles/runs locally first

---

## 🎉 Happy Coding!

The Code Compiler is designed to help you practice and ace technical interviews. Write code, test solutions, and get instant feedback!
