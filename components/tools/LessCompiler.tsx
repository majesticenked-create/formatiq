'use client';

import { useEffect, useState } from 'react';
import less from 'less';

const SAMPLE = `@primary: #3366ff;
@radius: 8px;

.card {
  border-radius: @radius;
  .title {
    color: @primary;
    font-weight: 600;
  }
}`;

type Result =
  | { ok: true; output: string }
  | { ok: false; message: string };

export default function LessCompiler() {
  const [input, setInput] = useState(SAMPLE);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!input.trim()) {
      setResult(null);
      return;
    }

    // less.render() is async even for in-memory strings. No filename is provided, so
    // @import statements cannot resolve against the filesystem or network - an unresolvable
    // import fails with a clear error instead of attempting any external fetch.
    less
      .render(input, { syncImport: false })
      .then((output) => {
        if (!cancelled) setResult({ ok: true, output: output.css });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err && typeof err === 'object' && 'message' in err
              ? String((err as { message: unknown }).message)
              : 'Could not compile this LESS.';
          setResult({ ok: false, message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [input]);

  function copyOutput() {
    if (result?.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setInput('')}>
          Clear
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>LESS input</span>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste LESS here..."
          />
          <div
            className={`status-line ${
              result === null ? 'status-neutral' : result.ok ? 'status-valid' : 'status-invalid'
            }`}
          >
            {result === null ? 'Enter some LESS to compile.' : result.ok ? '✓ Compiled' : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Compiled CSS</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result?.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">
            {result?.ok ? result.output : '// Fix the errors on the left to see compiled CSS'}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Compiles LESS (variables, nesting, mixins) into plain CSS using the official{' '}
        <code>less</code> package, entirely in your browser - nothing is uploaded, and no <code>@import</code> is
        ever resolved against the filesystem or a network address; an unresolvable import simply fails with an
        error. Need to reformat LESS source while keeping it as LESS, rather than compiling it? Use the{' '}
        <a href="/tools/formatters/less-formatter">LESS Formatter</a>.
      </div>
    </div>
  );
}
