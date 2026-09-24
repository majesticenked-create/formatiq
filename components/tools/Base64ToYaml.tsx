'use client';

import { useMemo, useState } from 'react';
import { decodeBase64Utf8 } from '@/lib/tools/base64-utils';
import { parseYaml } from '@/lib/tools/yaml-utils';

const SAMPLE = 'aWQ6IDEKbmFtZTogRm9ybWF0aXEKYWN0aXZlOiB0cnVl';

type Stage = 'base64' | 'utf8' | 'yaml';

function convert(input: string): { ok: true; output: string } | { ok: false; stage: Stage; message: string } {
  if (!input.trim()) {
    return { ok: false, stage: 'base64', message: 'Paste a Base64 string or data URI.' };
  }

  const decoded = decodeBase64Utf8(input);
  if (!decoded.ok) {
    return { ok: false, stage: decoded.stage, message: decoded.message };
  }

  const parsed = parseYaml(decoded.text);
  if (!parsed.ok) {
    return { ok: false, stage: 'yaml', message: `Valid Base64 and valid UTF-8 text, but not valid YAML: ${parsed.message}` };
  }

  return { ok: true, output: JSON.stringify(parsed.value, null, 2) };
}

export default function Base64ToYaml() {
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
            <span>Parsed structure (JSON view)</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : ''}</div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Valid YAML' : `✗ ${result.message}`}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Decoding happens in three stages, each with its own clear error: (1) Base64 alphabet and
        padding, (2) whether the decoded bytes form valid UTF-8 text, (3) whether that text is
        valid YAML - parsed with js-yaml&apos;s safe <code>load()</code> (same parser as{' '}
        <a href="/tools/validators/yaml-validator">YAML Validator</a>), which only builds a plain
        value and never executes anything. The parsed structure is shown as JSON for a stable,
        unambiguous view of exactly what was parsed. Runs entirely client-side.
      </div>
    </div>
  );
}
