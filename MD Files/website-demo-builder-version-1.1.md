# Website Demo Builder — Version 1.1

## 1. Product Overview
A SaaS tool for freelancers/agencies (marketing agency owners) who can't approach a prospect directly for website work — they build a ready-to-show demo website using the prospect's own data (logo, business info, images) to pitch on. Competitors already offer similar demo-site services, so the entire product philosophy is **low friction, minimal input required from the user** — the more steps demanded, the fewer users adopt it.

## 2. Core Architecture Decision
**Rule (never break): the core engine never hardcodes a specific design's ID or logic.** No `if (design_id === "x")` branching inside engine code — every new design means a new branch, a new bug surface, and risk of one design breaking another. The fix: the engine knows only one fixed **schema contract**. Each design implements that contract and is otherwise unknown to the engine.

**Four-layer model:**
1. **Design registry (database)** — tags and niche metadata only.
2. **Core engine (fixed, small)** — reads only the schema contract.
3. **Selected design module** — loaded only when requested (lazy loading / dynamic import). Every other design's code sits untouched on disk.
4. **Image assets (CDN)** — fetched separately, never bundled with code.

**Why this stays light regardless of design count:**
- Registry lookups are a cheap indexed DB query whether there are 100 designs or 10,000 — never a bottleneck.
- Only the matched design's module loads into memory per request; the rest cost nothing at runtime. Each design lives self-contained in its own folder (`/designs/<id>/schema.json` + components).
- Images are never in the codebase — always CDN/object storage, pulled by URL.

This mirrors WordPress themes, VS Code extensions, or npm packages: the core stays light forever because it never knows a specific theme/extension/package by name — only a fixed interface.

