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
// Exercises the real `sql-formatter` package (same as the component), a purpose-built
// SQL parser/pretty-printer rather than pattern-matched logic.
import { format as sqlFormatLib } from 'sql-formatter';
function sqlTryFormat(input: string, dialect: 'sql' | 'mysql' | 'postgresql' | 'transactsql' | 'sqlite' | 'plsql' = 'sql') {
  if (!input.trim()) return { ok: false as const, message: 'Paste a SQL statement to format.' };
  try {
    return { ok: true as const, output: sqlFormatLib(input, { language: dialect, keywordCase: 'upper' }) };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Could not format this SQL.' };
  }
}
{
  const good = sqlTryFormat('select a from t where b=1');
  check('sql-formatter', 'valid input capitalizes+breaks lines', good.ok === true && good.output.includes('SELECT') && good.output.includes('\nFROM'), JSON.stringify(good));

  const empty = sqlTryFormat('   ');
  check('sql-formatter', 'empty input -> error', empty.ok === false);

  const joinQuery = sqlTryFormat('select u.id, o.total from users u join orders o on o.user_id = u.id where o.total > 100 and u.active = true');
  check(
    'sql-formatter',
    'JOIN with compound WHERE is formatted',
    joinQuery.ok === true && joinQuery.output.includes('JOIN') && joinQuery.output.includes('WHERE') && joinQuery.output.includes('AND'),
    JSON.stringify(joinQuery)
  );

  const nested = sqlTryFormat('select id from (select id from t where active = true) sub where id > 1');
  check(
    'sql-formatter',
    'nested subquery does not crash and preserves structure',
    nested.ok === true && nested.output.includes('SELECT') && nested.output.includes('('),
    JSON.stringify(nested)
  );

  const withComment = sqlTryFormat('select a from t -- trailing comment\nwhere b = 1');
  check(
    'sql-formatter',
    'inline comment is preserved',
    withComment.ok === true && withComment.output.includes('-- trailing comment'),
    JSON.stringify(withComment)
  );

  const dialectSpecific = sqlTryFormat('SELECT TOP 10 * FROM t', 'transactsql');
  check('sql-formatter', 'T-SQL dialect handles TOP clause', dialectSpecific.ok === true, JSON.stringify(dialectSpecific));

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

// ---------- json5-validator ----------
import JSON5 from 'json5';

function json5Validate(input: string) {
  try {
    const parsed = JSON5.parse(input);
    return { ok: true as const, output: JSON.stringify(parsed, null, 2) };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid JSON5' };
  }
}
{
  const comments = json5Validate('{\n  // a comment\n  a: 1,\n}');
  check('json5-validator', 'comments and trailing commas are accepted', comments.ok === true, JSON.stringify(comments));

  const unquoted = json5Validate("{a:1, b:'two', c:[1,2,3,]}");
  check('json5-validator', 'unquoted keys and single-quoted strings are accepted', unquoted.ok === true, JSON.stringify(unquoted));
  check(
    'json5-validator',
    'parses to the correct strict-JSON equivalent',
    unquoted.ok === true && unquoted.output.includes('"b": "two"'),
    unquoted.ok ? unquoted.output : ''
  );

  const invalid = json5Validate('{a: 1,,}');
  check('json5-validator', 'genuinely invalid JSON5 is rejected, not a crash', invalid.ok === false, JSON.stringify(invalid));

  const strictJson = json5Validate('{"a":1,"b":[1,2,3]}');
  check('json5-validator', 'plain strict JSON is also valid JSON5', strictJson.ok === true, JSON.stringify(strictJson));
}

// ---------- less-compiler ----------
import less from 'less';

{
  const simple = await less.render('@c: red; .x { color: @c; }', { syncImport: false }).then(
    (r) => ({ ok: true as const, css: r.css }),
    (err: unknown) => ({ ok: false as const, message: String(err) })
  );
  check('less-compiler', 'variable resolves to a plain CSS value', simple.ok === true && simple.css.includes('color: red'), JSON.stringify(simple));

  const nested = await less
    .render('.a { .b { color: blue; } }', { syncImport: false })
    .then((r) => ({ ok: true as const, css: r.css }), (err: unknown) => ({ ok: false as const, message: String(err) }));
  check(
    'less-compiler',
    'nested selectors are flattened into plain CSS',
    nested.ok === true && nested.css.includes('.a .b') && nested.css.includes('color: blue'),
    JSON.stringify(nested)
  );

  const invalid = await less
    .render('.a { color: red;', { syncImport: false })
    .then((r) => ({ ok: true as const, css: r.css }), (err: unknown) => ({ ok: false as const, message: String(err) }));
  check('less-compiler', 'invalid LESS produces a clear error, not a crash', invalid.ok === false, JSON.stringify(invalid));
}

// ---------- less-formatter ----------
import { css_beautify } from 'js-beautify';

{
  const out = css_beautify('@primary:#333;.box{color:@primary;.child{margin:10px;}}', { indent_size: 2 });
  check('less-formatter', 'reformats without throwing', typeof out === 'string' && out.length > 0, out);
  check('less-formatter', 'preserves @variable syntax as literal text', out.includes('@primary'), out);
  check('less-formatter', 'preserves nested rule structure', out.includes('.child'), out);
}

// ---------- markdown-editor ----------
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

{
  const dom = new JSDOM('<!DOCTYPE html>');
  const purify = DOMPurify(dom.window as unknown as Window & typeof globalThis);

  function renderSanitized(markdown: string): string {
    const rawHtml = marked.parse(markdown, { async: false }) as string;
    return purify.sanitize(rawHtml, {
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
    });
  }

  const scriptInjection = renderSanitized('Hello\n\n<script>alert(1)</script>\n\nWorld');
  check(
    'markdown-editor',
    'embedded <script> tag does not survive sanitization',
    !scriptInjection.includes('<script') && !scriptInjection.includes('alert(1)'),
    scriptInjection
  );

  const jsLink = renderSanitized('[click me](javascript:alert(1))');
  check(
    'markdown-editor',
    'javascript: link protocol is neutralized',
    !jsLink.includes('javascript:alert'),
    jsLink
  );

  const normal = renderSanitized('# Title\n\n**bold** and *italic* text with a [link](https://example.com).');
  check(
    'markdown-editor',
    'normal markdown renders expected HTML',
    normal.includes('<h1') && normal.includes('<strong>bold</strong>') && normal.includes('href="https://example.com"'),
    normal
  );

  const codeFence = renderSanitized('```js\nconst x = "<script>bad()</script>";\n```');
  check(
    'markdown-editor',
    'code fence content is escaped, not executed',
    codeFence.includes('&lt;script&gt;') && !codeFence.includes('<script>bad'),
    codeFence
  );
}

// ---------- scss-formatter ----------
{
  const output = css_beautify('$c:red;.a{color:$c;.b{margin:10px;}}', { indent_size: 2 });
  check(
    'scss-formatter',
    'preserves $variables and nesting while reindenting',
    output.includes('$c: red;') && output.includes('.a {') && output.includes('.b {') && output.includes('color: $c;'),
    output
  );
}

// ---------- sass-compiler / scss-compiler (shared compileSass helper) ----------
import { compileSass } from '@/lib/tools/sass-utils';
import { parseXml, serializeXml, stripIndentationWhitespace } from '@/lib/tools/xml-utils';
import { parseYaml } from '@/lib/tools/yaml-utils';

{
  const scssResult = compileSass('$c: red;\n.a { color: $c; .b { margin: 10px; } }', 'scss');
  check(
    'scss-compiler',
    'compiles SCSS variables and nesting into flattened CSS',
    scssResult.ok && scssResult.css.includes('color: red') && scssResult.css.includes('.a .b'),
    scssResult.ok ? scssResult.css : scssResult.message
  );

  const indentedResult = compileSass('$c: red\n.a\n  color: $c\n  .b\n    margin: 10px\n', 'indented');
  check(
    'sass-compiler',
    'compiles indented-syntax Sass into flattened CSS',
    indentedResult.ok && indentedResult.css.includes('color: red') && indentedResult.css.includes('.a .b'),
    indentedResult.ok ? indentedResult.css : indentedResult.message
  );

  const badImportScss = compileSass('@import "does-not-exist";', 'scss');
  check(
    'scss-compiler',
    'unresolvable @import fails gracefully with a clear error, not a crash',
    badImportScss.ok === false && badImportScss.message.length > 0,
    badImportScss.ok ? 'unexpectedly succeeded' : badImportScss.message
  );

  const badImportSass = compileSass('@use "does-not-exist"\n', 'indented');
  check(
    'sass-compiler',
    'unresolvable @use fails gracefully with a clear error, not a crash',
    badImportSass.ok === false && badImportSass.message.length > 0,
    badImportSass.ok ? 'unexpectedly succeeded' : badImportSass.message
  );

  const emptyInput = compileSass('', 'scss');
  check('scss-compiler', 'empty input reports a message instead of compiling', emptyInput.ok === false, '');
}

// ---------- rss-viewer ----------
{
  const dom = new JSDOM('<!DOCTYPE html>');
  const purify = DOMPurify(dom.window as unknown as Window & typeof globalThis);

  function textOf(el: Element | null, tag: string): string {
    if (!el) return '';
    const child = Array.from(el.children).find((c) => c.tagName.toLowerCase() === tag);
    return child?.textContent?.trim() ?? '';
  }

  function parseFeed(xml: string) {
    const parser = new dom.window.DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) return { ok: false as const, message: 'Invalid XML' };
    const channel = doc.querySelector('rss > channel') ?? doc.querySelector('channel');
    if (!channel) return { ok: false as const, message: 'No channel found' };
    const items = Array.from(channel.children)
      .filter((c) => c.tagName.toLowerCase() === 'item')
      .map((item) => ({
        title: textOf(item, 'title'),
        link: textOf(item, 'link'),
        description: textOf(item, 'description'),
        pubDate: textOf(item, 'pubdate') || textOf(item, 'pubDate'),
      }));
    return {
      ok: true as const,
      feed: { title: textOf(channel, 'title'), link: textOf(channel, 'link'), description: textOf(channel, 'description'), items },
    };
  }

  const feedXml = `<?xml version="1.0"?><rss version="2.0"><channel><title>Test Feed</title><link>https://example.com</link><description>Desc</description><item><title>Item One</title><link>https://example.com/1</link><description>Hello &lt;script&gt;alert(1)&lt;/script&gt; &lt;b&gt;world&lt;/b&gt;</description><pubDate>Wed, 24 Sep 2026 12:00:00 GMT</pubDate></item></channel></rss>`;

  const parsed = parseFeed(feedXml);
  check(
    'rss-viewer',
    'parses real <rss><channel><item> structure via DOMParser, not regex',
    parsed.ok && parsed.feed.title === 'Test Feed' && parsed.feed.items.length === 1 && parsed.feed.items[0].title === 'Item One',
    JSON.stringify(parsed)
  );

  if (parsed.ok) {
    const sanitized = purify.sanitize(parsed.feed.items[0].description, {
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
    });
    check(
      'rss-viewer',
      'embedded <script> in item description is stripped by DOMPurify before rendering',
      !sanitized.includes('<script') && !sanitized.includes('alert(1)') && sanitized.includes('<b>world</b>'),
      sanitized
    );
  }

  const notRss = parseFeed('<foo><bar/></foo>');
  check('rss-viewer', 'non-RSS XML without <rss><channel> is reported, not misparsed', notRss.ok === false, '');

  const malformed = parseFeed('<rss><channel><title>Broken</channel>');
  check('rss-viewer', 'malformed XML reports a parser error rather than throwing', malformed.ok === false, '');
}

