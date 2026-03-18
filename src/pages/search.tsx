import { useState } from 'react';
import { Link } from 'react-router-dom';
import ControlCard from '../components/control-card';
import StatusFilter from '../components/status-filter';
import domains from '../data/mcsb-domains.json';
import { getAllControlsWithStatus, useStatusStore } from '../data/compute-scores';
import type { Domain } from '../types/domain';
import type { ControlStatus } from '../types/control';

const typedDomains: Domain[] = domains;
const domainNameMap = Object.fromEntries(typedDomains.map((d) => [d.code, d.name]));

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ControlStatus | 'all'>('all');
  const { statusMap } = useStatusStore();

  const allControlsFlat = getAllControlsWithStatus(statusMap).map((c) => ({
    ...c,
    domainName: domainNameMap[c.domainCode] ?? c.domainCode,
  }));

  const lowerQuery = query.toLowerCase();
  const results = allControlsFlat.filter((c) => {
    const matchesQuery =
      !query ||
      c.id.toLowerCase().includes(lowerQuery) ||
      c.title.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery) ||
      c.domainName.toLowerCase().includes(lowerQuery);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Search Controls</h1>
        <p className="text-slate-400 mb-4">
          Search across all {allControlsFlat.length} controls by ID, title, description, or domain name.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, title, description, or domain..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <StatusFilter active={statusFilter} onChange={setStatusFilter} />
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-4">
        {results.length} {results.length === 1 ? 'result' : 'results'}
        {query && <> for &ldquo;{query}&rdquo;</>}
      </p>

      {results.length === 0 ? (
        <p className="text-slate-500 italic">No controls match your search.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {results.map((control) => (
            <div key={control.id}>
              <Link
                to={`/domain/${control.domainCode}`}
                className="text-xs text-slate-500 hover:text-blue-400 transition-colors mb-1 inline-block"
              >
                {control.domainCode} — {control.domainName}
              </Link>
              <ControlCard control={control} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
