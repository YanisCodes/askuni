import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatRelativeTime } from '../../utils/formatTime';
import { MessageSquare, User } from 'lucide-react';
import VoteButtons from './VoteButtons';
import { useData } from '../../contexts/DataContext';

export default function QuestionCard({ question, author, module, answerCount = 0 }) {
  const { voteOnQuestion } = useData();

  const handleVote = async (value) => {
    await voteOnQuestion(question.id, value);
  };

  return (
    <Link
      to={`/questions/${question.id}`}
      className="block glass rounded-xl p-5 card-hover"
    >
      <div className="flex items-start gap-5">
        <VoteButtons
          voteCount={question.voteCount || 0}
          userVote={question.userVote || 0}
          onVote={handleVote}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-[15.5px] font-semibold text-primary-800 leading-snug tracking-tight">
                {question.title}
              </h3>

              {question.description && (
                <p className="text-[13.5px] text-primary-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {question.description}
                </p>
              )}

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {module && <Badge variant="accent">{module.code}</Badge>}

                <span className="inline-flex items-center gap-1.5 text-[12px] text-primary-400">
                  <User size={12} strokeWidth={1.8} />
                  {author?.name || 'Unknown'}
                </span>

                <span className="text-[12px] text-primary-300">
                  · {formatRelativeTime(question.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-primary-500 shrink-0 bg-primary-100/70 px-2.5 py-1 rounded-md tabular-nums">
              <MessageSquare size={13} strokeWidth={1.8} />
              <span>{answerCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
