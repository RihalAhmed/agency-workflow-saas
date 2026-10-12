import { unzip } from 'fflate';
import { MAX_DOCX_UNCOMPRESSED_BYTES, MAX_DOCX_ENTRIES } from './constants';

export function checkDocx(buffer: Uint8Array): Promise<{ ok: boolean, error?: string }> {
  return new Promise((resolve) => {
    let uncompressedBytes = 0;
    let entryCount = 0;
    let hasDocumentXml = false;
    let aborted = false;

    unzip(buffer, {
      filter: (file) => {
        if (aborted) return false;
        
        entryCount++;
        uncompressedBytes += file.originalSize;
        
        if (entryCount > MAX_DOCX_ENTRIES || uncompressedBytes > MAX_DOCX_UNCOMPRESSED_BYTES) {
          aborted = true;
          return false;
        }
        
        if (file.name === 'word/document.xml') {
          hasDocumentXml = true;
        }
        
        return false; // Skip actual extraction
      }
    }, (err) => {
      if (aborted) {
        if (entryCount > MAX_DOCX_ENTRIES) {
          resolve({ ok: false, error: 'docx_invalid' });
        } else {
          resolve({ ok: false, error: 'docx_too_large' });
        }
        return;
      }

      if (err) {
        resolve({ ok: false, error: 'docx_invalid' });
        return;
      }

      if (!hasDocumentXml) {
        resolve({ ok: false, error: 'docx_invalid' });
        return;
      }

      resolve({ ok: true });
    });
  });
}
