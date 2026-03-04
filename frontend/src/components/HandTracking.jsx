import React, { useEffect, useRef, useState, useCallback } from "react";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

// Finger color mapping
const FINGER_COLORS = {
  thumb: "#f59e0b",   // amber
  index: "#22c55e",   // green
  middle: "#3b82f6",  // blue
  ring: "#a855f7",    // purple
  pinky: "#f43f5e",   // rose
  palm: "#94a3b8",    // slate
};

// Map landmark index to finger
function getFingerColor(idx) {
  if (idx >= 1 && idx <= 4) return FINGER_COLORS.thumb;
  if (idx >= 5 && idx <= 8) return FINGER_COLORS.index;
  if (idx >= 9 && idx <= 12) return FINGER_COLORS.middle;
  if (idx >= 13 && idx <= 16) return FINGER_COLORS.ring;
  if (idx >= 17 && idx <= 20) return FINGER_COLORS.pinky;
  return FINGER_COLORS.palm;
}

export default function HandTrackingComponent({ onDetection }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const drawResults = useCallback((results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const hands = results.multiHandLandmarks || [];
    const handedness = results.multiHandedness || [];
    setHandCount(hands.length);

    if (onDetection) {
      onDetection(hands);
    }

    hands.forEach((landmarks, handIdx) => {
      const w = canvas.width;
      const h = canvas.height;

      // Draw connections
      for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
        const start = landmarks[startIdx];
        const end = landmarks[endIdx];
        if (!start || !end) continue;

        const color = getFingerColor(endIdx);

        ctx.beginPath();
        ctx.moveTo(start.x * w, start.y * h);
        ctx.lineTo(end.x * w, end.y * h);
        ctx.strokeStyle = color + "99";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw landmarks
      landmarks.forEach((point, i) => {
        const px = point.x * w;
        const py = point.y * h;
        const color = getFingerColor(i);
        const isJoint = i === 0 || i % 4 === 0;
        const radius = isJoint ? 4 : 3;

        // Outer glow
        ctx.beginPath();
        ctx.arc(px, py, radius + 3, 0, 2 * Math.PI);
        ctx.fillStyle = color + "22";
        ctx.fill();

        // Main dot
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        // White center
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, 2 * Math.PI);
        ctx.fillStyle = "#fff";
        ctx.fill();
      });

      // Hand label (Left/Right)
      const label = handedness[handIdx]?.label || "";
      if (label && landmarks[0]) {
        const wristX = landmarks[0].x * w;
        const wristY = landmarks[0].y * h;

        ctx.font = "600 12px system-ui, sans-serif";
        const textW = ctx.measureText(label).width;

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath();
        ctx.roundRect(wristX - (textW + 12) / 2, wristY + 10, textW + 12, 22, 6);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(label, wristX, wristY + 25);
        ctx.textAlign = "start";
      }
    });
  }, [onDetection]);

  const startCamera = useCallback(async () => {
    if (isRunning) return;
    setLoading(true);
    setError(null);

    try {
      const hands = new Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(drawResults);

      await hands.initialize();

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await hands.send({ image: videoRef.current });
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
          : "Failed to start camera. Please check your device."
      );
    } finally {
      setLoading(false);
    }
  }, [isRunning, drawResults]);

  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    setIsRunning(false);
    setHandCount(0);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Camera viewport */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          style={{ display: isRunning ? "block" : "none" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: isRunning ? "block" : "none" }}
        />

        {/* Idle state */}
        {!isRunning && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v0"/>
              <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/>
              <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/>
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-3.3 0-5.2-1.7-7-3.5"/>
            </svg>
            <p className="mt-3 text-sm">Camera is off</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
            <p className="mt-3 text-sm">Loading hand tracking model...</p>
          </div>
        )}

        {/* Hand count overlay */}
        {isRunning && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
               style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#fff" }}>
            <span className={`w-2 h-2 rounded-full ${handCount > 0 ? "bg-emerald-400" : "bg-slate-400"}`} />
            {handCount === 0
              ? "No hands detected"
              : `${handCount} hand${handCount > 1 ? "s" : ""} detected`}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-rose-50/80 border border-rose-200/60 text-rose-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={startCamera}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            {loading ? "Starting..." : "Start Camera"}
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 active:scale-[0.97] transition-all cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
}
