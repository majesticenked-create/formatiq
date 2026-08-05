'use client';

import { useMemo, useState } from 'react';

const SAMPLE = JSON.stringify(
  [
    { id: 1, name: 'Formatiq', category: 'tools', active: true },
    { id: 2, name: 'Codebeautify', category: 'tools', active: false },
  ],
  null,
  2
);

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function tryConvert(input: string, delimiter: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid JSON' };
  }

  const rows = Array.isArray(parsed) ? parsed : [parsed];
  if (rows.length === 0) {
    return { ok: false as const, message: 'JSON array is empty — nothing to convert.' };
  }
  if (!rows.every((row) => typeof row === 'object' && row !== null && !Array.isArray(row))) {
    return { ok: false as const, message: 'JSON must be an object or an array of flat objects.' };
  }

  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row as Record<string, unknown>))));
  const lines = [
    headers.join(delimiter),
    ...rows.map((row) =>
      headers.map((key) => csvEscape((row as Record<string, unknown>)[key])).join(delimiter)
    ),
  ];

  return { ok: true as const, output: lines.join('\n'), rowCount: rows.length, columnCount: headers.length };
}

export default function JsonToCsv() {
  const [input, setInput] = useState(SAMPLE);
  const [delimiter, setDelimiter] = useState(',');

  const result = useMemo(() => tryConvert(input, delimiter), [input, delimiter]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  function downloadCsv() {
    if (!result.ok) return;
    const blob = new Blob([result.output], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Delimiter:
        </label>
        {[
          [',', 'Comma'],
          [';', 'Semicolon'],
          ['\t', 'Tab'],
        ].map(([value, label]) => (
          <button
            key={label}
            className="icon-btn"
            style={{
              borderColor: delimiter === value ? 'var(--accent-dim)' : undefined,
              color: delimiter === value ? 'var(--text-primary)' : undefined,
            }}
            onClick={() => setDelimiter(value)}
          >
            {label}
          </button>
        ))}
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>JSON input</span>
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
            placeholder="Paste a JSON object or array of objects..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? `✓ ${result.rowCount} row(s), ${result.columnCount} column(s)` : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>CSV output</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
              <button className="icon-btn" onClick={downloadCsv} disabled={!result.ok}>
                Download
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : '// Fix the errors on the left to see CSV output'}</div>
          <div className="status-line status-neutral">
            {result.ok ? `${result.output.split('\n').length} lines` : ' '}
          </div>
        </div>
      </div>
    </div>
  );
}
