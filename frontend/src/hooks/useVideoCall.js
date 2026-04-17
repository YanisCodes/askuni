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

  const initPeer = useCallback(async () => {
    try {
      const p = await createPeer(userId)
      setPeer(p)
      setMyPeerId(p.id)

      listenForIncomingCalls(p, (call) => {
        if (!localStream) return

        call.answer(localStream)
        answerCall(call, (stream, peerId) => {
          remoteStreamsRef.current[peerId] = stream
          setRemoteStreams({ ...remoteStreamsRef.current })
        })
        callsRef.current[call.peer] = call
      })

      return p.id
    } catch (err) {
      console.error('Failed to init peer:', err)
      return null
    }
  }, [userId, localStream])

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setLocalStream(stream)
      return stream
    } catch (err) {
      console.error('Failed to get local stream:', err)
      return null
    }
  }, [])

  const connectToHost = useCallback((p, stream) => {
    if (!hostPeerId || !p || !stream) return
    const call = callPeer(p, hostPeerId, stream)
    if (call) {
      answerCall(call, (remoteStream, peerId) => {
        remoteStreamsRef.current[peerId] = remoteStream
        setRemoteStreams({ ...remoteStreamsRef.current })
      })
      callsRef.current[call.peer] = call
    }
  }, [hostPeerId])

  const connectToPeer = useCallback((remotePeerId) => {
    if (!peer || !localStream || callsRef.current[remotePeerId]) return
    const call = callPeer(peer, remotePeerId, localStream)
    if (call) {
      answerCall(call, (stream, peerId) => {
        remoteStreamsRef.current[peerId] = stream
        setRemoteStreams({ ...remoteStreamsRef.current })
      })
      callsRef.current[remotePeerId] = call
    }
  }, [peer, localStream])

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
