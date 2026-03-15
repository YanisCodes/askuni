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
      className="block glass rounded-2xl p-5 card-hover no-underline"
    >
      <div className="flex items-start gap-4">
        <VoteButtons
          voteCount={question.voteCount || 0}
          userVote={question.userVote || 0}
          onVote={handleVote}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-slate-800 truncate">
                {question.title}
              </h3>

              <p className="text-sm text-slate-400 mt-1.5 line-clamp-2">
                {question.description}
              </p>

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {module && (
                  <Badge variant="blue">{module.code}</Badge>
                )}

                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <User size={12} />
                  {author ? author.name : 'Unknown'}
                </span>

                <span className="text-xs text-slate-300">
                  {formatRelativeTime(question.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-slate-400 shrink-0 bg-slate-50 px-2.5 py-1 rounded-lg">
              <MessageSquare size={14} />
              <span>{answerCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
