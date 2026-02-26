import { useData } from '../../contexts/DataContext';

export default function ModuleSelector({ value, onChange, label = "Module" }) {
  const { modules } = useData();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
      >
        <option value="" disabled>
          Select a module
        </option>
        {modules.map(m => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
}
