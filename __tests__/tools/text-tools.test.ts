import { describe, it, expect } from 'vitest';

// Logic copied verbatim from the corresponding component file(s) in components/tools/
// to test in isolation without modifying the real components (many tools embed their
// pure logic directly in the component rather than exporting it separately).

const results: { tool: string; test: string; pass: boolean; detail?: string }[] = [];
function check(tool: string, test: string, pass: boolean, detail?: string) {
  results.push({ tool, test, pass, detail });
}

// ---------- word-counter ----------
function wcStats(input: string) {
  const words = input.trim().length ? input.trim().split(/\s+/) : [];
  const sentences = input.trim().length ? input.split(/[.!?]+/).filter((s) => s.trim().length) : [];
  const paragraphs = input.trim().length ? input.split(/\n{2,}/).filter((p) => p.trim().length) : [];
  return {
    words: words.length,
    characters: input.length,
    charactersNoSpaces: input.replace(/\s/g, '').length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    readingTime: Math.max(1, Math.ceil(words.length / 200)),
  };
}
{
  const good = wcStats('The quick brown fox. Jumps over the lazy dog!');
  check('word-counter', 'valid: word/sentence counts correct', good.words === 9 && good.sentences === 2, JSON.stringify(good));
  const bad = wcStats('   '); // whitespace-only "invalid" input
  check('word-counter', 'whitespace-only input -> zero counts not crash', bad.words === 0 && bad.sentences === 0, JSON.stringify(bad));
  const edge = wcStats('');
  check('word-counter', 'edge case: empty string -> readingTime still floors to 1 min', edge.readingTime === 1 && edge.words === 0, JSON.stringify(edge));
}

// ---------- case-converter ----------
function ccSplitWords(input: string): string[] {
  return input.trim().replace(/([a-z])([A-Z])/g, '$1 $2').split(/[\s_-]+/).filter(Boolean).map((w) => w.toLowerCase());
}
function ccToCamel(input: string) {
  const words = ccSplitWords(input);
  return words.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join('');
}
function ccToSnake(input: string) { return ccSplitWords(input).join('_'); }
{
  const good = ccToCamel('hello world example');
  check('case-converter', 'valid: converts to camelCase correctly', good === 'helloWorldExample', good);
  const bad = ccToSnake('   '); // whitespace-only
  check('case-converter', 'whitespace-only input -> empty result not crash', bad === '', JSON.stringify(bad));
  const edge = ccToCamel('XMLHttpRequest'); // mixed-case boundary
  check('case-converter', 'edge case: existing camelCase/acronym input handled without crash', typeof edge === 'string' && edge.length > 0, edge);
}

// ---------- text-diff-checker ----------
type DiffOp = { type: 'same' | 'added' | 'removed'; line: string };
function tdDiffLines(a: string[], b: string[]): DiffOp[] {
  const n = a.length, m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) lcs[i][j] = a[i] === b[j] ? lcs[i+1][j+1]+1 : Math.max(lcs[i+1][j], lcs[i][j+1]);
  const ops: DiffOp[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push({ type: 'same', line: a[i] }); i++; j++; }
    else if (lcs[i+1][j] >= lcs[i][j+1]) { ops.push({ type: 'removed', line: a[i] }); i++; }
    else { ops.push({ type: 'added', line: b[j] }); j++; }
  }
  while (i < n) { ops.push({ type: 'removed', line: a[i] }); i++; }
  while (j < m) { ops.push({ type: 'added', line: b[j] }); j++; }
  return ops;
}
function tdComputeDiff(textA: string, textB: string) {
  const ops = tdDiffLines(textA.split('\n'), textB.split('\n'));
  return { ops, added: ops.filter((o) => o.type === 'added').length, removed: ops.filter((o) => o.type === 'removed').length };
}
{
  const good = tdComputeDiff('line1\nline2\nline3', 'line1\nlineX\nline3');
  check('text-diff-checker', 'valid: detects single line changed as remove+add', good.added === 1 && good.removed === 1, JSON.stringify(good));
  const identical = tdComputeDiff('same\ntext', 'same\ntext');
  check('text-diff-checker', 'identical inputs -> zero diffs not false positive', identical.added === 0 && identical.removed === 0, JSON.stringify(identical));
  const edge = tdComputeDiff('', ''); // empty/empty boundary
  check('text-diff-checker', 'edge case: both empty -> single same blank line, no crash', edge.added === 0 && edge.removed === 0, JSON.stringify(edge));
}

