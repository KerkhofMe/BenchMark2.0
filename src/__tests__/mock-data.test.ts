import { describe, it, expect } from 'vitest';
import domains from '../data/mcsb-domains.json';
import allControls from '../data/mcsb-controls.json';
import { getComplianceScore } from '../data/compute-scores';
import type { Domain } from '../types/domain';
import type { ControlStatus } from '../types/control';

const validStatuses: ControlStatus[] = ['compliant', 'non-compliant', 'partial', 'manual', 'unchecked'];

describe('Mock data: mcsb-domains.json', () => {
  it('contains exactly 12 domains', () => {
    expect(domains).toHaveLength(12);
  });

  it('each domain has required fields', () => {
    for (const domain of domains as Domain[]) {
      expect(domain.code).toBeTruthy();
      expect(domain.name).toBeTruthy();
      expect(domain.description).toBeTruthy();
      expect(typeof domain.complianceScore).toBe('number');
      expect(domain.complianceScore).toBeGreaterThanOrEqual(0);
      expect(domain.complianceScore).toBeLessThanOrEqual(100);
    }
  });

  it('has unique domain codes', () => {
    const codes = (domains as Domain[]).map((d) => d.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('includes all expected MCSB v2 domain codes', () => {
    const codes = (domains as Domain[]).map((d) => d.code);
    const expected = ['IM', 'NS', 'DP', 'AM', 'LT', 'IR', 'PV', 'ES', 'BR', 'DS', 'GS', 'AI'];
    for (const code of expected) {
      expect(codes).toContain(code);
    }
  });
});

describe('Mock data: mcsb-controls.json', () => {
  const controlMap = allControls as Record<string, { id: string; title: string; description: string; status: string; kqlQuery: string; policyLink: string; remediation: string; dataSource: { type: string; table: string; license: string; setup: string[] } }[]>;

  it('has controls for all 12 domains', () => {
    const domainCodes = (domains as Domain[]).map((d) => d.code);
    for (const code of domainCodes) {
      expect(controlMap[code]).toBeDefined();
      expect(controlMap[code].length).toBeGreaterThanOrEqual(3);
    }
  });

  it('each control has required fields with valid types', () => {
    for (const [domainCode, controls] of Object.entries(controlMap)) {
      for (const control of controls) {
        expect(control.id).toMatch(new RegExp(`^${domainCode}-\\d+$`));
        expect(control.title).toBeTruthy();
        expect(control.description).toBeTruthy();
        expect(validStatuses).toContain(control.status);
        expect(control.kqlQuery).toBeTruthy();
        expect(control.policyLink).toMatch(/^https:\/\//);
        expect(control.remediation).toBeTruthy();
        expect(control.dataSource).toBeDefined();
        expect(['Azure Resource Graph', 'Log Analytics', 'Microsoft Defender XDR']).toContain(control.dataSource.type);
        expect(control.dataSource.table).toBeTruthy();
        expect(control.dataSource.license).toBeTruthy();
        expect(control.dataSource.setup.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('control IDs are unique within each domain', () => {
    for (const controls of Object.values(controlMap)) {
      const ids = controls.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('no control contains hardcoded secrets or tokens', () => {
    const jsonText = JSON.stringify(allControls);
    expect(jsonText).not.toMatch(/password\s*[:=]\s*["'][^"']+["']/i);
    expect(jsonText).not.toMatch(/secret\s*[:=]\s*["'][^"']+["']/i);
    expect(jsonText).not.toMatch(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/);
    expect(jsonText).not.toMatch(/[A-Za-z0-9+/]{40,}={0,2}/);
  });
});

describe('Computed compliance scores', () => {
  it('scores match actual compliant/total ratio for each domain', () => {
    const controlMap = allControls as Record<string, { id: string; status: string }[]>;
    // Simulate a statusMap where each control has its JSON status
    const statusMap: Record<string, string> = {};
    for (const [, controls] of Object.entries(controlMap)) {
      for (const c of controls) {
        statusMap[c.id] = c.status;
      }
    }
    for (const domain of domains as Domain[]) {
      const controls = controlMap[domain.code];
      const compliant = controls.filter((c) => c.status === 'compliant').length;
      const expected = Math.round((compliant / controls.length) * 100);
      expect(getComplianceScore(domain.code, statusMap)).toBe(expected);
    }
  });

  it('returns 0 for unknown domain code', () => {
    expect(getComplianceScore('XX', {})).toBe(0);
  });

  it('returns 0% when all controls are unchecked (empty statusMap)', () => {
    for (const domain of domains as Domain[]) {
      expect(getComplianceScore(domain.code, {})).toBe(0);
    }
  });

  it('counts partial status as 0.5 in compliance score', () => {
    const controlMap = allControls as Record<string, { id: string }[]>;
    // Pick first domain with controls
    const domainCode = (domains as Domain[])[0].code;
    const controls = controlMap[domainCode];
    // Set all controls to partial
    const statusMap: Record<string, string> = {};
    for (const c of controls) {
      statusMap[c.id] = 'partial';
    }
    // All partial → score = (0 + count*0.5) / count * 100 = 50
    expect(getComplianceScore(domainCode, statusMap)).toBe(50);
  });

  it('combines compliant and partial correctly in score', () => {
    const controlMap = allControls as Record<string, { id: string }[]>;
    const domainCode = (domains as Domain[])[0].code;
    const controls = controlMap[domainCode];
    const statusMap: Record<string, string> = {};
    // First control compliant (1.0), second control partial (0.5), rest unchecked (0)
    statusMap[controls[0].id] = 'compliant';
    if (controls.length > 1) {
      statusMap[controls[1].id] = 'partial';
    }
    const expected = Math.round(((1 + (controls.length > 1 ? 0.5 : 0)) / controls.length) * 100);
    expect(getComplianceScore(domainCode, statusMap)).toBe(expected);
  });
});
