'use client';

import { useEffect, useState } from 'react';

const MIN_DIM = 1;
const MAX_DIM = 20;

function buildGrid(rows: number, cols: number, prev: string[][]): string[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => prev[r]?.[c] ?? '')
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderRow(row: string[], tag: 'th' | 'td'): string {
  const cells = row.map((cell) => `      <${tag}>${escapeHtml(cell)}</${tag}>`).join('\n');
  return `    <tr>\n${cells}\n    </tr>`;
}

function generateHtml(grid: string[][], hasHeader: boolean): string {
  const lines: string[] = ['<table>'];
  const headerRow = hasHeader ? grid[0] : null;
  const bodyRows = hasHeader ? grid.slice(1) : grid;

  if (headerRow) {
    lines.push('  <thead>');
    lines.push(renderRow(headerRow, 'th'));
    lines.push('  </thead>');
  }

  lines.push('  <tbody>');
  bodyRows.forEach((row) => lines.push(renderRow(row, 'td')));
  lines.push('  </tbody>');

  lines.push('</table>');
  return lines.join('\n');
}

export default function HtmlTableGenerator() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hasHeader, setHasHeader] = useState(true);
  const [grid, setGrid] = useState<string[][]>(() =>
    buildGrid(3, 3, [['Name', 'Role', 'Location']])
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setGrid((prev) => buildGrid(rows, cols, prev));
  }, [rows, cols]);

  function updateCell(r: number, c: number, value: string) {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = value;
      return next;
    });
  }

  function clamp(n: number) {
    return Math.min(MAX_DIM, Math.max(MIN_DIM, n));
  }

  const html = generateHtml(grid, hasHeader);

  function copy() {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Rows:
        </label>
        <input
          type="number"
          min={MIN_DIM}
          max={MAX_DIM}
          value={rows}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isNaN(n)) setRows(clamp(n));
          }}
          className="mono"
          style={{
            width: 70,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Columns:
        </label>
        <input
          type="number"
          min={MIN_DIM}
          max={MAX_DIM}
          value={cols}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isNaN(n)) setCols(clamp(n));
          }}
          className="mono"
          style={{
            width: 70,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
        <button
          className={`icon-btn ${hasHeader ? 'is-active' : ''}`}
          onClick={() => setHasHeader((h) => !h)}
        >
          Header row: {hasHeader ? 'On' : 'Off'}
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Edit cells</span>
        </div>
        <div style={{ padding: 12, overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              {grid.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} style={{ border: '1px solid var(--border)', padding: 2 }}>
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(r, c, e.target.value)}
                        className="mono"
                        style={{
                          width: '100%',
                          minWidth: 90,
                          background: hasHeader && r === 0 ? 'var(--accent-soft)' : 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          padding: '6px 8px',
                          fontWeight: hasHeader && r === 0 ? 600 : 400,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Live preview</span>
        </div>
        <div style={{ padding: 12, overflowX: 'auto' }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>HTML output</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="output mono">{html}</div>
      </div>
    </div>
  );
}
