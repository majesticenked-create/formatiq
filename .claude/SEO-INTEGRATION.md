# Integration Guide — Claudify SEO Specialist

This guide covers two scenarios: adding the SEO Specialist to an existing Claudify setup, and installing it as a standalone system.

---

## Scenario A: You already have Claudify installed

The SEO Specialist slots into your existing Claudify setup. Nothing you have gets deleted or overwritten — you're just adding new files alongside what's already there.

### Step 1: Copy the SEO Specialist files into your project

**What you're doing:** Taking files from the zip you downloaded and placing them inside your project's `.claude/` folder. That's it.

**Before you start:** Open the zip file. Inside you'll see a folder called `seo-specialist/`. Open that, then open `.claude/` inside it. That's where everything you need to copy lives.

Now open your own project in Finder or your file explorer and navigate to `.claude/` inside it.

> Note: `.claude/` is a hidden folder. On Mac, press `Cmd + Shift + .` in Finder to show hidden files. In VS Code or Cursor it shows normally in the sidebar.

**Copy these folders across** (drag them from the zip into your `.claude/` folder):

- `agents/seo-agent.md`
- `agents/content-optimizer.md`
- `agents/keyword-strategist.md`
- `agents/link-builder.md`
- `commands/seo-audit.md`
- `commands/keyword-research.md`
- `commands/content-score.md`
- `commands/rank-check.md`
- `commands/competitor-seo.md`
- `commands/backlink-scan.md`
- `commands/content-refresh.md`
- `commands/topical-map.md`
- The entire `skills/seo/` folder
- The entire `agent-memory/seo/` folder

**Leave these behind** (do not copy them — they would overwrite your existing Claudify setup):

- `agents/auditor.md` — your existing Claudify auditor already handles this. Copying the SEO version over it would break your existing audit workflow.
- `knowledge-base.md` — handled separately in Step 2 (it needs to be merged, not replaced)
- `CLAUDE.md` — handled in Step 3

When you're done, your `.claude/agents/` folder should have your original files plus the four new ones (`seo-agent.md`, `content-optimizer.md`, `keyword-strategist.md`, `link-builder.md`). Nothing should be missing or replaced.

### Step 2: Merge the knowledge base

The SEO Specialist includes 25+ pre-seeded SEO rules. **Do not overwrite your existing `knowledge-base.md`** — append only.

1. Open `seo-specialist/.claude/knowledge-base.md`
2. Copy everything from the first SEO heading (e.g. `## SEO Rules`) to the end of the file
3. Open your existing `.claude/knowledge-base.md`
4. Scroll to the very bottom and paste the SEO content there

If you see duplicate section headers (e.g. two `## Hard Rules` sections), rename the SEO one to `## SEO Hard Rules` to avoid conflicts. The SEO agent looks for its rules by content, not section name — renaming is safe.

To verify the merge worked: open Claude Code and type `/seo-audit {your domain}`. If the SEO agent runs without errors, the rules loaded correctly.

### Step 3: Update your CLAUDE.md command list

Add the SEO commands to the Quick Start section of your existing `CLAUDE.md`:

```markdown
- Run `/seo-audit {url}` to audit a page or domain (T1 quick → T4 full strategic)
- Run `/keyword-research {topic}` to research keywords and build a keyword map
- Run `/content-score` to score content before publishing (12-dimension rubric)
- Run `/rank-check` to review ranking movements across tracked keywords
- Run `/competitor-seo {domain}` for competitor keyword and backlink analysis
- Run `/backlink-scan {domain}` for backlink audit and prospecting
- Run `/content-refresh` to find and prioritise stale content
- Run `/topical-map {domain} {topic}` to build a topical authority map
```

### Step 4: Add the SEO agents to your CLAUDE.md agents table

Add these rows to the agents table in your existing `CLAUDE.md`:

