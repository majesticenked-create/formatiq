# Formatiq — Starter Repo

A working Next.js scaffold for the Formatiq developer-tools site, with the Claudify + SEO-specialist Claude Code toolkits already merged into `.claude/`. See `PROJECT_PLAN.md` for the full brief.

## What's already built

- **Tool registry pattern** (`lib/tools/registry.ts`) — the single source of truth driving all tool routing, SEO metadata, and structured data. Add a tool by writing a component + one registry entry; the routes pick it up automatically.
- **4 fully working tools**, built end-to-end to validate the pattern:
  - JSON Formatter & Validator (`/tools/formatters/json-formatter`)
  - Base64 Encoder & Decoder (`/tools/encoders-decoders/base64-encoder-decoder`)
  - UUID Generator (`/tools/generators/uuid-generator`)
  - Word & Character Counter (`/tools/text-tools/word-counter`)
- **Shared `ToolLayout`** — breadcrumb, ad slot placeholders, SEO content block, FAQ with `FAQPage`/`WebApplication` structured data, related-tools rail.
- **Category hub pages** (`/tools/[category]`), auto-generated from the registry.
- **Homepage** with a live animated JSON-formatting demo as the visual signature.
- **Design tokens** in `app/globals.css` — ink-navy background, amber accent, Space Grotesk / Inter / JetBrains Mono type system.
- Production build verified (`npm run build`) — 14 static pages generate cleanly.

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
```

To verify a production build (recommended before deploying):

```bash
npm run build
npm start
```

## Using Claude Code on this repo

The `.claude/` directory has the merged Claudify core (9 agents, 21 commands, hooks, the full skill library) plus the SEO-specialist add-on (4 more agents, 8 more commands, SEO skill pack). Open this folder in VS Code, run `claude`, and:

1. Read `CLAUDE.md` and `PROJECT_PLAN.md` first — they explain the architecture and workflow.
2. Run `/onboard` to have Claude map the existing codebase (registry, ToolLayout, the 4 sample tools).
3. Use `Task Board.md` to track the next batch of tools to build (see `PROJECT_PLAN.md` §3 for the taxonomy and §7 for build order).
4. Run `/topical-map` and `/keyword-research` before scaling past the MVP tools — see `PROJECT_PLAN.md` §4.
5. Day-to-day loop: `/start` → work → `/sync` / `/safe-clear` as needed → `/wrap-up`.

## Adding a new tool

1. Create `components/tools/YourTool.tsx` (client component, follow the existing 4 as a pattern).
2. Add an entry to `lib/tools/registry.ts` — category, slug, title, descriptions, keywords, FAQs, and the component reference.
3. Add unique SEO content in the `longDescription` and `faqs` fields — this is required, not optional (see PROJECT_PLAN.md §4 on thin-content risk).
4. Add a test entry (see **Testing** below) covering the tool's core logic.
5. That's it — `/tools/[category]/[slug]` and the category hub both pick it up automatically.

## Testing

Tool logic is tested with [Vitest](https://vitest.dev). Tests live in `__tests__/tools/`, one file per tool category (`formatters.test.ts`, `converters.test.ts`, etc.), matching the categories in `lib/tools/registry.ts`.

```bash
npm run test       # run the full suite once
```

Most tools keep their core logic directly in the component file rather than exporting it separately. When adding a test for a new tool:

- **If the logic is easy to extract**, pull the pure function(s) out into the component so they can be imported directly by the test.
- **Otherwise**, copy the pure logic verbatim into the relevant `__tests__/tools/*.test.ts` file (matching its category) rather than modifying the component — this is the pattern used throughout the existing suite, chosen to avoid risking working components for the sake of testability.

For each tool, cover:
- A known-good valid input, asserting the expected correct output.
- A known-bad/invalid input, asserting it returns an error state rather than crashing or silently failing.
- One edge case specific to the tool (empty input, a boundary value, a malformed-but-not-empty case, etc.).

Logic that depends on browser-only APIs unavailable in Node (Canvas, `FileReader`, `DOMParser`, `<iframe>`/`postMessage`) can't be exercised by this suite — note that in a comment near the test and verify those tools manually in a browser instead.

## Deployment

This is a standard Next.js app — Vercel is the path of least resistance for SSG/ISR hosting. Point Vercel at this repo, no special config needed beyond the default Next.js preset.
