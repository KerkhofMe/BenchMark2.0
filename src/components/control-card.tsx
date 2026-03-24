import { memo, useState, useRef, useEffect } from 'react';
import type { Control, ControlStatus } from '../types/control';
import { useStatusStore } from '../data/compute-scores';
import { statusColor, statusLabel, severityColor } from '../utils/status';

const STATUS_OPTIONS: { value: ControlStatus; label: string }[] = [
  { value: 'compliant', label: 'Compliant' },
  { value: 'partial', label: 'Partial' },
  { value: 'non-compliant', label: 'Non-Compliant' },
  { value: 'manual', label: 'Manual' },
  { value: 'unchecked', label: 'Unchecked' },
];

interface ControlCardProps {
  control: Control;
}

export default memo(function ControlCard({ control }: ControlCardProps) {
  const [copied, setCopied] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceLabel, setEvidenceLabel] = useState('');
  const { setStatus, getNote, setNote, getEvidence, addEvidence, removeEvidence } = useStatusStore();
  const note = getNote(control.id);
  const evidence = getEvidence(control.id);
  const [localNote, setLocalNote] = useState(note);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on click outside or Escape
  useEffect(() => {
    if (!showPicker) return;
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowPicker(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showPicker]);

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

  function handleAddEvidence() {
    const trimmedUrl = evidenceUrl.trim();
    const trimmedLabel = evidenceLabel.trim() || trimmedUrl;
    if (!trimmedUrl) return;
    try {
      const parsed = new URL(trimmedUrl);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return;
    } catch {
      return;
    }
    addEvidence(control.id, { url: trimmedUrl, label: trimmedLabel });
    setEvidenceUrl('');
    setEvidenceLabel('');
    setShowEvidenceForm(false);
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-700 px-2 py-1 rounded shrink-0">
            {control.id}
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider ${severityColor(control.severity)}`}>
            {control.severity}
          </span>
          <h3 className="text-white font-semibold">{control.title}</h3>
          {note && (
            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Has assessment note">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          )}
          {evidence.length > 0 && (
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Has evidence links">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          )}
        </div>
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setShowPicker(!showPicker)}
            aria-expanded={showPicker}
            aria-haspopup="listbox"
            className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 cursor-pointer ${statusColor(control.status)}`}
          >
            {statusLabel(control.status)} ▾
          </button>
          {showPicker && (
            <div role="listbox" aria-label="Select status" className="absolute right-0 top-8 z-10 bg-slate-700 border border-slate-600 rounded-lg shadow-lg py-1 min-w-[140px]">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  role="option"
                  aria-selected={control.status === value}
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
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Evidence Links</span>
          <button
            onClick={() => setShowEvidenceForm(!showEvidenceForm)}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Evidence
          </button>
        </div>

        {evidence.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {evidence.map((link, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-xs">
                <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-300 hover:text-emerald-200 transition-colors max-w-[200px] truncate"
                  title={link.url}
                >
                  {link.label}
                </a>
                <button
                  onClick={() => removeEvidence(control.id, i)}
                  className="text-slate-500 hover:text-red-400 transition-colors ml-0.5"
                  aria-label={`Remove evidence: ${link.label}`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {showEvidenceForm && (
          <div className="flex flex-col sm:flex-row gap-2 bg-slate-900 border border-slate-700 rounded-lg p-3">
            <input
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <input
              type="text"
              value={evidenceLabel}
              onChange={(e) => setEvidenceLabel(e.target.value)}
              placeholder="Label (optional)"
              className="sm:w-40 bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddEvidence}
                className="px-3 py-1.5 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setShowEvidenceForm(false); setEvidenceUrl(''); setEvidenceLabel(''); }}
                className="px-3 py-1.5 rounded text-xs font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

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
});
