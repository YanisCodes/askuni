import React, { useEffect, useRef, useState, useCallback } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { initPhoneDetector, detectPhone, createAlertManager } from "../utils/phoneDetection";

// How often to run the expensive ML inference (~7fps is plenty for detecting a phone)
const DETECTION_INTERVAL_MS = 150;
// Keep bounding box visible for this long after the last positive detection (prevents flicker)
const PERSIST_MS = 250;
// Exponential moving average factor for bounding box smoothing
const SMOOTH = 0.4;

function lerp(a, b) { return a + SMOOTH * (b - a); }

function drawPhoneAlert(ctx, w, h, message) {
  ctx.save();
  ctx.strokeStyle = "rgba(239, 68, 68, 0.7)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(3, 3, w - 6, h - 6, 12);
  ctx.stroke();

  const text = `⚠ ${message}`;
  ctx.font = "600 14px system-ui, sans-serif";
  const textWidth = ctx.measureText(text).width;
  const badgeW = textWidth + 28;
  const badgeH = 32;
  const badgeX = (w - badgeW) / 2;
  const badgeY = h - badgeH - 16;

  ctx.fillStyle = "rgba(220, 38, 38, 0.85)";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, badgeY + badgeH / 2);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

function drawPhoneBoundingBox(ctx, w, h, box, confidence) {
  if (!box) return;
  const { originX, originY, width, height } = box;
  ctx.save();
  ctx.strokeStyle = "rgba(239, 68, 68, 0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(originX, originY, width, height, 8);
  ctx.stroke();

  const label = `Cell phone ${(confidence * 100).toFixed(0)}%`;
  ctx.font = "600 12px system-ui, sans-serif";
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = "rgba(239, 68, 68, 0.9)";
  ctx.beginPath();
  ctx.roundRect(originX, originY - 24, tw + 16, 24, 4);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.textAlign = "start";
  ctx.textBaseline = "middle";
  ctx.fillText(label, originX + 8, originY - 12);
  ctx.restore();
}