// ---------- xml-minifier / xml-parser / xpath-tester (shared lib/tools/xml-utils.ts) ----------
// These tools use the real browser DOMParser/XMLSerializer, which don't exist as globals under
// vitest's `node` test environment - so, same as the rss-viewer test above, jsdom is used to
// supply real implementations, wired onto the globals the shared xml-utils module reads.
{
  const xmlDom = new JSDOM('<!DOCTYPE html>');
  (globalThis as unknown as { DOMParser: unknown }).DOMParser = xmlDom.window.DOMParser;
  (globalThis as unknown as { XMLSerializer: unknown }).XMLSerializer = xmlDom.window.XMLSerializer;
  (globalThis as unknown as { Node: unknown }).Node = xmlDom.window.Node;

  const wellFormed = parseXml('<a><b>1</b><b>2</b></a>');
  check('xml-minifier/xml-parser/xpath-tester', 'well-formed XML parses via real DOMParser', wellFormed.ok === true, JSON.stringify(wellFormed.ok));

  const malformedXml = parseXml('<a><b>oops</a>');
  check('xml-minifier/xml-parser/xpath-tester', 'malformed XML is reported, not silently accepted', malformedXml.ok === false, '');

  const emptyXml = parseXml('   ');
  check('xml-minifier/xml-parser/xpath-tester', 'empty input reports a message instead of crashing', emptyXml.ok === false, '');

  // xml-minifier: indentation-only whitespace removed, mixed content untouched
  const indented = parseXml('<root>\n  <a>1</a>\n  <b>2</b>\n</root>');
  if (indented.ok) {
    stripIndentationWhitespace(indented.doc);
    const minified = serializeXml(indented.doc.documentElement);
    check(
      'xml-minifier',
      'indentation-only whitespace between element siblings is removed',
      minified === '<root><a>1</a><b>2</b></root>',
      minified
    );
  }

  const mixedContent = parseXml('<p>Hello <b>world</b>!</p>');
  if (mixedContent.ok) {
    stripIndentationWhitespace(mixedContent.doc);
    const preserved = serializeXml(mixedContent.doc.documentElement);
    check(
      'xml-minifier',
      'mixed-content text (e.g. "Hello " and "!") is preserved exactly, never stripped',
      preserved === '<p>Hello <b>world</b>!</p>',
      preserved
    );
  }

  // xml-parser: tree structure is real (attributes, nesting) - spot-check via the parsed DOM directly
  const withAttrs = parseXml('<book id="1"><title>Refactoring</title></book>');
  check(
    'xml-parser',
    'attributes and nested element text are present on the real parsed tree',
    withAttrs.ok &&
      withAttrs.doc.documentElement.getAttribute('id') === '1' &&
      withAttrs.doc.documentElement.querySelector('title')?.textContent === 'Refactoring',
    ''
  );

  // xpath-tester: document.evaluate against the parsed doc
  const xpathDoc = parseXml('<library><book id="1"><title>Refactoring</title></book><book id="2"><title>Clean Code</title></book></library>');
  if (xpathDoc.ok) {
    const idMatch = xpathDoc.doc.evaluate('//book[@id="2"]/title', xpathDoc.doc, null, 7 /* ORDERED_NODE_SNAPSHOT_TYPE */, null);
    const node = idMatch.snapshotItem(0);
    check(
      'xpath-tester',
      '@id-style attribute predicate selects the correct node',
      idMatch.snapshotLength === 1 && node?.textContent === 'Clean Code',
      String(node?.textContent)
    );

    const textFn = xpathDoc.doc.evaluate('//title/text()', xpathDoc.doc, null, 7, null);
    check('xpath-tester', 'text() selects text nodes', textFn.snapshotLength === 2, String(textFn.snapshotLength));

    const noMatches = xpathDoc.doc.evaluate('//nonexistent', xpathDoc.doc, null, 7, null);
    check('xpath-tester', 'no-matches case returns zero results, not an error', noMatches.snapshotLength === 0, '');

    let threw = false;
    try {
      xpathDoc.doc.evaluate('///[[[invalid', xpathDoc.doc, null, 7, null);
    } catch {
      threw = true;
    }
    check('xpath-tester', 'invalid XPath syntax throws (caught by the component), not silently ignored', threw, '');
  }

  // External entity non-resolution: DOMParser must not fetch/expand a DOCTYPE-declared external entity
  const xxePayload =
    '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><root>&xxe;</root>';
  const xxeResult = parseXml(xxePayload);
  const xxeText = xxeResult.ok ? xxeResult.doc.documentElement.textContent ?? '' : '';
  check(
    'xml-minifier/xml-parser/xpath-tester',
    'external entity reference is never resolved to file contents (no XXE)',
    !xxeText.includes('root:') && !/passwd/.test(xxeText),
    xxeText
  );
}

