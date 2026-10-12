// Stub for future malware scanner hook
export async function scanFile(buffer: Uint8Array): Promise<boolean> {
  // In v1, we just return true. Later we can pass the buffer to an AV scanner.
  return true;
}
