import { SecurityService } from '../services/security.service.js';
import { BrowserService } from '../services/browser.service.js';
import { PageDiscoveryService } from '../services/pageDiscovery.service.js';
import { CustomRulesService } from '../services/customRules.service.js';
import { ScoringService } from '../services/scoring.service.js';
import { AIService } from '../services/ai.service.js';
import { AggregationService } from '../services/aggregation.service.js';
import { StorageService } from '../services/storage.service.js';
import { ComparisonService } from '../services/comparison.service.js';
import { PerformanceService } from '../services/performance.service.js';
import { WebsiteService } from '../services/website.service.js';
import { TrendService } from '../services/trend.service.js';

export class ScanController {
  /**
   * POST /api/scan
   */
  static async scan(req, res) {
    const startTime = Date.now();
    const { url, html, mode = 'url' } = req.body;

    try {
      let pageData;

      if (mode === 'url' || (url && !html)) {
        const sec = SecurityService.validateUrl(url);
        if (!sec.safe) {
          return res.status(400).json({ error: sec.error });
        }
        pageData = await BrowserService.fetchUrlContent(sec.url);
      } else {
        const sec = SecurityService.validateHtml(html);
        if (!sec.safe) {
          return res.status(400).json({ error: sec.error });
        }
        pageData = BrowserService.parseRawHtml(sec.html);
      }

      const rawIssues = CustomRulesService.runAllChecks(pageData.$);
      const scoreResult = ScoringService.calculateScore(rawIssues);
      const enrichedIssues = await AIService.enrichIssues(rawIssues);

      const durationSeconds = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
      const performanceImpact = PerformanceService.evaluateImpact(enrichedIssues, durationSeconds);
      const scanId = `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const websiteId = mode === 'url' ? WebsiteService.getWebsiteId(url) : 'raw-html';

      const scanResult = {
        id: scanId,
        websiteId,
        url: mode === 'url' ? url : 'Raw HTML Snippet',
        pageTitle: pageData.pageTitle,
        mode,
        isBatch: false,
        timestamp: new Date().toISOString(),
        durationSeconds,
        score: scoreResult.overallScore,
        wcagLevel: scoreResult.wcagLevel,
        statusBadge: scoreResult.statusBadge,
        counts: scoreResult.counts,
        categoryScores: scoreResult.categoryScores,
        manualReviewItems: scoreResult.manualReviewItems,
        performanceImpact,
        issues: enrichedIssues
      };

      StorageService.saveScan(scanResult);

      return res.status(200).json({
        success: true,
        data: scanResult
      });
    } catch (err) {
      console.error('[ScanController] Single scan failed:', err);
      return res.status(500).json({
        error: err.message || 'An unexpected error occurred during accessibility scanning.'
      });
    }
  }

  /**
   * POST /api/scan/batch/discover
   */
  static async discoverPages(req, res) {
    const { url } = req.body;
    const sec = SecurityService.validateUrl(url);
    if (!sec.safe) {
      return res.status(400).json({ error: sec.error });
    }

    try {
      const discovered = await PageDiscoveryService.discoverAndRankPages(sec.url, 15);
      return res.status(200).json({
        success: true,
        baseUrl: sec.url,
        count: discovered.length,
        pages: discovered
      });
    } catch (err) {
      return res.status(500).json({ error: 'Page discovery failed for target URL.' });
    }
  }

  /**
   * POST /api/scan/batch
   */
  static async batchScan(req, res) {
    const startTime = Date.now();
    const { url, selectedUrls, maxPages = 5 } = req.body;

    const sec = SecurityService.validateUrl(url);
    if (!sec.safe) {
      return res.status(400).json({ error: sec.error });
    }

    try {
      let pagesToScan = [];
      if (Array.isArray(selectedUrls) && selectedUrls.length > 0) {
        pagesToScan = selectedUrls.slice(0, 10);
      } else {
        const discovered = await PageDiscoveryService.discoverAndRankPages(sec.url, 15);
        pagesToScan = discovered.filter(p => p.isSelected).map(p => p.url).slice(0, Math.min(maxPages, 10));
      }

      if (pagesToScan.length === 0) {
        pagesToScan = [sec.url];
      }

      const pageResults = [];

      for (const pageUrl of pagesToScan) {
        try {
          const pageData = await BrowserService.fetchUrlContent(pageUrl);
          const rawIssues = CustomRulesService.runAllChecks(pageData.$);
          const scoreResult = ScoringService.calculateScore(rawIssues);
          const enrichedIssues = await AIService.enrichIssues(rawIssues);

          pageResults.push({
            url: pageUrl,
            pageTitle: pageData.pageTitle,
            status: 'completed',
            score: scoreResult.overallScore,
            wcagLevel: scoreResult.wcagLevel,
            statusBadge: scoreResult.statusBadge,
            counts: scoreResult.counts,
            categoryScores: scoreResult.categoryScores,
            issues: enrichedIssues
          });
        } catch (pageErr) {
          console.warn(`[ScanController] Page scan failed for ${pageUrl}:`, pageErr.message);
          pageResults.push({
            url: pageUrl,
            status: 'failed',
            error: pageErr.message
          });
        }
      }

      const aggregated = AggregationService.aggregateSiteResults(sec.url, pageResults);
      const durationSeconds = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
      const performanceImpact = PerformanceService.evaluateImpact(aggregated.issueFrequency || [], durationSeconds);
      const scanId = `batch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const websiteId = WebsiteService.getWebsiteId(sec.url);

      const batchResult = {
        id: scanId,
        websiteId,
        url: sec.url,
        pageTitle: `Batch Audit: ${new URL(sec.url).hostname}`,
        mode: 'batch',
        timestamp: new Date().toISOString(),
        durationSeconds,
        performanceImpact,
        ...aggregated
      };

      StorageService.saveScan(batchResult);

      return res.status(200).json({
        success: true,
        data: batchResult
      });
    } catch (err) {
      console.error('[ScanController] Batch scan failed:', err);
      return res.status(500).json({
        error: err.message || 'An unexpected error occurred during batch scanning.'
      });
    }
  }

  /**
   * GET /api/scan/compare/:id1/:id2
   */
  static async compareScans(req, res) {
    const { id1, id2 } = req.params;
    try {
      const scanA = StorageService.getScan(id1);
      const scanB = StorageService.getScan(id2);

      if (!scanA || !scanB) {
        return res.status(404).json({ error: 'One or both scan records were not found for comparison.' });
      }

      const comparison = await ComparisonService.compareScans(scanA, scanB);
      return res.status(200).json({
        success: true,
        data: comparison
      });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Failed to generate scan comparison.' });
    }
  }

  /**
   * GET /api/scan/websites/:websiteId/trends
   */
  static getWebsiteTrends(req, res) {
    const { websiteId } = req.params;
    try {
      const trends = TrendService.getWebsiteTrends(websiteId);
      return res.status(200).json({
        success: true,
        data: trends
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to retrieve website trend analytics.' });
    }
  }

  /**
   * GET /api/scan/history
   */
  static getHistory(req, res) {
    try {
      const scans = StorageService.getAllScans();
      return res.status(200).json({
        success: true,
        count: scans.length,
        data: scans
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to retrieve scan history.' });
    }
  }

  /**
   * GET /api/scan/:id
   */
  static getScanById(req, res) {
    const { id } = req.params;
    const scan = StorageService.getScan(id);
    if (!scan) {
      return res.status(404).json({ error: 'Scan record not found.' });
    }
    return res.status(200).json({ success: true, data: scan });
  }
}
