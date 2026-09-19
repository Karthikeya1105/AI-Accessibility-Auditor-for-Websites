import * as cheerio from 'cheerio';
import axios from 'axios';

export class PageDiscoveryService {
  /**
   * Normalizes a URL by stripping hash fragments, trailing slashes, and tracking query params.
   * @param {string} rawUrl 
   * @param {string} baseUrl 
   * @returns {string|null}
   */
  static normalizeUrl(rawUrl, baseUrl) {
    try {
      const parsed = new URL(rawUrl, baseUrl);

      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null;
      }

      const extMatch = parsed.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|pdf|zip|mp4|webm|mp3|woff|woff2|ttf|eot)$/i);
      if (extMatch) {
        return null;
      }

      parsed.hash = '';

      if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
        parsed.pathname = parsed.pathname.slice(0, -1);
      }

      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'fbclid'].forEach(param => {
        parsed.searchParams.delete(param);
      });

      return parsed.toString();
    } catch {
      return null;
    }
  }

  /**
   * Categorizes a page URL into functional group.
   * @param {string} urlString 
   * @returns {'Core Pages' | 'Business Pages' | 'Content Pages' | 'Utility & Legal'}
   */
  static categorizeUrl(urlString) {
    try {
      const path = new URL(urlString).pathname.toLowerCase();
      if (path === '/' || path === '' || path.includes('/about') || path.includes('/contact') || path.includes('/home')) {
        return 'Core Pages';
      }
      if (path.includes('/services') || path.includes('/products') || path.includes('/pricing') || path.includes('/features')) {
        return 'Business Pages';
      }
      if (path.includes('/blog') || path.includes('/news') || path.includes('/faq') || path.includes('/articles') || path.includes('/docs')) {
        return 'Content Pages';
      }
      if (path.includes('/login') || path.includes('/signup') || path.includes('/privacy') || path.includes('/terms') || path.includes('/legal')) {
        return 'Utility & Legal';
      }
      return 'Core Pages';
    } catch {
      return 'Core Pages';
    }
  }

  /**
   * Calculates a page priority score (0–100) based on URL path semantics.
   * @param {string} urlString 
   * @returns {number}
   */
  static calculatePagePriority(urlString) {
    try {
      const parsed = new URL(urlString);
      const path = parsed.pathname.toLowerCase();

      if (path === '/' || path === '' || path === '/home' || path === '/index.html') return 100;
      if (path.includes('/contact')) return 90;
      if (path.includes('/about')) return 90;
      if (path.includes('/services')) return 85;
      if (path.includes('/products')) return 85;
      if (path.includes('/pricing')) return 80;
      if (path.includes('/features')) return 80;
      if (path.includes('/login') || path.includes('/signup') || path.includes('/register')) return 75;
      if (path.includes('/blog') || path.includes('/news') || path.includes('/articles')) return 70;
      if (path.includes('/privacy') || path.includes('/terms') || path.includes('/legal')) return 40;

      return 60;
    } catch {
      return 50;
    }
  }

  /**
   * Discovers, categorizes, and ranks internal pages by business priority.
   * @param {string} targetUrl 
   * @param {number} maxLimit 
   * @returns {Promise<Array<{ url: string, title: string, category: string, priority: number, isSelected: boolean }>>}
   */
  static async discoverAndRankPages(targetUrl, maxLimit = 15) {
    try {
      const baseObj = new URL(targetUrl);
      const baseHostname = baseObj.hostname.toLowerCase();
      const normalizedTarget = this.normalizeUrl(targetUrl, targetUrl) || targetUrl;

      const discoveredMap = new Map();
      discoveredMap.set(normalizedTarget, {
        url: normalizedTarget,
        title: 'Homepage',
        category: 'Core Pages',
        priority: 100,
        isSelected: true
      });

      let pageHtml = '';
      try {
        const response = await axios.get(targetUrl, {
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-Accessibility-Auditor/1.0'
          }
        });
        pageHtml = typeof response.data === 'string' ? response.data : '';
      } catch (err) {
        console.warn(`[PageDiscoveryService] Could not fetch ${targetUrl} HTML:`, err.message);
      }

      if (pageHtml) {
        const $ = cheerio.load(pageHtml);

        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          const linkText = $(el).text().trim();
          if (!href) return;

          const norm = this.normalizeUrl(href, targetUrl);
          if (!norm) return;

          try {
            const candObj = new URL(norm);
            if (candObj.hostname.toLowerCase() === baseHostname && !discoveredMap.has(norm)) {
              const priority = this.calculatePagePriority(norm);
              const category = this.categorizeUrl(norm);
              discoveredMap.set(norm, {
                url: norm,
                title: linkText || candObj.pathname || norm,
                category,
                priority,
                isSelected: false
              });
            }
          } catch {
            // Ignore invalid URLs
          }
        });
      }

      const pagesList = Array.from(discoveredMap.values())
        .sort((a, b) => b.priority - a.priority)
        .slice(0, maxLimit);

      pagesList.forEach((item, index) => {
        if (index < 5) item.isSelected = true;
      });

      console.log(`[PageDiscoveryService] Discovered & categorized ${pagesList.length} pages for ${baseHostname}`);
      return pagesList;
    } catch (err) {
      console.warn(`[PageDiscoveryService] Discovery failed for ${targetUrl}:`, err.message);
      return [{ url: targetUrl, title: 'Homepage', category: 'Core Pages', priority: 100, isSelected: true }];
    }
  }
}
