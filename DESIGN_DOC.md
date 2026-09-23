# Website Design & Token Customization System Documentation

> **Status:** Production Reference Doc  
> **Last Updated:** 2026-09-18  
> **Scope:** Niche Landing-Page Generator — Color Extraction, Dynamic Theming, and Variable Mapping System

---

## 1. System Vision & Architecture

The objective of this generator is to transform **one base template design** into **infinitely customizable, pitch-ready branded landing pages** for local businesses.

Every page is driven by a deterministic pipeline:
```
Logo Image (.png/.webp/.jpg)
  │
  ▼ [extract.ts: Median-cut quantization, chroma ranking]
Candidate Palette
  │
  ▼ [derive.ts: OKLCH color-space math + smart contrast inversion]
Full BrandTokens (9 semantic tokens)
  │
  ▼ [token-style.ts: Dual CSS custom property emission]
Runtime CSS Variables (--brand, --color-brand, etc.)
  │
  ▼ [globals.css + Tailwind CSS v4 @theme]
Pixel-Perfect Rendered Landing Page
```

---

## 2. Fixed Elements vs. Variable Elements

Variability is a controlled parameter, not an open-ended cost:

| Element Type | Classification | Examples | Behavior |
|---|---|---|---|
| **Layout & Structure** | **Fixed** | Section ordering, container widths, flex grids, spacing scale, card borders, radii | Carries the visual balance and high conversion hierarchy from the Figma original. |
| **Typography Hierarchy** | **Fixed** | Font families (`--font-heading`, `--font-nav`, `--font-body`), font weights, text transform | Ensures cohesive brand typography. |
| **Icons & Landmarks** | **Fixed** | Navigation links, form fields, phone/email SVG icons, checkmarks | Guaranteed UX consistency and semantic accessibility. |
| **Color Tokens** | **Variable** | 9 Semantic Color Tokens (`brand`, `accent`, `surface`, `ink`, etc.) | Fully derived from the prospect's logo at runtime. |
| **Copy Slots** | **Variable** | Business name, headline prefix/highlight/suffix, tagline, emergency badge, CTA label | Tailored per prospect via business input & AI copy engine. |
| **Image Slots** | **Variable** | Prospect logo, niche-curated photo assets | Sourced dynamically from prospect uploads and curated libraries. |

---

## 3. The 9 Core Brand Tokens

All template sections use **only** these 9 semantic tokens. No section component may ever contain literal colors (`#hex`, `rgb()`, `bg-blue-600`, etc.):

| Token Name | CSS Custom Property | Role & Usage |
|---|---|---|
| `brand` | `--brand`, `--color-brand` | Primary background color (Hero background, header bar, quote form banner, about card, footer). |
| `brandFg` | `--brand-fg`, `--color-brand-fg` | Text and icons displayed on top of `brand` backgrounds (must meet ≥ 4.5:1 WCAG contrast). |
| `accent` | `--accent`, `--color-accent` | High-visibility action color (CTA buttons, urgent badges, headline highlight words, decorative trims). |
| `accentFg` | `--accent-fg`, `--color-accent-fg` | Text displayed on top of `accent` buttons (must meet ≥ 4.5:1 WCAG contrast). |
| `surface` | `--surface`, `--color-surface` | Default page background (typically ultra-light, subtle brand-tinted neutral). |
| `surfaceAlt` | `--surface-alt`, `--color-surface-alt` | Alternating section background and form input field fill. |
| `ink` | `--ink`, `--color-ink` | Primary body text and form labels. |
| `inkMuted` | `--ink-muted`, `--color-ink-muted` | Sub-labels, secondary copy, and consent text. |
| `border` | `--border`, `--color-border` | Subtle dividing lines and card borders. |

---

## 4. Smart Design Ideology: The Contrast & Inversion Rule

When designing with brand colors automatically extracted from real-world business logos, raw color assignment fails if the logo is light-colored. We enforce a **Smart Design Ideology**:

