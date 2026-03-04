import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import QuestionCard from '../../components/qa/QuestionCard';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { HelpCircle, Plus } from 'lucide-react';

export default function HomePage() {
  const { questions, modules } = useData();
  const [selectedModule, setSelectedModule] = useState('');

  const filteredQuestions = useMemo(() => {
    if (!selectedModule) return questions;
    return questions.filter(
      (q) => q.module?.id === Number(selectedModule)
    );
  }, [questions, selectedModule]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Questions</h1>
        <Link to="/ask">
          <Button size="sm">
            <Plus size={16} className="mr-1.5" />
            Ask a Question
          </Button>
        </Link>
      </div>

      <div>
        <select
          className="select-glass"
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
        >
          <option value="">All Modules</option>
          {modules.map((mod) => (
            <option key={mod.id} value={mod.id}>
              {mod.code} - {mod.name}
            </option>
          ))}
        </select>
      </div>

      {filteredQuestions.length > 0 ? (
        <div className="space-y-3 stagger-children">
          {filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              author={q.author}
              module={q.module}
              answerCount={q.answerCount || 0}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<HelpCircle size={48} />}
          title="No questions yet"
          description="Be the first to ask a question and start a discussion."
          action={
            <Link to="/ask">
              <Button size="sm">Ask a Question</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
