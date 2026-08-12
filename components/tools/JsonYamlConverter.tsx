'use client';

import { useMemo, useState } from 'react';
import { load, dump } from 'js-yaml';

type Mode = 'jsonToYaml' | 'yamlToJson';

const SAMPLE_JSON = JSON.stringify(
  { id: 1, name: 'Formatiq', tags: ['json', 'yaml'], active: true },
  null,
  2
);
const SAMPLE_YAML = 'id: 1\nname: Formatiq\ntags:\n  - json\n  - yaml\nactive: true\n';

function jsonToYaml(input: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid JSON' };
  }

  try {
    return { ok: true as const, output: dump(parsed) };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Could not dump to YAML' };
  }
}

function yamlToJson(input: string) {
  let parsed: unknown;
  try {
    parsed = load(input);
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid YAML' };
  }

  try {
    return { ok: true as const, output: JSON.stringify(parsed, null, 2) };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Could not stringify to JSON' };
  }
}

export default function JsonYamlConverter() {
  const [mode, setMode] = useState<Mode>('jsonToYaml');
  const [input, setInput] = useState(SAMPLE_JSON);

  const result = useMemo(() => (mode === 'jsonToYaml' ? jsonToYaml(input) : yamlToJson(input)), [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'jsonToYaml' ? SAMPLE_JSON : SAMPLE_YAML);
  }

  function swap() {
    if (result.ok) {
      setInput(result.output);
      setMode(mode === 'jsonToYaml' ? 'yamlToJson' : 'jsonToYaml');
    }
  }

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'jsonToYaml' ? 'var(--accent-dim)' : undefined,
            color: mode === 'jsonToYaml' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('jsonToYaml')}
        >
          JSON → YAML
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'yamlToJson' ? 'var(--accent-dim)' : undefined,
            color: mode === 'yamlToJson' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('yamlToJson')}
        >
          YAML → JSON
        </button>
        <button className="icon-btn" onClick={swap} disabled={!result.ok}>
          Swap input ↔ output
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'jsonToYaml' ? 'JSON' : 'YAML'}</span>
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
            <span>{mode === 'jsonToYaml' ? 'YAML' : 'JSON'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : ''}</div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Converted' : `✗ ${result.message}`}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Need tabular output instead? Try <a href="/tools/converters/json-to-csv">JSON to CSV</a>. Working with XML?
        See the <a href="/tools/formatters/xml-formatter">XML Formatter</a>.
      </div>
    </div>
  );
}
