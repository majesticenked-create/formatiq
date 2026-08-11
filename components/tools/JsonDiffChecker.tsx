'use client';

import { useMemo, useState } from 'react';

const SAMPLE_A = `{
  "user": {
    "name": "Alex",
    "address": {
      "city": "NYC",
      "zip": "10001"
    },
    "roles": ["admin", "editor"]
  },
  "active": true
}`;

const SAMPLE_B = `{
  "user": {
    "name": "Alex",
    "address": {
      "city": "LA",
      "zip": "10001"
    },
    "roles": ["admin"]
  },
  "active": true,
  "verified": false
}`;

type DiffEntry =
  | { path: string; type: 'added'; newValue: unknown }
  | { path: string; type: 'removed'; oldValue: unknown }
  | { path: string; type: 'changed'; oldValue: unknown; newValue: unknown };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function formatValue(v: unknown): string {
  if (typeof v === 'string') return `"${v}"`;
  return JSON.stringify(v);
}

function diffNode(a: unknown, b: unknown, path: string, out: DiffEntry[]) {
  const aIsArray = Array.isArray(a);
  const bIsArray = Array.isArray(b);

  if (aIsArray && bIsArray) {
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      const childPath = `${path}[${i}]`;
      if (i >= a.length) out.push({ path: childPath, type: 'added', newValue: b[i] });
      else if (i >= b.length) out.push({ path: childPath, type: 'removed', oldValue: a[i] });
      else diffNode(a[i], b[i], childPath, out);
    }
    return;
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
    for (const key of keys) {
      const childPath = path ? `${path}.${key}` : key;
      const hasA = Object.prototype.hasOwnProperty.call(a, key);
      const hasB = Object.prototype.hasOwnProperty.call(b, key);
      if (!hasA) out.push({ path: childPath, type: 'added', newValue: b[key] });
      else if (!hasB) out.push({ path: childPath, type: 'removed', oldValue: a[key] });
      else diffNode(a[key], b[key], childPath, out);
    }
    return;
  }

  // Primitives, or a type mismatch (e.g. object vs array, or object vs string) —
  // either way there's nothing deeper to recurse into, so compare directly.
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    out.push({ path: path || '(root)', type: 'changed', oldValue: a, newValue: b });
  }
}

function tryDiff(rawA: string, rawB: string) {
  let parsedA: unknown;
  try {
    parsedA = JSON.parse(rawA);
  } catch (err) {
    return { ok: false as const, side: 'left' as const, message: err instanceof Error ? err.message : 'Invalid JSON' };
  }

  let parsedB: unknown;
  try {
    parsedB = JSON.parse(rawB);
  } catch (err) {
    return { ok: false as const, side: 'right' as const, message: err instanceof Error ? err.message : 'Invalid JSON' };
  }

  const entries: DiffEntry[] = [];
  diffNode(parsedA, parsedB, '', entries);

  const added = entries.filter((e) => e.type === 'added').length;
  const removed = entries.filter((e) => e.type === 'removed').length;
  const changed = entries.filter((e) => e.type === 'changed').length;

  return { ok: true as const, entries, added, removed, changed };
}

export default function JsonDiffChecker() {
  const [jsonA, setJsonA] = useState(SAMPLE_A);
  const [jsonB, setJsonB] = useState(SAMPLE_B);

  const result = useMemo(() => tryDiff(jsonA, jsonB), [jsonA, jsonB]);

  function loadSample() {
    setJsonA(SAMPLE_A);
    setJsonB(SAMPLE_B);
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={loadSample}>
          Load sample
        </button>
        <button
          className="icon-btn"
          onClick={() => {
            setJsonA('');
            setJsonB('');
          }}
        >
          Clear
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>JSON A</span>
          </div>
          <textarea
            className="mono"
            value={jsonA}
            onChange={(e) => setJsonA(e.target.value)}
            spellCheck={false}
            placeholder="Paste the original JSON..."
          />
          {!result.ok && result.side === 'left' && (
            <div className="status-line status-invalid">✗ {result.message}</div>
          )}
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>JSON B</span>
          </div>
          <textarea
            className="mono"
            value={jsonB}
            onChange={(e) => setJsonB(e.target.value)}
            spellCheck={false}
            placeholder="Paste the changed JSON..."
          />
          {!result.ok && result.side === 'right' && (
            <div className="status-line status-invalid">✗ {result.message}</div>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>Structural diff</span>
        </div>
        {!result.ok ? (
          <div className="output mono">
            {'// Fix the invalid JSON above (' + (result.side === 'left' ? 'JSON A' : 'JSON B') + ') to see the diff'}
          </div>
        ) : (
          <>
            <div className="output mono" style={{ padding: 0 }}>
              {result.entries.length === 0 ? (
                <div style={{ padding: '2px 12px' }}>No differences — the two JSON values are structurally equal.</div>
              ) : (
                result.entries.map((entry, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '2px 12px',
                      background:
                        entry.type === 'added'
                          ? 'rgba(82, 194, 94, 0.12)'
                          : entry.type === 'removed'
                          ? 'rgba(224, 82, 82, 0.12)'
                          : 'rgba(242, 183, 5, 0.12)',
                      borderLeft:
                        entry.type === 'added'
                          ? '3px solid #52c25e'
                          : entry.type === 'removed'
                          ? '3px solid #e05252'
                          : '3px solid #f2b705',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {entry.type === 'added' && `+ ${entry.path}: added ${formatValue(entry.newValue)}`}
                    {entry.type === 'removed' && `- ${entry.path}: removed (was ${formatValue(entry.oldValue)})`}
                    {entry.type === 'changed' &&
                      `~ ${entry.path}: changed from ${formatValue(entry.oldValue)} to ${formatValue(entry.newValue)}`}
                  </div>
                ))
              )}
            </div>
            <div className="status-line status-neutral">
              {result.added} added, {result.removed} removed, {result.changed} changed
            </div>
          </>
        )}
      </div>
    </div>
  );
}
