import { TIME_SLOTS } from '../../data/constants';

export default function TimeSlotSelector({ selectedSlots, onChange }) {
  const toggleSlot = (slot) => {
    if (selectedSlots.includes(slot)) {
      onChange(selectedSlots.filter(s => s !== slot));
    } else {
      onChange([...selectedSlots, slot]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {TIME_SLOTS.map(slot => (
        <button
          key={slot}
          type="button"
          onClick={() => toggleSlot(slot)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            selectedSlots.includes(slot)
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