// ---------- text-sorter ----------
type SortType = 'az' | 'za' | 'length' | 'numerical' | 'reverse' | 'dedupe' | 'shuffle';
function tsApplySort(lines: string[], type: SortType): string[] {
  switch (type) {
    case 'az': return [...lines].sort((a, b) => a.localeCompare(b));
    case 'za': return [...lines].sort((a, b) => b.localeCompare(a));
    case 'length': return [...lines].sort((a, b) => a.length - b.length);
    case 'numerical': return [...lines].sort((a, b) => (Number(a) || 0) - (Number(b) || 0));
    case 'reverse': return [...lines].reverse();
    case 'dedupe': return Array.from(new Set(lines));
    default: return lines;
  }
}
{
  const good = tsApplySort(['banana', 'apple', 'cherry'], 'az');
  check('text-sorter', 'valid: A-Z sort produces correct order', JSON.stringify(good) === JSON.stringify(['apple', 'banana', 'cherry']), JSON.stringify(good));
  const bad = tsApplySort(['3', 'not-a-number', '1'], 'numerical'); // non-numeric entries -> Number() NaN -> falls back to 0, doesn't crash
  check('text-sorter', 'non-numeric entries in numerical sort -> no crash (NaN coerced to 0)', Array.isArray(bad) && bad.length === 3, JSON.stringify(bad));
  const edge = tsApplySort(['dup', 'dup', 'unique'], 'dedupe');
  check('text-sorter', 'edge case: dedupe removes exact duplicates only', edge.length === 2, JSON.stringify(edge));
}

// ---------- whitespace-remover ----------
interface WrOptions { trimLines: boolean; collapseSpaces: boolean; removeBlankLines: boolean; tabsToSpaces: boolean; }
function wrProcessText(input: string, options: WrOptions): string {
  let lines = input.split('\n');
  if (options.tabsToSpaces) lines = lines.map((l) => l.replace(/\t/g, '  '));
  if (options.collapseSpaces) lines = lines.map((l) => l.replace(/ {2,}/g, ' '));
  if (options.trimLines) lines = lines.map((l) => l.trim());
  if (options.removeBlankLines) lines = lines.filter((l) => l.trim().length > 0);
  return lines.join('\n');
}
{
  const good = wrProcessText('  hello    world  ', { trimLines: true, collapseSpaces: true, removeBlankLines: false, tabsToSpaces: false });
  check('whitespace-remover', 'valid: trims and collapses spaces correctly', good === 'hello world', JSON.stringify(good));
  const empty = wrProcessText('', { trimLines: true, collapseSpaces: true, removeBlankLines: true, tabsToSpaces: true });
  check('whitespace-remover', 'empty input -> empty output not crash', empty === '', JSON.stringify(empty));
  const edge = wrProcessText('a\n\n\nb', { trimLines: false, collapseSpaces: false, removeBlankLines: true, tabsToSpaces: false });
  check('whitespace-remover', 'edge case: multiple consecutive blank lines all removed', edge === 'a\nb', JSON.stringify(edge));
}

