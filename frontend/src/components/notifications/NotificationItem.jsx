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
      className={`w-full text-left px-4 py-3 border-b border-secondary-100 hover:bg-secondary-50 transition-colors ${
        notification.isRead ? 'bg-white' : 'bg-primary-50'
      }`}
    >
      <p className="text-sm text-gray-800">{notification.message}</p>
      <p className="text-xs text-gray-500 mt-1">
        {formatRelativeTime(notification.createdAt)}
      </p>
    </button>
  );
}
