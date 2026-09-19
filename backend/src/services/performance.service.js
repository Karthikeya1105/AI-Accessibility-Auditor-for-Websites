export class PerformanceService {
  /**
   * Evaluates accessibility fixes for broader SEO, mobile usability, and performance impact notes.
   * @param {Array<object>} issues Detected issues
   * @param {number} durationSeconds Load time in seconds
   * @returns {object} Usability & SEO Impact Report
   */
  static evaluateImpact(issues = [], durationSeconds = 0.5) {
    const impactNotes = [];

    const hasAltTextIssues = issues.some(i => i.category === 'Images & Media');
    if (hasAltTextIssues) {
      impactNotes.push({
        title: 'Image Search & SEO Indexability',
        category: 'SEO & Search',
        icon: 'Image',
        benefit: 'Adding descriptive alt text allows search engine crawlers (Google Image Search) to index visual media, driving organic search traffic.'
      });
    }

    const hasFormIssues = issues.some(i => i.category === 'Forms & Controls');
    if (hasFormIssues) {
      impactNotes.push({
        title: 'Mobile Form Completion Rate',
        category: 'Mobile Usability',
        icon: 'FormInput',
        benefit: 'Explicitly associated labels increase touch target area on mobile screens, reducing form abandonment and input frustration.'
      });
    }

    const hasHeadingIssues = issues.some(i => i.category === 'Headings & Structure');
    if (hasHeadingIssues) {
      impactNotes.push({
        title: 'Content Document Outline',
        category: 'Content Structure',
        icon: 'Heading',
        benefit: 'Logical heading hierarchy improves content scannability for human users and helps search engines understand page topic hierarchy.'
      });
    }

    const hasContrastIssues = issues.some(i => i.category === 'Color & Contrast');
    if (hasContrastIssues) {
      impactNotes.push({
        title: 'Outdoor & High-Glare Mobile Readability',
        category: 'Mobile Usability',
        icon: 'Sun',
        benefit: 'High contrast ratio ensures text remains legible under bright sunlight or low-end mobile LCD screens.'
      });
    }

    return {
      loadDurationSeconds: durationSeconds,
      speedBadge: durationSeconds < 1.0 ? 'Fast (Sub-second)' : 'Moderate',
      disclaimer: 'Note: Accessibility improvements support better mobile user experience and search engine discoverability. Measured accessibility scores represent WCAG 2.1 compliance and do not guarantee search engine ranking placement.',
      impactNotes
    };
  }
}
