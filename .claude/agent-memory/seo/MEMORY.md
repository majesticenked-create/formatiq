# SEO Agent Memory

Persistent knowledge across sessions. Read at startup. Updated after every task.
Curate when file exceeds 200 lines — archive data older than 90 days.

---

## Tool Access Status

| Tool | Status | Last Checked | Notes |
|------|--------|--------------|-------|
| PageSpeed Insights API | BLOCKED (quota) | 081226 | Returned HTTP 429 "Quota exceeded for quota metric Queries per day" — no CWV data obtainable today; retry next calendar day |
| Google Search Console | Not configured | 081226 | No credentials found in CLAUDE.local.md; all ranking/volume data in keyword maps is estimated, not measured |
| Ahrefs free tools | Not queryable via WebFetch | 081226 | website-authority-checker page renders JS-driven input form; WebFetch only returns static/placeholder content, no live DR/referring-domain figures — used Similarweb data via WebSearch as fallback (traffic tier only, no DR equivalent) |
| Screaming Frog CLI | Not checked | — | — |
| curl / direct crawl | Available | 081226 | robots.txt, sitemap.xml, JSON-LD presence confirmed reachable on codebeautify.org |

---

## Active Domains

| Domain | Last Audit | Tier | Health Score | Next Due |
|--------|-----------|------|-------------|----------|

---

## Ranking Alerts

| Date | Domain | Keyword | Position Change | Cause | Status |
|------|--------|---------|----------------|-------|--------|

---

## Known Patterns

_(Recurring observations across audits — nominated to knowledge-base when confirmed 2+ times)_

---

## Resolved Patterns

_(Patterns that have been fixed or explained)_

---

## Backlink Opportunities

| Domain | Type | Target URL | Prospect | Status | Added |
|--------|------|-----------|---------|--------|-------|

---

## Audit History

| Date | Domain | Tier | Verdict | Key Findings |
|------|--------|------|---------|-------------|
| 081226 | codebeautify.org (vs formatiq.tools) | T3-lite (competitive, CWV unavailable) | WARN — competitor established, formatiq.tools has zero tracked backlink/ranking history | See Audit Output Log SEO-001. formatiq.tools has broader per-tool depth on privacy/client-side messaging as untapped differentiator; codebeautify.org has 10+ yr domain age advantage and ~2.1M monthly visits (Similarweb, est.) |

---

## Competitor Registry

| Domain | Tracked For | DA/DR | Content Cadence | Last Scanned |
|--------|------------|-------|----------------|-------------|
| codebeautify.org | formatiq.tools | DR unknown — Ahrefs free checker returned no queryable data (input not accepted via WebFetch); Similarweb (WebSearch 081226) reports ~2.1M monthly visits, global rank ~#42,670, #449 in Programming/Dev Software category — established, aged domain, mature backlink profile inferred | Legacy/static tool catalog, no visible blog cadence observed; broad tool breadth (JSON/XML/JS/CSS/HTML/SQL/Excel formatters+validators+converters) | 081226 (T3-lite: robots.txt+sitemap fetched, JSON-LD checked on 2 pages, SERP presence via WebSearch, PageSpeed API quota-exhausted so no CWV data) |

---

## Pending Recommendations

| ID | Domain | Recommendation | Priority | Status | Added | Verified |
|----|--------|---------------|---------|--------|-------|---------|

---

## Audit Output Log

| ID | Date | Domain | Tier | Verdict | Findings | Actionable % | Self-Review Score |
|----|------|--------|------|---------|----------|-------------|------------------|
| SEO-001 | 081226 | codebeautify.org vs formatiq.tools | T3-lite | WARN | 7 (keyword gaps: json-validator dedicated page, cron-validator low-comp opportunity, privacy-angle content cluster, schema gap, backlink baseline, CWV gap-of-data, sitemap/robots parity) | ~85% (all but the CWV finding have a concrete next step; CWV finding is itself "retry PSI tomorrow") | Specificity 8/10, Actionability 8/10, Source citation 7/10 (2 metrics are WebSearch-inferred and labeled as such, not measured) |

---

## Calibration

| Rec ID | Prediction | Actual | Outcome | Date Verified |
|--------|-----------|--------|---------|--------------|

---

## What Worked

_(VERIFIED-POSITIVE outcomes — tactics with confirmed positive impact)_

---

## What Didn't Work

_(VERIFIED-NEGATIVE outcomes — tactics tried and disproven with learnings)_
