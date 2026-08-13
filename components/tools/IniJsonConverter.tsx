'use client';

import { useMemo, useState } from 'react';

type Mode = 'iniToJson' | 'jsonToIni';

const SAMPLE_INI = `; global settings\nenv=production\ndebug=false\n\n[database]\nhost=localhost\nport=5432\nname=formatiq\n\n[cache]\n; ttl in seconds\nttl=300\nenabled=true`;

const SAMPLE_JSON = JSON.stringify(
  {
    env: 'production',
    debug: false,
    database: { host: 'localhost', port: 5432, name: 'formatiq' },
    cache: { ttl: 300, enabled: true },
  },
  null,
  2
);

function inferValue(raw: string): unknown {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw !== '' && !Number.isNaN(Number(raw))) return Number(raw);
  return raw;
}

function iniToJson(input: string) {
  if (!input.trim()) return { ok: false as const, message: 'Paste some INI to convert.' };

  const result: Record<string, unknown> = {};
  let currentSection: Record<string, unknown> = result;
  let lineNumber = 0;

  const lines = input.split('\n');
  for (const rawLine of lines) {
    lineNumber++;
    const line = rawLine.trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;

    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1].trim();
      const section: Record<string, unknown> = {};
      result[sectionName] = section;
      currentSection = section;
      continue;
    }

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) {
      return { ok: false as const, message: `Line ${lineNumber}: expected "key=value" or "[section]", got "${line}".` };
    }

    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();
    if (!key) {
      return { ok: false as const, message: `Line ${lineNumber}: empty key before "=".` };
    }
    currentSection[key] = inferValue(value);
  }

  return { ok: true as const, output: JSON.stringify(result, null, 2) };
}

function jsonToIni(input: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid JSON' };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false as const, message: 'JSON input must be a flat object, optionally with nested objects as sections.' };
  }

  const obj = parsed as Record<string, unknown>;
  const globalLines: string[] = [];
  const sectionBlocks: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const sectionLines = Object.entries(value as Record<string, unknown>).map(([k, v]) => {
        if (v !== null && typeof v === 'object') {
          return { error: `Section "${key}" key "${k}" is a nested object - INI only supports one level of sections.` };
        }
        return `${k}=${v}`;
      });
      const errorLine = sectionLines.find((l): l is { error: string } => typeof l === 'object');
      if (errorLine) return { ok: false as const, message: errorLine.error };
      sectionBlocks.push(`[${key}]\n${(sectionLines as string[]).join('\n')}`);
    } else if (Array.isArray(value)) {
      return { ok: false as const, message: `Key "${key}" is an array - INI has no native array syntax, flatten it first.` };
    } else {
      globalLines.push(`${key}=${value}`);
    }
  }

  const output = [globalLines.join('\n'), sectionBlocks.join('\n\n')].filter(Boolean).join('\n\n');
  return { ok: true as const, output };
}

export default function IniJsonConverter() {
  const [mode, setMode] = useState<Mode>('iniToJson');
  const [input, setInput] = useState(SAMPLE_INI);

  const result = useMemo(() => (mode === 'iniToJson' ? iniToJson(input) : jsonToIni(input)), [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'iniToJson' ? SAMPLE_INI : SAMPLE_JSON);
  }

  function swap() {
    if (result.ok) {
      setInput(result.output);
      setMode(mode === 'iniToJson' ? 'jsonToIni' : 'iniToJson');
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
            borderColor: mode === 'iniToJson' ? 'var(--accent-dim)' : undefined,
            color: mode === 'iniToJson' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('iniToJson')}
        >
          INI → JSON
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'jsonToIni' ? 'var(--accent-dim)' : undefined,
            color: mode === 'jsonToIni' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('jsonToIni')}
        >
          JSON → INI
        </button>
        <button className="icon-btn" onClick={swap} disabled={!result.ok}>
          Swap input ↔ output
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'iniToJson' ? 'INI' : 'JSON'}</span>
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
            <span>{mode === 'iniToJson' ? 'JSON' : 'INI'}</span>
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
        Sections become nested JSON objects, and "true"/"false"/numeric values are inferred to their JSON types
        rather than kept as strings. INI has no native array syntax, so arrays in JSON input can't convert back to
        INI. Working with YAML config instead? Try the{' '}
        <a href="/tools/converters/json-yaml-converter">JSON ⇄ YAML Converter</a>. Working with a Java .properties
        file? See the <a href="/tools/converters/properties-json-converter">Properties ⇄ JSON Converter</a>. Need
        TOML instead? Try the <a href="/tools/converters/toml-json-converter">TOML ⇄ JSON Converter</a>.
      </div>
    </div>
  );
}
