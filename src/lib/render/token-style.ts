import type { BrandTokens } from "../spec/site-spec";
import type { CSSProperties } from "react";

export function tokenStyle(tokens: BrandTokens): CSSProperties {
  return {
    "--brand": tokens.brand,
    "--color-brand": tokens.brand,
    "--brand-fg": tokens.brandFg,
    "--color-brand-fg": tokens.brandFg,
    "--accent": tokens.accent,
    "--color-accent": tokens.accent,
    "--accent-fg": tokens.accentFg,
    "--color-accent-fg": tokens.accentFg,
    "--surface": tokens.surface,
    "--color-surface": tokens.surface,
    "--surface-alt": tokens.surfaceAlt,
    "--color-surface-alt": tokens.surfaceAlt,
    "--ink": tokens.ink,
    "--color-ink": tokens.ink,
    "--ink-muted": tokens.inkMuted,
    "--color-ink-muted": tokens.inkMuted,
    "--border": tokens.border,
    "--color-border": tokens.border,
  } as unknown as CSSProperties;
}
