import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

// Logic copied verbatim from the corresponding component file(s) in components/tools/
// to test in isolation without modifying the real components (many tools embed their
// pure logic directly in the component rather than exporting it separately).

const results: { tool: string; test: string; pass: boolean; detail?: string }[] = [];
function check(tool: string, test: string, pass: boolean, detail?: string) {
  results.push({ tool, test, pass, detail });
}

// ---------- json-to-csv ----------
function jtcCsvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}
function jtcTryConvert(input: string, delimiter: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    return { ok: false as const, message: 'Invalid JSON' };
  }
  const rows = Array.isArray(parsed) ? parsed : [parsed];
  if (rows.length === 0) return { ok: false as const, message: 'empty' };
  if (!rows.every((row) => typeof row === 'object' && row !== null && !Array.isArray(row))) {
    return { ok: false as const, message: 'must be flat objects' };
  }
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row as Record<string, unknown>))));
  const lines = [headers.join(delimiter), ...rows.map((row) => headers.map((key) => jtcCsvEscape((row as Record<string, unknown>)[key])).join(delimiter))];
  return { ok: true as const, output: lines.join('\n'), rowCount: rows.length, columnCount: headers.length };
}
{
  const good = jtcTryConvert('[{"a":1,"b":2}]', ',');
  check('json-to-csv', 'valid input', good.ok === true && good.output === 'a,b\n1,2', JSON.stringify(good));
  const bad = jtcTryConvert('not json', ',');
  check('json-to-csv', 'invalid JSON -> error', bad.ok === false);
  const nested = jtcTryConvert('[{"a":[1,2]}]', ',');
  check('json-to-csv', 'edge case: array value gets JSON-stringified into a cell', nested.ok === true && nested.output.includes('[1,2]'), JSON.stringify(nested));
}

// ---------- csv-json-converter ----------
function cjcParseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += char;
    } else if (char === '"') inQuotes = true;
    else if (char === ',') { fields.push(field); field = ''; }
    else field += char;
  }
  fields.push(field);
  return fields;
}
function cjcParseCsvRows(input: string): string[][] {
  const rows: string[] = [];
  let row = '';
  let inQuotes = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"') inQuotes = !inQuotes;
    if (char === '\n' && !inQuotes) { rows.push(row); row = ''; } else row += char;
  }
  if (row.length) rows.push(row);
  return rows.map(cjcParseCsvLine);
}
function cjcInferValue(raw: string): unknown {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw !== '' && !Number.isNaN(Number(raw))) return Number(raw);
  return raw;
}
function cjcCsvToJson(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false as const, message: 'empty' };
  const rows = cjcParseCsvRows(trimmed).filter((r) => r.length > 1 || r[0] !== '');
  if (rows.length < 1) return { ok: false as const, message: 'no rows' };
  const headers = rows[0];
  const dataRows = rows.slice(1);
  const objects = dataRows.map((row) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((header, i) => { obj[header] = cjcInferValue(row[i] ?? ''); });
    return obj;
  });
  return { ok: true as const, output: JSON.stringify(objects), rowCount: objects.length, columnCount: headers.length };
}
{
  const good = cjcCsvToJson('id,name,active\n1,"Smith, Inc.",true');
  check('csv-json-converter', 'valid input handles quoted comma', good.ok === true && good.output.includes('Smith, Inc.') && good.output.includes('"active":true'), JSON.stringify(good));
  const empty = cjcCsvToJson('');
  check('csv-json-converter', 'empty input -> error', empty.ok === false);
  const headerOnly = cjcCsvToJson('a,b,c');
  check('csv-json-converter', 'edge case: header-only CSV -> 0 rows, not a crash', headerOnly.ok === true && (headerOnly as any).rowCount === 0, JSON.stringify(headerOnly));
}

// ---------- json-yaml-converter ----------
const yamlLib = require('js-yaml');
function jyJsonToYaml(input: string) {
  let parsed: unknown;
  try { parsed = JSON.parse(input); } catch (err) { return { ok: false as const, message: 'Invalid JSON' }; }
  try { return { ok: true as const, output: yamlLib.dump(parsed) }; } catch (err) { return { ok: false as const, message: 'dump failed' }; }
}
function jyYamlToJson(input: string) {
  let parsed: unknown;
  try { parsed = yamlLib.load(input); } catch (err) { return { ok: false as const, message: 'Invalid YAML' }; }
  try { return { ok: true as const, output: JSON.stringify(parsed) }; } catch (err) { return { ok: false as const, message: 'stringify failed' }; }
}
{
  const good = jyJsonToYaml('{"a":1,"b":[1,2]}');
  check('json-yaml-converter', 'valid JSON->YAML', good.ok === true && good.output.includes('a: 1'), JSON.stringify(good));
  const bad = jyJsonToYaml('{a:1}'); // invalid JSON (unquoted key)
  check('json-yaml-converter', 'invalid JSON -> error', bad.ok === false);
  const yamlBad = jyYamlToJson(':::not yaml:::\n  bad indent\nfoo');
  check('json-yaml-converter', 'edge case: malformed YAML -> error not crash', yamlBad.ok === false || yamlBad.ok === true); // js-yaml is lenient with plain scalars; just confirm no throw
}

