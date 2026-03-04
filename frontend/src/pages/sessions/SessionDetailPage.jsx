import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import Badge from '../../components/common/Badge';
import JoinButton from '../../components/sessions/JoinButton';
import EmptyState from '../../components/common/EmptyState';

export default function SessionDetailPage() {
  const { id } = useParams();
  const { getSessionWithDetails, joinSession, leaveSession } = useData();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const data = await getSessionWithDetails(Number(id));
    setSession(data);
    setLoading(false);
  }, [id, getSessionWithDetails]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleJoin = async () => {
    await joinSession(session.id);
    loadSession();
  };

  const handleLeave = async () => {
    await leaveSession(session.id);
    loadSession();
  };

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
    <div>
      <Link
        to="/sessions"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-5 no-underline transition-colors"
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

        <JoinButton
          session={session}
          onJoin={handleJoin}
          onLeave={handleLeave}
        />
      </div>
    </div>
  );
}
