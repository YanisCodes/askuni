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

        console.log('[Mesh] Answering incoming call from:', call.peer, 'with stream:', !!activeLocalStream)
        // PeerJS requires undefined/null if no stream
        if (activeLocalStream) {
          call.answer(activeLocalStream)
        } else {
          // Pass MediaStream constraints or empty to satisfy PeerJS answering logic 
          // without sending actual media. Creating a blank audio track prevents crashes
          // on strictly enforced browsers while providing no real mic data.
          try {
            call.answer()
          } catch(e) {
            console.error('[Mesh] Answer failed:', e)
          }
        }
        
        answerCall(call, (stream, peerId) => {
          console.log('[Mesh] Received stream from caller:', peerId)
          remoteStreamsRef.current[peerId] = stream
          setRemoteStreams({ ...remoteStreamsRef.current })
        })
        callsRef.current[call.peer] = call

        call.on('close', () => {
          console.log('[Mesh] Incoming call closed by remote:', call.peer)
          delete callsRef.current[call.peer]
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
    
    console.log('[Mesh] Calling peer:', remotePeerId)
    // PeerJS requires a stream or empty audio track, but we must pass something valid
    const call = activeLocalStream 
      ? callPeer(peer, remotePeerId, activeLocalStream)
      : callPeer(peer, remotePeerId) // Note: Peer 1.5.5 expects undefined if no stream
      
    if (call) {
      callsRef.current[remotePeerId] = call
      answerCall(call, (stream, peerId) => {
        console.log('[Mesh] Received stream from called peer:', peerId)
        remoteStreamsRef.current[peerId] = stream
        setRemoteStreams({ ...remoteStreamsRef.current })
      })

      call.on('stream', (stream) => {
        console.log('[Mesh] Received stream via stream event from:', remotePeerId)
        remoteStreamsRef.current[remotePeerId] = stream
        setRemoteStreams({ ...remoteStreamsRef.current })
      })

      // When they close their camera, remove their stream
      call.on('close', () => {
        console.log('[Mesh] Call closed with:', remotePeerId)
        delete callsRef.current[remotePeerId]
        delete remoteStreamsRef.current[remotePeerId]
        setRemoteStreams({ ...remoteStreamsRef.current })
      })
    }
  }, [peer, myPeerId])

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => {
        t.enabled = !t.enabled
      })
      setIsMuted(prev => !prev)
    }
  }, [localStream])

  const toggleCamera = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => {
        t.enabled = !t.enabled
      })
      setIsCameraOff(prev => !prev)
    }
  }, [localStream])

  const cleanup = useCallback(() => {
    Object.values(callsRef.current).forEach(call => {
      try { call.close() } catch (e) { /* ignored */ }
    })
    callsRef.current = {}
    remoteStreamsRef.current = {}

    if (localStream) {
      localStream.getTracks().forEach(t => t.stop())
      setLocalStream(null)
    }
    localStreamRef.current = null
    setRemoteStreams({})
    destroyPeer()
    setPeer(null)
    setMyPeerId('')
  }, [localStream])

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
