'use client';

import { useMemo, useState } from 'react';

type Country = 'US' | 'UK' | 'IN' | 'E164';

const COUNTRY_LABELS: Record<Country, string> = {
  US: 'United States',
  UK: 'United Kingdom',
  IN: 'India',
  E164: 'International (E.164)',
};

const SAMPLES: Record<Country, string> = {
  US: '(555) 123-4567',
  UK: '020 7946 0958',
  IN: '9876543210',
  E164: '+14155552671',
};

function onlyDigits(s: string): string {
  return s.replace(/\D/g, '');
}

function validateUS(input: string) {
  const digits = onlyDigits(input);
  const withoutCountryCode = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;

  if (withoutCountryCode.length !== 10) {
    return { ok: false as const, message: `US numbers need 10 digits (area code + number), got ${withoutCountryCode.length}.` };
  }
  if (withoutCountryCode[0] === '0' || withoutCountryCode[0] === '1') {
    return { ok: false as const, message: 'Area code cannot start with 0 or 1.' };
  }

  const formatted = `(${withoutCountryCode.slice(0, 3)}) ${withoutCountryCode.slice(3, 6)}-${withoutCountryCode.slice(6)}`;
  return { ok: true as const, formatted };
}

function validateUK(input: string) {
  const digits = onlyDigits(input);
  const normalized = digits.startsWith('44') ? '0' + digits.slice(2) : digits;

  if (!normalized.startsWith('0')) {
    return { ok: false as const, message: 'UK numbers must start with 0 (national format) or +44.' };
  }
  if (normalized.length !== 11) {
    return { ok: false as const, message: `UK numbers need 11 digits including the leading 0, got ${normalized.length}.` };
  }

  const formatted = `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7)}`;
  return { ok: true as const, formatted };
}

function validateIN(input: string) {
  const digits = onlyDigits(input);
  const normalized = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;

  if (normalized.length !== 10) {
    return { ok: false as const, message: `Indian mobile numbers need 10 digits, got ${normalized.length}.` };
  }
  if (!/^[6-9]/.test(normalized)) {
    return { ok: false as const, message: 'Indian mobile numbers must start with 6, 7, 8, or 9.' };
  }

  const formatted = `${normalized.slice(0, 5)} ${normalized.slice(5)}`;
  return { ok: true as const, formatted };
}

function validateE164(input: string) {
  const trimmed = input.trim();
  if (!/^\+[1-9]\d{1,14}$/.test(trimmed)) {
    return {
      ok: false as const,
      message: 'E.164 format requires a leading "+", followed by 2-15 digits with no leading zero after the "+".',
    };
  }
  return { ok: true as const, formatted: trimmed };
}

function tryValidate(country: Country, input: string) {
  if (!input.trim()) {
    return { ok: false as const, message: 'Enter a phone number.' };
  }

  if (country === 'US') return validateUS(input);
  if (country === 'UK') return validateUK(input);
  if (country === 'IN') return validateIN(input);
  return validateE164(input);
}

export default function PhoneNumberValidator() {
  const [country, setCountry] = useState<Country>('US');
  const [input, setInput] = useState(SAMPLES.US);

  const result = useMemo(() => tryValidate(country, input), [country, input]);

  function switchCountry(next: Country) {
    setCountry(next);
    setInput(SAMPLES[next]);
  }

  return (
    <div>
      <div className="control-row">
        {(Object.keys(COUNTRY_LABELS) as Country[]).map((c) => (
          <button
            key={c}
            className="icon-btn"
            style={{
              borderColor: country === c ? 'var(--accent-dim)' : undefined,
              color: country === c ? 'var(--text-primary)' : undefined,
            }}
            onClick={() => switchCountry(c)}
          >
            {COUNTRY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Phone number</span>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="Enter a phone number..."
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? `✓ Valid - formatted: ${result.formatted}` : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
