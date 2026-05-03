import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Smartphone, Clock, TrendingUp } from 'lucide-react'
import { fetchMyFocusHistory } from '../../services/api'

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(seconds || 0))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function getScoreColor(score) {
  if (score >= 80) return 'text-emerald-500'
  if (score >= 60) return 'text-amber-500'
  return 'text-rose-500'
}

function getBarColor(score) {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-500'
  return 'bg-rose-500'
}

export default function FocusHistoryPage() {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMyFocusHistory()
      .then(data => setScores(data || []))
      .catch(e => {
        console.error('Failed to load focus history:', e)
        setError('Could not load your focus history.')
      })
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    if (scores.length === 0) {
      return { count: 0, avg: 0, focused: 0, distracted: 0, alerts: 0 }
    }
    const sumFocused = scores.reduce((a, s) => a + (s.focusedSeconds || 0), 0)
    const sumDistracted = scores.reduce((a, s) => a + (s.distractedSeconds || 0), 0)
    const sumAlerts = scores.reduce((a, s) => a + (s.phoneAlertsCount || 0), 0)
    const avg = Math.round(scores.reduce((a, s) => a + (s.score || 0), 0) / scores.length)
    return {
      count: scores.length,
      avg,
      focused: sumFocused,
      distracted: sumDistracted,
      alerts: sumAlerts,
    }
  }, [scores])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-1">
        <BarChart3 size={22} className="text-slate-400" />
        <h1 className="text-2xl font-bold text-slate-800">Focus History</h1>
      </div>
      <p className="text-slate-400 mb-6">Your focus stats from past study sessions.</p>

      {error && (
        <div className="bg-rose-50/80 border border-rose-200/60 text-rose-600 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {scores.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <BarChart3 size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No focus scores yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Enable focus tracking during a live session to start building your history.
          </p>
          <Link
            to="/sessions"
            className="inline-block mt-4 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Browse sessions
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                <TrendingUp size={14} />
                <span>Average score</span>
              </div>
              <p className={`text-2xl font-bold tabular-nums ${getScoreColor(stats.avg)}`}>
                {stats.avg}%
              </p>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                <BarChart3 size={14} />
                <span>Sessions tracked</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 tabular-nums">{stats.count}</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                <Clock size={14} />
                <span>Total focused</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 tabular-nums">{formatDuration(stats.focused)}</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                <Smartphone size={14} />
                <span>Phone alerts</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 tabular-nums">{stats.alerts}</p>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Past sessions</h2>
            <div className="space-y-4">
              {scores.map(s => {
                const moduleName = s.session?.module?.name || s.session?.module?.code || 'Session'
                const chapter = s.session?.chapter
                const date = s.session?.date
                return (
                  <div key={s.id} className="space-y-2 pb-4 border-b border-slate-200/60 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={`/sessions/${s.session?.id}`}
                          className="font-medium text-slate-800 hover:text-slate-600 transition-colors block truncate no-underline"
                        >
                          {moduleName}{chapter ? ` — ${chapter}` : ''}
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {date} · Focused {formatDuration(s.focusedSeconds)} · Distracted {formatDuration(s.distractedSeconds)}
                          {s.phoneAlertsCount > 0 && ` · ${s.phoneAlertsCount} phone alert${s.phoneAlertsCount > 1 ? 's' : ''}`}
                        </p>
                      </div>
                      <span className={`shrink-0 font-semibold tabular-nums ${getScoreColor(s.score)}`}>
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
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
