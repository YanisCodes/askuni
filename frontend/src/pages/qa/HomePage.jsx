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
    return questions.filter((q) => q.module?.id === Number(selectedModule));
  }, [questions, selectedModule]);

  return (
    <div className="space-y-7">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[26px] font-semibold text-primary-800 tracking-tight leading-none">
            Questions
          </h1>
          <p className="text-[13.5px] text-primary-400 mt-1.5">
            {filteredQuestions.length} {filteredQuestions.length === 1 ? 'question' : 'questions'}
            {selectedModule ? ' in this module' : ' across all modules'}
          </p>
        </div>
        <Link to="/ask">
          <Button size="md">
            <Plus size={15} strokeWidth={2.2} />
            Ask a Question
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <select
          className="select-glass min-w-[220px]"
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
        >
          <option value="">All modules</option>
          {modules.map((mod) => (
            <option key={mod.id} value={mod.id}>
              {mod.code} — {mod.name}
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
          icon={<HelpCircle size={44} strokeWidth={1.4} />}
          title="No questions yet"
          description="Be the first to ask one and get the conversation started."
          action={
            <Link to="/ask">
              <Button>Ask a Question</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
