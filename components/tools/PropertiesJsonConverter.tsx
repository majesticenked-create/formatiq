'use client';

import { useMemo, useState } from 'react';

type Mode = 'propertiesToJson' | 'jsonToProperties';

const SAMPLE_PROPERTIES = `# app config\napp.name=Formatiq\napp.version=1.0.0\n\n! database settings\ndb.host=localhost\ndb.port=5432\ndb.description=Multi\\ word value with a colon\\: like this`;

const SAMPLE_JSON = JSON.stringify(
  {
    'app.name': 'Formatiq',
    'app.version': '1.0.0',
    'db.host': 'localhost',
    'db.port': '5432',
    'db.description': 'Multi word value with a colon: like this',
  },
  null,
  2
);

function unescapeValue(raw: string): string {
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '\\' && i + 1 < raw.length) {
      const next = raw[i + 1];
      if (next === 'n') {
        out += '\n';
        i++;
      } else if (next === 't') {
        out += '\t';
        i++;
      } else if (next === 'u' && i + 5 < raw.length) {
        const hex = raw.slice(i + 2, i + 6);
        out += String.fromCharCode(parseInt(hex, 16));
        i += 5;
      } else if (next === ':' || next === '=' || next === '\\' || next === ' ' || next === '#' || next === '!') {
        out += next;
        i++;
      } else {
        out += next;
        i++;
      }
    } else {
      out += raw[i];
    }
  }
  return out;
}

function propertiesToJson(input: string) {
  if (!input.trim()) return { ok: false as const, message: 'Paste some .properties content to convert.' };

  const result: Record<string, string> = {};
  const rawLines = input.split('\n');

  // Join line-continuations: a trailing unescaped backslash means the value
  // continues on the next line, a common real-world .properties feature.
  const lines: string[] = [];
  let buffer = '';
  for (const rawLine of rawLines) {
    const combined = buffer + rawLine;
    if (combined.endsWith('\\') && !combined.endsWith('\\\\')) {
      buffer = combined.slice(0, -1);
    } else {
      lines.push(combined);
      buffer = '';
    }
  }
  if (buffer) lines.push(buffer);

  let lineNumber = 0;
  for (const rawLine of lines) {
    lineNumber++;
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('!')) continue;

    const separatorMatch = line.match(/(?<!\\)[:=]/);
    if (!separatorMatch || separatorMatch.index === undefined) {
      return { ok: false as const, message: `Line ${lineNumber}: expected "key=value" or "key:value", got "${line}".` };
    }

    const key = unescapeValue(line.slice(0, separatorMatch.index).trim());
    const value = unescapeValue(line.slice(separatorMatch.index + 1).trim());
    if (!key) return { ok: false as const, message: `Line ${lineNumber}: empty key.` };

    result[key] = value;
  }

  return { ok: true as const, output: JSON.stringify(result, null, 2) };
}

function escapeKey(key: string): string {
  return key.replace(/[\\:=\s#!]/g, (ch) => (ch === ' ' ? '\\ ' : `\\${ch}`));
}

function escapeValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/:/g, '\\:');
}

function jsonToProperties(input: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid JSON' };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false as const, message: 'JSON input must be a flat object of key/value pairs.' };
  }

  const obj = parsed as Record<string, unknown>;
  const lines: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === 'object') {
      return {
        ok: false as const,
        message: `Key "${key}" is an object or array - .properties only supports flat key/value pairs. Use dotted keys (e.g. "db.host") instead of nesting.`,
      };
    }
    lines.push(`${escapeKey(key)}=${escapeValue(String(value))}`);
  }

  return { ok: true as const, output: lines.join('\n') };
}

export default function PropertiesJsonConverter() {
  const [mode, setMode] = useState<Mode>('propertiesToJson');
  const [input, setInput] = useState(SAMPLE_PROPERTIES);

  const result = useMemo(
    () => (mode === 'propertiesToJson' ? propertiesToJson(input) : jsonToProperties(input)),
    [mode, input]
  );

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'propertiesToJson' ? SAMPLE_PROPERTIES : SAMPLE_JSON);
  }

  function swap() {
    if (result.ok) {
      setInput(result.output);
      setMode(mode === 'propertiesToJson' ? 'jsonToProperties' : 'propertiesToJson');
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
            borderColor: mode === 'propertiesToJson' ? 'var(--accent-dim)' : undefined,
            color: mode === 'propertiesToJson' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('propertiesToJson')}
        >
          .properties → JSON
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'jsonToProperties' ? 'var(--accent-dim)' : undefined,
            color: mode === 'jsonToProperties' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('jsonToProperties')}
        >
          JSON → .properties
        </button>
        <button className="icon-btn" onClick={swap} disabled={!result.ok}>
          Swap input ↔ output
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'propertiesToJson' ? '.properties' : 'JSON'}</span>
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
            <span>{mode === 'propertiesToJson' ? 'JSON' : '.properties'}</span>
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
        Dotted keys like "db.host" are kept flat as-is in JSON, not nested into {'{ db: { host: ... } }'} - .properties
        has no native nesting, so guessing at intended structure would be unreliable. Want real nested sections
        instead? Try the <a href="/tools/converters/ini-json-converter">INI ⇄ JSON Converter</a>.
      </div>
    </div>
  );
}
