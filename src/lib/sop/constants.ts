export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_SOPS = 5;
export const MAX_TOTAL_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_UPLOADS_PER_HOUR = 10;
export const MAX_FILENAME_LENGTH = 120;
export const TITLE_MAX = 120;

export const MAX_PDF_PAGES = 50;
export const MAX_DOCX_UNCOMPRESSED_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_DOCX_ENTRIES = 2000;

export const ALLOWED_MIME_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
} as const;

export type AllowedExtension = keyof typeof ALLOWED_MIME_TYPES;

export const EXTENSION_MIME_MAP: Record<string, string> = {
  ".pdf": ALLOWED_MIME_TYPES.pdf,
  ".docx": ALLOWED_MIME_TYPES.docx,
  ".txt": ALLOWED_MIME_TYPES.txt,
};
