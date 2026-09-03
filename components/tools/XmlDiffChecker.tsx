'use client';

import { useMemo, useState } from 'react';

const SAMPLE_A = `<config>\n<retries>3</retries>\n<timeout>30</timeout>\n<endpoint>https://api.example.com</endpoint>\n</config>`;
const SAMPLE_B = `<config>\n<retries>5</retries>\n<timeout>30</timeout>\n<endpoint>https://api.example.com/v2</endpoint>\n</config>`;

function serializeNode(node: Element, depth: number): string {
  const pad = '  '.repeat(depth);
  const attrs = Array.from(node.attributes)
    .map((attr) => ` ${attr.name}="${attr.value}"`)
    .join('');

  const elementChildren = Array.from(node.childNodes).filter((n) => n.nodeType === Node.ELEMENT_NODE) as Element[];
  const textContent = Array.from(node.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent?.trim() ?? '')
    .join('');

  if (elementChildren.length === 0) {
    return textContent
      ? `${pad}<${node.tagName}${attrs}>${textContent}</${node.tagName}>`
      : `${pad}<${node.tagName}${attrs}/>`;
  }

  const children = elementChildren.map((child) => serializeNode(child, depth + 1)).join('\n');
  return `${pad}<${node.tagName}${attrs}>\n${children}\n${pad}</${node.tagName}>`;
}

function normalizeXml(input: string): { ok: true; lines: string[] } | { ok: false; message: string } {
  if (typeof window === 'undefined') return { ok: false, message: 'Loading...' };
  if (!input.trim()) return { ok: false, message: 'Paste XML to compare.' };

  const doc = new DOMParser().parseFromString(input, 'application/xml');
  if (doc.querySelector('parsererror')) {
    return { ok: false, message: 'Invalid XML - fix the syntax error before comparing.' };
  }
  if (!doc.documentElement) return { ok: false, message: 'No root element found.' };

  return { ok: true, lines: serializeNode(doc.documentElement, 0).split('\n') };
}

type DiffOp = { type: 'same' | 'added' | 'removed'; line: string };

function diffLines(a: string[], b: string[]): DiffOp[] {
  const n = a.length;
  const m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: 'same', line: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ type: 'removed', line: a[i] });
      i++;
    } else {
      ops.push({ type: 'added', line: b[j] });
      j++;
    }
  }
  while (i < n) ops.push({ type: 'removed', line: a[i++] });
  while (j < m) ops.push({ type: 'added', line: b[j++] });

  return ops;
}

export default function XmlDiffChecker() {
  const [xmlA, setXmlA] = useState(SAMPLE_A);
  const [xmlB, setXmlB] = useState(SAMPLE_B);

  const result = useMemo(() => {
    const normA = normalizeXml(xmlA);
    const normB = normalizeXml(xmlB);
    if (!normA.ok) return { ok: false as const, message: `XML A: ${normA.message}` };
    if (!normB.ok) return { ok: false as const, message: `XML B: ${normB.message}` };

    const ops = diffLines(normA.lines, normB.lines);
    const added = ops.filter((o) => o.type === 'added').length;
    const removed = ops.filter((o) => o.type === 'removed').length;
    return { ok: true as const, ops, added, removed };
  }, [xmlA, xmlB]);

  function loadSample() {
    setXmlA(SAMPLE_A);
    setXmlB(SAMPLE_B);
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
            setXmlA('');
            setXmlB('');
          }}
        >
          Clear
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>XML A</span>
          </div>
          <textarea
            className="mono"
            value={xmlA}
            onChange={(e) => setXmlA(e.target.value)}
            spellCheck={false}
            placeholder="Paste the original XML..."
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>XML B</span>
          </div>
          <textarea
            className="mono"
            value={xmlB}
            onChange={(e) => setXmlB(e.target.value)}
            spellCheck={false}
            placeholder="Paste the changed XML..."
          />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>Diff</span>
        </div>
        {result.ok ? (
          <>
            <div className="output mono" style={{ padding: 0 }}>
              {result.ops.map((op, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '2px 12px',
                    background:
                      op.type === 'added' ? 'rgba(82, 194, 94, 0.12)' : op.type === 'removed' ? 'rgba(224, 82, 82, 0.12)' : 'transparent',
                    borderLeft: op.type === 'added' ? '3px solid #52c25e' : op.type === 'removed' ? '3px solid #e05252' : '3px solid transparent',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {op.type === 'added' ? '+ ' : op.type === 'removed' ? '- ' : '  '}
                  {op.line || ' '}
                </div>
              ))}
            </div>
            <div className="status-line status-neutral">
              {result.added} added, {result.removed} removed
            </div>
          </>
        ) : (
          <div className="status-line status-invalid">✗ {result.message}</div>
        )}
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Just want to format one XML document? Use the <a href="/tools/formatters/xml-formatter">XML Formatter &amp; Validator</a>.
      </div>
    </div>
  );
}
