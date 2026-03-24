import type { ControlStatus, Severity } from '../types/control';

export function statusColor(status: ControlStatus): string {
  switch (status) {
    case 'compliant': return 'text-green-400 bg-green-500/20';
    case 'partial': return 'text-orange-400 bg-orange-500/20';
    case 'non-compliant': return 'text-red-400 bg-red-500/20';
    case 'manual': return 'text-yellow-400 bg-yellow-500/20';
    case 'unchecked': return 'text-slate-400 bg-slate-500/20';
  }
}

export function statusLabel(status: ControlStatus): string {
  switch (status) {
    case 'compliant': return 'Compliant';
    case 'partial': return 'Partial';
    case 'non-compliant': return 'Non-Compliant';
    case 'manual': return 'Manual';
    case 'unchecked': return 'Unchecked';
  }
}

export function statusDotColor(status: ControlStatus): string {
  switch (status) {
    case 'compliant': return 'bg-green-500';
    case 'partial': return 'bg-orange-500';
    case 'non-compliant': return 'bg-red-500';
    case 'manual': return 'bg-yellow-500';
    case 'unchecked': return 'bg-slate-500';
  }
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

export function scoreDotColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function severityColor(severity: Severity): string {
  switch (severity) {
    case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
    case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    case 'low': return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
  }
}
