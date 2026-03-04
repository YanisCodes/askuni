import React, { useEffect, useRef, useState, useCallback } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

// MediaPipe Face Mesh tessellation connections (triangles that form the mesh)
import { FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE, FACEMESH_FACE_OVAL, FACEMESH_LIPS } from "@mediapipe/face_mesh";

export default function FaceDetectionComponent({ onDetection }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
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

    const faces = results.multiFaceLandmarks || [];
    setFaceCount(faces.length);

    if (onDetection) {
      onDetection(faces);
    }

    faces.forEach((landmarks) => {
      // Draw tessellation (the mesh)
      drawConnections(ctx, landmarks, FACEMESH_TESSELATION, canvas.width, canvas.height, "rgba(148, 163, 184, 0.15)", 0.5);

      // Draw face oval
      drawConnections(ctx, landmarks, FACEMESH_FACE_OVAL, canvas.width, canvas.height, "rgba(148, 163, 184, 0.4)", 1);

      // Draw eyes
      drawConnections(ctx, landmarks, FACEMESH_RIGHT_EYE, canvas.width, canvas.height, "rgba(34, 197, 94, 0.6)", 1);
      drawConnections(ctx, landmarks, FACEMESH_LEFT_EYE, canvas.width, canvas.height, "rgba(34, 197, 94, 0.6)", 1);

      // Draw lips
      drawConnections(ctx, landmarks, FACEMESH_LIPS, canvas.width, canvas.height, "rgba(244, 63, 94, 0.5)", 1);

      // Draw keypoints (small dots on each landmark)
      landmarks.forEach((point) => {
        const px = point.x * canvas.width;
        const py = point.y * canvas.height;

        ctx.beginPath();
        ctx.arc(px, py, 0.8, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(34, 197, 94, 0.35)";
        ctx.fill();
      });
    });
  }, [onDetection]);

  const startCamera = useCallback(async () => {
    if (isRunning) return;
    setLoading(true);
    setError(null);

    try {
      const faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 2,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults(drawResults);

      await faceMesh.initialize();

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await faceMesh.send({ image: videoRef.current });
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
    setFaceCount(0);

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
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            <p className="mt-3 text-sm">Camera is off</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
            <p className="mt-3 text-sm">Loading face mesh model...</p>
          </div>
        )}

        {/* Face count overlay */}
        {isRunning && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
               style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#fff" }}>
            <span className={`w-2 h-2 rounded-full ${faceCount > 0 ? "bg-emerald-400" : "bg-slate-400"}`} />
            {faceCount === 0
              ? "No face detected"
              : `${faceCount} face${faceCount > 1 ? "s" : ""} detected`}
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

function drawConnections(ctx, landmarks, connections, width, height, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (const connection of connections) {
    const [startIdx, endIdx] = connection;
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    if (!start || !end) continue;

    ctx.beginPath();
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
    ctx.stroke();
  }
}