export default function PhoneTrackingComponent() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const alertManagerRef = useRef(createAlertManager({ triggerAfterMs: 1500, cooldownMs: 8000 }));

  // Throttle state
  const lastDetectTimeRef = useRef(0);
  const lastDetectionRef = useRef({ phoneDetected: false, confidence: 0, boundingBox: null });
  const lastPhoneTimeRef = useRef(0); // timestamp of last positive detection
  const smoothedBoxRef = useRef(null);  // EMA-smoothed bounding box
  const canvasDirtyRef = useRef(false); // did we draw anything last frame?

  const phoneAlertRef = useRef(null);
  const [phoneAlert, setPhoneAlert] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectionStatus, setDetectionStatus] = useState(null); // { detected, confidence }

  const startCamera = useCallback(async () => {
    if (isRunning) return;
    setLoading(true);
    setError(null);
    setPhoneAlert(null);
    setDetectionStatus(null);
    phoneAlertRef.current = null;
    alertManagerRef.current.reset();

    try {
      await initPhoneDetector();

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: () => {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            if (!canvas || !video || video.videoWidth === 0) return;

            const w = video.videoWidth;
            const h = video.videoHeight;

            // Only resize canvas when dimensions actually change
            if (canvas.width !== w || canvas.height !== h) {
              canvas.width = w;
              canvas.height = h;
              canvasDirtyRef.current = false;
            }

            const now = performance.now();
            let detection = lastDetectionRef.current;

            // ── Throttled ML inference ─────────────────────────────────────────
            if (now - lastDetectTimeRef.current >= DETECTION_INTERVAL_MS) {
              lastDetectTimeRef.current = now;
              detection = detectPhone(video, now);
              lastDetectionRef.current = detection;

              // Update smoothed bounding box with EMA
              if (detection.phoneDetected && detection.boundingBox) {
                lastPhoneTimeRef.current = now;
                const b = detection.boundingBox;
                const prev = smoothedBoxRef.current;
                smoothedBoxRef.current = prev
                  ? { originX: lerp(prev.originX, b.originX), originY: lerp(prev.originY, b.originY), width: lerp(prev.width, b.width), height: lerp(prev.height, b.height) }
                  : { ...b };
              } else if (now - lastPhoneTimeRef.current > PERSIST_MS) {
                smoothedBoxRef.current = null;
              }

              // Alert manager only runs on detection frames
              const shouldAlert = alertManagerRef.current.update(detection);
              if (shouldAlert) {
                const alertData = { message: 'Phone detected!' };
                phoneAlertRef.current = alertData;
                setPhoneAlert(alertData);
                setTimeout(() => { phoneAlertRef.current = null; setPhoneAlert(null); }, 5000);
              }

              // Update React status badge (cheap setState throttled to detection rate)
              setDetectionStatus(detection.phoneDetected
                ? { detected: true, confidence: detection.confidence }
                : { detected: false, confidence: 0 }
              );
            }

            // ── Canvas drawing ─────────────────────────────────────────────────
            const boxVisible = smoothedBoxRef.current !== null;
            const hasOverlay = boxVisible || phoneAlertRef.current;

            if (!hasOverlay) {
              if (canvasDirtyRef.current) {
                canvas.getContext("2d").clearRect(0, 0, w, h);
                canvasDirtyRef.current = false;
              }
              return;
            }

            canvasDirtyRef.current = true;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, w, h);

            if (boxVisible) {
              drawPhoneBoundingBox(ctx, w, h, smoothedBoxRef.current, lastDetectionRef.current.confidence);
            }
            if (phoneAlertRef.current) {
              drawPhoneAlert(ctx, w, h, phoneAlertRef.current.message);
            }
          },
          width: 640,
          height: 480,
        });

        cameraRef.current = camera;
        await camera.start();
        setIsRunning(true);
      }
    } catch (err) {
      setError(
        err.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera permissions."
          : `Init Error: ${err.message || 'Failed to start object detector.'}`
      );
    } finally {
      setLoading(false);
    }
  }, [isRunning]);

  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    setIsRunning(false);
    setPhoneAlert(null);
    setDetectionStatus(null);
    phoneAlertRef.current = null;
    smoothedBoxRef.current = null;
    canvasDirtyRef.current = false;
    alertManagerRef.current.reset();
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    return () => { if (cameraRef.current) cameraRef.current.stop(); };
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay playsInline muted
          style={{ display: isRunning ? "block" : "none" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: isRunning ? "block" : "none" }}
        />

        {!isRunning && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            <p className="mt-3 text-sm">Camera is off</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
            <p className="mt-3 text-sm">Loading object detector...</p>
          </div>
        )}

        {/* Status badge — rendered in React, not canvas, so it never causes extra canvas work */}
        {isRunning && (
          <div
            className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#fff" }}
          >
            <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${detectionStatus?.detected ? "bg-rose-400 animate-pulse" : "bg-emerald-400"}`} />
            {detectionStatus?.detected
              ? `📱 Phone detected (${Math.round(detectionStatus.confidence * 100)}%)`
              : phoneAlert ? "Focus Lost: Phone" : "Focused"}
          </div>
        )}
      </div>

      {phoneAlert && (
        <div className="flex items-center justify-between gap-3 bg-rose-50/90 border border-rose-200/60 text-rose-700 text-sm rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.513 2.076a2 2 0 0 1 2.974 0l8.437 9.393a2 2 0 0 1 0 2.674l-8.437 9.393a2 2 0 0 1-2.974 0l-8.437-9.393a2 2 0 0 1 0-2.674z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              <span className="font-semibold">Alert:</span> Phone detected — please put it away to stay focused.
            </span>
          </div>
          <button
            onClick={() => { setPhoneAlert(null); phoneAlertRef.current = null; }}
            className="shrink-0 p-1 rounded-lg hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50/80 border border-rose-200/60 text-rose-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={startCamera}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            {loading ? "Starting..." : "Start Camera"}
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 active:scale-[0.97] transition-all cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
}
