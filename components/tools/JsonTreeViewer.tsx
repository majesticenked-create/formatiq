'use client';

import { useMemo, useState } from 'react';

const SAMPLE =
  '{"id":1,"name":"Formatiq","active":true,"tags":["json","tools"],"meta":{"created":"2026-01-01","owner":null,"stats":{"views":4213,"likes":87}}}';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function isObject(v: JsonValue): v is { [key: string]: JsonValue } {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function tryParse(input: string): { ok: true; value: JsonValue } | { ok: false; message: string } {
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Invalid JSON' };
  }
}

function collectPaths(value: JsonValue, path: string, out: string[]) {
  if (isObject(value)) {
    out.push(path);
    Object.entries(value).forEach(([k, v]) => collectPaths(v, `${path}.${k}`, out));
  } else if (Array.isArray(value)) {
    out.push(path);
    value.forEach((v, i) => collectPaths(v, `${path}[${i}]`, out));
  }
}

interface NodeProps {
  label: string | null;
  value: JsonValue;
  path: string;
  collapsed: Set<string>;
  toggle: (path: string) => void;
  isLast: boolean;
}

function PrimitiveValue({ value }: { value: JsonValue }) {
  if (value === null) return <span className="jt-null">null</span>;
  if (typeof value === 'string') return <span className="jt-string">&quot;{value}&quot;</span>;
  if (typeof value === 'boolean') return <span className="jt-boolean">{String(value)}</span>;
  return <span className="jt-number">{String(value)}</span>;
}

function TreeNode({ label, value, path, collapsed, toggle, isLast }: NodeProps) {
  const isContainer = isObject(value) || Array.isArray(value);
  const isCollapsed = collapsed.has(path);

  if (!isContainer) {
    return (
      <div style={{ paddingLeft: 16 }}>
        <span className="jt-toggle" />
        {label !== null && (
          <>
            <span className="jt-key">&quot;{label}&quot;</span>
            <span className="jt-punct">: </span>
          </>
        )}
        <PrimitiveValue value={value} />
        {!isLast && <span className="jt-punct">,</span>}
      </div>
    );
  }

  const entries: [string, JsonValue][] = Array.isArray(value)
    ? value.map((v, i) => [String(i), v])
    : Object.entries(value);
  const openBracket = Array.isArray(value) ? '[' : '{';
  const closeBracket = Array.isArray(value) ? ']' : '}';
  const count = entries.length;

  return (
    <div style={{ paddingLeft: 16 }}>
      <span className="jt-toggle" onClick={() => toggle(path)}>
        {count === 0 ? ' ' : isCollapsed ? '▶' : '▼'}
      </span>
      {label !== null && (
        <>
          <span className="jt-key">&quot;{label}&quot;</span>
          <span className="jt-punct">: </span>
        </>
      )}
      <span className="jt-punct">{openBracket}</span>
      {isCollapsed && count > 0 && (
        <span className="jt-punct" style={{ opacity: 0.6 }}>
          {' '}
          {count} item{count === 1 ? '' : 's'}{' '}
        </span>
      )}
      {isCollapsed && (
        <span className="jt-punct">
          {closeBracket}
          {!isLast && ','}
        </span>
      )}
      {!isCollapsed &&
        entries.map(([k, v], i) => (
          <TreeNode
            key={k}
            label={Array.isArray(value) ? null : k}
            value={v}
            path={`${path}${Array.isArray(value) ? `[${k}]` : `.${k}`}`}
            collapsed={collapsed}
            toggle={toggle}
            isLast={i === entries.length - 1}
          />
        ))}
      {!isCollapsed && (
        <div>
          <span className="jt-toggle" />
          <span className="jt-punct">
            {closeBracket}
            {!isLast && ','}
          </span>
        </div>
      )}
    </div>
  );
}

export default function JsonTreeViewer() {
  const [input, setInput] = useState(SAMPLE);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const result = useMemo(() => tryParse(input), [input]);

  const allPaths = useMemo(() => {
    if (!result.ok) return [];
    const paths: string[] = [];
    collectPaths(result.value, '$', paths);
    return paths;
  }, [result]);

  function toggle(path: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function expandAll() {
    setCollapsed(new Set());
  }

  function collapseAll() {
    setCollapsed(new Set(allPaths));
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={expandAll} disabled={!result.ok}>
          Expand all
        </button>
        <button className="icon-btn" onClick={collapseAll} disabled={!result.ok}>
          Collapse all
        </button>
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
            placeholder="Paste JSON here..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Valid JSON' : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Tree</span>
          </div>
          <div className="output mono" style={{ lineHeight: 1.7 }}>
            {result.ok ? (
              <TreeNode label={null} value={result.value} path="$" collapsed={collapsed} toggle={toggle} isLast />
            ) : (
              '// Fix the errors on the left to explore the tree'
            )}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        For raw text formatting rather than a collapsible tree view, use the{' '}
        <a href="/tools/formatters/json-formatter">JSON Formatter</a>.
      </div>
    </div>
  );
}
