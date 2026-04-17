import { Mic, MicOff, Video, VideoOff, Smartphone, LogOut } from 'lucide-react'

export default function ControlBar({
  isMuted,
  isCameraOff,
  isTracking,
  phoneAlert,
  currentScore,
  onToggleMute,
  onToggleCamera,
  onToggleFocus,
  onLeave,
}) {
  return (
    <div className="glass-strong rounded-2xl p-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMute}
          className={`p-2.5 rounded-xl transition-all duration-200 ${
            isMuted
              ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30'
              : 'glass text-slate-600 hover:text-slate-800'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <button
          onClick={onToggleCamera}
          className={`p-2.5 rounded-xl transition-all duration-200 ${
            isCameraOff
              ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30'
              : 'glass text-slate-600 hover:text-slate-800'
          }`}
          title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isCameraOff ? <VideoOff size={18} /> : <Video size={18} />}
        </button>

        <button
          onClick={onToggleFocus}
          className={`p-2.5 rounded-xl transition-all duration-200 ${
            isTracking
              ? 'bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30'
              : 'glass text-slate-600 hover:text-slate-800'
          }`}
          title={isTracking ? 'Focus tracking active' : 'Enable focus tracking'}
        >
          <Smartphone size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {isTracking && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass">
            <span
              className={`w-2 h-2 rounded-full ${
                currentScore >= 70
                  ? 'bg-emerald-500'
                  : currentScore >= 40
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
              }`}
            />
            <span className="text-sm font-semibold text-slate-700 tabular-nums">
              {currentScore}%
            </span>
          </div>
        )}

        {phoneAlert && (
          <div className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-600 text-sm font-medium animate-pulse">
            {phoneAlert}
          </div>
        )}
      </div>

      <button
        onClick={onLeave}
        className="p-2.5 rounded-xl bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 transition-all duration-200"
        title="Leave session"
      >
        <LogOut size={18} />
      </button>
    </div>
  )
}
