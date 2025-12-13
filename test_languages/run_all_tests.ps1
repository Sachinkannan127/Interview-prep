# Comprehensive Language Test Script
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     TESTING ALL 17 PROGRAMMING LANGUAGES                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$testDir = "s:\pro\Interview-prep\test_languages"
Set-Location $testDir

$passed = 0
$failed = 0
$results = @()

# Test 1: Python
Write-Host "`n[1/17] Testing Python..." -ForegroundColor Yellow
try {
    $output = python test.py 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $output -ForegroundColor Green
        $passed++
        $results += "Python: ✅ PASSED"
    } else {
        Write-Host "❌ Python failed" -ForegroundColor Red
        $failed++
        $results += "Python: ❌ FAILED"
    }
} catch {
    Write-Host "❌ Python not installed" -ForegroundColor Red
    $failed++
    $results += "Python: ❌ NOT INSTALLED"
}

# Test 2: JavaScript
Write-Host "`n[2/17] Testing JavaScript..." -ForegroundColor Yellow
try {
    $output = node test.js 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $output -ForegroundColor Green
        $passed++
        $results += "JavaScript: ✅ PASSED"
    } else {
        Write-Host "❌ JavaScript failed" -ForegroundColor Red
        $failed++
        $results += "JavaScript: ❌ FAILED"
    }
} catch {
    Write-Host "❌ Node.js not installed" -ForegroundColor Red
    $failed++
    $results += "JavaScript: ❌ NOT INSTALLED"
}

# Test 3: TypeScript
Write-Host "`n[3/17] Testing TypeScript..." -ForegroundColor Yellow
try {
    $output = ts-node test.ts 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $output -ForegroundColor Green
        $passed++
        $results += "TypeScript: ✅ PASSED"
    } else {
        Write-Host "❌ TypeScript failed" -ForegroundColor Red
        $failed++
        $results += "TypeScript: ❌ FAILED"
    }
} catch {
    Write-Host "❌ ts-node not installed" -ForegroundColor Red
    $failed++
    $results += "TypeScript: ❌ NOT INSTALLED"
}

# Test 4: Java
Write-Host "`n[4/17] Testing Java..." -ForegroundColor Yellow
try {
    javac Main.java 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $output = java Main 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host $output -ForegroundColor Green
            $passed++
            $results += "Java: ✅ PASSED"
        } else {
            Write-Host "❌ Java execution failed" -ForegroundColor Red
            $failed++
            $results += "Java: ❌ FAILED"
        }
    } else {
        Write-Host "❌ Java compilation failed" -ForegroundColor Red
        $failed++
        $results += "Java: ❌ FAILED"
    }
} catch {
    Write-Host "❌ Java not installed" -ForegroundColor Red
    $failed++
    $results += "Java: ❌ NOT INSTALLED"
}

# Test 5: C++
Write-Host "`n[5/17] Testing C++..." -ForegroundColor Yellow
try {
    g++ test.cpp -o test_cpp.exe 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $output = .\test_cpp.exe 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host $output -ForegroundColor Green
            $passed++
            $results += "C++: ✅ PASSED"
        } else {
            Write-Host "❌ C++ execution failed" -ForegroundColor Red
            $failed++
            $results += "C++: ❌ FAILED"
        }
    } else {
        Write-Host "❌ C++ compilation failed" -ForegroundColor Red
        $failed++
        $results += "C++: ❌ FAILED"
    }
} catch {
    Write-Host "❌ g++ not installed" -ForegroundColor Red
    $failed++
    $results += "C++: ❌ NOT INSTALLED"
}

# Test 6: C
Write-Host "`n[6/17] Testing C..." -ForegroundColor Yellow
try {
    gcc test.c -o test_c.exe 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $output = .\test_c.exe 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host $output -ForegroundColor Green
            $passed++
            $results += "C: ✅ PASSED"
        } else {
            Write-Host "❌ C execution failed" -ForegroundColor Red
            $failed++
            $results += "C: ❌ FAILED"
        }
    } else {
        Write-Host "❌ C compilation failed" -ForegroundColor Red
        $failed++
        $results += "C: ❌ FAILED"
    }
} catch {
    Write-Host "❌ gcc not installed" -ForegroundColor Red
    $failed++
    $results += "C: ❌ NOT INSTALLED"
}

