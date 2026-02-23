import { formatRelativeTime } from '../../utils/formatTime';
import { User } from 'lucide-react';

export default function AnswerCard({ answer }) {
  return (
    <div className="bg-white rounded-xl border border-secondary-200 border-l-4 border-l-primary-500 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <User size={14} className="text-gray-400" />
          {answer.author ? answer.author.name : 'Unknown'}
        </span>
        <span className="text-xs text-gray-400">
          {formatRelativeTime(answer.createdAt)}
        </span>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {answer.content}
      </p>
    </div>
  );
}
