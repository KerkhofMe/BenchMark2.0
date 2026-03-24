import { Link } from 'react-router-dom';
import type { Domain } from '../types/domain';
import { scoreColor } from '../utils/status';

interface DomainCardProps {
  domain: Domain;
  complianceScore: number;
  assessed: number;
  total: number;
  statusBreakdown?: { compliant: number; partial: number; nonCompliant: number; manual: number; unchecked: number };
}

export default function DomainCard({ domain, complianceScore, assessed, total, statusBreakdown }: DomainCardProps) {
  function scoreBg(score: number): string {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  }

  const pct = (n: number) => total > 0 ? (n / total) * 100 : 0;

  return (
    <Link to={`/domain/${domain.code}`} className="block bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-500 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-700 px-2 py-1 rounded">
          {domain.code}
        </span>
        <span className={`text-2xl font-bold ${scoreColor(complianceScore)}`}>
          {complianceScore}%
        </span>
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{domain.name}</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-4">
        {domain.description}
      </p>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-400">
          {assessed}/{total} assessed
        </span>
        <span className={`text-xs font-medium ${scoreColor(complianceScore)}`}>
          {complianceScore}% compliant
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden flex">
        {statusBreakdown ? (
          <>
            {statusBreakdown.compliant > 0 && <div className="h-2 bg-green-500 transition-all" style={{ width: `${pct(statusBreakdown.compliant)}%` }} />}
            {statusBreakdown.partial > 0 && <div className="h-2 bg-orange-500 transition-all" style={{ width: `${pct(statusBreakdown.partial)}%` }} />}
            {statusBreakdown.nonCompliant > 0 && <div className="h-2 bg-red-500 transition-all" style={{ width: `${pct(statusBreakdown.nonCompliant)}%` }} />}
            {statusBreakdown.manual > 0 && <div className="h-2 bg-yellow-500 transition-all" style={{ width: `${pct(statusBreakdown.manual)}%` }} />}
          </>
        ) : (
          <div
            className="h-2 bg-green-500 rounded-full transition-all"
            style={{ width: `${complianceScore}%` }}
          />
        )}
      </div>
      <div className={`mt-3 text-xs font-medium px-2 py-1 rounded-full inline-block ${scoreBg(complianceScore)} ${scoreColor(complianceScore)}`}>
        {complianceScore >= 80 ? 'Good' : complianceScore >= 60 ? 'Moderate' : 'Needs Attention'}
      </div>
    </Link>
  );
}
