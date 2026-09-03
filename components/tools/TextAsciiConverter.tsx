'use client';

import { useMemo, useState } from 'react';

const SAMPLE_TEXT = 'Hello!';
const SAMPLE_CODES = '72 101 108 108 111 33';

type Mode = 'textToAscii' | 'asciiToText';

function textToAscii(input: string) {
  if (!input) return { ok: false as const, message: 'Type some text to convert.' };
  const codes = Array.from(input).map((ch) => ch.codePointAt(0) ?? 0);
  return { ok: true as const, output: codes.join(' ') };
}

function asciiToText(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false as const, message: 'Paste space-separated ASCII codes to convert.' };

  const parts = trimmed.split(/\s+/);
  const codes: number[] = [];
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 0x10ffff) {
      return { ok: false as const, message: `"${part}" isn't a valid character code.` };
    }
    codes.push(n);
  }

  return { ok: true as const, output: codes.map((c) => String.fromCodePoint(c)).join('') };
}

export default function TextAsciiConverter() {
  const [mode, setMode] = useState<Mode>('textToAscii');
  const [input, setInput] = useState(SAMPLE_TEXT);

  const result = useMemo(() => (mode === 'textToAscii' ? textToAscii(input) : asciiToText(input)), [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'textToAscii' ? SAMPLE_TEXT : SAMPLE_CODES);
  }

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <button className={`icon-btn${mode === 'textToAscii' ? ' is-active' : ''}`} onClick={() => switchMode('textToAscii')}>
          Text → ASCII
        </button>
        <button className={`icon-btn${mode === 'asciiToText' ? ' is-active' : ''}`} onClick={() => switchMode('asciiToText')}>
          ASCII → Text
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'textToAscii' ? 'Text' : 'ASCII codes'}</span>
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
            placeholder={mode === 'textToAscii' ? 'Type text here...' : 'Paste space-separated codes, e.g. 72 101 108 108 111'}
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'textToAscii' ? 'ASCII codes' : 'Text'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : `// ${result.message}`}</div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Converted' : `✗ ${result.message}`}
          </div>
        </div>
      </div>
    </div>
  );
}
