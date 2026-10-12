import { expect, test, describe } from 'vitest';
import { normalizeTitle, titleFromFilename } from './title';

describe('SOP Title Logic', () => {
  describe('normalizeTitle', () => {
    test('trims and collapses spaces', () => {
      expect(normalizeTitle('   Hello    World   ')).toBe('Hello World');
    });
    test('removes control characters', () => {
      expect(normalizeTitle('Title\nWith\tControl')).toBe('TitleWithControl');
    });
    test('truncates to max length', () => {
      const longTitle = 'a'.repeat(150);
      expect(normalizeTitle(longTitle).length).toBe(120);
    });
    test('fallbacks to Untitled SOP', () => {
      expect(normalizeTitle('   \n  ')).toBe('Untitled SOP');
    });
  });

  describe('titleFromFilename', () => {
    test('strips extension and replaces underscores', () => {
      expect(titleFromFilename('my_cool_process.pdf')).toBe('my cool process');
    });
  });
});
