# Formatiq — Project Plan

**Working name:** Formatiq (domain: `formatiq.tools`)
**Concept:** A free, ad-supported directory of 100+ browser-based developer/utility tools — formatters, converters, validators, generators — modeled on codebeautify.org.
**Goal:** Build organic search traffic at scale, monetize via display ads.
**Stack:** Next.js + React, client-side tool logic, statically generated pages.
**Dev workflow:** VS Code + Claude Code, running the Claudify operating system (core + SEO-specialist add-on).

This file is the onboarding brief for a fresh Claude Code session. Read this first, then run `/onboard` once the repo has a skeleton in place.

---

## 1. Product Summary

Formatiq is a single Next.js app that hosts many independent, single-purpose tools (JSON formatter, Base64 converter, UUID generator, etc.), each on its own URL, each pre-rendered for SEO, each running entirely client-side. No user accounts, no backend compute per request — this keeps hosting cheap at scale and matches the "your data never leaves your browser" privacy pitch users expect from this category of site.

Revenue comes from display ads (AdSense to start, upgrade to Ezoic/Mediavine once traffic qualifies). Success is measured in organic sessions and pages/session, not conversions — so SEO depth and internal linking matter more than polish on any single tool.

---

## 2. Architecture

### 2.1 Tool registry pattern

Do **not** hand-build 100+ one-off pages. Instead:

- A central **tool registry** — a typed array (e.g. `lib/tools/registry.ts`) — defines every tool: `slug`, `category`, `title`, `metaDescription`, `keywords`, `icon`, and a reference to the React component implementing it.
- One dynamic route: `app/tools/[category]/[slug]/page.tsx`, driven entirely by the registry.
- A shared `<ToolLayout>` component provides the consistent shell: input panel, output panel, action buttons (copy/download/clear), ad slots, "related tools" rail, and an SEO content block (description + FAQ).
- Category index pages (`/tools/json`, `/tools/converters`, etc.) auto-generate from the registry and link to every tool in that category — this is the internal-linking backbone for SEO.

### 2.2 Client-side execution

All formatting/converting/validating logic runs in the browser. Useful libraries:

- `js-beautify` — HTML/CSS/JS beautification
- `json5` / native `JSON` — JSON parsing, formatting, validation
- `xml-js` — XML parsing/conversion
- `papaparse` — CSV parsing
- `crypto-js` — hashing, Base64, encoding
- `sql-formatter` — SQL beautification
- `uuid` — UUID generation
- `js-yaml` — YAML conversion

No server compute per tool use. Server-side only for page rendering (SSG/ISR) and ad delivery.

### 2.3 Rendering strategy

- Static Generation (SSG) or Incremental Static Regeneration (ISR) for every tool and category page — this is non-negotiable for SEO and load speed at this scale.
- Only genuinely dynamic elements (ad units, "related tools" shuffling, live tool state) run client-side after hydration.

---

## 3. Tool Taxonomy (MVP target: 100+)

Organize the registry into these categories. Numbers are starting points — expand via variations (e.g. every color-format pair) once the pattern is proven.

| Category | Example tools |
|---|---|
| **Formatters/Beautifiers** | JSON, XML, HTML, CSS, JS, SQL, YAML |
| **Minifiers** | HTML, CSS, JS, JSON |
| **Converters** | JSON↔XML, JSON↔CSV, JSON↔YAML, CSV↔Excel, Base64↔Image, HEX↔RGB↔HSL, Markdown↔HTML, Timestamp↔Date, Number↔Words, CSV↔JSON |
| **Validators** | JSON, XML, HTML, Email regex, URL, Credit card (Luhn), Cron expression |
| **Encoders/Decoders** | Base64, URL, HTML entities, JWT decoder, Hash generators (MD5/SHA) |
| **Generators** | UUID, Lorem Ipsum, QR code, Password, Random number, Slug generator |
| **Text tools** | Case converter, word/char counter, diff checker, text sorter, whitespace remover |
| **Calculators/misc** | Age calculator, percentage calculator, unit converter, color picker |

**Build order for tools:** ship 3–4 end-to-end first (to validate the registry + layout pattern), then batch-produce in groups of ~10, auditor-gated per batch (see Section 5).

---

## 4. SEO Strategy

Formatiq's entire growth model depends on long-tail search, not brand recognition — this is where the `claudify-seo-specialist` pack does the real work.

