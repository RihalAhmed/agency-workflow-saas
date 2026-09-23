# Project Brief — Niche Landing-Page Generator

> **For the coding agent (Antigravity):** read this whole file before writing any code.
> Build strictly phase by phase. Do not skip ahead. Do not add features that are not listed
> in the current phase, even if they seem obviously useful.

---

## 1. What we are building

A generator that turns **one Figma landing-page design** into **many branded landing pages**.

Input for a single page:

| Field | Example | Source |
|---|---|---|
| Business name | "Crown Roofing" | typed by the user |
| Logo image | `crown-logo.png` | uploaded by the user |
| Category / niche | `roofing` | picked from a list |
| Phone / email / city | `(555) 010-2233` | typed by the user |

Output: a fully rendered, production-quality landing page whose colors, copy slots and
images are derived automatically from that input — visually indistinguishable in quality
from the hand-made Figma original.

The first commercial use is **cold outreach**: the operator generates a page for a real
local business and shows it to them as a pitch. A public product layer (accounts,
credits, hosting) comes last.

## 2. Non-goals for v1 (do not build these)

- No database, no auth, no payments, no admin panel (these arrive in Phase 8).
- No scraping of Google Maps, directories or Figma. Lead data is **pasted manually** by the
  operator. This is a hard legal constraint, not a preference.
- No LLM / AI API calls anywhere in the color or rendering pipeline. Color work is done with
  deterministic math. AI is used to *write* this codebase, not to run it.
- No CMS, no multi-language, no blog, no analytics dashboard.
- No visual page builder / drag-and-drop editor.

---

## 3. Tech stack (decided — do not substitute)

| Concern | Choice | Why this one |
|---|---|---|
| Language | **TypeScript** (strict mode) | The whole system is a set of contracts (spec → tokens → template). Types are what stop Phase 7 from collapsing. |
| Runtime | **Node.js 22 LTS** | Native `sharp` support, stable, matches Vercel. |
| Framework | **Next.js 15, App Router, React 19** | One codebase does template rendering, the preview route, the API, and later the product layer and subdomain hosting. No second backend to maintain. |
| Styling | **Tailwind CSS v4** + **CSS custom properties** | Tailwind v4 is CSS-first: the theme *is* CSS variables, so brand colors can be swapped at runtime per page. This is the single most important stack decision — see §6. |
| Package manager | **pnpm** | Fast, strict, workspace-ready for when the token engine is split out. |
| Schema / validation | **zod** | One schema file is the contract between every stage of the pipeline. |
| Color math | **culori** | OKLCH conversion, chroma/lightness manipulation, WCAG contrast. Small, dependency-free, deterministic. |
| Image decoding | **sharp** | Decodes PNG/JPEG/WebP/SVG logos to raw pixels for palette extraction. |
| Unit tests | **vitest** | Token math must be snapshot-tested. |
| Visual checks | **Playwright** | Screenshot the rendered page to compare against the Figma export. |
| Formatting / lint | **Prettier** + **ESLint** (`next/core-web-vitals`, `@typescript-eslint`) | — |
| Fonts | **next/font** with self-hosted files | No layout shift, no Google Fonts request, license stays under our control. |

**Deferred to Phase 8 (mentioned only so nothing is architected against them):**
Postgres via **Supabase** + **Drizzle ORM**; **Better Auth** for accounts; **Stripe** or
**Lemon Squeezy** for credits; **Cloudflare R2** for logo/image storage; **Vercel** wildcard
domains for `*.preview.<domain>`.

### Explicitly rejected

- `node-vibrant` for palette extraction — unmaintained, non-deterministic edges, heavy.
  Write ~120 lines of median-cut quantization instead (§ Phase 4).
- CSS-in-JS (styled-components / emotion) — fights RSC and runtime theming.
- A headless CMS — content comes from a JSON spec, not an editor.
- A monorepo on day one — start single-app; extract `packages/tokens` only if Phase 7 needs it.

---

## 4. Repository structure

