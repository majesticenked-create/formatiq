'use client';

import { useMemo, useState } from 'react';

const SAMPLE = '2, 3\n1, 4';

function parseMatrix(input: string): number[][] | null {
  const rows = input
    .trim()
    .split('\n')
    .map((r) => r.trim())
    .filter((r) => r.length > 0);

  if (rows.length === 0 || rows.length > 4) return null;

  const matrix: number[][] = [];
  for (const row of rows) {
    const values = row.split(',').map((v) => Number(v.trim()));
    if (values.some((v) => Number.isNaN(v))) return null;
    matrix.push(values);
  }

  const size = matrix.length;
  if (matrix.some((r) => r.length !== size)) return null;

  return matrix;
}

function determinant(m: number[][]): number {
  const n = m.length;
  if (n === 1) return m[0][0];
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];

  let det = 0;
  for (let col = 0; col < n; col++) {
    const minor = m.slice(1).map((row) => row.filter((_, c) => c !== col));
    det += (col % 2 === 0 ? 1 : -1) * m[0][col] * determinant(minor);
  }
  return det;
}

export default function MatrixDeterminantCalculator() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => {
    const matrix = parseMatrix(input);
    if (!matrix) {
      return { ok: false as const, message: 'Enter a square matrix (1×1 to 4×4): one row per line, values separated by commas.' };
    }
    return { ok: true as const, matrix, det: determinant(matrix) };
  }, [input]);

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Matrix (one row per line, comma-separated)</span>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="2, 3&#10;1, 4"
          style={{ minHeight: 120 }}
        />
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>Determinant</span>
        </div>
        <div className="output mono" style={{ fontSize: 24 }}>
          {result.ok ? result.det.toLocaleString('en-US', { maximumFractionDigits: 6 }) : `// ${result.message}`}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? `✓ ${result.matrix.length}×${result.matrix.length} matrix` : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
