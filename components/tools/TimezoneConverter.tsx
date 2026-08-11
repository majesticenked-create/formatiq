'use client';

import { useMemo, useState } from 'react';

const SOURCE_ZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'US Eastern (New York)' },
  { value: 'America/Chicago', label: 'US Central (Chicago)' },
  { value: 'America/Denver', label: 'US Mountain (Denver)' },
  { value: 'America/Los_Angeles', label: 'US Pacific (Los Angeles)' },
  { value: 'Europe/London', label: 'UK (London)' },
  { value: 'Europe/Paris', label: 'Central Europe (Paris)' },
  { value: 'Asia/Kolkata', label: 'India (Kolkata)' },
  { value: 'Asia/Shanghai', label: 'China (Shanghai)' },
  { value: 'Asia/Tokyo', label: 'Japan (Tokyo)' },
  { value: 'Australia/Sydney', label: 'Australia Eastern (Sydney)' },
];

const TARGET_ZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'US Eastern' },
  { value: 'America/Los_Angeles', label: 'US Pacific' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];

function getOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(date).reduce<Record<string, string>>((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return (asUtc - date.getTime()) / 60000;
}

// Converts a "wall clock" date/time string (as typed into a datetime-local
// input, with no timezone of its own) into the actual UTC instant it
// represents in the given IANA timezone, correctly accounting for DST.
function zonedTimeToInstant(dateTimeLocalStr: string, timeZone: string): Date | null {
  if (!dateTimeLocalStr) return null;
  const guess = new Date(`${dateTimeLocalStr}Z`);
  if (Number.isNaN(guess.getTime())) return null;

  const offset = getOffsetMinutes(guess, timeZone);
  let actual = new Date(guess.getTime() - offset * 60000);

  // Refine once more in case the initial guess landed on the wrong side of a
  // DST transition, where the offset can differ by up to an hour.
  const offset2 = getOffsetMinutes(actual, timeZone);
  if (offset2 !== offset) {
    actual = new Date(guess.getTime() - offset2 * 60000);
  }
  return actual;
}

function formatInZone(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(instant);
}

function toDateTimeLocalString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function TimezoneConverter() {
  const [dateTime, setDateTime] = useState('2026-06-15T09:00');
  const [sourceZone, setSourceZone] = useState('America/New_York');

  const instant = useMemo(() => zonedTimeToInstant(dateTime, sourceZone), [dateTime, sourceZone]);

  function setNow() {
    setDateTime(toDateTimeLocalString(new Date()));
  }

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Date &amp; time:
        </label>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
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
          Source timezone:
        </label>
        <select
          value={sourceZone}
          onChange={(e) => setSourceZone(e.target.value)}
          className="mono"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        >
          {SOURCE_ZONES.map((zone) => (
            <option key={zone.value} value={zone.value}>
              {zone.label}
            </option>
          ))}
        </select>
        <button className="icon-btn" onClick={setNow}>
          Now
        </button>
      </div>

      <div className={`status-line ${instant ? 'status-valid' : 'status-invalid'}`} style={{ marginBottom: 16 }}>
        {instant ? '✓ Converted' : '✗ Enter a valid date and time.'}
      </div>

      {instant && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {TARGET_ZONES.map((zone) => (
            <div key={zone.value} className="panel" style={{ padding: 14 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                {zone.label}
                {zone.value === sourceZone ? ' (source)' : ''}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                {formatInZone(instant, zone.value)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
