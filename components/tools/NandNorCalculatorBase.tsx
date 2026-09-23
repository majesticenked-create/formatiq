'use client';

import { useMemo, useState } from 'react';
import {
  BIT_WIDTHS,
  BitWidth,
  maskToWidth,
  parseOperand,
  toBinaryPadded,
  toHexPadded,
} from '@/lib/tools/bit-width-utils';

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

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  background: 'var(--surface)',
  border: 'none',
  color: 'var(--text-primary)',
  padding: '10px 12px',
  fontSize: 14,
};

interface NandNorCalculatorBaseProps {
  operation: 'NAND' | 'NOR' | 'XNOR';
}

const INNER_OP_LABEL: Record<NandNorCalculatorBaseProps['operation'], string> = {
  NAND: 'AND',
  NOR: 'OR',
  XNOR: 'XOR',
};

export default function NandNorCalculatorBase({ operation }: NandNorCalculatorBaseProps) {
  const [width, setWidth] = useState<BitWidth>(8);
  const [a, setA] = useState('12');
  const [b, setB] = useState('10');

  const result = useMemo(() => {
    const aParsed = parseOperand(a, 'A', width);
    if (!aParsed.ok) return aParsed;
    const bParsed = parseOperand(b, 'B', width);
    if (!bParsed.ok) return bParsed;

    const combined =
      operation === 'NAND'
        ? aParsed.value & bParsed.value
        : operation === 'NOR'
          ? aParsed.value | bParsed.value
          : aParsed.value ^ bParsed.value;
    const notCombined = maskToWidth(~combined, width);

    return {
      ok: true as const,
      decimal: notCombined,
      binary: toBinaryPadded(notCombined, width),
      hex: `0x${toHexPadded(notCombined, width)}`,
    };
  }, [a, b, width, operation]);

  function operandInfo(value: string) {
    const parsed = parseOperand(value, 'x', width);
    if (!parsed.ok) return null;
    return `Binary: ${toBinaryPadded(parsed.value, width)} · Hex: 0x${toHexPadded(parsed.value, width)}`;
  }

  return (
    <div>
      <div className="control-row">
        {BIT_WIDTHS.map((w) => (
          <button
            key={w}
            className={`icon-btn${width === w ? ' is-active' : ''}`}
            onClick={() => setWidth(w)}
          >
            {w}-bit
          </button>
        ))}
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>A (decimal, 0b-binary, or 0x-hex)</span>
          </div>
          <input
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="mono"
            style={inputStyle}
          />
          {operandInfo(a) && <div className="status-line status-neutral">{operandInfo(a)}</div>}
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>B (decimal, 0b-binary, or 0x-hex)</span>
          </div>
          <input
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="mono"
            style={inputStyle}
          />
          {operandInfo(b) && <div className="status-line status-neutral">{operandInfo(b)}</div>}
        </div>
      </div>

      <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`} style={{ marginTop: 16, marginBottom: 16 }}>
        {result.ok ? `✓ Calculated (${operation} = NOT(A ${INNER_OP_LABEL[operation]} B))` : `✗ ${result.message}`}
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
          <NumberDisplay label="Hex" value={result.hex} />
        </div>
      )}
    </div>
  );
}
