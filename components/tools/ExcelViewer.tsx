'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

interface SheetData {
  name: string;
  rows: string[][];
}

type Result = { ok: true; sheets: SheetData[] } | { ok: false; message: string } | { ok: null };

export default function ExcelViewer() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<Result>({ ok: null });
  const [activeSheet, setActiveSheet] = useState(0);

  async function handleFile(file: File) {
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });

      if (workbook.SheetNames.length === 0) {
        setResult({ ok: false, message: 'No sheets found in this file.' });
        return;
      }

      const sheets: SheetData[] = workbook.SheetNames.map((name) => {
        const sheet = workbook.Sheets[name];
        const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '', raw: false });
        return { name, rows: rows.map((r) => r.map((cell) => String(cell ?? ''))) };
      });

      setActiveSheet(0);
      setResult({ ok: true, sheets });
    } catch (e) {
      setResult({ ok: false, message: `Couldn't read this file - ${(e as Error).message}` });
    }
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  const sheet = result.ok ? result.sheets[activeSheet] : null;
  const headers = sheet?.rows[0] ?? [];
  const body = sheet?.rows.slice(1) ?? [];

  return (
    <div>
      <div className="control-row">
        <label className="icon-btn" style={{ cursor: 'pointer' }}>
          Choose .xlsx or .xls file
          <input type="file" accept=".xlsx,.xls" onChange={onFileInput} style={{ display: 'none' }} />
        </label>
        {fileName && <span className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fileName}</span>}
      </div>

      {result.ok && result.sheets.length > 1 && (
        <div className="control-row">
          {result.sheets.map((s, i) => (
            <button
              key={s.name}
              className={`icon-btn${i === activeSheet ? ' is-active' : ''}`}
              onClick={() => setActiveSheet(i)}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="panel">
        <div className="panel-bar">
          <span>{sheet ? `${sheet.name} (${body.length} row${body.length === 1 ? '' : 's'})` : 'Table view'}</span>
        </div>
        <div className="output mono" style={{ overflow: 'auto', padding: 0 }}>
          {result.ok === null && '// Choose a spreadsheet file to view it as a table'}
          {result.ok === false && `✗ ${result.message}`}
          {sheet && (
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
              <thead>
                <tr>
                  {headers.map((h, i) => (
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
                {body.map((row, ri) => (
                  <tr key={ri}>
                    {headers.map((_, ci) => (
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
          )}
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        The file is parsed entirely in your browser - it's never uploaded anywhere.
      </div>
    </div>
  );
}
