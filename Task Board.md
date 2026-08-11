# Task Board

## Today
-

## This Week
-

## Backlog
-

## Done
- [x] Expand `longDescription` for `base64-encoder-decoder`, `uuid-generator`, `word-counter` in lib/tools/registry.ts to >=40 words (audit FAIL 08/06/26 - fixed same day, now 117/130/130 words)
- [x] Add standard "runs client-side / no data leaves your browser" phrasing to `metaDescription` for: `percentage-calculator`, `unit-converter`, `random-number-generator`, `whitespace-remover`, `age-calculator`, `bmi-calculator` (audit WARN 08/06/26 - fixed same day)
- [x] Build 6 new tools with registry entries, verifying clean `npm run build` after each (08/11/26): `image-compressor`, `timezone-converter`, `digital-storage-converter`, `utf8-encode-decode`, `gzip-text-compressor`, `color-contrast-checker` — site now at 86 registered tools / 101 static pages
- [x] Implement pending SOP (08/06/26): automated test in `__tests__/registry.test.ts` asserting `longDescription` >= 40 words + >=2 FAQs + no duplicate (category, slug) pairs for every `tools[]` entry (08/11/26)
- [x] Committed the accumulated uncommitted work (~50 tool components, new marketing pages, registry expansion, test suite) (08/11/26)
- [x] Build 6 more tools with registry entries, verifying clean `npm run build` after each (08/11/26): `json-tree-viewer`, `html-table-generator`, `css-box-shadow-generator`, `currency-converter` (live frankfurter.dev rates), `aes-encrypt-decrypt`, `ip-address-formatter` — site now at 92 registered tools / 107 static pages, 345 tests passing
- [x] Build 6 more tools with registry entries, verifying clean `npm run build` after each (08/11/26): `string-inspector`, `mac-address-generator`, `barcode-generator` (added `jsbarcode` dep, confirmed with user first), `dns-record-explainer`, `http-status-code-lookup`, `random-flag-generator` — site now at 98 registered tools / 113 static pages, 357 tests passing
- [x] Build 6 more tools with registry entries, verifying clean `npm run build` after each (08/11/26): `random-address-generator`, `isbn-validator`, `wordpress-password-hash-generator` (reused verified MD5 impl for phpass), `tsv-json-converter`, `text-binary-converter`, `world-clock` — site now at 104 registered tools / 119 static pages, 369 tests passing