**What does grow linearly (and is fine — it's the business moat, not tech debt):** the manual work of turning a new Figma design into a schema-compliant module (variable mapping → Antigravity conversion → review). That's design-library investment, not engine complexity.

## 3. V1 — Already Built
- One design converted from static design to a live, schema-customizable website.
- Basic customizable fields: company name, category, phone, email, logo, brief summary.
- Logo → automatic brand color extraction → applied site-wide via CSS variables.
- Brief summary → automatic content generation via Google API.

## 4. Core Feature Set (Original Vision)

### 4.1 Per-Design Customization
Every design/layout is different, so every design must be individually customizable so the tool can correctly extract its layout. When a new design is added at production level, it is customized through code and then pushed/listed into the tool. The engine's system and pattern stay the same; only each new design's own "unitness" gets code-level customization at the point it's added. **The design quality itself is the product's main selling point.**

### 4.2 Image Handling
**Original ask:** agency owner uploads a bunch of prospect images (4–5); tool auto-detects each image's role and places it into the right section (hero background, About Us image, owner/team photo, etc.).

**Technical plan (chosen over paid vision APIs — free and compact):**
1. Two input paths, neither requiring a manual "assign this image" step: paste the prospect's website URL, or upload images directly.
2. If a URL is given: auto-scrape logo/hero/team images straight from the prospect's site — no upload step at all. Lowest-friction path, covers most non-cold prospects.
3. If no website: one drag-and-drop zone, user drops 3–5 images at once, no per-image tagging required.
4. Fully browser-side, no server cost: on upload, JS measures each image's aspect ratio and `face-api.js` checks for a detected face — instant, free.
5. Rule-based auto-slotting (not AI, just conditions — predictable and bug-free): landscape/wide → hero background; square + face detected → owner/team headshot; square + no face → about/general section; remainder → gallery/extra.
6. If slots stay empty (e.g. prospect only supplied a logo), remaining slots fill from a curated niche-specific stock image library so the site never looks incomplete.
7. Small optional swap icon on hover in the preview, assuming auto-placement is correct ~95% of the time — a fallback for the rare miss, not part of the default flow.

### 4.3 Data Collection & Trust Badges
**Original ask:** user pastes the prospect's existing website URL; system scrapes it and cross-checks which trust platforms (Google Business Profile, Yelp, BBB, etc.) the prospect is actually on, adding only the matching badges (e.g. Google + Yelp present, BBB absent → BBB badge is left out). Alternatively, the user can manually select which platforms apply.

**Correction/clarification of purpose:** this isn't simply "does a Google listing exist" — the goal is to back up and strengthen the prospect's data accuracy on the demo site and remove any chance of a wrong badge showing (e.g. a BBB badge appearing when the prospect isn't actually BBB-listed looks bad to the prospect). Context: the primary target niche is **local home service businesses** (pest control, HVAC, roofing, gutter, etc.) — these commonly register on Google Business Profile, Yelp, BBB, Yellow Pages, and Facebook for authenticity/trust, display reviews pulled from those platforms on their own site, and show trust badges for them. The demo designs themselves include badge and review sections.

**Verification approach discussed (tiered):**
- **Tier 1 (most reliable, free):** scrape the prospect's own site for outbound links/badge images pointing to known trust-platform domains (`google.com/maps`, `yelp.com/biz/`, `bbb.org`, `yellowpages.com`, `facebook.com/`) and for `schema.org` LocalBusiness JSON-LD (`sameAs`, `aggregateRating`). Rule: if the prospect's own site doesn't show a badge, the demo doesn't add it either — near-zero false-positive risk.
- **Tier 2 (no prospect site / cold prospect):** Google Places API (Text Search / Find Place, ~$0.017/query) and Yelp Fusion API (free tier) for a verified existence check.
- **Tier 3 (BBB, Yellow Pages, Facebook):** no reliable public search API exists; scraping these would violate ToS and is fragile. Never auto-add — shown only if Tier 1 finds a live signal, otherwise left to manual confirmation.

**Final decision:** badge selection is **manual** — a checkbox per platform, user confirms what applies to their prospect. When a prospect URL is provided, the auto-scrape/filter layer still runs underneath so the manual selection stays data-backed rather than a blind guess.

### 4.4 Custom Pencil Editor
An Elementor-style inline editor: a pencil/edit icon appears next to each element (or a global "edit mode" toggle first), and clicking it lets the user edit text (and, per the hardened schema in Section 6, image/color fields too) directly on the demo site.

## 5. Architecture Gaps Found & Closed
Cross-checking the schema-driven approach surfaced 8 points that needed to be locked down before scaling past a handful of designs:

1. **No schema versioning** → add `schema_version` to every `schema.json`; new fields are always additive/optional so older designs never break.
2. **Risk of duplicated components** → shared `/primitives` library (button, card, badge, etc.) that every design imports; one fix propagates everywhere instead of being copy-pasted per design.
3. **Content generation could mismatch section counts** → schema defines `min/max count` per repeatable section; content generation reads it and conforms.
4. **No validation before going live** → a pre-publish validator checks `schema.json` against a JSON Schema before a design is listed, so a broken design never surfaces in front of a live prospect.
5. **Image-slot rules risked living in a separate, unsynced contract** → slot definitions live inside the same `schema.json`, not a second file.
6. **Pencil editor could break on complex markup** → editor reads the schema's `editable_fields` list generically; it never assumes or parses design-specific markup.
7. **Client-side lazy loading could cause a blank/flash state** → dynamic import is resolved server-side (Next.js SSR) so the prospect-facing demo never flashes.
8. **"Unitness" customization discipline could slip under deadline pressure** → hard rule: customization for a new design always stays inside that design's own folder; the engine is never touched to accommodate one design.

## 6. Version 1.1 — Build Plan

### Phase 1 — Engine Hardening (launch-blocking)
1. **Schema contract lock**: `schema_version`, `editable_fields` (type: text/image/color), `sections` (min/max count), `image_slots` — all in one `schema.json`, single source of truth.
2. **Shared `/primitives` layer**: button, card, badge, testimonial, form-input, review-stars — every design imports, none duplicates.
3. **Pre-publish validator**: JSON Schema validation run before a design is listed; also checks every markup reference to a slot/section id actually exists in the schema.
4. **Content-bound generation**: Google API content call reads `sections[].min/max` from the schema and generates/trims/pads to match.
5. **Generic pencil editor**: reads `editable_fields` from schema, renders the right edit affordance per field `type` — no design-specific markup assumptions.
6. **SSR module resolution**: matched design module resolved server-side in Next.js; client only ever receives final rendered HTML.
7. **Trust badge system**: manual checkbox UI as source of truth; Tier 1 scrape/filter layer runs underneath when a prospect URL is provided; BBB/Yellow Pages/Facebook never auto-added.
8. **Image auto-placement**: aspect-ratio + `face-api.js` detection, rule-based slotting, niche stock-library fallback, optional swap-icon correction.
9. **Design onboarding SOP** (personal checklist for every new design): build with `/primitives` only → write schema → run validator → confirm content-gen output fits section counts → confirm image slots fill correctly with test images → test-render end-to-end → publish.

### Phase 2 — Business Layer
- **Niche-first launch**: ship with 1–2 niches only (pest control + HVAC) rather than all home-service niches at once — faster trust/badge/content library buildout, tighter community to market into.
- **Freemium tier**: Free = limited demos/month + small "Built with [ToolName]" attribution footer. Paid = attribution removed, full design library, custom domain export.
- **Shareable public demo link as the core deliverable** — not a downloadable file; this link is the actual outreach asset an agency sends to a prospect.
- **Analytics as a paid upsell** *(flagged — needs minor spend)*: track demo link opens / time-on-page. Vercel Analytics or PostHog free tier covers early volume at near-zero cost; build after MVP, not as part of it.

### Phase 3 — Viral Loop
- **Free-tier attribution badge**: watermark/link on every free demo — visible to the prospect and anyone else who sees the site.
- **Before/after export image**: one-click side-by-side of the prospect's old site vs. the new demo, for agencies to post to their own portfolio/social — carries tool credit along with it.
- **Referral loop**: agency refers agency → both get a free premium design credit or a free month.
- **Public showcase gallery**: opt-in gallery of best demo sites (dummy data), filterable by niche — social proof for new visitors, exposure incentive for featured users.

## 7. Rules to Never Break
- Engine code never hardcodes a specific design ID or contains design-specific branching.
- Every design is self-contained in its own folder; customization never touches an engine file.
- Trust badges are never auto-added without either a live signal from the prospect's own site or explicit manual confirmation.
- The schema is the single source of truth for editable fields, section counts, and image slots — never duplicated into a second contract.
