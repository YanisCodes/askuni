import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Input from '../common/Input';
import Button from '../common/Button';

export default function AskQuestionForm({ onSuccess }) {
  const { modules, addQuestion } = useData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required.';
    }

    if (!moduleId) {
      newErrors.moduleId = 'Please select a module.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const newQuestion = await addQuestion({
        title: title.trim(),
        description: description.trim(),
        moduleId: Number(moduleId),
      });

      if (onSuccess) {
        onSuccess(newQuestion);
      }
    } catch (err) {
      setErrors({ general: err.response?.data?.detail || err.message || 'Failed to post question.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-7 space-y-5">
      {errors.general && (
        <div className="bg-rose-50/80 border border-rose-200/60 text-rose-600 text-sm rounded-xl px-4 py-3">
          {errors.general}
        </div>
      )}

      <Input
        label="Title"
        id="question-title"
        type="text"
        placeholder="What is your question?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
      />

      <div>
        <label htmlFor="question-description" className="block text-sm font-medium text-slate-600 mb-1.5">
          Description
        </label>
        <textarea
          id="question-description"
          className={`input-glass resize-y min-h-[120px] ${
            errors.description ? '!border-rose-400' : ''
          }`}
          placeholder="Provide more details about your question..."
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-rose-500">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="question-module" className="block text-sm font-medium text-slate-600 mb-1.5">
          Module
        </label>
        <select
          id="question-module"
          className={`select-glass w-full ${
            errors.moduleId ? '!border-rose-400' : ''
          }`}
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
        >
          <option value="">Select a module</option>
          {modules.map((mod) => (
            <option key={mod.id} value={mod.id}>
              {mod.code} - {mod.name}
            </option>
          ))}
        </select>
        {errors.moduleId && (
          <p className="mt-1.5 text-sm text-rose-500">{errors.moduleId}</p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit">Post Question</Button>
      </div>
    </form>
  );
}
