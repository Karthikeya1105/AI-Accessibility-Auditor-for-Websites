import validator from 'validator';

/**
 * Service to sanitize and validate input URLs to prevent SSRF (Server-Side Request Forgery)
 * and malicious protocol execution.
 */
export class SecurityService {
  /**
   * Validates if a URL is safe to fetch.
   * @param {string} urlString 
   * @returns {{ safe: boolean, error?: string, url?: string }}
   */
  static validateUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') {
      return { safe: false, error: 'URL must be a non-empty string.' };
    }

    let trimmedUrl = urlString.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      trimmedUrl = 'https://' + trimmedUrl;
    }

    if (!validator.isURL(trimmedUrl, { require_protocol: true })) {
      return { safe: false, error: 'Invalid URL format provided.' };
    }

    try {
      const parsed = new URL(trimmedUrl);
      const hostname = parsed.hostname.toLowerCase();

      // Block local loopback and private IP ranges
      const blockedHosts = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1',
        '[::1]'
      ];

      if (blockedHosts.includes(hostname)) {
        return { safe: false, error: 'Scanning localhost or loopback addresses is restricted for security.' };
      }

      // Check for private IPv4 patterns (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
      const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
      const match = hostname.match(ipPattern);
      if (match) {
        const [, p1, p2] = match.map(Number);
        if (
          p1 === 10 ||
          p1 === 127 ||
          p1 === 0 ||
          (p1 === 172 && p2 >= 16 && p2 <= 31) ||
          (p1 === 192 && p2 === 168) ||
          (p1 === 169 && p2 === 254)
        ) {
          return { safe: false, error: 'Scanning private IP addresses is restricted for security.' };
        }
      }

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { safe: false, error: 'Only HTTP and HTTPS protocols are supported.' };
      }

      return { safe: true, url: trimmedUrl };
    } catch (err) {
      return { safe: false, error: 'Failed to parse URL.' };
    }
  }

  /**
   * Sanitizes raw HTML input to avoid buffer overloads.
   * @param {string} html 
   * @returns {{ safe: boolean, error?: string, html?: string }}
   */
  static validateHtml(html) {
    if (!html || typeof html !== 'string' || html.trim().length === 0) {
      return { safe: false, error: 'HTML payload must be a non-empty string.' };
    }

    const trimmed = html.trim();
    if (trimmed.length > 5 * 1024 * 1024) { // 5MB limit
      return { safe: false, error: 'HTML payload exceeds maximum limit of 5MB.' };
    }

    return { safe: true, html: trimmed };
  }
}
