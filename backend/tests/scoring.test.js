import { describe, it, expect } from 'vitest';
import { ScoringService } from '../src/services/scoring.service.js';

describe('ScoringService Engine Tests', () => {
  it('should return 100 overall score when zero accessibility issues are found', () => {
    const scoreResult = ScoringService.calculateScore([]);
    expect(scoreResult.overallScore).toBe(100);
    expect(scoreResult.statusBadge).toBe('success');
    expect(scoreResult.counts.total).toBe(0);
  });

  it('should deduct points proportionally based on issue severity weights', () => {
    const mockIssues = [
      { ruleId: 'image-alt', severity: 'critical', category: 'Images & Media' },
      { ruleId: 'form-label', severity: 'major', category: 'Forms & Controls' },
      { ruleId: 'link-name', severity: 'minor', category: 'Links & Navigation' }
    ];

    const scoreResult = ScoringService.calculateScore(mockIssues);
    expect(scoreResult.overallScore).toBeLessThan(100);
    expect(scoreResult.counts.critical).toBe(1);
    expect(scoreResult.counts.major).toBe(1);
    expect(scoreResult.counts.minor).toBe(1);
    expect(scoreResult.counts.total).toBe(3);
  });

  it('should generate appropriate WCAG level badges for low scores', () => {
    const mockIssues = Array(15).fill({ ruleId: 'image-alt', severity: 'critical', category: 'Images & Media' });
    const scoreResult = ScoringService.calculateScore(mockIssues);
    expect(scoreResult.overallScore).toBeLessThan(50);
    expect(scoreResult.statusBadge).toBe('danger');
  });
});
