import { statusDotColor } from '../utils/status';
import type { ControlStatus } from '../types/control';

const items: { status: ControlStatus; desc: string }[] = [
  { status: 'unchecked', desc: 'not yet evaluated' },
  { status: 'compliant', desc: 'verified as implemented' },
  { status: 'partial', desc: 'partially implemented' },
  { status: 'non-compliant', desc: 'known gap, needs remediation' },
  { status: 'manual', desc: 'requires human verification' },
];

export default function StatusLegend() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400">
      {items.map(({ status, desc }) => (
        <span key={status}>
          <span className={`inline-block w-2 h-2 rounded-full ${statusDotColor(status)} mr-1.5`} />
          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')} — {desc}
        </span>
      ))}
    </div>
  );
}
