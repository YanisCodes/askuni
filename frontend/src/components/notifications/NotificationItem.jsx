import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/formatTime';

export default function NotificationItem({ notification, onRead }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
    navigate(`/questions/${notification.questionId}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left px-4 py-3 border-b border-slate-100/50 hover:bg-white/40 transition-colors ${
        notification.isRead ? '' : 'bg-slate-50/60'
      }`}
    >
      <p className="text-sm text-slate-700">{notification.message}</p>
      <p className="text-xs text-slate-400 mt-1">
        {formatRelativeTime(notification.createdAt)}
      </p>
    </button>
  );
}
