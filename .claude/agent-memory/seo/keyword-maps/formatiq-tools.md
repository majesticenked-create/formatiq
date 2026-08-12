# Keyword Map — formatiq.tools

Created: 08122026 (first-time build, alongside codebeautify.org competitor scan)
Status: STARTER — no GSC/ranking data yet (site just launched, no prior SEO history)
Volume/difficulty figures below are ESTIMATED from SERP composition (WebSearch, 081226), not from Ahrefs/Semrush (no paid access) or GSC (not confirmed connected — see Tool Access Status in MEMORY.md).

| Keyword | Vol (est.) | Difficulty (est.) | Intent | Rank | Target page | Priority |
|---|---|---|---|---|---|---|
| json formatter | High (est. 50K+/mo, based on 9+ established competitors incl. jsonformatter.org, jsonlint.com, codebeautify.org, toptal, jsonformatter.net) | High — dominated by aged domains | Transactional | Not tracked | /tools/json-formatter | High |
| json validator | High (est., shares SERP with json formatter) | High | Transactional | Not tracked | /tools/validators/json-validator (dedicated page shipped 081326 — was previously flagged as a gap; now a real target, distinct from /tools/json-formatter which should target "json formatter" only to avoid cannibalization) | High |
| jwt decoder | Medium (est.) | Medium | Transactional | Not tracked | /tools/jwt-decoder | High |
| uuid generator | Medium (est.) | Medium | Transactional | Not tracked | /tools/uuid-generator | High |
| password generator | High (est.) | High | Transactional | Not tracked | /tools/password-generator | Medium (very crowded niche) |
| regex tester | Medium (est.) | Medium | Transactional | Not tracked | /tools/regex-tester | High |
| csv to json converter | Medium (est.) | Medium | Transactional | Not tracked | /tools/csv-json-converter | High |
| html formatter | Medium (est.) | Medium-High | Transactional | Not tracked | /tools/html-formatter | Medium |
| base64 encode decode | Medium (est.) | Medium | Transactional | Not tracked | /tools/base64-encoder-decoder | High |
| xml formatter | Medium (est.) | Medium | Transactional | Not tracked | /tools/xml-formatter | Medium |
| cron expression validator | Low-Medium (est.) | Low-Medium | Transactional | Not tracked | /tools/cron-validator | High (low competition niche) |
| free client-side developer tools no data upload | Low (est.) | Low | Informational/commercial | Not tracked | homepage | High (differentiation angle — see notes) |

---

## Expansion Pass — 081326

Full 104-tool registry read (`lib/tools/registry.ts`) to ground this pass in real, live pages only — no keywords assigned to non-existent pages. Categories confirmed live: formatters, encoders-decoders, generators, text-tools, converters, calculators, validators. Estimates below are WebSearch SERP-composition based (same method as starter set), not Ahrefs/Semrush/GSC — labeled as estimates throughout.

### Encoders/Decoders (beyond base64, jwt)

| Keyword | Vol (est.) | Difficulty (est.) | Intent | Format | Target page | Priority |
|---|---|---|---|---|---|---|
| hash generator sha256 | Medium (est.) | Medium — mostly aged single-purpose tools (md5hashgenerator.com, freeformatter, toolsley) | Transactional | Tool | /tools/hash-generator | High |
| md5 hash generator online | Medium (est.) | Medium-High | Transactional | Tool | /tools/hash-generator | Medium |
| url encoder decoder | Medium (est.) | Medium | Transactional | Tool | /tools/url-encoder-decoder | High |
| html entity converter | Low (est.) | Low | Transactional | Tool | /tools/html-entity-converter | High (low-comp) |
| morse code translator | Low-Medium (est., novelty/education draw) | Low | Transactional/Informational | Tool | /tools/morse-code-converter | High (low-comp, decent volume) |
| string escape unescape | Niche (est.) | Low | Transactional | Tool | /tools/string-escape-unescape | Medium |
| utf8 encode decode online | Niche (est.) | Low | Transactional | Tool | /tools/utf8-encode-decode | Medium |
| gzip compress text online | Low (est.) | Low-Medium | Transactional | Tool | /tools/gzip-text-compressor | Medium |
| aes encrypt decrypt online | Medium (est., security-adjacent draw) | Medium — trust-sensitive query, client-side framing matters a lot here | Transactional | Tool | /tools/aes-encrypt-decrypt | High (privacy angle is the actual differentiator on this one — see Notes) |
| base32 encode decode | Niche (est.) | Low | Transactional | Tool | /tools/base32-encode-decode | Medium |
| crc32 checksum calculator | Niche (est.) | Low | Transactional | Tool | /tools/crc32-checksum | Low |
| wordpress password hash generator (phpass) | Low (est., but decent commercial adjacency — WP devs) | Low-Medium | Transactional | Tool | /tools/wordpress-password-hash-generator | High (low-comp, specific dev audience) |

