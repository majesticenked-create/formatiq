'use client';

import { useMemo, useState } from 'react';

const SAMPLE = '{"id":1,"name":"Formatiq","tags":["json","tools"],"active":true}';

function tryFormat(input: string, indent: number) {
  try {
    const parsed = JSON.parse(input);
    return { ok: true as const, output: JSON.stringify(parsed, null, indent) };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid JSON' };
  }
}

export default function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);

  const result = useMemo(() => tryFormat(input, indent), [input, indent]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  function minify() {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
    } catch {
      /* leave input as-is if invalid */
    }
  }

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Indent:
        </label>
        {[2, 4].map((n) => (
          <button
            key={n}
            className={`icon-btn${indent === n ? ' is-active' : ''}`}
            onClick={() => setIndent(n)}
          >
            {n} spaces
          </button>
        ))}
        <button className="icon-btn" onClick={minify}>
          Minify input
        </button>
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Input</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={() => setInput('')}>
                Clear
              </button>
            </div>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste JSON here..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Valid JSON' : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Formatted output</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : '// Fix the errors on the left to see formatted output'}</div>
          <div className="status-line status-neutral">
            {result.ok ? `${result.output.split('\n').length} lines` : '\u00A0'}
          </div>
        </div>
      </div>
    </div>
  );
}
