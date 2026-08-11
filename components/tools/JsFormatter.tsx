'use client';

import { useMemo, useState } from 'react';
import { js_beautify } from 'js-beautify';

const SAMPLE = 'function add(a,b){return a+b;}\nconst greeting="Hello";\nfor(let i=0;i<3;i++){console.log(i);}';

function tryFormat(input: string, indent: number) {
  if (!input.trim()) {
    return { ok: false as const, message: 'Paste some JavaScript to format.' };
  }

  try {
    const output = js_beautify(input, { indent_size: indent });
    return { ok: true as const, output };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Could not format this JavaScript.' };
  }
}

export default function JsFormatter() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);

  const result = useMemo(() => tryFormat(input, indent), [input, indent]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
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
            className="icon-btn"
            style={{
              borderColor: indent === n ? 'var(--accent-dim)' : undefined,
              color: indent === n ? 'var(--text-primary)' : undefined,
            }}
            onClick={() => setIndent(n)}
          >
            {n} spaces
          </button>
        ))}
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
            placeholder="Paste JavaScript here..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Formatted' : `✗ ${result.message}`}
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
            {result.ok ? `${result.output.split('\n').length} lines` : ' '}
          </div>
        </div>
      </div>
    </div>
  );
}
