'use client';

import { useEffect, useState } from 'react';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

function generatePassword(length: number, useUpper: boolean, useLower: boolean, useNumbers: boolean, useSymbols: boolean) {
  let charset = '';
  if (useUpper) charset += UPPER;
  if (useLower) charset += LOWER;
  if (useNumbers) charset += NUMBERS;
  if (useSymbols) charset += SYMBOLS;

  if (!charset) return '';

  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  return password;
}

function strengthOf(length: number, poolSize: number): { label: string; color: string } {
  const bits = length * Math.log2(poolSize || 1);
  if (bits < 40) return { label: 'Weak', color: '#e05252' };
  if (bits < 60) return { label: 'Fair', color: '#e0a952' };
  if (bits < 90) return { label: 'Strong', color: '#52c25e' };
  return { label: 'Very strong', color: '#3ba55c' };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState('');

  function regenerate() {
    setPassword(generatePassword(length, useUpper, useLower, useNumbers, useSymbols));
  }

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, useUpper, useLower, useNumbers, useSymbols]);

  function copyPassword() {
    if (password) navigator.clipboard.writeText(password);
  }

  const poolSize = (useUpper ? UPPER.length : 0) + (useLower ? LOWER.length : 0) + (useNumbers ? NUMBERS.length : 0) + (useSymbols ? SYMBOLS.length : 0);
  const strength = strengthOf(length, poolSize);
  const noCharsetSelected = poolSize === 0;

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Length: {length}
        </label>
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          style={{ width: 160 }}
        />
      </div>

      <div className="control-row">
        <button
          className="icon-btn"
          style={{
            borderColor: useUpper ? 'var(--accent-dim)' : undefined,
            color: useUpper ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => setUseUpper((v) => !v)}
        >
          A-Z
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: useLower ? 'var(--accent-dim)' : undefined,
            color: useLower ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => setUseLower((v) => !v)}
        >
          a-z
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: useNumbers ? 'var(--accent-dim)' : undefined,
            color: useNumbers ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => setUseNumbers((v) => !v)}
        >
          0-9
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: useSymbols ? 'var(--accent-dim)' : undefined,
            color: useSymbols ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => setUseSymbols((v) => !v)}
        >
          !@#
        </button>
        <button className="btn btn-primary" onClick={regenerate} disabled={noCharsetSelected}>
          Generate
        </button>
        <button className="icon-btn" onClick={copyPassword} disabled={noCharsetSelected}>
          Copy
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Generated password</span>
        </div>
        <div className="output mono">{noCharsetSelected ? '' : password}</div>
        <div className={`status-line ${noCharsetSelected ? 'status-invalid' : 'status-valid'}`}>
          {noCharsetSelected ? (
            '✗ Select at least one character set.'
          ) : (
            <>
              Strength: <span style={{ color: strength.color, fontWeight: 600 }}>{strength.label}</span>
              {' - a rough visual cue based on length and character variety, not a formal security guarantee.'}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
