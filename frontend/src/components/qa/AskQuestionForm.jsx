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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const newQuestion = addQuestion({
        title: title.trim(),
        description: description.trim(),
        moduleId: Number(moduleId),
      });

      if (onSuccess) {
        onSuccess(newQuestion);
      }
    } catch (err) {
      setErrors({ general: err.message || 'Failed to post question.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-secondary-200 p-6 space-y-4">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
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
        <label htmlFor="question-description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="question-description"
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-y min-h-[120px] ${
            errors.description ? 'border-red-500' : 'border-secondary-300'
          }`}
          placeholder="Provide more details about your question..."
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="question-module" className="block text-sm font-medium text-gray-700 mb-1">
          Module
        </label>
        <select
          id="question-module"
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
            errors.moduleId ? 'border-red-500' : 'border-secondary-300'
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
          <p className="mt-1 text-sm text-red-600">{errors.moduleId}</p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit">Post Question</Button>
      </div>
    </form>
  );
}