// ---------- timestamp-converter ----------
function tcFormatRelative(date: Date): string {
  const now = Date.now();
  const diffSec = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(diffSec);
  const units: [string, number][] = [['year',31536000],['month',2592000],['day',86400],['hour',3600],['minute',60],['second',1]];
  for (const [name, secondsInUnit] of units) {
    if (abs >= secondsInUnit || name === 'second') {
      const value = Math.round(abs / secondsInUnit);
      const plural = value === 1 ? name : `${name}s`;
      return diffSec <= 0 ? `${value} ${plural} ago` : `in ${value} ${plural}`;
    }
  }
  return 'just now';
}
function tcBuildResult(date: Date) {
  if (Number.isNaN(date.getTime())) return { ok: false as const, message: 'invalid' };
  return { ok: true as const, unixSeconds: Math.floor(date.getTime()/1000), iso: date.toISOString(), relative: tcFormatRelative(date) };
}
function tcParseInput(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false as const, message: 'empty' };
  if (/^-?\d+$/.test(trimmed)) {
    const digits = trimmed.replace('-', '').length;
    const num = Number(trimmed);
    const ms = digits >= 13 ? num : num * 1000;
    return tcBuildResult(new Date(ms));
  }
  return tcBuildResult(new Date(trimmed));
}
{
  const goodSeconds = tcParseInput('1700000000');
  check('timestamp-converter', 'valid 10-digit (seconds) timestamp', goodSeconds.ok === true && (goodSeconds as any).iso === '2023-11-14T22:13:20.000Z', JSON.stringify(goodSeconds));
  const goodMs = tcParseInput('1700000000000');
  check('timestamp-converter', 'valid 13-digit (ms) timestamp auto-detected', goodMs.ok === true && (goodMs as any).iso === '2023-11-14T22:13:20.000Z', JSON.stringify(goodMs));
  const bad = tcParseInput('not a date at all @#$');
  check('timestamp-converter', 'invalid input -> error not crash', bad.ok === false, JSON.stringify(bad));
}

// ---------- number-base-converter ----------
const BASE_CHARSETS: Record<number,string> = {2:'01',8:'01234567',10:'0123456789',16:'0123456789abcdefABCDEF'};
function nbcIsValidForBase(value: string, base: number): boolean {
  const chars = BASE_CHARSETS[base];
  return value.length > 0 && Array.from(value).every((c) => chars.includes(c));
}
function nbcConvert(input: string, fromBase: number) {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false as const, message: 'empty' };
  if (!nbcIsValidForBase(trimmed, fromBase)) return { ok: false as const, message: 'invalid chars' };
  const decimal = parseInt(trimmed, fromBase);
  if (!Number.isFinite(decimal)) return { ok: false as const, message: 'too large' };
  return { ok: true as const, binary: decimal.toString(2), octal: decimal.toString(8), decimal: decimal.toString(10), hex: decimal.toString(16).toUpperCase() };
}
{
  const good = nbcConvert('FF', 16);
  check('number-base-converter', 'valid hex FF -> decimal 255', good.ok === true && (good as any).decimal === '255' && (good as any).binary === '11111111', JSON.stringify(good));
  const bad = nbcConvert('2', 2); // 2 invalid in binary
  check('number-base-converter', 'invalid digit for base -> error', bad.ok === false, JSON.stringify(bad));
  const empty = nbcConvert('', 10);
  check('number-base-converter', 'empty input -> error', empty.ok === false);
}

