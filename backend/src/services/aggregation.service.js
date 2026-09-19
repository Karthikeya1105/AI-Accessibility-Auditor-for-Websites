export class AggregationService {
  /**
   * Aggregates individual page scan results into site-wide summary metrics.
   * @param {string} baseUrl 
   * @param {Array<object>} pageResults List of single-page scan result objects
   * @returns {object} Aggregated site scan report
   */
  static aggregateSiteResults(baseUrl, pageResults = []) {
    const successfulPages = pageResults.filter(p => p.status !== 'failed');
    const failedPages = pageResults.filter(p => p.status === 'failed');

    const totalPagesScanned = successfulPages.length;
    if (totalPagesScanned === 0) {
      return {
        baseUrl,
        isBatch: true,
        score: 0,
        wcagLevel: 'Scan Failed',
        statusBadge: 'danger',
        summary: { pagesScanned: 0, pagesFailed: failedPages.length, critical: 0, major: 0, minor: 0 },
        pages: pageResults,
        issueFrequency: [],
        worstPages: []
      };
    }

    // 1. Overall Score calculation (Average of page scores)
    const sumScores = successfulPages.reduce((acc, p) => acc + (p.score || 0), 0);
    const overallScore = Math.round(sumScores / totalPagesScanned);

    // 2. Aggregated Issue Counts
    const totalCounts = {
      critical: 0,
      major: 0,
      minor: 0,
      total: 0
    };

    successfulPages.forEach(p => {
      if (p.counts) {
        totalCounts.critical += p.counts.critical || 0;
        totalCounts.major += p.counts.major || 0;
        totalCounts.minor += p.counts.minor || 0;
        totalCounts.total += p.counts.total || 0;
      }
    });

    // 3. Category Score Averages
    const categoryTotals = {
      'Images & Media': 0,
      'Color & Contrast': 0,
      'Forms & Controls': 0,
      'Headings & Structure': 0,
      'Links & Navigation': 0,
      'ARIA & Semantics': 0
    };

    successfulPages.forEach(p => {
      if (p.categoryScores) {
        Object.keys(categoryTotals).forEach(cat => {
          categoryTotals[cat] += p.categoryScores[cat] !== undefined ? p.categoryScores[cat] : 100;
        });
      }
    });

    const categoryScores = {};
    Object.keys(categoryTotals).forEach(cat => {
      categoryScores[cat] = Math.round(categoryTotals[cat] / totalPagesScanned);
    });

    // 4. Site-Wide Issue Frequency Ranking
    const frequencyMap = new Map();

    successfulPages.forEach(page => {
      const issues = page.issues || [];
      const seenRulesOnPage = new Set();

      issues.forEach(issue => {
        const key = issue.ruleId || `${issue.category}-${issue.element}`;

        if (!frequencyMap.has(key)) {
          frequencyMap.set(key, {
            ruleId: key,
            category: issue.category,
            severity: issue.severity,
            wcag: issue.wcag,
            context: issue.context,
            originalSnippet: issue.originalSnippet,
            suggestedFixCode: issue.suggestedFixCode,
            explanation: issue.explanation,
            occurrences: 0,
            affectedPagesSet: new Set()
          });
        }

        const entry = frequencyMap.get(key);
        entry.occurrences += 1;
        entry.affectedPagesSet.add(page.pageTitle || page.url);
      });
    });

    const issueFrequency = Array.from(frequencyMap.values()).map(item => ({
      ruleId: item.ruleId,
      category: item.category,
      severity: item.severity,
      wcag: item.wcag,
      context: item.context,
      originalSnippet: item.originalSnippet,
      suggestedFixCode: item.suggestedFixCode,
      explanation: item.explanation,
      occurrences: item.occurrences,
      affectedPagesCount: item.affectedPagesSet.size,
      affectedPages: Array.from(item.affectedPagesSet)
    })).sort((a, b) => b.occurrences - a.occurrences);

    // 5. Rank Worst Performing Pages
    const worstPages = [...successfulPages].sort((a, b) => a.score - b.score);

    // 6. WCAG Conformance Badge Status
    let wcagLevel = 'WCAG 2.1 Level AA Compliant';
    let statusBadge = 'success';
    if (overallScore < 50 || totalCounts.critical > 0) {
      wcagLevel = 'WCAG Non-Compliant (Critical Violations)';
      statusBadge = 'danger';
    } else if (overallScore < 85 || totalCounts.major > 3) {
      wcagLevel = 'WCAG Level A Partial (AA Action Needed)';
      statusBadge = 'warning';
    }

    return {
      baseUrl,
      isBatch: true,
      score: overallScore,
      wcagLevel,
      statusBadge,
      counts: totalCounts,
      categoryScores,
      issueFrequency,
      worstPages: worstPages.map(p => ({ url: p.url, pageTitle: p.pageTitle, score: p.score, counts: p.counts })),
      pagesScanned: totalPagesScanned,
      pagesFailed: failedPages.length,
      pages: pageResults
    };
  }
}
