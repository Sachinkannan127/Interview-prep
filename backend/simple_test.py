import requests
import json
import time

time.sleep(1)  # Wait for server to be ready

try:
    response = requests.post('http://localhost:8001/api/code/execute',
                           json={'language': 'python', 'code': 'print("Hello World")'},
                           timeout=10)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        result = response.json()
        print('SUCCESS: Code execution works!')
        print(f'Output: {result.get("output", "No output")}')
        print(f'Execution time: {result.get("execution_time", "Unknown")}')
    else:
        print(f'Error: {response.text}')
except Exception as e:
    print(f'Error: {str(e)}')