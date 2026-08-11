'use client';

import { useMemo, useState } from 'react';

function formatRelative(date: Date): string {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffSec = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSec);

  const units: [string, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [name, secondsInUnit] of units) {
    if (abs >= secondsInUnit || name === 'second') {
      const value = Math.round(abs / secondsInUnit);
      const plural = value === 1 ? name : `${name}s`;
      return diffSec <= 0 ? `${value} ${plural} ago` : `in ${value} ${plural}`;
    }
  }
  return 'just now';
}

function buildResult(date: Date) {
  if (Number.isNaN(date.getTime())) {
    return { ok: false as const, message: 'Could not parse this as a valid date or timestamp.' };
  }
  return {
    ok: true as const,
    unixSeconds: Math.floor(date.getTime() / 1000),
    unixMs: date.getTime(),
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toString(),
    relative: formatRelative(date),
  };
}

function parseInput(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false as const, message: 'Enter a Unix timestamp or a date string.' };
  }

  if (/^-?\d+$/.test(trimmed)) {
    const digits = trimmed.replace('-', '').length;
    const num = Number(trimmed);
    const ms = digits >= 13 ? num : num * 1000;
    return buildResult(new Date(ms));
  }

  const parsed = new Date(trimmed);
  return buildResult(parsed);
}

export default function TimestampConverter() {
  const [input, setInput] = useState(String(Math.floor(Date.now() / 1000)));

  const result = useMemo(() => parseInput(input), [input]);

  function useNow() {
    setInput(String(Math.floor(Date.now() / 1000)));
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={useNow}>
          Now
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Timestamp or date string</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setInput('')}>
              Clear
            </button>
          </div>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="Unix timestamp (seconds or ms) or a date string like 2026-08-05T12:00:00Z"
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Parsed' : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div className="panel">
          <div className="panel-bar">
            <span>Converted formats</span>
          </div>
          <div className="output mono">
            {[
              `Unix (seconds): ${result.unixSeconds}`,
              `Unix (ms):      ${result.unixMs}`,
              `ISO 8601:       ${result.iso}`,
              `UTC:             ${result.utc}`,
              `Local:           ${result.local}`,
              `Relative:        ${result.relative}`,
            ].join('\n')}
          </div>
        </div>
      )}
    </div>
  );
}
