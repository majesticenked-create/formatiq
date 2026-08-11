'use client';

import { useMemo, useState } from 'react';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function countBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const cursor = new Date(start);
  while (cursor < end) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

function calculateDifference(startStr: string, endStr: string) {
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');

  if (Number.isNaN(start.getTime())) {
    return { ok: false as const, message: 'Enter a valid start date.' };
  }
  if (Number.isNaN(end.getTime())) {
    return { ok: false as const, message: 'Enter a valid end date.' };
  }

  const earlier = start <= end ? start : end;
  const later = start <= end ? end : start;
  const reversed = start > end;

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.round((later.getTime() - earlier.getTime()) / msPerDay);
  const totalWeeks = totalDays / 7;

  // Months + days breakdown
  let months = (later.getFullYear() - earlier.getFullYear()) * 12 + (later.getMonth() - earlier.getMonth());
  let monthsRemDate = new Date(earlier);
  monthsRemDate.setMonth(monthsRemDate.getMonth() + months);
  if (monthsRemDate > later) {
    months--;
    monthsRemDate = new Date(earlier);
    monthsRemDate.setMonth(monthsRemDate.getMonth() + months);
  }
  const remDaysAfterMonths = Math.round((later.getTime() - monthsRemDate.getTime()) / msPerDay);

  // Years + months + days breakdown
  let years = later.getFullYear() - earlier.getFullYear();
  let ymMonths = later.getMonth() - earlier.getMonth();
  let ymDays = later.getDate() - earlier.getDate();
  if (ymDays < 0) {
    ymMonths -= 1;
    const prevMonth = new Date(later.getFullYear(), later.getMonth(), 0);
    ymDays += prevMonth.getDate();
  }
  if (ymMonths < 0) {
    years -= 1;
    ymMonths += 12;
  }

  const businessDays = countBusinessDays(earlier, later);

  return {
    ok: true as const,
    reversed,
    totalDays,
    totalWeeks,
    months,
    remDaysAfterMonths,
    years,
    ymMonths,
    ymDays,
    businessDays,
  };
}

export default function DateDifferenceCalculator() {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(todayISO());

  const result = useMemo(() => calculateDifference(startDate, endDate), [startDate, endDate]);

  const inputStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    color: 'var(--text-primary)',
    padding: '6px 8px',
  };

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Start date:
        </label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mono" style={inputStyle} />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          End date:
        </label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mono" style={inputStyle} />
        <button className="icon-btn" onClick={() => setEndDate(todayISO())}>
          Today
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Difference</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                result.reversed ? '(Note: start date is after end date — showing absolute difference)\n' : '',
                `Total days:        ${result.totalDays.toLocaleString()}`,
                `Total weeks:       ${result.totalWeeks.toFixed(2)}`,
                `Months + days:     ${result.months} months, ${result.remDaysAfterMonths} days`,
                `Years/months/days: ${result.years}y ${result.ymMonths}m ${result.ymDays}d`,
                `Business days:     ${result.businessDays.toLocaleString()} (excludes weekends)`,
              ]
                .filter(Boolean)
                .join('\n')
            : '// Enter valid dates above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
