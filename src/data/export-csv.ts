import type { Control, EvidenceLink } from '../types/control';

interface ExportableControl extends Control {
  domainCode?: string;
}

/** Prevent CSV formula injection by escaping cells that start with dangerous characters. */
function sanitizeCsvCell(cell: string): string {
  if (/^[=+\-@\t\r]/.test(cell)) {
    return "'" + cell;
  }
  return cell;
}

export function exportControlsCsv(controls: ExportableControl[], filename: string, notesMap: Record<string, string> = {}, evidenceMap: Record<string, EvidenceLink[]> = {}) {
  const headers = ['ID', 'Title', 'Description', 'Status', 'Severity', 'Assessment Note', 'Evidence Links', 'Remediation', 'KQL Query', 'Azure Policy Link', 'Data Source', 'Table', 'License', 'Setup Steps'];
  const rows = controls.map((c) => [
    c.id,
    c.title,
    c.description,
    c.status,
    c.severity,
    notesMap[c.id] ?? '',
    (evidenceMap[c.id] ?? []).map((e) => `${e.label}: ${e.url}`).join(' | '),
    c.remediation,
    c.kqlQuery.replace(/\n/g, ' '),
    c.policyLink,
    c.dataSource?.type ?? '',
    c.dataSource?.table ?? '',
    c.dataSource?.license ?? '',
    c.dataSource?.setup?.join(' | ') ?? '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${sanitizeCsvCell(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
