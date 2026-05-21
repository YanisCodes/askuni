import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatRelativeTime } from '../../utils/formatTime';
import { MessageSquare, User, Trash2 } from 'lucide-react';
import VoteButtons from './VoteButtons';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

export default function QuestionCard({ question, author, module, answerCount = 0 }) {
  const { voteOnQuestion, removeQuestion } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleVote = async (value) => {
    await voteOnQuestion(question.id, value);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this question and all its answers?')) return;
    setDeleting(true);
    try {
      await removeQuestion(question.id);
      navigate('/');
    } catch {
      setDeleting(false);
    }
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

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-primary-500 bg-primary-100/70 px-2.5 py-1 rounded-md tabular-nums">
                <MessageSquare size={13} strokeWidth={1.8} />
                <span>{answerCount}</span>
              </div>

              {user?.isAdmin && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                  title="Delete question"
                >
                  <Trash2 size={14} strokeWidth={1.8} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
