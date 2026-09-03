'use client';

import { useMemo, useState } from 'react';

const SAMPLE = 'id,name,role,active\n1,Ada Lovelace,Engineer,true\n2,"Grace Hopper, PhD",Engineer,true\n3,Alan Turing,Mathematician,false';

function parseCsvRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

function parseCsv(input: string) {
  if (!input.trim()) return { ok: false as const, message: 'Paste some CSV to view.' };

  const rows = parseCsvRows(input);
  if (rows.length === 0) return { ok: false as const, message: 'No rows found.' };

  const columnCount = rows[0].length;
  const inconsistent = rows.some((r) => r.length !== columnCount);

  return { ok: true as const, headers: rows[0], body: rows.slice(1), columnCount, inconsistent };
}

export default function CsvViewer() {
  const [input, setInput] = useState(SAMPLE);
  const result = useMemo(() => parseCsv(input), [input]);

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
            <span>CSV input</span>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste CSV here..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok
              ? `✓ ${result.body.length} row${result.body.length === 1 ? '' : 's'}, ${result.columnCount} column${result.columnCount === 1 ? '' : 's'}${result.inconsistent ? ' (uneven row lengths)' : ''}`
              : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Table view</span>
          </div>
          <div className="output mono" style={{ overflow: 'auto', padding: 0 }}>
            {result.ok ? (
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
                <thead>
                  <tr>
                    {result.headers.map((h, i) => (
                      <th
                        key={i}
                        style={{
                          textAlign: 'left',
                          padding: '6px 10px',
                          borderBottom: '1px solid var(--border)',
                          whiteSpace: 'nowrap',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {h || <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.body.map((row, ri) => (
                    <tr key={ri}>
                      {result.headers.map((_, ci) => (
                        <td
                          key={ci}
                          style={{
                            padding: '6px 10px',
                            borderBottom: '1px solid var(--border)',
                            whiteSpace: 'nowrap',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {row[ci] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              '// Fix the input to see a table'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
