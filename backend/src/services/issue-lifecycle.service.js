/**
 * Service responsible for issue instance identification and 4-state lifecycle tracking.
 */
export class IssueLifecycleService {
  /**
   * Generates a stable issueInstanceId for a given violation.
   * @param {object} issue 
   * @param {string} pageUrl 
   * @returns {string} issueInstanceId
   */
  static getIssueInstanceId(issue, pageUrl = '') {
    if (issue.issueInstanceId) return issue.issueInstanceId;
    
    let path = '/';
    try {
      if (pageUrl && pageUrl.startsWith('http')) {
        path = new URL(pageUrl).pathname || '/';
      } else if (pageUrl) {
        path = pageUrl;
      }
    } catch {
      path = pageUrl || '/';
    }

    const ruleId = issue.ruleId || 'unknown-rule';
    const selector = (issue.selector || issue.element || '').replace(/\s+/g, '').substring(0, 80);

    return `${ruleId}|${path}|${selector}`;
  }

  /**
   * Tracks 4-state issue lifecycle between previous scan Vk-1 and current scan Vk.
   * Also checks historical resolved issues for regression detection.
   * @param {object} previousScan Vk-1
   * @param {object} currentScan Vk
   * @param {Array<object>} allHistoricalScans V1..Vk-1
   * @returns {object} Lifecycle breakdown { fixed, new, persistent, regressed }
   */
  static computeLifecycle(previousScan, currentScan, allHistoricalScans = []) {
    if (!currentScan) {
      return { fixed: [], new: [], persistent: [], regressed: [] };
    }

    const getInstancesMap = (scan) => {
      const map = new Map();
      if (!scan) return map;

      const list = scan.issues || [];
      if (scan.isBatch && scan.pages) {
        scan.pages.forEach(p => {
          (p.issues || []).forEach(iss => {
            const instId = this.getIssueInstanceId(iss, p.url);
            if (!map.has(instId)) map.set(instId, { ...iss, issueInstanceId: instId, pageUrl: p.url });
          });
        });
      } else {
        list.forEach(iss => {
          const instId = this.getIssueInstanceId(iss, scan.url);
          if (!map.has(instId)) map.set(instId, { ...iss, issueInstanceId: instId, pageUrl: scan.url });
        });
      }
      return map;
    };

    const mapPrev = getInstancesMap(previousScan);
    const mapCurr = getInstancesMap(currentScan);

    // Collect all historical instances across V1..Vk-1
    const historicalInstancesSet = new Set();
    const historicallyResolvedSet = new Set();

    allHistoricalScans.forEach(scan => {
      const map = getInstancesMap(scan);
      map.forEach((_, id) => historicalInstancesSet.add(id));
    });

    // An issue was historically resolved if it was present in past scans but not present in previousScan
    historicalInstancesSet.forEach(id => {
      if (!mapPrev.has(id)) {
        historicallyResolvedSet.add(id);
      }
    });

    const fixed = [];
    const persistent = [];
    const newIssues = [];
    const regressed = [];

    // Check Previous scan instances
    mapPrev.forEach((issPrev, id) => {
      if (mapCurr.has(id)) {
        persistent.push({
          ...issPrev,
          lifecycle: 'PERSISTING',
          htmlBefore: issPrev.originalSnippet,
          htmlAfter: mapCurr.get(id).originalSnippet || issPrev.suggestedFixCode
        });
      } else {
        fixed.push({
          ...issPrev,
          lifecycle: 'FIXED',
          htmlBefore: issPrev.originalSnippet,
          htmlAfter: issPrev.suggestedFixCode,
          explanation: `Issue resolved! ${issPrev.context || ''}`
        });
      }
    });

    // Check Current scan instances
    mapCurr.forEach((issCurr, id) => {
      if (!mapPrev.has(id)) {
        // If it was present historically in V1..Vk-2, fixed, and now returned in Vk -> REGRESSED
        if (historicallyResolvedSet.has(id)) {
          regressed.push({
            ...issCurr,
            lifecycle: 'REGRESSED',
            explanation: `Regression detected! This issue was previously fixed in an earlier verification.`
          });
        } else {
          newIssues.push({
            ...issCurr,
            lifecycle: 'NEW',
            explanation: `New accessibility violation detected.`
          });
        }
      }
    });

    return {
      fixed,
      new: newIssues,
      persistent,
      regressed,
      counts: {
        fixed: fixed.length,
        new: newIssues.length,
        persistent: persistent.length,
        regressed: regressed.length
      }
    };
  }
}
