'use client';

import { useState } from 'react';

const SAMPLE = 'banana\napple\ncherry\napple\ndate\nfig\nbanana';

type SortType = 'az' | 'za' | 'length' | 'numerical' | 'reverse' | 'dedupe' | 'shuffle';

function applySort(lines: string[], type: SortType): string[] {
  switch (type) {
    case 'az':
      return [...lines].sort((a, b) => a.localeCompare(b));
    case 'za':
      return [...lines].sort((a, b) => b.localeCompare(a));
    case 'length':
      return [...lines].sort((a, b) => a.length - b.length);
    case 'numerical':
      return [...lines].sort((a, b) => (Number(a) || 0) - (Number(b) || 0));
    case 'reverse':
      return [...lines].reverse();
    case 'dedupe':
      return Array.from(new Set(lines));
    case 'shuffle': {
      const copy = [...lines];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }
    default:
      return lines;
  }
}

const SORT_LABELS: Record<SortType, string> = {
  az: 'A-Z',
  za: 'Z-A',
  length: 'By length',
  numerical: 'Numerical',
  reverse: 'Reverse order',
  dedupe: 'Remove duplicates',
  shuffle: 'Shuffle',
};

export default function TextSorter() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState<string[] | null>(null);

  function runSort(type: SortType) {
    const lines = input.split('\n').filter((l) => l.length > 0);
    setOutput(applySort(lines, type));
  }

  function copyOutput() {
    if (output) navigator.clipboard.writeText(output.join('\n'));
  }

  const inputLineCount = input.split('\n').filter((l) => l.length > 0).length;

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button
          className="icon-btn"
          onClick={() => {
            setInput('');
            setOutput(null);
          }}
        >
          Clear
        </button>
      </div>

      <div className="control-row">
        {(Object.keys(SORT_LABELS) as SortType[]).map((type) => (
          <button key={type} className="icon-btn" onClick={() => runSort(type)}>
            {SORT_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Input (one item per line)</span>
          </div>
          <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
          <div className="status-line status-neutral">{inputLineCount} line(s)</div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Result</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!output}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{output ? output.join('\n') : '// Choose a sort option above to see the result'}</div>
          <div className="status-line status-neutral">{output ? `${output.length} line(s)` : ' '}</div>
        </div>
      </div>
    </div>
  );
}
