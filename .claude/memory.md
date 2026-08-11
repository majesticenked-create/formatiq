# Memory

## Now
- Formatiq tool site (Next.js). 92 registered tools / 107 static pages, build and tests clean (345 tests).
- No active task in flight — awaiting next direction.

## Open Threads
- (none)

## Recent Decisions
- 08/11/26: When resuming with a stale/empty memory.md, verify `npm run build` + `npm run test` before acting on "continue" — this project has had significant unlogged work across sessions.
- 08/11/26: If a new component Write would duplicate an already-registered tool, treat the existing registered version as authoritative and restore it rather than keep the overwrite (duplicate imports/slugs break the build immediately — reliable tripwire).
- 08/11/26: `lib/tools/registry.ts` imports every tool component, so testing it with vitest requires JSX transform + `@/` alias support (vite 8 uses `oxc`, not `esbuild`, for jsx — set via `oxc: { jsx: 'automatic' }` in vitest.config.mts, not the `esbuild` key).
- 08/11/26: `.claude/backups/` and `.next-stale-*` are local noise, not source — added to `.gitignore`, excluded from the first real commit since scaffold (`c828dea`).

## Blockers
- (none)
