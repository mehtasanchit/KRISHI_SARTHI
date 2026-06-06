# 🌾 Krishi Sarthi (कृषि सारथी)
### *Your AI-Powered Agricultural Companion*

Krishi Sarthi is a state-of-the-art AI farming platform designed to empower Indian farmers with intelligent, real-time insights. From soil health analysis to crop disease detection, Krishi Sarthi bridges the gap between traditional wisdom and modern technology.

https://github.com/user-attachments/assets/93365769-c221-47c1-b807-e018413e2ff2

---

## 🚀 Key Features

- **🌍 Multilingual Support**: Communicate in Hindi, Punjabi, Tamil, Telugu, Marathi, Bengali, and English.
- **🧪 Soil Lab**: Upload soil photos or reports for AI-driven crop recommendations and fertilization plans.
- **🩺 Crop Doctor**: Identify crop diseases and get organic/sustainable treatment suggestions.
- **🤖 AI Assistant**: A dedicated chatbot specializing in agricultural queries, from irrigation to pest management.
- **⛅ Weather Insights**: Real-time localized weather data and strategic agricultural advice for optimal planning.
- **✨ Premium UI**: Responsive, modern, and high-engagement interface designed with Framer Motion and Vite.

---

## 💻 Tech Stack

- **Frontend**: [React.js](https://reactjs.org/), [Vite](https://vitejs.dev/), [Framer Motion](https://www.framer.com/motion/), [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/), [Python](https://www.python.org/)
- **AI Engine**: [Google Gemini 1.5 Flash](https://aistudio.google.com/) for Vision and Natural Language Processing

---

## ⚙️ Installation & Setup

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Python 3.9+](https://www.python.org/downloads/)
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```
*Create a `.env` file in the `backend/` directory and add your key:*
```
GOOGLE_API_KEY=your_actual_api_key_here
```
*Run the backend:*
```bash
python main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Application Access
Once both servers are running:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🌱 Vision
To leverage Artificial Intelligence to ensure every farmer has access to a dedicated agricultural expert, regardless of their location or language.

---

*Made with ❤️ for the Indian Farming Community.*
