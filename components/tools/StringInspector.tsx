'use client';

import { useMemo, useState } from 'react';

const EMOJI_RE = /\p{Extended_Pictographic}/u;
const CONTROL_CODE_MIN = 0;
const CONTROL_CODE_MAX = 31;
const DEL_CODE = 127;
const NON_ASCII_RE = /[^\x00-\x7F]/;

function containsControlChars(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code === DEL_CODE) return true;
    if (code >= CONTROL_CODE_MIN && code <= CONTROL_CODE_MAX && code !== 9 && code !== 10 && code !== 13) {
      return true;
    }
  }
  return false;
}

function detectLineEndings(text: string): string {
  const hasCrlf = /\r\n/.test(text);
  const withoutCrlf = text.replace(/\r\n/g, '');
  const hasLoneLf = /\n/.test(withoutCrlf);
  const hasLoneCr = /\r/.test(withoutCrlf);
  if (hasCrlf && !hasLoneLf && !hasLoneCr) return 'CRLF (\\r\\n) - Windows-style';
  if (hasLoneLf && !hasCrlf && !hasLoneCr) return 'LF (\\n) - Unix/macOS-style';
  if (hasLoneCr && !hasCrlf && !hasLoneLf) return 'CR (\\r) - classic Mac-style';
  if (hasCrlf || hasLoneLf || hasLoneCr) return 'Mixed - multiple line ending styles present';
  return 'None (single line, no line breaks)';
}

function inspect(text: string) {
  const byteLength = new TextEncoder().encode(text).length;
  const graphemeCount = [...new Intl.Segmenter().segment(text)].length;
  const codeUnitLength = text.length;
  const containsNonAscii = NON_ASCII_RE.test(text);
  const containsEmoji = EMOJI_RE.test(text);
  const hasControlChars = containsControlChars(text);
  const lineEnding = detectLineEndings(text);
  const hasTrailingWhitespace = /[ \t]+$/m.test(text);
  const hasBom = text.charCodeAt(0) === 0xfeff;

  return {
    byteLength,
    graphemeCount,
    codeUnitLength,
    containsNonAscii,
    containsEmoji,
    hasControlChars,
    lineEnding,
    hasTrailingWhitespace,
    hasBom,
  };
}

interface StatRowProps {
  label: string;
  value: string;
  flag?: 'yes' | 'no' | 'neutral';
}

function StatRow({ label, value, flag }: StatRowProps) {
  const color =
    flag === 'yes' ? 'var(--invalid)' : flag === 'no' ? 'var(--valid)' : 'var(--text-primary)';
  return (
    <div
      className="mono"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid var(--border)',
        fontSize: 13,
      }}
    >
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ color }}>{value}</span>
    </div>
  );
}

export default function StringInspector() {
  const [input, setInput] = useState('Café ☕\r\nline two\n');

  const stats = useMemo(() => inspect(input), [input]);

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Text</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setInput('')}>
              Clear
            </button>
          </div>
        </div>
        <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Breakdown</span>
        </div>
        <div style={{ padding: '4px 16px' }}>
          <StatRow label="Byte length (UTF-8)" value={String(stats.byteLength)} />
          <StatRow label="Characters (graphemes)" value={String(stats.graphemeCount)} />
          <StatRow label="UTF-16 code units (.length)" value={String(stats.codeUnitLength)} />
          <StatRow
            label="Contains non-ASCII"
            value={stats.containsNonAscii ? 'Yes' : 'No'}
            flag={stats.containsNonAscii ? 'yes' : 'no'}
          />
          <StatRow
            label="Contains emoji"
            value={stats.containsEmoji ? 'Yes' : 'No'}
            flag={stats.containsEmoji ? 'yes' : 'no'}
          />
          <StatRow
            label="Contains control characters"
            value={stats.hasControlChars ? 'Yes' : 'No'}
            flag={stats.hasControlChars ? 'yes' : 'no'}
          />
          <StatRow
            label="Trailing whitespace on a line"
            value={stats.hasTrailingWhitespace ? 'Yes' : 'No'}
            flag={stats.hasTrailingWhitespace ? 'yes' : 'no'}
          />
          <StatRow label="Byte order mark (BOM)" value={stats.hasBom ? 'Yes' : 'No'} flag={stats.hasBom ? 'yes' : 'no'} />
          <StatRow label="Line ending style" value={stats.lineEnding} />
        </div>
      </div>
    </div>
  );
}
