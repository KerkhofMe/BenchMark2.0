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
  const { statusMap, notesMap } = useStatusStore();

  const domain = code && validCodes.has(code) ? typedDomains.find((d) => d.code === code) : undefined;
  const controls = code && validCodes.has(code) ? getControlsWithStatus(code, statusMap) : [];
  const filtered = statusFilter === 'all'
    ? controls
    : controls.filter((c) => c.status === statusFilter);

  if (!domain) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-slate-400">Domain not found.</p>
        <Link to="/overview" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          &larr; Back to overview
        </Link>
      </div>
    );
  }

  const compliant = controls.filter((c) => c.status === 'compliant').length;
  const nonCompliant = controls.filter((c) => c.status === 'non-compliant').length;
  const manual = controls.filter((c) => c.status === 'manual').length;

  function handleExport() {
    exportControlsCsv(controls, `mcsb-v2-${code}-controls.csv`, notesMap);
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
          <span className="text-red-400">{nonCompliant} non-compliant</span>
          <span className="text-yellow-400">{manual} manual</span>
          <span className="text-slate-500">&middot;</span>
          <span className="text-slate-300">{controls.length} controls total</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <StatusFilter active={statusFilter} onChange={setStatusFilter} />
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
