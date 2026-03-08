# 🎓 AskUni

> **A smart, collaborative study platform designed specifically for university students.**

AskUni is built to solve common student challenges like disorganized study sessions, lack of structured roadmaps, and the difficulty of finding reliable academic answers. With integrated Q&A forums, collaborative session booking, and cutting-edge AI attention monitoring, AskUni provides everything a student needs to stay focused and succeed.

---

## ✨ Key Features

### 💬 1. Interactive Q&A System
* Ask module-specific academic questions.
* Provide and receive structured answers from peers.
* **Real-time Notifications:** Get instantly notified when someone answers your question.

### 📅 2. Collaborative Study Sessions
* **Create & Join:** Easily organize or join study groups based on specific modules and chapters.
* **Time Planning:** Book structured time slots that fit your schedule.
* **Smart Study Planner:** Input your availability, and the system recommends the best sessions and resources for you.

### 🤖 3. AI-Powered Attention Monitoring (Camera feature)
A cutting-edge focus tool built directly into the platform to help you stay on track during your study sessions.
* **Face Mesh Tracking:** Tracks 468 facial landmarks in real-time.
* **Hand Tracking:** Monitors hand movement to ensure engagement.
* **Phone Detection:** Uses MediaPipe Object Detection (`tasks-vision`) to instantly detect if you pick up your smartphone, alerting you to put it away and stay focused. 

---

## 🛠️ Tech Stack

**Frontend:**
* React.js (v19)
* Vite
* Tailwind CSS
* MediaPipe (Machine Learning / Computer Vision)

**Backend:**
* Django (Python)
* Supabase / PostgreSQL

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
* Node.js (v18+ recommended)
* Python (v3.10+ recommended)

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations and start the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```
5. The API will be available at `http://localhost:8000`.

---

## 📱 AI Tracking Modes

The frontend includes a powerful `CameraSettings` page where you can test the AI integrations:
* **Face Mesh:** Visualizes an intricate 468-point mesh over your face.
* **Hand Tracking:** Maps 21 distinct coordinate points on your hands.
* **Phone Detection:** Strictly isolated object detection mode that scans your webcam feed specifically for smartphones, triggering a focus alert if one is detected.

---

## 🎯 Project Goals & MVP Status
* **Goal:** Increase student collaboration, study time efficiency, and digital focus.
* **Status:** AskUni is currently in the MVP phase. Core Q&A, authentication, basic session planning, and the AI Camera proof-of-concept have been implemented. 

---

*Built with ❤️ for focused and collaborative learning.*
