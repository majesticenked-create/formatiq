'use client';

import { useMemo, useState } from 'react';

const SAMPLE = 'Tr0ub4dor&3';

interface Check {
  label: string;
  pass: boolean;
}

function getChecks(password: string): Check[] {
  return [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'At least 12 characters (recommended)', pass: password.length >= 12 },
    { label: 'Contains an uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Contains a lowercase letter', pass: /[a-z]/.test(password) },
    { label: 'Contains a number', pass: /[0-9]/.test(password) },
    { label: 'Contains a symbol', pass: /[^A-Za-z0-9]/.test(password) },
  ];
}

function getStrength(password: string, checks: Check[]): { label: string; color: string; percent: number } {
  if (!password) return { label: 'Enter a password', color: 'var(--text-tertiary)', percent: 0 };

  const passed = checks.filter((c) => c.pass).length;
  const total = checks.length;
  const ratio = passed / total;

  if (ratio < 0.4) return { label: 'Weak', color: 'var(--invalid)', percent: 25 };
  if (ratio < 0.65) return { label: 'Fair', color: 'var(--accent)', percent: 50 };
  if (ratio < 0.9) return { label: 'Good', color: 'var(--accent)', percent: 75 };
  return { label: 'Strong', color: 'var(--valid)', percent: 100 };
}

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState(SAMPLE);
  const [visible, setVisible] = useState(false);

  const checks = useMemo(() => getChecks(password), [password]);
  const strength = useMemo(() => getStrength(password, checks), [password, checks]);

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setPassword(SAMPLE)}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setPassword('')}>
          Clear
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Password</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setVisible((v) => !v)}>
              {visible ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <input
          type={visible ? 'text' : 'password'}
          className="mono"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          spellCheck={false}
          placeholder="Type a password to check..."
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: 14,
            padding: '16px 20px',
            outline: 'none',
            width: '100%',
          }}
        />
        <div className="status-line" style={{ color: strength.color }}>
          Strength: {strength.label}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Strength meter</span>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ height: 8, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${strength.percent}%`,
                background: strength.color,
                transition: 'width 0.2s ease, background 0.2s ease',
              }}
            />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Checklist</span>
        </div>
        <div style={{ padding: '8px 20px 16px' }}>
          {checks.map((check) => (
            <div
              key={check.label}
              className="mono"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 0',
                fontSize: 13,
                color: check.pass ? 'var(--valid)' : 'var(--text-tertiary)',
              }}
            >
              <span>{check.pass ? '✓' : '○'}</span>
              <span>{check.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="status-line"
        style={{
          border: '1px solid var(--accent-dim)',
          borderRadius: 6,
          padding: '8px 12px',
          marginTop: 16,
        }}
      >
        ⚠ This only checks pattern strength (length and character variety) - it does not check whether this
        password has appeared in a known data breach, which would require sending it to a server to check
        against a breach database. A password can pass every check here and still be compromised if it&apos;s
        been leaked elsewhere. Consider a password manager and a breach-checking service for that separate
        concern.
      </div>
    </div>
  );
}
