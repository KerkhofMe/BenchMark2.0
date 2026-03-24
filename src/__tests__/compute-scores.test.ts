import { describe, it, expect } from 'vitest';
import allControls from '../data/mcsb-controls.json';
import { getComplianceScore, getAssessedCount, getControlsWithStatus, getAllControlsWithStatus } from '../data/compute-scores';
import type { Control, ControlStatus } from '../types/control';

const typedControls = allControls as Record<string, Control[]>;

describe('getControlsWithStatus', () => {
  it('returns controls with default unchecked status when statusMap is empty', () => {
    const controls = getControlsWithStatus('IM', {});
    expect(controls.length).toBeGreaterThan(0);
    for (const c of controls) {
      expect(c.status).toBe('unchecked');
    }
  });

  it('applies statusMap overrides to controls', () => {
    const statusMap: Record<string, ControlStatus> = { 'IM-1': 'compliant', 'IM-2': 'non-compliant' };
    const controls = getControlsWithStatus('IM', statusMap);
    const im1 = controls.find((c) => c.id === 'IM-1');
    const im2 = controls.find((c) => c.id === 'IM-2');
    expect(im1?.status).toBe('compliant');
    expect(im2?.status).toBe('non-compliant');
  });

  it('returns empty array for unknown domain', () => {
    expect(getControlsWithStatus('UNKNOWN', {})).toEqual([]);
  });
});

describe('getAllControlsWithStatus', () => {
  it('returns all controls with domainCode field', () => {
    const all = getAllControlsWithStatus({});
    expect(all.length).toBeGreaterThan(0);
    for (const c of all) {
      expect(c.domainCode).toBeTruthy();
      expect(c.id).toBeTruthy();
      expect(c.status).toBe('unchecked');
    }
  });

  it('includes controls from all domains', () => {
    const all = getAllControlsWithStatus({});
    const domainCodes = new Set(all.map((c) => c.domainCode));
    expect(domainCodes.size).toBe(12);
  });

  it('applies statusMap overrides across all domains', () => {
    const statusMap: Record<string, ControlStatus> = { 'IM-1': 'compliant', 'NS-1': 'partial' };
    const all = getAllControlsWithStatus(statusMap);
    const im1 = all.find((c) => c.id === 'IM-1');
    const ns1 = all.find((c) => c.id === 'NS-1');
    expect(im1?.status).toBe('compliant');
    expect(ns1?.status).toBe('partial');
  });
});

describe('getAssessedCount', () => {
  it('returns 0 assessed when statusMap is empty', () => {
    const { assessed, total } = getAssessedCount('IM', {});
    expect(assessed).toBe(0);
    expect(total).toBeGreaterThan(0);
  });

  it('counts non-unchecked controls as assessed', () => {
    const imControls = typedControls['IM'];
    const statusMap: Record<string, ControlStatus> = {
      [imControls[0].id]: 'compliant',
      [imControls[1].id]: 'non-compliant',
    };
    const { assessed } = getAssessedCount('IM', statusMap);
    expect(assessed).toBe(2);
  });

  it('returns 0/0 for unknown domain', () => {
    const { assessed, total } = getAssessedCount('UNKNOWN', {});
    expect(assessed).toBe(0);
    expect(total).toBe(0);
  });
});

describe('getComplianceScore edge cases', () => {
  it('returns 100 when all controls are compliant', () => {
    const imControls = typedControls['IM'];
    const statusMap: Record<string, ControlStatus> = {};
    for (const c of imControls) {
      statusMap[c.id] = 'compliant';
    }
    expect(getComplianceScore('IM', statusMap)).toBe(100);
  });

  it('returns 0 when all controls are non-compliant', () => {
    const imControls = typedControls['IM'];
    const statusMap: Record<string, ControlStatus> = {};
    for (const c of imControls) {
      statusMap[c.id] = 'non-compliant';
    }
    expect(getComplianceScore('IM', statusMap)).toBe(0);
  });

  it('handles mix of manual and unchecked as 0 points', () => {
    const imControls = typedControls['IM'];
    const statusMap: Record<string, ControlStatus> = {};
    for (const c of imControls) {
      statusMap[c.id] = 'manual';
    }
    expect(getComplianceScore('IM', statusMap)).toBe(0);
  });
});
