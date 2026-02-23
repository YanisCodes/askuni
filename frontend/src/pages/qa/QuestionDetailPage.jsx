import { useParams, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import AnswerCard from '../../components/qa/AnswerCard';
import AnswerForm from '../../components/qa/AnswerForm';
import Badge from '../../components/common/Badge';
import { formatRelativeTime } from '../../utils/formatTime';
import { ArrowLeft, User, MessageSquare } from 'lucide-react';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const { getQuestionWithDetails } = useData();

  const question = getQuestionWithDetails(Number(id));

  if (!question) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-gray-900">Question not found</h2>
        <p className="text-sm text-gray-500 mt-1">This question may have been removed.</p>
        <Link to="/" className="text-primary-600 text-sm font-medium hover:text-primary-700 mt-4 inline-block">
          Back to Questions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Questions
      </Link>

      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {question.module && (
            <Badge variant="blue">{question.module.code}</Badge>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <User size={12} />
            {question.author ? question.author.name : 'Unknown'}
          </span>
          <span className="text-xs text-gray-400">
            {formatRelativeTime(question.createdAt)}
          </span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-3">
          {question.title}
        </h1>

        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {question.description}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <MessageSquare size={18} className="text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">
          {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
      </div>

      {question.answers.length > 0 ? (
        <div className="space-y-3">
          {question.answers.map((answer) => (
            <AnswerCard key={answer.id} answer={answer} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-4">No answers yet. Be the first to help!</p>
      )}

      <AnswerForm questionId={question.id} />
    </div>
  );
}