### A. The Inversion Rule for Light-Colored Logos
- **Problem:** If a logo or mark is primarily light-colored (e.g. gold, yellow, light cyan, lime, pastel, or white with light trim), using that color as the `brand` background causes white text (`brandFg`) to fail WCAG accessibility standards completely (unreadable light-on-light).
- **Rule:** If the primary extracted logo color is light (`OKLCH Lightness L >= 0.52`):
  1. **Preserve the light logo color as the `accent` token.** This keeps the natural brilliance of the logo mark on CTA buttons, badges, and headline highlights.
  2. **Derive the `brand` background using the authoritative dark opposite color:**
     - If the logo contains a secondary darker tone (`L < 0.45`), that dark tone is clamped (`L: 0.18–0.38`) and assigned to `brand`.
     - Otherwise, the background is derived using the **complementary hue (+180° rotation in OKLCH)** clamped to an authoritative deep lightness band (`L ~ 0.24–0.28`, `C ~ 0.08–0.10`).
  3. **Ensure contrast floors:** `ensureContrast()` guarantees minimum **4.5:1** contrast between `brand` and `brandFg` (white), and between `accent` and `accentFg` (dark ink).

### B. The Anchoring Rule for Dark-Colored Logos
- **Rule:** If the primary extracted logo color is dark (`OKLCH Lightness L < 0.52`):
  1. Clamped into the rich brand background band (`L: 0.18–0.40`).
  2. White foreground text (`brandFg: #ffffff`) provides crisp contrast.
  3. The `accent` is derived as a vivid, high-lightness highlight (`L: 0.65–0.85`, `C: 0.12–0.20`) either from a secondary candidate or a harmonious hue offset (+160°).

---

## 5. Runtime Theming Architecture (Tailwind CSS v4 Integration)

### The Dual-Emission Token Pattern
In Tailwind CSS v4, the `@theme` directive creates utility classes referencing CSS custom properties:
```css
/* src/styles/globals.css */
@theme {
  --color-brand: var(--brand);
  --color-brand-fg: var(--brand-fg);
  --color-accent: var(--accent);
  --color-accent-fg: var(--accent-fg);
  --color-surface: var(--surface);
  --color-surface-alt: var(--surface-alt);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-border: var(--border);
}
```

Because custom property inheritance in standard CSS inherits the *computed value* from `:root`, setting only `--brand` on an inner wrapper does not dynamically re-evaluate `--color-brand` in child elements unless explicitly declared.

**The Solution:**
1. `src/lib/render/token-style.ts` emits **both** `--<token>` and `--color-<token>`:
   ```ts
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
   ```
2. `src/styles/globals.css` includes scoped container re-binding:
   ```css
   #site-preview,
   [data-theme="site-preview"] {
     --color-brand: var(--brand);
     --color-brand-fg: var(--brand-fg);
     --color-accent: var(--accent);
     --color-accent-fg: var(--accent-fg);
     --color-surface: var(--surface);
     --color-surface-alt: var(--surface-alt);
     --color-ink: var(--ink);
     --color-ink-muted: var(--ink-muted);
     --color-border: var(--border);
   }
   ```

### Vectorized Decorative Accents
- Decorative shapes (such as the diagonal corner trims in `Hero.tsx`) must never be static raster PNGs with baked-in colors.
- They must be implemented as clean inline SVGs utilizing `text-accent` and `fill="currentColor"`.

---

## 6. Step-by-Step Issue & Resolution Log

