'use client';

import { useMemo, useState } from 'react';

const SAMPLE = '{"id":1,"name":"Formatiq","tags":["json","tools"],"active":true}';

interface LineCol {
  line: number;
  column: number;
}

function positionToLineCol(input: string, position: number): LineCol {
  let line = 1;
  let column = 1;
  for (let i = 0; i < position && i < input.length; i++) {
    if (input[i] === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}

function extractPosition(message: string): number | null {
  const match = message.match(/position (\d+)/i);
  return match ? Number(match[1]) : null;
}

interface Breakdown {
  rootType: string;
  topLevelCount: number;
  maxDepth: number;
  totalValues: number;
}

function analyze(value: unknown, depth = 0): { maxDepth: number; totalValues: number } {
  if (value === null || typeof value !== 'object') {
    return { maxDepth: depth, totalValues: 1 };
  }
  const entries = Array.isArray(value) ? value : Object.values(value);
  if (entries.length === 0) {
    return { maxDepth: depth, totalValues: 1 };
  }
  let maxDepth = depth;
  let totalValues = 1;
  for (const entry of entries) {
    const child = analyze(entry, depth + 1);
    maxDepth = Math.max(maxDepth, child.maxDepth);
    totalValues += child.totalValues;
  }
  return { maxDepth, totalValues };
}

function buildBreakdown(value: unknown): Breakdown {
  const rootType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  const topLevelCount =
    value === null ? 0 : Array.isArray(value) ? value.length : typeof value === 'object' ? Object.keys(value).length : 0;
  const { maxDepth, totalValues } = analyze(value);
  return { rootType, topLevelCount, maxDepth, totalValues };
}

type Result =
  | { ok: true; breakdown: Breakdown }
  | { ok: false; message: string; lineCol: LineCol | null };

function validate(input: string): Result {
  try {
    const parsed = JSON.parse(input);
    return { ok: true, breakdown: buildBreakdown(parsed) };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid JSON';
    const position = extractPosition(message);
    const lineCol = position !== null ? positionToLineCol(input, position) : null;
    return { ok: false, message, lineCol };
  }
}

export default function JsonValidator() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => (input.trim() ? validate(input) : null), [input]);

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

      <div className="panel">
        <div className="panel-bar">
          <span>JSON input</span>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="Paste JSON here..."
        />
        <div
          className={`status-line ${
            result === null ? 'status-neutral' : result.ok ? 'status-valid' : 'status-invalid'
          }`}
        >
          {result === null
            ? 'Enter some JSON to validate.'
            : result.ok
              ? '✓ Valid JSON'
              : `✗ ${result.message}${result.lineCol ? ` (line ${result.lineCol.line}, column ${result.lineCol.column})` : ''}`}
        </div>
      </div>

      {result?.ok && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>Structure breakdown</span>
          </div>
          <div className="output mono" style={{ minHeight: 'auto', padding: '16px 20px' }}>
            {`Root type:        ${result.breakdown.rootType}
Top-level items:  ${result.breakdown.topLevelCount}
Max nesting depth: ${result.breakdown.maxDepth}
Total values:     ${result.breakdown.totalValues}`}
          </div>
        </div>
      )}

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        This tool checks syntax only and shows the line and column of the first error when the browser&apos;s parser
        can determine one - it doesn&apos;t reformat or minify. Need to pretty-print or minify valid JSON? Use the{' '}
        <a href="/tools/formatters/json-formatter">JSON Formatter</a>.
      </div>
    </div>
  );
}