```
/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # internal generator form (operator-only, Phase 5)
│   │   ├── preview/[slug]/page.tsx   # renders a saved SiteSpec
│   │   └── api/generate/route.ts     # POST SiteSpec input → writes spec JSON
│   ├── templates/
│   │   ├── registry.ts               # id → TemplateModule map
│   │   └── crown-home/               # first template (rename to the real design)
│   │       ├── template.config.ts    # TemplateMeta: niche, style_tags, sections, variants
│   │       ├── sections/
│   │       │   ├── Hero.tsx
│   │       │   ├── TrustBar.tsx
│   │       │   ├── Services.tsx
│   │       │   ├── About.tsx
│   │       │   ├── Cta.tsx
│   │       │   └── Footer.tsx
│   │       └── variants.ts           # layout + color-combination variants
│   ├── lib/
│   │   ├── spec/site-spec.ts         # zod schemas — the contract
│   │   ├── tokens/
│   │   │   ├── extract.ts            # logo image → candidate palette
│   │   │   ├── derive.ts             # palette → full BrandTokens
│   │   │   ├── contrast.ts           # readable foreground picker
│   │   │   └── index.ts              # logoToTokens() — the only public entry point
│   │   ├── render/
│   │   │   ├── resolve.ts            # SiteSpec → props per section
│   │   │   └── token-style.ts        # BrandTokens → React style object of CSS vars
│   │   └── images/library.ts         # niche → curated licensed image set
│   └── styles/globals.css            # @theme block: every design token as a CSS var
├── data/
│   ├── prospects/*.json              # one generated SiteSpec per prospect (file-based v1)
│   └── figma/                        # exported PNGs of each Figma section, for pixel review
├── public/library/<niche>/           # licensed images, with LICENSE.md per folder
├── scripts/
│   ├── tokens.ts                     # CLI: pnpm tokens <logo.png> → prints token JSON
│   └── generate.ts                   # CLI: pnpm generate <prospect.json> → writes spec
└── tests/
```

---

## 5. Core contracts

Write these **before** any component. Everything downstream imports from here.

```ts
// src/lib/spec/site-spec.ts
import { z } from "zod";

export const BrandTokens = z.object({
  brand:        z.string(), // primary, from the logo
  brandFg:      z.string(), // readable text on `brand`
  accent:       z.string(), // derived, for highlights/CTAs
  accentFg:     z.string(),
  surface:      z.string(), // page background
  surfaceAlt:   z.string(), // alternating section background
  ink:          z.string(), // body text
  inkMuted:     z.string(),
  border:       z.string(),
});
export type BrandTokens = z.infer<typeof BrandTokens>;

export const Business = z.object({
  name:     z.string().min(1),
  category: z.string().min(1),          // "roofing", "hvac", "plumbing", ...
  tagline:  z.string().optional(),
  phone:    z.string().optional(),
  email:    z.string().email().optional(),
  city:     z.string().optional(),
  logoPath: z.string(),                 // local path or /uploads URL
});

export const SiteSpec = z.object({
  slug:       z.string().regex(/^[a-z0-9-]+$/),
  templateId: z.string(),
  variantId:  z.string(),
  business:   Business,
  tokens:     BrandTokens,
  sections:   z.array(z.object({
    type:    z.string(),                // "hero" | "trustBar" | ...
    content: z.record(z.unknown()),     // copy slots, resolved before render
    images:  z.array(z.string()).default([]),
  })),
});
export type SiteSpec = z.infer<typeof SiteSpec>;
```

```ts
// src/templates/crown-home/template.config.ts
export const meta = {
  id: "crown-home",
  niche: ["roofing", "hvac", "plumbing", "landscaping"],
  styleTags: ["bold", "photo-led", "trust-heavy"],
  sections: ["hero", "trustBar", "services", "about", "cta", "footer"],
  variants: ["a-photo-hero", "b-split-hero", "c-dark-hero"],
} as const;
```

**Rule:** every stage is a pure function with a typed input and a typed output.
`logo → palette → tokens → spec → HTML`. No stage reaches around another one.

---

## 6. The token rule (read twice)

This is where a project like this normally dies. Enforce it mechanically.

