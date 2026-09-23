'use client';

import { useMemo, useState } from 'react';
import { formatHoursMinutes } from '@/lib/tools/duration-utils';

interface Row {
  id: number;
  start: string;
  end: string;
  breakMinutes: string;
}

let nextId = 1;
function newRow(): Row {
  return { id: nextId++, start: '', end: '', breakMinutes: '0' };
}

/**
 * Parses "HH:MM" into minutes-since-midnight. All arithmetic below stays in plain minutes
 * (no Date objects), so there's no timezone or DST effect - a shift is just two clock times
 * on the same conceptual day, handled with an overnight wraparound when end < start.
 */
function parseTimeToMinutes(value: string): number | null {
  const match = /^([0-1]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

interface RowResult {
  id: number;
  ok: boolean;
  minutes: number;
  message?: string;
}

function calculateRow(row: Row): RowResult {
  if (row.start === '' && row.end === '') {
    return { id: row.id, ok: true, minutes: 0 };
  }
  const startMinutes = parseTimeToMinutes(row.start);
  const endMinutes = parseTimeToMinutes(row.end);
  if (startMinutes === null || endMinutes === null) {
    return { id: row.id, ok: false, minutes: 0, message: 'Enter valid start and end times (HH:MM).' };
  }
  const breakMinutes = Number(row.breakMinutes || '0');
  if (Number.isNaN(breakMinutes) || breakMinutes < 0) {
    return { id: row.id, ok: false, minutes: 0, message: 'Break minutes must be zero or greater.' };
  }

  // Overnight shift: end time is on the "next day" relative to start, so add 24h of minutes.
  // Equal start/end is treated as a valid zero-length shift, not a 24h wraparound.
  let shiftMinutes = endMinutes - startMinutes;
  if (shiftMinutes < 0) shiftMinutes += 24 * 60;

  if (breakMinutes > shiftMinutes) {
    return { id: row.id, ok: false, minutes: 0, message: 'Break time cannot exceed the length of the shift.' };
  }

  return { id: row.id, ok: true, minutes: shiftMinutes - breakMinutes };
}

const inputStyle = {
  width: 90,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function TimeSheetCalculator() {
  const [rows, setRows] = useState<Row[]>(() => [newRow(), newRow()]);

  const rowResults = useMemo(() => rows.map(calculateRow), [rows]);

  const totalMinutes = rowResults.reduce((sum, r) => (r.ok ? sum + r.minutes : sum), 0);
  const hasError = rowResults.some((r) => !r.ok);
  const firstError = rowResults.find((r) => !r.ok)?.message;

  function updateRow(id: number, field: 'start' | 'end' | 'breakMinutes', value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()]);
  }

  function removeRow(id: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  return (
    <div>
      {rows.map((row, index) => (
        <div className="control-row" key={row.id}>
          <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Row {index + 1} start:
          </label>
          <input
            type="text"
            aria-label={`Row ${index + 1} start time`}
            placeholder="09:00"
            value={row.start}
            onChange={(e) => updateRow(row.id, 'start', e.target.value)}
            className="mono"
            style={inputStyle}
          />
          <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            end:
          </label>
          <input
            type="text"
            aria-label={`Row ${index + 1} end time`}
            placeholder="17:30"
            value={row.end}
            onChange={(e) => updateRow(row.id, 'end', e.target.value)}
            className="mono"
            style={inputStyle}
          />
          <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            break (min):
          </label>
          <input
            type="number"
            aria-label={`Row ${index + 1} break minutes`}
            value={row.breakMinutes}
            onChange={(e) => updateRow(row.id, 'breakMinutes', e.target.value)}
            className="mono"
            style={inputStyle}
          />
          <button
            type="button"
            className="icon-btn"
            aria-label={`Remove row ${index + 1}`}
            onClick={() => removeRow(row.id)}
            disabled={rows.length <= 1}
          >
            Remove
          </button>
        </div>
      ))}

      <div className="control-row">
        <button type="button" className="icon-btn" onClick={addRow}>
          + Add row
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Time Sheet Total</span>
        </div>
        <div className="output mono">
          {!hasError
            ? [
                `Total time: ${formatHoursMinutes(totalMinutes)}`,
                '',
                'Each row: shift length = end − start (adding 24h if end < start for overnight shifts), minus break.',
                'Time-of-day arithmetic only - no timezone or date conversion is applied.',
              ].join('\n')
            : '// Fix the highlighted row below'}
        </div>
        <div className={`status-line ${!hasError ? 'status-valid' : 'status-invalid'}`}>
          {!hasError ? '✓ Calculated' : `✗ ${firstError}`}
        </div>
      </div>
    </div>
  );
}
