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
   */
  static registerScan(domain, scanId, timestamp) {
    const websiteId = this.getWebsiteId(domain);
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
    return websiteRegistry.get(websiteId);
  }

  static getRecord(domain) {
    const websiteId = this.getWebsiteId(domain);
    return websiteRegistry.get(websiteId) || null;
  }
}

