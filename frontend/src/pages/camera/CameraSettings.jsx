import React, { useState, useRef, useCallback, useEffect } from "react";
import FaceMesh from "../../components/FaceDetection";
import HandTracking from "../../components/HandTracking";
import PhoneTracking from "../../components/PhoneTracking";
import { Camera, ShieldCheck, Info, Scan, Hand, Smartphone, Maximize2, Minimize2, Expand, Shrink } from "lucide-react";

const MODES = [
  { id: "face", label: "Face Mesh", icon: Scan },
  { id: "hands", label: "Hand Tracking", icon: Hand },
  { id: "phone", label: "Phone Detection", icon: Smartphone },
];

const MODE_INFO = {
  face: {
    title: "Face Mesh",
    subtitle: "Real-time 468-point face mesh powered by MediaPipe",
    details: [
      "Click \"Start Camera\" to activate your webcam",
      "468 facial landmarks are tracked in real-time",
      "Mesh tessellation, eyes, lips and face oval are drawn",
      "Supports up to 2 faces simultaneously",
    ],
  },
  hands: {
    title: "Hand Tracking",
    subtitle: "Real-time 21-point hand landmark tracking powered by MediaPipe",
    details: [
      "Click \"Start Camera\" to activate your webcam",
      "21 landmarks per hand are tracked in real-time",
      "Each finger is color-coded for clarity",
      "Supports up to 2 hands simultaneously",
    ],
  },
  phone: {
    title: "Phone Detection",
    subtitle: "Real-time attention monitoring (Object Detection)",
    details: [
      "Click \"Start Camera\" to activate your webcam",
      "Uses MediaPipe Tasks Vision to detect cell phones",
      "Alerts the user when a phone is held up for more than ~1.5 seconds",
      "Runs completely independently to avoid WASM memory clashing with Face/Hand logic",
    ],
  },
};

export default function CameraSettings() {
  const [mode, setMode] = useState("face");
  const [expanded, setExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const feedRef = useRef(null);
  const info = MODE_INFO[mode];

  const toggleFullscreen = useCallback(() => {
    if (!feedRef.current) return;
    if (!document.fullscreenElement) {
      feedRef.current.requestFullscreen().catch(() => { });
    } else {
      document.exitFullscreen().catch(() => { });
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-1">
        <Camera size={22} className="text-slate-400" />
        <h1 className="text-2xl font-bold text-slate-800">{info.title}</h1>
      </div>
      <p className="text-slate-400 mb-6">{info.subtitle}</p>

      {/* Mode tabs + view controls */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-2">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${mode === id
                ? "bg-slate-800 text-white shadow-sm"
                : "glass text-slate-500 hover:text-slate-700"
                }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium glass text-slate-500 hover:text-slate-700 transition-all duration-200 cursor-pointer"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <Shrink size={14} /> : <Expand size={14} />}
            {expanded ? "Collapse" : "Expand"}
          </button>
          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium glass text-slate-500 hover:text-slate-700 transition-all duration-200 cursor-pointer"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {isFullscreen ? "Exit" : "Fullscreen"}
          </button>
        </div>
      </div>

      <div className={`grid gap-6 transition-all duration-300 ${expanded ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}>
        {/* Camera feed */}
        <div className={expanded ? "" : "lg:col-span-2"}>
          <div ref={feedRef} className="glass-strong rounded-2xl p-5 bg-slate-900/5" style={isFullscreen ? { display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", borderRadius: 0, height: "100%" } : {}}>
            {mode === "face" && <FaceMesh />}
            {mode === "hands" && <HandTracking />}
            {mode === "phone" && <PhoneTracking />}
          </div>
        </div>

        {/* Info panel - hidden when expanded */}
        {!expanded && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} className="text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-700">How it works</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {info.details.map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-700">Privacy</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                All processing happens locally in your browser. No video data is sent to any server.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