```
| `seo-agent` | Tiered audits, ranking tracking, content scoring, competitor monitoring |
| `content-optimizer` | On-page rewrites, freshness updates, cannibalization resolution |
| `keyword-strategist` | Keyword clusters, topical maps, content calendars |
| `link-builder` | Backlink prospecting, broken link building, outreach templates |
```

### Step 5: Verify

Open Claude Code in your project and run:

```
/seo-audit {your domain}
```

The SEO agent will read its memory, run a T1 audit, and return results. If it works, integration is complete.

---

## Scenario B: Installing SEO Specialist as a standalone system

The SEO Specialist works as a complete standalone system. No base Claudify required.

### Step 1: Copy the template

Copy the entire `seo-specialist/` folder to your project root. Rename it to match your project if you prefer — the internals use relative paths so renaming is safe.

### Step 2: Install into your project

Open Terminal in your project folder and run:

```bash
npx create-claudify
```

When prompted, select **SEO Specialist** as your package. This installs the `.claude/` directory, `CLAUDE.md`, hooks, and settings into your project.

**Or manually:** Copy the contents of `seo-specialist/` directly into your project root. The key items are:
- `.claude/` directory (agents, commands, skills, hooks, memory)
- `CLAUDE.md`
- `.claude/settings.json`

### Step 3: Configure your domain

Edit `CLAUDE.md` → `CLAUDE.local.md` and fill in:

```markdown
# Local Config

Primary domain: {your-domain.com}
Google Search Console: {connected / not connected}
GSC Property: {your GSC property URL if connected}
Niche / industry: {describe your site's topic}
Primary keywords: {list your 3-5 main target keywords}
Competitors: {list 2-3 competitor domains}
```

### Step 4: Start the system

Open Claude Code in your project and type:

```
/start
```

Claude reads your CLAUDE.md, initialises the SEO agent memory, and brings the system online.

### Step 5: Run your first audit

```
/seo-audit {your-domain.com}
```

---

## What each agent does

| Agent | Invoke via |
|-------|-----------|
| **seo-agent** | `/seo-audit`, `/rank-check`, `/content-score`, `/competitor-seo` |
| **content-optimizer** | `/content-refresh`, `/content-score` (for rewrites) |
| **keyword-strategist** | `/keyword-research`, `/topical-map` |
| **link-builder** | `/backlink-scan` |
| **auditor** | `/audit` (quality gate — runs automatically) |

---

## Connecting Google Search Console (recommended)

GSC data significantly improves ranking tracking and content decay detection. Without it, the SEO agent falls back to manual SERP checks (still useful, just less precise).

To connect:
1. Add your GSC property at search.google.com/search-console
2. Note your property URL (e.g. `https://yourdomain.com`)
3. Add it to `CLAUDE.local.md` under `GSC Property:`
4. The SEO agent will use GSC API calls when available, and log any auth gaps to its memory

---

## Troubleshooting

**`/seo-audit` runs but auditor seems broken for non-SEO work**
You copied `auditor.md` over your existing one. Restore your original auditor:
- If you have it backed up, copy it back
- If not, download the original Claudify zip and copy `.claude/agents/auditor.md` from there

**SEO agent fails silently or can't find its memory**
The `agent-memory/seo/` folder wasn't copied. Add it:
```
your-project/.claude/agent-memory/seo/MEMORY.md
your-project/.claude/agent-memory/seo/keyword-maps/
```

**`/seo-audit` command not found**
The command files weren't copied. Check that `.claude/commands/seo-audit.md` exists.

**SEO rules not loading (agent gives generic output)**
The knowledge-base merge may have been skipped. Open `.claude/knowledge-base.md` and confirm SEO-specific rules are present at the bottom.

**Commands conflict with existing Claudify commands**
The SEO commands use unique names (`/seo-audit`, `/rank-check`, etc.) — there should be no conflicts. If you see one, check your `.claude/command-index.md` for duplicates.

---

## Questions?

hello@claudify.tech
