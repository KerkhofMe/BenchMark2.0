import { describe, it, expect, beforeEach, vi } from 'vitest';
import { exportControlsCsv } from '../data/export-csv';
import type { Control, EvidenceLink } from '../types/control';

// Mock DOM APIs for testing
let lastClickedHref = '';
let lastClickedDownload = '';

beforeEach(() => {
  lastClickedHref = '';
  lastClickedDownload = '';

  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  });

  vi.spyOn(document, 'createElement').mockReturnValue({
    set href(v: string) { lastClickedHref = v; },
    set download(v: string) { lastClickedDownload = v; },
    click: vi.fn(),
  } as unknown as HTMLAnchorElement);
});

const mockControl: Control = {
  id: 'IM-1',
  title: 'Use centralized identity',
  description: 'Ensure SSO is configured',
  status: 'compliant',
  severity: 'critical',
  kqlQuery: 'SigninLogs\n| where ResultType == "0"',
  policyLink: 'https://example.com/policy',
  remediation: 'Register apps in Entra ID',
  dataSource: {
    type: 'Log Analytics',
    table: 'SigninLogs',
    license: 'Entra P1',
    setup: ['Step 1', 'Step 2'],
  },
};

describe('exportControlsCsv', () => {
  it('creates a Blob with correct CSV content', () => {
    const blobSpy = vi.fn();
    vi.stubGlobal('Blob', class {
      content: string[];
      constructor(parts: string[]) {
        this.content = parts;
        blobSpy(parts[0]);
      }
    });

    exportControlsCsv([mockControl], 'test.csv');

    const csv = blobSpy.mock.calls[0][0] as string;
    expect(csv).toContain('ID');
    expect(csv).toContain('Severity');
    expect(csv).toContain('"IM-1"');
    expect(csv).toContain('"critical"');
    expect(csv).toContain('"Use centralized identity"');
  });

  it('uses the provided filename', () => {
    vi.stubGlobal('Blob', class {
      constructor() {}
    });

    exportControlsCsv([mockControl], 'my-export.csv');
    expect(lastClickedDownload).toBe('my-export.csv');
  });

  it('includes assessment notes in CSV', () => {
    const blobSpy = vi.fn();
    vi.stubGlobal('Blob', class {
      constructor(parts: string[]) {
        blobSpy(parts[0]);
      }
    });

    const notesMap = { 'IM-1': 'All users have MFA' };
    exportControlsCsv([mockControl], 'test.csv', notesMap);

    const csv = blobSpy.mock.calls[0][0] as string;
    expect(csv).toContain('All users have MFA');
  });

  it('formats evidence links as pipe-separated pairs', () => {
    const blobSpy = vi.fn();
    vi.stubGlobal('Blob', class {
      constructor(parts: string[]) {
        blobSpy(parts[0]);
      }
    });

    const evidenceMap: Record<string, EvidenceLink[]> = {
      'IM-1': [
        { url: 'https://a.com', label: 'Doc A' },
        { url: 'https://b.com', label: 'Doc B' },
      ],
    };
    exportControlsCsv([mockControl], 'test.csv', {}, evidenceMap);

    const csv = blobSpy.mock.calls[0][0] as string;
    expect(csv).toContain('Doc A: https://a.com | Doc B: https://b.com');
  });

  it('escapes double quotes in CSV fields', () => {
    const blobSpy = vi.fn();
    vi.stubGlobal('Blob', class {
      constructor(parts: string[]) {
        blobSpy(parts[0]);
      }
    });

    const controlWithQuotes = {
      ...mockControl,
      description: 'Use "strong" auth',
    };
    exportControlsCsv([controlWithQuotes], 'test.csv');

    const csv = blobSpy.mock.calls[0][0] as string;
    expect(csv).toContain('Use ""strong"" auth');
  });

  it('replaces newlines in KQL queries', () => {
    const blobSpy = vi.fn();
    vi.stubGlobal('Blob', class {
      constructor(parts: string[]) {
        blobSpy(parts[0]);
      }
    });

    exportControlsCsv([mockControl], 'test.csv');

    const csv = blobSpy.mock.calls[0][0] as string;
    // KQL newlines should be replaced with spaces
    expect(csv).not.toContain('SigninLogs\n');
    expect(csv).toContain('SigninLogs |');
  });

  it('includes setup steps as pipe-separated', () => {
    const blobSpy = vi.fn();
    vi.stubGlobal('Blob', class {
      constructor(parts: string[]) {
        blobSpy(parts[0]);
      }
    });

    exportControlsCsv([mockControl], 'test.csv');

    const csv = blobSpy.mock.calls[0][0] as string;
    expect(csv).toContain('Step 1 | Step 2');
  });
});