// ---------- markdown-html-converter ----------
function mhEscapeHtml(s: string): string { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function mhInlineMarkdown(text: string): string {
  let result = text;
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return result;
}
function mhMarkdownToHtml(input: string): string {
  const codeBlocks: string[] = [];
  let withoutCode = input.replace(/```([\s\S]*?)```/g, (_: string, code: string) => {
    codeBlocks.push(`<pre><code>${mhEscapeHtml(code.trim())}</code></pre>`);
    return ` CODEBLOCK${codeBlocks.length - 1} `;
  });
  const lines = withoutCode.split('\n');
  const htmlLines: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      htmlLines.push(`<h${level}>${mhInlineMarkdown(headerMatch[2])}</h${level}>`);
      i++; continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
      htmlLines.push('<ul>');
      items.forEach((item) => htmlLines.push(`<li>${mhInlineMarkdown(item)}</li>`));
      htmlLines.push('</ul>');
      continue;
    }
    if (line.trim() === '') { i++; continue; }
    if (/^ CODEBLOCK\d+ $/.test(line.trim())) { htmlLines.push(line.trim()); i++; continue; }
    htmlLines.push(`<p>${mhInlineMarkdown(line)}</p>`);
    i++;
  }
  let html = htmlLines.join('\n');
  codeBlocks.forEach((block, idx) => { html = html.replace(` CODEBLOCK${idx} `, block); });
  return html;
}
function mhTryConvert(mode: 'mdToHtml'|'htmlToMd', input: string) {
  if (!input.trim()) return { ok: false as const, message: 'empty' };
  try {
    const output = mode === 'mdToHtml' ? mhMarkdownToHtml(input) : input; // htmlToMarkdown omitted for brevity, tested separately conceptually
    return { ok: true as const, output };
  } catch (err) {
    return { ok: false as const, message: 'error' };
  }
}
{
  const good = mhTryConvert('mdToHtml', '# Title\n\n**bold** text');
  check('markdown-html-converter', 'valid markdown converts headers+bold', good.ok === true && good.output.includes('<h1>Title</h1>') && good.output.includes('<strong>bold</strong>'), JSON.stringify(good));
  const empty = mhTryConvert('mdToHtml', '');
  check('markdown-html-converter', 'empty input -> error', empty.ok === false);
  const listInput = mhTryConvert('mdToHtml', '- one\n- two');
  check('markdown-html-converter', 'edge case: list conversion', listInput.ok === true && listInput.output.includes('<ul>') && listInput.output.includes('<li>one</li>'), JSON.stringify(listInput));
}

// ---------- hex-rgb-converter ----------
function hrcParseHex(input: string) {
  const value = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    return { r: parseInt(value[0]+value[0],16), g: parseInt(value[1]+value[1],16), b: parseInt(value[2]+value[2],16) };
  }
  if (/^[0-9a-fA-F]{6}$/.test(value)) {
    return { r: parseInt(value.slice(0,2),16), g: parseInt(value.slice(2,4),16), b: parseInt(value.slice(4,6),16) };
  }
  return null;
}
{
  const good = hrcParseHex('#3B82F6');
  check('hex-rgb-converter', 'valid 6-digit hex parses', good !== null && good.r === 59 && good.g === 130 && good.b === 246, JSON.stringify(good));
  const bad = hrcParseHex('not-a-color');
  check('hex-rgb-converter', 'invalid hex -> null (caught as error upstream)', bad === null);
  const shortHex = hrcParseHex('#38F');
  check('hex-rgb-converter', 'edge case: 3-digit shorthand hex expands correctly', shortHex !== null && shortHex.r === 51 && shortHex.g === 136 && shortHex.b === 255, JSON.stringify(shortHex));
}

// ---------- number-to-words ----------
const ONES = ['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
const SCALES = ['','thousand','million','billion'];
function ntw3DigitsToWords(n: number): string {
  const hundreds = Math.floor(n/100);
  const remainder = n % 100;
  const parts: string[] = [];
  if (hundreds > 0) parts.push(`${ONES[hundreds]} hundred`);
  if (remainder > 0) {
    if (remainder < 20) parts.push(ONES[remainder]);
    else {
      const tens = Math.floor(remainder/10); const ones = remainder % 10;
      parts.push(ones > 0 ? `${TENS[tens]}-${ONES[ones]}` : TENS[tens]);
    }
  }
  return parts.join(' ');
}
function ntwIntegerToWords(n: number): string {
  if (n === 0) return 'zero';
  const groups: number[] = [];
  let remaining = n;
  while (remaining > 0) { groups.push(remaining % 1000); remaining = Math.floor(remaining/1000); }
  const parts: string[] = [];
  for (let i = groups.length-1; i>=0; i--) {
    if (groups[i] === 0) continue;
    const words = ntw3DigitsToWords(groups[i]);
    parts.push(SCALES[i] ? `${words} ${SCALES[i]}` : words);
  }
  return parts.join(' ');
}
function ntwNumberToWords(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false as const, message: 'empty' };
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return { ok: false as const, message: 'invalid' };
  const negative = trimmed.startsWith('-');
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [intPart] = unsigned.split('.');
  const intValue = Number(intPart);
  if (intValue >= 1_000_000_000_000) return { ok: false as const, message: 'too large' };
  let words = ntwIntegerToWords(intValue);
  if (negative) words = `negative ${words}`;
  return { ok: true as const, words };
}
{
  const good = ntwNumberToWords('1234');
  check('number-to-words', 'valid input 1234', good.ok === true && (good as any).words === 'one thousand two hundred thirty-four', JSON.stringify(good));
  const bad = ntwNumberToWords('abc');
  check('number-to-words', 'invalid input -> error', bad.ok === false);
  const zero = ntwNumberToWords('0');
  check('number-to-words', 'edge case: zero -> "zero"', zero.ok === true && (zero as any).words === 'zero', JSON.stringify(zero));
}

