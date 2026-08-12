---
name: formatiq-linking-model
description: formatiq.tools has no CMS — all tool page prose (and thus internal link insertion points) lives in lib/tools/registry.ts per-tool fields
metadata:
  type: project
---

formatiq.tools is a Next.js static-export site, 104 tool pages at `/tools/{category}/{slug}` via `app/tools/[category]/[slug]/page.tsx` + shared `components/ToolLayout.tsx`. There is no markdown/CMS body content — every tool's prose (`longDescription`, `useCase`, `howItWorks`, `benefits`, `faqs`) lives directly in `lib/tools/registry.ts`. "Related tools" section and bottom CTA banner are auto-generated from registry data, not hand-authored.

**Why:** Relevant every time an internal linking pass or content rewrite touches this domain — "content" here means editing TypeScript object fields in one large registry file, not separate content files.

**How to apply:** For internal linking recommendations on this site, always specify the exact registry.ts field (longDescription/useCase/faqs/etc.) and approximate line/tool the insertion targets, since there's no other place for contextual in-content links to live. See related limitation: [[getrelatedtools-limitation]]. Full keyword map for this site: `.claude/agent-memory/seo/keyword-maps/formatiq-tools.md`.
