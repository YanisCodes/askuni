import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Video, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { fetchFocusScores } from '../../services/api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import JoinButton from '../../components/sessions/JoinButton';
import EmptyState from '../../components/common/EmptyState';

function getSessionStartTime(dateStr, timeSlot) {
  const startHour = parseInt(timeSlot.split(':')[0], 10)
  const d = new Date(dateStr)
  d.setHours(startHour, 0, 0, 0)
  return d
}

function isWithin5Min(dateStr, timeSlot) {
  // TODO: Remove for production - allows testing anytime
  return true
}

export default function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getSessionWithDetails, joinSession, leaveSession } = useData();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [focusScores, setFocusScores] = useState([]);
  const [showStats, setShowStats] = useState(false);

  const loadSession = useCallback(async () => {
    const data = await getSessionWithDetails(Number(id));
    setSession(data);
    setLoading(false);
  }, [id, getSessionWithDetails]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (session?.status === 'ended') {
      fetchFocusScores(session.id).then(setFocusScores).catch(() => {});
    }
  }, [session?.status, session?.id]);

  const handleJoin = async () => {
    await joinSession(session.id);
    loadSession();
  };

  const handleLeave = async () => {
    await leaveSession(session.id);
    loadSession();
  };

  const isCreator = user?.id === session?.creator?.id;
  const canStartOrJoin = useMemo(() => {
    if (!session) return false;
    return isWithin5Min(session.date, session.timeSlot) || session.status === 'live';
  }, [session]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-32 rounded-lg animate-shimmer" />
        <div className="glass rounded-2xl p-6 space-y-3">
          <div className="h-4 w-40 rounded-lg animate-shimmer" />
          <div className="h-4 w-56 rounded-lg animate-shimmer" />
          <div className="h-32 w-full rounded-lg animate-shimmer" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <EmptyState
        title="Session not found"
        description="This study session doesn't exist."
        action={<Link to="/sessions" className="text-slate-600 hover:text-slate-800 font-medium no-underline transition-colors">Back to Sessions</Link>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/sessions"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 no-underline transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Sessions
      </Link>

      <div className="glass-strong rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="blue">{session.module?.name}</Badge>
          {session.chapter && (
            <span className="text-slate-500">{session.chapter}</span>
          )}
          {session.status === 'live' && (
            <Badge variant="green">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            </Badge>
          )}
          {session.status === 'ended' && (
            <Badge variant="gray">Ended</Badge>
          )}
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-400 mt-4">
          <span className="flex items-center gap-1.5">
            <Calendar size={16} />
            {session.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={16} />
            {session.timeSlot}
          </span>
        </div>

        <div className="text-sm text-slate-500 mt-3">
          Created by <span className="font-medium text-slate-700">{session.creator?.name}</span>
        </div>

        <div className="border-t border-slate-200/50 my-6" />

        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Participants ({session.participantIds?.length || 0} / {session.maxParticipants})
        </h2>

        <div className="space-y-2.5 mb-6">
          {(session.participants || []).map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-medium">
                {p.name[0].toUpperCase()}
              </div>
              <span className="text-sm text-slate-700">{p.name}</span>
              {p.id === session.creator?.id && (
                <Badge variant="gray">Creator</Badge>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {session.status === 'upcoming' && canStartOrJoin && isCreator && (
            <Button
              onClick={() => navigate(`/sessions/${session.id}/live`)}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Video size={16} className="mr-2" />
              Start Session
            </Button>
          )}

          {session.status === 'upcoming' && canStartOrJoin && !isCreator && (
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-sm text-slate-600">Session starts soon!</p>
              <p className="text-xs text-slate-400 mt-1">Waiting for the creator to start...</p>
            </div>
          )}

          {session.status === 'live' && (
            <Button
              onClick={() => navigate(`/sessions/${session.id}/live`)}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Video size={16} className="mr-2" />
              Join Live Session
            </Button>
          )}

          {session.status === 'ended' && focusScores.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => setShowStats(!showStats)}
              className="w-full"
            >
              <BarChart3 size={16} className="mr-2" />
              {showStats ? 'Hide Statistics' : 'View Focus Statistics'}
            </Button>
          )}

          {session.status === 'ended' && showStats && (
            <div className="space-y-3 mt-4">
              {focusScores.map(s => {
                const isMe = s.user?.id === user?.id
                return (
                  <div key={s.id} className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        {s.user?.name || 'Unknown'}
                        {isMe && <span className="text-slate-400 font-normal"> (you)</span>}
                      </span>
                      <span className={`text-lg font-bold tabular-nums ${
                        s.score >= 70 ? 'text-emerald-600' : s.score >= 40 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {s.score}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${
                          s.score >= 70 ? 'bg-emerald-500' : s.score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>Focused: {Math.round(s.focusedSeconds / 60)}m</span>
                      <span>Distracted: {Math.round(s.distractedSeconds / 60)}m</span>
                      <span>Phone alerts: {s.phoneAlertsCount}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {session.status !== 'live' && session.status !== 'ended' && (
            <JoinButton
              session={session}
              onJoin={handleJoin}
              onLeave={handleLeave}
            />
          )}
        </div>
      </div>
    </div>
  );
}
