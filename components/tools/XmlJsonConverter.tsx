'use client';

import { useMemo, useState } from 'react';

type Mode = 'xmlToJson' | 'jsonToXml';

const SAMPLE_XML = `<library>\n  <book id="1">\n    <title>Refactoring</title>\n    <author>Martin Fowler</author>\n  </book>\n  <book id="2">\n    <title>Clean Code</title>\n    <author>Robert C. Martin</author>\n  </book>\n</library>`;

const SAMPLE_JSON = JSON.stringify(
  {
    library: {
      book: [
        { '@id': '1', title: 'Refactoring', author: 'Martin Fowler' },
        { '@id': '2', title: 'Clean Code', author: 'Robert C. Martin' },
      ],
    },
  },
  null,
  2
);

// Convention: element attributes become "@name" keys, text content alongside
// attributes/children becomes "#text", and repeated same-named child elements
// become an array. This mirrors the common xml-js/x2js style mapping, chosen
// over any single "official" spec since XML<->JSON has no canonical standard.
function elementToJson(el: Element): unknown {
  const attrs = Array.from(el.attributes);
  const elementChildren = Array.from(el.childNodes).filter((n) => n.nodeType === Node.ELEMENT_NODE) as Element[];
  const textContent = Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent?.trim() ?? '')
    .filter(Boolean)
    .join(' ');

  if (attrs.length === 0 && elementChildren.length === 0) {
    return textContent || null;
  }

  const result: Record<string, unknown> = {};
  attrs.forEach((attr) => {
    result[`@${attr.name}`] = attr.value;
  });
  if (textContent) result['#text'] = textContent;

  const grouped = new Map<string, unknown[]>();
  elementChildren.forEach((child) => {
    const value = elementToJson(child);
    const existing = grouped.get(child.tagName);
    if (existing) existing.push(value);
    else grouped.set(child.tagName, [value]);
  });
  grouped.forEach((values, tagName) => {
    result[tagName] = values.length === 1 ? values[0] : values;
  });

  return result;
}

function xmlToJson(input: string) {
  if (typeof window === 'undefined') return { ok: false as const, message: 'Loading...' };
  if (!input.trim()) return { ok: false as const, message: 'Paste some XML to convert.' };

  const doc = new DOMParser().parseFromString(input, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) return { ok: false as const, message: errorNode.textContent?.trim() ?? 'Invalid XML' };
  if (!doc.documentElement) return { ok: false as const, message: 'No root element found.' };

  const result = { [doc.documentElement.tagName]: elementToJson(doc.documentElement) };
  return { ok: true as const, output: JSON.stringify(result, null, 2) };
}

function jsonValueToElement(doc: Document, tagName: string, value: unknown): Element {
  const el = doc.createElement(tagName);

  if (value === null || value === undefined) return el;

  if (typeof value !== 'object') {
    el.textContent = String(value);
    return el;
  }

  if (Array.isArray(value)) {
    // Shouldn't normally reach here directly - arrays are handled one level up - but
    // guard against a raw array root by joining as repeated text nodes.
    el.textContent = value.map(String).join(', ');
    return el;
  }

  const obj = value as Record<string, unknown>;
  Object.entries(obj).forEach(([key, val]) => {
    if (key.startsWith('@')) {
      el.setAttribute(key.slice(1), String(val));
    } else if (key === '#text') {
      el.appendChild(doc.createTextNode(String(val)));
    } else if (Array.isArray(val)) {
      val.forEach((item) => el.appendChild(jsonValueToElement(doc, key, item)));
    } else {
      el.appendChild(jsonValueToElement(doc, key, val));
    }
  });

  return el;
}

function jsonToXml(input: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid JSON' };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false as const, message: 'JSON input must be an object with a single root key.' };
  }

  const keys = Object.keys(parsed as Record<string, unknown>);
  if (keys.length !== 1) {
    return { ok: false as const, message: `Expected exactly one root key, found ${keys.length}.` };
  }

  try {
    const doc = document.implementation.createDocument(null, null, null);
    const root = jsonValueToElement(doc, keys[0], (parsed as Record<string, unknown>)[keys[0]]);
    doc.appendChild(root);
    const output = new XMLSerializer().serializeToString(doc);
    return { ok: true as const, output };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Could not build XML.' };
  }
}

export default function XmlJsonConverter() {
  const [mode, setMode] = useState<Mode>('xmlToJson');
  const [input, setInput] = useState(SAMPLE_XML);

  const result = useMemo(() => (mode === 'xmlToJson' ? xmlToJson(input) : jsonToXml(input)), [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'xmlToJson' ? SAMPLE_XML : SAMPLE_JSON);
  }

  function swap() {
    if (result.ok) {
      setInput(result.output);
      setMode(mode === 'xmlToJson' ? 'jsonToXml' : 'xmlToJson');
    }
  }

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'xmlToJson' ? 'var(--accent-dim)' : undefined,
            color: mode === 'xmlToJson' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('xmlToJson')}
        >
          XML → JSON
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'jsonToXml' ? 'var(--accent-dim)' : undefined,
            color: mode === 'jsonToXml' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('jsonToXml')}
        >
          JSON → XML
        </button>
        <button className="icon-btn" onClick={swap} disabled={!result.ok}>
          Swap input ↔ output
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'xmlToJson' ? 'XML' : 'JSON'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={() => setInput('')}>
                Clear
              </button>
            </div>
          </div>
          <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'xmlToJson' ? 'JSON' : 'XML'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : ''}</div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Converted' : `✗ ${result.message}`}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Attributes become "@name" keys and text content becomes "#text" when an element also has attributes or
        children - repeated child tags become a JSON array. Just need to reformat XML or JSON, not convert between
        them? See the <a href="/tools/formatters/xml-formatter">XML Formatter</a> or{' '}
        <a href="/tools/formatters/json-formatter">JSON Formatter</a>.
      </div>
    </div>
  );
}
