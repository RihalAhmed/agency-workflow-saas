import { expect, test, describe, vi } from 'vitest';
import { checkPdf } from './pdf-guard';
import { checkDocx } from './docx-guard';

describe('SOP Document Guards', () => {
  describe('checkPdf', () => {
    test('handles invalid PDF gracefully', async () => {
      const badBuffer = new Uint8Array([1, 2, 3]);
      const res = await checkPdf(badBuffer);
      expect(res.ok).toBe(false);
      expect(res.error).toBe('pdf_invalid');
    });
  });

  describe('checkDocx', () => {
    test('rejects non-zip data immediately', async () => {
      const badBuffer = new Uint8Array([1, 2, 3]);
      const res = await checkDocx(badBuffer);
      expect(res.ok).toBe(false);
      expect(res.error).toBe('docx_invalid');
    });
  });
});
