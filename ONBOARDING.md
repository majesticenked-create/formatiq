# Onboarding Guide — Formatiq

## Quick Facts
- **Language:** TypeScript / **Framework:** Next.js 14 (App Router)
- **Architecture:** Registry-driven static site — one dynamic route + shared layout serves all tool pages
- **Dependencies:** 6 direct (js-beautify, js-yaml, uuid, react, react-dom, next)
- **Test framework:** none configured yet
- **Build tool:** Next.js built-in (`next build`, SSG)
- **Repo state:** not a git repository yet (no `.git`) — no commit history to mine

## Project Structure
```
app/
  layout.tsx                     — root layout
  page.tsx                       — homepage (animated JSON demo)
  globals.css                    — design tokens (ink-navy/amber/Space Grotesk-Inter-JetBrains Mono)
  tools/[category]/page.tsx      — category hub, auto-generated from registry
  tools/[category]/[slug]/page.tsx — single tool page, driven entirely by registry
components/
  ToolLayout.tsx                 — shared shell: breadcrumb, ad slots, SEO block, FAQ, related-tools
  AdSlot.tsx, Header.tsx, Footer.tsx, HeroDemo.tsx, RelatedTools.tsx
  tools/                         — one component per tool (JsonFormatter, Base64Tool, UuidGenerator, WordCounter)
lib/tools/
  types.ts                       — ToolDefinition / CategoryDefinition interfaces
  registry.ts                    — single source of truth: all tools + categories + lookup helpers
.claude/                         — Claudify core + SEO-specialist agent/command/skill pack
```

## Key Files to Read First
1. **`lib/tools/registry.ts`** — every tool page, category hub, and metadata block derives from this array. Adding a tool means adding one entry here.
2. **`lib/tools/types.ts`** — the `ToolDefinition` contract (title, descriptions, keywords, faqs, `Component` reference) every registry entry must satisfy.
3. **`components/ToolLayout.tsx`** — the shared shell every tool page renders inside: breadcrumb, ad slot, SEO content block, FAQ (with `WebApplication`/`FAQPage` JSON-LD), related-tools rail.
4. **`app/tools/[category]/[slug]/page.tsx`** — the single dynamic route serving all tool pages; `generateStaticParams` comes straight from `tools` in the registry.
5. **`components/tools/JsonFormatter.tsx`** — reference implementation of the tool-component pattern (client component, local state, `panels`/`panel-bar`/`icon-btn` CSS classes already defined in `globals.css`).

## Architecture Overview
Formatiq is a single Next.js app hosting 100+ planned independent, client-side developer tools, each pre-rendered for SEO via SSG. The core design decision is the **registry pattern**: instead of hand-building pages, `lib/tools/registry.ts` holds a typed array of `ToolDefinition` objects (slug, category, title, SEO copy, FAQs, and a component reference). One dynamic route (`app/tools/[category]/[slug]/page.tsx`) and one category-hub route read from this array to generate every page and their static params — so adding a tool never touches routing code.

`ToolLayout` wraps every tool's interactive component with the shared page shell (breadcrumb, ad slot, "About this tool" SEO copy, FAQ with structured data, related-tools rail pulled from the same category). This guarantees every tool page — regardless of who builds it or when — has consistent structure and required SEO surface area (unique long-form description + FAQPage/WebApplication JSON-LD), which the project plan flags as the #1 risk area (thin/duplicate content across a programmatic-SEO site).

Tool components themselves (`components/tools/*.tsx`) are plain client components (`'use client'`) with local `useState`/`useMemo` — no shared state management, no server calls. All logic (JSON parsing, Base64 encode/decode, UUID gen, word counting) runs in the browser, matching the "your data never leaves your browser" privacy pitch.

## Code Patterns
- **Naming:** camelCase for functions/variables, PascalCase for components, kebab-case for tool/category slugs and file routes.
- **Error handling:** try/catch around parsing (`JSON.parse`), returning a discriminated `{ ok: true/false }` result object rather than throwing — see `tryFormat` in `JsonFormatter.tsx`.
- **State:** local component state only (`useState`/`useMemo`); no global store, no context providers observed yet.
- **Styling:** hand-rolled CSS classes in `app/globals.css` (`.panel`, `.panel-bar`, `.icon-btn`, `.status-line`, `.control-row`) reused across tool components — no CSS-in-JS or Tailwind.
- **Auth:** none — no accounts, no backend compute per request by design.

## Environment Setup
1. `npm install`
2. `npm run dev` — starts at http://localhost:3000
3. Before shipping/deploying: `npm run build && npm start` to verify the static build (14 pages currently generate cleanly)

## First Tasks to Tackle
1. **Build the 5th tool** (e.g. an XML/HTML formatter under `formatters`, or URL encoder under `encoders-decoders`): add `components/tools/YourTool.tsx` following `JsonFormatter.tsx`'s pattern, then one entry in `lib/tools/registry.ts` — validates you understand the registry contract end-to-end.
2. **Run `/topical-map` and `/keyword-research`** (per `PROJECT_PLAN.md` §4) before batch-producing more tools — URL structure and taxonomy should be locked first since retrofitting kills SEO equity.
3. **Initialize git** — the repo currently has no `.git`; version history and the archaeologist/pr-ghostwriter agents need this to be useful.
4. **Populate `Task Board.md`** with the tool taxonomy from `PROJECT_PLAN.md` §3 (one checklist item per tool, grouped by category) so `/start`/`/sync` have real work to track.

## Watch Out For
- **No git repo yet** — `git log`, `git blame`-dependent agents (archaeologist, pr-ghostwriter) and the Claudify audit trail won't have history to work from until `git init` + first commit happens.
- **Thin/duplicate content risk is explicit and called out in `PROJECT_PLAN.md`** — every new `ToolDefinition.longDescription`/`faqs` must be genuinely unique per tool, not templated boilerplate; the auditor agent is expected to gate on this before marking a tool page "done."
- **No test framework configured** — correctness for new tools currently relies on manual verification of a few inputs (per the auditor checklist in `PROJECT_PLAN.md` §5), not automated tests.
- **`Component` field in `ToolDefinition` is a direct React component reference**, not a lazy import — all tool components currently load eagerly via `registry.ts`'s top-level imports; watch bundle size as the tool count grows toward 100+.

---
Generated: 2026-08-04
