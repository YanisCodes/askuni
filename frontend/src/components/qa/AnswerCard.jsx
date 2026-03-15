import { formatRelativeTime } from '../../utils/formatTime';
import { User } from 'lucide-react';
import VoteButtons from './VoteButtons';

export default function AnswerCard({ answer, onVote }) {
  return (
    <div className="glass rounded-2xl p-5 border-l-4 border-l-slate-600">
      <div className="flex items-start gap-4">
        <VoteButtons
          voteCount={answer.voteCount || 0}
          userVote={answer.userVote || 0}
          onVote={(value) => onVote(answer.id, value)}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <User size={14} className="text-slate-400" />
              {answer.author ? answer.author.name : 'Unknown'}
            </span>
            <span className="text-xs text-slate-300">
              {formatRelativeTime(answer.createdAt)}
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {answer.content}
          </p>
        </div>
      </div>
    </div>
  );
}
