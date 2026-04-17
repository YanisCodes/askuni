import { BarChart3 } from 'lucide-react'

export default function SessionSummary({ focusScores, currentUser, onClose }) {
  const myScore = focusScores.find((s) => s.user?.id === currentUser?.id)
  const sortedScores = [...focusScores].sort((a, b) => b.score - a.score)

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500'
    if (score >= 60) return 'text-amber-500'
    return 'text-rose-500'
  }

  const getBarColor = (score) => {
    if (score >= 80) return 'bg-emerald-500'
    if (score >= 60) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="glass-strong rounded-2xl p-7 max-w-md w-full animate-fade-in-up space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white">
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Session Complete</h2>
            <p className="text-sm text-slate-400">Focus score results</p>
          </div>
        </div>

        {myScore && (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500 mb-2">Your Focus Score</p>
            <p className={`text-5xl font-bold ${getScoreColor(myScore.score)} tabular-nums`}>
              {myScore.score}%
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-500">
              <span>Focused: {formatDuration(myScore.focusedSeconds)}</span>
              <span>Distracted: {formatDuration(myScore.distractedSeconds)}</span>
            </div>
            {myScore.phoneAlertsCount > 0 && (
              <p className="text-xs text-rose-400 mt-2">
                {myScore.phoneAlertsCount} phone alert{myScore.phoneAlertsCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {sortedScores.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">All Participants</h3>
            {sortedScores.map((s) => (
              <div key={s.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {s.user?.name || 'Unknown'}
                    {s.user?.id === currentUser?.id && (
                      <span className="text-slate-400 font-normal"> (you)</span>
                    )}
                  </span>
                  <span className={`font-semibold tabular-nums ${getScoreColor(s.score)}`}>
                    {s.score}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${getBarColor(s.score)}`}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
