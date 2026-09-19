import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

describe('SHA-256 Content Hashing & Change Detection Tests', () => {
  it('should generate identical SHA-256 hashes for identical HTML string inputs', () => {
    const html1 = '<html><head><title>Test Page</title></head><body><h1>Hello World</h1></body></html>';
    const html2 = '<html><head><title>Test Page</title></head><body><h1>Hello World</h1></body></html>';

    const hash1 = crypto.createHash('sha256').update(html1).digest('hex');
    const hash2 = crypto.createHash('sha256').update(html2).digest('hex');

    expect(hash1).toBe(hash2);
  });

  it('should generate distinct SHA-256 hashes when HTML code is modified', () => {
    const htmlV1 = '<div><img src="cat.jpg"></div>';
    const htmlV2 = '<div><img src="cat.jpg" alt="A cute cat"></div>';

    const hashV1 = crypto.createHash('sha256').update(htmlV1).digest('hex');
    const hashV2 = crypto.createHash('sha256').update(htmlV2).digest('hex');

    expect(hashV1).not.toBe(hashV2);
  });
});
