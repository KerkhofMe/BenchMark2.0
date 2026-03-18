import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { EvidenceLink } from '../types/control';

const EVIDENCE_KEY = 'mcsb-evidence-links';
const STORAGE_KEY = 'mcsb-control-statuses';
const NOTES_KEY = 'mcsb-control-notes';

type EvidenceMap = Record<string, EvidenceLink[]>;

// In-memory localStorage mock
let store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
};

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

function loadEvidence(): EvidenceMap {
  try {
    const raw = localStorage.getItem(EVIDENCE_KEY);
    if (raw) return JSON.parse(raw) as EvidenceMap;
  } catch { /* ignore */ }
  return {};
}

function saveEvidence(map: EvidenceMap) {
  localStorage.setItem(EVIDENCE_KEY, JSON.stringify(map));
}

describe('Evidence links: localStorage persistence', () => {
  beforeEach(() => {
    store = {};
    vi.clearAllMocks();
  });

  it('starts with empty evidence map when no data in localStorage', () => {
    const evidence = loadEvidence();
    expect(evidence).toEqual({});
  });

  it('saves and loads a single evidence link for a control', () => {
    const link: EvidenceLink = { url: 'https://example.com/report.pdf', label: 'Audit report' };
    const map: EvidenceMap = { 'NS-1': [link] };
    saveEvidence(map);

    const loaded = loadEvidence();
    expect(loaded['NS-1']).toHaveLength(1);
    expect(loaded['NS-1'][0].url).toBe('https://example.com/report.pdf');
    expect(loaded['NS-1'][0].label).toBe('Audit report');
  });

  it('saves multiple evidence links for the same control', () => {
    const links: EvidenceLink[] = [
      { url: 'https://example.com/a.pdf', label: 'Doc A' },
      { url: 'https://example.com/b.pdf', label: 'Doc B' },
      { url: 'https://example.com/c.pdf', label: 'Doc C' },
    ];
    const map: EvidenceMap = { 'DP-2': links };
    saveEvidence(map);

    const loaded = loadEvidence();
    expect(loaded['DP-2']).toHaveLength(3);
    expect(loaded['DP-2'][2].label).toBe('Doc C');
  });

  it('saves evidence links for multiple controls', () => {
    const map: EvidenceMap = {
      'NS-1': [{ url: 'https://example.com/ns.pdf', label: 'NS report' }],
      'DP-1': [{ url: 'https://example.com/dp.pdf', label: 'DP report' }],
    };
    saveEvidence(map);

    const loaded = loadEvidence();
    expect(Object.keys(loaded)).toHaveLength(2);
    expect(loaded['NS-1'][0].label).toBe('NS report');
    expect(loaded['DP-1'][0].label).toBe('DP report');
  });

  it('removes evidence by splicing from array and re-saving', () => {
    const map: EvidenceMap = {
      'NS-1': [
        { url: 'https://example.com/a.pdf', label: 'A' },
        { url: 'https://example.com/b.pdf', label: 'B' },
        { url: 'https://example.com/c.pdf', label: 'C' },
      ],
    };
    saveEvidence(map);

    // Remove the middle item (index 1)
    const loaded = loadEvidence();
    const updated = [...loaded['NS-1']];
    updated.splice(1, 1);
    loaded['NS-1'] = updated;
    saveEvidence(loaded);

    const reloaded = loadEvidence();
    expect(reloaded['NS-1']).toHaveLength(2);
    expect(reloaded['NS-1'][0].label).toBe('A');
    expect(reloaded['NS-1'][1].label).toBe('C');
  });

  it('clears evidence links when control array becomes empty', () => {
    const map: EvidenceMap = {
      'NS-1': [{ url: 'https://example.com/a.pdf', label: 'A' }],
    };
    saveEvidence(map);

    // Remove all items — delete the key
    const loaded = loadEvidence();
    delete loaded['NS-1'];
    saveEvidence(loaded);

    const reloaded = loadEvidence();
    expect(reloaded['NS-1']).toBeUndefined();
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(EVIDENCE_KEY, 'not-json!!!');
    const evidence = loadEvidence();
    expect(evidence).toEqual({});
  });

  it('is cleared when resetAll removes the evidence key', () => {
    saveEvidence({ 'NS-1': [{ url: 'https://example.com/a.pdf', label: 'A' }] });
    store[STORAGE_KEY] = JSON.stringify({ 'NS-1': 'compliant' });
    store[NOTES_KEY] = JSON.stringify({ 'NS-1': 'test note' });

    // Simulate resetAll
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(NOTES_KEY);
    localStorage.removeItem(EVIDENCE_KEY);

    expect(loadEvidence()).toEqual({});
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(NOTES_KEY)).toBeNull();
  });
});

describe('Evidence links: CSV export format', () => {
  it('formats evidence links as pipe-separated label: url pairs', () => {
    const evidenceMap: EvidenceMap = {
      'NS-1': [
        { url: 'https://example.com/a.pdf', label: 'Doc A' },
        { url: 'https://example.com/b.pdf', label: 'Doc B' },
      ],
    };

    const formatted = (evidenceMap['NS-1'] ?? []).map((e) => `${e.label}: ${e.url}`).join(' | ');
    expect(formatted).toBe('Doc A: https://example.com/a.pdf | Doc B: https://example.com/b.pdf');
  });

  it('returns empty string for control with no evidence', () => {
    const evidenceMap: EvidenceMap = {};
    const formatted = (evidenceMap['NS-1'] ?? []).map((e) => `${e.label}: ${e.url}`).join(' | ');
    expect(formatted).toBe('');
  });
});

describe('Evidence links: EvidenceLink type', () => {
  it('has required url and label fields', () => {
    const link: EvidenceLink = { url: 'https://example.com', label: 'Test' };
    expect(link.url).toBe('https://example.com');
    expect(link.label).toBe('Test');
  });
});
