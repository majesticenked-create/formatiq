import { describe, it, expect } from 'vitest';
import { parse as graphqlParse, print as graphqlPrint, GraphQLError } from 'graphql';

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

// ---------- graphql-formatter ----------
// This exercises the real `graphql` package (parse + print), same as the
// component, rather than copied logic - the component is a thin wrapper
// around it.
function graphqlTryFormat(input: string) {
  if (!input.trim()) {
    return { ok: false as const, message: 'Paste a GraphQL query, mutation, or schema to format.' };
  }
  try {
    const ast = graphqlParse(input);
    return { ok: true as const, output: graphqlPrint(ast) };
  } catch (err) {
    if (err instanceof GraphQLError) {
      const loc = err.locations?.[0];
      const where = loc ? ` (line ${loc.line}, column ${loc.column})` : '';
      return { ok: false as const, message: `${err.message}${where}` };
    }
    return { ok: false as const, message: err instanceof Error ? err.message : 'Could not parse this GraphQL document.' };
  }
}
{
  const validQuery = graphqlTryFormat('query GetUser($id:ID!){user(id:$id){id name}}');
  check('graphql-formatter', 'valid query is parsed and printed', validQuery.ok === true, JSON.stringify(validQuery));
  check(
    'graphql-formatter',
    'printed output preserves field selection',
    validQuery.ok === true && validQuery.output.includes('user(id: $id)') && validQuery.output.includes('name'),
    validQuery.ok ? validQuery.output : ''
  );

  const invalidQuery = graphqlTryFormat('query { user( }');
  check('graphql-formatter', 'invalid syntax -> error, not a crash', invalidQuery.ok === false, JSON.stringify(invalidQuery));
  check(
    'graphql-formatter',
    'invalid syntax error includes a location',
    invalidQuery.ok === false && /line \d+, column \d+/.test(invalidQuery.message),
    invalidQuery.ok === false ? invalidQuery.message : ''
  );

  const empty = graphqlTryFormat('');
  check('graphql-formatter', 'empty input -> friendly message, not a parser error', empty.ok === false, JSON.stringify(empty));

  const mutation = graphqlTryFormat('mutation{createPost(input:{title:"Hi"}){id}}');
  check('graphql-formatter', 'mutation with input object is parsed', mutation.ok === true, JSON.stringify(mutation));

  const schema = graphqlTryFormat('type Query { user(id: ID!): User } type User { id: ID! name: String }');
  check('graphql-formatter', 'schema definition language (SDL) is parsed', schema.ok === true, JSON.stringify(schema));

  const fragment = graphqlTryFormat('query { user { ...UserFields } } fragment UserFields on User { id name }');
  check('graphql-formatter', 'query with fragment is parsed', fragment.ok === true, JSON.stringify(fragment));
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

// ---------- bbcode-editor ----------
const ALLOWED_COLORS = new Set(['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'black', 'white']);
function bbEscapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function bbIsSafeUrl(raw: string): boolean {
  return /^https?:\/\/[^\s"'<>]+$/i.test(raw.trim());
}
function bbcodeToSafeHtml(raw: string): string {
  let text = bbEscapeHtml(raw);
  const simple: [RegExp, string, string][] = [
    [/\[b\]([\s\S]*?)\[\/b\]/gi, '<b>', '</b>'],
    [/\[i\]([\s\S]*?)\[\/i\]/gi, '<i>', '</i>'],
  ];
  for (const [pattern, open, close] of simple) {
    text = text.replace(pattern, (_m, inner: string) => `${open}${inner}${close}`);
  }
  text = text.replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, (_m, href: string, label: string) => {
    if (!bbIsSafeUrl(href)) return bbEscapeHtml(label);
    return `<a href="${bbEscapeHtml(href)}">${label}</a>`;
  });
  text = text.replace(/\[color=([a-zA-Z]+)\]([\s\S]*?)\[\/color\]/gi, (_m, color: string, inner: string) => {
    const safe = ALLOWED_COLORS.has(color.toLowerCase()) ? color.toLowerCase() : null;
    return safe ? `<span style="color:${safe}">${inner}</span>` : inner;
  });
  return text;
}
{
  const out = bbcodeToSafeHtml('[b]<script>alert(1)</script>[/b]');
  check(
    'bbcode-editor',
    'script injection inside [b] is neutralized, not executed',
    out.includes('&lt;script&gt;') && !out.includes('<script>'),
    out
  );
  const link = bbcodeToSafeHtml('[url=javascript:alert(1)]click[/url]');
  check('bbcode-editor', 'javascript: URL scheme is rejected', !link.includes('javascript:'), link);
  const goodLink = bbcodeToSafeHtml('[url=https://example.com]click[/url]');
  check('bbcode-editor', 'valid https URL is allowed', goodLink.includes('href="https://example.com"'), goodLink);
  const color = bbcodeToSafeHtml('[color=red]hi[/color]');
  check('bbcode-editor', 'allowlisted color is applied', color.includes('color:red'), color);
  const badColor = bbcodeToSafeHtml('[color=expression(alert(1))]hi[/color]');
  check(
    'bbcode-editor',
    'non-allowlisted color value never reaches a style attribute',
    !badColor.includes('style="color:expression'),
    badColor
  );
}

// ---------- java-formatter ----------
interface JavaToken {
  type: 'code' | 'string' | 'char' | 'comment';
  text: string;
}
function javaTokenize(input: string): JavaToken[] {
  const tokens: JavaToken[] = [];
  let i = 0;
  let buf = '';
  const flush = () => {
    if (buf) {
      tokens.push({ type: 'code', text: buf });
      buf = '';
    }
  };
  while (i < input.length) {
    const ch = input[i];
    const two = input.slice(i, i + 2);
    if (ch === '"') {
      flush();
      let str = ch;
      i++;
      while (i < input.length) {
        const c = input[i];
        if (c === '\\' && i + 1 < input.length) {
          str += c + input[i + 1];
          i += 2;
          continue;
        }
        str += c;
        i++;
        if (c === '"' || c === '\n') break;
      }
      tokens.push({ type: 'string', text: str });
      continue;
    }
    if (ch === "'") {
      flush();
      let str = ch;
      i++;
      while (i < input.length) {
        const c = input[i];
        if (c === '\\' && i + 1 < input.length) {
          str += c + input[i + 1];
          i += 2;
          continue;
        }
        str += c;
        i++;
        if (c === "'" || c === '\n') break;
      }
      tokens.push({ type: 'char', text: str });
      continue;
    }
    if (two === '//') {
      flush();
      const start = i;
      while (i < input.length && input[i] !== '\n') i++;
      tokens.push({ type: 'comment', text: input.slice(start, i) });
      continue;
    }
    if (two === '/*') {
      flush();
      const start = i;
      i += 2;
      while (i < input.length && input.slice(i, i + 2) !== '*/') i++;
      i += 2;
      tokens.push({ type: 'comment', text: input.slice(start, Math.min(i, input.length)) });
      continue;
    }
    buf += ch;
    i++;
  }
  flush();
  return tokens;
}
function formatJavaForTest(input: string): string {
  if (input.includes('"""')) throw new Error('text blocks unsupported');
  const tokens = javaTokenize(input);
  let out = '';
  let parenDepth = 0;
  for (const token of tokens) {
    if (token.type !== 'code') {
      out += token.text;
      if (token.type === 'comment') out += '\n';
      continue;
    }
    for (const ch of token.text) {
      if (ch === '(') { parenDepth++; out += ch; continue; }
      if (ch === ')') { parenDepth--; out += ch; continue; }
      if (ch === '{') { out += '{\n'; continue; }
      if (ch === '}') { out += '\n}\n'; continue; }
      if (ch === ';') { out += parenDepth <= 0 ? ';\n' : ';'; continue; }
      out += ch;
    }
  }
  const rawLines = out.split('\n').map((l) => l.trim()).filter(Boolean);
  let depth = 0;
  const indented: string[] = [];
  for (const line of rawLines) {
    const leadingCloses = /^\}/.test(line) ? 1 : 0;
    const thisDepth = Math.max(0, depth - leadingCloses);
    indented.push('    '.repeat(thisDepth) + line);
    let opens = 0, closes = 0;
    for (const ch of line) { if (ch === '{') opens++; if (ch === '}') closes++; }
    depth = Math.max(0, depth + opens - closes);
  }
  return indented.join('\n');
}
{
  const input = 'class A {\nvoid m() {\nif (true) {\nString s = "a { fake brace } b";\n}\n}\n}';
  const out = formatJavaForTest(input);
  check('java-formatter', 'brace inside string does not corrupt indentation', out.includes('"a { fake brace } b"'), out);
  check('java-formatter', 'nested braces are indented', out.split('\n').some((l) => l.startsWith('        ')), out);
  const comment = formatJavaForTest('class A { // has a { brace in a comment\nint x = 1;\n}');
  check('java-formatter', 'brace inside line comment does not corrupt structure', comment.includes('// has a { brace in a comment'), comment);
  let threw = false;
  try {
    formatJavaForTest('class A { String s = """block { with braces }"""; }');
  } catch {
    threw = true;
  }
  check('java-formatter', 'text blocks are rejected rather than mangled', threw);
}

// Print results

describe('Formatters', () => {
  results.forEach((r) => {
    it(`${r.tool}: ${r.test}`, () => {
      expect(r.pass, r.detail).toBe(true);
    });
  });
});