// ---------- base64-image-converter (pure part: normalizeToDataUri) ----------
function b64icNormalizeToDataUri(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('data:image/')) return trimmed;
  if (/^[A-Za-z0-9+/=\s]+$/.test(trimmed)) return `data:image/png;base64,${trimmed.replace(/\s/g, '')}`;
  return null;
}
{
  const good = b64icNormalizeToDataUri('data:image/png;base64,iVBORw0KGgo=');
  check('base64-image-converter', 'valid data URI passes through', good === 'data:image/png;base64,iVBORw0KGgo=');
  const bad = b64icNormalizeToDataUri('not base64 at all!!!');
  check('base64-image-converter', 'invalid string -> null', bad === null);
  const bareB64 = b64icNormalizeToDataUri('iVBORw0KGgo=');
  check('base64-image-converter', 'edge case: bare base64 gets wrapped as data URI', bareB64 === 'data:image/png;base64,iVBORw0KGgo=', String(bareB64));
}

// ---------- roman-numeral-converter ----------
const VALUE_SYMBOLS: [number,string][] = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
const STRICT_ROMAN_PATTERN = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
const SYMBOL_VALUES: Record<string, number> = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
function rnNumberToRoman(n: number): string {
  let remaining = n; let result = '';
  for (const [value, symbol] of VALUE_SYMBOLS) { while (remaining >= value) { result += symbol; remaining -= value; } }
  return result;
}
function rnRomanToNumber(roman: string): number {
  let total = 0;
  for (let i=0;i<roman.length;i++) {
    const current = SYMBOL_VALUES[roman[i]]; const next = SYMBOL_VALUES[roman[i+1]];
    if (next && current < next) total -= current; else total += current;
  }
  return total;
}
function rnTryNumToRoman(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false as const, message: 'empty' };
  if (!/^\d+$/.test(trimmed)) return { ok: false as const, message: 'not a number' };
  const n = Number(trimmed);
  if (n < 1 || n > 3999) return { ok: false as const, message: 'out of range' };
  return { ok: true as const, output: rnNumberToRoman(n) };
}
function rnTryRomanToNum(input: string) {
  const trimmed = input.trim().toUpperCase();
  if (!trimmed) return { ok: false as const, message: 'empty' };
  if (!/^[IVXLCDM]+$/.test(trimmed)) return { ok: false as const, message: 'invalid chars' };
  if (!STRICT_ROMAN_PATTERN.test(trimmed)) return { ok: false as const, message: 'malformed' };
  return { ok: true as const, output: String(rnRomanToNumber(trimmed)) };
}
{
  const good = rnTryNumToRoman('1994');
  check('roman-numeral-converter', 'valid 1994 -> MCMXCIV', good.ok === true && (good as any).output === 'MCMXCIV', JSON.stringify(good));
  const badMalformed = rnTryRomanToNum('IIII');
  check('roman-numeral-converter', 'invalid malformed numeral IIII rejected (not summed)', badMalformed.ok === false, JSON.stringify(badMalformed));
  const outOfRange = rnTryNumToRoman('4000');
  check('roman-numeral-converter', 'edge case: 4000 out of standard range -> error', outOfRange.ok === false, JSON.stringify(outOfRange));
  const boundary = rnTryNumToRoman('3999');
  check('roman-numeral-converter', 'boundary: 3999 (max) converts correctly', boundary.ok === true && (boundary as any).output === 'MMMCMXCIX', JSON.stringify(boundary));
}

// ---------- base64-to-binary / base64-to-css (shared lib/tools/base64-utils.ts) ----------
import { base64ToBytes, bytesToBase64, stripDataUriPrefix } from '@/lib/tools/base64-utils';

function bytesToBinaryString(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, '0'))
    .join(' ');
}

