import { expect, test, describe } from 'vitest';
import { sanitizeHtml } from './sanitize';

describe('DOMPurify Sanitizer', () => {
  test('strips script tags and onerror attributes', () => {
    const dirty = `<p>Hello <script>alert(1)</script> <img src="x" onerror="alert(1)"></p>`;
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('onerror');
    expect(clean).toContain('<p>Hello  <img></p>');
  });

  test('forces target="_blank" and rel="noopener noreferrer" on links', () => {
    const dirty = `<a href="https://example.com">Link</a>`;
    const clean = sanitizeHtml(dirty);
    expect(clean).toContain('target="_blank"');
    expect(clean).toContain('rel="noopener noreferrer"');
  });

  test('strips javascript: links', () => {
    const dirty = `<a href="javascript:alert(1)">Link</a>`;
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('javascript:alert(1)');
    // Just to make sure it doesn't crash on node environment, it returns ''
  });
});
