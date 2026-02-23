import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import Badge from '../../components/common/Badge';
import JoinButton from '../../components/sessions/JoinButton';
import EmptyState from '../../components/common/EmptyState';

export default function SessionDetailPage() {
  const { id } = useParams();
  const { getSessionWithDetails, joinSession, leaveSession } = useData();

  const session = getSessionWithDetails(Number(id));

  if (!session) {
    return (
      <EmptyState
        title="Session not found"
        description="This study session doesn't exist."
        action={<Link to="/sessions" className="text-primary-600 hover:text-primary-700 font-medium no-underline">Back to Sessions</Link>}
      />
    );
  }

  return (
    <div>
      <Link
        to="/sessions"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4 no-underline"
      >
        <ArrowLeft size={16} />
        Back to Sessions
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="blue">{session.module?.name}</Badge>
          {session.chapter && (
            <span className="text-gray-600">{session.chapter}</span>
          )}
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500 mt-4">
          <span className="flex items-center gap-1">
            <Calendar size={16} />
            {session.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={16} />
            {session.timeSlot}
          </span>
        </div>

        <div className="text-sm text-gray-600 mt-3">
          Created by <span className="font-medium text-gray-800">{session.creator?.name}</span>
        </div>

        <div className="border-t border-secondary-200 my-6" />

        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Participants ({session.participantIds.length} / {session.maxParticipants})
        </h2>

        <div className="space-y-2 mb-6">
          {session.participants.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
                {p.name[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-800">{p.name}</span>
              {p.id === session.creatorId && (
                <Badge variant="gray">Creator</Badge>
              )}
            </div>
          ))}
        </div>

        <JoinButton
          session={session}
          onJoin={() => joinSession(session.id)}
          onLeave={() => leaveSession(session.id)}
        />
      </div>
    </div>
  );
}
