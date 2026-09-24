'use client';

import { useMemo, useState } from 'react';
import { parseXml, serializeXml } from '@/lib/tools/xml-utils';

const SAMPLE = `<library>\n  <book id="1"><title>Refactoring</title><author>Martin Fowler</author></book>\n  <book id="2"><title>Clean Code</title><author>Robert C. Martin</author></book>\n</library>`;

type EvalResult =
  | { ok: true; matches: string[] }
  | { ok: false; message: string };

function runXpath(input: string, expression: string): EvalResult {
  const parsed = parseXml(input);
  if (!parsed.ok) {
    return { ok: false, message: `XML error: ${parsed.message}` };
  }
  if (!expression.trim()) {
    return { ok: false, message: 'Enter an XPath expression.' };
  }

  try {
    const result = parsed.doc.evaluate(
      expression,
      parsed.doc,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );

    const matches: string[] = [];
    for (let i = 0; i < result.snapshotLength; i++) {
      const node = result.snapshotItem(i);
      if (!node) continue;
      if (node.nodeType === Node.ELEMENT_NODE) {
        matches.push(serializeXml(node));
      } else {
        // Attribute, text, or other non-element nodes - render their text content as text,
        // never as HTML.
        matches.push(node.textContent ?? '');
      }
    }
    return { ok: true, matches };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Invalid XPath expression.' };
  }
}

export default function XpathTester() {
  const [input, setInput] = useState(SAMPLE);
  const [expression, setExpression] = useState('//book[@id="2"]/title');

  const result = useMemo(() => runXpath(input, expression), [input, expression]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.matches.join('\n\n'));
  }

  return (
    <div>
      <div className="control-row">
        <input
          className="mono icon-btn"
          style={{ flex: 1, textAlign: 'left' }}
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="//book[@id='2']/title"
          spellCheck={false}
        />
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>XML input</span>
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
            {result.ok ? `✓ ${result.matches.length} match${result.matches.length === 1 ? '' : 'es'}` : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Matched nodes</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok || result.matches.length === 0}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">
            {result.ok
              ? result.matches.length > 0
                ? result.matches.join('\n\n')
                : '// No nodes matched this expression'
              : '// Fix the errors on the left to see matches'}
          </div>
          <div className="status-line status-neutral"> </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Runs your expression through the browser&apos;s own <code>document.evaluate()</code> - the standard, built-in
        XPath 1.0 engine every browser ships, not a reimplementation. Matched element nodes are serialized back to XML
        text via <code>XMLSerializer</code> before being shown, never rendered as raw HTML. The underlying{' '}
        <code>DOMParser</code> never resolves external entities or DTDs, so a crafted external-entity reference in
        your input can&apos;t reach the network or filesystem. Want to browse the same document as a tree instead of
        querying it? Try the <a href="/tools/formatters/xml-parser">XML Parser</a>.
      </div>
    </div>
  );
}
