import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatRelativeTime } from '../../utils/formatTime';
import { MessageSquare, User } from 'lucide-react';

export default function QuestionCard({ question, author, module, answerCount = 0 }) {
  return (
    <Link
      to={`/questions/${question.id}`}
      className="block bg-white rounded-xl border border-secondary-200 p-5 hover:shadow-md hover:border-primary-300 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {question.title}
          </h3>

          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {question.description}
          </p>

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {module && (
              <Badge variant="blue">{module.code}</Badge>
            )}

            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <User size={12} />
              {author ? author.name : 'Unknown'}
            </span>

            <span className="text-xs text-gray-400">
              {formatRelativeTime(question.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-500 shrink-0">
          <MessageSquare size={16} />
          <span>{answerCount}</span>
        </div>
      </div>
    </Link>
  );
}
