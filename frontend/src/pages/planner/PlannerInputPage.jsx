import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import ModuleDropdown from '../../components/planner/ModuleDropdown';
import TimeSlotSelector from '../../components/planner/TimeSlotSelector';

export default function PlannerInputPage() {
  const navigate = useNavigate();
  const [moduleId, setModuleId] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!moduleId) {
      setError('Please select a module');
      return;
    }
    if (selectedSlots.length === 0) {
      setError('Please select at least one time slot');
      return;
    }
    setError('');
    navigate('/planner/results', {
      state: { moduleId: Number(moduleId), timeSlots: selectedSlots },
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Smart Study Planner</h1>
      <p className="text-gray-600 mt-1 mb-6">
        Find the best study sessions and resources for you
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 space-y-6">
        <ModuleDropdown
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          label="Select Module"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Your Available Time Slots
          </label>
          <TimeSlotSelector
            selectedSlots={selectedSlots}
            onChange={setSelectedSlots}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button
          type="submit"
          disabled={!moduleId || selectedSlots.length === 0}
        >
          Get Recommendations
        </Button>
      </form>
    </div>
  );
}