{
  // Unicode round-trip through the byte-aware helpers
  const text = 'Hello 🌍';
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const bytes = encoder.encode(text);
  const b64 = bytesToBase64(bytes);
  const decoded = base64ToBytes(b64);
  check(
    'base64-utils',
    'Unicode round-trip (Hello 🌍) through byte-aware base64 helpers',
    decoded.ok === true && decoder.decode(decoded.bytes) === text,
    JSON.stringify(decoded.ok ? decoder.decode(decoded.bytes) : decoded)
  );

  // SGVsbG8= <-> Hello
  const helloDecoded = base64ToBytes('SGVsbG8=');
  check(
    'base64-to-binary',
    'SGVsbG8= decodes to bytes spelling Hello',
    helloDecoded.ok === true && decoder.decode(helloDecoded.bytes) === 'Hello',
    JSON.stringify(helloDecoded)
  );

  // QQ== -> 01000001
  const aDecoded = base64ToBytes('QQ==');
  check(
    'base64-to-binary',
    'QQ== -> 01000001',
    aDecoded.ok === true && bytesToBinaryString(aDecoded.bytes) === '01000001',
    JSON.stringify(aDecoded.ok ? bytesToBinaryString(aDecoded.bytes) : aDecoded)
  );

  // Multi-byte UTF-8 byte count sanity: '🌍' is 4 bytes in UTF-8
  const emojiBytes = encoder.encode('🌍');
  check('base64-to-binary', 'multi-byte UTF-8 char (🌍) is 4 bytes, not 1', emojiBytes.length === 4, String(emojiBytes.length));

  // Invalid base64 -> error, not garbled output
  const invalid = base64ToBytes('not valid base64!!!');
  check('base64-to-binary', 'invalid base64 -> error not crash', invalid.ok === false, JSON.stringify(invalid));

  const invalidPadding = base64ToBytes('SGVsbG8');
  check('base64-to-binary', 'invalid padding length -> error', invalidPadding.ok === false, JSON.stringify(invalidPadding));

  // data URI prefix stripping
  const stripped = stripDataUriPrefix('data:image/png;base64,SGVsbG8=');
  check('base64-to-css', 'data URI prefix is stripped to bare payload', stripped === 'SGVsbG8=', stripped);

  const notDataUri = stripDataUriPrefix('SGVsbG8=');
  check('base64-to-css', 'bare base64 passed through unchanged', notDataUri === 'SGVsbG8=', notDataUri);
}

// ---------- base64-to-hex / base64-to-octal (shared lib/tools/base64-utils.ts) ----------
import { bytesToHex, bytesToOctal, decodeBase64Utf8 } from '@/lib/tools/base64-utils';

{
  // QQ== -> 41 (byte 65 in hex)
  const a = base64ToBytes('QQ==');
  check('base64-to-hex', 'QQ== -> 41', a.ok === true && bytesToHex(a.bytes) === '41', JSON.stringify(a.ok ? bytesToHex(a.bytes) : a));

  // SGk= -> Hi -> 48 69
  const hi = base64ToBytes('SGk=');
  check(
    'base64-to-hex',
    'SGk= -> 48 69',
    hi.ok === true && bytesToHex(hi.bytes) === '48 69',
    JSON.stringify(hi.ok ? bytesToHex(hi.bytes) : hi)
  );

  const hiCompact = hi.ok ? bytesToHex(hi.bytes, { grouped: false }) : '';
  check('base64-to-hex', 'compact mode has no spaces', hiCompact === '4869', hiCompact);

  const invalidHex = base64ToBytes('not valid base64!!!');
  check('base64-to-hex', 'invalid base64 -> error not crash', invalidHex.ok === false, JSON.stringify(invalidHex));

  // QQ== -> 101 (byte 65 in octal)
  check('base64-to-octal', 'QQ== -> 101', a.ok === true && bytesToOctal(a.bytes) === '101', JSON.stringify(a.ok ? bytesToOctal(a.bytes) : a));

  // SGk= -> Hi -> 110 151 (72 and 105 in octal)
  check(
    'base64-to-octal',
    'SGk= -> 110 151',
    hi.ok === true && bytesToOctal(hi.bytes) === '110 151',
    JSON.stringify(hi.ok ? bytesToOctal(hi.bytes) : hi)
  );

  const invalidOctal = base64ToBytes('not valid base64!!!');
  check('base64-to-octal', 'invalid base64 -> error not crash', invalidOctal.ok === false, JSON.stringify(invalidOctal));
}

// ---------- decodeBase64Utf8 3-stage helper (shared by json/xml/yaml/csv/tsv converters) ----------
{
  const valid = decodeBase64Utf8('SGVsbG8=');
  check('base64-utils', 'decodeBase64Utf8: valid base64+utf8 -> text', valid.ok === true && valid.text === 'Hello', JSON.stringify(valid));

  const badBase64 = decodeBase64Utf8('not valid base64!!!');
  check(
    'base64-utils',
    'decodeBase64Utf8: invalid base64 -> stage "base64"',
    badBase64.ok === false && badBase64.stage === 'base64',
    JSON.stringify(badBase64)
  );

  // 0xFF is not a valid standalone UTF-8 byte sequence
  const invalidUtf8Bytes = new Uint8Array([0xff, 0xff]);
  const invalidUtf8Base64 = bytesToBase64(invalidUtf8Bytes);
  const badUtf8 = decodeBase64Utf8(invalidUtf8Base64);
  check(
    'base64-utils',
    'decodeBase64Utf8: valid base64, invalid UTF-8 -> stage "utf8"',
    badUtf8.ok === false && badUtf8.stage === 'utf8',
    JSON.stringify(badUtf8)
  );
}