### Generators (beyond uuid, password)

| Keyword | Vol (est.) | Difficulty (est.) | Intent | Format | Target page | Priority |
|---|---|---|---|---|---|---|
| qr code generator free | High (est. — but dominated by branded/logo-QR competitors like Canva, QRCode Monkey) | High | Transactional | Tool | /tools/qr-code-generator | Medium (crowded, but high volume; differentiate on privacy/no-tracking angle) |
| lorem ipsum generator | Medium (est.) | Medium-High (lipsum.com entrenched) | Transactional | Tool | /tools/lorem-ipsum-generator | Medium |
| random number generator | Medium (est.) | Medium | Transactional | Tool | /tools/random-number-generator | Medium |
| slug generator | Low-Medium (est.) | Low | Transactional | Tool | /tools/slug-generator | High (low-comp) |
| fake data generator | Low-Medium (est.) | Low-Medium | Transactional | Tool | /tools/fake-data-generator | Medium |
| totp generator online | Low-Medium (est., dev/security niche but growing) | Low-Medium | Transactional | Tool | /tools/totp-generator | High (low-comp, real search demand confirmed via SERP — several small dev-tool sites already ranking, no giant incumbent) |
| color palette generator | High (est.) | High — design-tool category dominated by Coolors, Adobe | Transactional | Tool | /tools/color-palette-generator | Low (very crowded) |
| css gradient generator | Medium (est.) | Medium-High | Transactional | Tool | /tools/css-gradient-generator | Medium |
| favicon generator | Medium (est.) | Medium | Transactional | Tool | /tools/favicon-generator | Medium |
| meta tag generator | Low-Medium (est.) | Low-Medium | Transactional | Tool | /tools/meta-tag-generator | Medium |
| mac address generator | Niche (est.) | Low | Transactional | Tool | /tools/mac-address-generator | Medium |
| barcode generator online | Medium (est.) | Medium | Transactional | Tool | /tools/barcode-generator | Low-Medium |
| random address generator | Low (est.) | Low | Transactional | Tool | /tools/random-address-generator | Medium |
| random date generator | Niche (est.) | Low | Transactional | Tool | /tools/random-date-generator | Low |
| html table generator | Medium (est.) | Medium | Transactional | Tool | /tools/html-table-generator | Medium |
| css box shadow generator | Medium (est.) | Medium | Transactional | Tool | /tools/css-box-shadow-generator | Medium |

### Calculators (net-new category coverage)

| Keyword | Vol (est.) | Difficulty (est.) | Intent | Format | Target page | Priority |
|---|---|---|---|---|---|---|
| percentage calculator | High (est.) | High — generic calculator sites (calculator.net) entrenched | Transactional | Tool | /tools/percentage-calculator | Low (very crowded head term) |
| unit converter | High (est.) | High | Transactional | Tool | /tools/unit-converter | Low (crowded, but decent for internal linking hub) |
| age calculator | Medium-High (est.) | Medium-High | Transactional | Tool | /tools/age-calculator | Medium |
| bmi calculator | High (est.) | High — health/medical sites dominate | Transactional | Tool | /tools/bmi-calculator | Low |
| ip subnet calculator | Medium (est., strong dev/sysadmin niche) | Medium | Transactional | Tool | /tools/ip-subnet-calculator | High (underserved by generic calculator sites; sysadmin-specific SERP) |
| bitwise calculator | Niche (est.) | Low | Transactional | Tool | /tools/bitwise-calculator | High (low-comp, dev-specific) |
| date difference calculator | Medium (est.) | Medium | Transactional | Tool | /tools/date-difference-calculator | Medium |
| loan calculator | High (est.) | High — finance sites dominate | Transactional | Tool | /tools/loan-calculator | Low |
| tip calculator | Medium (est.) | Medium-High | Transactional | Tool | /tools/tip-calculator | Low-Medium |
| gpa calculator | Medium (est., seasonal — spikes around semester end/finals) | Medium | Transactional | Tool | /tools/gpa-calculator | Medium |

### Text Tools (net-new category coverage)

