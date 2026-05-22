# AskUni — Smart Collaborative Study Platform

AskUni is a full-stack web application that helps university students collaborate
on coursework through a Q&A forum, real-time video study sessions, a smart study
planner, and a focus tracker that uses on-device computer vision to detect phone
usage during sessions.

Built as a 2CP multidisciplinary project at ESTIN MI (2025/2026), the platform
is deployed at **https://askuni-two.vercel.app**.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router, Axios |
| **Backend** | Django 6, Django REST Framework, SimpleJWT |
| **Database** | PostgreSQL via Supabase |
| **Realtime** | Supabase Realtime (chat) + Supabase Storage (file uploads) |
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

To seed demo data:

```bash
python manage.py seed_demo
```

### Frontend

Create a `.env` file in `frontend/` with your Supabase credentials
(see `.env.example`), then:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Authors

- **Yanis Oukaci** — Full-stack development
- **Merième Mohamed Faize** — Full-stack development
- **Ali Belaidi** -- Backend Developer
- **Tahar Aitabbas** -- Backend Developer
- **Ihab Djedouani** -- Backend Developer

**Institution:** ESTIN — 2CP MI — 2025/2026
