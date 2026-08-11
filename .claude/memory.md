# Memory

## Now
- Formatiq tool site (Next.js). Just finished building 6 new tools; site is at 86 registered tools / 101 static pages, build and tests clean.
- No active task in flight — awaiting next direction.

## Open Threads
- Large batch of work (~50 tool components, new marketing pages, expanded registry, new test suite) is fully uncommitted since the initial scaffold commit (`c828dea`). Needs a decision on committing.
- Pending SOP (08/06/26, still unapproved): add an automated test asserting `longDescription` >= 40 words for every `tools[]` entry — has silently regressed before with no enforcement.

## Recent Decisions
- 08/11/26: When resuming with a stale/empty memory.md, verify `npm run build` + `npm run test` before acting on "continue" — this project has had significant unlogged work across sessions.
- 08/11/26: If a new component Write would duplicate an already-registered tool, treat the existing registered version as authoritative and restore it rather than keep the overwrite (duplicate imports/slugs break the build immediately — reliable tripwire).

## Blockers
- (none)