// ---------- yaml-parser (lib/tools/yaml-utils.ts) ----------
{
  const parsed = parseYaml('id: 1\nname: Formatiq\ntags:\n  - a\n  - b\n');
  check(
    'yaml-parser',
    'valid YAML parses into a real structured value via js-yaml safe load()',
    parsed.ok &&
      typeof parsed.value === 'object' &&
      parsed.value !== null &&
      (parsed.value as Record<string, unknown>).id === 1 &&
      (parsed.value as Record<string, unknown>).name === 'Formatiq',
    JSON.stringify(parsed)
  );

  const invalid = parseYaml('key: [unclosed');
  check('yaml-parser', 'invalid YAML reports a parse error, not a crash', invalid.ok === false, '');

  const empty = parseYaml('');
  check('yaml-parser', 'empty input reports a message instead of parsing', empty.ok === false, '');

  // Custom-tag safety: js-yaml's load() (not a legacy unsafeLoad) must not instantiate a JS type
  // from an unrecognized tag - it should fail to parse rather than construct anything.
  const unsafeTag = parseYaml('exploit: !!js/function "function(){ return 1; }"');
  check(
    'yaml-parser',
    'unrecognized/unsafe YAML tags fail to parse rather than instantiating arbitrary types',
    unsafeTag.ok === false,
    JSON.stringify(unsafeTag)
  );
}

