'use client';

import { useEffect, useState } from 'react';

const CITIES = [
  { label: 'San Francisco', zone: 'America/Los_Angeles' },
  { label: 'New York', zone: 'America/New_York' },
  { label: 'São Paulo', zone: 'America/Sao_Paulo' },
  { label: 'London', zone: 'Europe/London' },
  { label: 'Paris', zone: 'Europe/Paris' },
  { label: 'Cairo', zone: 'Africa/Cairo' },
  { label: 'Dubai', zone: 'Asia/Dubai' },
  { label: 'Mumbai', zone: 'Asia/Kolkata' },
  { label: 'Singapore', zone: 'Asia/Singapore' },
  { label: 'Tokyo', zone: 'Asia/Tokyo' },
  { label: 'Sydney', zone: 'Australia/Sydney' },
];

function formatTime(now: Date, zone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now);
}

function formatDate(now: Date, zone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(now);
}

function isDaytime(now: Date, zone: string): boolean {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: '2-digit', hour12: false }).format(now)
  );
  return hour >= 6 && hour < 19;
}

export default function TimeZoneNowClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="status-line status-neutral" style={{ marginBottom: 16 }}>
        Live current time across major world cities, updating every second. To convert a specific date/time
        instead, use timezone-converter.
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        {CITIES.map((c) => (
          <div key={c.zone} className="panel" style={{ padding: 16 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              {c.label} {now ? (isDaytime(now, c.zone) ? '☀️' : '🌙') : ''}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginTop: 6 }}>
              {now ? formatTime(now, c.zone) : '--:--:-- --'}
            </div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {now ? formatDate(now, c.zone) : ' '}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
