'use client';

import { useMemo, useState } from 'react';
import JSON5 from 'json5';

const SAMPLE = `{
  // trailing commas, comments, unquoted keys, and single quotes are all valid JSON5
  name: 'Formatiq',
  version: 1,
  tags: ['json5', 'validator',],
}`;

type Result =
  | { ok: true; output: string }
  | { ok: false; message: string };

function validate(input: string): Result {
  try {
    const parsed = JSON5.parse(input);
    return { ok: true, output: JSON.stringify(parsed, null, 2) };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Invalid JSON5' };
  }
}

export default function Json5Validator() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => (input.trim() ? validate(input) : null), [input]);

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
            <span>JSON5 input</span>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste JSON5 here (comments, trailing commas, unquoted keys, single quotes all allowed)..."
          />
          <div
            className={`status-line ${
              result === null ? 'status-neutral' : result.ok ? 'status-valid' : 'status-invalid'
            }`}
          >
            {result === null ? 'Enter some JSON5 to validate.' : result.ok ? '✓ Valid JSON5' : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Parsed as standard JSON</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result?.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">
            {result?.ok ? result.output : '// Fix the errors on the left to see the parsed, strict-JSON equivalent'}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        JSON5 extends JSON with comments, trailing commas, unquoted object keys, single-quoted strings, and a few
        other conveniences aimed at hand-written config files. This tool parses with the real{' '}
        <code>json5</code> library (not strict <code>JSON.parse</code>, which would reject all of that syntax) and
        shows the equivalent strict-JSON output alongside a pass/fail verdict. Need plain-JSON formatting instead?
        Use the <a href="/tools/formatters/json-formatter">JSON Formatter</a>.
      </div>
    </div>
  );
}
