import { Link, useNavigate } from 'react-router-dom';
import AskQuestionForm from '../../components/qa/AskQuestionForm';
import { ArrowLeft } from 'lucide-react';

export default function AskQuestionPage() {
  const navigate = useNavigate();

  const handleSuccess = (newQuestion) => {
    navigate(`/questions/${newQuestion.id}`);
  };

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Questions
      </Link>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Ask a Question</h1>
        <p className="text-sm text-gray-500 mt-1">
          Share your question with fellow students and get help.
        </p>
      </div>

      <AskQuestionForm onSuccess={handleSuccess} />
    </div>
  );
}
