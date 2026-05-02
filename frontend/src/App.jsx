import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import HomePage from './pages/qa/HomePage'
import QuestionDetailPage from './pages/qa/QuestionDetailPage'
import AskQuestionPage from './pages/qa/AskQuestionPage'
import BrowseSessionsPage from './pages/sessions/BrowseSessionsPage'
import CreateSessionPage from './pages/sessions/CreateSessionPage'
import SessionDetailPage from './pages/sessions/SessionDetailPage'
import PlannerInputPage from './pages/planner/PlannerInputPage'
import PlannerResultPage from './pages/planner/PlannerResultPage'
import CameraSettings from './pages/camera/CameraSettings'
import LiveSessionPage from './pages/sessions/LiveSessionPage'
import LandingPage from './pages/LandingPage'


function App() {
  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/questions/:id" element={<QuestionDetailPage />} />
          <Route path="/ask" element={<AskQuestionPage />} />
          <Route path="/sessions" element={<BrowseSessionsPage />} />
          <Route path="/sessions/create" element={<CreateSessionPage />} />
          <Route path="/sessions/:id" element={<SessionDetailPage />} />
          <Route path="/planner" element={<PlannerInputPage />} />
          <Route path="/planner/results" element={<PlannerResultPage />} />
          <Route path="/camera" element={<CameraSettings />} />
        </Route>
        <Route path="/sessions/:id/live" element={<LiveSessionPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
