'use client';

import { useMemo, useState } from 'react';
import { parseYaml, type YamlValue } from '@/lib/tools/yaml-utils';

const SAMPLE = 'id: 1\nname: Formatiq\ntags:\n  - json\n  - yaml\nmeta:\n  active: true\n  owner: null\n';

interface Breakdown {
  rootType: string;
  topLevelCount: number;
}

function buildBreakdown(value: YamlValue): Breakdown {
  const rootType = Array.isArray(value) ? 'sequence' : value === null ? 'null' : typeof value === 'object' ? 'map' : typeof value;
  const topLevelCount =
    value === null ? 0 : Array.isArray(value) ? value.length : typeof value === 'object' ? Object.keys(value).length : 0;
  return { rootType, topLevelCount };
}

export default function YamlValidator() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => (input.trim() ? parseYaml(input) : null), [input]);
  const breakdown = useMemo(() => (result?.ok ? buildBreakdown(result.value) : null), [result]);

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
          <span>YAML input</span>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="Paste YAML here..."
        />
        <div className={`status-line ${result === null ? 'status-neutral' : result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result === null ? 'Enter some YAML to validate.' : result.ok ? '✓ Valid YAML' : `✗ ${result.message}`}
        </div>
      </div>

      {breakdown && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>Structure breakdown</span>
          </div>
          <div className="output mono" style={{ minHeight: 'auto', padding: '16px 20px' }}>
            {`Root type:        ${breakdown.rootType}
Top-level items:  ${breakdown.topLevelCount}`}
          </div>
        </div>
      )}

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        This tool checks syntax only using js-yaml&apos;s safe <code>load()</code> and shows a valid/invalid verdict
        with the parser&apos;s error message - it doesn&apos;t reformat or produce a full tree. Need reformatted
        output? Use the <a href="/tools/formatters/yaml-formatter">YAML Formatter</a>. Need an expandable structure
        view? Use the <a href="/tools/formatters/yaml-parser">YAML Parser</a>.
      </div>
    </div>
  );
}
