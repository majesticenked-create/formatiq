'use client';

import { useMemo, useState } from 'react';

const SAMPLE = `<article>
  <h1>Formatiq</h1>
  <p>Free, <strong>browser-based</strong> developer tools.</p>
  <p>Formatters, converters &amp; validators &mdash; all in one place.</p>
  <ul>
    <li>No sign-up</li>
    <li>No data uploaded</li>
  </ul>
</article>`;

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  mdash: '—',
  ndash: '–',
  hellip: '…',
};

function decodeEntities(input: string): string {
  return input.replace(/&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, code: string) => {
    if (code[0] === '#') {
      const codepoint = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      if (Number.isNaN(codepoint)) return match;
      try {
        return String.fromCodePoint(codepoint);
      } catch {
        return match;
      }
    }
    return NAMED_ENTITIES[code] ?? match;
  });
}

function stripHtml(input: string, preserveLineBreaks: boolean): string {
  let text = input;

  if (preserveLineBreaks) {
    // Convert structural/line-break tags into actual newlines before the
    // remaining tags are stripped, so paragraph and list structure survives.
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n');
    text = text.replace(/<(p|li)[^>]*>/gi, '');
  }

  text = text.replace(/<[^>]*>/g, preserveLineBreaks ? '' : ' ');
  text = decodeEntities(text);

  if (preserveLineBreaks) {
    text = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line, idx, arr) => line.length > 0 || (idx > 0 && arr[idx - 1].length > 0))
      .join('\n')
      .trim();
  } else {
    text = text.replace(/\s+/g, ' ').trim();
  }

  return text;
}

function tryStrip(input: string, preserveLineBreaks: boolean) {
  if (!input.trim()) {
    return { ok: false as const, message: 'Paste some HTML to strip.' };
  }
  return { ok: true as const, output: stripHtml(input, preserveLineBreaks) };
}

export default function HtmlStripper() {
  const [input, setInput] = useState(SAMPLE);
  const [preserveLineBreaks, setPreserveLineBreaks] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => tryStrip(input, preserveLineBreaks), [input, preserveLineBreaks]);

  function copyOutput() {
    if (result.ok) {
      navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setInput('')}>
          Clear
        </button>
        <button
          className={`icon-btn${preserveLineBreaks ? ' is-active' : ''}`}
          onClick={() => setPreserveLineBreaks(true)}
        >
          Preserve line breaks
        </button>
        <button
          className={`icon-btn${!preserveLineBreaks ? ' is-active' : ''}`}
          onClick={() => setPreserveLineBreaks(false)}
        >
          Flatten to one block
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>HTML input</span>
          </div>
          <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Tags stripped' : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Plain text</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="output mono" style={{ whiteSpace: 'pre-wrap' }}>
            {result.ok ? result.output : '// Paste HTML on the left to see the plain-text result'}
          </div>
        </div>
      </div>
    </div>
  );
}
