"""
Test script to verify Gemini API configuration and connectivity
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

print("\n" + "="*70)
print("GEMINI API TEST")
print("="*70)

# Check API key
api_key = os.getenv('GEMINI_API_KEY')
print(f"\n1. API Key Check:")
print(f"   - Present: {api_key is not None}")
print(f"   - Length: {len(api_key) if api_key else 0}")
print(f"   - First 10 chars: {api_key[:10] if api_key else 'N/A'}...")

if not api_key or api_key == 'your_gemini_api_key_here':
    print("\n❌ ERROR: API key is missing or not configured!")
    print("Please set GEMINI_API_KEY in your .env file")
    exit(1)

# Configure Gemini
try:
    print("\n2. Configuring Gemini API...")
    genai.configure(api_key=api_key)
    print("   ✅ Configuration successful")
except Exception as e:
    print(f"   ❌ Configuration failed: {e}")
    exit(1)

# Test with Flash model
try:
    print("\n3. Testing Gemini Flash model...")
    flash_model = genai.GenerativeModel('gemini-2.5-flash')
    print(f"   - Model created: {flash_model._model_name}")
    
    print("   - Sending test prompt...")
    test_prompt = "Say 'Hello, I am working!' in exactly those words."
    response = flash_model.generate_content(test_prompt)
    
    print(f"   - Response received!")
    print(f"   - Response type: {type(response)}")
    print(f"   - Has text: {hasattr(response, 'text')}")
    
    if hasattr(response, 'text'):
        print(f"   - Response text: {response.text}")
        print("   ✅ Flash model is working!")
    else:
        print(f"   ❌ Response has no text: {response}")
        
except Exception as e:
    print(f"   ❌ Flash model test failed:")
    print(f"   Error type: {type(e).__name__}")
    print(f"   Error message: {str(e)}")
    import traceback
    traceback.print_exc()

# Test with Pro model
try:
    print("\n4. Testing Gemini Pro model...")
    pro_model = genai.GenerativeModel('gemini-2.5-pro')
    print(f"   - Model created: {pro_model._model_name}")
    
    print("   - Sending test prompt...")
    test_prompt = "Respond with the number 42 only."
    response = pro_model.generate_content(test_prompt)
    
    print(f"   - Response received!")
    print(f"   - Response type: {type(response)}")
    print(f"   - Has text: {hasattr(response, 'text')}")
    
    if hasattr(response, 'text'):
        print(f"   - Response text: {response.text}")
        print("   ✅ Pro model is working!")
    else:
        print(f"   ❌ Response has no text: {response}")
        
except Exception as e:
    print(f"   ❌ Pro model test failed:")
    print(f"   Error type: {type(e).__name__}")
    print(f"   Error message: {str(e)}")
    import traceback
    traceback.print_exc()

# Test actual interview question generation
try:
    print("\n5. Testing interview question generation...")
    flash_model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = """You are an expert interviewer conducting a technical interview for a Software Engineer position at mid level.

Focus on React hooks, component lifecycle, state management, Redux, performance optimization

Generate the first interview question. Make it relevant, realistic, and appropriate for the difficulty level.

For technical interviews:
- Entry level: Focus on fundamental concepts, basic syntax, common patterns
- Mid level: Test practical experience, problem-solving, design decisions
- Senior level: Architecture, scalability, trade-offs, complex scenarios

Important guidelines:
1. Ask ONE clear, specific question
2. Make it conversational and professional
3. Ensure it's relevant to the role and difficulty level
4. Keep it concise (1-3 sentences)
5. For coding questions, specify language preference if applicable

Return ONLY the question text, nothing else."""

    print("   - Sending interview question prompt...")
    response = flash_model.generate_content(prompt)
    
    if hasattr(response, 'text'):
        question = response.text.strip()
        print(f"   - Generated question: {question}")
        print("   ✅ Interview question generation is working!")
    else:
        print(f"   ❌ No question generated")
        
except Exception as e:
    print(f"   ❌ Interview question generation failed:")
    print(f"   Error type: {type(e).__name__}")
    print(f"   Error message: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "="*70)
print("TEST COMPLETE")
print("="*70 + "\n")
