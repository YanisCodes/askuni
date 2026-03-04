import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../common/Button';
import { Send } from 'lucide-react';

export default function AnswerForm({ questionId, onAnswerAdded }) {
  const { addAnswer } = useData();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Please write your answer before posting.');
      return;
    }

    try {
      await addAnswer(questionId, { content: content.trim() });
      setContent('');
      if (onAnswerAdded) onAnswerAdded();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to post answer.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Your Answer</h3>

      <textarea
        className="input-glass resize-y min-h-[100px]"
        placeholder="Write your answer here..."
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {error && (
        <p className="mt-2 text-sm text-rose-500">{error}</p>
      )}

      <div className="flex justify-end mt-3">
        <Button type="submit" size="sm">
          <Send size={14} className="mr-1.5" />
          Post Answer
        </Button>
      </div>
    </form>
  );
}
