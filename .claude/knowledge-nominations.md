# Knowledge Nominations

Candidate learnings from agents and sessions. The auditor reviews these
during each audit cycle and promotes valid ones to knowledge-base.md.

## Pending Nominations
- [081326] Platform: `backdrop-filter` on an ancestor element creates a new containing block for any `position: fixed` descendant — same rule as `filter`/`transform`/`perspective`. A fixed-position overlay nested inside an element with `backdrop-filter` (e.g. `.site-header`'s scroll-blur effect) does not position relative to the viewport; it gets trapped relative to that ancestor's box instead. Fix: render the overlay via a portal (`createPortal` into `document.body`) rather than as a normal DOM child. Confirmed empirically in `components/MobileNav.tsx` (comment at lines 60-63) after two consecutive "mobile menu is positioned wrong" bug reports traced back to this exact cause. Source: T2 audit of mobile-responsiveness commit `e66fa62`, 081326.

## Promotion Log
- [080626] Two learnings promoted directly to knowledge-base.md per explicit user override (bypassing normal pending-review cycle): (1) FAQ content must be tool-specific, not templated — under Project Patterns; (2) numeric inputs feeding array/range generation must guard against NaN — under Known Failure Modes. Source of both: today's T2 audit of lib/tools/registry.ts + components/tools/.
