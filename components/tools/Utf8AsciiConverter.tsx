'use client';

import { useMemo, useState } from 'react';

const SAMPLE_VALID = 'Hello, World! 123';
const SAMPLE_INVALID = 'café costs €5';

type Result =
  | { ok: true; output: string }
  | { ok: false; message: string; offenders: { char: string; index: number; codePoint: number }[] };

function checkAscii(input: string): Result {
  if (!input) return { ok: false, message: 'Enter text to validate.', offenders: [] };

  const offenders: { char: string; index: number; codePoint: number }[] = [];
  let index = 0;
  for (const ch of input) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp > 127) {
      offenders.push({ char: ch, index, codePoint: cp });
    }
    index += ch.length;
  }

  if (offenders.length > 0) {
    return {
      ok: false,
      message: `Found ${offenders.length} non-ASCII character${offenders.length === 1 ? '' : 's'} - this text cannot be represented in strict 7-bit ASCII without loss.`,
      offenders,
    };
  }

  return { ok: true, output: input };
}

export default function Utf8AsciiConverter() {
  const [input, setInput] = useState(SAMPLE_VALID);

  const result = useMemo(() => checkAscii(input), [input]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  function loadSample(valid: boolean) {
    setInput(valid ? SAMPLE_VALID : SAMPLE_INVALID);
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => loadSample(true)}>
          Load valid sample
        </button>
        <button className="icon-btn" onClick={() => loadSample(false)}>
          Load non-ASCII sample
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Text to validate</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setInput('')}>
              Clear
            </button>
          </div>
        </div>
        <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
      </div>

      <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
        {result.ok ? '✓ Every character is valid 7-bit ASCII (code point 0-127)' : `✗ ${result.message}`}
      </div>

      {result.ok && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>ASCII output</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.output}</div>
        </div>
      )}

      {!result.ok && result.offenders.length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>Non-ASCII characters found</span>
          </div>
          <div className="output mono" style={{ whiteSpace: 'pre-wrap' }}>
            {result.offenders
              .map(
                (o) =>
                  `"${o.char}" at character index ${o.index} - code point U+${o.codePoint.toString(16).toUpperCase().padStart(4, '0')} (decimal ${o.codePoint})`
              )
              .join('\n')}
          </div>
        </div>
      )}
    </div>
  );
}