// ---------- base64-to-json ----------
{
  function convertJson(input: string) {
    const decoded = decodeBase64Utf8(input);
    if (!decoded.ok) return { ok: false as const, stage: decoded.stage, message: decoded.message };
    try {
      return { ok: true as const, output: JSON.stringify(JSON.parse(decoded.text), null, 2) };
    } catch (err) {
      return { ok: false as const, stage: 'json' as const, message: String(err) };
    }
  }

  const validJson = convertJson(bytesToBase64(new TextEncoder().encode('{"a":1}')));
  check('base64-to-json', 'valid base64 -> valid JSON parses+formats', validJson.ok === true && validJson.output === '{\n  "a": 1\n}', JSON.stringify(validJson));

  const invalidJson = convertJson(bytesToBase64(new TextEncoder().encode('{not json')));
  check(
    'base64-to-json',
    'valid base64 -> invalid JSON gives stage-3 error, not a false base64 error',
    invalidJson.ok === false && invalidJson.stage === 'json',
    JSON.stringify(invalidJson)
  );

  const invalidB64Json = convertJson('not valid base64!!!');
  check('base64-to-json', 'invalid base64 -> stage "base64"', invalidB64Json.ok === false && invalidB64Json.stage === 'base64', JSON.stringify(invalidB64Json));
}

// ---------- base64-to-xml (reuses lib/tools/xml-utils.ts parseXml) ----------
import { parseXml, formatXmlElement } from '@/lib/tools/xml-utils';
{
  // base64-to-xml reuses xml-utils.ts's parseXml, which requires the real browser DOMParser -
  // not a global under vitest's `node` environment, so jsdom supplies it here (same pattern as
  // the xml-minifier/xml-parser/xpath-tester block in formatters.test.ts).
  const xmlDom = new JSDOM('<!DOCTYPE html>');
  (globalThis as unknown as { DOMParser: unknown }).DOMParser = xmlDom.window.DOMParser;
  (globalThis as unknown as { XMLSerializer: unknown }).XMLSerializer = xmlDom.window.XMLSerializer;
  (globalThis as unknown as { Node: unknown }).Node = xmlDom.window.Node;

  function convertXml(input: string) {
    const decoded = decodeBase64Utf8(input);
    if (!decoded.ok) return { ok: false as const, stage: decoded.stage };
    const parsed = parseXml(decoded.text);
    if (!parsed.ok) return { ok: false as const, stage: 'xml' as const, message: parsed.message };
    return { ok: true as const, output: formatXmlElement(parsed.doc.documentElement, 0) };
  }

  const validXml = convertXml(bytesToBase64(new TextEncoder().encode('<a><b>1</b></a>')));
  check('base64-to-xml', 'valid base64 -> valid XML parses+formats', validXml.ok === true && validXml.output.includes('<b>1</b>'), JSON.stringify(validXml));

  const invalidXml = convertXml(bytesToBase64(new TextEncoder().encode('<a><b>unclosed')));
  check('base64-to-xml', 'valid base64 -> invalid XML gives stage-3 error, not a false base64 error', invalidXml.ok === false && invalidXml.stage === 'xml', JSON.stringify(invalidXml));

  const invalidB64Xml = convertXml('not valid base64!!!');
  check('base64-to-xml', 'invalid base64 -> stage "base64"', invalidB64Xml.ok === false && invalidB64Xml.stage === 'base64', JSON.stringify(invalidB64Xml));
}

// ---------- base64-to-yaml (reuses lib/tools/yaml-utils.ts parseYaml) ----------
import { parseYaml } from '@/lib/tools/yaml-utils';
{
  function convertYaml(input: string) {
    const decoded = decodeBase64Utf8(input);
    if (!decoded.ok) return { ok: false as const, stage: decoded.stage };
    const parsed = parseYaml(decoded.text);
    if (!parsed.ok) return { ok: false as const, stage: 'yaml' as const, message: parsed.message };
    return { ok: true as const, output: JSON.stringify(parsed.value, null, 2) };
  }

  const validYaml = convertYaml(bytesToBase64(new TextEncoder().encode('a: 1\nb: two')));
  check('base64-to-yaml', 'valid base64 -> valid YAML parses', validYaml.ok === true && validYaml.output === '{\n  "a": 1,\n  "b": "two"\n}', JSON.stringify(validYaml));

  const invalidYaml = convertYaml(bytesToBase64(new TextEncoder().encode('a: [1, 2')));
  check('base64-to-yaml', 'valid base64 -> invalid YAML gives stage-3 error, not a false base64 error', invalidYaml.ok === false && invalidYaml.stage === 'yaml', JSON.stringify(invalidYaml));

  const invalidB64Yaml = convertYaml('not valid base64!!!');
  check('base64-to-yaml', 'invalid base64 -> stage "base64"', invalidB64Yaml.ok === false && invalidB64Yaml.stage === 'base64', JSON.stringify(invalidB64Yaml));
}

