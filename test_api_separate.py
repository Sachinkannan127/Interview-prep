#!/usr/bin/env python3
import requests
import json
import sys
import os

# Add the backend directory to the path to avoid importing main
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

try:
    # Test the code execution API
    response = requests.post(
        'http://localhost:8001/api/code/execute',
        json={'language': 'python', 'code': 'print("Hello World")'},
        timeout=10
    )

    print(f'Status Code: {response.status_code}')
    print(f'Headers: {dict(response.headers)}')

    if response.status_code == 200:
        result = response.json()
        print('SUCCESS: Code execution API is working!')
        print(f'Output: {result.get("output", "No output")}')
        print(f'Execution time: {result.get("execution_time", "Unknown")}')
        print(f'Language: {result.get("language", "Unknown")}')
    else:
        print(f'Error Response: {response.text}')

except requests.exceptions.RequestException as e:
    print(f'Request failed: {e}')
except Exception as e:
    print(f'Unexpected error: {e}')