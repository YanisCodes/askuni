import { useState, useRef, useCallback, useEffect } from 'react'
import { createPeer, destroyPeer, callPeer, answerCall, listenForIncomingCalls } from '../services/peerConnection'

export default function useVideoCall(userId, hostPeerId) {
  const [peer, setPeer] = useState(null)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState({})
  const [myPeerId, setMyPeerId] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const callsRef = useRef({})
  const remoteStreamsRef = useRef({})
  const localStreamRef = useRef(null)

  const initPeer = useCallback(async () => {
    try {
      const p = await createPeer(userId)
      setPeer(p)
      setMyPeerId(p.id)

      listenForIncomingCalls(p, (call) => {
        const activeLocalStream = localStreamRef.current

        // If we already have a call to/from this peer, close it before replacing
        const existing = callsRef.current[call.peer]
        if (existing) {
          try { existing.close() } catch (e) { /* ignored */ }
        }

        try {
          call.answer(activeLocalStream || undefined)
        } catch (e) {
          console.error('[Mesh] Answer failed:', e)
          return
        }

        answerCall(call, (stream, peerId) => {
          remoteStreamsRef.current[peerId] = stream
          setRemoteStreams({ ...remoteStreamsRef.current })
        })
        callsRef.current[call.peer] = call

        call.on('close', () => {
          if (callsRef.current[call.peer] === call) {
            delete callsRef.current[call.peer]
          }
          delete remoteStreamsRef.current[call.peer]
          setRemoteStreams({ ...remoteStreamsRef.current })
        })
      })

      return p
    } catch (err) {
      console.error('Failed to init peer:', err)
      return null
    }
  }, [userId])

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      localStreamRef.current = stream
      setLocalStream(stream)

      // Restart all calls so they get our new stream
      Object.values(callsRef.current).forEach(call => {
        try { call.close() } catch (e) { /* ignored */ }
      })
      callsRef.current = {}
      setRemoteStreams({})
      remoteStreamsRef.current = {}

      return stream
    } catch (err) {
      console.error('Failed to get local stream:', err)
      return null
    }
  }, [])

  const connectToHost = useCallback((stream) => {
    const activeLocalStream = stream || localStreamRef.current
    if (!hostPeerId || !peer || !activeLocalStream) return
    const call = callPeer(peer, hostPeerId, activeLocalStream)
    if (call) {
      answerCall(call, (remoteStream, peerId) => {
        remoteStreamsRef.current[peerId] = remoteStream
        setRemoteStreams({ ...remoteStreamsRef.current })
      })
      callsRef.current[call.peer] = call
    }
  }, [hostPeerId, peer])

  const connectToPeer = useCallback((remotePeerId) => {
    const activeLocalStream = localStreamRef.current
    if (!peer || callsRef.current[remotePeerId]) return
    if (remotePeerId === myPeerId) return // Prevent self-call

    const call = callPeer(peer, remotePeerId, activeLocalStream)
    if (!call) return

    callsRef.current[remotePeerId] = call
    answerCall(call, (stream, peerId) => {
      remoteStreamsRef.current[peerId] = stream
      setRemoteStreams({ ...remoteStreamsRef.current })
    })

    call.on('close', () => {
      if (callsRef.current[remotePeerId] === call) {
        delete callsRef.current[remotePeerId]
      }
      delete remoteStreamsRef.current[remotePeerId]
      setRemoteStreams({ ...remoteStreamsRef.current })
    })
  }, [peer, myPeerId])

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current
    if (stream) {
      stream.getAudioTracks().forEach(t => {
        t.enabled = !t.enabled
      })
      setIsMuted(prev => !prev)
    }
  }, [])

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current
    if (stream) {
      stream.getVideoTracks().forEach(t => {
        t.enabled = !t.enabled
      })
      setIsCameraOff(prev => !prev)
    }
  }, [])

  const cleanup = useCallback(() => {
    Object.values(callsRef.current).forEach(call => {
      try { call.close() } catch (e) { /* ignored */ }
    })
    callsRef.current = {}
    remoteStreamsRef.current = {}

    const stream = localStreamRef.current
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
    }
    localStreamRef.current = null
    setLocalStream(null)
    setRemoteStreams({})
    destroyPeer()
    setPeer(null)
    setMyPeerId('')
  }, [])

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    peer,
    myPeerId,
    localStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    initPeer,
    startLocalStream,
    connectToHost,
    connectToPeer,
    toggleMute,
    toggleCamera,
    cleanup,
  }
}
