import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()

# Configure Gemini
api_key = os.getenv("GOOGLE_API_KEY")
model = None

def initialize_ai():
    global model
    if not api_key:
        print("AI Config: GOOGLE_API_KEY not found in environment.")
        return None
        
    try:
        genai.configure(api_key=api_key)
        
        # Get available models
        available_models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                available_models.append(m.name)
        
        print(f"AI Config: Available models: {available_models}")
        
        # Preferred models in order
        preferred = [
            'models/gemini-1.5-flash', 
            'models/gemini-1.5-flash-latest', 
            'models/gemini-2.0-flash-exp',
            'models/gemini-pro',
            'models/gemini-1.0-pro'
        ]
        
        selected_model = None
        for p in preferred:
            if p in available_models:
                selected_model = p
                break
        
        if not selected_model and available_models:
            selected_model = available_models[0]
            
        if selected_model:
            model_name = selected_model.replace('models/', '')
            model = genai.GenerativeModel(model_name)
            print(f"AI Config: Successfully loaded model {selected_model}")
            return model
        else:
            print("AI Config: No suitable models found.")
            return None
            
    except Exception as e:
        print(f"AI Config: Error initializing Gemini: {e}")
        # Fallback to a safe default name even if list_models failed
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            print("AI Config: Using fallback model gemini-1.5-flash")
            return model
        except:
            model = None
            return None

# Initial call
model = initialize_ai()

def translate_content(name, description, location, target_langs):
    """
    Translates product info into multiple languages using Gemini.
    target_langs: list of language codes e.g. ['hi', 'pa', 'mr', 'ta', 'te', 'bn']
    """
    if not model or not name:
        return {}
        
    try:
        prompt = f"""
        Translate the following product information into these languages: {', '.join(target_langs)}.
        Name: "{name}"
        Description: "{description}"
        Location: "{location}"
        
        Return ONLY a JSON object where keys are language codes and values are objects containing 'name', 'description', and 'location'.
        Example: {{"hi": {{"name": "...", "description": "...", "location": "..."}}, "pa": {{...}}}}
        """
        response = model.generate_content(prompt)
        text_resp = response.text
        if "```json" in text_resp:
            text_resp = text_resp.split("```json")[1].split("```")[0]
        elif "```" in text_resp:
            text_resp = text_resp.split("```")[1].split("```")[0]
            
        return json_safe_load(text_resp)
    except Exception as e:
        # Fixed NameError here (was using 'text' instead of 'text_resp')
        print(f"Translation error: {e}")
        return {}

def json_safe_load(text):
    try:
        return json.loads(text.strip())
    except:
        return {}