| Keyword | Vol (est.) | Difficulty (est.) | Intent | Format | Target page | Priority |
|---|---|---|---|---|---|---|
| word counter online | High (est.) | High — wordcounter.net entrenched | Transactional | Tool | /tools/word-counter | Medium (high volume justifies effort despite competition) |
| case converter online | Medium (est.) | Medium | Transactional | Tool | /tools/case-converter | Medium |
| text diff checker | Medium (est.) | Medium | Transactional | Tool | /tools/text-diff-checker | Medium |
| text sorter online | Niche (est.) | Low | Transactional | Tool | /tools/text-sorter | Medium |
| remove line breaks / whitespace remover | Low-Medium (est.) | Low-Medium | Transactional | Tool | /tools/whitespace-remover | Medium |
| strip html tags online | Medium (est.) | Medium | Transactional | Tool | /tools/html-tag-stripper | Medium |
| find and replace text online | Low-Medium (est.) | Low | Transactional | Tool | /tools/find-and-replace | Medium |
| character frequency counter | Niche (est.) | Low | Transactional/Informational | Tool | /tools/character-frequency-counter | Low |
| http status code lookup | Medium (est., strong dev reference-query demand) | Medium — httpstatuses.com and MDN entrenched but exact-match tool queries less saturated | Informational/Transactional | Tool + reference table | /tools/http-status-code-lookup | High (evergreen dev reference query, quick win) |
| dns record types explained | Medium (est.) | Medium | Informational | Tool + guide | /tools/dns-record-explainer | Medium (best paired with an actual explainer article — content gap, see below) |
| world clock | High (est.) | High — timeanddate.com dominant | Transactional | Tool | /tools/world-clock | Low |

### Validators (beyond email, url, cron)

| Keyword | Vol (est.) | Difficulty (est.) | Intent | Format | Target page | Priority |
|---|---|---|---|---|---|---|
| credit card validator (luhn check) | Low-Medium (est.) | Low-Medium | Transactional | Tool | /tools/credit-card-validator | Medium |
| phone number validator online | Medium (est.) | Medium | Transactional | Tool | /tools/phone-number-validator | Medium |
| iban validator | Medium (est., international finance/dev niche) | Medium — iban.com and wise.com dominant but format+checksum-only tools less saturated | Transactional | Tool | /tools/iban-validator | High (client-side/no-data-sent framing is a genuine trust differentiator here — bank account numbers) |
| isbn validator | Niche (est.) | Low | Transactional | Tool | /tools/isbn-validator | Medium |
| password strength checker | High (est.) | High — dominated by security vendors (nordpass, kaspersky) | Transactional | Tool | /tools/password-strength-checker | Low (crowded, but privacy angle matters — never send a real password to a server) |
| color contrast checker (WCAG) | Medium (est., accessibility/dev niche) | Medium — webaim entrenched but query has real long-tail room | Transactional | Tool | /tools/color-contrast-checker | Medium |
| slug validator | Niche (est.) | Low | Transactional | Tool | /tools/slug-validator | Low |

### Converters (net-new beyond csv/json/xml/base64)

| Keyword | Vol (est.) | Difficulty (est.) | Intent | Format | Target page | Priority |
|---|---|---|---|---|---|---|
| markdown to html converter | Medium (est.) | Medium | Transactional | Tool | /tools/markdown-html-converter | Medium |
| hex to rgb converter | Medium (est.) | Medium | Transactional | Tool | /tools/hex-rgb-converter | Medium |
| rem to px converter | Low-Medium (est.) | Low | Transactional | Tool | /tools/rem-px-converter | High (low-comp, common dev/CSS query) |
| number to words converter | Low-Medium (est.) | Low | Transactional | Tool | /tools/number-to-words | Medium |
| json to yaml converter | Medium (est.) | Medium | Transactional | Tool | /tools/json-yaml-converter | High |
| unix timestamp converter | High (est.) | Medium-High — unixtimestamp.com entrenched but beatable | Transactional | Tool | /tools/timestamp-converter | High |
| number base converter (binary hex octal) | Medium (est.) | Medium | Transactional | Tool | /tools/number-base-converter | Medium |
| roman numeral converter | Medium (est.) | Medium | Transactional | Tool | /tools/roman-numeral-converter | Low-Medium |
| digital storage converter (bytes to gb) | Low-Medium (est.) | Low-Medium | Transactional | Tool | /tools/digital-storage-converter | Medium |
| currency converter | High (est.) | High — xe.com, google finance dominate | Transactional | Tool | /tools/currency-converter | Low |
| image to base64 converter | Medium (est.) | Medium | Transactional | Tool | /tools/base64-image-converter | Medium |
| text to binary converter | Low-Medium (est.) | Low | Transactional | Tool | /tools/text-binary-converter | Medium |

### Formatters (beyond json, html, xml)

