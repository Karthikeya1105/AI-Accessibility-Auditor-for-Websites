import { describe, it, expect } from 'vitest';
import { SecurityService } from '../src/services/security.service.js';

describe('SecurityService SSRF Protection & URL Validation Tests', () => {
  it('should block local private IP addresses to prevent SSRF attacks', () => {
    expect(SecurityService.validateUrl('http://127.0.0.1').safe).toBe(false);
    expect(SecurityService.validateUrl('http://localhost:8080').safe).toBe(false);
    expect(SecurityService.validateUrl('http://192.168.1.1').safe).toBe(false);
    expect(SecurityService.validateUrl('http://10.0.0.1').safe).toBe(false);
    expect(SecurityService.validateUrl('http://169.254.169.254').safe).toBe(false);
  });

  it('should accept valid public HTTP/HTTPS URLs', () => {
    const res = SecurityService.validateUrl('https://example.com');
    expect(res.safe).toBe(true);
    expect(res.url).toBe('https://example.com');
  });

  it('should validate and sanitize raw HTML string input', () => {
    const validHtml = '<div><p>Hello World</p></div>';
    const res = SecurityService.validateHtml(validHtml);
    expect(res.safe).toBe(true);
    expect(res.html).toBe(validHtml);
  });

  it('should reject empty or invalid HTML strings', () => {
    expect(SecurityService.validateHtml('').safe).toBe(false);
    expect(SecurityService.validateHtml('   ').safe).toBe(false);
  });
});
