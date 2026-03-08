import React, { useEffect, useRef, useState, useCallback } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { initPhoneDetector, destroyPhoneDetector, detectPhone, createAlertManager } from "../utils/phoneDetection";

// ── Phone alert overlay drawn on the canvas ──
function drawPhoneAlert(ctx, w, h, message) {
    // Red tinted border around the entire feed
    ctx.save();
    ctx.strokeStyle = "rgba(239, 68, 68, 0.7)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(3, 3, w - 6, h - 6, 12);
    ctx.stroke();

    // Alert badge at the bottom center
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

function drawPhoneBoundingBox(ctx, w, h, boundingBox, confidence) {
    if (!boundingBox) return;

    const { originX, originY, width, height } = boundingBox;

    ctx.save();
    // Draw the red box around the phone
    ctx.strokeStyle = "rgba(239, 68, 68, 0.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(originX, originY, width, height, 8);
    ctx.stroke();

    // Draw the label
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
    const animFrameRef = useRef(null);
    const alertManagerRef = useRef(createAlertManager({ triggerAfterMs: 1500, cooldownMs: 8000 }));

    const [isRunning, setIsRunning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [phoneAlert, setPhoneAlert] = useState(null); // { message }
    const phoneAlertRef = useRef(null); // mirror for the draw loop
    const phoneDetectionRef = useRef({ phoneDetected: false }); // pure state tracking for debug loop

    const startCamera = useCallback(async () => {
        if (isRunning) return;
        setLoading(true);
        setError(null);
        setPhoneAlert(null);
        phoneAlertRef.current = null;
        alertManagerRef.current.reset();

        try {
            // Init ONLY the Object Detector (No FaceMesh/Hands WebGL clashing)
            await initPhoneDetector();

            if (videoRef.current) {
                const camera = new Camera(videoRef.current, {
                    onFrame: async () => {
                        const canvas = canvasRef.current;
                        const video = videoRef.current;
                        if (!canvas || !video) return;

                        const ctx = canvas.getContext("2d");
                        const w = video.videoWidth;
                        const h = video.videoHeight;
                        canvas.width = w;
                        canvas.height = h;
                        ctx.clearRect(0, 0, w, h);

                        // ── Phone object detection ──
                        const detection = detectPhone(video, performance.now());
                        phoneDetectionRef.current = detection;

                        // Draw bounding box tracking
                        if (detection.phoneDetected && detection.boundingBox) {
                            drawPhoneBoundingBox(ctx, w, h, detection.boundingBox, detection.confidence);
                        }

                        const shouldAlert = alertManagerRef.current.update(detection);
                        if (shouldAlert) {
                            phoneAlertRef.current = { message: detection.message };
                            setPhoneAlert({ message: detection.message });
                            // Auto-dismiss after 5 seconds
                            setTimeout(() => {
                                phoneAlertRef.current = null;
                                setPhoneAlert(null);
                            }, 5000);
                        }

                        if (phoneAlertRef.current) {
                            drawPhoneAlert(ctx, w, h, phoneAlertRef.current.message);
                        }

                        // ── Debug overlay (bottom-right) ──
                        {
                            ctx.save();
                            const det = phoneDetectionRef.current;
                            const debugText = det.phoneDetected
                                ? `📱 Detected (${Math.round(det.confidence * 100)}%)`
                                : "✓ No phone";
                            const debugColor = det.phoneDetected
                                ? "rgba(239, 68, 68, 0.9)"
                                : "rgba(34, 197, 94, 0.7)";

                            ctx.font = "500 11px system-ui, sans-serif";
                            const tw = ctx.measureText(debugText).width;
                            const px = w - tw - 20;
                            const py = h - 16;

                            ctx.fillStyle = "rgba(0,0,0,0.5)";
                            ctx.beginPath();
                            ctx.roundRect(px - 8, py - 13, tw + 16, 20, 6);
                            ctx.fill();

                            ctx.fillStyle = debugColor;
                            ctx.fillText(debugText, px, py);
                            ctx.restore();
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
            console.error("Camera/Model Initialization failed:", err);
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
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
        }

        setIsRunning(false);
        setPhoneAlert(null);
        phoneAlertRef.current = null;
        alertManagerRef.current.reset();

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
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                            <circle cx="12" cy="13" r="3" />
                        </svg>
                        <p className="mt-3 text-sm">Camera is off</p>
                    </div>
                )}

                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
                        <p className="mt-3 text-sm">Loading Object Detector...</p>
                    </div>
                )}

                {isRunning && (
                    <div className="absolute top-3 left-3 flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium"
                        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#fff" }}>
                        <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${phoneAlert ? "bg-rose-400 animate-pulse" : "bg-emerald-400"}`} />
                            {phoneAlert ? "Focus Lost: Phone" : "Focused"}
                        </span>
                    </div>
                )}
            </div>

            {/* Phone alert banner */}
            {phoneAlert && (
                <div className="flex items-center justify-between gap-3 bg-rose-50/90 border border-rose-200/60 text-rose-700 text-sm rounded-xl px-4 py-3 animate-fade-in-up">
                    <div className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.513 2.076a2 2 0 0 1 2.974 0l8.437 9.393a2 2 0 0 1 0 2.674l-8.437 9.393a2 2 0 0 1-2.974 0l-8.437-9.393a2 2 0 0 1 0-2.674z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>
                            <span className="font-semibold">Alert:</span>{" "}
                            {phoneAlert.message} — Please put your phone away to stay focused.
                        </span>
                    </div>
                    <button
                        onClick={() => { setPhoneAlert(null); phoneAlertRef.current = null; }}
                        className="shrink-0 p-1 rounded-lg hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
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
