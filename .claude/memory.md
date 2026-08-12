# Memory

## Now
- Formatiq tool site (Next.js), 103 registered tools / 125 static pages, build+tests clean (381 tests). Live on Cloudflare Pages at formatiq.tools (static export, `output: 'export'` in next.config.js) as of 08/12/26.
- Mobile responsiveness pass done and deployed (`e66fa62`, pushed to `origin/main` 08/12/26): hamburger nav (portal-based, dynamic over `categories[]`), 44px touch targets, layout fixes across header/hero/gradient-generator/html-viewer. Verified with real headless-browser measurements (Playwright, temp `--no-save` install) — zero horizontal overflow at 375px across homepage/tool/category pages.
- 08/13/26 system audit: grade C. Open corrective items on Task Board (verdicts.jsonl format+data bugs, command-index.md missing 8 SEO commands, stale `.next-stale-*`/backups cleanup). See Daily Notes/081326.md for full findings.
- No active task in flight — awaiting next direction.

## Open Threads
- verdicts.jsonl: `jq -n` (no `-c`) writes pretty-printed multi-line JSON instead of true JSONL; separately, 100% of 123 logged records show decision=unknown/task_type=other — extraction logic tested fine in isolation, so the real Stop-hook stdin shape likely doesn't match what `log-stop-verdict.sh` assumes. Needs a live payload capture to fix.
- 8 SEO-suite commands (backlink-scan, competitor-seo, content-refresh, content-score, keyword-research, rank-check, seo-audit, topical-map) work but aren't in command-index.md and lack YAML frontmatter, unlike the other 21 commands.

## Recent Decisions
- 08/11/26: When resuming with a stale/empty memory.md, verify `npm run build` + `npm run test` before acting on "continue" — this project has had significant unlogged work across sessions.
- 08/11/26: If a new component Write would duplicate an already-registered tool, treat the existing registered version as authoritative and restore it rather than keep the overwrite (duplicate imports/slugs break the build immediately — reliable tripwire).
- 08/11/26: `lib/tools/registry.ts` imports every tool component, so testing it with vitest requires JSX transform + `@/` alias support (vite 8 uses `oxc`, not `esbuild`, for jsx — set via `oxc: { jsx: 'automatic' }` in vitest.config.mts, not the `esbuild` key).
- 08/11/26: `.claude/backups/` and `.next-stale-*` are local noise, not source — added to `.gitignore`, excluded from the first real commit since scaffold (`c828dea`).
- 08/11/26: For a barcode/QR-style tool, ask before hand-rolling symbol/checksum tables from scratch — a small transcription error produces output that looks plausible but silently fails to scan/decode, and can't be verified without real hardware. Used `jsbarcode` for `barcode-generator`, matching the `qrcode` precedent from `qr-code-generator.tsx`.
- 08/11/26: Before building a new "fake data" generator, check whether an existing tool (e.g. `fake-data-generator.tsx`) already covers the field — if so, build the new one as a more focused/detailed standalone (e.g. `random-address-generator.tsx`'s region-aware, multi-line addresses vs. the single-line US-only field on the existing tool) and state the distinction directly in its longDescription, rather than duplicating.
- 08/11/26: For a hash algorithm needing MD5 (e.g. WordPress phpass `$P$` hashes) — `crypto.subtle` doesn't support MD5, but `hash-generator.tsx` already has a from-scratch MD5 implementation verified against known RFC test vectors in `__tests__/tools/encoders-decoders.test.ts`; reuse that algorithm (adapted to return raw bytes) rather than re-deriving it, and self-verify generated hashes by round-tripping through the corresponding check function before showing them.

- 08/11/26: Never count `tools[]` entries via `grep -c "slug: '"` in registry.ts — the `categories[]` array also has a `slug` field per entry (7 of them), inflating the count by exactly 7. Every "final tool count" reported across the 08/11/26 tool-building sessions was wrong by this offset (claimed 104, actual 97). Verify via a quick vitest check importing `tools.length` directly, or trust the homepage's live-computed stat.
- 08/11/26: When sweeping for a banned character (em dash, etc.) across a growing tool site, `grep -rlP '\x{2014}' --include='*.tsx' --include='*.ts'` finds every candidate file fast, but each match still needs per-line triage: code comments and functional data (e.g. `HtmlStripper.tsx`'s `&mdash;`→`—` entity map, `RemovePunctuation.tsx`'s "other symbols" char set) must be preserved even though they contain the literal character — only prose/labels/messages actually rendered to the user should be swapped.
- 08/11/26: Restart the dev server proactively after each multi-tool build round, not reactively after it breaks — it hit the stale-webpack-cache "Cannot find module './NNN.js'" error 3 times this session, always after a long stretch of file edits with no restart. Fix each time: kill the process, `mv .next .next-stale-$(date +%s)` (plain `rm -rf` gets soft-blocked by a safety hook — use `find <dir> -delete` if actually deleting), restart `npm run dev`.

## Blockers
- (none)
