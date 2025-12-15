import requests
import json

# Test the code execution API
test_payload = {
    "language": "python",
    "code": "print('Hello, World!')"
}

try:
    response = requests.post('http://localhost:8001/api/code/execute',
                           json=test_payload, timeout=10)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        result = response.json()
        print('Code execution successful!')
        print(f'Output: {result.get("output", "No output")}')
        print(f'Execution time: {result.get("execution_time", "Unknown")}')
        print(f'Language: {result.get("language", "Unknown")}')
    else:
        print(f'Error: {response.text}')
except Exception as e:
    print('Backend not responding:', str(e))