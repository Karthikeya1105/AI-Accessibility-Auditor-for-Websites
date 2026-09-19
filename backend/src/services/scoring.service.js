export class ScoringService {
  /**
   * Calculates overall accessibility score, category breakdown, issue counts, and manual review items.
   * @param {Array<object>} rawIssues 
   * @returns {object} Structured audit evaluation summary
   */
  static calculateScore(rawIssues = []) {
    const counts = {
      critical: 0,
      major: 0,
      minor: 0,
      total: rawIssues.length
    };

    const categoryScores = {
      'Images & Media': 100,
      'Color & Contrast': 100,
      'Forms & Controls': 100,
      'Headings & Structure': 100,
      'Links & Navigation': 100,
      'ARIA & Semantics': 100
    };

    const categoryPenalty = {
      'Images & Media': 0,
      'Color & Contrast': 0,
      'Forms & Controls': 0,
      'Headings & Structure': 0,
      'Links & Navigation': 0,
      'ARIA & Semantics': 0
    };

    rawIssues.forEach(issue => {
      const severity = (issue.severity || 'Minor').toLowerCase();
      let penalty = 2;
      if (severity === 'critical') {
        counts.critical++;
        penalty = 12;
      } else if (severity === 'major') {
        counts.major++;
        penalty = 6;
      } else {
        counts.minor++;
      }

      const cat = issue.category || 'ARIA & Semantics';
      if (categoryPenalty[cat] !== undefined) {
        categoryPenalty[cat] += penalty;
      }
    });

    // Calculate individual category scores
    Object.keys(categoryScores).forEach(cat => {
      categoryScores[cat] = Math.max(0, Math.min(100, 100 - categoryPenalty[cat]));
    });

    // Overall weighted score computation
    const totalPenalty = counts.critical * 12 + counts.major * 6 + counts.minor * 2;
    const overallScore = Math.max(0, Math.min(100, Math.round(100 - totalPenalty)));

    // Estimate WCAG Conformance Status
    let wcagLevel = 'WCAG 2.1 Level AA Compliant';
    let statusBadge = 'success';
    if (overallScore < 50 || counts.critical > 0) {
      wcagLevel = 'WCAG Non-Compliant (Critical Violations)';
      statusBadge = 'danger';
    } else if (overallScore < 85 || counts.major > 2) {
      wcagLevel = 'WCAG Level A Partial (AA Action Needed)';
      statusBadge = 'warning';
    }

    // Recommended Manual Review Checklist Items
    const manualReviewItems = [
      {
        id: 'mr-01',
        title: 'Meaningful Alt Text Quality',
        description: 'Verify image alt text provides equivalent context and meaning, not just superficial image tags.',
        wcag: 'WCAG 1.1.1'
      },
      {
        id: 'mr-02',
        title: 'Keyboard Focus Order & Visibility',
        description: 'Navigate the entire site using Tab and Shift+Tab keys to ensure all interactive elements receive visible focus rings in logical order.',
        wcag: 'WCAG 2.4.7'
      },
      {
        id: 'mr-03',
        title: 'Screen Reader Interaction Testing',
        description: 'Test interactive dropdowns, modals, and dynamic content updates with NVDA, VoiceOver, or JAWS.',
        wcag: 'WCAG 4.1.2'
      },
      {
        id: 'mr-04',
        title: 'Responsive Text Scaling (200% Zoom)',
        description: 'Zoom page to 200% in browser settings and ensure text does not truncate, overlap, or require horizontal scrolling.',
        wcag: 'WCAG 1.4.4'
      }
    ];

    return {
      overallScore,
      wcagLevel,
      statusBadge,
      counts,
      categoryScores,
      manualReviewItems
    };
  }
}