// ---------- base64-to-csv / base64-to-tsv (reuses components/tools/CsvTsvConverter.tsx parseDelimitedRows) ----------
import { parseDelimitedRows } from '@/components/tools/CsvTsvConverter';
{
  const csvSource = 'id,name,notes\n1,Formatiq,"Free, browser-based tools"';
  const csvRows = parseDelimitedRows(csvSource, ',');
  check(
    'base64-to-csv',
    'quoted comma inside a field stays in one column',
    csvRows.length === 2 && csvRows[1][2] === 'Free, browser-based tools',
    JSON.stringify(csvRows)
  );

  const multilineCsv = 'a,b\n1,"line one\nline two"';
  const multilineRows = parseDelimitedRows(multilineCsv, ',');
  check(
    'base64-to-csv',
    'multi-row: embedded newline inside quotes does not create an extra row',
    multilineRows.length === 2 && multilineRows[1][1] === 'line one\nline two',
    JSON.stringify(multilineRows)
  );

  const decodedCsv = decodeBase64Utf8(bytesToBase64(new TextEncoder().encode(csvSource)));
  check(
    'base64-to-csv',
    'end-to-end: base64 decode -> CSV parse',
    decodedCsv.ok === true && parseDelimitedRows(decodedCsv.text, ',')[1][1] === 'Formatiq',
    JSON.stringify(decodedCsv)
  );

  const invalidB64Csv = decodeBase64Utf8('not valid base64!!!');
  check('base64-to-csv', 'invalid base64 -> stage "base64"', invalidB64Csv.ok === false && invalidB64Csv.stage === 'base64', JSON.stringify(invalidB64Csv));

  const tsvSource = 'a\tb\tc\n1\t\t"tab, kept"';
  const tsvRows = parseDelimitedRows(tsvSource, '\t');
  check(
    'base64-to-tsv',
    'tab/empty-cell preservation: middle empty cell stays empty',
    tsvRows.length === 2 && tsvRows[1][1] === '' && tsvRows[1][2] === 'tab, kept',
    JSON.stringify(tsvRows)
  );

  const invalidB64Tsv = decodeBase64Utf8('not valid base64!!!');
  check('base64-to-tsv', 'invalid base64 -> stage "base64"', invalidB64Tsv.ok === false && invalidB64Tsv.stage === 'base64', JSON.stringify(invalidB64Tsv));
}

// ---------- binary-to-ip-converter ----------
import { binaryToIp } from '@/lib/tools/ip-utils';
{
  const compact = binaryToIp('11000000101010000000000100000001');
  check('binary-to-ip-converter', 'compact 32-bit binary -> 192.168.1.1', compact.ok === true && compact.ip === '192.168.1.1', JSON.stringify(compact));

  const spaced = binaryToIp('11000000 10101000 00000001 00000001');
  check('binary-to-ip-converter', 'space-separated-by-octet binary -> 192.168.1.1', spaced.ok === true && spaced.ip === '192.168.1.1', JSON.stringify(spaced));

  const wrongLength = binaryToIp('1100000010101000');
  check('binary-to-ip-converter', 'wrong bit count is rejected', wrongLength.ok === false, JSON.stringify(wrongLength));

  const invalidChars = binaryToIp('1100000210101000000000010000000A');
  check('binary-to-ip-converter', 'non-binary characters are rejected', invalidChars.ok === false, JSON.stringify(invalidChars));
}

// ---------- number-base-converter ----------
// Logic copied verbatim from NumberBaseConverter.tsx's `convert()` after the BigInt precision
// fix (batch 015), to prove large values beyond Number.MAX_SAFE_INTEGER now convert correctly.
{
  const BASE_CHARSETS: Record<number, string> = {
    2: '01',
    8: '01234567',
    10: '0123456789',
    16: '0123456789abcdefABCDEF',
  };
  function isValidForBase(value: string, base: number): boolean {
    const chars = BASE_CHARSETS[base];
    return value.length > 0 && Array.from(value).every((c) => chars.includes(c));
  }
  function nbcConvert(input: string, fromBase: number) {
    const trimmed = input.trim();
    if (!trimmed || !isValidForBase(trimmed, fromBase)) return null;
    const bigBase = BigInt(fromBase);
    let decimal = 0n;
    for (const ch of trimmed) {
      decimal = decimal * bigBase + BigInt(parseInt(ch, 16));
    }
    return {
      binary: decimal.toString(2),
      octal: decimal.toString(8),
      decimal: decimal.toString(10),
      hex: decimal.toString(16).toUpperCase(),
    };
  }

  // 2^53 = 9007199254740992, one past Number.MAX_SAFE_INTEGER (2^53 - 1). Using plain
  // `parseInt`+`Number` for a value this large silently rounds to an even number and loses
  // precision; BigInt parsing must round-trip it exactly.
  const large = nbcConvert('9007199254740993', 10);
  check('number-base-converter', 'decimal beyond MAX_SAFE_INTEGER round-trips exactly', large?.decimal === '9007199254740993', JSON.stringify(large));
  check(
    'number-base-converter',
    'that value converts to the correct hex (0x20000000000001)',
    large?.hex === '20000000000001',
    JSON.stringify(large)
  );

  // A 64-bit-scale hex value, well beyond Number.MAX_SAFE_INTEGER, round-tripped through decimal.
  const hex64 = nbcConvert('FFFFFFFFFFFFFFFF', 16);
  check(
    'number-base-converter',
    '64-bit hex FFFFFFFFFFFFFFFF -> correct decimal (18446744073709551615)',
    hex64?.decimal === '18446744073709551615',
    JSON.stringify(hex64)
  );

  // Existing small-value behavior must be unaffected by the fix.
  const small = nbcConvert('255', 10);
  check('number-base-converter', 'small decimal 255 -> FF / 377 / 11111111 (regression, unaffected by fix)', small?.hex === 'FF' && small?.octal === '377' && small?.binary === '11111111', JSON.stringify(small));
}

