'use client';

import { useMemo, useState } from 'react';

type Mode = 'decimal' | 'binary' | 'both';

interface Unit {
  value: string;
  label: string;
  bits: number;
}

// Bit sizes for each unit, per definition. Decimal uses powers of 1000,
// binary uses powers of 1024 — both anchored to bits as the common base
// so bit-based and byte-based units convert through the same table.
const DECIMAL_UNITS: Unit[] = [
  { value: 'bit', label: 'Bit', bits: 1 },
  { value: 'byte', label: 'Byte', bits: 8 },
  { value: 'KB', label: 'Kilobyte (KB)', bits: 8 * 1000 },
  { value: 'MB', label: 'Megabyte (MB)', bits: 8 * 1000 ** 2 },
  { value: 'GB', label: 'Gigabyte (GB)', bits: 8 * 1000 ** 3 },
  { value: 'TB', label: 'Terabyte (TB)', bits: 8 * 1000 ** 4 },
];

const BINARY_UNITS: Unit[] = [
  { value: 'bit', label: 'Bit', bits: 1 },
  { value: 'byte', label: 'Byte', bits: 8 },
  { value: 'KiB', label: 'Kibibyte (KiB)', bits: 8 * 1024 },
  { value: 'MiB', label: 'Mebibyte (MiB)', bits: 8 * 1024 ** 2 },
  { value: 'GiB', label: 'Gibibyte (GiB)', bits: 8 * 1024 ** 3 },
  { value: 'TiB', label: 'Tebibyte (TiB)', bits: 8 * 1024 ** 4 },
];

function formatResult(n: number): string {
  if (!Number.isFinite(n)) return '-';
  if (n === 0) return '0';
  if (Math.abs(n) < 0.0001 || Math.abs(n) >= 1e15) return n.toExponential(6);
  return n.toLocaleString('en-US', { maximumFractionDigits: 8 });
}

function convert(value: number, fromUnit: Unit, units: Unit[]) {
  const bits = value * fromUnit.bits;
  return units.map((u) => ({ unit: u, result: bits / u.bits }));
}

export default function DigitalStorageConverter() {
  const [amount, setAmount] = useState('1');
  const [fromUnit, setFromUnit] = useState('MB');
  const [mode, setMode] = useState<Mode>('decimal');

  const numeric = Number(amount);
  const valid = amount.trim() !== '' && Number.isFinite(numeric) && numeric >= 0;

  const decimalResults = useMemo(() => {
    if (!valid) return [];
    const unit = DECIMAL_UNITS.find((u) => u.value === fromUnit) ?? DECIMAL_UNITS[2];
    return convert(numeric, unit, DECIMAL_UNITS);
  }, [numeric, fromUnit, valid]);

  const binaryResults = useMemo(() => {
    if (!valid) return [];
    const unit = BINARY_UNITS.find((u) => u.value === fromUnit) ?? BINARY_UNITS[2];
    return convert(numeric, unit, BINARY_UNITS);
  }, [numeric, fromUnit, valid]);

  const activeUnits = mode === 'binary' ? BINARY_UNITS : DECIMAL_UNITS;

  return (
    <div>
      <div className="control-row">
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mono"
          style={{
            width: 140,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
        <select
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value)}
          className="mono"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        >
          {activeUnits.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </div>

      <div className="control-row">
        <button className={`icon-btn ${mode === 'decimal' ? 'is-active' : ''}`} onClick={() => setMode('decimal')}>
          Decimal (1000-based)
        </button>
        <button className={`icon-btn ${mode === 'binary' ? 'is-active' : ''}`} onClick={() => setMode('binary')}>
          Binary (1024-based)
        </button>
        <button className={`icon-btn ${mode === 'both' ? 'is-active' : ''}`} onClick={() => setMode('both')}>
          Show both
        </button>
      </div>

      {!valid && <div className="status-line status-invalid">✗ Enter a non-negative number.</div>}

      {valid && (mode === 'decimal' || mode === 'both') && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>Decimal (1 KB = 1000 bytes)</span>
          </div>
          <div style={{ padding: '8px 16px' }}>
            {decimalResults.map(({ unit, result }) => (
              <div
                key={unit.value}
                className="mono"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 13,
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{unit.label}</span>
                <span>{formatResult(result)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {valid && (mode === 'binary' || mode === 'both') && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>Binary (1 KiB = 1024 bytes)</span>
          </div>
          <div style={{ padding: '8px 16px' }}>
            {binaryResults.map(({ unit, result }) => (
              <div
                key={unit.value}
                className="mono"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 13,
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{unit.label}</span>
                <span>{formatResult(result)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
