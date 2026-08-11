'use client';

import { useMemo, useState } from 'react';

const SAMPLE_A = 'The quick brown fox\njumps over the lazy dog\nThis line stays the same\nThis line will be removed';
const SAMPLE_B = 'The quick brown fox\njumps over the sleepy dog\nThis line stays the same\nThis line is new';

type DiffOp = { type: 'same' | 'added' | 'removed'; line: string };

/**
 * Simple line-based LCS diff — not a full Myers algorithm, but sufficient
 * for quick visual comparisons of moderately sized text.
 */
function diffLines(a: string[], b: string[]): DiffOp[] {
  const n = a.length;
  const m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: 'same', line: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ type: 'removed', line: a[i] });
      i++;
    } else {
      ops.push({ type: 'added', line: b[j] });
      j++;
    }
  }
  while (i < n) {
    ops.push({ type: 'removed', line: a[i] });
    i++;
  }
  while (j < m) {
    ops.push({ type: 'added', line: b[j] });
    j++;
  }

  return ops;
}

function computeDiff(textA: string, textB: string) {
  const linesA = textA.split('\n');
  const linesB = textB.split('\n');
  const ops = diffLines(linesA, linesB);
  const added = ops.filter((o) => o.type === 'added').length;
  const removed = ops.filter((o) => o.type === 'removed').length;
  return { ops, added, removed };
}

export default function TextDiffChecker() {
  const [textA, setTextA] = useState(SAMPLE_A);
  const [textB, setTextB] = useState(SAMPLE_B);

  const result = useMemo(() => computeDiff(textA, textB), [textA, textB]);

  function loadSample() {
    setTextA(SAMPLE_A);
    setTextB(SAMPLE_B);
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={loadSample}>
          Load sample
        </button>
        <button
          className="icon-btn"
          onClick={() => {
            setTextA('');
            setTextB('');
          }}
        >
          Clear
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Text A</span>
          </div>
          <textarea
            className="mono"
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            spellCheck={false}
            placeholder="Paste original text..."
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Text B</span>
          </div>
          <textarea
            className="mono"
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            spellCheck={false}
            placeholder="Paste changed text..."
          />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>Diff</span>
        </div>
        <div className="output mono" style={{ padding: 0 }}>
          {result.ops.map((op, idx) => (
            <div
              key={idx}
              style={{
                padding: '2px 12px',
                background:
                  op.type === 'added'
                    ? 'rgba(82, 194, 94, 0.12)'
                    : op.type === 'removed'
                    ? 'rgba(224, 82, 82, 0.12)'
                    : 'transparent',
                borderLeft:
                  op.type === 'added'
                    ? '3px solid #52c25e'
                    : op.type === 'removed'
                    ? '3px solid #e05252'
                    : '3px solid transparent',
                whiteSpace: 'pre-wrap',
              }}
            >
              {op.type === 'added' ? '+ ' : op.type === 'removed' ? '- ' : '  '}
              {op.line || ' '}
            </div>
          ))}
        </div>
        <div className="status-line status-neutral">
          {result.added} added, {result.removed} removed
        </div>
      </div>
    </div>
  );
}
