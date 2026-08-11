# Memory

## Now
- Formatiq tool site (Next.js). 104 registered tools / 119 static pages, build and tests clean (369 tests).
- No active task in flight — awaiting next direction.

## Open Threads
- (none)

## Recent Decisions
- 08/11/26: When resuming with a stale/empty memory.md, verify `npm run build` + `npm run test` before acting on "continue" — this project has had significant unlogged work across sessions.
- 08/11/26: If a new component Write would duplicate an already-registered tool, treat the existing registered version as authoritative and restore it rather than keep the overwrite (duplicate imports/slugs break the build immediately — reliable tripwire).
- 08/11/26: `lib/tools/registry.ts` imports every tool component, so testing it with vitest requires JSX transform + `@/` alias support (vite 8 uses `oxc`, not `esbuild`, for jsx — set via `oxc: { jsx: 'automatic' }` in vitest.config.mts, not the `esbuild` key).
- 08/11/26: `.claude/backups/` and `.next-stale-*` are local noise, not source — added to `.gitignore`, excluded from the first real commit since scaffold (`c828dea`).
- 08/11/26: For a barcode/QR-style tool, ask before hand-rolling symbol/checksum tables from scratch — a small transcription error produces output that looks plausible but silently fails to scan/decode, and can't be verified without real hardware. Used `jsbarcode` for `barcode-generator`, matching the `qrcode` precedent from `qr-code-generator.tsx`.
- 08/11/26: Before building a new "fake data" generator, check whether an existing tool (e.g. `fake-data-generator.tsx`) already covers the field — if so, build the new one as a more focused/detailed standalone (e.g. `random-address-generator.tsx`'s region-aware, multi-line addresses vs. the single-line US-only field on the existing tool) and state the distinction directly in its longDescription, rather than duplicating.
- 08/11/26: For a hash algorithm needing MD5 (e.g. WordPress phpass `$P$` hashes) — `crypto.subtle` doesn't support MD5, but `hash-generator.tsx` already has a from-scratch MD5 implementation verified against known RFC test vectors in `__tests__/tools/encoders-decoders.test.ts`; reuse that algorithm (adapted to return raw bytes) rather than re-deriving it, and self-verify generated hashes by round-tripping through the corresponding check function before showing them.

## Blockers
- (none)
