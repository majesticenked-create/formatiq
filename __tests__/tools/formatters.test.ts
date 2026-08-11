import { describe, it, expect } from 'vitest';

// Logic copied verbatim from the corresponding component file(s) in components/tools/
// to test in isolation without modifying the real components (many tools embed their
// pure logic directly in the component rather than exporting it separately).

// Test harness for Formatters category. Logic copied verbatim from each
// component file (not modified) to test in isolation without touching
// the real components.

const results: { tool: string; test: string; pass: boolean; detail?: string }[] = [];
function check(tool: string, test: string, pass: boolean, detail?: string) {
  results.push({ tool, test, pass, detail });
}

// ---------- json-formatter ----------
function jsonTryFormat(input: string, indent: number) {
  try {
    const parsed = JSON.parse(input);
    return { ok: true as const, output: JSON.stringify(parsed, null, indent) };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid JSON' };
  }
}
{
  const good = jsonTryFormat('{"a":1}', 2);
  check('json-formatter', 'valid input', good.ok === true && good.output === '{\n  "a": 1\n}');
  const bad = jsonTryFormat('{a:1}', 2);
  check('json-formatter', 'invalid input -> error not crash', bad.ok === false);
  const empty = jsonTryFormat('', 2);
  check('json-formatter', 'empty input -> error', empty.ok === false);
}

// ---------- html-minifier ----------
function minifyHtml(input: string) {
  let output = input;
  output = output.replace(/<!--[\s\S]*?-->/g, '');
  output = output.replace(/>\s+</g, '><');
  output = output.replace(/[ \t]+/g, ' ');
  output = output.replace(/\n\s*/g, '');
  output = output.trim();
  return output;
}
function htmlMinTryMinify(input: string) {
  if (!input.trim()) return { ok: false as const, message: 'Paste some HTML to minify.' };
  const output = minifyHtml(input);
  const before = new Blob([input]).size;
  const after = new Blob([output]).size;
  return { ok: true as const, output, before, after };
}
{
  const good = htmlMinTryMinify('<div>\n  <!-- c -->\n  <p>Hi   there</p>\n</div>');
  check('html-minifier', 'valid input strips comment+whitespace', good.ok === true && !good.output.includes('<!--') && good.after < good.before, JSON.stringify(good));
  const empty = htmlMinTryMinify('   ');
  check('html-minifier', 'empty/whitespace-only input -> error', empty.ok === false);
  const noTags = htmlMinTryMinify('just text, no tags');
  check('html-minifier', 'edge case: no tags at all -> still succeeds unchanged-ish', noTags.ok === true && noTags.output === 'just text, no tags', JSON.stringify(noTags));
}

// ---------- css-minifier ----------
function minifyCss(input: string) {
  let output = input;
  output = output.replace(/\/\*[\s\S]*?\*\//g, '');
  output = output.replace(/\s*([{}:;,])\s*/g, '$1');
  output = output.replace(/;}/g, '}');
  output = output.replace(/\s+/g, ' ');
  output = output.trim();
  return output;
}
function cssMinTryMinify(input: string) {
  if (!input.trim()) return { ok: false as const, message: 'Paste some CSS to minify.' };
  const output = minifyCss(input);
  return { ok: true as const, output };
}
{
  const good = cssMinTryMinify('.a {\n  color: red;\n}\n/* c */\n.b { color: blue; }');
  check('css-minifier', 'valid input', good.ok === true && good.output === '.a{color:red}.b{color:blue}', JSON.stringify(good));
  const empty = cssMinTryMinify('');
  check('css-minifier', 'empty input -> error', empty.ok === false);
  const malformed = cssMinTryMinify('.a { color: red'); // unclosed brace
  check('css-minifier', 'edge case: unclosed brace does not crash', malformed.ok === true, JSON.stringify(malformed));
}

