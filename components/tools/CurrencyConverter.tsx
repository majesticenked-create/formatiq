'use client';

import { useEffect, useMemo, useState } from 'react';

const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL',
  'MXN', 'SEK', 'NZD', 'SGD', 'HKD', 'NOK', 'KRW', 'ZAR', 'TRY', 'PLN',
];

interface RatesState {
  status: 'idle' | 'loading' | 'ok' | 'error';
  base: string;
  rates: Record<string, number>;
  date: string;
  message?: string;
}

async function fetchRates(base: string): Promise<{ rates: Record<string, number>; date: string }> {
  const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${base}`);
  if (!res.ok) throw new Error(`Rate service responded with ${res.status}`);
  const data = await res.json();
  return { rates: data.rates, date: data.date };
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [state, setState] = useState<RatesState>({ status: 'idle', base: '', rates: {}, date: '' });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, status: 'loading' }));
    fetchRates(from)
      .then(({ rates, date }) => {
        if (cancelled) return;
        setState({ status: 'ok', base: from, rates, date });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          status: 'error',
          base: from,
          rates: {},
          date: '',
          message: err instanceof Error ? err.message : 'Could not fetch exchange rates.',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [from]);

  const numeric = Number(amount);
  const amountValid = amount.trim() !== '' && Number.isFinite(numeric) && numeric >= 0;

  const converted = useMemo(() => {
    if (!amountValid || state.status !== 'ok') return null;
    const rate = to === state.base ? 1 : state.rates[to];
    if (rate === undefined) return null;
    return numeric * rate;
  }, [amountValid, numeric, state, to]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

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
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="mono"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="icon-btn" onClick={swap}>
          Swap
        </button>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="mono"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {!amountValid && <div className="status-line status-invalid">✗ Enter a non-negative amount.</div>}

      {state.status === 'loading' && (
        <div className="status-line status-neutral">Fetching current exchange rates for {from}...</div>
      )}

      {state.status === 'error' && (
        <div className="status-line status-invalid">✗ {state.message} - try again in a moment.</div>
      )}

      {state.status === 'ok' && amountValid && converted !== null && (
        <div className="panel" style={{ marginTop: 16, padding: '28px 20px', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {numeric.toLocaleString()} {from} =
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginTop: 6 }}>
            {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {to}
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 10 }}>
            1 {from} = {(to === state.base ? 1 : state.rates[to])?.toFixed(4)} {to}
          </div>
        </div>
      )}

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Rates are daily reference rates from the European Central Bank (via frankfurter.app), updated once per
        business day{state.date ? ` - last updated ${state.date}` : ''}. Not real-time market/trading rates.
      </div>
    </div>
  );
}
