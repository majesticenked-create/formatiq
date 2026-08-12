---
name: getrelatedtools-limitation
description: getRelatedTools() in lib/tools/registry.ts only matches same category, blocking cross-category internal links (e.g. JSON tool cluster spans formatters/validators/converters/text-tools)
metadata:
  type: project
---

`getRelatedTools()` at `lib/tools/registry.ts:6765` filters strictly by `tool.category === t.category`, sliced to first 4 array-order matches — no keyword/topic relevance scoring, no cross-category linking.

**Why:** Discovered during Internal Linking Pass (2026-08-13, see [[formatiq-linking-model]]) that the 7-tool JSON cluster (json-formatter, json-repair, json-validator, json-diff-checker, json-tree-viewer, json-yaml-converter, json-to-csv) spans 3+ categories (formatters, validators, converters, text-tools), so the auto-generated "Related tools" section never surfaces these to each other despite them being the most relevant cross-links on the site. Same issue affects the privacy/trust cluster (aes-encrypt-decrypt, iban-validator, totp-generator, jwt-decoder, wordpress-password-hash-generator, credit-card-validator) across encoders-decoders/validators/generators.

**How to apply:** When doing future internal linking passes on formatiq.tools, don't rely on the auto-generated Related Tools section for cross-category topical clusters — recommend manual in-content links (registry.ts prose fields) instead. Nominate to knowledge-base.md if this pattern blocks a second linking pass (engineering fix: add a manual `relatedSlugs` override field or keyword-overlap matching to `getRelatedTools()`).
