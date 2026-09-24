'use client';

import { useMemo, useState } from 'react';
import { parseXml } from '@/lib/tools/xml-utils';

const SAMPLE = `<library xmlns:meta="urn:example:meta">\n  <book id="1" meta:lang="en">\n    <title>Refactoring</title>\n    <author>Martin Fowler</author>\n  </book>\n  <book id="2">\n    <title>Clean Code</title>\n    <author>Robert C. Martin</author>\n  </book>\n</library>`;

interface NodeProps {
  node: Element;
  isLast: boolean;
}

function ElementNode({ node, isLast }: NodeProps) {
  const attrs = Array.from(node.attributes);
  const elementChildren = Array.from(node.childNodes).filter(
    (n): n is Element => n.nodeType === Node.ELEMENT_NODE
  );
  const textParts = Array.from(node.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent ?? '')
    .join('');
  const trimmedText = textParts.trim();

  return (
    <div style={{ paddingLeft: 16, borderLeft: '1px solid var(--border)' }}>
      <div>
        <span className="jt-punct">&lt;</span>
        <span className="jt-key">{node.tagName}</span>
        {attrs.map((a) => (
          <span key={a.name}>
            {' '}
            <span className="jt-key" style={{ opacity: 0.75 }}>
              {a.name}
            </span>
            <span className="jt-punct">=</span>
            <span className="jt-string">&quot;{a.value}&quot;</span>
          </span>
        ))}
        <span className="jt-punct">{elementChildren.length === 0 && !trimmedText ? ' /' : ''}&gt;</span>
      </div>
      {trimmedText && (
        <div style={{ paddingLeft: 16 }}>
          <span className="jt-string">{trimmedText}</span>
        </div>
      )}
      {elementChildren.map((child, i) => (
        <ElementNode key={i} node={child} isLast={i === elementChildren.length - 1} />
      ))}
      {(elementChildren.length > 0 || trimmedText) && (
        <div>
          <span className="jt-punct">
            &lt;/{node.tagName}&gt;
          </span>
        </div>
      )}
      {!isLast && <div style={{ height: 4 }} />}
    </div>
  );
}

export default function XmlParser() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => parseXml(input), [input]);

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
            {result.ok ? '✓ Well-formed XML' : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Element tree</span>
          </div>
          <div className="output mono">
            {result.ok ? <ElementNode node={result.doc.documentElement} isLast /> : '// Fix the errors on the left to see the tree'}
          </div>
          <div className="status-line status-neutral"> </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Renders the real element/attribute/text hierarchy produced by the browser&apos;s native <code>DOMParser</code> -
        every tag, attribute (including namespaced ones), and text node is walked and rendered as React elements, never
        injected as raw HTML. Want to run an XPath query against this same tree instead of just browsing it? Try the{' '}
        <a href="/tools/formatters/xpath-tester">XPath Tester</a>.
      </div>
    </div>
  );
}
