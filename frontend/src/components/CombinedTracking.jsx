import React, { useEffect, useRef, useState, useCallback } from "react";
import { FaceMesh, FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE, FACEMESH_FACE_OVAL, FACEMESH_LIPS } from "@mediapipe/face_mesh";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

// Finger color mapping
const FINGER_COLORS = ["#f59e0b","#f59e0b","#f59e0b","#f59e0b","#f59e0b","#22c55e","#22c55e","#22c55e","#22c55e","#3b82f6","#3b82f6","#3b82f6","#3b82f6","#a855f7","#a855f7","#a855f7","#a855f7","#f43f5e","#f43f5e","#f43f5e","#f43f5e"];

function getFingerColor(idx) {
  return FINGER_COLORS[idx] || "#94a3b8";
}

function drawFaceConnections(ctx, landmarks, connections, w, h, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  for (const [s, e] of connections) {
    const a = landmarks[s], b = landmarks[e];
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.moveTo(a.x * w, a.y * h);
    ctx.lineTo(b.x * w, b.y * h);
    ctx.stroke();
  }
}

export default function CombinedTrackingComponent() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const faceResultsRef = useRef(null);
  const handResultsRef = useRef(null);
  const animFrameRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [handCount, setHandCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    const w = video.videoWidth;
    const h = video.videoHeight;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    // Draw face mesh
    const faces = faceResultsRef.current?.multiFaceLandmarks || [];
    setFaceCount(faces.length);

    faces.forEach((landmarks) => {
      drawFaceConnections(ctx, landmarks, FACEMESH_TESSELATION, w, h, "rgba(148, 163, 184, 0.12)", 0.5);
      drawFaceConnections(ctx, landmarks, FACEMESH_FACE_OVAL, w, h, "rgba(148, 163, 184, 0.35)", 1);
      drawFaceConnections(ctx, landmarks, FACEMESH_RIGHT_EYE, w, h, "rgba(34, 197, 94, 0.5)", 1);
      drawFaceConnections(ctx, landmarks, FACEMESH_LEFT_EYE, w, h, "rgba(34, 197, 94, 0.5)", 1);
      drawFaceConnections(ctx, landmarks, FACEMESH_LIPS, w, h, "rgba(244, 63, 94, 0.4)", 1);

      landmarks.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x * w, point.y * h, 0.6, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(34, 197, 94, 0.25)";
        ctx.fill();
      });
    });

    // Draw hands
    const hands = handResultsRef.current?.multiHandLandmarks || [];
    const handedness = handResultsRef.current?.multiHandedness || [];
    setHandCount(hands.length);

    hands.forEach((landmarks, handIdx) => {
      for (const [sIdx, eIdx] of HAND_CONNECTIONS) {
        const s = landmarks[sIdx], e = landmarks[eIdx];
        if (!s || !e) continue;
        ctx.beginPath();
        ctx.moveTo(s.x * w, s.y * h);
        ctx.lineTo(e.x * w, e.y * h);
        ctx.strokeStyle = getFingerColor(eIdx) + "99";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      landmarks.forEach((point, i) => {
        const px = point.x * w, py = point.y * h;
        const color = getFingerColor(i);
        const r = i === 0 || i % 4 === 0 ? 4 : 3;

        ctx.beginPath();
        ctx.arc(px, py, r + 3, 0, 2 * Math.PI);
        ctx.fillStyle = color + "22";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, 2 * Math.PI);
        ctx.fillStyle = "#fff";
        ctx.fill();
      });

      const label = handedness[handIdx]?.label || "";
      if (label && landmarks[0]) {
        const wx = landmarks[0].x * w, wy = landmarks[0].y * h;
        ctx.font = "600 12px system-ui, sans-serif";
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.roundRect(wx - (tw + 12) / 2, wy + 10, tw + 12, 22, 6);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(label, wx, wy + 25);
        ctx.textAlign = "start";
      }
    });

    animFrameRef.current = requestAnimationFrame(draw);
  }, []);

  const startCamera = useCallback(async () => {
    if (isRunning) return;
    setLoading(true);
    setError(null);

    try {
      // Init Face Mesh
      const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 2,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      faceMesh.onResults((r) => { faceResultsRef.current = r; });
      await faceMesh.initialize();

      // Init Hands
      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      hands.onResults((r) => { handResultsRef.current = r; });
      await hands.initialize();

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (!videoRef.current) return;
            await Promise.all([
              faceMesh.send({ image: videoRef.current }),
              hands.send({ image: videoRef.current }),
            ]);
          },
          width: 640,
          height: 480,
        });

        cameraRef.current = camera;
        await camera.start();
        setIsRunning(true);
        animFrameRef.current = requestAnimationFrame(draw);
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
  }, [isRunning, draw]);

  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    faceResultsRef.current = null;
    handResultsRef.current = null;
    setIsRunning(false);
    setFaceCount(0);
    setHandCount(0);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (cameraRef.current) { cameraRef.current.stop(); }
      if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); }
    };
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
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            <p className="mt-3 text-sm">Camera is off</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
            <p className="mt-3 text-sm">Loading both models...</p>
          </div>
        )}

        {isRunning && (
          <div className="absolute top-3 left-3 flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium"
               style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#fff" }}>
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${faceCount > 0 ? "bg-emerald-400" : "bg-slate-400"}`} />
              {faceCount} face{faceCount !== 1 ? "s" : ""}
            </span>
            <span className="w-px h-3 bg-white/20" />
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${handCount > 0 ? "bg-amber-400" : "bg-slate-400"}`} />
              {handCount} hand{handCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

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
