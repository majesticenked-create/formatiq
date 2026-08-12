'use client';

import { useMemo, useState } from 'react';

const PRESETS = [10, 15, 18, 20, 25];

function formatCurrency(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TipCalculator() {
  const [bill, setBill] = useState('50.00');
  const [tipPercent, setTipPercent] = useState(18);
  const [people, setPeople] = useState(1);

  const billNum = Number(bill);
  const billValid = bill.trim() !== '' && Number.isFinite(billNum) && billNum >= 0;

  const result = useMemo(() => {
    if (!billValid) return null;
    const tipAmount = billNum * (tipPercent / 100);
    const total = billNum + tipAmount;
    return {
      tipAmount,
      total,
      perPersonTip: tipAmount / people,
      perPersonTotal: total / people,
    };
  }, [billValid, billNum, tipPercent, people]);

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Bill amount</span>
        </div>
        <div style={{ padding: 12 }}>
          <input
            type="text"
            inputMode="decimal"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            className="mono"
            style={{
              width: '100%',
              fontSize: 20,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              color: 'var(--text-primary)',
              padding: '10px 12px',
            }}
          />
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Tip percentage: {tipPercent}%</span>
        </div>
        <div style={{ padding: '16px 12px' }}>
          <div className="control-row">
            {PRESETS.map((p) => (
              <button
                key={p}
                className={`icon-btn ${tipPercent === p ? 'is-active' : ''}`}
                onClick={() => setTipPercent(p)}
              >
                {p}%
              </button>
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={tipPercent}
            onChange={(e) => setTipPercent(Number(e.target.value))}
            style={{ width: '100%', marginTop: 12 }}
          />
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Split between</span>
        </div>
        <div className="control-row" style={{ padding: '12px' }}>
          <button className="icon-btn" onClick={() => setPeople((p) => Math.max(1, p - 1))}>
            −
          </button>
          <span className="mono" style={{ fontSize: 16, width: 32, textAlign: 'center' }}>
            {people}
          </span>
          <button className="icon-btn" onClick={() => setPeople((p) => Math.min(50, p + 1))}>
            +
          </button>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {people === 1 ? 'person' : 'people'}
          </span>
        </div>
      </div>

      {!billValid && <div className="status-line status-invalid">✗ Enter a non-negative bill amount.</div>}

      {result && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
          }}
        >
          {[
            ['Tip amount', formatCurrency(result.tipAmount)],
            ['Total', formatCurrency(result.total)],
            ['Tip per person', formatCurrency(result.perPersonTip)],
            ['Total per person', formatCurrency(result.perPersonTotal)],
          ].map(([label, value]) => (
            <div key={label} className="panel" style={{ padding: 14 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                {label}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginTop: 4 }}>
                ${value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
