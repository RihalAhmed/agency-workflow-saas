import { TITLE_MAX } from './constants';

export function normalizeTitle(title: string): string {
  let normalized = title.trim().replace(/\s+/g, ' ');
  normalized = normalized.replace(/[\x00-\x1F\x7F]/g, '');
  if (normalized.length > TITLE_MAX) {
    normalized = normalized.substring(0, TITLE_MAX).trim();
  }
  return normalized || 'Untitled SOP';
}

export function titleFromFilename(filename: string): string {
  let baseName = filename.replace(/\.[A-Za-z0-9]{1,5}$/, '');
  baseName = baseName.replace(/_/g, ' ');
  return normalizeTitle(baseName);
}
