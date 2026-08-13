'use client';

import { useMemo, useState } from 'react';
import { load, dump } from 'js-yaml';

type Mode = 'yamlToXml' | 'xmlToYaml';

const SAMPLE_YAML = `apiVersion: v1\nkind: Pod\nmetadata:\n  name: formatiq-demo\n  labels:\n    app: formatiq\nspec:\n  containers:\n    - name: web\n      image: nginx\n`;

const SAMPLE_XML = `<root>\n  <apiVersion>v1</apiVersion>\n  <kind>Pod</kind>\n  <metadata>\n    <name>formatiq-demo</name>\n    <labels>\n      <app>formatiq</app>\n    </labels>\n  </metadata>\n  <spec>\n    <containers>\n      <name>web</name>\n      <image>nginx</image>\n    </containers>\n  </spec>\n</root>`;

// Same convention as the XML <-> JSON converter: attributes become "@name" keys,
// text alongside attributes/children becomes "#text", repeated child tags become
// an array (which YAML represents as a list, same as JSON would).
function elementToValue(el: Element): unknown {
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
    const value = elementToValue(child);
    const existing = grouped.get(child.tagName);
    if (existing) existing.push(value);
    else grouped.set(child.tagName, [value]);
  });
  grouped.forEach((values, tagName) => {
    result[tagName] = values.length === 1 ? values[0] : values;
  });

  return result;
}

function xmlToYaml(input: string) {
  if (typeof window === 'undefined') return { ok: false as const, message: 'Loading...' };
  if (!input.trim()) return { ok: false as const, message: 'Paste some XML to convert.' };

  const doc = new DOMParser().parseFromString(input, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) return { ok: false as const, message: errorNode.textContent?.trim() ?? 'Invalid XML' };
  if (!doc.documentElement) return { ok: false as const, message: 'No root element found.' };

  try {
    const value = elementToValue(doc.documentElement);
    return { ok: true as const, output: dump(value) };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Could not dump to YAML' };
  }
}

function valueToElement(doc: Document, tagName: string, value: unknown): Element {
  const el = doc.createElement(tagName);
  if (value === null || value === undefined) return el;

  if (typeof value !== 'object') {
    el.textContent = String(value);
    return el;
  }

  if (Array.isArray(value)) {
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
      val.forEach((item) => el.appendChild(valueToElement(doc, key, item)));
    } else {
      el.appendChild(valueToElement(doc, key, val));
    }
  });

  return el;
}

function yamlToXml(input: string) {
  let parsed: unknown;
  try {
    parsed = load(input);
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid YAML' };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false as const, message: 'YAML input must map to an object at the top level.' };
  }

  try {
    const doc = document.implementation.createDocument(null, null, null);
    const keys = Object.keys(parsed as Record<string, unknown>);
    let root: Element;
    if (keys.length === 1) {
      root = valueToElement(doc, keys[0], (parsed as Record<string, unknown>)[keys[0]]);
    } else {
      // YAML commonly has multiple top-level keys (Kubernetes manifests, most real
      // configs), but XML requires exactly one root - wrap everything under a
      // synthetic <root> element rather than rejecting the input outright.
      root = valueToElement(doc, 'root', parsed);
    }
    doc.appendChild(root);
    const output = new XMLSerializer().serializeToString(doc);
    return { ok: true as const, output };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Could not build XML.' };
  }
}

export default function YamlXmlConverter() {
  const [mode, setMode] = useState<Mode>('yamlToXml');
  const [input, setInput] = useState(SAMPLE_YAML);

  const result = useMemo(() => (mode === 'yamlToXml' ? yamlToXml(input) : xmlToYaml(input)), [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'yamlToXml' ? SAMPLE_YAML : SAMPLE_XML);
  }

  function swap() {
    if (result.ok) {
      setInput(result.output);
      setMode(mode === 'yamlToXml' ? 'xmlToYaml' : 'yamlToXml');
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
            borderColor: mode === 'yamlToXml' ? 'var(--accent-dim)' : undefined,
            color: mode === 'yamlToXml' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('yamlToXml')}
        >
          YAML → XML
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'xmlToYaml' ? 'var(--accent-dim)' : undefined,
            color: mode === 'xmlToYaml' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('xmlToYaml')}
        >
          XML → YAML
        </button>
        <button className="icon-btn" onClick={swap} disabled={!result.ok}>
          Swap input ↔ output
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'yamlToXml' ? 'YAML' : 'XML'}</span>
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
            <span>{mode === 'yamlToXml' ? 'XML' : 'YAML'}</span>
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
        YAML with multiple top-level keys (like a Kubernetes manifest) gets wrapped in a synthetic {'<root>'}{' '}
        element, since XML requires exactly one root but YAML doesn&apos;t. Converting JSON instead? Try the{' '}
        <a href="/tools/converters/json-yaml-converter">JSON ⇄ YAML Converter</a> or{' '}
        <a href="/tools/converters/xml-json-converter">XML ⇄ JSON Converter</a>.
      </div>
    </div>
  );
}
