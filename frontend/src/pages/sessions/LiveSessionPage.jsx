import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import useVideoCall from '../../hooks/useVideoCall'
import useFocusTracker from '../../hooks/useFocusTracker'
import {
  startSession as apiStartSession,
  endSession as apiEndSession,
  joinSession as apiJoinSession,
  submitFocusScore,
  fetchFocusScores,
  registerPeer,
  fetchPeerRegistry,
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
    connectToPeer,
    myPeerId,
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

  // Initialize peer automatically when entering live session
  useEffect(() => {
    if (!session || session.status !== 'live' || myPeerId) return
    
    initPeer().catch(e => {
      console.error('Failed to init peer on live session join:', e)
    })
  }, [session?.status, myPeerId, initPeer])

  const isCreator = user?.id === session?.creator?.id
  const isParticipant = session?.participantIds?.includes(user?.id)

  // Register in peer registry immediately when peer ID is ready
  // BUT only after we are officially part of the session
  useEffect(() => {
    if (!session || session.status !== 'live' || !myPeerId) return
    if (!isParticipant && !isCreator) return
    
    registerPeer(Number(id), myPeerId).catch(e => {
      console.error('Failed to register peer:', e)
    })
  }, [session?.status, myPeerId, id, isParticipant, isCreator])

  // Mesh networking: discover and connect to other participants
  useEffect(() => {
    if (!session || session.status !== 'live' || !myPeerId) return
    
    const discoveryInterval = setInterval(async () => {
      try {
        const registry = await fetchPeerRegistry(Number(id))
        const activePeerIds = registry.activePeerIds || {}
        
        // Try to connect to each participant (except self and those already connected)
        Object.entries(activePeerIds).forEach(([userId, peerId]) => {
          if (peerId !== myPeerId) {
            connectToPeer(peerId)
          }
        })
      } catch (e) {
        // Suppress network logs if polling fails gracefully
      }
    }, 2000) // Poll every 2 seconds
    
    return () => clearInterval(discoveryInterval)
  }, [session, myPeerId, id, connectToPeer])

  // Auto-join if user navigates to a live session they aren't part of
  useEffect(() => {
    if (session?.status === 'live' && !isParticipant && !isCreator && user) {
      console.log('User is entering live session, auto-joining...')
      apiJoinSession(id).then(() => loadSession()).catch(e => console.error('Auto-join failed:', e))
    }
  }, [session?.status, isParticipant, isCreator, user, id, loadSession])

  const handleStartSession = useCallback(async () => {
    setStarting(true)
    try {
      const peer = await initPeer()
      if (!peer) { 
        setStarting(false)
        alert('Failed to initialize network connection')
        return 
      }

      console.log('Starting session with peer:', peer.id)
      const updated = await apiStartSession(id, { hostPeerId: peer.id })
      console.log('Session started, updated:', updated)
      setSession(updated)
    } catch (err) {
      console.error('Failed to start session:', err)
      alert('Failed to start session: ' + (err.response?.data?.detail || err.message))
    } finally {
      setStarting(false)
    }
  }, [id, initPeer])

  const handleToggleCamera = useCallback(async () => {
    if (!localStream) {
      // First time turning on: get media and let the Mesh network re-connect!
      const stream = await startLocalStream()
      if (!stream) {
        alert('Failed to access camera/microphone')
        return
      }
      
      // Ensure peer is fully initialized
      let currentPeerId = myPeerId
      if (!currentPeerId) {
        const peer = await initPeer()
        if (peer) currentPeerId = peer.id
      }
      if (currentPeerId) {
        registerPeer(Number(id), currentPeerId).catch(console.error)
      }
    } else {
      // Hardware exists, just toggle track
      toggleCamera()
    }
  }, [localStream, startLocalStream, myPeerId, initPeer, id, toggleCamera])

  const handleToggleMute = useCallback(async () => {
    if (!localStream) {
      // Turning on for first time means getting full media stream
      await handleToggleCamera()
    } else {
      toggleMute()
    }
  }, [localStream, handleToggleCamera, toggleMute])

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
          <div className="flex-1 min-h-0">
            <VideoGrid
              currentUser={user}
              localStream={localStream}
              remoteStreams={remoteStreams}
              participants={session.participants || []}
            />
          </div>

          <ControlBar
            isMuted={!localStream || isMuted} // Show as muted if stream not started
            isCameraOff={!localStream || isCameraOff} // Show as camera off if stream not started
            isTracking={isTracking}
            phoneAlert={phoneAlert}
            currentScore={currentScore}
            onToggleMute={handleToggleMute}
            onToggleCamera={handleToggleCamera}
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
