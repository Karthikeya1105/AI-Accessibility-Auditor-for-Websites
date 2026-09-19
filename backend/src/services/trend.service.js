import { StorageService } from './storage.service.js';
import { WebsiteService } from './website.service.js';
import { IssueLifecycleService } from './issue-lifecycle.service.js';
import { CategoryTrendService } from './category-trend.service.js';

export class TrendService {
  /**
   * Computes two-track historical baseline vs current improvement trends and multi-level analytics.
   * Filter: Only scans with status !== 'failed' are included.
   * @param {string} domainOrId 
   * @param {string|null} userId
   * @returns {Promise<object>} Two-track trend analytics report
   */
  static async getWebsiteTrends(domainOrId, userId = null) {
    const targetWebsiteId = WebsiteService.getWebsiteId(domainOrId);
    const filter = userId ? { userId } : {};
    const allScans = await StorageService.getAllScans(filter);

    // Filter scans matching this domain and exclude failed scans
    const completedScans = allScans.filter(scan => {
      const scanWebsiteId = scan.websiteId || WebsiteService.getWebsiteId(scan.url || scan.baseUrl || '');
      return scanWebsiteId === targetWebsiteId && scan.status !== 'failed' && scan.status !== 'ACCESS_DENIED';
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (completedScans.length === 0) {
      return {
        website: { websiteId: targetWebsiteId, domain: targetWebsiteId },
        totalScans: 0,
        baseline: null,
        current: null,
        overallImprovement: {
          scorePoints: 0,
          relativeScoreChange: 0,
          issuesReduced: 0,
          issueReductionPercentage: 0,
          status: 'No Completed Scans'
        },
        shortTermImprovement: { scoreDelta: 0, issuesDelta: 0 },
        severityBreakdown: {
          critical: { baseline: 0, current: 0, delta: 0 },
          major: { baseline: 0, current: 0, delta: 0 },
          minor: { baseline: 0, current: 0, delta: 0 }
        },
        categoryImprovements: [],
        issueLifecycle: { fixed: [], new: [], persistent: [], regressed: [] },
        whatImprovedList: [],
        stillPresentList: [],
        timeline: [],
        scans: []
      };
    }

    // Register domain baseline/latest scan in WebsiteService
    const baselineScan = completedScans[0];
    const currentScan = completedScans[completedScans.length - 1];
    const previousScan = completedScans.length > 1 ? completedScans[completedScans.length - 2] : baselineScan;

    await WebsiteService.registerScan(targetWebsiteId, baselineScan.id, baselineScan.timestamp);
    await WebsiteService.registerScan(targetWebsiteId, currentScan.id, currentScan.timestamp);

    const baselineTotalIssues = (baselineScan.counts?.critical || 0) + (baselineScan.counts?.major || 0) + (baselineScan.counts?.minor || 0);
    const currentTotalIssues = (currentScan.counts?.critical || 0) + (currentScan.counts?.major || 0) + (currentScan.counts?.minor || 0);
    const previousTotalIssues = (previousScan.counts?.critical || 0) + (previousScan.counts?.major || 0) + (previousScan.counts?.minor || 0);

    // Track 1 — Long-Term Track (V1 -> Vn)
    const scorePoints = currentScan.score - baselineScan.score;
    const relativeScoreChange = baselineScan.score > 0
      ? parseFloat((((currentScan.score - baselineScan.score) / baselineScan.score) * 100).toFixed(2))
      : 0;

    const issuesReduced = baselineTotalIssues - currentTotalIssues;
    const issueReductionPercentage = baselineTotalIssues > 0
      ? parseFloat(((issuesReduced / baselineTotalIssues) * 100).toFixed(2))
      : 0;

    // Track 2 — Short-Term Track (Vn-1 -> Vn)
    const shortTermScoreDelta = currentScan.score - previousScan.score;
    const shortTermIssuesDelta = currentTotalIssues - previousTotalIssues;

    const baseline = {
      scanId: baselineScan.id,
      timestamp: baselineScan.timestamp,
      dateFormatted: new Date(baselineScan.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      score: baselineScan.score,
      totalIssues: baselineTotalIssues,
      counts: {
        critical: baselineScan.counts?.critical || 0,
        major: baselineScan.counts?.major || 0,
        minor: baselineScan.counts?.minor || 0
      },
      categoryScores: baselineScan.categoryScores || {}
    };

    const current = {
      scanId: currentScan.id,
      timestamp: currentScan.timestamp,
      dateFormatted: new Date(currentScan.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      score: currentScan.score,
      totalIssues: currentTotalIssues,
      counts: {
        critical: currentScan.counts?.critical || 0,
        major: currentScan.counts?.major || 0,
        minor: currentScan.counts?.minor || 0
      },
      categoryScores: currentScan.categoryScores || {}
    };

    const overallImprovement = {
      scorePoints,
      relativeScoreChange,
      issuesReduced,
      issueReductionPercentage,
      status: scorePoints > 0 ? 'Improved' : scorePoints < 0 ? 'Regressed' : 'Unchanged'
    };

    const shortTermImprovement = {
      previousScanId: previousScan.id,
      previousScore: previousScan.score,
      currentScore: currentScan.score,
      scoreDelta: shortTermScoreDelta,
      issuesDelta: shortTermIssuesDelta,
      status: shortTermScoreDelta > 0 ? 'Improved' : shortTermScoreDelta < 0 ? 'Regressed' : 'Unchanged'
    };

    const severityBreakdown = {
      critical: {
        baseline: baseline.counts.critical,
        current: current.counts.critical,
        delta: current.counts.critical - baseline.counts.critical
      },
      major: {
        baseline: baseline.counts.major,
        current: current.counts.major,
        delta: current.counts.major - baseline.counts.major
      },
      minor: {
        baseline: baseline.counts.minor,
        current: current.counts.minor,
        delta: current.counts.minor - baseline.counts.minor
      }
    };

    // Category Improvements (V1 -> Vn) via CategoryTrendService
    const categoryImprovements = CategoryTrendService.computeCategoryImprovements(baselineScan, currentScan);

    // Issue Lifecycle (Vn-1 -> Vn) via IssueLifecycleService
    const issueLifecycle = IssueLifecycleService.computeLifecycle(
      previousScan,
      currentScan,
      completedScans.slice(0, -1)
    );

    // What Improved Since Baseline V1 (instance-based resolution list)
    const getInstancesMap = (scan) => {
      const map = new Map();
      const list = scan.issues || [];
      if (scan.isBatch && scan.pages) {
        scan.pages.forEach(p => {
          (p.issues || []).forEach(iss => {
            const instId = IssueLifecycleService.getIssueInstanceId(iss, p.url);
            if (!map.has(instId)) map.set(instId, { ...iss, issueInstanceId: instId, pageUrl: p.url });
          });
        });
      } else {
        list.forEach(iss => {
          const instId = IssueLifecycleService.getIssueInstanceId(iss, scan.url);
          if (!map.has(instId)) map.set(instId, { ...iss, issueInstanceId: instId, pageUrl: scan.url });
        });
      }
      return map;
    };

    const baseInstances = getInstancesMap(baselineScan);
    const currInstances = getInstancesMap(currentScan);

    const resolvedRulesMap = new Map();
    baseInstances.forEach((iss, id) => {
      if (!currInstances.has(id)) {
        const title = iss.title || iss.ruleId || 'Accessibility Violation';
        if (!resolvedRulesMap.has(title)) {
          resolvedRulesMap.set(title, {
            title,
            ruleId: iss.ruleId,
            category: iss.category,
            severity: iss.severity,
            countFixed: 0
          });
        }
        resolvedRulesMap.get(title).countFixed += 1;
      }
    });

    const whatImprovedList = Array.from(resolvedRulesMap.values());

    const stillPresentMap = new Map();
    currInstances.forEach((iss) => {
      const title = iss.title || iss.ruleId || 'Accessibility Violation';
      if (!stillPresentMap.has(title)) {
        stillPresentMap.set(title, {
          title,
          ruleId: iss.ruleId,
          category: iss.category,
          severity: iss.severity,
          count: 0
        });
      }
      stillPresentMap.get(title).count += 1;
    });

    const stillPresentList = Array.from(stillPresentMap.values());

    // Timeline array V1..Vn
    const timeline = completedScans.map((scan, idx) => {
      const totIssues = (scan.counts?.critical || 0) + (scan.counts?.major || 0) + (scan.counts?.minor || 0);
      return {
        verificationId: `V${idx + 1}`,
        scanId: scan.id,
        timestamp: scan.timestamp,
        dateFormatted: new Date(scan.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: scan.score,
        critical: scan.counts?.critical || 0,
        major: scan.counts?.major || 0,
        minor: scan.counts?.minor || 0,
        totalIssues: totIssues,
        pointsDeltaFromBaseline: scan.score - baselineScan.score,
        isBaseline: idx === 0,
        isCurrent: idx === completedScans.length - 1,
        isBatch: Boolean(scan.isBatch)
      };
    });

    return {
      website: {
        websiteId: targetWebsiteId,
        domain: targetWebsiteId,
        baselineScanId: baselineScan.id,
        latestScanId: currentScan.id
      },
      totalScans: completedScans.length,
      baseline,
      current,
      overallImprovement,
      shortTermImprovement,
      severityBreakdown,
      categoryImprovements,
      issueLifecycle,
      whatImprovedList,
      stillPresentList,
      timeline,
      scans: completedScans
    };
  }
}