# Test 7: Go
Write-Host "`n[7/17] Testing Go..." -ForegroundColor Yellow
try {
    $output = go run test.go 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $output -ForegroundColor Green
        $passed++
        $results += "Go: ✅ PASSED"
    } else {
        Write-Host "❌ Go failed" -ForegroundColor Red
        $failed++
        $results += "Go: ❌ FAILED"
    }
} catch {
    Write-Host "❌ Go not installed" -ForegroundColor Red
    $failed++
    $results += "Go: ❌ NOT INSTALLED"
}

# Test 8: Rust
Write-Host "`n[8/17] Testing Rust..." -ForegroundColor Yellow
try {
    rustc test.rs -o test_rust.exe 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $output = .\test_rust.exe 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host $output -ForegroundColor Green
            $passed++
            $results += "Rust: ✅ PASSED"
        } else {
            Write-Host "❌ Rust execution failed" -ForegroundColor Red
            $failed++
            $results += "Rust: ❌ FAILED"
        }
    } else {
        Write-Host "❌ Rust compilation failed" -ForegroundColor Red
        $failed++
        $results += "Rust: ❌ FAILED"
    }
} catch {
    Write-Host "❌ Rust not installed" -ForegroundColor Red
    $failed++
    $results += "Rust: ❌ NOT INSTALLED"
}

# Test 9: Ruby
Write-Host "`n[9/17] Testing Ruby..." -ForegroundColor Yellow
try {
    $output = ruby test.rb 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $output -ForegroundColor Green
        $passed++
        $results += "Ruby: ✅ PASSED"
    } else {
        Write-Host "❌ Ruby failed" -ForegroundColor Red
        $failed++
        $results += "Ruby: ❌ FAILED"
    }
} catch {
    Write-Host "❌ Ruby not installed" -ForegroundColor Red
    $failed++
    $results += "Ruby: ❌ NOT INSTALLED"
}

# Test 10: PHP
Write-Host "`n[10/17] Testing PHP..." -ForegroundColor Yellow
try {
    $output = php test.php 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $output -ForegroundColor Green
        $passed++
        $results += "PHP: ✅ PASSED"
    } else {
        Write-Host "❌ PHP failed" -ForegroundColor Red
        $failed++
        $results += "PHP: ❌ FAILED"
    }
} catch {
    Write-Host "❌ PHP not installed" -ForegroundColor Red
    $failed++
    $results += "PHP: ❌ NOT INSTALLED"
}

# Test 11: Swift
Write-Host "`n[11/17] Testing Swift..." -ForegroundColor Yellow
try {
    $output = swift test.swift 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $output -ForegroundColor Green
        $passed++
        $results += "Swift: ✅ PASSED"
    } else {
        Write-Host "❌ Swift failed" -ForegroundColor Red
        $failed++
        $results += "Swift: ❌ FAILED"
    }
} catch {
    Write-Host "❌ Swift not installed" -ForegroundColor Red
    $failed++
    $results += "Swift: ❌ NOT INSTALLED"
}

# Test 12: Kotlin
Write-Host "`n[12/17] Testing Kotlin..." -ForegroundColor Yellow
try {
    kotlinc test.kt -include-runtime -d test.jar 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $output = java -jar test.jar 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host $output -ForegroundColor Green
            $passed++
            $results += "Kotlin: ✅ PASSED"
        } else {
            Write-Host "❌ Kotlin execution failed" -ForegroundColor Red
            $failed++
            $results += "Kotlin: ❌ FAILED"
        }
    } else {
        Write-Host "❌ Kotlin compilation failed" -ForegroundColor Red
        $failed++
        $results += "Kotlin: ❌ FAILED"
    }
} catch {
    Write-Host "❌ Kotlin not installed" -ForegroundColor Red
    $failed++
    $results += "Kotlin: ❌ NOT INSTALLED"
}

