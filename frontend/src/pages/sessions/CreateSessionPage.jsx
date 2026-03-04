import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ModuleSelector from '../../components/sessions/ModuleSelector';
import TimePicker from '../../components/sessions/TimePicker';

export default function CreateSessionPage() {
  const { addSession } = useData();
  const navigate = useNavigate();

  const [moduleId, setModuleId] = useState('');
  const [chapter, setChapter] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(5);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!moduleId) newErrors.moduleId = 'Module is required';
    if (!date) newErrors.date = 'Date is required';
    if (!timeSlot) newErrors.timeSlot = 'Time slot is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addSession({
        moduleId: Number(moduleId),
        chapter,
        date,
        timeSlot,
        maxParticipants: Number(maxParticipants),
      });
      navigate('/sessions');
    } catch (err) {
      setErrors({ general: err.response?.data?.detail || 'Failed to create session.' });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Create Study Session</h1>

      <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-7 space-y-5">
        <div>
          <ModuleSelector
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
          />
          {errors.moduleId && (
            <p className="mt-1.5 text-sm text-rose-500">{errors.moduleId}</p>
          )}
        </div>

        <Input
          label="Chapter / Topic"
          id="chapter"
          placeholder="e.g., React Hooks, Binary Trees"
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
        />

        <Input
          label="Date"
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
        />

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Time Slot
          </label>
          <TimePicker value={timeSlot} onChange={setTimeSlot} />
          {errors.timeSlot && (
            <p className="mt-1.5 text-sm text-rose-500">{errors.timeSlot}</p>
          )}
        </div>

        <Input
          label="Max Participants"
          id="maxParticipants"
          type="number"
          min={2}
          max={20}
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(e.target.value)}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit">Create Session</Button>
          <Button variant="secondary" onClick={() => navigate('/sessions')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
