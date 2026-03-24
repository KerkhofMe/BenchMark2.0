import { describe, it, expect } from 'vitest';
import { statusColor, statusLabel, statusDotColor, scoreColor, scoreDotColor, severityColor } from '../utils/status';
import type { ControlStatus, Severity } from '../types/control';

const allStatuses: ControlStatus[] = ['compliant', 'non-compliant', 'partial', 'manual', 'unchecked'];
const allSeverities: Severity[] = ['critical', 'high', 'medium', 'low'];

describe('statusColor', () => {
  it('returns a non-empty string for every status', () => {
    for (const status of allStatuses) {
      expect(statusColor(status)).toBeTruthy();
    }
  });

  it('returns green for compliant', () => {
    expect(statusColor('compliant')).toContain('green');
  });

  it('returns red for non-compliant', () => {
    expect(statusColor('non-compliant')).toContain('red');
  });
});

describe('statusLabel', () => {
  it('returns a human-readable label for every status', () => {
    for (const status of allStatuses) {
      const label = statusLabel(status);
      expect(label).toBeTruthy();
      expect(label.length).toBeGreaterThan(2);
    }
  });

  it('returns "Non-Compliant" for non-compliant', () => {
    expect(statusLabel('non-compliant')).toBe('Non-Compliant');
  });
});

describe('statusDotColor', () => {
  it('returns a bg- class for every status', () => {
    for (const status of allStatuses) {
      expect(statusDotColor(status)).toMatch(/^bg-/);
    }
  });
});

describe('scoreColor', () => {
  it('returns green for 80+', () => {
    expect(scoreColor(80)).toContain('green');
    expect(scoreColor(100)).toContain('green');
  });

  it('returns yellow for 60-79', () => {
    expect(scoreColor(60)).toContain('yellow');
    expect(scoreColor(79)).toContain('yellow');
  });

  it('returns red for <60', () => {
    expect(scoreColor(0)).toContain('red');
    expect(scoreColor(59)).toContain('red');
  });
});

describe('scoreDotColor', () => {
  it('returns correct bg class for score ranges', () => {
    expect(scoreDotColor(90)).toContain('green');
    expect(scoreDotColor(70)).toContain('yellow');
    expect(scoreDotColor(30)).toContain('red');
  });
});

describe('severityColor', () => {
  it('returns non-empty class string for every severity', () => {
    for (const sev of allSeverities) {
      const result = severityColor(sev);
      expect(result).toBeTruthy();
      expect(result).toContain('text-');
      expect(result).toContain('bg-');
    }
  });

  it('returns red color for critical', () => {
    expect(severityColor('critical')).toContain('red');
  });

  it('returns orange color for high', () => {
    expect(severityColor('high')).toContain('orange');
  });
});