// ---------- regex-tester ----------
interface RtMatchInfo { fullMatch: string; index: number; groups: string[]; }
function rtTryTest(pattern: string, flags: string, text: string) {
  if (!pattern) return { ok: false as const, message: 'Enter a regex pattern.' };
  let regex: RegExp;
  try { regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'); }
  catch (err) { return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid regex pattern.' }; }
  const matches: RtMatchInfo[] = [];
  let match: RegExpExecArray | null;
  let iterations = 0;
  while ((match = regex.exec(text)) !== null && iterations < 1000) {
    matches.push({ fullMatch: match[0], index: match.index, groups: match.slice(1) });
    if (match[0] === '') regex.lastIndex++;
    iterations++;
  }
  return { ok: true as const, matches };
}
{
  const good = rtTryTest('(\\w+)@(\\w+\\.\\w+)', '', 'contact hello@formatiq.com or support@formatiq.com');
  check('regex-tester', 'valid: finds 2 email matches with capture groups', good.ok === true && good.matches.length === 2 && good.matches[0].groups.length === 2, JSON.stringify(good));
  const bad = rtTryTest('[invalid(', '', 'text'); // malformed regex, unbalanced bracket/paren
  check('regex-tester', 'malformed regex pattern -> error not crash', bad.ok === false, JSON.stringify(bad));
  const edge = rtTryTest('x*', '', 'abc'); // zero-width match edge case, guards against infinite loop
  check('regex-tester', 'edge case: zero-width matches terminate without infinite loop', edge.ok === true && edge.matches.length === 4, JSON.stringify(edge));
}

// ---------- character-frequency-counter ----------
interface CfEntry { char: string; count: number; }
function cfComputeFrequency(input: string, lettersOnly: boolean) {
  const chars = lettersOnly ? input.toLowerCase().replace(/[^a-z]/g, '') : input;
  if (!chars) return { ok: false as const, message: lettersOnly ? 'No letters found in this text.' : 'Enter some text to analyze.' };
  const counts = new Map<string, number>();
  for (const char of chars) counts.set(char, (counts.get(char) ?? 0) + 1);
  const entries: CfEntry[] = Array.from(counts.entries()).map(([char, count]) => ({ char, count })).sort((a, b) => b.count - a.count);
  return { ok: true as const, entries, totalUnique: entries.length, mostCommon: entries[0], leastCommon: entries[entries.length - 1] };
}
{
  const good = cfComputeFrequency('aabbc', false);
  check('character-frequency-counter', 'valid: counts characters correctly, most common is "a" or "b" (tied at 2)', good.ok === true && good.mostCommon.count === 2, JSON.stringify(good));
  const bad = cfComputeFrequency('12345', true); // letters-only mode with no letters present
  check('character-frequency-counter', 'letters-only mode with no letters -> error not crash', bad.ok === false, JSON.stringify(bad));
  const edge = cfComputeFrequency('', false);
  check('character-frequency-counter', 'edge case: empty input -> error not crash', edge.ok === false, JSON.stringify(edge));
}

// ---------- find-and-replace ----------
interface FrMatchInfo { index: number; match: string; }
function frFindMatches(text: string, find: string, useRegex: boolean, caseSensitive: boolean): FrMatchInfo[] | { error: string } {
  if (!find) return [];
  let regex: RegExp;
  try {
    const flags = 'g' + (caseSensitive ? '' : 'i');
    const pattern = useRegex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    regex = new RegExp(pattern, flags);
  } catch (err) { return { error: err instanceof Error ? err.message : 'Invalid regex pattern.' }; }
  const matches: FrMatchInfo[] = [];
  let match: RegExpExecArray | null;
  let iterations = 0;
  while ((match = regex.exec(text)) !== null && iterations < 5000) {
    matches.push({ index: match.index, match: match[0] });
    if (match[0] === '') regex.lastIndex++;
    iterations++;
  }
  return matches;
}
function frApplyReplace(text: string, matches: FrMatchInfo[], replaceValue: string, scope: 'all' | 'first'): string {
  const targets = scope === 'first' ? matches.slice(0, 1) : matches;
  if (targets.length === 0) return text;
  let result = '', cursor = 0;
  targets.forEach((m) => { result += text.slice(cursor, m.index) + replaceValue; cursor = m.index + m.match.length; });
  result += text.slice(cursor);
  return result;
}
{
  const text = 'the fox jumps, the fox runs';
  const goodMatches = frFindMatches(text, 'fox', false, false);
  const good = Array.isArray(goodMatches) ? frApplyReplace(text, goodMatches, 'cat', 'all') : null;
  check('find-and-replace', 'valid: plain-text replace-all works correctly', good === 'the cat jumps, the cat runs', JSON.stringify(good));
  const bad = frFindMatches(text, '[invalid(', true, false); // malformed regex when useRegex=true
  check('find-and-replace', 'malformed regex pattern (useRegex mode) -> error object not crash', !Array.isArray(bad) && 'error' in bad, JSON.stringify(bad));
  const edgeMatches = frFindMatches(text, 'fox', false, false);
  const edge = Array.isArray(edgeMatches) ? frApplyReplace(text, edgeMatches, 'cat', 'first') : null;
  check('find-and-replace', 'edge case: "replace first" only replaces the first occurrence', edge === 'the cat jumps, the fox runs', JSON.stringify(edge));
}

describe('Text Tools', () => {
  results.forEach((r) => {
    it(`${r.tool}: ${r.test}`, () => {
      expect(r.pass, r.detail).toBe(true);
    });
  });
});