- **Before writing code:** run `/topical-map` to plan the full category → tool URL hierarchy, so routing and internal linking are correct from day one. Retrofitting URL structure later kills SEO equity.
- **Per tool/category:** run `/keyword-research` to nail title tags, H1s, and the "what is a JSON formatter" style intro content that ranks long-tail queries.
- **Every tool page needs unique content**, not just the widget:
  - 150–300 words explaining what the tool does and when to use it
  - An FAQ block marked up with `FAQPage` schema.org structured data
  - `SoftwareApplication` / `WebApplication` structured data
- **Post-launch, ongoing:**
  - `/content-score` and `/content-refresh` to find and fix underperforming pages once analytics exist
  - `/rank-check` and `/backlink-scan` for regular monitoring

**The #1 risk for a site this size:** duplicate/thin content across pages. Programmatic SEO sites get penalized hard for templated pages that don't differ meaningfully. The auditor agent should treat "does this page have genuinely unique content?" as a hard gate before any tool page is marked done.

---

## 5. Claudify Workflow

### Day-to-day loop
```
Morning:    /start → work → /sync (if switching tasks)
Afternoon:  work → /safe-clear (if context gets heavy) → work
Evening:    /wrap-up
```

### How the toolkits plug into this project specifically

- **Task Board** (`Task Board.md`) becomes the master list of 100+ tools to build, one checklist item per tool, grouped by the batches in Section 3.
- **`/onboard`** — run once the Next.js skeleton, registry, and `ToolLayout` exist, so Claude maps the codebase before tool-batch work begins.
- **`auditor` agent** — quality gate before any tool page is marked done. Should check:
  1. Does the tool actually work correctly (test a few inputs)?
  2. Does the page have unique, non-templated content (not just copy-pasted boilerplate)?
  3. Is structured data present and valid?
  4. Does it follow the shared `ToolLayout` pattern (no one-off deviations)?
- **`/safe-clear`** — used between tool batches, since repetitive scaffolding work eats context fast; keep sessions clean between groups of ~10 tools.
- **`seo-agent` / `keyword-strategist` / `content-optimizer`** — invoked per batch, before marking tools "done," to make sure each page's content and metadata are actually optimized, not placeholder text.
- **`link-builder`** — later-stage, once the site has enough live pages to be worth external outreach for.

---

## 6. Monetization

- **Ad network:** Google AdSense at launch; evaluate Ezoic/Mediavine once traffic thresholds are met.
- **Placement:** above-the-fold banner, sidebar, and one unit between tool output and the SEO content block. Keep the tool UI itself uncluttered — retention depends on the tool being pleasant to use, not on ad density.
- **Performance discipline:** lazy-load ad scripts, monitor Core Web Vitals — slow pages hurt both ad revenue and SEO ranking simultaneously, so this is a double-cost mistake if ignored.
- **`ads.txt`** configured correctly from day one.
- Because revenue is pageview-driven, the "related tools" rail and category hub pages exist as much for engagement/pages-per-session as for SEO — don't treat them as an afterthought.

---

## 7. Build Order (Recommended Sequence)

1. **Scaffold**: Next.js app, tool registry structure, `ToolLayout` component, 3–4 real tools built end-to-end (e.g. JSON formatter, Base64 encoder, UUID generator, word counter) to validate the pattern.
2. **Plan SEO structure**: run `/topical-map` + `/keyword-research` to lock the full taxonomy and URL scheme before scaling up.
3. **Batch production**: build tools in groups of ~10, auditor-gated per batch for correctness + unique content + structured data.
4. **Monetize**: once ~20–30 tools are live and indexable, wire up AdSense, `ads.txt`, and analytics.
5. **Iterate**: post-launch, use `/content-refresh` and `/rank-check` on a regular cadence to find and fix underperforming pages, and expand the taxonomy toward 100+.

---

## 8. Open Decisions / Next Steps

- [ ] Confirm final domain registration (`formatiq.tools`) and set up hosting (Vercel is the natural fit for Next.js SSG/ISR).
- [ ] Run trademark sanity check on "Formatiq" beyond web search (e.g. USPTO TESS or local equivalent).
- [ ] Decide on analytics stack (Plausible/GA4) before the first tool batch, so early SEO data isn't lost.
- [ ] Set up `.claude/` from the Claudify + SEO-specialist zips in the actual repo, then run the onboarding prompt from `SETUP.md`.
- [ ] Lock the initial 3–4 MVP tools for the scaffold phase.
