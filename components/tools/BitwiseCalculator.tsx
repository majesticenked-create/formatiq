'use client';

import { useMemo, useState } from 'react';

type Operation = 'AND' | 'OR' | 'XOR' | 'NOT' | 'LEFT_SHIFT' | 'RIGHT_SHIFT';

const OPERATION_LABELS: Record<Operation, string> = {
  AND: 'AND (&)',
  OR: 'OR (|)',
  XOR: 'XOR (^)',
  NOT: 'NOT (~A)',
  LEFT_SHIFT: 'Left shift (A << B)',
  RIGHT_SHIFT: 'Right shift (A >> B)',
};

const USES_B: Record<Operation, boolean> = {
  AND: true,
  OR: true,
  XOR: true,
  NOT: false,
  LEFT_SHIFT: true,
  RIGHT_SHIFT: true,
};

function toBinary(n: number): string {
  return (n >>> 0).toString(2);
}

function toHex(n: number): string {
  return (n >>> 0).toString(16).toUpperCase();
}

function tryCompute(operation: Operation, aStr: string, bStr: string) {
  const a = Number(aStr);
  if (aStr.trim() === '' || Number.isNaN(a) || !Number.isInteger(a)) {
    return { ok: false as const, message: 'Enter a valid integer for A.' };
  }

  let b = 0;
  if (USES_B[operation]) {
    b = Number(bStr);
    if (bStr.trim() === '' || Number.isNaN(b) || !Number.isInteger(b)) {
      return { ok: false as const, message: 'Enter a valid integer for B.' };
    }
  }

  let result: number;
  switch (operation) {
    case 'AND':
      result = a & b;
      break;
    case 'OR':
      result = a | b;
      break;
    case 'XOR':
      result = a ^ b;
      break;
    case 'NOT':
      result = ~a;
      break;
    case 'LEFT_SHIFT':
      result = a << b;
      break;
    case 'RIGHT_SHIFT':
      result = a >> b;
      break;
  }

  return {
    ok: true as const,
    decimal: result,
    binary: toBinary(result),
    hex: toHex(result),
  };
}

interface NumberDisplayProps {
  label: string;
  value: string;
}

function NumberDisplay({ label, value }: NumberDisplayProps) {
  return (
    <div className="panel" style={{ padding: 14 }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div className="mono" style={{ fontSize: 18, fontWeight: 600, marginTop: 4, wordBreak: 'break-all' }}>
        {value}
      </div>
    </div>
  );
}

export default function BitwiseCalculator() {
  const [operation, setOperation] = useState<Operation>('AND');
  const [a, setA] = useState('12');
  const [b, setB] = useState('10');

  const result = useMemo(() => tryCompute(operation, a, b), [operation, a, b]);
  const aNum = Number(a);
  const bNum = Number(b);
  const aValid = a.trim() !== '' && !Number.isNaN(aNum) && Number.isInteger(aNum);
  const bValid = b.trim() !== '' && !Number.isNaN(bNum) && Number.isInteger(bNum);

  return (
    <div>
      <div className="control-row">
        {(Object.keys(OPERATION_LABELS) as Operation[]).map((op) => (
          <button
            key={op}
            className={`icon-btn${operation === op ? ' is-active' : ''}`}
            onClick={() => setOperation(op)}
          >
            {OPERATION_LABELS[op]}
          </button>
        ))}
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>A (decimal)</span>
          </div>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="mono"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: 'var(--surface)',
              border: 'none',
              color: 'var(--text-primary)',
              padding: '10px 12px',
              fontSize: 14,
            }}
          />
          {aValid && (
            <div className="status-line status-neutral">
              Binary: {toBinary(aNum)} · Hex: {toHex(aNum)}
            </div>
          )}
        </div>

        {USES_B[operation] && (
          <div className="panel">
            <div className="panel-bar">
              <span>B (decimal)</span>
            </div>
            <input
              type="number"
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="mono"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'var(--surface)',
                border: 'none',
                color: 'var(--text-primary)',
                padding: '10px 12px',
                fontSize: 14,
              }}
            />
            {bValid && (
              <div className="status-line status-neutral">
                Binary: {toBinary(bNum)} · Hex: {toHex(bNum)}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`} style={{ marginTop: 16, marginBottom: 16 }}>
        {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
      </div>

      {result.ok && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
          }}
        >
          <NumberDisplay label="Decimal" value={String(result.decimal)} />
          <NumberDisplay label="Binary" value={result.binary} />
          <NumberDisplay label="Hex" value={`0x${result.hex}`} />
        </div>
      )}
    </div>
  );
}
