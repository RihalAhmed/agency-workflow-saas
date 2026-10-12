import { expect, test, describe } from 'vitest';
import { sanitizeFilename, validateInitialFileInfo, checkMagicBytes } from './validate';

describe('SOP Validation', () => {
  describe('sanitizeFilename', () => {
    test('removes path characters', () => {
      expect(sanitizeFilename('../hidden/file.pdf')).toBe('__hiddenfile.pdf');
    });
    test('collapses double extensions', () => {
      expect(sanitizeFilename('script.sh.pdf')).toBe('script_sh.pdf');
    });
    test('truncates to 120 chars keeping extension', () => {
      const longName = 'a'.repeat(150) + '.pdf';
      const sanitized = sanitizeFilename(longName);
      expect(sanitized.length).toBe(120);
      expect(sanitized.endsWith('.pdf')).toBe(true);
    });
  });

  describe('validateInitialFileInfo', () => {
    test('rejects 0 byte', () => {
      expect(validateInitialFileInfo('test.pdf', 0, 'application/pdf').ok).toBe(false);
    });
    test('rejects > 5MB', () => {
      expect(validateInitialFileInfo('test.pdf', 5 * 1024 * 1024 + 1, 'application/pdf').ok).toBe(false);
    });
    test('rejects extension mismatch', () => {
      expect(validateInitialFileInfo('test.pdf', 1000, 'text/plain').ok).toBe(false);
    });
    test('rejects double extension executables by strict map', () => {
      expect(validateInitialFileInfo('test.pdf.exe', 1000, 'application/x-msdownload').ok).toBe(false);
    });
  });

  describe('checkMagicBytes', () => {
    test('accepts valid PDF', () => {
      const buf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]); // %PDF-1.4
      expect(checkMagicBytes(buf, 'application/pdf')).toBe(true);
    });
    test('rejects fake PDF', () => {
      const buf = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
      expect(checkMagicBytes(buf, 'application/pdf')).toBe(false);
    });
    test('accepts valid DOCX', () => {
      const buf = new Uint8Array([0x50, 0x4B, 0x03, 0x04]);
      expect(checkMagicBytes(buf, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(true);
    });
    test('accepts valid DOC', () => {
      const buf = new Uint8Array([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]);
      expect(checkMagicBytes(buf, 'application/msword')).toBe(true);
    });
    test('rejects binary masquerading as TXT', () => {
      const buf = new Uint8Array([0x48, 0x65, 0x6c, 0x00, 0x6f]); // "Hel\0o"
      expect(checkMagicBytes(buf, 'text/plain')).toBe(false);
    });
  });
});
