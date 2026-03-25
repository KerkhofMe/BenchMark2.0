import DomainCard from '../components/domain-card';
import domains from '../data/mcsb-domains.json';
import allControls from '../data/mcsb-controls.json';
import { getComplianceScore, getAssessedCount, getAllControlsWithStatus, useStatusStore, SENTINEL_SETUP_STEP } from '../data/compute-scores';
import { exportControlsCsv } from '../data/export-csv';
import type { Domain } from '../types/domain';
import type { Control } from '../types/control';

const typedDomains: Domain[] = domains;
const typedControls = allControls as Record<string, Control[]>;

export default function Dashboard() {
  const { statusMap, notesMap, evidenceMap, resetAll, prerequisites, setPrerequisite } = useStatusStore();
  const allControlsFlat = getAllControlsWithStatus(statusMap);

  const scores = typedDomains.map((d) => getComplianceScore(d.code, statusMap));
  const avgScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);

  const totalControls = allControlsFlat.length;
  const compliant = allControlsFlat.filter((c) => c.status === 'compliant').length;
  const partial = allControlsFlat.filter((c) => c.status === 'partial').length;
  const nonCompliant = allControlsFlat.filter((c) => c.status === 'non-compliant').length;
  const manual = allControlsFlat.filter((c) => c.status === 'manual').length;
  const unchecked = allControlsFlat.filter((c) => c.status === 'unchecked').length;

  function handleExportAll() {
    exportControlsCsv(allControlsFlat, 'mcsb-v2-all-controls.csv', notesMap, evidenceMap);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-3xl font-bold text-white">Security Overview</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all statuses, notes, and evidence links? This action cannot be undone.')) {
                  resetAll();
                }
              }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={handleExportAll}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
        <p className="text-slate-400 mb-4">
          Microsoft Cloud Security Benchmark v2 — {typedDomains.length} domains,{' '}
          <span className="text-white font-semibold">{avgScore}%</span> average compliance
        </p>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-slate-300 font-medium">
              {totalControls - unchecked}/{totalControls} assessed
            </span>
            <span className="text-xs text-slate-500">
              {Math.round(((totalControls - unchecked) / totalControls) * 100)}% complete
            </span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${((totalControls - unchecked) / totalControls) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{totalControls}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Controls</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-400">{compliant}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Compliant</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-2xl font-bold text-orange-400">{partial}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Partial</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-400">{nonCompliant}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Non-Compliant</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-2xl font-bold text-yellow-400">{manual}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Manual Review</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-2xl font-bold text-slate-400">{unchecked}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Unchecked</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Prerequisites</h2>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={!!prerequisites.sentinelEnabled}
            onChange={(e) => setPrerequisite('sentinelEnabled', e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 cursor-pointer"
          />
          <div>
            <span className="text-sm text-white font-medium group-hover:text-teal-300 transition-colors">
              {SENTINEL_SETUP_STEP}
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              33 controls require Sentinel. Enable to hide this shared setup step from individual control cards.
            </p>
          </div>
          <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${prerequisites.sentinelEnabled ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-700 text-slate-500'}`}>
            {prerequisites.sentinelEnabled ? 'Enabled' : 'Not set'}
          </span>
        </label>
      </div>

      {unchecked === totalControls && (
        <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-6 mb-8 text-center">
          <h2 className="text-lg font-semibold text-white mb-2">Welcome to the MCSB v2 Assessment</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            No controls have been assessed yet. Start by selecting a domain from the sidebar and updating the status of each control.
            Your progress is saved automatically in the browser.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {typedDomains.map((domain) => {
          const { assessed, total } = getAssessedCount(domain.code, statusMap);
          const ctrls = typedControls[domain.code] ?? [];
          const statusBreakdown = {
            compliant: ctrls.filter((c) => (statusMap[c.id] ?? 'unchecked') === 'compliant').length,
            partial: ctrls.filter((c) => (statusMap[c.id] ?? 'unchecked') === 'partial').length,
            nonCompliant: ctrls.filter((c) => (statusMap[c.id] ?? 'unchecked') === 'non-compliant').length,
            manual: ctrls.filter((c) => (statusMap[c.id] ?? 'unchecked') === 'manual').length,
            unchecked: ctrls.filter((c) => (statusMap[c.id] ?? 'unchecked') === 'unchecked').length,
          };
          return (
            <DomainCard key={domain.code} domain={domain} complianceScore={getComplianceScore(domain.code, statusMap)} assessed={assessed} total={total} statusBreakdown={statusBreakdown} />
          );
        })}
      </div>
    </div>
  );
}
