import { Link } from 'react-router-dom';
import { Calendar, Clock, User } from 'lucide-react';
import Badge from '../common/Badge';

export default function SessionCard({ session }) {
  const percentage = (session.participantCount / session.maxParticipants) * 100;

  return (
    <Link
      to={`/sessions/${session.id}`}
      className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 hover:shadow-md transition-shadow block no-underline"
    >
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="blue">{session.moduleName}</Badge>
        {session.chapter && (
          <span className="text-sm text-gray-600">{session.chapter}</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {session.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {session.timeSlot}
        </span>
      </div>

      <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
        <User size={14} />
        <span>{session.creatorName}</span>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>
            {session.participantCount} / {session.maxParticipants} participants
          </span>
        </div>
        <div className="h-2 bg-secondary-200 rounded-full">
          <div
            className="h-2 bg-primary-500 rounded-full transition-all"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
