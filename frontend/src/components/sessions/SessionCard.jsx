import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Trash2 } from 'lucide-react';
import Badge from '../common/Badge';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

export default function SessionCard({ session }) {
  const { removeSession } = useData();
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const participantCount = session.participantIds?.length || 0;
  const percentage = (participantCount / session.maxParticipants) * 100;

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this session and all its messages?')) return;
    setDeleting(true);
    try {
      await removeSession(session.id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <Link
      to={`/sessions/${session.id}`}
      className="glass rounded-2xl p-5 card-hover block no-underline"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {session.status === 'live' && (
            <Badge variant="green">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
              Live
            </Badge>
          )}
          {session.status === 'ended' && <Badge variant="gray">Ended</Badge>}
          <Badge variant="blue">{session.module?.name || 'Unknown'}</Badge>
          {session.chapter && (
            <span className="text-sm text-slate-500">{session.chapter}</span>
          )}
        </div>

        {user?.isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 shrink-0"
            title="Delete session"
          >
            <Trash2 size={14} strokeWidth={1.8} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} />
          {session.date}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          {session.timeSlot}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-2">
        <User size={14} />
        <span>{session.creator?.name || 'Unknown'}</span>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>
            {participantCount} / {session.maxParticipants} participants
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-1.5 bg-slate-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%`, animation: 'progressFill 0.8s ease-out' }}
          />
        </div>
      </div>
    </Link>
  );
}
