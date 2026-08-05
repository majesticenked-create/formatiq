'use client';

import { useMemo, useState } from 'react';

const SAMPLE = 'jane.doe@example.com';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function tryValidate(input: string) {
  const value = input.trim();

  if (!value) {
    return { ok: false as const, message: 'Enter an email address.' };
  }
  if (!value.includes('@')) {
    return { ok: false as const, message: 'Missing "@" — an email needs a local part and a domain.' };
  }

  const parts = value.split('@');
  if (parts.length > 2) {
    return { ok: false as const, message: 'Too many "@" characters — only one is allowed.' };
  }

  const [local, domain] = parts;
  if (!local) {
    return { ok: false as const, message: 'Missing the part before "@".' };
  }
  if (!domain) {
    return { ok: false as const, message: 'Missing the domain after "@".' };
  }
  if (!domain.includes('.')) {
    return { ok: false as const, message: 'Domain is missing a "." — e.g. "example.com" instead of "examplecom".' };
  }
  if (domain.endsWith('.') || domain.startsWith('.')) {
    return { ok: false as const, message: 'Domain has a "." in the wrong place (leading or trailing).' };
  }
  if (/\s/.test(value)) {
    return { ok: false as const, message: 'Email addresses can’t contain spaces.' };
  }
  if (!EMAIL_RE.test(value)) {
    return { ok: false as const, message: 'Doesn’t match a valid email pattern.' };
  }

  return { ok: true as const, local, domain };
}

export default function EmailValidator() {
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

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Email address</span>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Enter an email address..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Valid email address' : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Breakdown</span>
          </div>
          <div className="output mono">
            {result.ok
              ? `Local part:  ${result.local}\nDomain:      ${result.domain}`
              : '// Fix the errors on the left to see a breakdown'}
          </div>
          <div className="status-line status-neutral">{' '}</div>
        </div>
      </div>
    </div>
  );
}
