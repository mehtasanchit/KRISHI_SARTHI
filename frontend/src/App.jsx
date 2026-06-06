import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  MessageCircle,
  Sprout,
  CloudSun,
  BarChart3,
  Languages,
  Upload,
  Send,
  Loader2,
  CheckCircle2,
  Info,
  Droplets,
  Wind,
  MapPin,
  Store,
  BadgeCheck,
  ShoppingCart,
  BookOpen,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import Marketplace from './Marketplace';
import FarmerLearningHub from './FarmerLearningHub';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const I18N = {
  en: {
    title: "Krishi Sarthi",
    subtitle: "Your AI Companion for Intelligent and Sustainable Farming.",
    home: "Home",
    analysis: "Analysis",
    assistant: "Assistant",
    analyzeSoil: "Soil Analysis",
    chatSupport: "AI Chat Support",
    weather: "Weather Insights",
    mandi: "Mandi Rates",
    ecoTips: "Eco-Tips",
    sustainableGuide: "Sustainable Farming Guide",
    waterConserve: "Water Conservation",
    organicFert: "Organic Fertilisers",
    chatPlaceholder: "Type your question...",
    soilLab: "Soil Lab",
    cropDoctor: "Crop Doctor",
    uploadSoil: "Upload Soil Card/Image",
    uploadCrop: "Upload Crop Image",
    analyzeCrop: "Analyze Crop Health",
    uploadText: "Click to upload or drag image",
    getRecommendation: "Get AI Recommendation",
    expertAnalysis: "Expert Analysis",
    analyzeAnother: "Analyze Another Sample",
    weatherDesc: "Clear skies expected for the next 48 hours. Ideal for pesticide application.",
    mandiDesc: "Local prices for Wheat and Rice are trending up today.",
    cropDoctorDesc: "Detect diseases and get treatment advice instantly.",
    schemesDesc: "Check your eligibility for latest farming subsidies and aid.",
    waterConserveDesc: "Use mulch to retain soil moisture and reduce evaporation.",
    organicFertDesc: "Learn how to make Vermicompost using farm waste.",
    govSchemes: "Govt. Schemes",
    integratedSolution: "Integrated Agricultural Solution for Indian Farmers",
    marketplace: "Marketplace",
    community: "Community",
    diagnosisAdvice: "Diagnosis & Advice",
    market: "Market",
    schemes: "Schemes",
    viewDetails: "View Details",
    analyzingHealth: "Analyzing Health...",
    soilManual: "Enter Soil Data Manually",
    soilUpload: "Upload Soil Image/Card",
    nitrogen: "Nitrogen (N)",
    phosphorus: "Phosphorus (P)",
    potassium: "Potassium (K)",
    pH: "pH Level",
    moisture: "Moisture (%)",
    organicMatter: "Organic Matter (%)",
    manualEntry: "Manual Entry",
    weatherInsights: "Weather Insights",
    temperature: "Temperature",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    precip: "Precipitation",
    forecast: "7-Day Forecast",
    idealFor: "Ideal for:",
    pesticides: "Pesticide Spray",
    irrigation: "Irrigation",
    harvesting: "Harvesting",
    marketplaceDesc: "Buy or sell equipment, seeds, and fertilizers with verified sellers.",
    buyNow: "Buy Now",
    contactSeller: "Contact",
    originalPrice: "Original Price:",
    verifiedSeller: "Verified Seller",
    learningMenu: "Learning Hub",
    learningDesc: "Access videos, guides, and expert Q&A tailored for your region."
  },
  hi: {
    title: "कृषि सारथी",
    subtitle: "बुद्धिमान और टिकाऊ खेती के लिए आपका AI साथी।",
    home: "मुख्य पृष्ठ",
    analysis: "मिट्टी परीक्षण",
    assistant: "सहायक",
    analyzeSoil: "मिट्टी जांच",
    chatSupport: "AI चैट सहायता",
    weather: "मौसम की जानकारी",
    mandi: "मंडी भाव",
    ecoTips: "पारिस्थितिकी युक्तियाँ",
    sustainableGuide: "टिकाऊ खेती मार्गदर्शिका",
    waterConserve: "जल संरक्षण",
    organicFert: "जैविक उर्वरक",
    chatPlaceholder: "अपना प्रश्न पूछें...",
    soilLab: "मृदा प्रयोगशाला",
    cropDoctor: "फसल डॉक्टर",
    uploadSoil: "मृदा कार्ड/छवि अपलोड करें",
    uploadCrop: "फसल की छवि अपलोड करें",
    analyzeCrop: "फसल स्वास्थ्य की जांच करें",
    uploadText: "छवि अपलोड करने के लिए क्लिक करें",
    getRecommendation: "AI सिफारिश प्राप्त करें",
    expertAnalysis: "विशेषज्ञ विश्लेषण",
    analyzeAnother: "दूसरा नमूना जांचें",
    weatherDesc: "अगले 48 घंटों में आसमान साफ रहने की उम्मीद है। कीटनाशकों के छिड़काव के लिए आदर्श समय।",
    mandiDesc: "गेहूं और चावल के स्थानीय भाव आज बढ़ रहे हैं।",
    cropDoctorDesc: "रोगों का पता लगाएं और तुरंत उपचार की सलाह लें।",
    schemesDesc: "नवीनतम कृषि सब्सिडी और सहायता के लिए अपनी पात्रता जांचें।",
    waterConserveDesc: "मिट्टी की नमी बनाए रखने और वाष्पीकरण कम करने के लिए मल्च का उपयोग करें।",
    organicFertDesc: "खेत के कचरे का उपयोग करके वर्मीकम्पोस्ट बनाना सीखें।",
    govSchemes: "सरकारी योजनाएं",
    integratedSolution: "भारतीय किसानों के लिए एकीकृत कृषि समाधान",
    marketplace: "बाज़ार",
    community: "समुदाय",
    diagnosisAdvice: "निदान और सलाह",
    market: "मंडी",
    schemes: "योजनाएं",
    viewDetails: "विवरण देखें",
    analyzingHealth: "स्वास्थ्य की जांच हो रही है...",
    soilManual: "मिट्टी का डेटा मैन्युअल रूप से दर्ज करें",
    soilUpload: "मिट्टी की छवि/कार्ड अपलोड करें",
    nitrogen: "नाइट्रोजन (N)",
    phosphorus: "फास्फोरस (P)",
    potassium: "पोटेशियम (K)",
    pH: "pH स्तर",
    moisture: "नमी (%)",
    organicMatter: "कार्बनिक पदार्थ (%)",
    manualEntry: "मैन्युअल प्रविष्टि",
    weatherInsights: "मौसम अंतर्दृष्टि",
    temperature: "तापमान",
    humidity: "नमी",
    windSpeed: "हवा की गति",
    precip: "वर्षा",
    forecast: "7 दिनों का पूर्वानुमान",
    idealFor: "इसके लिए आदर्श:",
    pesticides: "कीटनाशक छिड़काव",
    irrigation: "सिंचाई",
    harvesting: "कटाई",
    marketplaceDesc: "सत्यापित विक्रेताओं के साथ उपकरण, बीज और उर्वरक खरीदें या बेचें।",
    buyNow: "खरीदें",
    contactSeller: "संपर्क",
    originalPrice: "मूल मूल्य:",
    verifiedSeller: "सत्यापित विक्रेता",
    learningMenu: "शिक्षण केंद्र",
    learningDesc: "अपने क्षेत्र के लिए अनुकूलित वीडियो, गाइड और विशेषज्ञ प्रश्नोत्तर देखें।"
  },
  pa: {
    title: "ਕ੍ਰਿਸ਼ੀ ਸਾਰਥੀ",
    subtitle: "ਬੁੱਧੀਮਾਨ ਅਤੇ ਟਿਕਾਊ ਖੇਤੀ ਲਈ ਤੁਹਾਡਾ AI ਸਾਥੀ।",
    home: "ਮੁੱਖ ਪੰਨਾ",
    analysis: "ਮਿੱਟੀ ਦੀ ਜਾਂਚ",
    assistant: "ਸਹਾਇਕ",
    analyzeSoil: "ਮਿੱਟੀ ਵਿਸ਼ਲੇਸ਼ਣ",
    chatSupport: "AI ਚੈਟ ਸਹਾਇਤਾ",
    weather: "ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ",
    mandi: "ਮੰਡੀ ਦੇ ਭਾਅ",
    ecoTips: "ਖੇਤੀ ਸੁਝਾਅ",
    sustainableGuide: "ਟਿਕਾਊ ਖੇਤੀ ਮਾਰਗਦਰਸ਼ਕ",
    waterConserve: "ਪਾਣੀ ਦੀ ਬਚਤ",
    organicFert: "ਜੈਵਿਕ ਖਾਦਾਂ",
    chatPlaceholder: "ਆਪਣਾ ਸਵਾਲ ਪੁੱਛੋ...",
    soilLab: "ਮਿੱਟੀ ਪ੍ਰਯੋਗਸ਼ਾਲਾ",
    uploadText: "ਮਿੱਟੀ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ",
    getRecommendation: "AI ਸਿਫਾਰਸ਼ ਪ੍ਰਾਪਤ ਕਰੋ",
    expertAnalysis: "ਮਾਹਰ ਵਿਸ਼ਲੇਸ਼ਣ",
    analyzeAnother: "ਹੋਰ ਨਮੂਨਾ ਜਾਂਚੋ",
    cropDoctor: "ਫਸਲ ਡਾਕਟਰ",
    uploadSoil: "ਮਿੱਟੀ ਕਾਰਡ/ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
    uploadCrop: "ਫਸਲ ਦੀ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
    analyzeCrop: "ਫਸਲ ਦੀ ਸਿਹਤ ਦੀ ਜਾਂਚ ਕਰੋ",
    weatherDesc: "ਅਗਲੇ 48 ਘੰਟਿਆਂ ਵਿੱਚ ਅਸਮਾਨ ਸਾਫ ਰਹਿਣ ਦੀ ਉਮੀਦ ਹੈ। ਕੀਟਨਾਸ਼ਕਾਂ ਦੇ ਛਿੜਕਾਅ ਲਈ ਸਹੀ ਸਮਾਂ।",
    mandiDesc: "ਕਣਕ ਅਤੇ ਚੌਲਾਂ ਦੇ ਸਥਾਨਕ ਭਾਅ ਅੱਜ ਵਧ ਰਹੇ ਹਨ।",
    cropDoctorDesc: "ਬਿਮਾਰੀਆਂ ਦਾ ਪਤਾ ਲਗਾਓ ਅਤੇ ਤੁਰੰਤ ਇਲਾਜ ਦੀ ਸਲਾਹ ਲਓ।",
    schemesDesc: "ਨਵੀਨਤਮ ਖੇਤੀ ਸਬਸਿਡੀ ਅਤੇ ਸਹਾਇਤਾ ਲਈ ਆਪਣੀ ਯੋਗਤਾ ਦੀ ਜਾਂਚ ਕਰੋ।",
    waterConserveDesc: "ਮਿੱਟੀ ਦੀ ਨਮੀ ਬਣਾਈ ਰੱਖਣ ਲਈ ਮਲਚ ਦੀ ਵਰਤੋਂ ਕਰੋ।",
    organicFertDesc: "ਖੇਤ ਦੀ ਰਹਿੰਦ-ਖੂੰਹਦ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਵਰਮੀਕੰਪੋਸਟ ਬਣਾਉਣਾ ਸਿੱਖੋ।",
    govSchemes: "ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ",
    integratedSolution: "ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਲਈ ਏਕੀਕ੍ਰਿਤ ਖੇਤੀਬਾੜੀ ਹੱਲ",
    marketplace: "ਮਾਰਕੀਟਪਲੇਸ",
    community: "ਭਾਈਚਾਰਾ",
    diagnosisAdvice: "ਨਿਦਾਨ ਅਤੇ ਸਲਾਹ",
    market: "ਮੰਡੀ",
    schemes: "ਯੋਜਨਾਵਾਂ",
    viewDetails: "ਵੇਰਵੇ ਦੇਖੋ",
    analyzingHealth: "ਸਿਹਤ ਦੀ ਜਾਂਚ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...",
    learningMenu: "ਸਿੱਖਿਆ ਕੇਂਦਰ",
    learningDesc: "ਆਪਣੇ ਖੇਤਰ ਲਈ ਬਣਾਏ ਗਏ ਵੀਡੀਓ, ਗਾਈਡ ਅਤੇ ਮਾਹਰ ਪ੍ਰਸ਼্নੋਤਰ ਤੱਕ ਪਹੁੰਚ ਕਰੋ।"
  },
  ta: {
    title: "கிருஷி சாரதி",
    subtitle: "புத்திசாலித்தனமான மற்றும் நிலையான விவசாயத்திற்கான உங்கள் AI துணை.",
    home: "முகப்பு",
    analysis: "மண் பரிசோதனை",
    assistant: "உதவி",
    analyzeSoil: "மண் பகுப்பாய்வு",
    chatSupport: "AI சாட் உதவி",
    weather: "வானிலை தகவல்",
    mandi: "மண்டி விலை",
    ecoTips: "சுற்றுச்சூழல் குறிப்புகள்",
    sustainableGuide: "நிலையான விவசாய வழிகாட்டி",
    waterConserve: "நீர் பாதுகாப்பு",
    organicFert: "இயற்கை உரங்கள்",
    chatPlaceholder: "உங்கள் கேள்வியைத் தட்டச்சு செய்யவும்...",
    soilLab: "மண் ஆய்வகம்",
    cropDoctor: "பயிர் டாக்டர்",
    uploadSoil: "மண் அட்டை/படத்தைப் பதிவேற்றவும்",
    uploadCrop: "பயிர் படத்தைப் பதிவேற்றவும்",
    analyzeCrop: "பயிர் ஆரோக்கியத்தை பகுப்பாய்வு செய்யவும்",
    uploadText: "பதிவேற்ற கிளிக் செய்யவும் அல்லது படத்தை இழுக்கவும்",
    getRecommendation: "AI பரிந்துரையைப் பெறுங்கள்",
    expertAnalysis: "நிபுணர் பகுப்பாய்வு",
    analyzeAnother: "மற்றொரு மாதிரியை பகுப்பாய்வு செய்யவும்",
    weatherDesc: "அடுத்த 48 மணிநேரத்திற்கு வானம் தெளிவாக இருக்கும் என்று எதிர்பார்க்கப்படுகிறது.",
    mandiDesc: "கோதுமை மற்றும் அரிசி விலைகள் இன்று அதிகரித்து வருகின்றன.",
    cropDoctorDesc: "நோய்களைக் கண்டறிந்து உடனடியாக சிகிச்சை ஆலோசனைகளைப் பெறுங்கள்.",
    schemesDesc: "சமீபத்திய விவசாய மானியங்களுக்கான உங்கள் தகுதியைச் சரிபார்க்கவும்.",
    waterConserveDesc: "மண் ஈரப்பதத்தைத் தக்கவைக்க தழைக்கூளம் பயன்படுத்தவும்.",
    organicFertDesc: "பண்ணைக் கழிவுகளைப் பயன்படுத்தி மண்புழு உரம் தயாரிக்கக் கற்றுக்கொள்ளுங்கள்.",
    govSchemes: "அரசு திட்டங்கள்",
    integratedSolution: "இந்திய விவசாயிகளுக்கான ஒருங்கிணைந்த விவசாய தீர்வு",
    marketplace: "சந்தை",
    community: "சமூகம்",
    diagnosisAdvice: "நோய் கண்டறிதல் மற்றும் ஆலோசனை",
    market: "சந்தை",
    schemes: "திட்டங்கள்",
    viewDetails: "விவரங்களைக் காண்க",
    analyzingHealth: "ஆரோக்கியத்தை பகுப்பாய்வு செய்கிறது...",
    learningMenu: "கற்றல் மையம்",
    learningDesc: "உங்கள் பகுதிக்கான வீடியோக்கள், வழிகாட்டிகள் மற்றும் நிபுணர் கேள்வி-பதில்களை அணுகவும்."
  },
  te: {
    title: "కృషి సారథి",
    subtitle: "తెలివైన మరియు స్థిరమైన వ్యవసాయం కోసం మీ AI సహచరుడు.",
    home: "హోమ్",
    analysis: "నేల పరీక్ష",
    assistant: "సహాయం",
    analyzeSoil: "నేల విశ్లేషణ",
    chatSupport: "AI చాట్ సహాయం",
    weather: "వాతావరణ సమాచారం",
    mandi: "మండి ధరలు",
    ecoTips: "పర్యావరణ చిట్కాలు",
    sustainableGuide: "స్థిరమైన వ్యవసాయ గైడ్",
    waterConserve: "నీటి సంరక్షణ",
    organicFert: "సేంద్రియ ఎరువులు",
    chatPlaceholder: "మీ ప్రశ్నను టైప్ చేయండి...",
    soilLab: "నేల ల్యాబ్",
    cropDoctor: "క్రాప్ డాక్టర్",
    uploadSoil: "నేల కార్డు/చిత్రాన్ని అప్‌లోడ్ చేయండి",
    uploadCrop: "పంట చిత్రాన్ని అప్‌లోడ్ చేయండి",
    analyzeCrop: "పంట ఆరోగ్యాన్ని విశ్లేషించండి",
    uploadText: "అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి లేదా చిత్రాన్ని లాగండి",
    getRecommendation: "AI సిఫార్సును పొందండి",
    expertAnalysis: "నిపుణుల విశ్లేషణ",
    analyzeAnother: "మరో నమూనాను విశ్లేషించండి",
    weatherDesc: "తదుపరి 48 గంటల పాటు ఆకాశం నిర్మలంగా ఉంటుంది.",
    mandiDesc: "నేడు గోధుమలు మరియు బియ్యం ధరలు పెరుగుతున్నాయి.",
    cropDoctorDesc: "వ్యాధులను గుర్తించి, తక్షణ చికిత్స సలహాలను పొందండి.",
    schemesDesc: "తాజా వ్యవసాయ సబ్సిడీల కోసం మీ అర్హతను తనిఖీ చేయండి.",
    waterConserveDesc: "నేల తేమను నిలుపుకోవడానికి మల్చింగ్ ఉపయోగించండి.",
    organicFertDesc: "వ్యవసాయ వ్యర్థాలను ఉపయోగించి వర్మీ కంపోస్ట్ తయారు చేయడం నేర్చుకోండి.",
    govSchemes: "ప్రభుత్వ పథకాలు",
    integratedSolution: "భారతీయ రైతుల కోసం సమగ్ర వ్యవసాయ పరిష్కாரம்",
    marketplace: "మార్కెట్",
    community: "కమ్యూనిటీ",
    diagnosisAdvice: "వ్యాధి నిర్ధారణ మరియు సలహా",
    market: "మార్కెట్",
    schemes: "పథకాలు",
    viewDetails: "వివరాలను చూడండి",
    analyzingHealth: "ఆరోగ్యాన్ని విశ్లేషిస్తోంది...",
    learningMenu: "అభ్యాస కేంద్రం",
    learningDesc: "మీ ప్రాంతం కోసం రూపొందించిన వీడియోలు, గైడ్‌లు మరియు నిపుణుల ప్రశ్నోత్తరాలను యాక్సెస్ చేయండి."
  },
  mr: {
    title: "कृषी सारथी",
    subtitle: "बुद्धिमान आणि शाश्वत शेतीसाठी तुमचा AI साथीदार.",
    home: "होम",
    analysis: "माती परीक्षण",
    assistant: "मदत",
    analyzeSoil: "माती विश्लेषण",
    chatSupport: "AI चॅट सपोर्ट",
    weather: "हवामान अंदाज",
    mandi: "बाजार भाव",
    ecoTips: "पर्यावरण टिप्स",
    sustainableGuide: "शाश्वत शेती मार्गदर्शक",
    waterConserve: "पाणी बचत",
    organicFert: "सेंद्रिय खते",
    chatPlaceholder: "तुमचा प्रश्न विचारा...",
    soilLab: "मृदा प्रयोगशाळा",
    cropDoctor: "पीक डॉक्टर",
    uploadSoil: "माती आरोग्य कार्ड/फोटो अपलोड करा",
    uploadCrop: "पिकाचा फोटो अपलोड करा",
    analyzeCrop: "पीक आरोग्य तपासा",
    uploadText: "फोटो अपलोड करण्यासाठी क्लिक करा",
    getRecommendation: "AI सल्ला मिळवा",
    expertAnalysis: "तज्ञ विश्लेषण",
    analyzeAnother: "दुसरी तपासणी करा",
    weatherDesc: "पुढील ४८ तास आकाश निरभ्र राहील. फवारणीसाठी योग्य वेळ.",
    mandiDesc: "आज गहू आणि तांदळाचे भाव वधारत आहेत.",
    cropDoctorDesc: "रोगांचे निदान करा आणि त्वरित उपाय मिळवा.",
    schemesDesc: "शेतकरी अनुदानासाठी आपली पात्रता तपासा.",
    waterConserveDesc: "ओलावा टिकवून ठेवण्यासाठी आच्छादनाचा वापर करा.",
    organicFertDesc: "शेतीतील कचऱ्यापासून गांडूळ खत तयार करायला शिका.",
    govSchemes: "सरकारी योजना",
    integratedSolution: "भारतीय शेतकऱ्यांसाठी एकात्मिक कृषी समाधान",
    marketplace: "बाजारपेठ",
    community: "समुदाय",
    diagnosisAdvice: "निदान आणि सल्ला",
    market: "बाजार",
    schemes: "योजना",
    viewDetails: "तपशील पहा",
    analyzingHealth: "आरोग्य तपासणी सुरू आहे...",
    learningMenu: "शिक्षण केंद्र",
    learningDesc: "तुमच्या क्षेत्रासाठी व्हिडिओ, मार्गदर्शक आणि तज्ञांची प्रश्नोत्तरे मिळवा."
  },
  bn: {
    title: "কৃষি সারথি",
    subtitle: "বুদ্ধিমান এবং টেকসই চাষের জন্য আপনার AI সঙ্গী।",
    home: "হোম",
    analysis: "মাটি পরীক্ষা",
    assistant: "সহায়তা",
    analyzeSoil: "মাটি বিশ্লেষণ",
    chatSupport: "AI চ্যাট সহায়তা",
    weather: "আবহাওয়ার খবর",
    mandi: "মাণ্ডি দর",
    ecoTips: "পরিবেশ টিপস",
    sustainableGuide: "টেকসই চাষ নির্দেশিকা",
    waterConserve: "জল সংরক্ষণ",
    organicFert: "জৈবিক সার",
    chatPlaceholder: "আপনার প্রশ্ন লিখুন...",
    soilLab: "মাটি গবেষণাগার",
    cropDoctor: "ফসল ডাক্তার",
    uploadSoil: "মাটি কার্ড বা ছবি আপলোড করুন",
    uploadCrop: "ফসলের ছবি আপলোড করুন",
    analyzeCrop: "ফসলের স্বাস্থ্য বিশ্লেষণ করুন",
    uploadText: "আপলোড করতে ক্লিক করুন",
    getRecommendation: "AI পরামর্শ নিন",
    expertAnalysis: "বিশেষজ্ঞ বিশ্লেষণ",
    analyzeAnother: "অন্য নমুনা পরীক্ষা করুন",
    weatherDesc: "আগামী ৪৮ ঘণ্টা আকাশ পরিষ্কার থাকবে। ছিটানোর জন্য উপযুক্ত সময়।",
    mandiDesc: "আজ গম ও চালের বাজার দর ঊর্ধ্বমুখী।",
    cropDoctorDesc: "রোগ শনাক্ত করুন এবং দ্রুত প্রতিকার পান।",
    schemesDesc: "সর্বশেষ কৃষি ভর্তুকির জন্য আপনার যোগ্যতা যাচাই করুন।",
    waterConserveDesc: "মাটির আর্দ্রতা ধরে রাখতে মালচিং ব্যবহার করুন।",
    organicFertDesc: "খামারের বর্জ্য ব্যবহার করে ভার্মিকম্পোস্ট তৈরি শিখুন।",
    govSchemes: "সরকারি প্রকল্প",
    integratedSolution: "ভারতীয় কৃষকদের জন্য সমন্বিত কৃষি সমাধান",
    marketplace: "বাজার",
    community: "সম্প্রদায়",
    diagnosisAdvice: "রোগ নির্ণয় ও পরামর্শ",
    market: "মাণ্ডি",
    schemes: "প্রকল্প",
    viewDetails: "বিস্তারিত দেখুন",
    analyzingHealth: "স্বাস্থ্য বিশ্লেষণ করা হচ্ছে...",
    learningMenu: "শিক্ষা কেন্দ্র",
    learningDesc: "আপনার অঞ্চলের জন্য ভিডিও, গাইড এবং বিশেষজ্ঞ প্রশ্নোত্তর পান।"
  }
};

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
];

