import requests
import json

# Test 1: Chat Assistant
print("Testing AI Chat Assistant...")
try:
    response = requests.post(
        'http://localhost:8001/api/chat/assistant',
        json={'message': 'What are the top 3 behavioral interview questions?'},
        timeout=30
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Response: {data['response'][:200]}...")
        print("✅ Chat Assistant is working!")
    else:
        print(f"❌ Error: {response.text}")
except Exception as e:
    print(f"❌ Failed: {str(e)}")

print("\n" + "="*60 + "\n")

# Test 2: Resume Analyzer
print("Testing Resume Analyzer...")
try:
    # Create a test resume file
    test_resume = """
JOHN DOE
Software Engineer
john@email.com | (555) 123-4567

EXPERIENCE
Senior Developer at Tech Corp (2020-Present)
- Led team of 5 developers
- Built scalable microservices

EDUCATION
BS Computer Science, MIT, 2019

SKILLS
Python, JavaScript, React, AWS
"""
    
    files = {'resume': ('test_resume.txt', test_resume.encode(), 'text/plain')}
    response = requests.post(
        'http://localhost:8001/api/analyze-resume',
        files=files,
        timeout=30
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"ATS Score: {data.get('score', 'N/A')}")
        print(f"Strengths: {len(data.get('strengths', []))} found")
        print(f"Improvements: {len(data.get('improvements', []))} found")
        print("✅ Resume Analyzer is working!")
    else:
        print(f"❌ Error: {response.text}")
except Exception as e:
    print(f"❌ Failed: {str(e)}")

print("\n" + "="*60)
print("Testing complete!")
