import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import domains from '../data/mcsb-domains.json';
import allControls from '../data/mcsb-controls.json';
import { getComplianceScore, useStatusStore, SENTINEL_SETUP_STEP } from '../data/compute-scores';
import { scoreDotColor } from '../utils/status';
import type { Domain } from '../types/domain';
import type { Control } from '../types/control';

const typedControls = allControls as Record<string, Control[]>;

const typedDomains: Domain[] = domains;

export default function Sidebar() {
  const { statusMap, prerequisites } = useStatusStore();

  const domainStats = useMemo(() =>
    typedDomains.map((domain) => {
      const ctrls = typedControls[domain.code] ?? [];
      const assessed = ctrls.filter((c) => statusMap[c.id] && statusMap[c.id] !== 'unchecked').length;
      const score = getComplianceScore(domain.code, statusMap);
      return { domain, assessed, total: ctrls.length, score };
    }),
    [statusMap],
  );

  return (
    <aside className="w-80 shrink-0 bg-slate-800 border-r border-slate-700 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Security Domains
        </h2>
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className={`w-2 h-2 rounded-full shrink-0 ${prerequisites.sentinelEnabled ? 'bg-teal-400' : 'bg-slate-600'}`} />
          <span className={`text-xs ${prerequisites.sentinelEnabled ? 'text-teal-400' : 'text-slate-600'}`}>
            Sentinel {prerequisites.sentinelEnabled ? '✓' : '✗'}
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          <NavLink
            to="/overview"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`
            }
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Overview
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`
            }
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Controls
          </NavLink>
          <div className="border-t border-slate-700 my-2" />
          {domainStats.map(({ domain, assessed, total, score }) => (
            <NavLink
              key={domain.code}
              to={`/domain/${domain.code}`}
              title={`${domain.code} — ${domain.name}`}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`
              }
            >
              <span className="font-mono text-xs w-7 shrink-0">{domain.code}</span>
              <span className="truncate flex-1" title={domain.name}>{domain.name}</span>
              <span className="text-xs opacity-70 shrink-0 tabular-nums text-right">
                {assessed}/{total}
              </span>
              <span className={`w-2 h-2 rounded-full shrink-0 ${scoreDotColor(score)}`} />
              <span className="text-xs opacity-70 shrink-0 tabular-nums w-8 text-right">{score}%</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
