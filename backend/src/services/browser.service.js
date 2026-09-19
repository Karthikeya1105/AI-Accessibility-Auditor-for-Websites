import axios from 'axios';
import * as cheerio from 'cheerio';

export class BrowserService {
  /**
   * Fetches HTML content from a target URL.
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
        throw new Error('Target website timed out during scan (exceeded 10s timeout).');
      }
      if (err.response) {
        throw new Error(`Target website returned HTTP status ${err.response.status}.`);
      }
      throw new Error(`Failed to fetch URL: ${err.message}`);
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
