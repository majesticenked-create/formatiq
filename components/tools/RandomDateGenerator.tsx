'use client';

import { useState } from 'react';

type Format = 'iso' | 'us' | 'eu';

function formatDate(date: Date, format: Format): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  if (format === 'iso') return `${y}-${m}-${d}`;
  if (format === 'us') return `${m}/${d}/${y}`;
  return `${d}/${m}/${y}`;
}

function randomDateBetween(start: Date, end: Date): Date {
  const startMs = start.getTime();
  const endMs = end.getTime();
  const randomMs = startMs + Math.random() * (endMs - startMs);
  return new Date(randomMs);
}

export default function RandomDateGenerator() {
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState<Format>('iso');
  const [dates, setDates] = useState<Date[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function generate() {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');
    if (Number.isNaN(start.getTime())) {
      setError('Enter a valid start date.');
      return;
    }
    if (Number.isNaN(end.getTime())) {
      setError('Enter a valid end date.');
      return;
    }
    if (start > end) {
      setError('Start date must not be after the end date.');
      return;
    }
    setError(null);
    setDates(
      Array.from({ length: count }, () => randomDateBetween(start, end)).sort((a, b) => a.getTime() - b.getTime())
    );
  }

  function copyAll() {
    if (dates.length === 0) return;
    navigator.clipboard.writeText(dates.map((d) => formatDate(d, format)).join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          From:
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mono"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          To:
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mono"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Count:
        </label>
        <input
          type="number"
          min={1}
          max={50}
          value={count}
          onChange={(e) => {
            const n = Math.min(50, Math.max(1, Number(e.target.value) || 1));
            setCount(n);
          }}
          className="mono"
          style={{
            width: 64,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
        <button className={`icon-btn ${format === 'iso' ? 'is-active' : ''}`} onClick={() => setFormat('iso')}>
          ISO (YYYY-MM-DD)
        </button>
        <button className={`icon-btn ${format === 'us' ? 'is-active' : ''}`} onClick={() => setFormat('us')}>
          US (MM/DD/YYYY)
        </button>
        <button className={`icon-btn ${format === 'eu' ? 'is-active' : ''}`} onClick={() => setFormat('eu')}>
          EU (DD/MM/YYYY)
        </button>
      </div>

      <div className="control-row">
        <button className="btn btn-primary" onClick={generate}>
          Generate
        </button>
        <button className="icon-btn" onClick={copyAll} disabled={dates.length === 0}>
          {copied ? 'Copied!' : 'Copy all'}
        </button>
      </div>

      {error && <div className="status-line status-invalid">✗ {error}</div>}

      {dates.length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>Generated dates</span>
          </div>
          <div className="output mono">{dates.map((d) => formatDate(d, format)).join('\n')}</div>
          <div className="status-line status-neutral">{dates.length} generated, sorted chronologically</div>
        </div>
      )}
    </div>
  );
}
