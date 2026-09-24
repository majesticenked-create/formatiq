'use client';

import { useMemo, useState } from 'react';

type Base = 2 | 8 | 10 | 16;

const BASE_LABELS: Record<Base, string> = {
  2: 'Binary',
  8: 'Octal',
  10: 'Decimal',
  16: 'Hexadecimal',
};

const BASE_CHARSETS: Record<Base, string> = {
  2: '01',
  8: '01234567',
  10: '0123456789',
  16: '0123456789abcdefABCDEF',
};

function isValidForBase(value: string, base: Base): boolean {
  const chars = BASE_CHARSETS[base];
  return value.length > 0 && Array.from(value).every((c) => chars.includes(c));
}

function convert(input: string, fromBase: Base) {
  const trimmed = input.trim();

  if (!trimmed) {
    return { ok: false as const, message: 'Enter a number to convert.' };
  }
  if (!isValidForBase(trimmed, fromBase)) {
    return {
      ok: false as const,
      message: `"${trimmed}" contains characters not valid in ${BASE_LABELS[fromBase]} (base ${fromBase}).`,
    };
  }

  // Parsed as a BigInt, one digit at a time, rather than `parseInt` into a plain `Number` -
  // `Number` only has 53 bits of safe integer precision, so a large-but-valid input (e.g. a
  // 64-bit hex value) would silently lose precision past Number.MAX_SAFE_INTEGER. Each
  // character is parsed with radix 16 rather than `fromBase`, which is safe because
  // `isValidForBase` already confirmed every character belongs to the (smaller-or-equal) hex
  // digit set - a single hex-digit parse always yields the same 0-15 value regardless of which
  // base it's actually a digit of.
  const bigBase = BigInt(fromBase);
  let decimal = 0n;
  for (const ch of trimmed) {
    decimal = decimal * bigBase + BigInt(parseInt(ch, 16));
  }

  return {
    ok: true as const,
    binary: decimal.toString(2),
    octal: decimal.toString(8),
    decimal: decimal.toString(10),
    hex: decimal.toString(16).toUpperCase(),
  };
}

// ---------- Arbitrary base 2-36 support (batch 018 extension) ----------
// Digits 0-9 then A-Z, matching the standard convention BigInt.prototype.toString(radix) itself
// uses for its output (radix up to 36 natively supported), so parsing and rendering agree.
const DIGIT_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function charsetForBase(base: number): string {
  return DIGIT_ALPHABET.slice(0, base);
}

function isValidForArbitraryBase(value: string, base: number): boolean {
  const chars = charsetForBase(base);
  return value.length > 0 && Array.from(value.toUpperCase()).every((c) => chars.includes(c));
}

function digitValue(ch: string): number {
  const upper = ch.toUpperCase();
  const code = upper.charCodeAt(0);
  if (code >= 48 && code <= 57) return code - 48; // '0'-'9'
  return code - 65 + 10; // 'A'-'Z'
}

/**
 * Converts a string written in an arbitrary source base (2-36) into a string in an arbitrary
 * target base (2-36). Parsing accumulates a BigInt digit-by-digit (rather than relying on
 * `parseInt`, which only supports radix up to 36 but loses precision above
 * Number.MAX_SAFE_INTEGER for a plain `Number` result) so values far beyond 53 bits of integer
 * precision still round-trip exactly. Rendering uses BigInt's own native `toString(radix)`,
 * which natively supports radix 2-36, so the output side needs no manual digit-by-digit division.
 */
function convertArbitrary(input: string, fromBase: number, toBase: number) {
  const trimmed = input.trim();

  if (!trimmed) {
    return { ok: false as const, message: 'Enter a number to convert.' };
  }
  if (!isValidForArbitraryBase(trimmed, fromBase)) {
    return {
      ok: false as const,
      message: `"${trimmed}" contains characters not valid in base ${fromBase} (allowed digits: ${charsetForBase(fromBase)}).`,
    };
  }

  const bigFromBase = BigInt(fromBase);
  let decimal = 0n;
  for (const ch of trimmed.toUpperCase()) {
    decimal = decimal * bigFromBase + BigInt(digitValue(ch));
  }

  return {
    ok: true as const,
    output: decimal.toString(toBase).toUpperCase(),
    decimal: decimal.toString(10),
  };
}

interface OutputRowProps {
  label: string;
  value: string;
}

function OutputRow({ label, value }: OutputRowProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="panel" style={{ marginBottom: 8 }}>
      <div className="panel-bar">
        <span>{label}</span>
        <div className="panel-actions">
          <button className="icon-btn" onClick={copy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="output mono" style={{ minHeight: 'auto', padding: '8px 12px', wordBreak: 'break-all' }}>
        {value}
      </div>
    </div>
  );
}

