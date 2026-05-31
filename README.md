# LexAid ⚖️ — AI Legal Document Simplifier

LexAid helps Indian citizens understand complex legal documents (rent agreements, employment contracts, loan agreements, etc.) by extracting clauses, flagging risks, explaining them in plain English, providing Indian law rights advice, and answering questions via an AI chatbot. It supports English, Tamil, and Hindi translations.

## 🌟 Features
- **AI-Powered Parsing**: Upload a PDF and get clause-by-clause analysis using Llama 3 on Groq.
- **Risk Detection**: High, Medium, and Low risk flags with simple explanations.
- **Know Your Rights**: Mentions specific Indian laws relevant to specific clauses.
- **Multi-language Support**: Translate legal explanations into Tamil and Hindi.
- **AI Assistant Chatbot**: Ask questions directly about the uploaded document context.
- **Cross-Platform**: Includes a web frontend (React) and a mobile frontend (Flutter).

---

## 🛠 Tech Stack
- **Backend**: Python 3.11, FastAPI, SQLite/PostgreSQL, SQLAlchemy, JWT Auth, Groq API (Llama 3)
- **Web Frontend**: React 18, React Router v6, Tailwind CSS, Axios
- **Mobile Frontend**: Flutter 3.x, Dio, Provider, Secure Storage

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- Flutter 3.x
- PostgreSQL 15+
- Groq API key from [Groq Console](https://console.groq.com/)

### 1. Database Setup
Create a PostgreSQL database named `lexaid`. The backend will automatically create tables on first startup.
```bash
createdb lexaid
```

### 2. Backend Setup
```bash
cd lexaid/backend
cp .env.example .env

# Edit .env and fill in GROQ_API_KEY, DATABASE_URL, and SECRET_KEY
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 8000
```
API Documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Web Frontend Setup
```bash
cd lexaid/frontend-web
cp .env.example .env

# Ensure REACT_APP_API_URL is correct (default is http://localhost:8000)
npm install
npm start
```
The web app will run at: [http://localhost:3000](http://localhost:3000)

### 4. Flutter Mobile Setup
```bash
cd lexaid/frontend-mobile
flutter pub get

# Note: In lib/api/api_service.dart, baseUrl is set to http://10.0.2.2:8000 for Android emulators.
# For physical devices, change it to your machine's local IP address (e.g., http://192.168.1.x:8000).

flutter run
```

---

## 🌍 Free Deployment Guide
- **Backend (Render)**: Deploy the `/backend` folder as a Web Service. Set start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`. Attach a managed PostgreSQL database.
- **Frontend Web (Vercel)**: Import the `/frontend-web` folder. Set framework preset to Create React App.
- **Flutter Mobile**: Run `flutter build apk --release` to generate the Android APK for distribution.

---

## ⚠️ Disclaimer
LexAid provides AI-generated analysis for educational purposes only. This is **not a substitute for professional legal advice**. Always consult a qualified lawyer for important legal decisions.
