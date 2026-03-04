import { TIME_SLOTS } from '../../data/constants';

export default function TimePicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIME_SLOTS.map(slot => (
        <button
          key={slot}
          type="button"
          onClick={() => onChange(slot)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            value === slot
              ? 'bg-slate-800 text-white shadow-sm'
              : 'glass text-slate-600 hover:text-slate-800'
          }`}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}
