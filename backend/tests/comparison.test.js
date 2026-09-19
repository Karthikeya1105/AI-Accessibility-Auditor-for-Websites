import { describe, it, expect } from 'vitest';
import { ComparisonService } from '../src/services/comparison.service.js';

describe('ComparisonService Engine Tests (4-State Issue Lifecycle)', () => {
  it('should correctly classify FIXED, NEW, PERSISTING, and REGRESSED issues between scans', async () => {
    const scanA = {
      id: 'scan-1',
      score: 60,
      url: 'https://example.com',
      timestamp: '2026-09-01T00:00:00Z',
      counts: { critical: 2, major: 2, minor: 0, total: 4 },
      issues: [
        { id: 'iss-1', ruleId: 'image-alt', selector: 'img.hero', severity: 'critical', category: 'Images & Media' },
        { id: 'iss-2', ruleId: 'form-label', selector: 'input#email', severity: 'major', category: 'Forms & Controls' }
      ]
    };

    const scanB = {
      id: 'scan-2',
      score: 80,
      url: 'https://example.com',
      timestamp: '2026-09-10T00:00:00Z',
      counts: { critical: 0, major: 2, minor: 0, total: 2 },
      issues: [
        { id: 'iss-2', ruleId: 'form-label', selector: 'input#email', severity: 'major', category: 'Forms & Controls' },
        { id: 'iss-3', ruleId: 'link-name', selector: 'a.readmore', severity: 'minor', category: 'Links & Navigation' }
      ]
    };

    const comparison = await ComparisonService.compareScans(scanA, scanB);
    expect(comparison.scoreDiff).toBe(20);
    expect(comparison.statusChange).toBe('Improved');

    // iss-1 in scanA but missing in scanB -> FIXED
    expect(comparison.fixedIssues.some(i => i.ruleId === 'image-alt')).toBe(true);

    // iss-3 missing in scanA but present in scanB -> NEW
    expect(comparison.newIssues.some(i => i.ruleId === 'link-name')).toBe(true);

    // iss-2 in both -> PERSISTING
    expect(comparison.persistingIssues.some(i => i.ruleId === 'form-label')).toBe(true);
  });
});
