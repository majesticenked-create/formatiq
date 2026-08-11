'use client';

import { Fragment, useMemo, useState } from 'react';

const SAMPLE_PATTERN = '(\\w+)@(\\w+\\.\\w+)';
const SAMPLE_TEXT = 'Contact us at hello@formatiq.com or support@formatiq.com for help.';

interface MatchInfo {
  fullMatch: string;
  index: number;
  groups: string[];
}

function tryTest(pattern: string, flags: string, text: string) {
  if (!pattern) {
    return { ok: false as const, message: 'Enter a regex pattern.' };
  }

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid regex pattern.' };
  }

  const matches: MatchInfo[] = [];
  let match: RegExpExecArray | null;
  let iterations = 0;

  while ((match = regex.exec(text)) !== null && iterations < 1000) {
    matches.push({ fullMatch: match[0], index: match.index, groups: match.slice(1) });
    if (match[0] === '') regex.lastIndex++;
    iterations++;
  }

  return { ok: true as const, matches };
}

function highlightText(text: string, matches: MatchInfo[]) {
  if (matches.length === 0) return [text];

  const segments: (string | { match: string; key: number })[] = [];
  let cursor = 0;

  matches.forEach((m, idx) => {
    if (m.index > cursor) segments.push(text.slice(cursor, m.index));
    segments.push({ match: m.fullMatch, key: idx });
    cursor = m.index + m.fullMatch.length;
  });
  if (cursor < text.length) segments.push(text.slice(cursor));

  return segments;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState(SAMPLE_PATTERN);
  const [testText, setTestText] = useState(SAMPLE_TEXT);
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });

  const flagString = (['g', 'i', 'm', 's'] as const).filter((f) => flags[f]).join('');
  const result = useMemo(() => tryTest(pattern, flagString, testText), [pattern, flagString, testText]);

  function toggleFlag(flag: keyof typeof flags) {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }

  const segments = result.ok ? highlightText(testText, result.matches) : [testText];

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setPattern(SAMPLE_PATTERN)}>
          Load sample
        </button>
        {(['g', 'i', 'm', 's'] as const).map((f) => (
          <button
            key={f}
            className="icon-btn"
            style={{
              borderColor: flags[f] ? 'var(--accent-dim)' : undefined,
              color: flags[f] ? 'var(--text-primary)' : undefined,
            }}
            onClick={() => toggleFlag(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Pattern</span>
        </div>
        <textarea
          className="mono"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          spellCheck={false}
          placeholder="Enter a regex pattern..."
          style={{ minHeight: 48 }}
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? `✓ ${result.matches.length} match(es)` : `✗ ${result.message}`}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Test string</span>
        </div>
        <textarea className="mono" value={testText} onChange={(e) => setTestText(e.target.value)} spellCheck={false} />
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Highlighted result</span>
        </div>
        <div className="output mono" style={{ whiteSpace: 'pre-wrap' }}>
          {segments.map((seg, idx) =>
            typeof seg === 'string' ? (
              <Fragment key={idx}>{seg}</Fragment>
            ) : (
              <mark
                key={seg.key}
                style={{
                  background: 'var(--accent-dim)',
                  color: 'var(--text-primary)',
                  borderRadius: 3,
                  padding: '0 2px',
                }}
              >
                {seg.match}
              </mark>
            )
          )}
        </div>
      </div>

      {result.ok && (
        <div className="panel">
          <div className="panel-bar">
            <span>Matches</span>
          </div>
          <div className="output mono">
            {result.matches.length === 0
              ? 'No matches found.'
              : result.matches
                  .map((m, idx) => {
                    const groupsText = m.groups.length
                      ? ` - groups: [${m.groups.map((g) => (g === undefined ? 'undefined' : `"${g}"`)).join(', ')}]`
                      : '';
                    return `${idx + 1}. "${m.fullMatch}" at index ${m.index}${groupsText}`;
                  })
                  .join('\n')}
          </div>
        </div>
      )}
    </div>
  );
}
