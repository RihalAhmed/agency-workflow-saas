# Design Onboarding SOP (Standard Operating Procedure)

This guide documents the strict process for onboarding a new visual design into the Niche Landing Page Generator.

Our architecture ensures the core engine **never** hardcodes logic for a specific design. Adding a new design is a pure data and component definition task. 

---

## 1. Directory Structure Conventions

All designs live in `src/templates/` under their unique `designId` (e.g., `crown-home`).

When creating a new design (e.g., `roofing-pro`), you must construct the following structure:

```
src/templates/roofing-pro/
├── schema.json               // Formal contract of what this design supports
├── template.config.ts        // Exports metadata derived from schema.json
└── sections/                 // Contains React components for each section
    ├── Hero.tsx
    ├── QuoteForm.tsx
    ├── About.tsx
    └── ...
```

## 2. Schema Validation Rules (`schema.json`)

Every design must define a strict contract in `schema.json`. This schema is validated against the Zod `DesignSchema` definition during builds and generator execution.

**Key Requirements:**
1. **`id`**: Must match the folder name exactly.
2. **`design_schema_version`**: Must be `"1.1"` or the current active version.
3. **`sections`**: Define every section type your design supports.
    - Each section type (e.g., `"hero"`) must have a corresponding React component file in the `sections/` directory (e.g., `Hero.tsx`).
4. **`editable_fields` & `image_slots`**: 
    - You must declare every field that the AI generates or that the user can edit.
    - The `section` property of every field/slot must point to a valid section defined in the `sections` array.
5. **Content Bounds**:
    - For sections that take lists of items (like `services` or `aboutParagraphs`), you must define `min_count` and `max_count`. The copy-generator AI will read these bounds to constrain its output.

Before committing, run `pnpm validate` to ensure your `schema.json` adheres to the contract and that all required component files exist.

## 3. Component Contract

The `src/lib/render/resolve.ts` file maps the raw API payload into a flat properties object. Your section components in `sections/*.tsx` will receive these resolved properties.

- Use the shared components in `src/primitives/` (Button, Card, Badge, ReviewStars, TrustBadge) whenever possible to maintain uniform UI consistency.
- You must spread incoming props accurately. Do not expect complex nested objects unless specifically resolved in `resolve.ts`.
- **Trust Badges:** Badge sections in any new design must render through `<PrimitiveTrustBadge id={badgeId} />`. Never use a hardcoded badge list. The array of badge IDs is resolved automatically into `ReviewLogosProps` if the design declares a `reviewLogos` section. The `PrimitiveTrustBadge` component is strictly just the raw logo image. Do not add borders, backgrounds, or "Verified" text around it in the parent design unless explicitly asked.
  - **Asset Normalization:** Any new SVG badge added to the catalog MUST first be normalized by running `npx tsx scripts/normalize-badge-svg.ts`. This calculates the visual bounding box and rewrites the SVG's `viewBox` with a uniform 8% padding to ensure balanced visual sizing.
  - **Crucial Layout Rule:** Badges must render correctly inside the `<PrimitiveTrustBadge>` component's default styles (a strict `w-40 h-14 sm:w-48 sm:h-16` container with `w-full h-full object-contain` on the image). Because normalization equalizes artwork ratios, these CSS classes guarantee uniform rendering and accommodate wide logos without cutting. Never use per-badge CSS overrides.
- **Dark Background Badges:** Badge visibility on unusual or dark backgrounds must be solved by sourcing the correct official white/mono variant for that badge, never by algorithmic color manipulation (like `filter: invert()`). If no official mono variant is provided by the certifying organization, the full-color badge remains as-is.

## 4. Metadata Derivation (`template.config.ts`)

Instead of hardcoding metadata, `template.config.ts` must import `schema.json` and cast it to `TemplateMetadata`. 

```typescript
import { TemplateMetadata } from "@/lib/templates/types";
import schema from "./schema.json";

export const config: TemplateMetadata = {
  id: schema.id,
  name: schema.name,
  niche: schema.niche,
  styleTags: schema.styleTags,
  features: schema.editable_fields.map(f => f.id),
  // Optionally, derive specific configurations or sub-variants if needed
};
```

## 5. Adding to the Engine

The registry (`src/templates/registry.ts`) manages all available templates.

Currently, we map templates statically but return them via an async `getTemplate(id)` function.
When you add `roofing-pro`:
1. Add it to the switch statement in `registry.ts`.
2. Follow up with FU-1 (Tracked Follow-up) to convert the `registry.ts` imports into true Next.js lazy/dynamic imports (e.g., `next/dynamic` or `React.lazy`) so the client never loads code for designs it isn't using.