// ---------- css-validator ----------
{
  const cssDom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
  const doc = cssDom.window.document;

  function validate(input: string) {
    const style = doc.createElement('style');
    style.textContent = input;
    doc.head.appendChild(style);
    try {
      const sheet = style.sheet as CSSStyleSheet | null;
      if (!sheet) return { ok: false as const };
      let ruleCount = 0;
      try {
        ruleCount = sheet.cssRules.length;
      } catch {
        return { ok: false as const };
      }
      const openBraces = (input.match(/{/g) ?? []).length;
      const closeBraces = (input.match(/}/g) ?? []).length;
      if (openBraces !== closeBraces) return { ok: false as const };
      if (input.trim() && openBraces > 0 && ruleCount === 0) return { ok: false as const };
      return { ok: true as const, ruleCount };
    } finally {
      doc.head.removeChild(style);
    }
  }

  const validCss = validate('.card { padding: 16px; color: red; }');
  check('css-validator', 'well-formed CSS parses cleanly with rules registered', validCss.ok === true, JSON.stringify(validCss));

  const unclosedRule = validate('.card { color: red;');
  check('css-validator', 'unclosed rule (mismatched braces) is flagged, not silently accepted', unclosedRule.ok === false, '');

  const stringLiteralWithBraces = validate('.card::before { content: "{ not a real rule }"; }');
  check(
    'css-validator',
    'braces inside a string literal value do not falsely trigger a brace-mismatch report',
    stringLiteralWithBraces.ok === true,
    JSON.stringify(stringLiteralWithBraces)
  );
}

// Print results

describe('Formatters', () => {
  results.forEach((r) => {
    it(`${r.tool}: ${r.test}`, () => {
      expect(r.pass, r.detail).toBe(true);
    });
  });
});
