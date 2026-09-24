'use client';

import { useMemo, useState } from 'react';
import { bytesToBase64 } from '@/lib/tools/base64-utils';

const SAMPLE = '110 151';

type ParseResult = { ok: true; bytes: Uint8Array } | { ok: false; message: string };

/**
 * Parses space/comma-separated OCTAL BYTE VALUES (e.g. "110 151"), not one giant octal integer.
 * Each token must contain only octal digits (0-7) and decode to a value in the valid byte range
 * 0-255 (octal 0-377) - a token like "400" is all valid octal digits but decodes to 256, one past
 * the max a byte can hold, so it's rejected as an invalid octet rather than silently truncated.
 * A token like "128" is rejected even earlier, since '8' isn't a valid octal digit at all.
 */
function parseOctalBytes(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, message: 'Enter one or more octal byte values (e.g. "110 151").' };
  }

  const tokens = trimmed.split(/[\s,]+/).filter(Boolean);
  const bytes: number[] = [];

  for (const token of tokens) {
    if (!/^[0-7]+$/.test(token)) {
      return { ok: false, message: `"${token}" is not valid octal - only digits 0-7 are allowed.` };
    }
    const value = parseInt(token, 8);
    if (value > 255) {
      return { ok: false, message: `"${token}" decodes to ${value}, which is out of byte range (max is octal 377 = 255).` };
    }
    bytes.push(value);
  }

  return { ok: true, bytes: new Uint8Array(bytes) };
}

export default function OctalToBase64Converter() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => {
    const parsed = parseOctalBytes(input);
    if (!parsed.ok) return parsed;
    return { ok: true as const, output: bytesToBase64(parsed.bytes), byteCount: parsed.bytes.length };
  }, [input]);

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
            <span>Octal byte values</span>
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
            placeholder="Space or comma-separated octal bytes, e.g. 110 151"
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Base64</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono" style={{ wordBreak: 'break-all' }}>
            {result.ok ? result.output : ''}
          </div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? `✓ ${result.byteCount} byte${result.byteCount === 1 ? '' : 's'}` : `✗ ${result.message}`}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Each space or comma-separated token is treated as one octal-encoded byte value, not as a
        digit of one giant octal integer - so &quot;110 151&quot; is the two bytes 72 and 105
        (spelling &quot;Hi&quot; in ASCII), converted directly to Base64 &quot;SGk=&quot;. Every
        token must use only octal digits 0-7 and decode to 0-255 (octal 0-377) - a token
        containing an 8 or 9, or one that decodes past 255 (like &quot;400&quot;), is rejected as
        invalid rather than silently truncated or wrapped. Runs entirely client-side.
      </div>
    </div>
  );
}
