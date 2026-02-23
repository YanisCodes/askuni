import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import QuestionCard from '../../components/qa/QuestionCard';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { HelpCircle, Plus } from 'lucide-react';

export default function HomePage() {
  const { questions, answers, modules, users } = useData();
  const [selectedModule, setSelectedModule] = useState('');

  const enrichedQuestions = useMemo(() => {
    return questions.map((q) => {
      const author = users.find((u) => u.id === q.authorId);
      const module = modules.find((m) => m.id === q.moduleId);
      const answerCount = answers.filter((a) => a.questionId === q.id).length;
      return { question: q, author, module, answerCount };
    });
  }, [questions, answers, modules, users]);

  const filteredQuestions = useMemo(() => {
    if (!selectedModule) return enrichedQuestions;
    return enrichedQuestions.filter(
      (item) => item.question.moduleId === Number(selectedModule)
    );
  }, [enrichedQuestions, selectedModule]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Questions</h1>
        <Link to="/ask">
          <Button size="sm">
            <Plus size={16} className="mr-1.5" />
            Ask a Question
          </Button>
        </Link>
      </div>

      <div>
        <select
          className="rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
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
        <div className="space-y-3">
          {filteredQuestions.map((item) => (
            <QuestionCard
              key={item.question.id}
              question={item.question}
              author={item.author}
              module={item.module}
              answerCount={item.answerCount}
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
