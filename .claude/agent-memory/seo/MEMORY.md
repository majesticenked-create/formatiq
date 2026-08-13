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
| formatiq.tools | 081326 (keyword map expansion, not a technical audit) | — | — | T1 technical audit still pending (see 081226 audit note) |

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
| dataformatterpro.com | Roundup listicle ("Best JSON Formatters Online 2026 – Top 7 Free Tools Compared") | https://dataformatterpro.com/blog/best-json-formatters-2026/ | Mentions JSONLint, codebeautify.org (implied); pitch formatiq.tools' 100%-client-side + json-repair angle for inclusion | OPEN | 081326 |
| voivoinfotech.com | Roundup listicle ("Best Free JSON Formatter Tools in 2026 (15 Tools Tested)") | https://voivoinfotech.com/free-json-formatter-tools/ | Tests 15 tools — good target for inclusion pitch given breadth (104 tools) | OPEN | 081326 |
| digitaltoolpad.com | Roundup listicle ("Top 12 Best Online JSON Formatter Tools of 2025") | https://www.digitaltoolpad.com/blog/online-json-formatter | Also runs a JS-formatter roundup ("Top 12 Tools to Format JS Online") — two potential inclusion targets on same domain | OPEN | 081326 |
| cleantextlab.com | Roundup listicle ("Best JSON Formatter 2026: Top 5 Tools Compared") | https://cleantextlab.com/blog/best-json-formatter-2026 | Smaller top-5 list — lower bar for inclusion than the top-12/15 lists | OPEN | 081326 |
| dev.to (multiple authors) | Community "I built N free dev tools" posts, not roundups but comparable-positioning content | https://dev.to/wynnt3o/ive-built-a-collection-of-25-free-online-developer-tools-no-ads-no-login-1e3m and similar (bhupinder_singh, maulik_solanki) | Not outreach targets, but competitive-positioning signal: several small indie no-ads/no-signup tool collections are actively marketing on dev.to — formatiq.tools should consider a similar dev.to launch post | INFO-ONLY | 081326 |

---

## Audit History

| Date | Domain | Tier | Verdict | Key Findings |
|------|--------|------|---------|-------------|
| 081226 | codebeautify.org (vs formatiq.tools) | T3-lite (competitive, CWV unavailable) | WARN — competitor established, formatiq.tools has zero tracked backlink/ranking history | See Audit Output Log SEO-001. formatiq.tools has broader per-tool depth on privacy/client-side messaging as untapped differentiator; codebeautify.org has 10+ yr domain age advantage and ~2.1M monthly visits (Similarweb, est.) |
| 081326 | formatiq.tools | Keyword research (map expansion, not a technical/competitive audit) | INFO | Expanded keyword map from 12 to ~97 keywords by reading full 104-tool registry (`lib/tools/registry.ts`) and cross-referencing against all 7 live categories. Fixed stale row: json-validator now has a dedicated page, no longer a gap. See keyword-maps/formatiq-tools.md "Expansion Pass — 081326" section. |
| 081326 | codebeautify.org, freeformatter.com, jsonformatter.org, devtoolsforyou.com | Competitive keyword research (WebSearch-only) | INFO | See Audit Output Log SEO-002. No paid rank tracker — all positions "not confirmed" unless a domain appeared in top-8 SERP snippet results. devtoolsforyou.com is the closest direct positioning competitor (privacy/no-tracking/client-side framing near-identical to formatiq.tools). freeformatter.com and jsonformatter.org both run large combinatorial "X-to-Y converter" URL clusters (locale pages, base64-to-N pairs) as a scale strategy formatiq.tools does not currently replicate. 4 roundup articles logged as backlink outreach targets. |
| 081326 | w3schools.com/tools, jsonlint.com, base64decode.org | Keyword gap analysis (WebSearch-only, no paid rank tracker) | INFO | See keyword-maps/formatiq-tools.md "Keyword Gap Analysis — 081326" section and Competitor Registry rows below. None of the 3 dominate head terms outright in visible snippet sets checked (json formatter online, base64 encode decode online, uuid generator online); regex tester online and base64 decode online were partial exceptions (w3schools page 1 ~pos 5, base64decode.org page 1 mid-list). jsonlint.com's strongest signal is citation frequency in third-party comparison/roundup articles, not confirmed head-term rank. No roundup mentions found for w3schools.com/tools or base64decode.org this session — flagged as a gap in their content-marketing/PR footprint vs. jsonlint.com. |

---

## Competitor Registry

