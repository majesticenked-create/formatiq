'use client';

import { useMemo, useState } from 'react';
import { decodeBase64Utf8 } from '@/lib/tools/base64-utils';
import { parseDelimitedRows } from './CsvTsvConverter';

const SAMPLE = 'aWQJbmFtZQlub3RlcwoxCUZvcm1hdGlxCSJUYWIsIG5vdGUi';

type Stage = 'base64' | 'utf8' | 'tsv';

function convert(input: string) {
  if (!input.trim()) {
    return { ok: false as const, stage: 'base64' as Stage, message: 'Paste a Base64 string or data URI.' };
  }

  const decoded = decodeBase64Utf8(input);
  if (!decoded.ok) {
    return { ok: false as const, stage: decoded.stage, message: decoded.message };
  }

  const trimmed = decoded.text.trim();
  if (!trimmed) {
    return { ok: false as const, stage: 'tsv' as Stage, message: 'Decoded text is empty - no rows to parse.' };
  }

  const rows = parseDelimitedRows(trimmed, '\t').filter((r) => r.length > 1 || r[0] !== '');
  if (rows.length < 1) {
    return { ok: false as const, stage: 'tsv' as Stage, message: 'No TSV rows found in the decoded text.' };
  }

  return { ok: true as const, rows };
}

export default function Base64ToTsv() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => convert(input), [input]);

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
            <span>TSV table preview</span>
          </div>
          <div className="output mono" style={{ overflowX: 'auto' }}>
            {result.ok ? (
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          style={{ border: '1px solid var(--border, #333)', padding: '4px 8px', whiteSpace: 'pre-wrap' }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              ''
            )}
          </div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? `✓ ${result.rows.length} row(s), ${result.rows[0].length} column(s)` : `✗ ${result.message}`}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Decoding happens in three stages: (1) Base64 alphabet and padding, (2) whether the decoded
        bytes form valid UTF-8 text, (3) parsing that text as tab-separated values with the same
        quote/escape-aware parser used by{' '}
        <a href="/tools/converters/csv-tsv-converter">CSV ⇄ TSV Converter</a>, so quoted fields
        (including ones containing literal commas) and empty cells are preserved correctly. Runs
        entirely client-side.
      </div>
    </div>
  );
}
