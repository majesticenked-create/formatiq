'use client';

import { useMemo, useState } from 'react';
import { decodeBase64Utf8 } from '@/lib/tools/base64-utils';

const SAMPLE = 'eyJpZCI6MSwibmFtZSI6IkZvcm1hdGlxIiwiYWN0aXZlIjp0cnVlfQ==';

type Stage = 'base64' | 'utf8' | 'json';

function convert(input: string): { ok: true; output: string } | { ok: false; stage: Stage; message: string } {
  if (!input.trim()) {
    return { ok: false, stage: 'base64', message: 'Paste a Base64 string or data URI.' };
  }

  const decoded = decodeBase64Utf8(input);
  if (!decoded.ok) {
    return { ok: false, stage: decoded.stage, message: decoded.message };
  }

  try {
    const value = JSON.parse(decoded.text);
    return { ok: true, output: JSON.stringify(value, null, 2) };
  } catch (err) {
    return {
      ok: false,
      stage: 'json',
      message: `Valid Base64 and valid UTF-8 text, but not valid JSON: ${err instanceof Error ? err.message : 'parse error'}`,
    };
  }
}

export default function Base64ToJson() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => convert(input), [input]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Base64</span>
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
            placeholder="Paste Base64 or a data URI..."
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Formatted JSON</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : ''}</div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Valid JSON' : `✗ ${result.message}`}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Decoding happens in three stages, each with its own clear error: (1) Base64 alphabet and
        padding, (2) whether the decoded bytes form valid UTF-8 text, (3) whether that text is
        valid JSON. For an interactive collapsible tree instead of formatted text, paste the
        decoded output into the <a href="/tools/converters/json-tree-viewer">JSON Tree Viewer</a>.
        Runs entirely client-side.
      </div>
    </div>
  );
}
