import crypto from 'crypto';
import { SecurityService } from '../services/security.service.js';
import { BrowserService, ScanError } from '../services/browser.service.js';
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
    const userId = req.user?.id || null;

    try {
      let pageData;

      if (mode === 'url' || (url && !html)) {
        const sec = SecurityService.validateUrl(url);
        if (!sec.safe) {
          return res.status(400).json({
            success: false,
            status: 'INVALID_URL',
            error: sec.error,
            message: sec.error
          });
        }
        pageData = await BrowserService.fetchUrlContent(sec.url);
      } else {
        const sec = SecurityService.validateHtml(html);
        if (!sec.safe) {
          return res.status(400).json({
            success: false,
            status: 'INVALID_HTML',
            error: sec.error,
            message: sec.error
          });
        }
        pageData = BrowserService.parseRawHtml(sec.html);
      }

      // SHA-256 Hash Computation & Duplicate HTML Detection
      const contentHash = crypto.createHash('sha256').update(pageData.html || '').digest('hex');
      const websiteId = mode === 'url' ? WebsiteService.getWebsiteId(url) : 'raw-html';

      const existingScan = await StorageService.findScanByHash(websiteId, contentHash, userId);
      if (existingScan) {
        return res.status(200).json({
          success: true,
          unchanged: true,
          message: 'No HTML changes detected since previous scan (SHA-256 hash matched).',
          data: existingScan
        });
      }

      const rawIssues = CustomRulesService.runAllChecks(pageData.$);
      const scoreResult = ScoringService.calculateScore(rawIssues);
      const enrichedIssues = await AIService.enrichIssues(rawIssues);

      const durationSeconds = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
      const performanceImpact = PerformanceService.evaluateImpact(enrichedIssues, durationSeconds);
      const scanId = `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const scanResult = {
        id: scanId,
        websiteId,
        userId,
        contentHash,
        inputType: mode === 'url' ? 'url' : 'html',
        source: {
          type: mode === 'url' ? 'url' : 'html',
          url: mode === 'url' ? url : undefined,
          fileSize: html ? html.length : (pageData.html ? pageData.html.length : undefined),
          htmlSnippet: pageData.html ? pageData.html.substring(0, 500) : undefined,
          contentHash
        },
        url: mode === 'url' ? url : 'Raw HTML Snippet',
        pageTitle: pageData.pageTitle,
        mode,
        isBatch: false,
        status: 'completed',
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

      await StorageService.saveScan(scanResult);

      return res.status(200).json({
        success: true,
        data: scanResult
      });
    } catch (err) {
      if (err instanceof ScanError) {
        // Record failed scan attempt if URL was provided
        if (url) {
          const scanId = `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const websiteId = WebsiteService.getWebsiteId(url);
          const failedRecord = {
            id: scanId,
            websiteId,
            userId,
            inputType: 'url',
            url,
            status: err.status,
            score: 0,
            timestamp: new Date().toISOString(),
            error: err.message
          };
          StorageService.saveScan(failedRecord);
        }

        return res.status(400).json({
          success: false,
          status: err.status,
          message: err.message,
          targetUrl: url
        });
      }

      console.error('[ScanController] Single scan failed:', err);
      return res.status(500).json({
        success: false,
        status: 'SCAN_FAILED',
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
      return res.status(400).json({ success: false, status: 'INVALID_URL', error: sec.error });
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
      return res.status(500).json({ success: false, error: 'Page discovery failed for target URL.' });
    }
  }

  /**
   * POST /api/scan/batch
   */
  static async batchScan(req, res) {
    const startTime = Date.now();
    const { url, selectedUrls, maxPages = 5 } = req.body;
    const userId = req.user?.id || null;

    const sec = SecurityService.validateUrl(url);
    if (!sec.safe) {
      return res.status(400).json({ success: false, status: 'INVALID_URL', error: sec.error });
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
        userId,
        inputType: 'batch',
        url: sec.url,
        pageTitle: `Batch Audit: ${new URL(sec.url).hostname}`,
        mode: 'batch',
        status: 'completed',
        timestamp: new Date().toISOString(),
        durationSeconds,
        performanceImpact,
        ...aggregated
      };

      await StorageService.saveScan(batchResult);

      return res.status(200).json({
        success: true,
        data: batchResult
      });
    } catch (err) {
      console.error('[ScanController] Batch scan failed:', err);
      return res.status(500).json({
        success: false,
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
      const scanA = await StorageService.getScan(id1);
      const scanB = await StorageService.getScan(id2);

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
  static async getWebsiteTrends(req, res) {
    const { websiteId } = req.params;
    const userId = req.user?.id || null;
    try {
      const trends = await TrendService.getWebsiteTrends(websiteId, userId);
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
  static async getHistory(req, res) {
    const userId = req.user?.id || null;
    try {
      const filter = userId ? { userId } : {};
      const scans = await StorageService.getAllScans(filter);
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
  static async getScanById(req, res) {
    const { id } = req.params;
    const scan = await StorageService.getScan(id);
    if (!scan) {
      return res.status(404).json({ error: 'Scan record not found.' });
    }
    return res.status(200).json({ success: true, data: scan });
  }
}
