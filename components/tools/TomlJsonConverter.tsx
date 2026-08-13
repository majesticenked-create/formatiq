'use client';

import { useMemo, useState } from 'react';
import * as TOML from '@iarna/toml';

type Mode = 'tomlToJson' | 'jsonToToml';

const SAMPLE_TOML = `title = "Formatiq config"\n\n[owner]\nname = "Formatiq"\ndob = 2020-01-01T00:00:00Z\n\n[database]\nenabled = true\nports = [ 8001, 8002, 8003 ]\ndata = [ ["gamma", "delta"], [1, 2] ]\n\n[servers.alpha]\nip = "10.0.0.1"\nrole = "frontend"\n\n[servers.beta]\nip = "10.0.0.2"\nrole = "backend"\n`;

const SAMPLE_JSON = JSON.stringify(
  {
    title: 'Formatiq config',
    owner: { name: 'Formatiq' },
    database: {
      enabled: true,
      ports: [8001, 8002, 8003],
      data: [
        ['gamma', 'delta'],
        [1, 2],
      ],
    },
    servers: {
      alpha: { ip: '10.0.0.1', role: 'frontend' },
      beta: { ip: '10.0.0.2', role: 'backend' },
    },
  },
  null,
  2
);

function tomlToJson(input: string) {
  if (!input.trim()) return { ok: false as const, message: 'Paste some TOML to convert.' };

  try {
    const parsed = TOML.parse(input);
    return { ok: true as const, output: JSON.stringify(parsed, null, 2) };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid TOML' };
  }
}

function jsonToToml(input: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid JSON' };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false as const, message: 'JSON input must be an object - TOML documents are always a table at the root.' };
  }

  try {
    const output = TOML.stringify(parsed as TOML.JsonMap);
    return { ok: true as const, output };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Could not stringify to TOML.' };
  }
}

export default function TomlJsonConverter() {
  const [mode, setMode] = useState<Mode>('tomlToJson');
  const [input, setInput] = useState(SAMPLE_TOML);

  const result = useMemo(() => (mode === 'tomlToJson' ? tomlToJson(input) : jsonToToml(input)), [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'tomlToJson' ? SAMPLE_TOML : SAMPLE_JSON);
  }

  function swap() {
    if (result.ok) {
      setInput(result.output);
      setMode(mode === 'tomlToJson' ? 'jsonToToml' : 'tomlToJson');
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
            borderColor: mode === 'tomlToJson' ? 'var(--accent-dim)' : undefined,
            color: mode === 'tomlToJson' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('tomlToJson')}
        >
          TOML → JSON
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'jsonToToml' ? 'var(--accent-dim)' : undefined,
            color: mode === 'jsonToToml' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('jsonToToml')}
        >
          JSON → TOML
        </button>
        <button className="icon-btn" onClick={swap} disabled={!result.ok}>
          Swap input ↔ output
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'tomlToJson' ? 'TOML' : 'JSON'}</span>
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
            <span>{mode === 'tomlToJson' ? 'JSON' : 'TOML'}</span>
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
        Powered by @iarna/toml, a spec-compliant TOML parser - handles nested tables, arrays of tables, inline
        tables, and native TOML dates rather than a hand-rolled parser guessing at TOML&apos;s syntax. Working with
        YAML or INI config instead? See the{' '}
        <a href="/tools/converters/json-yaml-converter">JSON ⇄ YAML Converter</a> or{' '}
        <a href="/tools/converters/ini-json-converter">INI ⇄ JSON Converter</a>.
      </div>
    </div>
  );
}
