import axios from 'axios';
import * as cheerio from 'cheerio';

export class ScanError extends Error {
  constructor(message, status, statusCode = null) {
    super(message);
    this.name = 'ScanError';
    this.status = status;
    this.statusCode = statusCode;
  }
}

export class BrowserService {
  /**
   * Fetches HTML content from a target URL with robust access error classification.
   * @param {string} targetUrl 
   * @returns {Promise<{ html: string, pageTitle: string, $, headers: object }>}
   */
  static async fetchUrlContent(targetUrl) {
    try {
      const response = await axios.get(targetUrl, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-Accessibility-Auditor/1.0 (+https://wcag-auditor.local)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        maxRedirects: 5,
        maxContentLength: 10 * 1024 * 1024 // 10MB
      });

      const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      const $ = cheerio.load(html);
      const pageTitle = $('title').text().trim() || new URL(targetUrl).hostname;

      return {
        html,
        pageTitle,
        $,
        headers: response.headers
      };
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        throw new ScanError(
          'Target website timed out during accessibility scan (exceeded 10s timeout).',
          'TIMEOUT'
        );
      }

      if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
        throw new ScanError(
          'DNS resolution failed for the specified website domain. Please check the URL hostname.',
          'DNS_ERROR'
        );
      }

      if (err.code === 'ECONNREFUSED') {
        throw new ScanError(
          'Target web server actively refused connection on port 80/443.',
          'CONNECTION_REFUSED'
        );
      }

      if (err.response) {
        const httpStatus = err.response.status;
        if (httpStatus === 403 || httpStatus === 401 || httpStatus === 407) {
          throw new ScanError(
            `Access Denied: The target website returned HTTP ${httpStatus} and blocked automated accessibility inspection.`,
            'ACCESS_DENIED',
            httpStatus
          );
        }
        if (httpStatus === 404) {
          throw new ScanError(
            'Page Not Found: The specified target page returned HTTP 404.',
            'NOT_FOUND',
            404
          );
        }
        throw new ScanError(
          `Target website returned HTTP status ${httpStatus}.`,
          'SCAN_FAILED',
          httpStatus
        );
      }

      throw new ScanError(
        `Failed to access target website: ${err.message}`,
        'SCAN_FAILED'
      );
    }
  }

  /**
   * Parses raw HTML string.
   * @param {string} rawHtml 
   * @returns {{ html: string, pageTitle: string, $ }}
   */
  static parseRawHtml(rawHtml) {
    const $ = cheerio.load(rawHtml);
    const pageTitle = $('title').text().trim() || 'Uploaded HTML Document';
    return {
      html: rawHtml,
      pageTitle,
      $
    };
  }
}
