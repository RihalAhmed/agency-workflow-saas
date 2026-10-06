import { describe, it, expect } from "vitest";
import { getSafeRedirect } from "./safe-redirect";

describe("getSafeRedirect", () => {
  it("allows valid local paths", () => {
    expect(getSafeRedirect("/audit")).toBe("/audit");
    expect(getSafeRedirect("/app/dashboard")).toBe("/app/dashboard");
  });

  it("rejects full URLs", () => {
    expect(getSafeRedirect("https://evil.com")).toBe("/audit");
    expect(getSafeRedirect("http://evil.com")).toBe("/audit");
  });

  it("rejects protocol-relative URLs", () => {
    expect(getSafeRedirect("//evil.com")).toBe("/audit");
  });

  it("rejects backslash bypasses", () => {
    expect(getSafeRedirect("/\\evil.com")).toBe("/audit");
    expect(getSafeRedirect("\\\\evil.com")).toBe("/audit");
  });

  it("falls back to default if empty", () => {
    expect(getSafeRedirect("")).toBe("/audit");
    expect(getSafeRedirect(null as any)).toBe("/audit");
    expect(getSafeRedirect(undefined)).toBe("/audit");
  });
});
