# Auditor Memory

## Known Patterns
- registry.ts metaDescription inconsistency: 6/51 tools (percentage-calculator, unit-converter, random-number-generator, whitespace-remover, age-calculator, bmi-calculator) omit the site-standard "no data leaves your browser / client-side" phrase used by the other 45 entries. | first seen: 080626 | count: 1

## Resolved Patterns
- json-formatter longDescription was previously under 40 words; now 50 words — fixed. | resolved: 080626 (confirmed during this audit)
- registry.ts longDescription under 40-word minimum (base64-encoder-decoder, uuid-generator, word-counter) — fixed same day, now 117/130/130 words. Promoted stale Hard Rule entry in knowledge-base.md to reflect fix. | resolved: 080626
- FAQ content templated near-identically across json-formatter, json-to-csv, url-encoder-decoder — rewritten with tool-specific examples; rule promoted to knowledge-base.md (Project Patterns) per user override 080626. | resolved: 080626
- RandomNumberGenerator.tsx Min/Max inputs missing NaN guard (Number() with no fallback) unlike Count field — fixed with `|| 0`; rule promoted to knowledge-base.md (Known Failure Modes) per user override 080626. | resolved: 080626

## SOP Revisions Proposed
- Add automated word-count check (>=40 words) for every tools[] longDescription, run in CI/pre-commit rather than relying on manual audit: [status: pending] | 080626

## Regression Watch List
- registry.ts metaDescription missing browser/client-side phrase (6 tools): [originally fixed: n/a, new finding] | last checked: 080626
- registry.ts longDescription <40 words (base64-encoder-decoder, uuid-generator, word-counter): [originally fixed: 080626] | last checked: 080626 — watch for regression in future edits since no automated check exists yet