# Test 13: R
Write-Host "`n[13/17] Testing R..." -ForegroundColor Yellow
try {
    $output = Rscript test.r 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $output -ForegroundColor Green
        $passed++
        $results += "R: ✅ PASSED"
    } else {
        Write-Host "❌ R failed" -ForegroundColor Red
        $failed++
        $results += "R: ❌ FAILED"
    }
} catch {
    Write-Host "❌ R not installed" -ForegroundColor Red
    $failed++
    $results += "R: ❌ NOT INSTALLED"
}

# Test 14: Perl
Write-Host "`n[14/17] Testing Perl..." -ForegroundColor Yellow
try {
    $output = perl test.pl 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $output -ForegroundColor Green
        $passed++
        $results += "Perl: ✅ PASSED"
    } else {
        Write-Host "❌ Perl failed" -ForegroundColor Red
        $failed++
        $results += "Perl: ❌ FAILED"
    }
} catch {
    Write-Host "❌ Perl not installed" -ForegroundColor Red
    $failed++
    $results += "Perl: ❌ NOT INSTALLED"
}

# Test 15: Bash
Write-Host "`n[15/17] Testing Bash..." -ForegroundColor Yellow
try {
    $output = bash test.sh 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $output -ForegroundColor Green
        $passed++
        $results += "Bash: ✅ PASSED"
    } else {
        Write-Host "❌ Bash failed" -ForegroundColor Red
        $failed++
        $results += "Bash: ❌ FAILED"
    }
} catch {
    Write-Host "❌ Bash not installed" -ForegroundColor Red
    $failed++
    $results += "Bash: ❌ NOT INSTALLED"
}

# Test 16: C#
Write-Host "`n[16/17] Testing C#..." -ForegroundColor Yellow
try {
    csc /out:test_cs.exe test.cs /nologo 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $output = .\test_cs.exe 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host $output -ForegroundColor Green
            $passed++
            $results += "C#: ✅ PASSED"
        } else {
            Write-Host "❌ C# execution failed" -ForegroundColor Red
            $failed++
            $results += "C#: ❌ FAILED"
        }
    } else {
        Write-Host "❌ C# compilation failed" -ForegroundColor Red
        $failed++
        $results += "C#: ❌ FAILED"
    }
} catch {
    Write-Host "❌ C# compiler not installed" -ForegroundColor Red
    $failed++
    $results += "C#: ❌ NOT INSTALLED"
}

# Test 17: Scala
Write-Host "`n[17/17] Testing Scala..." -ForegroundColor Yellow
try {
    scalac test.scala 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $output = scala Main 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host $output -ForegroundColor Green
            $passed++
            $results += "Scala: ✅ PASSED"
        } else {
            Write-Host "❌ Scala execution failed" -ForegroundColor Red
            $failed++
            $results += "Scala: ❌ FAILED"
        }
    } else {
        Write-Host "❌ Scala compilation failed" -ForegroundColor Red
        $failed++
        $results += "Scala: ❌ FAILED"
    }
} catch {
    Write-Host "❌ Scala not installed" -ForegroundColor Red
    $failed++
    $results += "Scala: ❌ NOT INSTALLED"
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    TEST RESULTS SUMMARY                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

foreach ($result in $results) {
    if ($result -match "✅ PASSED") {
        Write-Host $result -ForegroundColor Green
    } elseif ($result -match "❌ FAILED") {
        Write-Host $result -ForegroundColor Red
    } else {
        Write-Host $result -ForegroundColor Yellow
    }
}

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Total: 17 languages  |  Passed: $passed  |  Failed: $failed" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$percentage = [math]::Round(($passed / 17) * 100, 1)
Write-Host "Success Rate: $percentage%" -ForegroundColor $(if ($percentage -ge 75) { "Green" } elseif ($percentage -ge 50) { "Yellow" } else { "Red" })

# Cleanup
Write-Host "`nCleaning up compiled files..." -ForegroundColor Gray
Remove-Item -ErrorAction SilentlyContinue *.class, *.exe, *.jar, Main.class

Write-Host "`n✨ Test complete! Check above for details.`n" -ForegroundColor Cyan