| Domain | Tracked For | DA/DR | Content Cadence | Last Scanned |
|--------|------------|-------|----------------|-------------|
| codebeautify.org | formatiq.tools | DR unknown — Ahrefs free checker returned no queryable data (input not accepted via WebFetch); Similarweb (WebSearch 081226) reports ~2.1M monthly visits, global rank ~#42,670, #449 in Programming/Dev Software category — established, aged domain, mature backlink profile inferred | Legacy/static tool catalog, no visible blog cadence observed; broad tool breadth (JSON/XML/JS/CSS/HTML/SQL/Excel formatters+validators+converters) | 081226 (T3-lite: robots.txt+sitemap fetched, JSON-LD checked on 2 pages, SERP presence via WebSearch, PageSpeed API quota-exhausted so no CWV data) |
| w3schools.com/tools | formatiq.tools | DR/DA unknown — no paid tool access; plausible high domain authority inherited from core w3schools.com tutorial site (not confirmed) | Broad ~15-20 tool subfolder (JSON formatter/tree/path/schema, base64, AES, regex tester, JWT decoder+signer, UUID, hash, bcrypt, URL encode, lorem ipsum, markdown preview); no dedicated tools blog cadence observed | 081326 (WebSearch-only gap analysis: site: index checks + direct keyword SERP checks, no roundup/listicle mentions found for the /tools subfolder) |
| jsonlint.com | formatiq.tools | DR/DA unknown — no paid tool access; frequently cited as reference benchmark in third-party "vs" comparison articles (dev.to, saashub) which suggests meaningful topical authority for JSON specifically | Narrow, deep JSON-only cluster (formatter, minify, repair, pretty-print, schema validator, stringify, tree view, datasets); named "best overall" in at least one 2026 roundup (dataformatterpro.com) | 081326 (WebSearch-only gap analysis: appeared on page 1, not top 3, for "json formatter online" direct SERP check; strongest signal was citation frequency in comparison articles, not confirmed head-term rank) |
| base64decode.org | formatiq.tools | DR/DA unknown — no paid tool access | Very narrow (base64 encode/decode + sister site base64encode.org); large indexed footprint of long-tail `/dec/{string}/` pages suggests traffic is mostly long-tail lookups, not head-term ranking; NOT visible in "base64 encode decode online" head-term SERP snippet set, but visible in a base64-decode-specific search behind emn178.github.io and codebeautify.org | 081326 (WebSearch-only gap analysis) |
| freeformatter.com | formatiq.tools | DR unknown, no Ahrefs access. Known aged incumbent — appeared in Semrush/Similarweb "competitors of freeformatter.com" listing alongside jsonformatter.org, codebeautify.org, beautifier.io (WebSearch 081326) | Broad formatter/validator/converter suite, string utilities, standards/code-snippets pages (locale-specific long-tail content, e.g. "Canada standards code snippets") — indicates deliberate long-tail SEO content strategy beyond core tools | 081326 (WebSearch-only, no crawl/CWV — see Audit Output Log SEO-002) |
| jsonformatter.org | formatiq.tools | DR unknown, no Ahrefs access. Appears in "best JSON formatter" roundups (dataformatterpro.com, others) alongside JSONLint as a top-tier free option (WebSearch 081326) | JSON-focused hub with heavy converter cluster (json-to-base64, base64-to-json, base64-to-xml, base64-to-yaml, xml-to-base64, csv-to-json) — pursuing a "X-to-Y converter" long-tail page-per-pair strategy, high page count via combinatorial converter URLs | 081326 (WebSearch-only) |
| devtoolsforyou.com | formatiq.tools | DR unknown, no Ahrefs access, no roundup or vs-article mentions found in this pass — appears to be a smaller/newer entrant | Close positioning match to formatiq.tools: "no accounts, no tracking, no ads, no third-party scripts," 100%-client-side framing explicitly stated on homepage. Also publishes guide content (how-to-parse-jwt) and comparison pages (uuid-v1-vs-uuid-v4) and long-tail programmatic pages (currency pair converters, roman numeral N converters) | 081326 (WebSearch-only) |

---

## Pending Recommendations

| ID | Domain | Recommendation | Priority | Status | Added | Verified |
|----|--------|---------------|---------|--------|-------|---------|

---

## Audit Output Log

| ID | Date | Domain | Tier | Verdict | Findings | Actionable % | Self-Review Score |
|----|------|--------|------|---------|----------|-------------|------------------|
| SEO-001 | 081226 | codebeautify.org vs formatiq.tools | T3-lite | WARN | 7 (keyword gaps: json-validator dedicated page, cron-validator low-comp opportunity, privacy-angle content cluster, schema gap, backlink baseline, CWV gap-of-data, sitemap/robots parity) | ~85% (all but the CWV finding have a concrete next step; CWV finding is itself "retry PSI tomorrow") | Specificity 8/10, Actionability 8/10, Source citation 7/10 (2 metrics are WebSearch-inferred and labeled as such, not measured) |
| SEO-002 | 081326 | codebeautify.org, freeformatter.com, jsonformatter.org, devtoolsforyou.com vs formatiq.tools | Competitive keyword research (WebSearch-only, no rank-tracking tool) | INFO | 8 (site: index checks x4 domains, 6 direct-keyword SERP checks, 2 roundup/alternative searches, devtoolsforyou.com identified as closest positioning match on privacy angle) | ~70% (findings are directional not position-confirmed — most "actionable" items are "build the X-to-Y converter cluster" / "match devtoolsforyou's guide-content pattern" rather than exact-rank fixes, since no paid rank tracker available) | Specificity 6/10 (no confirmed numeric positions — SERP snippets don't expose rank order reliably), Actionability 7/10, Source citation 9/10 (every row labeled WebSearch/site: query, all uncertainty flagged explicitly) |

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
