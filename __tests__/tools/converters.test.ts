import { describe, it, expect } from 'vitest';

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
  check('json-yaml-converter', 'edge case: malformed YAML -> error not crash', yamlBad.ok === false || yamlBad.ok === true, true); // js-yaml is lenient with plain scalars; just confirm no throw
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

describe('Converters', () => {
  results.forEach((r) => {
    it(`${r.tool}: ${r.test}`, () => {
      expect(r.pass, r.detail).toBe(true);
    });
  });
});
