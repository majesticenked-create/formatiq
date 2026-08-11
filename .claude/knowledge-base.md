# Knowledge Base

System-wide learned rules. Read by ALL agents and sessions at startup.
Written ONLY by the auditor after confirming learnings.
Entries are mandatory constraints, not suggestions.

## Provenance Hierarchy
Every entry MUST cite its source using one of:
- `[Source: user override MMDDYY]` — User explicitly corrected something
- `[Source: empirical MMDDYY]` — Verified through testing or data
- `[Source: agent inference MMDDYY]` — Pattern observed by an agent, confirmed by auditor

## Hard Rules
- [080626] Content: Every `tools[]` entry in `lib/tools/registry.ts` must have a `longDescription` of at least ~40 words. Previously 3 of 51 entries (base64-encoder-decoder, uuid-generator, word-counter) violated this; fixed later same day (now 117/130/130 words respectively) — no known violations remain as of 080626. Length check is still not automated; treat as a recurring risk until it is. [Source: empirical 080626 — auditor T2 review, word-count script over all 51 entries]

## Platform & Tool Rules
- (none yet)

## Project Patterns
- [080626] Content: FAQ content must be tool-specific, not templated across tools even when the underlying fact is shared. json-formatter, json-to-csv, and url-encoder-decoder all reused a near-identical FAQ template ("Is my [X] data uploaded anywhere? No. This tool runs entirely in your browser...") with only the noun swapped. Fixed by rewriting each with a genuinely tool-specific example (API responses/config files for json-formatter, spreadsheet exports of customer/order data for json-to-csv, query strings carrying session tokens/API keys for url-encoder-decoder). When writing FAQ content for new tools, use an example scenario specific to that tool's actual use case — do not reuse another tool's FAQ text with only the noun changed. [Source: user override 080626]

## Known Failure Modes
- [080626] Content: Numeric inputs feeding into array/range generation must guard against NaN before use, regardless of `type="number"`. RandomNumberGenerator.tsx's Min/Max inputs called `Number(e.target.value)` with no NaN guard (unlike the adjacent Count field, which already had `|| 1`), so an empty/invalid intermediate value could become NaN and propagate into `Array.from({length: NaN})`, producing a silent empty result with no error shown. Fixed by adding `|| 0` fallback to Min and Max onChange handlers, matching Count. General rule: HTML5 `type="number"` does not guarantee a parseable value in all browsers/intermediate states — any `Number()`/`parseInt()`/`parseFloat()` call feeding into `Array.from({length: ...})` or similar array/loop-bound logic must be validated (regex pre-check, `|| <default>` fallback, or explicit `Number.isNaN`/`Number.isFinite` check) before use. [Source: user override 080626]
