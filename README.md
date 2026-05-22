# AskUni — Smart Collaborative Study Platform

AskUni is a full-stack web application that helps university students collaborate on coursework through a Q&A forum, real-time video study sessions, an AI-powered study planner, and a focus tracker that uses on-device computer vision to detect phone usage during sessions.

Built as a final project for ESTIN 2CP MI (2025/2026), the platform is deployed at **https://askuni-two.vercel.app**.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router, Axios |
| **Backend** | Django 6, Django REST Framework, SimpleJWT |
| **Database** | PostgreSQL (production via Render), SQLite (local dev) |
| **Realtime** | Supabase (chat subscriptions & file uploads) |
| **AI / CV** | MediaPipe Tasks-Vision — ObjectDetector, FaceLandmarker, HandLandmarker |
| **Video** | PeerJS (WebRTC mesh networking) |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## Running Locally

### Prerequisites

- Python 3.11+
- Node.js 20+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`.

To seed demo data for a presentation:

```bash
python manage.py seed_demo
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`. The Vite dev server proxies all `/api` requests to the Django backend, so no CORS configuration is needed for local development.

---

## Authors

- **Yanis** — Full-stack development
- **Merieme Mohamed Faize** — Full-stack development

**Institution:** ESTIN — 2CP MI — 2025/2026
