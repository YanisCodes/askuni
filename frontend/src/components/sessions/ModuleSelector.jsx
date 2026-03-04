import { useData } from '../../contexts/DataContext';

export default function ModuleSelector({ value, onChange, label = "Module" }) {
  const { modules } = useData();

  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="select-glass w-full"
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
