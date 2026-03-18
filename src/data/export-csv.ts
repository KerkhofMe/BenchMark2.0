import type { Control } from '../types/control';

interface ExportableControl extends Control {
  domainCode?: string;
}

export function exportControlsCsv(controls: ExportableControl[], filename: string, notesMap: Record<string, string> = {}) {
  const headers = ['ID', 'Title', 'Description', 'Status', 'Assessment Note', 'Remediation', 'KQL Query', 'Azure Policy Link', 'Data Source', 'Table', 'License', 'Setup Steps'];
  const rows = controls.map((c) => [
    c.id,
    c.title,
    c.description,
    c.status,
    notesMap[c.id] ?? '',
    c.remediation,
    c.kqlQuery.replace(/\n/g, ' '),
    c.policyLink,
    c.dataSource?.type ?? '',
    c.dataSource?.table ?? '',
    c.dataSource?.license ?? '',
    c.dataSource?.setup?.join(' | ') ?? '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
