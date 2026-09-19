import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { CustomRulesService } from '../src/services/customRules.service.js';

describe('WCAG 2.1 AA Deterministic Custom Rules Service', () => {
  it('should detect missing image alt text (WCAG 1.1.1)', () => {
    const html = '<div><img src="logo.jpg"><img src="valid.jpg" alt="Company Logo"></div>';
    const $ = cheerio.load(html);
    const issues = CustomRulesService.runAllChecks($).filter(i => i.ruleId.startsWith('image-alt'));
    expect(issues).toHaveLength(1);
    expect(issues[0].ruleId).toBe('image-alt-missing');
  });

  it('should detect low color contrast ratios (WCAG 1.4.3)', () => {
    const html = '<div style="color: #888888; background-color: #999999;">Low contrast text</div>';
    const $ = cheerio.load(html);
    const issues = CustomRulesService.runAllChecks($).filter(i => i.ruleId.startsWith('color-contrast'));
    expect(issues.length).toBeGreaterThanOrEqual(1);
  });

  it('should detect missing form element labels (WCAG 1.3.1)', () => {
    const html = '<form><input type="text" id="username"><label for="email">Email</label><input type="email" id="email"></form>';
    const $ = cheerio.load(html);
    const issues = CustomRulesService.runAllChecks($).filter(i => i.ruleId.startsWith('form-label'));
    expect(issues).toHaveLength(1);
  });

  it('should detect skipped heading levels and missing H1 (WCAG 1.3.1)', () => {
    const html = '<div><h2>Section Title</h2><h4>Sub-section Title</h4></div>';
    const $ = cheerio.load(html);
    const issues = CustomRulesService.runAllChecks($).filter(i => i.ruleId.startsWith('heading'));
    expect(issues.length).toBeGreaterThanOrEqual(1);
  });

  it('should detect vague link text (WCAG 2.4.4)', () => {
    const html = '<div><a href="/more">Click Here</a><a href="/about">About Us</a></div>';
    const $ = cheerio.load(html);
    const issues = CustomRulesService.runAllChecks($).filter(i => i.ruleId.startsWith('link-text'));
    expect(issues).toHaveLength(1);
  });

  it('should detect uncaptioned video elements (WCAG 1.2.2)', () => {
    const html = '<video src="demo.mp4"></video>';
    const $ = cheerio.load(html);
    const issues = CustomRulesService.runAllChecks($).filter(i => i.ruleId.startsWith('video-captions'));
    expect(issues).toHaveLength(1);
  });

  it('should detect missing html lang attribute (WCAG 3.1.1)', () => {
    const html = '<html><head><title>Test</title></head><body>Header</body></html>';
    const $ = cheerio.load(html);
    const issues = CustomRulesService.runAllChecks($).filter(i => i.ruleId.startsWith('html-lang'));
    expect(issues).toHaveLength(1);
  });

  it('should detect unlabelled button elements (WCAG 4.1.2)', () => {
    const html = '<div><button></button><button aria-label="Submit Form">Submit</button></div>';
    const $ = cheerio.load(html);
    const issues = CustomRulesService.runAllChecks($).filter(i => i.ruleId.startsWith('button-name'));
    expect(issues).toHaveLength(1);
  });
});
