"""Test script to verify all imports work correctly"""

print("Testing imports...")

try:
    print("1. Testing main imports...")
    from fastapi import FastAPI, Request
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from datetime import datetime
    print("✓ Main imports successful")
    
    print("\n2. Testing API imports...")
    from app.api import interviews, questions, chat, code
    print("✓ API imports successful")
    
    print("\n3. Testing code executor...")
    from app.services.code_executor import code_executor
    print("✓ Code executor import successful")
    
    print("\n4. Testing code router...")
    print(f"Code router: {code.router}")
    print(f"Code router prefix: {code.router.prefix}")
    print("✓ Code router accessible")
    
    print("\n✅ All imports successful!")
    
except Exception as e:
    print(f"\n❌ Import failed: {e}")
    import traceback
    traceback.print_exc()
