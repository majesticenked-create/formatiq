'use client';

import { useMemo, useState } from 'react';

const SAMPLE = 'DE89 3704 0044 0532 0130 00';

const COUNTRY_LENGTHS: Record<string, number> = {
  AD: 24, AT: 20, BE: 16, CH: 21, CY: 28, CZ: 24, DE: 22, DK: 18,
  EE: 20, ES: 24, FI: 18, FR: 27, GB: 22, GR: 27, HU: 28, IE: 22,
  IS: 26, IT: 27, LI: 21, LT: 20, LU: 20, LV: 21, MT: 31, NL: 18,
  NO: 15, PL: 28, PT: 25, SE: 24, SI: 19, SK: 24, SM: 27,
};

function mod97(numericString: string): number {
  let remainder = 0;
  for (const char of numericString) {
    remainder = (remainder * 10 + Number(char)) % 97;
  }
  return remainder;
}

function ibanToNumericString(iban: string): string {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let numeric = '';
  for (const char of rearranged) {
    if (/[0-9]/.test(char)) {
      numeric += char;
    } else {
      numeric += (char.charCodeAt(0) - 55).toString();
    }
  }
  return numeric;
}

function tryValidate(input: string) {
  const cleaned = input.replace(/\s/g, '').toUpperCase();

  if (!cleaned) {
    return { ok: false as const, message: 'Enter an IBAN.' };
  }
  if (!/^[A-Z0-9]+$/.test(cleaned)) {
    return { ok: false as const, message: 'IBAN can only contain letters and digits (spaces are ignored).' };
  }

  const countryCode = cleaned.slice(0, 2);
  const checkDigits = cleaned.slice(2, 4);

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return { ok: false as const, message: 'IBAN must start with a 2-letter country code.' };
  }
  if (!/^[0-9]{2}$/.test(checkDigits)) {
    return { ok: false as const, message: 'Characters 3-4 must be the 2-digit check code.' };
  }

  const expectedLength = COUNTRY_LENGTHS[countryCode];
  if (!expectedLength) {
    return {
      ok: false as const,
      message: `"${countryCode}" is not a recognized IBAN country code, or isn’t in this tool’s supported list.`,
      countryValid: false,
    };
  }
  if (cleaned.length !== expectedLength) {
    return {
      ok: false as const,
      message: `${countryCode} IBANs must be ${expectedLength} characters long, got ${cleaned.length}.`,
      countryValid: false,
    };
  }

  const checksumValid = mod97(ibanToNumericString(cleaned)) === 1;
  if (!checksumValid) {
    return {
      ok: false as const,
      message: 'Country code and length look correct, but the checksum (mod-97) failed - likely a typo in one of the digits.',
      countryValid: true,
      checksumValid: false,
    };
  }

  const bban = cleaned.slice(4);
  return {
    ok: true as const,
    countryCode,
    checkDigits,
    bban,
    formatted: cleaned.match(/.{1,4}/g)?.join(' ') ?? cleaned,
  };
}

export default function IbanValidator() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => tryValidate(input), [input]);

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setInput('')}>
          Clear
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>IBAN</span>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="Enter an IBAN, e.g. DE89 3704 0044 0532 0130 00"
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Valid IBAN' : `✗ ${result.message}`}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Format &amp; country check</span>
        </div>
        <div className="output mono" style={{ minHeight: 'auto', padding: '8px 12px' }}>
          {'countryValid' in result
            ? result.countryValid
              ? '✓ Country code and length are valid'
              : '✗ Country code or length is invalid'
            : result.ok
            ? '✓ Country code and length are valid'
            : '- Enter an IBAN to check'}
        </div>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Checksum (mod-97)</span>
        </div>
        <div className="output mono" style={{ minHeight: 'auto', padding: '8px 12px' }}>
          {result.ok
            ? '✓ Checksum passed'
            : 'checksumValid' in result
            ? '✗ Checksum failed'
            : '- Not checked (fix format issues first)'}
        </div>
      </div>

      {result.ok && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>Parsed components</span>
          </div>
          <div className="output mono">
            {[
              `Formatted:    ${result.formatted}`,
              `Country code: ${result.countryCode}`,
              `Check digits: ${result.checkDigits}`,
              `BBAN:         ${result.bban}`,
            ].join('\n')}
          </div>
        </div>
      )}

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Validating card numbers instead of bank accounts? Try the{' '}
        <a href="/tools/validators/credit-card-validator">Credit Card Validator</a>, which runs the same way -
        entirely in your browser.
      </div>
    </div>
  );
}
