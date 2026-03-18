import type { ControlStatus } from '../types/control';

const statuses: { value: ControlStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unchecked', label: 'Unchecked' },
  { value: 'compliant', label: 'Compliant' },
  { value: 'non-compliant', label: 'Non-Compliant' },
  { value: 'manual', label: 'Manual' },
];

interface StatusFilterProps {
  active: ControlStatus | 'all';
  onChange: (status: ControlStatus | 'all') => void;
}

export default function StatusFilter({ active, onChange }: StatusFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {statuses.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            active === value
              ? 'bg-blue-500 text-white'
              : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
