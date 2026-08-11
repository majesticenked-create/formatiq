'use client';

import { useMemo, useState } from 'react';

type Mode = 'csvToTsv' | 'tsvToCsv';

const SAMPLE_CSV = 'id,name,notes\n1,Formatiq,"Free, browser-based tools"\n2,"Codebeautify, Inc.",Competitor';
const SAMPLE_TSV = 'id\tname\tnotes\n1\tFormatiq\t"Tab-separated, no comma escaping needed"\n2\tExample Co.\tCompetitor';

// Same quoted-field CSV/TSV parsing approach used by csv-json-converter.tsx,
// generalized to accept either delimiter so the logic isn't duplicated per format.
function parseDelimitedLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      fields.push(field);
      field = '';
    } else {
      field += char;
    }
  }

  fields.push(field);
  return fields;
}

function parseDelimitedRows(input: string, delimiter: string): string[][] {
  const rows: string[] = [];
  let row = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"') inQuotes = !inQuotes;
    if (char === '\n' && !inQuotes) {
      rows.push(row);
      row = '';
    } else {
      row += char;
    }
  }
  if (row.length) rows.push(row);

  return rows.map((r) => parseDelimitedLine(r, delimiter));
}

function escapeField(value: string, delimiter: string): string {
  const needsQuoting = value.includes(delimiter) || value.includes('"') || value.includes('\n');
  return needsQuoting ? `"${value.replace(/"/g, '""')}"` : value;
}

function convertDelimited(input: string, fromDelimiter: string, toDelimiter: string) {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false as const, message: 'Paste some data to convert.' };

  const rows = parseDelimitedRows(trimmed, fromDelimiter).filter((r) => r.length > 1 || r[0] !== '');
  if (rows.length < 1) return { ok: false as const, message: 'No rows found in the input.' };

  const output = rows.map((row) => row.map((field) => escapeField(field, toDelimiter)).join(toDelimiter)).join('\n');

  return { ok: true as const, output, rowCount: rows.length, columnCount: rows[0].length };
}

export default function CsvTsvConverter() {
  const [mode, setMode] = useState<Mode>('csvToTsv');
  const [input, setInput] = useState(SAMPLE_CSV);

  const result = useMemo(
    () => (mode === 'csvToTsv' ? convertDelimited(input, ',', '\t') : convertDelimited(input, '\t', ',')),
    [mode, input]
  );

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'csvToTsv' ? SAMPLE_CSV : SAMPLE_TSV);
  }

  function swap() {
    if (result.ok) {
      setInput(result.output);
      setMode(mode === 'csvToTsv' ? 'tsvToCsv' : 'csvToTsv');
    }
  }

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <button className={`icon-btn${mode === 'csvToTsv' ? ' is-active' : ''}`} onClick={() => switchMode('csvToTsv')}>
          CSV → TSV
        </button>
        <button className={`icon-btn${mode === 'tsvToCsv' ? ' is-active' : ''}`} onClick={() => switchMode('tsvToCsv')}>
          TSV → CSV
        </button>
        <button className="icon-btn" onClick={swap} disabled={!result.ok}>
          Swap input ↔ output
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'csvToTsv' ? 'CSV' : 'TSV'}</span>
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
            <span>{mode === 'csvToTsv' ? 'TSV' : 'CSV'}</span>
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
