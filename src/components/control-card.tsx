import { useState, useRef, useEffect } from 'react';
import type { ControlStatus } from '../types/control';
import { useStatusStore } from '../data/compute-scores';

const STATUS_OPTIONS: { value: ControlStatus; label: string }[] = [
  { value: 'compliant', label: 'Compliant' },
  { value: 'partial', label: 'Partial' },
  { value: 'non-compliant', label: 'Non-Compliant' },
  { value: 'manual', label: 'Manual' },
  { value: 'unchecked', label: 'Unchecked' },
];

function statusColor(status: ControlStatus): string {
  switch (status) {
    case 'compliant': return 'text-green-400 bg-green-500/20';
    case 'partial': return 'text-orange-400 bg-orange-500/20';
    case 'non-compliant': return 'text-red-400 bg-red-500/20';
    case 'manual': return 'text-yellow-400 bg-yellow-500/20';
    case 'unchecked': return 'text-slate-400 bg-slate-500/20';
  }
}

function statusLabel(status: ControlStatus): string {
  switch (status) {
    case 'compliant': return 'Compliant';
    case 'partial': return 'Partial';
    case 'non-compliant': return 'Non-Compliant';
    case 'manual': return 'Manual';
    case 'unchecked': return 'Unchecked';
  }
}

interface DataSource {
  type: string;
  table: string;
  license: string;
  setup: string[];
}

interface ControlCardProps {
  control: {
    id: string;
    title: string;
    description: string;
    status: ControlStatus;
    kqlQuery: string;
    policyLink: string;
    remediation: string;
    dataSource: DataSource;
  };
}

export default function ControlCard({ control }: ControlCardProps) {
  const [copied, setCopied] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const { setStatus, getNote, setNote } = useStatusStore();
  const note = getNote(control.id);
  const [localNote, setLocalNote] = useState(note);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalNote(note);
  }, [note]);

  function handleNoteChange(value: string) {
    setLocalNote(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setNote(control.id, value), 400);
  }

  function handleCopy() {
    navigator.clipboard.writeText(control.kqlQuery).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleStatusChange(newStatus: ControlStatus) {
    setStatus(control.id, newStatus);
    setShowPicker(false);
    if (newStatus === 'partial') {
      setTimeout(() => noteRef.current?.focus(), 0);
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-700 px-2 py-1 rounded shrink-0">
            {control.id}
          </span>
          <h3 className="text-white font-semibold">{control.title}</h3>
          {note && (
            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Has assessment note">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 cursor-pointer ${statusColor(control.status)}`}
          >
            {statusLabel(control.status)} ▾
          </button>
          {showPicker && (
            <div className="absolute right-0 top-8 z-10 bg-slate-700 border border-slate-600 rounded-lg shadow-lg py-1 min-w-[140px]">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleStatusChange(value)}
                  className={`block w-full text-left px-3 py-1.5 text-sm transition-colors ${
                    control.status === value
                      ? 'text-blue-400 bg-slate-600'
                      : 'text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="text-slate-400 text-sm leading-relaxed mb-4">
        {control.description}
      </p>
      <details className="mb-4">
        <summary className="cursor-pointer text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors select-none">
          Data Requirements
        </summary>
        <div className="mt-3 bg-slate-900 border border-slate-700 rounded-lg p-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Source</span>
              <p className="text-sm text-slate-300">{control.dataSource.type}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Table</span>
              <p className="text-sm font-mono text-slate-300">{control.dataSource.table}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">License</span>
              <p className="text-sm text-slate-300">{control.dataSource.license}</p>
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider">Setup Steps</span>
            <ul className="mt-1 space-y-1">
              {control.dataSource.setup.map((step, i) => (
                <li key={i} className="text-sm text-slate-400 flex gap-2">
                  <span className="text-slate-600 shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>

      <div className="flex flex-wrap gap-3">
        <details className="group flex-1 min-w-0">
          <summary className="cursor-pointer text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors select-none">
            View KQL Query
          </summary>
          <div className="mt-3 relative">
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium transition-colors bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 pr-16 text-xs text-slate-300 overflow-x-auto leading-relaxed">
              <code>{control.kqlQuery}</code>
            </pre>
          </div>
        </details>
        <a
          href={control.policyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors shrink-0"
        >
          Azure Policy
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {control.status !== 'compliant' && (
        <div className="mt-4 bg-slate-900 border border-slate-700 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Remediation</h4>
          <p className="text-sm text-slate-300 leading-relaxed">{control.remediation}</p>
        </div>
      )}

      <div className="mt-4">
        <label htmlFor={`note-${control.id}`} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Assessment Note
        </label>
        <textarea
          id={`note-${control.id}`}
          ref={noteRef}
          value={localNote}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="Add a note (e.g., why this control is non-compliant, evidence, ticket link)..."
          rows={2}
          className="mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
        />
      </div>
    </div>
  );
}
