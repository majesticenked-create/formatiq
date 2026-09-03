'use client';

import { useMemo, useState } from 'react';

const SAMPLE_JSON = JSON.stringify(
  {
    store: {
      books: [
        { title: 'Refactoring', price: 45, author: 'Martin Fowler' },
        { title: 'Clean Code', price: 35, author: 'Robert C. Martin' },
        { title: 'The Pragmatic Programmer', price: 40, author: 'David Thomas' },
      ],
    },
  },
  null,
  2
);
const SAMPLE_PATH = '$.store.books[*].title';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface Segment {
  type: 'key' | 'index' | 'wildcard' | 'slice' | 'indexList' | 'recursive';
  key?: string;
  index?: number;
  indices?: number[];
  start?: number;
  end?: number;
}

function tokenizePath(path: string): Segment[] {
  const segments: Segment[] = [];
  let rest = path.trim();
  if (rest.startsWith('$')) rest = rest.slice(1);

  const tokenRegex = /\.\.([a-zA-Z0-9_]+)|\.([a-zA-Z0-9_]+)|\[\s*'([^']+)'\s*\]|\[\s*\*\s*\]|\[\s*(-?\d+)\s*:\s*(-?\d+)\s*\]|\[\s*(-?\d+(?:\s*,\s*-?\d+)*)\s*\]/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = tokenRegex.exec(rest))) {
    if (match.index !== lastIndex) {
      throw new Error(`Unrecognized path syntax near "${rest.slice(lastIndex, match.index + 10)}"`);
    }
    if (match[1] !== undefined) {
      segments.push({ type: 'recursive', key: match[1] });
    } else if (match[2] !== undefined) {
      segments.push({ type: 'key', key: match[2] });
    } else if (match[3] !== undefined) {
      segments.push({ type: 'key', key: match[3] });
    } else if (match[4] !== undefined && match[5] !== undefined) {
      segments.push({ type: 'slice', start: Number(match[4]), end: Number(match[5]) });
    } else if (match[6] !== undefined) {
      const parts = match[6].split(',').map((s) => Number(s.trim()));
      if (parts.length === 1) segments.push({ type: 'index', index: parts[0] });
      else segments.push({ type: 'indexList', indices: parts });
    } else {
      segments.push({ type: 'wildcard' });
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex !== rest.length) {
    throw new Error(`Unrecognized path syntax near "${rest.slice(lastIndex)}"`);
  }

  return segments;
}

function collectRecursive(node: JsonValue, key: string, results: JsonValue[]) {
  if (node && typeof node === 'object') {
    if (!Array.isArray(node) && key in node) results.push((node as Record<string, JsonValue>)[key]);
    const children = Array.isArray(node) ? node : Object.values(node);
    for (const child of children) collectRecursive(child, key, results);
  }
}

function applySegment(nodes: JsonValue[], segment: Segment): JsonValue[] {
  const results: JsonValue[] = [];

  for (const node of nodes) {
    if (segment.type === 'recursive') {
      collectRecursive(node, segment.key!, results);
      continue;
    }
    if (node === null || typeof node !== 'object') continue;

    if (segment.type === 'key') {
      if (!Array.isArray(node) && segment.key! in node) results.push((node as Record<string, JsonValue>)[segment.key!]);
    } else if (segment.type === 'index') {
      if (Array.isArray(node)) {
        const idx = segment.index! < 0 ? node.length + segment.index! : segment.index!;
        if (idx >= 0 && idx < node.length) results.push(node[idx]);
      }
    } else if (segment.type === 'indexList') {
      if (Array.isArray(node)) {
        for (const i of segment.indices!) {
          const idx = i < 0 ? node.length + i : i;
          if (idx >= 0 && idx < node.length) results.push(node[idx]);
        }
      }
    } else if (segment.type === 'slice') {
      if (Array.isArray(node)) {
        const start = segment.start! < 0 ? Math.max(0, node.length + segment.start!) : segment.start!;
        const end = segment.end! < 0 ? node.length + segment.end! : segment.end!;
        results.push(...node.slice(start, end));
      }
    } else if (segment.type === 'wildcard') {
      results.push(...(Array.isArray(node) ? node : Object.values(node)));
    }
  }

  return results;
}

function evaluateJsonPath(json: JsonValue, path: string): JsonValue[] {
  const segments = tokenizePath(path);
  return segments.reduce((nodes, seg) => applySegment(nodes, seg), [json]);
}

export default function JsonPathTester() {
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [pathInput, setPathInput] = useState(SAMPLE_PATH);

  const result = useMemo(() => {
    let parsed: JsonValue;
    try {
      parsed = JSON.parse(jsonInput);
    } catch (e) {
      return { ok: false as const, message: `Invalid JSON: ${(e as Error).message}` };
    }
    try {
      const matches = evaluateJsonPath(parsed, pathInput);
      return { ok: true as const, matches };
    } catch (e) {
      return { ok: false as const, message: (e as Error).message };
    }
  }, [jsonInput, pathInput]);

  return (
    <div>
      <div className="control-row">
        <button
          className="icon-btn"
          onClick={() => {
            setJsonInput(SAMPLE_JSON);
            setPathInput(SAMPLE_PATH);
          }}
        >
          Load sample
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>JSON input</span>
        </div>
        <textarea
          className="mono"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          spellCheck={false}
          placeholder="Paste JSON here..."
        />
      </div>

      <div className="control-row" style={{ marginTop: 12 }}>
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Path:
        </label>
        <input
          className="mono"
          style={{ flex: 1, padding: '6px 10px' }}
          value={pathInput}
          onChange={(e) => setPathInput(e.target.value)}
          spellCheck={false}
          placeholder="$.store.books[*].title"
        />
      </div>

      <div className="panel" style={{ marginTop: 12 }}>
        <div className="panel-bar">
          <span>{result.ok ? `${result.matches.length} match${result.matches.length === 1 ? '' : 'es'}` : 'Result'}</span>
          <div className="panel-actions">
            <button
              className="icon-btn"
              onClick={() => result.ok && navigator.clipboard.writeText(JSON.stringify(result.matches, null, 2))}
              disabled={!result.ok}
            >
              Copy
            </button>
          </div>
        </div>
        <div className="output mono">{result.ok ? JSON.stringify(result.matches, null, 2) : `// ${result.message}`}</div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Query evaluated' : `✗ ${result.message}`}
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Supports a common JSONPath subset: <code>.key</code>, <code>[n]</code>, <code>[*]</code>,{' '}
        <code>[start:end]</code>, <code>[n,n]</code>, and <code>..key</code> recursive descent - not
        the full spec (filter expressions like <code>[?(@.price&gt;20)]</code> aren&apos;t supported).
      </div>
    </div>
  );
}
