import { Link } from 'react-router-dom';
import { Calendar, Clock, User } from 'lucide-react';
import Badge from '../common/Badge';

export default function SessionCard({ session }) {
  const participantCount = session.participantIds?.length || 0;
  const percentage = (participantCount / session.maxParticipants) * 100;

  return (
    <Link
      to={`/sessions/${session.id}`}
      className="glass rounded-2xl p-5 card-hover block no-underline"
    >
      <div className="flex items-center gap-2 mb-2">
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
