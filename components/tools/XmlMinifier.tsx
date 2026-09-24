'use client';

import { useMemo, useState } from 'react';
import { parseXml, serializeXml, stripIndentationWhitespace } from '@/lib/tools/xml-utils';

const SAMPLE = `<library>\n  <book id="1">\n    <title>Refactoring</title>\n    <author>Martin Fowler</author>\n  </book>\n  <note>Mixed <b>content</b> like this stays untouched.</note>\n</library>`;

function formatBytes(n: number) {
  return `${n} byte${n === 1 ? '' : 's'}`;
}

function tryMinify(input: string) {
  const parsed = parseXml(input);
  if (!parsed.ok) {
    return { ok: false as const, message: parsed.message };
  }

  stripIndentationWhitespace(parsed.doc);
  const output = serializeXml(parsed.doc);
  const before = new Blob([input]).size;
  const after = new Blob([output]).size;
  const reduction = before === 0 ? 0 : Math.round((1 - after / before) * 1000) / 10;

  return { ok: true as const, output, before, after, reduction };
}

export default function XmlMinifier() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => tryMinify(input), [input]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
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
            <span>Input</span>
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
            placeholder="Paste XML here..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? `${formatBytes(result.before)} before` : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Minified output</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : '// Fix the errors on the left to see minified output'}</div>
          <div className="status-line status-neutral">
            {result.ok ? `${formatBytes(result.after)} after - ${result.reduction}% smaller` : ' '}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Only whitespace-only text nodes used purely for indentation between element siblings are removed - real text
        content, including whitespace inside mixed content like <code>&lt;p&gt;Hello &lt;b&gt;world&lt;/b&gt;!&lt;/p&gt;</code>,
        is left exactly as written. Parses with the browser&apos;s native <code>DOMParser</code>, so malformed XML is
        rejected rather than silently mangled. Need the readable version instead? Use the{' '}
        <a href="/tools/formatters/xml-formatter">XML Formatter &amp; Validator</a>.
      </div>
    </div>
  );
}
