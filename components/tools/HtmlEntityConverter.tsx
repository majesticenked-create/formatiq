'use client';

import { useMemo, useState } from 'react';

type Mode = 'encode' | 'decode';

const SAMPLE_TEXT = `<div class="greeting">Hello & welcome, "friend"! It's a café ☕</div>`;
const SAMPLE_ENTITIES = `&lt;div class=&quot;greeting&quot;&gt;Hello &amp; welcome, &quot;friend&quot;! It&#39;s a caf&eacute; &#9749;&lt;/div&gt;`;

const NAMED_ENTITIES: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#39;',
  'é': '&eacute;',
  'è': '&egrave;',
  'à': '&agrave;',
  'ü': '&uuml;',
  'ö': '&ouml;',
  'ä': '&auml;',
  'ñ': '&ntilde;',
  '©': '&copy;',
  '®': '&reg;',
  '™': '&trade;',
};

function encodeEntities(input: string): string {
  let result = '';
  for (const char of input) {
    if (NAMED_ENTITIES[char]) {
      result += NAMED_ENTITIES[char];
    } else {
      const code = char.codePointAt(0)!;
      result += code > 127 ? `&#${code};` : char;
    }
  }
  return result;
}

function decodeEntities(input: string): string {
  if (typeof window === 'undefined') return input;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = input;
  return textarea.value;
}

function tryConvert(mode: Mode, input: string) {
  if (!input.trim()) {
    return { ok: false as const, message: mode === 'encode' ? 'Enter some text to encode.' : 'Enter some entities to decode.' };
  }
  try {
    const output = mode === 'encode' ? encodeEntities(input) : decodeEntities(input);
    return { ok: true as const, output };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Could not convert this input.' };
  }
}

export default function HtmlEntityConverter() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState(SAMPLE_TEXT);

  const result = useMemo(() => tryConvert(mode, input), [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'encode' ? SAMPLE_TEXT : SAMPLE_ENTITIES);
  }

  function swap() {
    if (result.ok) {
      setInput(result.output);
      setMode(mode === 'encode' ? 'decode' : 'encode');
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
            borderColor: mode === 'encode' ? 'var(--accent-dim)' : undefined,
            color: mode === 'encode' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('encode')}
        >
          Encode
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'decode' ? 'var(--accent-dim)' : undefined,
            color: mode === 'decode' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('decode')}
        >
          Decode
        </button>
        <button className="icon-btn" onClick={swap} disabled={!result.ok}>
          Swap input ↔ output
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'encode' ? 'Plain text' : 'HTML entities'}</span>
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
            <span>{mode === 'encode' ? 'HTML entities' : 'Plain text'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : ''}</div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Done' : `✗ ${result.message}`}
          </div>
        </div>
      </div>
    </div>
  );
}