1. **No section component may contain a literal color.** No hex, no `rgb()`, no
   `bg-blue-600`, no `text-slate-900`. Colors are only ever
   `var(--brand)`, `var(--accent-fg)`, `var(--surface-alt)`, etc.
2. Tokens are declared once in `src/styles/globals.css` inside Tailwind v4's `@theme`
   block, with neutral fallback values so the template renders standalone.
3. Per-page brand colors are injected at **runtime** as inline CSS variables on the page
   wrapper — never compiled in:
   ```tsx
   <div style={tokenStyle(spec.tokens)}>{/* sections */}</div>
   // tokenStyle → { "--brand": "#1b4f8a", "--brand-fg": "#ffffff", ... }
   ```
4. **Fixed vs variable.** Shapes, icons, spacing, radii, section order and type scale are
   *fixed* (they carry the Figma design's quality). Logo, business name, headline, phone,
   image slots and the nine color tokens are *variable*. If something is not on the
   variable list, hardcode it — variability is a cost, not a feature.
5. Add an ESLint rule (or a `pnpm lint:tokens` grep script) that fails the build when a
   hex code or a Tailwind color utility appears under `src/templates/`. Do this in Phase 3,
   before there are five templates to clean up.

---

## 7. Build plan

### Phase 1 — Pick one design, break it into sections
**Goal:** a single, strongest home-service design decomposed on paper.
- Export each section of the chosen Figma design as PNG into `data/figma/`.
- Confirm the section list: Hero, Trust bar, Services, About, CTA, Footer.
- **Done when:** six reference PNGs exist and the section order is agreed.
- *Agent: this step is done by the human. Ask for the exports if they are missing.*

### Phase 2 — Variable map before code
**Goal:** every element classified before a single component is written.
- Produce `data/variable-map.csv` with columns:
  `section, element, kind (variable|fixed), token (brand|accent|surface|ink|none), notes`.
- **Done when:** every visible element in all six sections appears in exactly one row.
- *Agent: if this file is missing, generate a first draft from the Figma exports and ask
  the human to correct it. Do not start Phase 3 without it.*

### Phase 3 — Figma section → React component
**Goal:** pixel-accurate, token-driven section components.
- Scaffold: `pnpm create next-app` (TypeScript, Tailwind v4, App Router, src dir), then add
  zod, culori, sharp, vitest, playwright, prettier.
- Write `src/lib/spec/site-spec.ts` and `src/styles/globals.css` **first**.
- Convert one section at a time. Every string that the variable map marks `variable`
  becomes a typed prop (`{ businessName, headline, phone, logoUrl, imageSlots }`) —
  never an inline literal.
- After each section, screenshot it with Playwright at 1440px and 390px and compare against
  the Figma export: spacing, font-size, line-height, alignment, radius.
- Accessibility floor from the start: semantic landmarks, visible focus rings,
  `prefers-reduced-motion` respected, alt text on every image.
- **Done when:** all six sections render from props, pass the token lint, and match the
  Figma exports at both breakpoints.

### Phase 4 — Token-logic function (standalone)
**Goal:** `logoToTokens(imagePath) → BrandTokens`, tested in isolation.
- `extract.ts`: `sharp` → resize to 64×64 → raw RGBA → drop transparent, near-white
  (L > 0.95), near-black (L < 0.08) and near-grey (chroma < 0.02) pixels → median-cut
  quantize to 8 buckets → rank by `population × chroma` → return top candidates.
- `derive.ts`: convert the winner to OKLCH. Clamp lightness into a usable band for a
  brand color. Derive `accent` by hue rotation (+150–210°) or, if the logo has a strong
  second color, use that instead. Derive `surface` (very high L, very low C, same hue),
  `surfaceAlt`, `ink`, `inkMuted`, `border` from the same hue so the page feels authored.
- `contrast.ts`: pick black or white foreground by WCAG contrast ratio, minimum **4.5:1**
  for body text and **3:1** for large display text. If neither passes, darken/lighten the
  background token until one does — never ship an unreadable page.
- Edge cases to handle explicitly: single-color black logo, single-color white logo,
  full-color photographic logo, transparent PNG, SVG.
- `scripts/tokens.ts` CLI prints the resulting JSON plus an HTML swatch sheet.
- **Done when:** vitest snapshots cover at least 10 real logos, every output passes the
  contrast floor, and the same logo always produces the same tokens.

### Phase 5 — Smallest rendering engine
**Goal:** input → one real page on screen. No database, no login, no payment.
- `data/prospects/<slug>.json` holds a SiteSpec. `scripts/generate.ts` builds one from
  name + logo + category by calling `logoToTokens` and filling default copy per category.
- `src/app/preview/[slug]/page.tsx` reads the JSON, validates it with zod, resolves the
  template from the registry, wraps it in `tokenStyle()` and renders.
- A minimal operator form at `/` posts to `/api/generate` so a page can be produced without
  the terminal.
- Copy defaults live in `src/lib/copy/<category>.ts` — plain, active-voice, specific.
  Placeholder lorem is not acceptable output.
- **Done when:** a dummy prospect produces a live page at `/preview/<slug>`.

### Phase 6 — End-to-end loop test (the real checkpoint)
**Goal:** prove the architecture with the full chain, start to finish.
- Run five genuinely different real businesses through
  `logo → tokens → spec → template → rendered page`.
- Judge each output against the original Figma design. If any looks obviously worse, the
  fault is in the variable map or the token derivation — fix *those*, not the component.
- **Spend the most time here.** Do not start Phase 7 until every one of the five looks
  like something the operator would show a paying client.
- **Done when:** 5/5 outputs are pitch-quality and the human signs off.

### Phase 7 — Library and scale
**Goal:** more designs, more variety, same pipeline.
- Repeat Phases 1–3 for 3–4 further designs. Each gets its own `template.config.ts`.
- Implement variant generation: **layout variant × color combination = 5 options**.
  Layout variants live in `variants.ts` per template; color combinations reassign which
  token drives hero background, CTA and section alternation. Selection is deterministic
  from a seed so a prospect's page is reproducible.
- Build the curated image library: `public/library/<niche>/`, each folder with a
  `LICENSE.md` naming the source and license. Never hotlink, never use unlicensed stock.
- `src/lib/images/library.ts` picks images by niche and slot aspect ratio; convert to WebP
  and serve through `next/image`.
- **Done when:** any prospect yields 5 distinct, good-looking options across templates.

### Phase 8 — Product layer (last)
Only after the operator has closed 2–3 clients using the tool manually.
- Supabase Postgres + Drizzle: `users`, `sites`, `credits`, `templates`.
- Better Auth for accounts; Stripe or Lemon Squeezy for a credit/subscription system.
- Move prospect JSON from disk into `sites.spec` (jsonb) — the zod schema does not change.
- Wildcard subdomain preview hosting via Next middleware rewriting `<slug>.preview.<domain>`
  to `/preview/<slug>`.
- Admin panel: template management, credit adjustment, generated-site list.
- Lead data stays **manually pasted**. Keep it that way.

---

## 8. Conventions

- TypeScript `strict: true`; no `any`; `unknown` + zod parse at every boundary.
- Server Components by default; `"use client"` only for the operator form.
- Files kebab-case, React components PascalCase, one section per file.
- Conventional commits, one phase per branch (`phase-4-token-logic`).
- Every pure function in `src/lib` gets a vitest test in the same folder.
- Keep `README.md` current with: how to run, how to add a template, how tokens work.
- Do not install a package that is not in §3 without asking first.

## 9. Commands

```bash
pnpm dev                     # Next dev server
pnpm tokens ./logo.png       # print BrandTokens + swatch sheet
pnpm generate ./prospect.json
pnpm test                    # vitest
pnpm test:visual             # playwright screenshot comparison
pnpm lint && pnpm lint:tokens
```

## 10. Ask the human before assuming

1. Which Figma design is the Phase 1 design, and where are the section exports?
2. Which niches ship first (roofing / HVAC / plumbing / landscaping / other)?
3. Which font files are licensed for commercial use in generated client sites?
4. Where do the licensed images come from, and under which license?
5. What domain will previews live on?

**Stop after each phase.** Report what was built, show the screenshots, and wait for
approval before starting the next one.