function App() {
  const [lang, setLang] = useState('en');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [soilFile, setSoilFile] = useState(null);
  const [soilPreview, setSoilPreview] = useState(null);
  const [soilAnalysis, setSoilAnalysis] = useState(null);
  const [cropFile, setCropFile] = useState(null);
  const [cropPreview, setCropPreview] = useState(null);
  const [cropAnalysis, setCropAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [soilInputMode, setSoilInputMode] = useState('upload');
  const [manualSoilData, setManualSoilData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    pH: '',
    moisture: '',
    organicMatter: ''
  });
  
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentUser, login, signup, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'farmer', location: 'Punjab' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const chatEndRef = useRef(null);
  const [mandiPrices, setMandiPrices] = useState([]);
  const [govSchemes, setGovSchemes] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const t = I18N[lang] || I18N.en;

  useEffect(() => {
    fetchMandi();
    fetchSchemes();
    fetchMarketplaceItems();
  }, [lang]);

  const fetchMandi = async () => {
    try {
      const res = await axios.get(`${API_BASE}/mandi-prices?language=${lang}`);
      setMandiPrices(res.data);
    } catch { }
  };

  const fetchSchemes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/gov-schemes?language=${lang}`);
      setGovSchemes(res.data);
    } catch { }
  };

  const fetchMarketplaceItems = async () => {
    try {
      const res = await axios.get(`${API_BASE}/marketplace?language=${lang}`);
      setMarketplaceItems(res.data);
    } catch { }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, {
        message: chatInput,
        language: lang,
        history: chatMessages
      });
      setChatMessages(prev => [...prev, { role: 'bot', content: res.data.response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'bot', content: "Sorry, I'm having trouble connecting to the server. Please check the backend." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSoilUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSoilFile(file);
      setSoilPreview(URL.createObjectURL(file));
    }
  };

  const analyzeSoil = async () => {
    if (soilInputMode === 'upload' && !soilFile) return;
    if (soilInputMode === 'manual' && Object.values(manualSoilData).every(v => !v)) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    if (soilInputMode === 'upload') {
      formData.append('image', soilFile);
    } else {
      formData.append('report_text', JSON.stringify(manualSoilData));
    }
    formData.append('language', lang);

    try {
      const res = await axios.post(`${API_BASE}/analyze-soil`, formData);
      setSoilAnalysis(res.data.analysis || res.data);
    } catch (err) {
      alert("Analysis failed. Make sure the backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCropUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCropFile(file);
      setCropPreview(URL.createObjectURL(file));
    }
  };

  const analyzeCrop = async () => {
    if (!cropFile) return;
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', cropFile);
    formData.append('language', lang);

    try {
      const res = await axios.post(`${API_BASE}/analyze-crop`, formData);
      setCropAnalysis(res.data.analysis || res.data);
    } catch (err) {
      alert("Crop analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password, formData.role, formData.location);
      }
      setShowAuthModal(false);
    } catch (err) {
      alert("Auth Error: " + (err.response?.data?.detail || err.message));
    }
  };

  const renderMarket = () => (
    <div className="section-container">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <BarChart3 color="var(--primary-color)" /> {t.mandi}
      </h2>
      <div className="grid">
        {mandiPrices.map((item, idx) => (
          <motion.div key={idx} className="card price-card" whileHover={{ scale: 1.02 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '1.1rem' }}>{item.crop}</strong>
              <span style={{ color: item.change.includes('+') ? '#2e7d32' : '#c62828', fontWeight: 'bold' }}>{item.change}</span>
            </div>
            <p style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0.8rem 0', color: 'var(--primary-color)' }}>₹{item.price}/{item.unit}</p>
            <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
              <MapPin size={14} /> {item.location}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderWeather = () => (
    <div className="section-container">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <CloudSun color="var(--primary-color)" /> {t.weatherInsights}
      </h2>
      <div className="card" style={{ background: isDarkMode ? 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)' : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', marginBottom: '2rem', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '2.5rem' }}>28°C</h3>
            <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Clear Skies - Khanna, Punjab</p>
          </div>
          <CloudSun size={80} color="var(--primary-color)" />
        </div>
        <div className="grid" style={{ marginTop: '2rem', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <Droplets size={20} color="var(--primary-color)" />
            <p style={{ fontSize: '0.8rem', margin: '0.5rem 0' }}>{t.humidity}</p>
            <strong>45%</strong>
          </div>
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <Wind size={20} color="var(--primary-color)" />
            <p style={{ fontSize: '0.8rem', margin: '0.5rem 0' }}>{t.windSpeed}</p>
            <strong>12 km/h</strong>
          </div>
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <CloudSun size={20} color="var(--primary-color)" />
            <p style={{ fontSize: '0.8rem', margin: '0.5rem 0' }}>{t.precip}</p>
            <strong>5%</strong>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>{t.idealFor}</h3>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : '#e8f5e9', padding: '0.8rem 1.2rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', color: isDarkMode ? '#81c784' : '#2e7d32', fontWeight: 'bold' }}>
            <CheckCircle2 size={18} /> {t.pesticides}
          </div>
          <div style={{ background: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : '#e8f5e9', padding: '0.8rem 1.2rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', color: isDarkMode ? '#81c784' : '#2e7d32', fontWeight: 'bold' }}>
            <CheckCircle2 size={18} /> {t.irrigation}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>{t.forecast}</h3>
        <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem', paddingBottom: '1rem' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} style={{ textAlign: 'center', minWidth: '80px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{day}</p>
                <CloudSun size={24} color={i === 2 ? '#ff9800' : 'var(--primary-color)'} style={{ margin: '0 auto 0.5rem' }} />
                <p><strong>{28 + i}°</strong></p>
                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>{20 + i}°</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSchemes = () => (
    <div className="section-container">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Info color="var(--primary-color)" /> {t.govSchemes}
      </h2>
      <div className="grid">
        {govSchemes.map((scheme, idx) => (
          <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>{scheme.title}</h3>
              <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{scheme.benefit}</p>
            </div>
            <a href={scheme.link} target="_blank" className="button secondary" style={{ textDecoration: 'none' }}>
              {t.viewDetails}
            </a>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="hero">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {t.title}
        </motion.h1>
        <p>{t.subtitle}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button className="button" onClick={() => setActiveTab('soil')}>{t.soilLab}</button>
          <button className="button secondary" onClick={() => setActiveTab('crop')}>{t.cropDoctor}</button>
        </div>
      </div>

      <div className="grid">
        <motion.div whileHover={{ y: -5 }} className="card" onClick={() => setActiveTab('weather')} style={{ cursor: 'pointer' }}>
          <CloudSun size={32} color="var(--primary-color)" />
          <h3>{t.weather}</h3>
          <p>{t.weatherDesc}</p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="card" onClick={() => setActiveTab('market')} style={{ cursor: 'pointer' }}>
          <BarChart3 size={32} color="var(--primary-color)" />
          <h3>{t.mandi}</h3>
          <p>{t.mandiDesc}</p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="card" onClick={() => setActiveTab('crop')} style={{ cursor: 'pointer' }}>
          <Sprout size={32} color="var(--primary-color)" />
          <h3>{t.cropDoctor}</h3>
          <p>{t.cropDoctorDesc}</p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="card" onClick={() => setActiveTab('schemes')} style={{ cursor: 'pointer' }}>
          <Info size={32} color="var(--primary-color)" />
          <h3>{t.govSchemes}</h3>
          <p>{t.schemesDesc}</p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="card" onClick={() => setActiveTab('learning')} style={{ cursor: 'pointer' }}>
          <BookOpen size={32} color="var(--primary-color)" />
          <h3>{t.learningMenu || "Learning Hub"}</h3>
          <p>{t.learningDesc || "Access videos, guides, and expert Q&A tailored for your region."}</p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="card" onClick={() => setActiveTab('marketplace')} style={{ cursor: 'pointer' }}>
          <Store size={32} color="var(--primary-color)" />
          <h3>{t.marketplace || "Marketplace"}</h3>
          <p>{t.marketplaceDesc || "Discover the best deals on farming equipment and supplies."}</p>
        </motion.div>
      </div>

      <div className="sustainable-preview card">
        <h2>{t.sustainableGuide}</h2>
        <div className="eco-list">
          <div className="eco-item">
            <Droplets color="var(--primary-color)" />
            <div>
              <strong>{t.waterConserve}</strong>
              <p>{t.waterConserveDesc}</p>
            </div>
          </div>
          <div className="eco-item">
            <Wind color="var(--primary-color)" />
            <div>
              <strong>{t.organicFert}</strong>
              <p>{t.organicFertDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="section-container">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <MessageCircle color="var(--primary-color)" /> {t.chatSupport}
      </h2>
      <div className="card chat-container">
        <div className="chat-messages">
          {chatMessages.length === 0 && (
            <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '4rem' }}>
              <MessageCircle size={64} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
              <p>Hello! Ask me anything about crops, pests, or subsidies in your local language.</p>
            </div>
          )}
          {chatMessages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              {m.content}
            </div>
          ))}
          {isChatLoading && (
            <div className="message bot">
              <Loader2 className="animate-spin" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form className="chat-input" onSubmit={handleChat}>
          <input
            type="text"
            placeholder={t.chatPlaceholder}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button type="submit" className="button" disabled={isChatLoading}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );

  const renderSoil = () => (
    <div className="section-container">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Leaf color="var(--primary-color)" /> {t.soilLab}
      </h2>

      <div className="tab-switcher" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          className={`button ${soilInputMode === 'upload' ? '' : 'secondary'}`}
          onClick={() => setSoilInputMode('upload')}
          style={{ flex: 1 }}
        >
          <Upload size={18} /> {t.soilUpload}
        </button>
        <button
          className={`button ${soilInputMode === 'manual' ? '' : 'secondary'}`}
          onClick={() => setSoilInputMode('manual')}
          style={{ flex: 1 }}
        >
          <BarChart3 size={18} /> {t.soilManual}
        </button>
      </div>

      <div className="analysis-section card">
        {soilInputMode === 'upload' ? (
          <div className="upload-area" onClick={() => document.getElementById('soil-input').click()}>
            <input id="soil-input" type="file" hidden onChange={handleSoilUpload} accept="image/*" />
            {soilPreview ? (
              <img src={soilPreview} alt="Soil" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
            ) : (
              <div>
                <Upload size={64} style={{ marginBottom: '1rem', color: 'var(--primary-color)', opacity: 0.5 }} />
                <p>{t.uploadText}</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Supports JPG, PNG</p>
              </div>
            )}
          </div>
        ) : (
          <div className="manual-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {['nitrogen', 'phosphorus', 'potassium', 'pH', 'moisture', 'organicMatter'].map(field => (
              <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>{t[field]}</label>
                <input
                  type="text"
                  placeholder="e.g. 24.5"
                  value={manualSoilData[field]}
                  onChange={(e) => setManualSoilData({ ...manualSoilData, [field]: e.target.value })}
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
            ))}
          </div>
        )}

        {((soilInputMode === 'upload' && soilFile) || (soilInputMode === 'manual')) && !soilAnalysis && (
          <button
            className="button"
            onClick={analyzeSoil}
            disabled={isAnalyzing}
            style={{ width: '100%', padding: '1.2rem' }}
          >
            {isAnalyzing ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Loader2 className="animate-spin" /> {t.analyzingHealth}
              </div>
            ) : t.getRecommendation}
          </button>
        )}

        <AnimatePresence>
          {soilAnalysis && (
            <motion.div
              className="result-overlay"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <CheckCircle2 color="#2e7d32" size={24} />
                <h3 style={{ margin: 0 }}>{t.expertAnalysis}</h3>
              </div>
              <div className="analysis-content">
                {typeof soilAnalysis === 'string' ? (
                  soilAnalysis.split('\n').map((line, i) => <p key={i}>{line}</p>)
                ) : (
                  <pre>{JSON.stringify(soilAnalysis, null, 2)}</pre>
                )}
              </div>
              <button
                className="button secondary"
                style={{ marginTop: '1.5rem' }}
                onClick={() => { setSoilAnalysis(null); setSoilFile(null); setSoilPreview(null); }}
              >
                {t.analyzeAnother}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
  const renderCropDoctor = () => (
    <div className="section-container">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Sprout color="var(--primary-color)" /> {t.cropDoctor}
      </h2>
      <div className="analysis-section card">
        <div className="upload-area" onClick={() => document.getElementById('crop-input').click()}>
          <input id="crop-input" type="file" hidden onChange={handleCropUpload} accept="image/*" />
          {cropPreview ? (
            <img src={cropPreview} alt="Crop" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
          ) : (
            <div>
              <Upload size={64} style={{ marginBottom: '1rem', color: 'var(--primary-color)', opacity: 0.5 }} />
              <p>{t.uploadCrop}</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Upload photo of affected plant</p>
            </div>
          )}
        </div>

        {cropFile && !cropAnalysis && (
          <button className="button" onClick={analyzeCrop} disabled={isAnalyzing} style={{ width: '100%', padding: '1.2rem', marginTop: '1rem' }}>
            {isAnalyzing ? <Loader2 className="animate-spin" /> : t.analyzeCrop}
          </button>
        )}

        <AnimatePresence>
          {cropAnalysis && (
            <motion.div className="result-overlay" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <CheckCircle2 color="#2e7d32" size={24} />
                <h3 style={{ margin: 0 }}>{t.diagnosisAdvice}</h3>
              </div>
              <div className="analysis-content">
                {typeof cropAnalysis === 'string' ? cropAnalysis.split('\n').map((line, i) => <p key={i}>{line}</p>) : <pre>{JSON.stringify(cropAnalysis, null, 2)}</pre>}
              </div>
              <button className="button secondary" style={{ marginTop: '1.5rem' }} onClick={() => { setCropAnalysis(null); setCropFile(null); setCropPreview(null); }}>{t.analyzeAnother}</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="app">
      <header>
        <div className="header-top">
          <div className="logo" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Leaf size={32} />
            <span>{t.title}</span>
          </div>

          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Dark Mode">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="lang-box">
              <Languages size={18} />
              <select className="lang-selector" value={lang} onChange={(e) => setLang(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>

            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-color)', padding: '0.4rem 1rem', borderRadius: '50px', border: '1px solid var(--border-color)' }}>
                <User size={18} color="var(--primary-color)" />
                <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{currentUser.name}</span>
                <button onClick={logout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <LogOut size={18} color="#f44336" />
                </button>
              </div>
            ) : (
              <button className="button" onClick={() => setShowAuthModal(true)} style={{ padding: '0.6rem 1.2rem', borderRadius: '50px' }}>Login</button>
            )}
            
            <button className="theme-toggle" style={{ display: 'none' }} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div className="header-bottom">
          <nav>
            <ul className="nav-links">
              <li className={activeTab === 'dashboard' ? 'active' : ''}><a href="#" onClick={() => setActiveTab('dashboard')}>{t.home}</a></li>
              <li className={activeTab === 'soil' ? 'active' : ''}><a href="#" onClick={() => setActiveTab('soil')}>{t.soilLab}</a></li>
              <li className={activeTab === 'crop' ? 'active' : ''}><a href="#" onClick={() => setActiveTab('crop')}>{t.cropDoctor}</a></li>
              <li className={activeTab === 'weather' ? 'active' : ''}><a href="#" onClick={() => setActiveTab('weather')}>{t.weather}</a></li>
              <li className={activeTab === 'market' ? 'active' : ''}><a href="#" onClick={() => setActiveTab('market')}>{t.market}</a></li>
              <li className={activeTab === 'learning' ? 'active' : ''}><a href="#" onClick={() => setActiveTab('learning')}>{t.learningMenu}</a></li>
              <li className={activeTab === 'marketplace' ? 'active' : ''}><a href="#" onClick={() => setActiveTab('marketplace')}>{t.marketplace}</a></li>
              <li className={activeTab === 'chat' ? 'active' : ''}><a href="#" onClick={() => setActiveTab('chat')}>{t.assistant}</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderDashboard()}</motion.div>}
          {activeTab === 'market' && <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderMarket()}</motion.div>}
          {activeTab === 'schemes' && <motion.div key="schemes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderSchemes()}</motion.div>}
          {activeTab === 'learning' && <motion.div key="learning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><FarmerLearningHub language={lang}/></motion.div>}
          {activeTab === 'marketplace' && <motion.div key="marketplace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Marketplace language={lang}/></motion.div>}
          {activeTab === 'chat' && <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderChat()}</motion.div>}
          {activeTab === 'soil' && <motion.div key="soil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderSoil()}</motion.div>}
          {activeTab === 'crop' && <motion.div key="crop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderCropDoctor()}</motion.div>}
          {activeTab === 'weather' && <motion.div key="weather" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderWeather()}</motion.div>}
        </AnimatePresence>
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-logo"><Leaf size={20} /> {t.title}</div>
          <p>{t.integratedSolution}</p>
          <div className="footer-links">
            <span>{t.marketplace}</span> • <span>{t.weather}</span> • <span>{t.community}</span>
          </div>
        </div>
      </footer>

      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            <h2 style={{ marginBottom: '1.5rem' }}>{authMode === 'login' ? 'Login' : 'Sign Up'}</h2>
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {authMode === 'signup' && (
                <>
                  <input type="text" placeholder="Full Name" required={authMode === 'signup'} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}>
                      <option value="farmer">Farmer</option>
                      <option value="expert">Expert</option>
                    </select>
                    <select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}>
                      <option value="All India">All India</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Gujarat">Gujarat</option>
                    </select>
                  </div>
                </>
              )}
              <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }} />
              <input type="password" placeholder="Password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }} />
              <button type="submit" className="button" style={{ marginTop: '0.5rem' }}>{authMode === 'login' ? 'Login' : 'Sign Up'}</button>
            </form>
            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }}>
                {authMode === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
