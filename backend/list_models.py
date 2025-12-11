"""
List available Gemini models
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_key)

print("\n" + "="*75)
print("AVAILABLE GEMINI MODELS")
print("="*75 + "\n")

for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"Model: {model.name}")
        print(f"  Display Name: {model.display_name}")
        print(f"  Description: {model.description}")
        print(f"  Methods: {', '.join(model.supported_generation_methods)}")
        print()

print("="*75 + "\n")
