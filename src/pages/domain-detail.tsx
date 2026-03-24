import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ControlCard from '../components/control-card';
import StatusFilter from '../components/status-filter';
import StatusLegend from '../components/status-legend';
import domains from '../data/mcsb-domains.json';
import { getControlsWithStatus, useStatusStore } from '../data/compute-scores';
import { exportControlsCsv } from '../data/export-csv';
import type { Domain } from '../types/domain';
import type { ControlStatus } from '../types/control';

const typedDomains: Domain[] = domains;
const validCodes = new Set(typedDomains.map((d) => d.code));

export default function DomainDetail() {
  const { code } = useParams<{ code: string }>();
  const [statusFilter, setStatusFilter] = useState<ControlStatus | 'all'>('all');
  const { statusMap, notesMap, evidenceMap } = useStatusStore();

  const domain = code && validCodes.has(code) ? typedDomains.find((d) => d.code === code) : undefined;
  const controls = code && validCodes.has(code) ? getControlsWithStatus(code, statusMap) : [];
  const filtered = statusFilter === 'all'
    ? controls
    : controls.filter((c) => c.status === statusFilter);

  if (!domain) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Domain not found</h2>
          <p className="text-slate-400 text-sm mb-6">
            The domain code <span className="font-mono text-red-400">"{code}"</span> does not exist in the MCSB v2 benchmark.
          </p>
          <Link
            to="/overview"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            &larr; Back to overview
          </Link>
        </div>
      </div>
    );
  }

  const compliant = controls.filter((c) => c.status === 'compliant').length;
  const partial = controls.filter((c) => c.status === 'partial').length;
  const nonCompliant = controls.filter((c) => c.status === 'non-compliant').length;
  const manual = controls.filter((c) => c.status === 'manual').length;
  const unchecked = controls.filter((c) => c.status === 'unchecked').length;
  const filterCounts = {
    all: controls.length,
    compliant,
    partial,
    'non-compliant': nonCompliant,
    manual,
    unchecked,
  };

  function handleExport() {
    exportControlsCsv(controls, `mcsb-v2-${code}-controls.csv`, notesMap, evidenceMap);
  }

  return (
    <div className="px-6 py-8">
      <Link
        to="/overview"
        className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-6"
      >
        <span>&larr;</span> Back to overview
      </Link>

      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-700 px-2 py-1 rounded">
              {domain.code}
            </span>
            <h1 className="text-3xl font-bold text-white">{domain.name}</h1>
          </div>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
          >
            Export CSV
          </button>
        </div>
        <p className="text-slate-400 mb-4">{domain.description}</p>
        <div className="flex gap-4 text-sm mb-5">
          <span className="text-green-400">{compliant} compliant</span>
          <span className="text-orange-400">{partial} partial</span>
          <span className="text-red-400">{nonCompliant} non-compliant</span>
          <span className="text-yellow-400">{manual} manual</span>
          <span className="text-slate-500">&middot;</span>
          <span className="text-slate-300">{controls.length} controls total</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <StatusFilter active={statusFilter} onChange={setStatusFilter} counts={filterCounts} />
          <StatusLegend />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-slate-500 italic">No controls match the selected filter.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((control) => (
            <ControlCard key={control.id} control={control} />
          ))}
        </div>
      )}
    </div>
  );
}