// ---------- js-minifier ----------
function minifyJs(input: string) {
  let output = '';
  let i = 0;
  const len = input.length;
  while (i < len) {
    const ch = input[i];
    const next = input[i + 1];
    if (ch === '/' && next === '/') {
      while (i < len && input[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < len && !(input[i] === '*' && input[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      output += ch;
      i++;
      while (i < len && input[i] !== quote) {
        if (input[i] === '\\' && i + 1 < len) {
          output += input[i] + input[i + 1];
          i += 2;
          continue;
        }
        output += input[i];
        i++;
      }
      if (i < len) {
        output += input[i];
        i++;
      }
      continue;
    }
    output += ch;
    i++;
  }
  output = output.replace(/[ \t]+/g, ' ');
  output = output.replace(/\n[ \t]*/g, '\n');
  output = output.replace(/\n{2,}/g, '\n');
  output = output.trim();
  return output;
}
function jsMinTryMinify(input: string) {
  if (!input.trim()) return { ok: false as const, message: 'Paste some JavaScript to minify.' };
  const output = minifyJs(input);
  return { ok: true as const, output };
}
{
  const good = jsMinTryMinify('// comment\nfunction add(a,b) {\n  return a+b;\n}');
  check('js-minifier', 'valid input strips comment', good.ok === true && !good.output.includes('comment'), JSON.stringify(good));
  const empty = jsMinTryMinify('');
  check('js-minifier', 'empty input -> error', empty.ok === false);
  const stringWithSlashes = jsMinTryMinify('const url = "http://example.com"; // real comment');
  check(
    'js-minifier',
    'edge case: string containing // is not treated as comment',
    stringWithSlashes.ok === true && stringWithSlashes.output.includes('"http://example.com"') && !stringWithSlashes.output.includes('real comment'),
    JSON.stringify(stringWithSlashes)
  );
}

// ---------- sql-formatter ----------
const MAJOR_CLAUSES = ['SELECT','FROM','WHERE','GROUP BY','ORDER BY','HAVING','LIMIT','INSERT INTO','VALUES','UPDATE','SET','DELETE FROM','UNION ALL','UNION'];
const JOIN_CLAUSES = ['LEFT JOIN','RIGHT JOIN','INNER JOIN','FULL JOIN','JOIN'];
const KEYWORDS = [...MAJOR_CLAUSES, ...JOIN_CLAUSES, 'ON','AND','OR','NOT','IN','IS','NULL','AS','DISTINCT','BETWEEN','LIKE','DESC','ASC','COUNT','SUM','AVG','MIN','MAX'];
function capitalizeKeywords(sql: string): string {
  let result = sql;
  const sortedKeywords = [...KEYWORDS].sort((a, b) => b.length - a.length);
  for (const kw of sortedKeywords) {
    const pattern = new RegExp(`\\b${kw.replace(/ /g, '\\s+')}\\b`, 'gi');
    result = result.replace(pattern, kw);
  }
  return result;
}
function addLineBreaks(sql: string): string {
  let result = sql;
  for (const clause of MAJOR_CLAUSES) {
    const pattern = new RegExp(`\\s*\\b${clause.replace(/ /g, '\\s+')}\\b`, 'g');
    result = result.replace(pattern, `\n${clause}`);
  }
  for (const clause of JOIN_CLAUSES) {
    const pattern = new RegExp(`\\s*\\b${clause.replace(/ /g, '\\s+')}\\b`, 'g');
    result = result.replace(pattern, `\n  ${clause}`);
  }
  result = result.replace(/\s+\bAND\b/g, '\n  AND');
  result = result.replace(/\s+\bOR\b/g, '\n  OR');
  result = result.replace(/,\s*/g, ',\n  ');
  return result.split('\n').map((line) => line.trim()).filter(Boolean).join('\n');
}
function formatSql(input: string): string {
  const capitalized = capitalizeKeywords(input.trim().replace(/\s+/g, ' '));
  return addLineBreaks(capitalized);
}
function sqlTryFormat(input: string) {
  if (!input.trim()) return { ok: false as const, message: 'Paste a SQL statement to format.' };
  return { ok: true as const, output: formatSql(input) };
}
{
  const good = sqlTryFormat('select a from t where b=1');
  check('sql-formatter', 'valid input capitalizes+breaks lines', good.ok === true && good.output.includes('SELECT') && good.output.includes('\nFROM'), JSON.stringify(good));
  const empty = sqlTryFormat('   ');
  check('sql-formatter', 'empty input -> error', empty.ok === false);
  const gibberish = sqlTryFormat('asdkfj alskdjf');
  check('sql-formatter', 'edge case: non-SQL text does not crash', gibberish.ok === true, JSON.stringify(gibberish));
}

// ---------- css-formatter / html-formatter / js-formatter (js-beautify) ----------
const jsBeautify = require('js-beautify');
{
  try {
    const out = jsBeautify.css_beautify('.a{color:red}', { indent_size: 2 });
    check('css-formatter', 'valid input beautifies', typeof out === 'string' && out.includes('color: red'), out);
  } catch (e) {
    check('css-formatter', 'valid input beautifies', false, String(e));
  }
  // css_beautify doesn't throw on malformed input, it's lenient - verify no crash
  try {
    const out = jsBeautify.css_beautify('.a{color:red'); // unclosed
    check('css-formatter', 'malformed input does not crash (lenient beautifier)', typeof out === 'string', out);
  } catch (e) {
    check('css-formatter', 'malformed input does not crash', false, String(e));
  }
  try {
    const out = jsBeautify.css_beautify('');
    check('css-formatter', 'empty input handled', out === '', JSON.stringify(out));
  } catch (e) {
    check('css-formatter', 'empty input handled', false, String(e));
  }
}
{
  try {
    const out = jsBeautify.html_beautify('<div><p>hi</p></div>');
    check('html-formatter', 'valid input beautifies', typeof out === 'string' && out.includes('<div>'), out);
  } catch (e) {
    check('html-formatter', 'valid input beautifies', false, String(e));
  }
  try {
    const out = jsBeautify.html_beautify('<div><p>unclosed');
    check('html-formatter', 'malformed/unclosed tags do not crash', typeof out === 'string', out);
  } catch (e) {
    check('html-formatter', 'malformed/unclosed tags do not crash', false, String(e));
  }
  try {
    const out = jsBeautify.html_beautify('');
    check('html-formatter', 'empty input handled', out === '', JSON.stringify(out));
  } catch (e) {
    check('html-formatter', 'empty input handled', false, String(e));
  }
}
{
  try {
    const out = jsBeautify.js_beautify('function a(b,c){return b+c;}');
    check('js-formatter', 'valid input beautifies', typeof out === 'string' && out.includes('function'), out);
  } catch (e) {
    check('js-formatter', 'valid input beautifies', false, String(e));
  }
  try {
    const out = jsBeautify.js_beautify('function a( { syntax error');
    check('js-formatter', 'malformed JS does not crash beautifier', typeof out === 'string', out);
  } catch (e) {
    check('js-formatter', 'malformed JS does not crash beautifier', false, String(e));
  }
  try {
    const out = jsBeautify.js_beautify('');
    check('js-formatter', 'empty input handled', out === '', JSON.stringify(out));
  } catch (e) {
    check('js-formatter', 'empty input handled', false, String(e));
  }
}

// ---------- yaml-formatter (js-yaml) ----------
const yaml = require('js-yaml');
function yamlTryFormat(input: string, indent: number) {
  if (!input.trim()) return { ok: false as const, message: 'Paste some YAML to format.' };
  let parsed: unknown;
  try {
    parsed = yaml.load(input);
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid YAML' };
  }
  try {
    const output = yaml.dump(parsed, { indent });
    return { ok: true as const, output };
  } catch (err) {
    return { ok: false as const, message: 'Could not re-format this YAML.' };
  }
}
{
  const good = yamlTryFormat('a: 1\nb:\n  - x\n  - y\n', 2);
  check('yaml-formatter', 'valid input round-trips', good.ok === true && good.output.includes('a: 1'), JSON.stringify(good));
  const bad = yamlTryFormat('a: [1, 2\nb: broken', 2); // malformed brackets
  check('yaml-formatter', 'invalid YAML -> error not crash', bad.ok === false, JSON.stringify(bad));
  const empty = yamlTryFormat('', 2);
  check('yaml-formatter', 'empty input -> error', empty.ok === false);
}

// ---------- html-viewer (pure sub-functions: lintHtml, tokenizeHtml, injectConsoleShim) ----------
const VOID_ELEMENTS = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
function lintHtml(html: string): string[] {
  const warnings: string[] = [];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g;
  const stack: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(html))) {
    const full = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = full.startsWith('</');
    const isSelfClosing = full.endsWith('/>') || VOID_ELEMENTS.has(tagName);
    if (isClosing) {
      if (stack.length === 0) {
        warnings.push(`Unexpected closing tag </${tagName}> with no matching open tag.`);
      } else if (stack[stack.length - 1] !== tagName) {
        warnings.push(`Mismatched tag: expected </${stack[stack.length - 1]}> but found </${tagName}>.`);
        const idx = stack.lastIndexOf(tagName);
        if (idx !== -1) stack.length = idx;
        else stack.pop();
      } else {
        stack.pop();
      }
    } else if (!isSelfClosing) {
      stack.push(tagName);
    }
  }
  stack.slice().reverse().forEach((tag) => warnings.push(`Unclosed tag: <${tag}> was never closed.`));
  const idRegex = /\sid=["']([^"']+)["']/g;
  const idCounts = new Map<string, number>();
  let idMatch: RegExpExecArray | null;
  while ((idMatch = idRegex.exec(html))) {
    const id = idMatch[1];
    idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
  }
  idCounts.forEach((count, id) => {
    if (count > 1) warnings.push(`Duplicate id "${id}" used ${count} times.`);
  });
  return warnings;
}
{
  const good = lintHtml('<div><p>hi</p></div>');
  check('html-viewer (lintHtml)', 'valid well-formed HTML -> no warnings', good.length === 0, JSON.stringify(good));
  const bad = lintHtml('<div><p>hi</div>'); // mismatched
  check('html-viewer (lintHtml)', 'mismatched tags -> warning not crash', bad.length > 0, JSON.stringify(bad));
  const dupIds = lintHtml('<div id="a"></div><span id="a"></span>');
  check('html-viewer (lintHtml)', 'edge case: duplicate ids detected', dupIds.some((w) => w.includes('Duplicate id')), JSON.stringify(dupIds));
}

// Print results

describe('Formatters', () => {
  results.forEach((r) => {
    it(`${r.tool}: ${r.test}`, () => {
      expect(r.pass, r.detail).toBe(true);
    });
  });
});