| Keyword | Vol (est.) | Difficulty (est.) | Intent | Format | Target page | Priority |
|---|---|---|---|---|---|---|
| sql formatter online | Medium (est.) | Medium | Transactional | Tool | /tools/sql-formatter | High |
| php formatter online | Low-Medium (est.) | Low-Medium | Transactional | Tool | /tools/php-formatter | Medium |
| css formatter beautifier | Medium (est.) | Medium | Transactional | Tool | /tools/css-formatter | Medium |
| yaml formatter validator | Medium (est.) | Medium | Transactional | Tool | /tools/yaml-formatter | High |
| js beautifier online | Medium-High (est.) | Medium-High | Transactional | Tool | /tools/js-formatter | Medium |
| html/css/js minifier | Medium (est. combined) | Medium | Transactional | Tool | /tools/html-minifier, /tools/css-minifier, /tools/js-minifier | Medium |
| json repair tool (fix broken json) | Low-Medium (est., growing — LLM output cleanup use case) | Low-Medium | Transactional | Tool | /tools/json-repair | High (low-comp, emerging demand tied to malformed LLM/API output — worth a dedicated angle) |

### Client-side / privacy differentiation cluster (extended)

Per Notes below, this cluster is the core defensible angle vs. ad-supported/legacy competitors (codebeautify.org and similar). Extending beyond the original single keyword:

| Keyword | Vol (est.) | Difficulty (est.) | Intent | Notes |
|---|---|---|---|---|
| json formatter no upload / client-side json formatter | Low (est.) | Low | Commercial/Informational | Pairs with /tools/json-formatter as a secondary angle in title/meta, not a separate page (avoid cannibalization) |
| aes encryption tool offline / browser-only encryption | Low (est.) | Low | Commercial | Trust-critical query for /tools/aes-encrypt-decrypt — "does this send my data anywhere" is the real user question |
| iban checker no data stored | Niche (est.) | Low | Commercial | Same trust logic for /tools/iban-validator — bank data |
| password generator offline / private password generator | Low (est.) | Low | Commercial | Secondary angle for /tools/password-generator |
| jwt decoder without sending token to server | Low (est.) | Low | Commercial | Secondary angle for /tools/jwt-decoder — real developer concern (tokens can contain secrets) |
| free developer tools no ads no tracking | Low (est.) | Low | Commercial/Informational | Homepage / about-page positioning, not a tool-page target |

**Strategy note**: this cluster should mostly live as secondary H2s / meta description framing on existing tool pages, not as separate pages — matching each tool's primary keyword to avoid cannibalization, while using the privacy/client-side language as the differentiating hook in titles and intros. The security- and finance-adjacent tools (aes-encrypt-decrypt, iban-validator, totp-generator, jwt-decoder, wordpress-password-hash-generator, credit-card-validator) are where this angle has the most real commercial pull, since users searching those terms are explicitly worried about where sensitive data goes.

### Content gaps (no dedicated page exists — blog/guide opportunities, not new tools)

| Keyword | Vol (est.) | Difficulty (est.) | Recommended format |
|---|---|---|---|
| dns record types explained (A, CNAME, MX, TXT) | Medium (est.) | Medium | Guide article, links to /tools/dns-record-explainer |
| http status codes list with meanings | Medium (est.) | Medium | Reference guide, links to /tools/http-status-code-lookup |
| how to fix broken/invalid json | Low-Medium (est., rising w/ LLM output cleanup use case) | Low | How-to guide, links to /tools/json-repair and /tools/json-validator |
| cron expression syntax cheat sheet | Low-Medium (est.) | Low-Medium | Reference guide, links to /tools/cron-validator |
| json vs yaml vs xml comparison | Low (est.) | Low-Medium | Comparison article, links to /tools/json-yaml-converter, /tools/xml-formatter |

## Notes
- formatiq.tools' core differentiator (104 tools, 100% client-side/no-upload, 7 categories) is a genuine content angle competitors like codebeautify.org do not lead with — codebeautify.org's UI and marketing emphasize breadth/ads, not privacy. This is an opportunity keyword cluster ("client-side," "no upload," "runs in browser," "private json formatter") worth building out, not yet reflected in volume estimates above.
- No backlink profile exists yet (confirmed via lack of prior audit history) — DR is effectively 0/untracked.
- Next step: connect GSC to replace estimated volumes/positions with real data; run T1 technical audit on formatiq.tools itself for baseline.
- 081326 expansion pass: full registry read confirmed 104 live tool pages across 7 categories; ~85 net-new keywords added across encoders-decoders, generators, calculators, text-tools, validators, converters, formatters, plus an extended privacy/client-side cluster. No cannibalization introduced — each keyword maps to exactly one existing page; json-formatter and json-validator are kept as distinct targets on their respective distinct pages. Corrected the json-validator row (dedicated page now exists as of this pass, previously logged as a gap). Content gaps identified are supporting guide/article opportunities (DNS, HTTP status, JSON repair, cron syntax, JSON/YAML/XML comparison), not missing tool pages — all 104 tools already have pages.
