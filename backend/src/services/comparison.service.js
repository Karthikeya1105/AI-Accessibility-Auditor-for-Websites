import Groq from 'groq-sdk';

const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it', 'llama-3.1-8b-instant'];

export class ComparisonService {
  /**
   * Compares two scan records using issue fingerprints and 4-state lifecycle classification.
   * @param {object} scanA Previous scan
   * @param {object} scanB Current scan
   * @returns {Promise<object>} Detailed comparison report
   */
  static async compareScans(scanA, scanB) {
    if (!scanA || !scanB) {
      throw new Error('Both scan records are required for historical comparison.');
    }

    const scoreDiff = scanB.score - scanA.score;
    let statusChange = 'Unchanged';
    if (scoreDiff > 0) statusChange = 'Improved';
    else if (scoreDiff < 0) statusChange = 'Regressed';

    // Collect issue maps keyed by fingerprint
    const getIssuesByFingerprint = (scan) => {
      const map = new Map();
      const list = scan.issues || [];

      // If batch scan, also check frequency or page issues
      if (scan.isBatch && scan.pages) {
        scan.pages.forEach(p => {
          (p.issues || []).forEach(iss => {
            const fp = iss.fingerprint || `${iss.ruleId}|${iss.selector}`;
            if (!map.has(fp)) map.set(fp, { ...iss, pageUrl: p.url });
          });
        });
      } else {
        list.forEach(iss => {
          const fp = iss.fingerprint || `${iss.ruleId}|${iss.selector}`;
          if (!map.has(fp)) map.set(fp, { ...iss, pageUrl: scan.url });
        });
      }
      return map;
    };

    const mapA = getIssuesByFingerprint(scanA);
    const mapB = getIssuesByFingerprint(scanB);

    const fixedIssues = [];
    const persistingIssues = [];
    const newIssues = [];
    const regressedIssues = [];

    // Check Scan A issues
    mapA.forEach((issA, fp) => {
      if (mapB.has(fp)) {
        persistingIssues.push({
          fingerprint: fp,
          ruleId: issA.ruleId,
          category: issA.category,
          severity: issA.severity,
          wcag: issA.wcag,
          context: issA.context,
          selector: issA.selector,
          pageUrl: issA.pageUrl,
          htmlBefore: issA.originalSnippet,
          htmlAfter: mapB.get(fp).originalSnippet || issA.suggestedFixCode,
          explanation: issA.explanation,
          lifecycle: 'PERSISTING'
        });
      } else {
        fixedIssues.push({
          fingerprint: fp,
          ruleId: issA.ruleId,
          category: issA.category,
          severity: issA.severity,
          wcag: issA.wcag,
          context: issA.context,
          selector: issA.selector,
          pageUrl: issA.pageUrl,
          htmlBefore: issA.originalSnippet,
          htmlAfter: issA.suggestedFixCode,
          explanation: `Issue resolved! ${issA.context}`,
          lifecycle: 'FIXED'
        });
      }
    });

    // Check Scan B issues
    mapB.forEach((issB, fp) => {
      if (!mapA.has(fp)) {
        newIssues.push({
          fingerprint: fp,
          ruleId: issB.ruleId,
          category: issB.category,
          severity: issB.severity,
          wcag: issB.wcag,
          context: issB.context,
          selector: issB.selector,
          pageUrl: issB.pageUrl,
          htmlCurrent: issB.originalSnippet,
          suggestedFixCode: issB.suggestedFixCode,
          explanation: `New issue detected: ${issB.context}`,
          lifecycle: 'NEW'
        });
      }
    });

    // Count summaries
    const countA = scanA.counts || { critical: 0, major: 0, minor: 0 };
    const countB = scanB.counts || { critical: 0, major: 0, minor: 0 };

    const issueDiffs = {
      critical: { before: countA.critical, after: countB.critical, diff: countB.critical - countA.critical },
      major: { before: countA.major, after: countB.major, diff: countB.major - countA.major },
      minor: { before: countA.minor, after: countB.minor, diff: countB.minor - countA.minor }
    };

    // AI Executive Trend Summary Synthesis
    let aiTrendSummary = `Between ${new Date(scanA.timestamp).toLocaleDateString()} and ${new Date(scanB.timestamp).toLocaleDateString()}, the score changed from ${scanA.score}% to ${scanB.score}% (${scoreDiff >= 0 ? '+' + scoreDiff : scoreDiff} points). ${fixedIssues.length} issues were fixed, ${newIssues.length} new issues were detected, and ${persistingIssues.length} issues persist.`;

    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      try {
        const groq = new Groq({ apiKey });
        const prompt = `Synthesize a 2-3 sentence executive summary for a Web Accessibility Audit comparison:
- Target: ${scanB.url}
- Score Change: ${scanA.score}% -> ${scanB.score}% (${statusChange})
- Fixed Issues: ${fixedIssues.length}
- Persisting Issues: ${persistingIssues.length}
- New Issues: ${newIssues.length}
- Key Fixed Categories: ${Array.from(new Set(fixedIssues.map(i => i.category))).join(', ') || 'None'}

Return ONLY a string executive summary.`;

        for (const m of GROQ_MODELS) {
          try {
            const completion = await groq.chat.completions.create({
              messages: [{ role: 'user', content: prompt }],
              model: m,
              temperature: 0.3
            });
            const resText = completion.choices[0]?.message?.content?.trim();
            if (resText) {
              aiTrendSummary = resText;
              break;
            }
          } catch {
            continue;
          }
        }
      } catch (err) {
        console.warn('[ComparisonService] AI trend summary failed, using fallback summary:', err.message);
      }
    }

    return {
      scanAId: scanA.id,
      scanBId: scanB.id,
      timestampA: scanA.timestamp,
      timestampB: scanB.timestamp,
      targetUrl: scanB.url || scanA.url,
      scoreA: scanA.score,
      scoreB: scanB.score,
      scoreDiff,
      statusChange,
      aiTrendSummary,
      issueDiffs,
      lifecycleCounts: {
        fixed: fixedIssues.length,
        persisting: persistingIssues.length,
        new: newIssues.length,
        regressed: regressedIssues.length
      },
      fixedIssues,
      persistingIssues,
      newIssues,
      regressedIssues
    };
  }
}
