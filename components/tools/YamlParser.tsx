'use client';

import { useMemo, useState } from 'react';
import { parseYaml, type YamlValue } from '@/lib/tools/yaml-utils';

const SAMPLE = 'id: 1\nname: Formatiq\ntags:\n  - json\n  - yaml\nmeta:\n  active: true\n  owner: null\n';

function isObject(v: YamlValue): v is { [key: string]: YamlValue } {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function PrimitiveValue({ value }: { value: YamlValue }) {
  if (value === null || value === undefined) return <span className="jt-null">null</span>;
  if (typeof value === 'string') return <span className="jt-string">&quot;{value}&quot;</span>;
  if (typeof value === 'boolean') return <span className="jt-boolean">{String(value)}</span>;
  return <span className="jt-number">{String(value)}</span>;
}

interface NodeProps {
  label: string | null;
  value: YamlValue;
  isLast: boolean;
}

function TreeNode({ label, value, isLast }: NodeProps) {
  const isContainer = isObject(value) || Array.isArray(value);

  if (!isContainer) {
    return (
      <div style={{ paddingLeft: 16 }}>
        {label !== null && (
          <>
            <span className="jt-key">{label}</span>
            <span className="jt-punct">: </span>
          </>
        )}
        <PrimitiveValue value={value} />
        {!isLast && <span className="jt-punct">,</span>}
      </div>
    );
  }

  const entries: [string, YamlValue][] = Array.isArray(value)
    ? value.map((v, i) => [String(i), v])
    : Object.entries(value);
  const openBracket = Array.isArray(value) ? '[' : '{';
  const closeBracket = Array.isArray(value) ? ']' : '}';

  return (
    <div style={{ paddingLeft: 16 }}>
      {label !== null && (
        <>
          <span className="jt-key">{label}</span>
          <span className="jt-punct">: </span>
        </>
      )}
      <span className="jt-punct">{openBracket}</span>
      {entries.length === 0 && <span className="jt-punct">{closeBracket}</span>}
      {entries.map(([k, v], i) => (
        <TreeNode key={k} label={Array.isArray(value) ? null : k} value={v} isLast={i === entries.length - 1} />
      ))}
      {entries.length > 0 && (
        <div>
          <span className="jt-punct">
            {closeBracket}
            {!isLast && ','}
          </span>
        </div>
      )}
    </div>
  );
}

export default function YamlParser() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => parseYaml(input), [input]);

  const jsonPreview = useMemo(() => {
    if (!result.ok) return '';
    try {
      return JSON.stringify(result.value, null, 2);
    } catch {
      return '';
    }
  }, [result]);

  function copyJson() {
    if (result.ok) navigator.clipboard.writeText(jsonPreview);
  }

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
            <span>YAML input</span>
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
            placeholder="Paste YAML here..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Valid YAML' : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Structure tree</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyJson} disabled={!result.ok}>
                Copy as JSON
              </button>
            </div>
          </div>
          <div className="output mono">
            {result.ok ? <TreeNode label={null} value={result.value} isLast /> : '// Fix the errors on the left to see the structure'}
          </div>
          <div className="status-line status-neutral"> </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Parses with js-yaml&apos;s safe <code>load()</code> (no arbitrary type instantiation from YAML tags) and
        renders the resulting value as a real, expandable structure - the JSON-equivalent shape of your YAML, the
        same way the <a href="/tools/formatters/json-tree-viewer">JSON Tree Viewer</a> renders parsed JSON. This is
        for inspecting structure, not reformatting the source - for that, use the{' '}
        <a href="/tools/formatters/yaml-formatter">YAML Formatter &amp; Validator</a> instead.
      </div>
    </div>
  );
}
