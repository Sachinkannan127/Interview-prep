from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.middleware.auth import get_current_user
from app.services.code_executor import code_executor

router = APIRouter(prefix="/api/code", tags=["code"])

class ExecuteCodeRequest(BaseModel):
    code: str
    language: str
    input: str = ""

@router.post("/execute")
async def execute_code(request: ExecuteCodeRequest):
    """
    Execute code in specified language
    
    Supported languages:
    - python, javascript, typescript
    - java, cpp, c, csharp
    - go, rust, ruby, php
    - swift, kotlin, scala
    - r, perl, bash
    """
    try:
        result = code_executor.execute(
            code=request.code,
            language=request.language.lower(),
            input_data=request.input
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code execution failed: {str(e)}")

@router.get("/languages")
async def get_supported_languages():
    """Get list of supported programming languages"""
    return {
        "languages": [
            {
                "id": "python",
                "name": "Python",
                "version": "3.x",
                "extension": ".py"
            },
            {
                "id": "javascript",
                "name": "JavaScript",
                "version": "Node.js",
                "extension": ".js"
            },
            {
                "id": "typescript",
                "name": "TypeScript",
                "version": "ts-node",
                "extension": ".ts"
            },
            {
                "id": "java",
                "name": "Java",
                "version": "JDK 11+",
                "extension": ".java"
            },
            {
                "id": "cpp",
                "name": "C++",
                "version": "C++17",
                "extension": ".cpp"
            },
            {
                "id": "c",
                "name": "C",
                "version": "C11",
                "extension": ".c"
            },
            {
                "id": "go",
                "name": "Go",
                "version": "1.18+",
                "extension": ".go"
            },
            {
                "id": "rust",
                "name": "Rust",
                "version": "Latest",
                "extension": ".rs"
            },
            {
                "id": "ruby",
                "name": "Ruby",
                "version": "2.7+",
                "extension": ".rb"
            },
            {
                "id": "php",
                "name": "PHP",
                "version": "7.4+",
                "extension": ".php"
            },
            {
                "id": "swift",
                "name": "Swift",
                "version": "5.x",
                "extension": ".swift"
            },
            {
                "id": "kotlin",
                "name": "Kotlin",
                "version": "1.5+",
                "extension": ".kt"
            },
            {
                "id": "r",
                "name": "R",
                "version": "4.x",
                "extension": ".r"
            },
            {
                "id": "perl",
                "name": "Perl",
                "version": "5.x",
                "extension": ".pl"
            },
            {
                "id": "bash",
                "name": "Bash",
                "version": "4.x+",
                "extension": ".sh"
            },
            {
                "id": "csharp",
                "name": "C#",
                "version": ".NET 5+",
                "extension": ".cs"
            },
            {
                "id": "scala",
                "name": "Scala",
                "version": "2.13+",
                "extension": ".scala"
            }
        ]
    }
