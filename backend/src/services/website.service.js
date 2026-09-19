import { isDatabaseConnected } from '../config/db.js';
import { Website } from '../models/Website.js';

const websiteRegistry = new Map();

export class WebsiteService {
  /**
   * Extracts and normalizes a clean website domain ID from any URL string.
   * @param {string} urlString 
   * @returns {string} Normalized domain ID (e.g., "example.com")
   */
  static getWebsiteId(urlString) {
    if (!urlString || typeof urlString !== 'string') return 'general';
    try {
      let trimmed = urlString.trim();
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        trimmed = 'https://' + trimmed;
      }
      const parsed = new URL(trimmed);
      return parsed.hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      return urlString.toLowerCase().replace(/[^a-z0-9.-]/g, '');
    }
  }

  /**
   * Registers or updates a website record with explicit baselineScanId and latestScanId.
   * @param {string} domain 
   * @param {string} scanId 
   * @param {string} timestamp 
   * @param {string} userId 
   */
  static async registerScan(domain, scanId, timestamp, userId = null) {
    const websiteId = this.getWebsiteId(domain);
    
    // In-memory fallback tracking
    if (!websiteRegistry.has(websiteId)) {
      websiteRegistry.set(websiteId, {
        websiteId,
        domain: websiteId,
        baselineScanId: scanId,
        latestScanId: scanId,
        firstScannedAt: timestamp,
        lastScannedAt: timestamp
      });
    } else {
      const record = websiteRegistry.get(websiteId);
      record.latestScanId = scanId;
      record.lastScannedAt = timestamp;
    }

    // MongoDB Persistence
    if (isDatabaseConnected()) {
      try {
        const existing = await Website.findOne({ websiteId });
        if (!existing) {
          await Website.create({
            userId,
            websiteId,
            domain: websiteId,
            baseUrl: domain.startsWith('http') ? domain : `https://${domain}`,
            baselineScanId: scanId,
            latestScanId: scanId,
            firstScannedAt: timestamp,
            lastScannedAt: timestamp
          });
        } else {
          existing.latestScanId = scanId;
          existing.lastScannedAt = timestamp;
          await existing.save();
        }
      } catch (err) {
        console.warn('[WebsiteService] MongoDB website registration warning:', err.message);
      }
    }

    return websiteRegistry.get(websiteId);
  }

  static async getRecord(domain) {
    const websiteId = this.getWebsiteId(domain);
    if (isDatabaseConnected()) {
      try {
        const dbRec = await Website.findOne({ websiteId }).lean();
        if (dbRec) return dbRec;
      } catch (err) {
        console.warn('[WebsiteService] MongoDB getRecord warning:', err.message);
      }
    }
    return websiteRegistry.get(websiteId) || null;
  }
}
