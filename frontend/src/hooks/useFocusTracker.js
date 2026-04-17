import { useState, useRef, useCallback, useEffect } from 'react'
import { initPhoneDetector, destroyPhoneDetector, detectPhone, createAlertManager } from '../utils/phoneDetection'

export default function useFocusTracker() {
  const [isTracking, setIsTracking] = useState(false)
  const [currentScore, setCurrentScore] = useState(100)
  const [focusStats, setFocusStats] = useState({
    focusedSeconds: 0,
    distractedSeconds: 0,
    phoneAlertsCount: 0,
    durationSeconds: 0,
  })
  const [phoneAlert, setPhoneAlert] = useState(null)

  const trackingRef = useRef({
    startTime: null,
    focusedSeconds: 0,
    distractedSeconds: 0,
    phoneAlertsCount: 0,
    lastTickTime: null,
    wasDistracted: false,
    videoRef: null,
    animFrameId: null,
    alertManager: createAlertManager({ triggerAfterMs: 1500, cooldownMs: 8000 }),
    lastTimestamp: 0,
  })

  const startTracking = useCallback(async (videoElement) => {
    try {
      await initPhoneDetector()
      trackingRef.current.videoRef = videoElement
      trackingRef.current.startTime = Date.now()
      trackingRef.current.lastTickTime = Date.now()
      trackingRef.current.focusedSeconds = 0
      trackingRef.current.distractedSeconds = 0
      trackingRef.current.phoneAlertsCount = 0
      trackingRef.current.wasDistracted = false
      trackingRef.current.lastTimestamp = 0
      trackingRef.current.alertManager.reset()
      setIsTracking(true)

      const tick = () => {
        const now = Date.now()
        const elapsed = (now - trackingRef.current.lastTickTime) / 1000
        trackingRef.current.lastTickTime = now

        const video = trackingRef.current.videoRef
        let isDistracted = false

        if (video && video.readyState >= 2) {
          const timestamp = video.currentTime * 1000
          if (timestamp !== trackingRef.current.lastTimestamp) {
            trackingRef.current.lastTimestamp = timestamp
            const result = detectPhone(video, timestamp)
            isDistracted = result.phoneDetected

            if (result.phoneDetected) {
              const shouldAlert = trackingRef.current.alertManager.update(result)
              if (shouldAlert) {
                trackingRef.current.phoneAlertsCount++
                setPhoneAlert(result.message)
                setTimeout(() => setPhoneAlert(null), 3000)
              }
            } else {
              trackingRef.current.alertManager.update(result)
              setPhoneAlert(null)
            }
          }
        }

        if (isDistracted) {
          trackingRef.current.distractedSeconds += elapsed
          trackingRef.current.wasDistracted = true
        } else {
          trackingRef.current.focusedSeconds += elapsed
          trackingRef.current.wasDistracted = false
        }

        const totalFocused = trackingRef.current.focusedSeconds
        const totalDistracted = trackingRef.current.distractedSeconds
        const totalDuration = totalFocused + totalDistracted
        const score = totalDuration > 0 ? Math.round((totalFocused / totalDuration) * 100) : 100

        setCurrentScore(score)
        setFocusStats({
          focusedSeconds: Math.round(totalFocused),
          distractedSeconds: Math.round(totalDistracted),
          phoneAlertsCount: trackingRef.current.phoneAlertsCount,
          durationSeconds: Math.round(totalDuration),
        })

        trackingRef.current.animFrameId = requestAnimationFrame(tick)
      }

      trackingRef.current.animFrameId = requestAnimationFrame(tick)
    } catch (err) {
      console.error('Failed to start focus tracking:', err)
      setIsTracking(false)
    }
  }, [])

  const stopTracking = useCallback(() => {
    if (trackingRef.current.animFrameId) {
      cancelAnimationFrame(trackingRef.current.animFrameId)
    }
    destroyPhoneDetector()
    setIsTracking(false)
    setPhoneAlert(null)

    const totalFocused = trackingRef.current.focusedSeconds
    const totalDistracted = trackingRef.current.distractedSeconds
    const totalDuration = totalFocused + totalDistracted
    const score = totalDuration > 0 ? Math.round((totalFocused / totalDuration) * 100) : 100

    return {
      score,
      focusedSeconds: Math.round(totalFocused),
      distractedSeconds: Math.round(totalDistracted),
      phoneAlertsCount: trackingRef.current.phoneAlertsCount,
      durationSeconds: Math.round(totalDuration),
    }
  }, [])

  useEffect(() => {
    return () => {
      if (trackingRef.current.animFrameId) {
        cancelAnimationFrame(trackingRef.current.animFrameId)
      }
      destroyPhoneDetector()
    }
  }, [])

  return {
    isTracking,
    currentScore,
    focusStats,
    phoneAlert,
    startTracking,
    stopTracking,
  }
}
