'use client';

import { Fragment, useMemo, useState } from 'react';

const SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog. The dog barks at the fox.';

interface MatchInfo {
  index: number;
  match: string;
}

function findMatches(text: string, find: string, useRegex: boolean, caseSensitive: boolean): MatchInfo[] | { error: string } {
  if (!find) return [];

  let regex: RegExp;
  try {
    const flags = 'g' + (caseSensitive ? '' : 'i');
    const pattern = useRegex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    regex = new RegExp(pattern, flags);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Invalid regex pattern.' };
  }

  const matches: MatchInfo[] = [];
  let match: RegExpExecArray | null;
  let iterations = 0;
  while ((match = regex.exec(text)) !== null && iterations < 5000) {
    matches.push({ index: match.index, match: match[0] });
    if (match[0] === '') regex.lastIndex++;
    iterations++;
  }
  return matches;
}

function highlightText(text: string, matches: MatchInfo[]) {
  if (matches.length === 0) return [text];
  const segments: (string | { match: string; key: number })[] = [];
  let cursor = 0;
  matches.forEach((m, idx) => {
    if (m.index > cursor) segments.push(text.slice(cursor, m.index));
    segments.push({ match: m.match, key: idx });
    cursor = m.index + m.match.length;
  });
  if (cursor < text.length) segments.push(text.slice(cursor));
  return segments;
}

function applyReplace(
  text: string,
  matches: MatchInfo[],
  replaceValue: string,
  scope: 'all' | 'first'
): string {
  const targets = scope === 'first' ? matches.slice(0, 1) : matches;
  if (targets.length === 0) return text;

  let result = '';
  let cursor = 0;
  targets.forEach((m) => {
    result += text.slice(cursor, m.index) + replaceValue;
    cursor = m.index + m.match.length;
  });
  result += text.slice(cursor);
  return result;
}

export default function FindAndReplace() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [find, setFind] = useState('fox');
  const [replace, setReplace] = useState('cat');
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [scope, setScope] = useState<'all' | 'first'>('all');
  const [committed, setCommitted] = useState<string | null>(null);

  const matchResult = useMemo(() => findMatches(text, find, useRegex, caseSensitive), [text, find, useRegex, caseSensitive]);
  const matches = Array.isArray(matchResult) ? matchResult : [];
  const error = 'error' in matchResult ? matchResult.error : null;

  const segments = highlightText(text, matches);

  function commitReplace() {
    if (error) return;
    setCommitted(applyReplace(text, matches, replace, scope));
  }

  function applyToInput() {
    if (committed !== null) {
      setText(committed);
      setCommitted(null);
    }
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setText(SAMPLE_TEXT)}>
          Load sample
        </button>
        <button
          className={`icon-btn${useRegex ? ' is-active' : ''}`}
          onClick={() => setUseRegex((v) => !v)}
        >
          {useRegex ? 'Regex match' : 'Plain text match'}
        </button>
        <button
          className={`icon-btn${caseSensitive ? ' is-active' : ''}`}
          onClick={() => setCaseSensitive((v) => !v)}
        >
          {caseSensitive ? 'Case-sensitive' : 'Case-insensitive'}
        </button>
        <button
          className={`icon-btn${scope === 'all' ? ' is-active' : ''}`}
          onClick={() => setScope('all')}
        >
          Replace all
        </button>
        <button
          className={`icon-btn${scope === 'first' ? ' is-active' : ''}`}
          onClick={() => setScope('first')}
        >
          Replace first
        </button>
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Find:
        </label>
        <input
          type="text"
          value={find}
          onChange={(e) => setFind(e.target.value)}
          className="mono"
          style={{
            flex: 1,
            minWidth: 160,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Replace:
        </label>
        <input
          type="text"
          value={replace}
          onChange={(e) => setReplace(e.target.value)}
          className="mono"
          style={{
            flex: 1,
            minWidth: 160,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
        <button className="btn btn-primary" onClick={commitReplace} disabled={!!error || matches.length === 0}>
          Replace
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Source text</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setText('')}>
              Clear
            </button>
          </div>
        </div>
        <textarea className="mono" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
        <div className={`status-line ${error ? 'status-invalid' : 'status-neutral'}`}>
          {error ? `✗ ${error}` : `${matches.length} match${matches.length === 1 ? '' : 'es'} found`}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Preview (matches highlighted)</span>
        </div>
        <div className="output mono" style={{ whiteSpace: 'pre-wrap' }}>
          {error
            ? '// Fix the regex pattern to see a preview'
            : segments.map((seg, idx) =>
                typeof seg === 'string' ? (
                  <Fragment key={idx}>{seg}</Fragment>
                ) : (
                  <mark
                    key={seg.key}
                    style={{ background: 'var(--accent-dim)', color: 'var(--text-primary)', borderRadius: 3, padding: '0 2px' }}
                  >
                    {seg.match}
                  </mark>
                )
              )}
        </div>
      </div>

      {committed !== null && (
        <div className="panel">
          <div className="panel-bar">
            <span>Result ({scope === 'all' ? matches.length : Math.min(1, matches.length)} replacement{scope === 'all' && matches.length !== 1 ? 's' : ''} made)</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={() => navigator.clipboard.writeText(committed)}>
                Copy
              </button>
              <button className="icon-btn" onClick={applyToInput}>
                Use as new input
              </button>
            </div>
          </div>
          <div className="output mono">{committed}</div>
        </div>
      )}
    </div>
  );
}