export default function NumberBaseConverter() {
  const [inputBase, setInputBase] = useState<Base>(10);
  const [input, setInput] = useState('255');

  // Custom-base mode (batch 018 extension) is a fully separate branch of state and UI from the
  // original quick-base mode above, so the original 2/8/10/16 behavior is completely unaffected
  // whether or not custom mode has ever been used.
  const [customMode, setCustomMode] = useState(false);
  const [customFromBase, setCustomFromBase] = useState(10);
  const [customToBase, setCustomToBase] = useState(36);
  const [customInput, setCustomInput] = useState('35');

  const result = useMemo(() => convert(input, inputBase), [input, inputBase]);
  const customResult = useMemo(
    () => convertArbitrary(customInput, customFromBase, customToBase),
    [customInput, customFromBase, customToBase]
  );

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Input base:
        </label>
        {([2, 8, 10, 16] as Base[]).map((b) => (
          <button
            key={b}
            className="icon-btn"
            style={{
              borderColor: !customMode && inputBase === b ? 'var(--accent-dim)' : undefined,
              color: !customMode && inputBase === b ? 'var(--text-primary)' : undefined,
            }}
            onClick={() => {
              setCustomMode(false);
              setInputBase(b);
            }}
          >
            {BASE_LABELS[b]}
          </button>
        ))}
        <button
          className="icon-btn"
          style={{
            borderColor: customMode ? 'var(--accent-dim)' : undefined,
            color: customMode ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => setCustomMode(true)}
        >
          Custom base (2-36)
        </button>
      </div>

      {!customMode && (
        <div>
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-bar">
              <span>{BASE_LABELS[inputBase]} input</span>
              <div className="panel-actions">
                <button className="icon-btn" onClick={() => setInput('')}>
                  Clear
                </button>
              </div>
            </div>
            <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
            <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
              {result.ok ? '✓ Converted below' : `✗ ${result.message}`}
            </div>
          </div>

          {result.ok && (
            <div>
              <OutputRow label="Binary (base 2)" value={result.binary} />
              <OutputRow label="Octal (base 8)" value={result.octal} />
              <OutputRow label="Decimal (base 10)" value={result.decimal} />
              <OutputRow label="Hexadecimal (base 16)" value={result.hex} />
            </div>
          )}
        </div>
      )}

      {customMode && (
        <div>
          <div className="control-row">
            <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              From base:
            </label>
            <select
              value={customFromBase}
              onChange={(e) => setCustomFromBase(Number(e.target.value))}
              className="mono"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                color: 'var(--text-primary)',
                padding: '6px 8px',
              }}
            >
              {Array.from({ length: 35 }, (_, i) => i + 2).map((b) => (
                <option key={b} value={b}>
                  Base {b}
                </option>
              ))}
            </select>
            <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              To base:
            </label>
            <select
              value={customToBase}
              onChange={(e) => setCustomToBase(Number(e.target.value))}
              className="mono"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                color: 'var(--text-primary)',
                padding: '6px 8px',
              }}
            >
              {Array.from({ length: 35 }, (_, i) => i + 2).map((b) => (
                <option key={b} value={b}>
                  Base {b}
                </option>
              ))}
            </select>
          </div>

          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-bar">
              <span>Base {customFromBase} input</span>
              <div className="panel-actions">
                <button className="icon-btn" onClick={() => setCustomInput('')}>
                  Clear
                </button>
              </div>
            </div>
            <textarea
              className="mono"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              spellCheck={false}
            />
            <div className={`status-line ${customResult.ok ? 'status-valid' : 'status-invalid'}`}>
              {customResult.ok ? '✓ Converted below' : `✗ ${customResult.message}`}
            </div>
          </div>

          {customResult.ok && (
            <div>
              <OutputRow label={`Base ${customToBase} output`} value={customResult.output} />
              <OutputRow label="Decimal (base 10)" value={customResult.decimal} />
            </div>
          )}
        </div>
      )}

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Numbers beyond JavaScript&apos;s safe integer range are parsed and rendered with BigInt,
        digit by digit, so very large values (e.g. 64-bit hashes or IDs) round-trip exactly instead
        of silently losing precision. Custom-base mode supports any base from 2 to 36, using digits
        0-9 then A-Z (case-insensitive on input, uppercase on output) - the same convention
        JavaScript&apos;s own <code>Number.prototype.toString(radix)</code> uses.
      </div>
    </div>
  );
}
