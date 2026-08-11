'use client';

import { useMemo, useState } from 'react';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function calculateAge(birthDateStr: string, asOfStr: string) {
  const birthDate = new Date(birthDateStr + 'T00:00:00');
  const asOfDate = new Date(asOfStr + 'T00:00:00');

  if (Number.isNaN(birthDate.getTime())) {
    return { ok: false as const, message: 'Enter a valid birth date.' };
  }
  if (Number.isNaN(asOfDate.getTime())) {
    return { ok: false as const, message: 'Enter a valid "as of" date.' };
  }
  if (birthDate > asOfDate) {
    return { ok: false as const, message: 'Birth date must not be after the "as of" date.' };
  }

  let years = asOfDate.getFullYear() - birthDate.getFullYear();
  let months = asOfDate.getMonth() - birthDate.getMonth();
  let days = asOfDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.floor((asOfDate.getTime() - birthDate.getTime()) / msPerDay);

  const nextBirthday = new Date(asOfDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (nextBirthday < asOfDate) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }
  const daysUntilNextBirthday = Math.round((nextBirthday.getTime() - asOfDate.getTime()) / msPerDay);

  return { ok: true as const, years, months, days, totalDays, daysUntilNextBirthday };
}

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState('1990-06-15');
  const [asOfDate, setAsOfDate] = useState(todayISO());

  const result = useMemo(() => calculateAge(birthDate, asOfDate), [birthDate, asOfDate]);

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
          Birth date:
        </label>
        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mono" style={inputStyle} />
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          As of:
        </label>
        <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} className="mono" style={inputStyle} />
        <button className="icon-btn" onClick={() => setAsOfDate(todayISO())}>
          Today
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Age breakdown</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Age: ${result.years} years, ${result.months} months, ${result.days} days`,
                `Total days lived: ${result.totalDays.toLocaleString()}`,
                `Days until next birthday: ${result.daysUntilNextBirthday}`,
              ].join('\n')
            : '// Enter valid dates above to see the age breakdown'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
