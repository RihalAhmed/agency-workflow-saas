import { EXTENSION_MIME_MAP, MAX_FILENAME_LENGTH, MAX_FILE_BYTES } from "./constants";

export function sanitizeFilename(filename: string): string {
  // strip path chars, control chars, keep only basic safe chars
  let name = filename.replace(/[\/\\]/g, "");
  name = name.replace(/[\x00-\x1F\x7F]/g, "");
  
  // collapse double extensions: remove all but the last dot
  const parts = name.split('.');
  if (parts.length > 2) {
    name = parts.slice(0, -1).join('_') + '.' + parts[parts.length - 1];
  }
  
  // limit length
  if (name.length > MAX_FILENAME_LENGTH) {
    const ext = name.includes('.') ? name.substring(name.lastIndexOf('.')) : "";
    const base = name.substring(0, MAX_FILENAME_LENGTH - ext.length);
    name = base + ext;
  }
  return name;
}

export function validateInitialFileInfo(filename: string, size: number, mimeType: string) {
  if (size <= 0) return { ok: false, error: "File is empty." };
  if (size > MAX_FILE_BYTES) return { ok: false, error: "File exceeds 5 MB limit." };

  const extMatch = filename.match(/\.[^.]+$/);
  const ext = extMatch ? extMatch[0].toLowerCase() : "";

  if (!EXTENSION_MIME_MAP[ext]) {
    return { ok: false, error: `Unsupported file extension: ${ext}` };
  }

  if (EXTENSION_MIME_MAP[ext] !== mimeType) {
    return { ok: false, error: "MIME type does not match file extension." };
  }

  return { ok: true, ext };
}

export function checkMagicBytes(buffer: Uint8Array, mimeType: string): boolean {
  if (buffer.length === 0) return false;

  if (mimeType === "application/pdf") {
    // starts with %PDF-
    if (buffer.length < 5) return false;
    const str = String.fromCharCode(...buffer.subarray(0, 5));
    return str === "%PDF-";
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    // DOCX starts with PK\x03\x04
    if (buffer.length < 4) return false;
    return buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
  }

  if (mimeType === "application/msword") {
    // DOC starts with D0 CF 11 E0 A1 B1 1A E1
    if (buffer.length < 8) return false;
    return (
      buffer[0] === 0xD0 &&
      buffer[1] === 0xCF &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xE0 &&
      buffer[4] === 0xA1 &&
      buffer[5] === 0xB1 &&
      buffer[6] === 0x1A &&
      buffer[7] === 0xE1
    );
  }

  if (mimeType === "text/plain") {
    // Check first 8 KB for NUL byte, and ensure it's valid UTF-8
    const checkLength = Math.min(buffer.length, 8192);
    for (let i = 0; i < checkLength; i++) {
      if (buffer[i] === 0) return false; // NUL byte means binary
    }
    try {
      const decoder = new TextDecoder('utf-8', { fatal: true });
      decoder.decode(buffer.subarray(0, checkLength));
      return true;
    } catch {
      return false; // Invalid UTF-8
    }
  }

  return false;
}
