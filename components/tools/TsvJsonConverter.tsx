'use client';

import { useMemo, useState } from 'react';

type Mode = 'tsvToJson' | 'jsonToTsv';

const SAMPLE_TSV = 'id\tname\tactive\n1\tFormatiq\ttrue\n2\tCodebeautify Inc.\tfalse';
const SAMPLE_JSON = JSON.stringify(
  [
    { id: 1, name: 'Formatiq', active: true },
    { id: 2, name: 'Codebeautify Inc.', active: false },
  ],
  null,
  2
);

function inferValue(raw: string): unknown {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw !== '' && !Number.isNaN(Number(raw))) return Number(raw);
  return raw;
}

function tsvToJson(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false as const, message: 'Paste some TSV to convert.' };

  const rows = trimmed.split('\n').map((line) => line.split('\t'));
  if (rows.length < 1) return { ok: false as const, message: 'No rows found in TSV input.' };

  const headers = rows[0];
  const dataRows = rows.slice(1);

  const objects = dataRows.map((row) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((header, i) => {
      obj[header] = inferValue(row[i] ?? '');
    });
    return obj;
  });

  return { ok: true as const, output: JSON.stringify(objects, null, 2), rowCount: objects.length, columnCount: headers.length };
}

function tsvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  // TSV has no quoting convention, so a literal tab or newline inside a
  // value is replaced rather than escaped — unlike CSV, there's no
  // standard way to preserve it in a plain tab-delimited cell.
  return str.replace(/\t/g, ' ').replace(/\n/g, ' ');
}

function jsonToTsv(input: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid JSON' };
  }

  if (!Array.isArray(parsed)) {
    return { ok: false as const, message: 'JSON input must be an array of objects.' };
  }
  if (parsed.length === 0) {
    return { ok: false as const, message: 'JSON array is empty - nothing to convert.' };
  }
  if (!parsed.every((row) => typeof row === 'object' && row !== null && !Array.isArray(row))) {
    return { ok: false as const, message: 'Every array item must be a flat object.' };
  }

  const headers = Array.from(new Set(parsed.flatMap((row) => Object.keys(row as Record<string, unknown>))));
  const lines = [
    headers.join('\t'),
    ...parsed.map((row) => headers.map((key) => tsvEscape((row as Record<string, unknown>)[key])).join('\t')),
  ];

  return { ok: true as const, output: lines.join('\n'), rowCount: parsed.length, columnCount: headers.length };
}

export default function TsvJsonConverter() {
  const [mode, setMode] = useState<Mode>('tsvToJson');
  const [input, setInput] = useState(SAMPLE_TSV);

  const result = useMemo(() => (mode === 'tsvToJson' ? tsvToJson(input) : jsonToTsv(input)), [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'tsvToJson' ? SAMPLE_TSV : SAMPLE_JSON);
  }

  function swap() {
    if (result.ok) {
      setInput(result.output);
      setMode(mode === 'tsvToJson' ? 'jsonToTsv' : 'tsvToJson');
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
            borderColor: mode === 'tsvToJson' ? 'var(--accent-dim)' : undefined,
            color: mode === 'tsvToJson' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('tsvToJson')}
        >
          TSV → JSON
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'jsonToTsv' ? 'var(--accent-dim)' : undefined,
            color: mode === 'jsonToTsv' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('jsonToTsv')}
        >
          JSON → TSV
        </button>
        <button className="icon-btn" onClick={swap} disabled={!result.ok}>
          Swap input ↔ output
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'tsvToJson' ? 'TSV' : 'JSON'}</span>
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
            <span>{mode === 'tsvToJson' ? 'JSON' : 'TSV'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : ''}</div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? `✓ ${result.rowCount} row(s), ${result.columnCount} column(s)` : `✗ ${result.message}`}
          </div>
        </div>
      </div>
    </div>
  );
}