### Issue #1: Color Extractor Not Applying Website Branding Colors
- **Date:** 2026-09-18
- **Symptoms:**
  - Generating a site from a logo (e.g. Bugsy's Pest Solutions) extracted red (`#970007`) and cyan (`#00d5c7`) tokens shown in the admin swatches.
  - However, the live preview page remained stuck on the default Crown Pest blue (`#132152`) and yellow (`#ecbb3e`).
  - Decorative diagonal trims on the Hero section remained bright yellow regardless of brand tokens.
- **Root Cause Analysis:**
  1. Tailwind CSS v4 compiled `@theme` into `:root, :host { --color-brand: var(--brand); }`. When `:root` computed this against default fallback values, child elements inherited the computed color `#132152` instead of re-evaluating dynamically.
  2. `src/lib/render/token-style.ts` only passed `--brand`, `--accent`, etc., leaving `--color-brand` and `--color-accent` untouched.
  3. `Hero.tsx` loaded static raster PNG files (`decor-left.png`, `decor-right.png`) that had hardcoded yellow pixels exported from Figma.
- **Resolution Steps:**
  1. Updated `src/lib/render/token-style.ts` to emit both `--*` and `--color-*` properties directly onto the `#site-preview` container.
  2. Added scoped container re-binding rules in `src/styles/globals.css` for `#site-preview`.
  3. Replaced static raster images in `src/templates/crown-home/sections/Hero.tsx` with dynamic inline SVGs using `className="text-accent"` and `fill="currentColor"`.
  4. Updated `src/lib/tokens/derive.ts` to implement the Smart Design Ideology (automatic opposite/dark background derivation for light logos + WCAG contrast enforcement).
  5. Added automated vitest coverage in `src/lib/tokens/tokens.test.ts` to verify the smart inversion rule.
- **Outcome & Verification:**
  - Live preview at `http://localhost:3000/preview/crown-pest-control` fully updates: Hero and Header backgrounds render rich red (`#970007`), buttons, badges, diagonal trims, and highlighted words render vibrant cyan (`#00d5c7`).
  - Playwright visual tests confirmed pixel-perfect rendering at desktop (1440px) and mobile (390px) breakpoints.

---

## 7. Operational Guidelines for Future Customizations

When adding new sections or new templates:
1. **Never use inline literal colors.** Always use Tailwind token classes (`bg-brand`, `text-brand-fg`, `bg-accent`, `text-accent`, `text-accent-fg`, `bg-surface`, `bg-surface-alt`, `text-ink`, `text-ink-muted`, `border-border`).
2. **Always test with both light and dark logos.** Run `pnpm test` and `pnpm lint:tokens`.
3. **Keep this document updated.** Whenever a new website issue is identified and solved, document the symptom, root cause, and solution in Section 6.

---

## 8. Figma Pixel-Perfection Audits & Implementation Specs

### Section Audit: Header (`Group 581`, Node ID `174:97`)
- **Figma File:** "Crown Pest Control Jacksonville" (`b3tMfDXbqB7Ta5eyKDhGBS`)
- **Canvas Width:** 1512px | **Total Height:** 202px (y: -9 to 193)

#### Detailed Element Specifications & Mapping

| Element | Figma Node ID | Figma Dimensions & Position | Figma Typography & Styling | Semantic Token & Implementation |
|---|---|---|---|---|
| **Top Bar Background** | Canvas | w: 1512, h: 76 (y: 0 to 76) | Solid `#ffffff` | Full-bleed `bg-surface`, sleek reduced height `h-[54px] lg:h-[60px]`, inner container `max-w-[1728px]` |
| **Nav Bar Background** | `15:731` | w: 1512, h: 117 (y: 76 to 193) | Solid `#132152` | Full-bleed `bg-brand text-brand-fg` (`h-[85px] lg:h-[110px]`, edge-to-edge) |
| **Brand Logo** | `102:119` | x: 51, y: 18.7, w: 278, h: 148 | Positioned with clear contrast | `relative z-30 w-[180px] sm:w-[220px] lg:w-[260px] h-[65px] sm:h-[80px] lg:h-[90px]` |
| **Tagline** | `15:744` | x: 322, y: 30, w: 487, h: 25 | `Poppins Medium`, 18px, lh: 20px, `#132152` | `font-body font-medium text-[15px] text-ink` |
| **Email Text & Icon** | `15:743`, `15:761` | x: 855–1198, y: 27, icon: 27×24 | `Poppins Medium`, 18px, `#132152` | `font-body font-medium text-[15px] text-ink` + SVG icon |
| **Emergency Badge** | `15:764` | x: 1227, y: -9, w: 201, h: 33, r: 5 | `Inter Regular`, 13px, `#ecbb3e`, text: `#000000` | Top-screened: `top-0 right-0 rounded-b-[5px] rounded-t-none h-[22px] lg:h-[24px]` (clipped at top margin matching Figma `y: -9`) |
| **Phone Text & Icon** | `15:745` | x: 1256, y: 34, w: 163, h: 27, icon: 23×23 | `Poppins SemiBold`, 18px, `#132152` | `font-body font-semibold text-[16px] text-ink` directly beneath badge |
| **Nav Links (6 items)** | `102:128` | x: 364, y: 121, w: 784, h: 29 | `Bakbak One Regular`, 21px, `#ffffff` | `font-nav text-[17px] 2xl:text-[20px] uppercase text-brand-fg flex-1 justify-center` (centered between logo & CTA) |
| **CTA Button** | `15:759` | x: 1218, y: 109, w: 206, h: 43, r: 5 | `Bakbak One Regular`, 16px, `#ecbb3e`, text: `#000000` | `font-nav text-[16px] uppercase h-[43px] rounded-[5px] bg-accent text-accent-fg` |
| **CTA Solid Drop Shadow** | `15:758` | x: 1222, y: 113, w: 206, h: 43, r: 5 | Solid `#ffffff` rectangle offset by +4px X, +4px Y | `shadow-[4px_4px_0px_var(--surface)]` |

#### Widescreen Full-Bleed & Max-Width Architecture
- **Full-Bleed Separation:** The outer `<header>` wrapper does not apply `bg-surface` or fixed width. Both the top bar and main nav bar have separate full-width containers (`w-full bg-surface` and `w-full bg-brand`), eliminating boxed white side borders on widescreen displays.
- **Max Width Expansion:** Increased the inner content container from `max-w-[1512px]` to `max-w-[1728px]`, providing a luxury layout for widescreen devices while remaining centered.
- **Centered Menu Distribution:** The main navigation uses `flex-1 items-center justify-center` between the left logo and right CTA button, creating visual symmetry.
- **Top-Screened Badge Tab:** The 24/7 Emergency badge is flush against the top viewport edge (`top-0`, `rounded-b-[5px]`, `rounded-t-none`), faithfully reproducing Figma's `y: -9` top-margin clip.

---

## 9. Icon System Architecture (`lucide-react` Integration)

To eliminate crude browser symbols, raw ASCII `>` arrows, clunky platform emojis, and low-fidelity inline SVGs, the project standardizes on **Lucide React (`lucide-react`)**:

| Location | Element | Icon & Styling | Purpose / Design Rationale |
|---|---|---|---|
| **Top Header Bar** | Email | `<Mail className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-ink shrink-0" strokeWidth={2} />` | Larger, prominent visual anchor on the left side balancing the header. |
| **Top Header Bar** | Phone | `<Phone className="w-[18px] h-[18px] lg:w-[20px] lg:h-[20px] text-ink shrink-0" strokeWidth={2.2} />` | Bold, balanced communication indicator beneath the emergency badge. |
| **Main Navigation** | Dropdowns (`About`, `Services`, `Areas`) | `<ChevronDown className="w-4 h-4 text-brand-fg stroke-[2.5]" />` | Clean, crisp, legible indicator replacing polygon markers. |
| **Hero CTA Button** | "Get Pest Control Help" | `<ChevronRight className="w-4 h-4 stroke-[3]" />` | Crisp high-contrast vector arrow inside square action box replacing `&gt;`. |
| **About CTA Button** | "Learn More" | `<ChevronRight className="w-3.5 h-3.5 stroke-[3]" />` | Crisp vector arrow inside square action box replacing `&gt;`. |
| **Hero Sub-Badges** | Trust Badges Row | `<ShieldCheck>`, `<Sparkles>`, `<Crown>`, `<Award>` with `className="text-accent stroke-[2.2]"` | Replaces OS emojis (`🛡️`, `👩‍👧`, `👑`) with cohesive token-colored vector icons. |
| **Quote Form** | Service Dropdown | `<ChevronDown className="w-4 h-4 stroke-[2]" />` with `pr-10 truncate` | Consistent form input chevron with guaranteed spacing preventing text overlap. |
| **Generator Admin Tool** | Logo Upload, Generation, Preview, Save | `<Upload>`, `<Wand2>`, `<ExternalLink>`, `<Save>`, `<RotateCcw>`, `<CheckCircle>` | Modernized tool dashboard UI matching design agency quality. |

---

## 10. Quote Form Pixel-Perfection Audit (`Rectangle 9`, Node ID `15:780`)

- **Container Width:** `1180px` on 1512px canvas (`max-w-[1180px]`).
- **Corner Radius:** `20px` (`rounded-[20px]`).
- **Shadow:** `offset: {-4, 5}`, `radius: 28`, `spread: 5` (`shadow-[-4px_5px_28px_5px_rgba(0,0,0,0.08)]`).
- **Hanging Top Banner Tab (`15:945`):**
  - Dimensions: `w: 511px, h: 60px`.
  - Radii: `tl: 0, tr: 0, bl: 20, br: 20` (`rounded-b-[20px] rounded-t-none`).
  - Styling: `bg-brand text-brand-fg`, centered at top edge of form card.
- **Input Fields (`15:947` to `15:952`):**
  - Height: `43px` (`h-[43px]`), Corner Radius: `5px` (`rounded-[5px]`).
  - Background: `bg-surface-alt`, Border: `border border-border`.
- **Submit Button (`15:953`):**
  - Dimensions: `w: 266px, h: 43px`, Corner Radius: `5px`.
  - Styling: `bg-accent text-accent-fg font-body font-semibold text-sm uppercase`.
- **Soft Visible Border & Elevation:**
  - `border-2 border-border shadow-[0_12px_40px_rgba(0,0,0,0.12)]` prevents the white form card from blending with the white page background.
- **Custom Interactive Checkbox (`15:984`):**
  - Dimensions: `16px x 16px`, Corner Radius: `3px`.
  - Default State: **Unchecked by default** (`checked: false`).
  - Active State: Clicking toggles state and renders a crisp Lucide `<Check>` icon with `bg-accent border-accent text-accent-fg`.

---

## 11. About Us Section Pixel-Perfection Audit (`Rectangle 56`, Node ID `15:987`)

- **Container Width:** `1486px` on 1512px canvas (`max-w-[1486px]`).
- **Corner Radius:** `20px` (`rounded-[20px]`).
- **Styling:** `bg-brand text-brand-fg`, almost full-bleed with `13px` viewport margin.
- **Top Tab Badge (`Rectangle 55`, `15:985`):**
  - Dimensions: `w: 164px, h: 26px`.
  - Radii: `tl: 5, tr: 5, bl: 0, br: 0` (`rounded-t-[5px] rounded-b-none`).
  - Placement: Centered flush at the top seam of the card (`top-0.5`).
  - Crown removal: Crown decorative illustration above the tag removed per explicit design mandate.
- **House Photography Frame (`Group-497 1`, `102:131` / `15:996`):**
  - Dimensions: `538px x 569px` aspect ratio (`aspect-[538/569]`), `rounded-[10px]`.
- **Headline Typography (`15:988`):**
  - Font: `Alfa Slab One` (`font-heading`), `40px` (`text-[38px] lg:text-[40px]`), city highlighted in `text-accent`.
- **Body Copy (`15:989`):**
  - Size: `18px` (`text-[17px] xl:text-[18px] text-brand-fg/85 leading-relaxed`).
- **CTA Button (`Rectangle 11`, `15:992`):**
  - Dimensions: `w: 272px, h: 39px`, Corner Radius: `5px`.
  - Background: `bg-accent text-accent-fg`.
  - Drop Shadow: Solid white offset rectangle (`shadow-[6px_4px_0px_var(--surface)]`).
  - Right Icon Circle: `w: 26px, h: 26px` circle (`rounded-full bg-surface text-ink`) with Lucide `<ChevronRight>`.

---

## 12. Mobile Responsive Architecture

Designed according to client mobile mockup specifications:

1. **Top Header on Mobile:**
   - Cleans clutter by hiding the email/tagline on narrow viewports while highlighting the phone number right-aligned with the phone icon (`(904) 743-1132`).
2. **Navigation Bar on Mobile:**
   - Brand logo displayed on left (`w-[160px] h-[55px]`).
   - Mobile Hamburger Menu Button: `w-[42px] h-[42px] rounded-[8px] bg-accent text-accent-fg shadow-[3px_3px_0px_var(--surface)]` featuring Lucide `<Menu>` and `<X>`.
   - Collapsible Menu Drawer: When opened, displays all navigation destinations (`HOME`, `ABOUT`, `PEST SERVICES`, `SERVICE AREAS`, `BLOG`, `CONTACT`), email link, emergency support badge, and full-width CTA button.
3. **Hero Sub-Badges Row on Mobile:**
   - Automatically switches from a horizontal row to a clean vertical stack (`flex flex-col sm:flex-row gap-2.5 sm:gap-8`) inside the blurred brand container.
4. **Quote Form on Mobile:**
   - Form inputs stack vertically into single-column rows with 43px height and full touch target accessibility.
   - Hanging top banner tab scales responsively (`max-w-[511px]`).

