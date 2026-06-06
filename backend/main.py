import os
import io
from fastapi.staticfiles import StaticFiles
# Router moved down to avoid circular import with ai_config/model
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from PIL import Image
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Krishi Sarthi API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import model from ai_config
try:
    from ai_config import model
    print(f"Main API: AI Model status: {'Loaded' if model else 'Not Loaded'}")
except Exception as e:
    print(f"Main API: Failed to import AI model: {e}")
    model = None

os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Circular import fix (router is imported after app is defined)
from marketplace_api import router as marketplace_router
app.include_router(marketplace_router, prefix="/api/marketplace", tags=["marketplace"])

from community_api import router as community_router
app.include_router(community_router, prefix="/api/community", tags=["community"])

from auth_api import router as auth_router
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

class ChatMessage(BaseModel):
    message: str
    language: str = "en"
    history: List[dict] = []

@app.get("/")
async def root():
    return {
        "message": "Welcome to Krishi Sarthi API",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "chat": "/chat (POST)",
            "soil_analysis": "/analyze-soil (POST)",
            "crop_analysis": "/analyze-crop (POST)"
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/chat")
async def chat(data: ChatMessage):
    if not model:
        # Mock response if no API key
        return {"response": f"DEMO MODE: You said '{data.message}' in {data.language}. Please provide a GOOGLE_API_KEY for real AI responses."}
    
    try:
        prompt = f"You are Krishi Sarthi, an AI assistant for Indian farmers. Respond to the following message in {data.language} language. Keep the tone helpful, empathetic, and professional. Message: {data.message}"
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "quota" in error_msg.lower():
             return {"response": f"I've been helping many farmers today and reached my daily limit. Please try again tomorrow or in a few hours! (Error: Quota Exceeded)" if data.language == 'en' else f"मैंने आज कई किसानों की मदद की है और मेरी दैनिक सीमा समाप्त हो गई है। कृपया कल या कुछ घंटों में पुनः प्रयास करें! (त्रुटि: कोटा समाप्त)"}
        if "503" in error_msg or "UNAVAILABLE" in error_msg or "MODEL_CAPACITY_EXHAUSTED" in error_msg:
             return {"response": f"Server is very busy right now helping other farmers. Please try again in 1 minute." if data.language == 'en' else f"सर्वर अभी बहुत व्यस्त है। कृपया 1 मिनट में पुनः प्रयास करें।"}
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/mandi-prices")
async def get_mandi_prices(language: str = "en"):
    data = {
        "en": [
            {"crop": "Wheat (Kanak)", "price": 2125, "unit": "quintal", "change": "+₹15", "location": "Khanna, Punjab"},
            {"crop": "Rice (Basmati)", "price": 4350, "unit": "quintal", "change": "-₹20", "location": "Karnal, Haryana"},
            {"crop": "Mustard (Sarson)", "price": 5450, "unit": "quintal", "change": "+₹110", "location": "Alwar, Rajasthan"},
            {"crop": "Cotton (Narma)", "price": 7200, "unit": "quintal", "change": "+₹45", "location": "Sirsa, Haryana"},
            {"crop": "Onion", "price": 1800, "unit": "quintal", "change": "0", "location": "Nashik, Maharashtra"}
        ],
        "hi": [
            {"crop": "गेहूं (कनक)", "price": 2125, "unit": "क्विंटल", "change": "+₹15", "location": "खन्ना, पंजाब"},
            {"crop": "चावल (बासमती)", "price": 4350, "unit": "क्विंटल", "change": "-₹20", "location": "करनाल, हरियाणा"},
            {"crop": "सरसों", "price": 5450, "unit": "क्विंटल", "change": "+₹110", "location": "अलवर, राजस्थान"},
            {"crop": "कपास (नरमा)", "price": 7200, "unit": "क्विंटल", "change": "+₹45", "location": "सिरसा, हरियाणा"},
            {"crop": "प्याज", "price": 1800, "unit": "क्विंटल", "change": "0", "location": "नाशिक, महाराष्ट्र"}
        ],
        "pa": [
            {"crop": "ਕਣਕ", "price": 2125, "unit": "קוויੰਟਲ", "change": "+₹15", "location": "ਖੰਨਾ, ਪੰਜਾਬ"},
            {"crop": "ਝੋਨਾ (ਬਾਸਮਤੀ)", "price": 4350, "unit": "קוויੰਟਲ", "change": "-₹20", "location": "ਕਰਨਾਲ, ਹਰਿਆਣਾ"},
            {"crop": "ਸਰ੍ਹੋਂ", "price": 5450, "unit": "קוויੰਟਲ", "change": "+₹110", "location": "अलवर, ਰਾਜਸਥਾਨ"},
            {"crop": "ਨਰਮਾ (ਕਪਾਹ)", "price": 7200, "unit": "קוויੰਟਲ", "change": "+₹45", "location": "ਸਿਰਸਾ, ਹਰਿਆਣਾ"},
            {"crop": "ਪਿਆਜ਼", "price": 1800, "unit": "קוויੰਟਲ", "change": "0", "location": "ਨਾਸਿਕ, ਮਹਾਰਾਸ਼ਟਰ"}
        ],
        "ta": [
            {"crop": "கோதுமை", "price": 2125, "unit": "குவிண்டால்", "change": "+₹15", "location": "பஞ்சாப்"},
            {"crop": "அரிசி (பாசுமதி)", "price": 4350, "unit": "குவிண்டால்", "change": "-₹20", "location": "ஹரியானா"},
            {"crop": "கடுகு", "price": 5450, "unit": "குவிண்டால்", "change": "+₹110", "location": "ராஜஸ்தான்"},
            {"crop": "பருத்தி", "price": 7200, "unit": "குவிண்டால்", "change": "+₹45", "location": "ஹரியானா"},
            {"crop": "வெங்காயம்", "price": 1800, "unit": "குவிண்டால்", "change": "0", "location": "நாசிக்"}
        ],
        "te": [
            {"crop": "గోధుమలు", "price": 2125, "unit": "క్వింటాల్", "change": "+₹15", "location": "ఖన్నా, పంజాబ్"},
            {"crop": "వరి (బాస్మతి)", "price": 4350, "unit": "క్వింటాల్", "change": "-₹20", "location": "కర్నాల్, హర్యానా"},
            {"crop": "ఆవాలు", "price": 5450, "unit": "క్వింటాల్", "change": "+₹110", "location": "అల్వార్, రాజస్థాన్"},
            {"crop": "ప్రత్తి", "price": 7200, "unit": "క్వింటాల్", "change": "+₹45", "location": "సిర్సా, హర్యానా"},
            {"crop": "ఉల్లిపాయ", "price": 1800, "unit": "క్వింటాల్", "change": "0", "location": "నాసిక్, మహారాష్ట్ర"}
        ],
        "mr": [
            {"crop": "गहू", "price": 2125, "unit": "क्विंटल", "change": "+₹15", "location": "खन्ना, पंजाब"},
            {"crop": "तांदूळ (बासमती)", "price": 4350, "unit": "क्विंटल", "change": "-₹20", "location": "कर्नाल, हरियाणा"},
            {"crop": "मोहरी", "price": 5450, "unit": "क्विंटल", "change": "+₹110", "location": "अलवर, राजस्थान"},
            {"crop": "कापूस", "price": 7200, "unit": "क्विंटल", "change": "+₹45", "location": "सिरसा, हरियाणा"},
            {"crop": "कांदा", "price": 1800, "unit": "क्विंटल", "change": "0", "location": "नाशिक, महाराष्ट्र"}
        ],
        "bn": [
            {"crop": "গম", "price": 2125, "unit": "কুইন্টাল", "change": "+₹15", "location": "খান্না, পাঞ্জাব"},
            {"crop": "চাল (বাসমতী)", "price": 4350, "unit": "কুইন্টাল", "change": "-₹20", "location": "কারনাল, হরিয়ানা"},
            {"crop": "সরিষা", "price": 5450, "unit": "কুইন্টাল", "change": "+₹110", "location": "আলওয়ার, রাজস্থান"},
            {"crop": "তুলা", "price": 7200, "unit": "কুইন্টাল", "change": "+₹45", "location": "সিরসা, হরিয়ানা"},
            {"crop": "পেঁয়াজ", "price": 1800, "unit": "কুইন্টাল", "change": "0", "location": "নাসিক, মহারাষ্ট্র"}
        ]
    }
    return data.get(language, data["en"])

@app.get("/gov-schemes")
async def get_schemes(language: str = "en"):
    schemes = {
        "en": [
            {"title": "PM-KISAN", "benefit": "₹6000/year to all landholding farmer families.", "link": "https://pmkisan.gov.in/"},
            {"title": "PM Fasal Bima Yojana", "benefit": "Crop insurance against natural calamities.", "link": "https://pmfby.gov.in/"},
            {"title": "Kisan Credit Card (KCC)", "benefit": "Low-interest loans for farming equipment and seeds.", "link": "#"}
        ],
        "hi": [
            {"title": "पीएम-किसान", "benefit": "सभी भूमिधारक किसान परिवारों को ₹6000/वर्ष।", "link": "https://pmkisan.gov.in/"},
            {"title": "पीएम फसल बीमा योजना", "benefit": "प्राकृतिक आपदाओं के खिलाफ फसल बीमा।", "link": "https://pmfby.gov.in/"},
            {"title": "किसान क्रेडिट कार्ड (KCC)", "benefit": "खेती के उपकरणों और बीजों के लिए कम ब्याज वाला ऋण।", "link": "#"}
        ]
    }
    return schemes.get(language, schemes["en"])

@app.get("/marketplace")
async def get_marketplace_items(language: str = "en"):
    items = {
        "en": [
            {"id": 1, "type": "equipment", "name": "Used Tractor (2018)", "price": 450000, "original_price": 600000, "category": "Equipments", "seller": "Ramesh Kumar", "verified": True, "location": "Ludhiana, Punjab", "image": "🚜"},
            {"id": 2, "type": "seeds", "name": "Premium Wheat Seeds (10kg)", "price": 1200, "original_price": 1500, "category": "Seeds", "seller": "AgriCo Seeds", "verified": True, "location": "Online Delivery", "image": "🌾"},
            {"id": 3, "type": "fertilizer", "name": "Organic Compost 50kg", "price": 800, "original_price": 950, "category": "Fertilizers", "seller": "GreenFarm", "verified": True, "location": "Online Delivery", "image": "🌱"},
            {"id": 4, "type": "equipment", "name": "Water Pump 2HP", "price": 4500, "original_price": 5200, "category": "Equipments", "seller": "Suresh Singh", "verified": False, "location": "Karnal, Haryana", "image": "💧"},
            {"id": 5, "type": "pesticide", "name": "Neem Oil Bio-Pesticide 1L", "price": 400, "original_price": 500, "category": "Pesticides", "seller": "EcoProtect", "verified": True, "location": "Online Delivery", "image": "🛡️"},
        ],
        "hi": [
            {"id": 1, "type": "equipment", "name": "पुराना ट्रैक्टर (2018)", "price": 450000, "original_price": 600000, "category": "उपकरण", "seller": "रमेश कुमार", "verified": True, "location": "लुधियाना, पंजाब", "image": "🚜"},
            {"id": 2, "type": "seeds", "name": "प्रीमियम गेहूं के बीज (10kg)", "price": 1200, "original_price": 1500, "category": "बीज", "seller": "AgriCo Seeds", "verified": True, "location": "ऑनलाइन डिलीवरी", "image": "🌾"},
            {"id": 3, "type": "fertilizer", "name": "जैविक खाद 50kg", "price": 800, "original_price": 950, "category": "उर्वरक", "seller": "GreenFarm", "verified": True, "location": "ऑनलाइन डिलीवरी", "image": "🌱"},
            {"id": 4, "type": "equipment", "name": "वाटर पंप 2HP", "price": 4500, "original_price": 5200, "category": "उपकरण", "seller": "सुरेश सिंह", "verified": False, "location": "करनाल, हरियाणा", "image": "💧"},
            {"id": 5, "type": "pesticide", "name": "नीम का तेल जैविक कीटनाशक 1L", "price": 400, "original_price": 500, "category": "कीटनाशक", "seller": "EcoProtect", "verified": True, "location": "ऑनलाइन डिलीवरी", "image": "🛡️"},
        ]
    }
    return items.get(language, items["en"])

@app.post("/analyze-soil")
async def analyze_soil(
    image: Optional[UploadFile] = File(None),
    report_text: Optional[str] = Form(None),
    language: str = Form("en")
):
    if not model:
        return {
            "crop": "Rice/Wheat (Demo)",
            "suggestions": [
                "Improve nitrogen levels",
                "Maintain soil moisture",
                "Use organic compost",
                "Crop rotation every season"
            ],
            "details": "DEMO MODE: Soil analysis requires a GOOGLE_API_KEY."
        }

    try:
        prompt = f"""
        As an Indian agricultural expert, analyze this soil information (image or health card data).
        Provide:
        1. Best candidates for crops based on soil quality.
        2. Fertilizer recommendations based on NPK/pH if available.
        3. Sustainable farming suggestions.
        4. Soil health improvement tips.
        
        Respond in {language} language. Use a helpful and professional tone.
        Format the response with clear headings.
        """
        
        contents = [prompt]
        if report_text:
            contents.append(f"Soil Report Data: {report_text}")
        
        if image:
            img_bytes = await image.read()
            img = Image.open(io.BytesIO(img_bytes))
            contents.append(img)
            
        response = model.generate_content(contents)
        # We can parse the response or just return the text
        return {"analysis": response.text}
        
    except Exception as e:
        import traceback
        print(f"SOIL ANALYSIS ERROR: {e}")
        traceback.print_exc()
        error_msg = str(e)
        if "429" in error_msg or "quota" in error_msg.lower():
             return {
                "analysis": "AI Lab limit reached for today. General Tip: Ensure your soil has balanced NPK levels and good organic matter. Please try again tomorrow for a detailed analysis."
             }
        if "503" in error_msg or "UNAVAILABLE" in error_msg or "MODEL_CAPACITY_EXHAUSTED" in error_msg:
             return {
                "analysis": "AI Lab is at full capacity. Here is a general recommendation: For most Indian soils, use organic manure and ensure proper drainage. Please try again later for a detailed photo analysis."
             }
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/analyze-crop")
async def analyze_crop(
    image: Optional[UploadFile] = File(None),
    description: Optional[str] = Form(None),
    language: str = Form("en")
):
    if not model:
        return {
            "analysis": "DEMO MODE: Crop analysis requires an active AI model. Please check your API key."
        }

    try:
        prompt = f"""
        As an Indian plant pathologist and agricultural expert, analyze this crop image/description.
        Provide:
        1. Disease Identification: Name the disease or pest if visible.
        2. Treatment: Suggest specific organic and chemical fertilizers or pesticides.
        3. Seasonal Guidance: Provide guidance for the current season.
        4. Irrigation: Recommend a suitable irrigation schedule.
        5. Prevention: Tips to avoid future outbreaks.
        
        Respond in {language} language. Use clear, actionable steps for a farmer.
        Format the response with clear headings.
        """
        
        contents = [prompt]
        if description:
            contents.append(f"Farmer's Description: {description}")
        
        if image:
            img_bytes = await image.read()
            img = Image.open(io.BytesIO(img_bytes))
            contents.append(img)
            
        response = model.generate_content(contents)
        return {"analysis": response.text}
        
    except Exception as e:
        import traceback
        print(f"CROP ANALYSIS ERROR: {e}")
        traceback.print_exc()
        error_msg = str(e)
        if "429" in error_msg or "quota" in error_msg.lower():
             return {
                "analysis": "AI Expert limit reached for today. General Tip: Ensure proper spacing between crops and remove affected leaves. Please try again tomorrow."
             }
        if "503" in error_msg or "UNAVAILABLE" in error_msg or "MODEL_CAPACITY_EXHAUSTED" in error_msg:
             return {
                "analysis": "AI Expert is at full capacity. Please check your crop for signs of overwatering or fungal growth. Try again in 1 minute."
             }
        raise HTTPException(status_code=500, detail=error_msg)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
