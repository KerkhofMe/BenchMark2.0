import { Link } from 'react-router-dom';
import type { Domain } from '../types/domain';

interface DomainCardProps {
  domain: Domain;
  complianceScore: number;
  assessed: number;
  total: number;
}

export default function DomainCard({ domain, complianceScore, assessed, total }: DomainCardProps) {
  function scoreColor(score: number): string {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  }

  function scoreBg(score: number): string {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  }

  function scoreBarColor(score: number): string {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  }

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
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${scoreBarColor(complianceScore)}`}
          style={{ width: `${complianceScore}%` }}
        />
      </div>
      <div className={`mt-3 text-xs font-medium px-2 py-1 rounded-full inline-block ${scoreBg(complianceScore)} ${scoreColor(complianceScore)}`}>
        {complianceScore >= 80 ? 'Good' : complianceScore >= 60 ? 'Moderate' : 'Needs Attention'}
      </div>
    </Link>
  );
}
