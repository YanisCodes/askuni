import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import useVideoCall from '../../hooks/useVideoCall'
import useFocusTracker from '../../hooks/useFocusTracker'
import {
  startSession as apiStartSession,
  endSession as apiEndSession,
  submitFocusScore,
  fetchFocusScores,
} from '../../services/api'
import VideoGrid from '../../components/live/VideoGrid'
import ControlBar from '../../components/live/ControlBar'
import ChatPanel from '../../components/live/ChatPanel'
import SessionSummary from '../../components/live/SessionSummary'
import Button from '../../components/common/Button'

export default function LiveSessionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getSessionWithDetails } = useData()
  const videoRef = useRef(null)

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(true)
  const [showSummary, setShowSummary] = useState(false)
  const [focusScores, setFocusScores] = useState([])
  const [starting, setStarting] = useState(false)

  const {
    localStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    initPeer,
    startLocalStream,
    connectToHost,
    toggleMute,
    toggleCamera,
    cleanup: cleanupCall,
  } = useVideoCall(user?.id, session?.hostPeerId || '')

  const {
    isTracking,
    currentScore,
    phoneAlert,
    startTracking,
    stopTracking,
  } = useFocusTracker()

  const loadSession = useCallback(async () => {
    const data = await getSessionWithDetails(Number(id))
    setSession(data)
    setLoading(false)
    return data
  }, [id, getSessionWithDetails])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  useEffect(() => {
    if (!session) return
    if (session.status === 'ended') {
      navigate(`/sessions/${id}`)
    }
  }, [session?.status, id, navigate])

  const isCreator = user?.id === session?.creator?.id
  const isParticipant = session?.participantIds?.includes(user?.id)

  const handleStartSession = useCallback(async () => {
    setStarting(true)
    try {
      const stream = await startLocalStream()
      if (!stream) { setStarting(false); return }
      const peerId = await initPeer()
      if (!peerId) { setStarting(false); return }

      const updated = await apiStartSession(id, { hostPeerId: peerId })
      setSession(updated)
    } catch (err) {
      console.error('Failed to start session:', err)
    } finally {
      setStarting(false)
    }
  }, [id, startLocalStream, initPeer])

  const handleJoinLive = useCallback(async () => {
    const stream = await startLocalStream()
    if (!stream) return
    const peerId = await initPeer()
    if (!peerId) return

    const freshSession = await loadSession()
    if (freshSession?.hostPeerId) {
      connectToHost(undefined, stream)
    }
  }, [startLocalStream, initPeer, loadSession, connectToHost])

  const handleEndSession = useCallback(async () => {
    let finalStats = null
    if (isTracking) {
      finalStats = stopTracking()
    }
    cleanupCall()

    try {
      if (finalStats) {
        await submitFocusScore(id, finalStats)
      }
      const ended = await apiEndSession(id)
      setSession(ended)

      const scores = await fetchFocusScores(id)
      setFocusScores(scores || [])
      setShowSummary(true)
    } catch (err) {
      console.error('Failed to end session:', err)
      navigate(`/sessions/${id}`)
    }
  }, [id, isTracking, stopTracking, cleanupCall, navigate])

  const handleLeave = useCallback(async () => {
    if (isTracking) {
      const finalStats = stopTracking()
      try {
        await submitFocusScore(id, finalStats)
      } catch (e) { /* non-critical */ }
    }
    cleanupCall()
    navigate(`/sessions/${id}`)
  }, [id, isTracking, stopTracking, cleanupCall, navigate])

  const handleToggleFocus = useCallback(() => {
    if (isTracking) {
      stopTracking()
    } else {
      const videoEl = document.querySelector('#focus-video')
      if (videoEl) startTracking(videoEl)
    }
  }, [isTracking, startTracking, stopTracking])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Session not found</p>
      </div>
    )
  }

  if (session.status === 'ended') return null

  if (session.status === 'upcoming') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center animate-fade-in-up space-y-4">
          <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">
            {session.module?.name} {session.chapter && `- ${session.chapter}`}
          </h2>
          <p className="text-slate-400 text-sm">{session.date} at {session.timeSlot}</p>

          {isCreator ? (
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">Ready to start? Your camera will activate and other participants will be notified.</p>
              <Button
                onClick={handleStartSession}
                disabled={starting}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {starting ? 'Starting...' : 'Start Session'}
              </Button>
            </div>
          ) : isParticipant ? (
            <p className="text-slate-400 text-sm">Waiting for the creator to start the session...</p>
          ) : (
            <p className="text-slate-400 text-sm">You need to join this session first.</p>
          )}

          <button
            onClick={() => navigate(`/sessions/${id}`)}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Back to session details
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-white">
            {session.module?.name} {session.chapter && `- ${session.chapter}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isCreator && (
            <button
              onClick={handleEndSession}
              className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors"
            >
              End Session
            </button>
          )}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-3 gap-3 min-w-0">
          {!localStream ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center text-slate-400">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">Join the video call to participate</p>
              <Button onClick={handleJoinLive}>Join Video Call</Button>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <VideoGrid
                localStream={localStream}
                remoteStreams={remoteStreams}
                participants={session.participants}
              />
            </div>
          )}

          <ControlBar
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isTracking={isTracking}
            phoneAlert={phoneAlert}
            currentScore={currentScore}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onToggleFocus={handleToggleFocus}
            onLeave={handleLeave}
          />
        </div>

        {chatOpen && (
          <div className="w-80 shrink-0 border-l border-slate-700/50 hidden lg:block">
            <ChatPanel
              sessionId={Number(id)}
              isOpen={chatOpen}
              onClose={() => setChatOpen(false)}
            />
          </div>
        )}
      </div>

      <video
        id="focus-video"
        ref={(el) => {
          videoRef.current = el
          if (el && localStream) el.srcObject = localStream
        }}
        autoPlay
        playsInline
        muted
        className="hidden"
      />

      {showSummary && (
        <SessionSummary
          focusScores={focusScores}
          currentUser={user}
          onClose={() => {
            setShowSummary(false)
            navigate(`/sessions/${id}`)
          }}
        />
      )}
    </div>
  )
}
