import { PDFDocument } from 'pdf-lib';
import { MAX_PDF_PAGES } from './constants';

export async function checkPdf(buffer: ArrayBuffer | Uint8Array): Promise<{ ok: boolean, error?: string, pageCount?: number }> {
  try {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: false });
    
    if (pdfDoc.isEncrypted) {
      return { ok: false, error: 'pdf_encrypted' };
    }

    const pageCount = pdfDoc.getPageCount();
    if (pageCount > MAX_PDF_PAGES) {
      return { ok: false, error: 'pdf_too_many_pages' };
    }

    return { ok: true, pageCount };
  } catch (e: any) {
    if (e.message?.toLowerCase().includes('encrypt') || e.message?.toLowerCase().includes('password')) {
      return { ok: false, error: 'pdf_encrypted' };
    }
    return { ok: false, error: 'pdf_invalid' };
  }
}