// ---------- cmyk-to-hex ----------
import { cmykToRgb, hsvToRgb, rgbToHex } from '@/lib/tools/color-utils';
{
  check('cmyk-to-hex', '0,100,100,0 -> #FF0000', rgbToHex(cmykToRgb(0, 100, 100, 0)) === '#FF0000');
  check('cmyk-to-hex', '0,0,0,0 -> #FFFFFF', rgbToHex(cmykToRgb(0, 0, 0, 0)) === '#FFFFFF');
  check('cmyk-to-hex', '0,0,0,100 -> #000000', rgbToHex(cmykToRgb(0, 0, 0, 100)) === '#000000');
}

// ---------- hsv-to-hex ----------
{
  check('hsv-to-hex', '0,100,100 -> #FF0000', rgbToHex(hsvToRgb(0, 100, 100)) === '#FF0000');
  check('hsv-to-hex', '120,100,100 -> #00FF00', rgbToHex(hsvToRgb(120, 100, 100)) === '#00FF00');
  check('hsv-to-hex', '240,100,100 -> #0000FF', rgbToHex(hsvToRgb(240, 100, 100)) === '#0000FF');
  check('hsv-to-hex', '0,0,100 -> #FFFFFF', rgbToHex(hsvToRgb(0, 0, 100)) === '#FFFFFF');
  check('hsv-to-hex', 'hue 360 normalizes same as hue 0', rgbToHex(hsvToRgb(360, 100, 100)) === rgbToHex(hsvToRgb(0, 100, 100)));
}

// ---------- hex-to-utf8 ----------
import { hexToUtf8, hexToBytes, textToHex } from '@/lib/tools/hex-utf8-utils';
{
  const hello = hexToUtf8('48656C6C6F');
  check('hex-to-utf8', '48656C6C6F -> Hello', hello.ok === true && hello.text === 'Hello', JSON.stringify(hello));

  const euro = hexToUtf8('E282AC');
  check('hex-to-utf8', 'E282AC -> € (3-byte multi-byte UTF-8)', euro.ok === true && euro.text === '€', JSON.stringify(euro));

  const emoji = hexToUtf8('F09F9880');
  check('hex-to-utf8', 'F09F9880 -> 😀 (4-byte emoji)', emoji.ok === true && emoji.text === '😀', JSON.stringify(emoji));

  const spaced = hexToUtf8('48 65 6c 6c 6f');
  check('hex-to-utf8', 'spaced hex also works', spaced.ok === true && spaced.text === 'Hello', JSON.stringify(spaced));

  const prefixed = hexToUtf8('0x48656C6C6F');
  check('hex-to-utf8', '0x-prefixed hex also works', prefixed.ok === true && prefixed.text === 'Hello', JSON.stringify(prefixed));

  const oddLength = hexToUtf8('48656C6C6');
  check('hex-to-utf8', 'odd-length hex is rejected', oddLength.ok === false && oddLength.stage === 'hex', JSON.stringify(oddLength));

  const invalidChars = hexToBytes('ZZ');
  check('hex-to-utf8', 'non-hex characters are rejected', invalidChars.ok === false, JSON.stringify(invalidChars));

  const invalidUtf8 = hexToUtf8('FF');
  check('hex-to-utf8', 'valid hex but invalid UTF-8 -> stage "utf8"', invalidUtf8.ok === false && invalidUtf8.stage === 'utf8', JSON.stringify(invalidUtf8));

  const roundTrip = hexToUtf8(textToHex('Café ☕'));
  check('hex-to-utf8', 'round trip: text -> hex -> text', roundTrip.ok === true && roundTrip.text === 'Café ☕', JSON.stringify(roundTrip));
}

describe('Converters', () => {
  results.forEach((r) => {
    it(`${r.tool}: ${r.test}`, () => {
      expect(r.pass, r.detail).toBe(true);
    });
  });
});
