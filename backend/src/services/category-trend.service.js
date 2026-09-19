/**
 * Service responsible for category score normalization and category-level trend analysis.
 */
export class CategoryTrendService {
  static CATEGORIES = [
    'Images & Media',
    'Color & Contrast',
    'Forms & Controls',
    'Headings & Structure',
    'Links & Navigation',
    'ARIA & Semantics'
  ];

  /**
   * Compares category scores between baseline scan V1 and current scan Vn.
   * @param {object} baselineScan V1
   * @param {object} currentScan Vn
   * @returns {Array<object>} Category improvements list
   */
  static computeCategoryImprovements(baselineScan, currentScan) {
    const baseScores = baselineScan?.categoryScores || {};
    const currScores = currentScan?.categoryScores || {};

    return this.CATEGORIES.map(cat => {
      const baseVal = baseScores[cat] !== undefined ? baseScores[cat] : 50;
      const currVal = currScores[cat] !== undefined ? currScores[cat] : 50;
      const change = currVal - baseVal;

      return {
        category: cat,
        baselineScore: baseVal,
        currentScore: currVal,
        change,
        status: change > 0 ? 'Improved' : change < 0 ? 'Regressed' : 'Unchanged'
      };
    });
  }
}
