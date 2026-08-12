'use client';

import { useMemo, useState } from 'react';

interface NetworkRule {
  name: string;
  pattern: RegExp;
  lengths: number[];
}

const NETWORKS: NetworkRule[] = [
  { name: 'Visa', pattern: /^4/, lengths: [13, 16, 19] },
  { name: 'Mastercard', pattern: /^(5[1-5]|2[2-7])/, lengths: [16] },
  { name: 'American Express', pattern: /^3[47]/, lengths: [15] },
  { name: 'Discover', pattern: /^6(011|5)/, lengths: [16] },
];

function detectNetwork(digits: string): string {
  const match = NETWORKS.find((n) => n.pattern.test(digits) && n.lengths.includes(digits.length));
  if (match) return match.name;
  const looseMatch = NETWORKS.find((n) => n.pattern.test(digits));
  return looseMatch ? `${looseMatch.name} (unusual length)` : 'Unknown';
}

function luhnCheck(digits: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function tryValidate(input: string) {
  const digits = input.replace(/[\s-]/g, '');

  if (!digits) {
    return { ok: false as const, message: 'Enter a card number.' };
  }
  if (!/^\d+$/.test(digits)) {
    return { ok: false as const, message: 'Card number can only contain digits, spaces, and hyphens.' };
  }
  if (digits.length < 12 || digits.length > 19) {
    return { ok: false as const, message: `Length ${digits.length} is outside the valid range (12-19 digits) for card numbers.` };
  }
  if (!luhnCheck(digits)) {
    return { ok: false as const, message: 'Failed the Luhn checksum - this is not a validly formatted card number.' };
  }

  return { ok: true as const, network: detectNetwork(digits), digits };
}

export default function CreditCardValidator() {
  const [input, setInput] = useState('4532015112830366');

  const result = useMemo(() => tryValidate(input), [input]);

  return (
    <div>
      <div
        className="status-line"
        style={{
          background: 'var(--status-invalid-bg, rgba(255,0,0,0.06))',
          border: '1px solid var(--accent-dim)',
          borderRadius: 6,
          padding: '8px 12px',
          marginBottom: 12,
        }}
      >
        ⚠ This only checks that the number is formatted correctly and passes the Luhn checksum - it does not
        verify that the card is real, active, or has any funds. A number can pass this check and still belong
        to no real account.
      </div>

      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput('4532015112830366')}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setInput('')}>
          Clear
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Card number</span>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="Enter a card number..."
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? `✓ Passes Luhn checksum - detected network: ${result.network}` : `✗ ${result.message}`}
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        For international bank account numbers, see the{' '}
        <a href="/tools/validators/iban-validator">IBAN Validator</a> - same no-data-sent approach.
      </div>
    </div>
  );
}
