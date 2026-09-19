import * as cheerio from 'cheerio';

export class CustomRulesService {
  /**
   * Evaluates custom static HTML accessibility checks using Cheerio DOM.
   * Attaches stable ruleIds and deterministic issue fingerprints.
   * @param {import('cheerio').CheerioAPI} $ 
   * @returns {Array<object>} List of raw detected accessibility findings with fingerprints
   */
  static runAllChecks($) {
    const issues = [];

    // Helper to generate deterministic fingerprint
    const createFingerprint = (ruleId, selector) => `${ruleId}|${selector || 'element'}`;

    // 1. Missing or suspicious ALT text on images
    $('img').each((idx, el) => {
      const alt = $(el).attr('alt');
      const src = $(el).attr('src') || 'image';
      const outerHtml = $.html(el);
      const selector = `img[src="${src}"]`;

      if (alt === undefined) {
        const ruleId = 'image-alt-missing';
        issues.push({
          ruleId,
          fingerprint: createFingerprint(ruleId, selector),
          category: 'Images & Media',
          severity: 'Critical',
          impact: 'Screen reader users cannot understand the purpose or content of visual images without alternative text.',
          wcag: 'WCAG 1.1.1 Non-text Content (Level A)',
          element: 'img',
          selector,
          snippet: outerHtml,
          context: `Image with source "${src}" is missing an alt attribute.`,
          fixTemplate: `<img src="${src}" alt="Descriptive text of the image content">`
        });
      } else if (alt.trim().length > 0 && /^(image|img|picture|photo|icon|graphic|logo\.png|file)$/i.test(alt.trim())) {
        const ruleId = 'image-alt-redundant';
        issues.push({
          ruleId,
          fingerprint: createFingerprint(ruleId, selector),
          category: 'Images & Media',
          severity: 'Minor',
          impact: 'Redundant alt text like "image" or "picture" provides unhelpful information to screen reader users.',
          wcag: 'WCAG 1.1.1 Non-text Content (Level A)',
          element: 'img',
          selector,
          snippet: outerHtml,
          context: `Image has unhelpful generic alt text "${alt}".`,
          fixTemplate: `<img src="${src}" alt="Detailed description of what is depicted in the image">`
        });
      }
    });

    // 2. Heading hierarchy sequence check
    const headings = [];
    $('h1, h2, h3, h4, h5, h6').each((idx, el) => {
      const tag = el.tagName.toLowerCase();
      const level = parseInt(tag.replace('h', ''), 10);
      const text = $(el).text().trim();
      const outerHtml = $.html(el);
      headings.push({ level, tag, text, outerHtml, el });
    });

    if ($('h1').length === 0) {
      const ruleId = 'heading-h1-missing';
      const selector = 'body';
      issues.push({
        ruleId,
        fingerprint: createFingerprint(ruleId, selector),
        category: 'Headings & Structure',
        severity: 'Major',
        impact: 'A page without a main H1 heading makes it difficult for assistive technology users to identify the primary page topic.',
        wcag: 'WCAG 1.3.1 Info and Relationships (Level A)',
        element: 'body',
        selector,
        snippet: '<body> ... </body>',
        context: 'Page is missing a primary <h1> heading tag.',
        fixTemplate: '<h1>Main Page Title</h1>'
      });
    }

    for (let i = 0; i < headings.length - 1; i++) {
      const curr = headings[i];
      const next = headings[i + 1];
      if (next.level > curr.level + 1) {
        const ruleId = 'heading-order-skipped';
        const selector = `${next.tag}:contains("${next.text.substring(0, 15)}")`;
        issues.push({
          ruleId,
          fingerprint: createFingerprint(ruleId, selector),
          category: 'Headings & Structure',
          severity: 'Major',
          impact: 'Skipping heading levels (e.g., H1 directly to H3) disrupts screen reader heading navigation structure.',
          wcag: 'WCAG 1.3.1 Info and Relationships (Level A)',
          element: next.tag,
          selector,
          snippet: next.outerHtml,
          context: `Heading level skipped from <${curr.tag}> to <${next.tag}> ("${next.text}").`,
          fixTemplate: `<h${curr.level + 1}>${next.text}</h${curr.level + 1}>`
        });
      }
    }

    // 3. Unlabelled form fields (<input>, <textarea>, <select>)
    $('input, textarea, select').each((idx, el) => {
      const type = $(el).attr('type') || 'text';
      if (['hidden', 'submit', 'button', 'image', 'reset'].includes(type)) return;

      const id = $(el).attr('id');
      const ariaLabel = $(el).attr('aria-label');
      const ariaLabelledby = $(el).attr('aria-labelledby');
      const title = $(el).attr('title');
      const outerHtml = $.html(el);
      const fieldName = $(el).attr('name') || id || type;
      const selector = `${el.tagName.toLowerCase()}[name="${fieldName}"]`;

      let hasAssociatedLabel = false;
      if (id && $(`label[for="${id}"]`).length > 0) hasAssociatedLabel = true;
      if ($(el).closest('label').length > 0) hasAssociatedLabel = true;

      if (!hasAssociatedLabel && !ariaLabel && !ariaLabelledby && !title) {
        const ruleId = 'form-label-missing';
        issues.push({
          ruleId,
          fingerprint: createFingerprint(ruleId, selector),
          category: 'Forms & Controls',
          severity: 'Critical',
          impact: 'Form controls without labels cannot be announced correctly by screen readers, making forms impossible to complete.',
          wcag: 'WCAG 1.3.1 / 4.1.2 Name, Role, Value (Level A)',
          element: el.tagName.toLowerCase(),
          selector,
          snippet: outerHtml,
          context: `Form element <${el.tagName.toLowerCase()} name="${fieldName}"> lacks a associated <label> or aria-label.`,
          fixTemplate: `<label for="${id || 'input-id'}">Field Label</label>\n<input id="${id || 'input-id'}" type="${type}" name="${fieldName}">`
        });
      }
    });

    // 4. Non-descriptive generic link text ("click here", "read more")
    $('a').each((idx, el) => {
      const text = $(el).text().trim().toLowerCase();
      const href = $(el).attr('href') || '#';
      const ariaLabel = $(el).attr('aria-label');
      const outerHtml = $.html(el);
      const selector = `a[href="${href}"]`;

      const genericWords = ['click here', 'read more', 'more info', 'link', 'here', 'learn more', 'details'];
      if (!ariaLabel && genericWords.includes(text)) {
        const ruleId = 'link-text-generic';
        issues.push({
          ruleId,
          fingerprint: createFingerprint(ruleId, selector),
          category: 'Links & Navigation',
          severity: 'Major',
          impact: 'Screen reader users navigating by links alone hear "click here" out of context and cannot determine link destinations.',
          wcag: 'WCAG 2.4.4 Link Purpose (In Context) (Level A)',
          element: 'a',
          selector,
          snippet: outerHtml,
          context: `Link contains non-descriptive text "${$(el).text().trim()}".`,
          fixTemplate: `<a href="${href}">Read our annual accessibility audit report</a>`
        });
      }
    });

    // 5. Low Color Contrast inline style detection
    $('[style*="color"]').each((idx, el) => {
      const style = $(el).attr('style') || '';
      const outerHtml = $.html(el);
      const text = $(el).text().trim();
      const selector = `${el.tagName.toLowerCase()}:contains("${text.substring(0, 15)}")`;

      if (/(color:\s*#(aaa|bbb|ccc|ddd|eee|999|888))/i.test(style) || /(color:\s*rgb\(\s*200|color:\s*lightgrey)/i.test(style)) {
        const ruleId = 'color-contrast-low';
        issues.push({
          ruleId,
          fingerprint: createFingerprint(ruleId, selector),
          category: 'Color & Contrast',
          severity: 'Critical',
          impact: 'Low contrast text is difficult or impossible to read for users with low vision, color blindness, or age-related vision loss.',
          wcag: 'WCAG 1.4.3 Contrast (Minimum) (Level AA - 4.5:1 required)',
          element: el.tagName.toLowerCase(),
          selector,
          snippet: outerHtml,
          context: `Element uses low contrast inline style: "${style}".`,
          fixTemplate: `<p style="color: #111827; background-color: #ffffff;">${text || 'High contrast readable content'}</p>`
        });
      }
    });

    // 6. Missing captions on <video> tags
    $('video').each((idx, el) => {
      const hasTrack = $(el).find('track[kind="subtitles"], track[kind="captions"]').length > 0;
      const outerHtml = $.html(el);
      const selector = 'video';

      if (!hasTrack) {
        const ruleId = 'video-captions-missing';
        issues.push({
          ruleId,
          fingerprint: createFingerprint(ruleId, selector),
          category: 'Images & Media',
          severity: 'Major',
          impact: 'Deaf or hard-of-hearing users cannot understand audio content in video without synchronized closed captions.',
          wcag: 'WCAG 1.2.2 Captions (Prerecorded) (Level A)',
          element: 'video',
          selector,
          snippet: outerHtml,
          context: 'Video element lacks a <track kind="captions"> child element.',
          fixTemplate: `<video controls>\n  <source src="video.mp4" type="video/mp4">\n  <track kind="captions" src="captions.vtt" srclang="en" label="English Captions">\n</video>`
        });
      }
    });

    // 7. Missing lang attribute on <html>
    const htmlLang = $('html').attr('lang');
    if (!htmlLang) {
      const ruleId = 'html-lang-missing';
      const selector = 'html';
      issues.push({
        ruleId,
        fingerprint: createFingerprint(ruleId, selector),
        category: 'ARIA & Semantics',
        severity: 'Major',
        impact: 'Without a lang attribute, screen readers default to the user OS language, pronouncing foreign words with incorrect speech synthesis.',
        wcag: 'WCAG 3.1.1 Language of Page (Level A)',
        element: 'html',
        selector,
        snippet: '<html>',
        context: 'Root <html> element is missing a valid lang attribute (e.g. lang="en").',
        fixTemplate: '<html lang="en">'
      });
    }

    // 8. Buttons missing accessible names
    $('button').each((idx, el) => {
      const text = $(el).text().trim();
      const ariaLabel = $(el).attr('aria-label');
      const ariaLabelledby = $(el).attr('aria-labelledby');
      const title = $(el).attr('title');
      const outerHtml = $.html(el);
      const selector = 'button';

      if (!text && !ariaLabel && !ariaLabelledby && !title) {
        const ruleId = 'button-name-missing';
        issues.push({
          ruleId,
          fingerprint: createFingerprint(ruleId, selector),
          category: 'ARIA & Semantics',
          severity: 'Critical',
          impact: 'Icon buttons or empty buttons without accessible names are announced as "unlabelled button" by screen readers.',
          wcag: 'WCAG 4.1.2 Name, Role, Value (Level A)',
          element: 'button',
          selector,
          snippet: outerHtml,
          context: 'Interactive <button> has no inner text or aria-label attribute.',
          fixTemplate: `<button type="button" aria-label="Close dialog">\n  <svg>...</svg>\n</button>`
        });
      }
    });

    return issues;
  }
}
