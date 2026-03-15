import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import AnswerCard from '../../components/qa/AnswerCard';
import AnswerForm from '../../components/qa/AnswerForm';
import VoteButtons from '../../components/qa/VoteButtons';
import Badge from '../../components/common/Badge';
import { formatRelativeTime } from '../../utils/formatTime';
import { ArrowLeft, User, MessageSquare } from 'lucide-react';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const { getQuestionWithDetails, voteOnQuestion, voteOnAnswer } = useData();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadQuestion = useCallback(async () => {
    const data = await getQuestionWithDetails(Number(id));
    setQuestion(data);
    setLoading(false);
  }, [id, getQuestionWithDetails]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  const handleQuestionVote = async (value) => {
    const result = await voteOnQuestion(Number(id), value);
    setQuestion(prev => prev ? { ...prev, voteCount: result.voteCount, userVote: result.userVote } : prev);
  };

  const handleAnswerVote = async (answerId, value) => {
    const result = await voteOnAnswer(answerId, value);
    setQuestion(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: prev.answers.map(a =>
          a.id === answerId
            ? { ...a, voteCount: result.voteCount, userVote: result.userVote }
            : a
        ),
      };
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-32 rounded-lg animate-shimmer" />
        <div className="glass rounded-2xl p-6 space-y-3">
          <div className="h-4 w-24 rounded-lg animate-shimmer" />
          <div className="h-6 w-3/4 rounded-lg animate-shimmer" />
          <div className="h-20 w-full rounded-lg animate-shimmer" />
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-16 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-slate-800">Question not found</h2>
        <p className="text-sm text-slate-400 mt-1">This question may have been removed.</p>
        <Link to="/" className="text-slate-600 text-sm font-medium hover:text-slate-800 mt-4 inline-block transition-colors">
          Back to Questions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Questions
      </Link>

      <div className="glass-strong rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-start gap-4">
          <VoteButtons
            voteCount={question.voteCount || 0}
            userVote={question.userVote || 0}
            onVote={handleQuestionVote}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {question.module && (
                <Badge variant="blue">{question.module.code}</Badge>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <User size={12} />
                {question.author ? question.author.name : 'Unknown'}
              </span>
              <span className="text-xs text-slate-300">
                {formatRelativeTime(question.createdAt)}
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-800 mb-3">
              {question.title}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {question.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <MessageSquare size={18} className="text-slate-400" />
        <h2 className="text-base font-semibold text-slate-700">
          {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
      </div>

      {question.answers.length > 0 ? (
        <div className="space-y-3 stagger-children">
          {question.answers.map((answer) => (
            <AnswerCard key={answer.id} answer={answer} onVote={handleAnswerVote} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 py-4">No answers yet. Be the first to help!</p>
      )}

      <AnswerForm questionId={question.id} onAnswerAdded={loadQuestion} />
    </div>
  );
}
