import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function JoinButton({ session, onJoin, onLeave }) {
  const { user } = useAuth();

  const handleClick = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  if (user.id === session.creatorId) {
    return <Badge variant="gray">Your Session</Badge>;
  }

  if (session.participantIds.includes(user.id)) {
    return (
      <Button
        variant="danger"
        size="sm"
        onClick={(e) => handleClick(e, onLeave)}
      >
        Leave
      </Button>
    );
  }

  if (session.participantIds.length >= session.maxParticipants) {
    return (
      <Button variant="secondary" size="sm" disabled>
        Full
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      className="bg-accent-500 text-white hover:bg-accent-600"
      onClick={(e) => handleClick(e, onJoin)}
    >
      Join
    </Button>
  );
}
