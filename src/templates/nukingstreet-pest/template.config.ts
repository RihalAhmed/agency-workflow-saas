import { BrandTokens } from "@/lib/spec/site-spec";
import schemaJson from "./schema.json";
import { DesignSchema } from "@/lib/schema/design-schema";

const validated = DesignSchema.parse(schemaJson);

export const meta = {
  id: validated.id,
  name: validated.name,
  niche: validated.niche,
  styleTags: validated.styleTags,
  sections: validated.sections.map((s) => s.type),
  variants: ["a-photo-hero"] as const,
} as const;

export const defaultTokens: BrandTokens = {
  brand: "oklch(0.26 0.05 140)", // Dark Green / Neutral dark
  brandFg: "oklch(0.98 0 0)", // White
  accent: "oklch(0.62 0.22 30)", // Orange/Red from logo & 'Nuke Em'
  accentFg: "oklch(0.98 0 0)",
  surface: "oklch(0.98 0 0)", // White
  surfaceAlt: "oklch(0.95 0 0)", // Light gray backgrounds
  ink: "oklch(0.2 0 0)", // Dark text
  inkMuted: "oklch(0.4 0 0)",
  border: "oklch(0.9 0 0)",
};
