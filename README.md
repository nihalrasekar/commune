# 🏘️ Commune – AI-Powered Real Estate Assistant

Commune is a full-stack real estate assistant powered by AI. It helps users get investment insights, property advice, and area suggestions — all through an interactive voice/text agent.

---

## 🧠 Tech Stack

### 🔙 Backend (API only)
- Flask + Flask-SocketIO (WebSocket-based API)
- CrewAI for multi-agent planning
- Ollama with gemma3 (or other local models)
- LangChain
- Session memory per chat session
- Speech-to-text & text-only support (optional ElevenLabs)

### 📱 Frontend (Expo React Native)
- React Native + Expo
- `socket.io-client` for real-time messaging
- Camera, Microphone access (if needed)
- Supabase for authentication & user storage

---
## 🛠️ Setup Instructions

### 🔙 Backend Setup (Flask + CrewAI + Ollama)

#### 1. Clone the repo
```bash
git clone https://github.com/nihalrasekar/commune.git
cd commune/backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
curl -fsSL https://ollama.com/install.sh | sh
ollama run gemma3
cd ../frontend
npm install
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
npx expo start
Used for:

User auth (email / OTP / social login)

Real-time database (user profile, session history)

Steps:

Go to https://supabase.com

Create a project

Copy your SUPABASE_URL and anon key



