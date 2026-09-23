import { z } from "zod";

export const BrandTokens = z.object({
  brand: z.string(), // primary, from the logo
  brandFg: z.string(), // readable text on `brand`
  accent: z.string(), // derived, for highlights/CTAs
  accentFg: z.string(),
  surface: z.string(), // page background
  surfaceAlt: z.string(), // alternating section background
  ink: z.string(), // body text
  inkMuted: z.string(),
  border: z.string(),
});
export type BrandTokens = z.infer<typeof BrandTokens>;

export const Business = z.object({
  name: z.string().min(1),
  category: z.string().min(1), // "pest-control", "roofing", etc.
  tagline: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  city: z.string().optional(),
  logoPath: z.string(), // local path or /uploads URL
  trustBadges: z.array(z.string()).optional(),
});
export type Business = z.infer<typeof Business>;

export const SectionType = z.enum([
  "header",
  "hero",
  "quoteForm",
  "reviewLogos",
  "about",
  "footer",
  "testimonials",
]);
export type SectionType = z.infer<typeof SectionType>;

export const SiteSection = z.object({
  type: SectionType,
  content: z.record(z.string(), z.unknown()), // copy slots, resolved before render
  images: z.array(z.string()).default([]),
});
export type SiteSection = z.infer<typeof SiteSection>;

export const SiteSpec = z.object({
  /** Tracks the site data format version (distinct from design_schema_version on DesignSchema) */
  site_spec_version: z.string().default("1.0"),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  templateId: z.string(),
  variantId: z.string(),
  business: Business,
  tokens: BrandTokens,
  sections: z.array(SiteSection),
});
export type SiteSpec = z.infer<typeof SiteSpec>;
