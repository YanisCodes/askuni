import { TIME_SLOTS } from '../../data/constants';

export default function TimePicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIME_SLOTS.map(slot => (
        <button
          key={slot}
          type="button"
          onClick={() => onChange(slot)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            value === slot
              ? 'bg-primary-600 text-white'
              : 'bg-white border border-secondary-300 text-gray-700 hover:bg-secondary-50'
          }`}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}
