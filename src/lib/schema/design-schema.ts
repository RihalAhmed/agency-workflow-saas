import { z } from "zod";

/**
 * DesignSchema — the formal contract every design must implement.
 *
 * This is the single source of truth for what a design exposes:
 * editable fields, section definitions with content count constraints,
 * and image slot definitions.
 *
 * Every design folder contains a `schema.json` validated against this shape.
 * The engine reads only this contract — it never hardcodes a specific design.
 */

export const EditableFieldType = z.enum(["text", "image", "color"]);
export type EditableFieldType = z.infer<typeof EditableFieldType>;

export const EditableField = z.object({
  /** Unique field ID, scoped to the design. E.g. "hero.headlineHighlight" */
  id: z.string().min(1),
  /** Which section this field belongs to (must match a sections[].id) */
  section: z.string().min(1),
  /** Field data type — determines the edit affordance in the pencil editor */
  type: EditableFieldType,
  /** Human-readable label for the editor UI */
  label: z.string().min(1),
  /** Optional default value */
  defaultValue: z.string().optional(),
});
export type EditableField = z.infer<typeof EditableField>;

export const SectionDefinition = z.object({
  /** Unique section ID. E.g. "header", "hero", "quoteForm" */
  id: z.string().min(1),
  /** Component type key — maps to the exported component in the design's sections/ folder */
  type: z.string().min(1),
  /** Whether this section is required in the rendered output */
  required: z.boolean().default(true),
  /**
   * Minimum count for repeatable content within this section.
   * E.g. about paragraphs min: 2, services list min: 3.
   * Defaults to 1.
   */
  min_count: z.number().int().min(0).default(1),
  /**
   * Maximum count for repeatable content within this section.
   * E.g. about paragraphs max: 5, services list max: 8.
   * Defaults to 1 (non-repeatable).
   */
  max_count: z.number().int().min(1).default(1),
});
export type SectionDefinition = z.infer<typeof SectionDefinition>;

export const ImageSlotRole = z.enum([
  "hero-bg",
  "about",
  "logo",
  "team",
  "gallery",
  "owner-overlay",
  "brand-mascot",
  "testimonial-avatar",
]);
export type ImageSlotRole = z.infer<typeof ImageSlotRole>;

export const ImageSlotAspect = z.enum(["landscape", "square", "portrait"]);
export type ImageSlotAspect = z.infer<typeof ImageSlotAspect>;

export const ImageSlot = z.object({
  /** Unique slot ID. E.g. "hero-background", "about-photo" */
  id: z.string().min(1),
  /** Which section this slot belongs to (must match a sections[].id) */
  section: z.string().min(1),
  /** Semantic role — used by the image auto-placement classifier */
  role: ImageSlotRole,
  /** Expected aspect ratio hint for best fit */
  aspect_hint: ImageSlotAspect,
  /** Whether a face is expected in this slot (used by face-api.js classifier) */
  face_expected: z.boolean().default(false),
});
export type ImageSlot = z.infer<typeof ImageSlot>;

export const DesignSchema = z.object({
  /** Version of the design schema contract itself */
  design_schema_version: z.string().default("1.1"),
  /** Unique design ID. E.g. "crown-home" */
  id: z.string().regex(/^[a-z0-9-]+$/),
  /** Human-readable design name */
  name: z.string().min(1),
  /** Niches this design is suited for */
  niche: z.array(z.string()).min(1),
  /** Visual style tags for filtering/search */
  styleTags: z.array(z.string()).default([]),
  /** All fields editable via the pencil editor */
  editable_fields: z.array(EditableField),
  /** Section definitions with content count constraints */
  sections: z.array(SectionDefinition).min(1),
  /** Image slot definitions for auto-placement */
  image_slots: z.array(ImageSlot),
});
export type DesignSchema = z.infer<typeof DesignSchema>;
