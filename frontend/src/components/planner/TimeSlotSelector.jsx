import { TIME_SLOTS } from '../../data/mockData';

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
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedSlots.includes(slot)
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
