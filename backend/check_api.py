import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    available = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
    for model_full_name in available:
        model_name = model_full_name.replace('models/', '')
        try:
            print(f"Testing {model_name}...")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Hi")
            print(f"SUCCESS with {model_name}!")
            break
        except Exception as e:
            print(f"Failed {model_name}: {e}")
