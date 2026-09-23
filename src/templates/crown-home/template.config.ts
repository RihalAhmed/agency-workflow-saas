import schemaJson from "./schema.json";
import { DesignSchema } from "@/lib/schema/design-schema";

/**
 * Validates the co-located schema.json at import time and exports
 * the template metadata derived from it.
 *
 * This replaces the previous hand-written meta object — the schema.json
 * is now the single source of truth.
 */
const validated = DesignSchema.parse(schemaJson);

export const meta = {
  id: validated.id,
  name: validated.name,
  niche: validated.niche,
  styleTags: validated.styleTags,
  sections: validated.sections.map((s) => s.type),
  variants: ["a-photo-hero"] as const,
} as const;

export type TemplateMeta = typeof meta;
