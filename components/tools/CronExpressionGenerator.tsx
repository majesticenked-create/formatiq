'use client';

import { useMemo, useState } from 'react';

const FIELD_NAMES = ['minute', 'hour', 'day of month', 'month', 'day of week'] as const;
type FieldIndex = 0 | 1 | 2 | 3 | 4;
const FIELD_RANGES: [number, number][] = [
  [0, 59],
  [0, 23],
  [1, 31],
  [1, 12],
  [0, 7],
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Preset {
  label: string;
  expression: string;
}

const PRESETS: Preset[] = [
  { label: 'Every minute', expression: '* * * * *' },
  { label: 'Every 5 minutes', expression: '*/5 * * * *' },
  { label: 'Every 15 minutes', expression: '*/15 * * * *' },
  { label: 'Every 30 minutes', expression: '*/30 * * * *' },
  { label: 'Every hour', expression: '0 * * * *' },
  { label: 'Every hour on the hour', expression: '0 * * * *' },
  { label: 'Every day at midnight', expression: '0 0 * * *' },
  { label: 'Every day at noon', expression: '0 12 * * *' },
  { label: 'Every weekday (Mon-Fri)', expression: '0 0 * * 1-5' },
  { label: 'Every week (Sunday midnight)', expression: '0 0 * * 0' },
  { label: 'Every month (1st, midnight)', expression: '0 0 1 * *' },
  { label: '1 minute past every hour', expression: '1 * * * *' },
  { label: 'Monthly on the 5th', expression: '0 0 5 * *' },
];

/** Validates one field of a 5-field cron expression against its allowed range. */
export function validateField(field: string, index: FieldIndex): { ok: true } | { ok: false; message: string } {
  const [min, max] = FIELD_RANGES[index];
  const name = FIELD_NAMES[index];
  if (field.length === 0) return { ok: false, message: `${name} cannot be empty.` };

  const parts = field.split(',');
  for (const part of parts) {
    const stepMatch = part.match(/^(\*|\d+(?:-\d+)?)\/(\d+)$/);
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    const singleMatch = part.match(/^\d+$/);

    if (part === '*') continue;

    if (stepMatch) {
      const base = stepMatch[1];
      const step = Number(stepMatch[2]);
      if (step <= 0) return { ok: false, message: `Step value in "${part}" for ${name} must be greater than 0.` };
      if (base !== '*') {
        const baseRange = base.match(/^(\d+)-(\d+)$/);
        if (baseRange) {
          const lo = Number(baseRange[1]);
          const hi = Number(baseRange[2]);
          if (lo < min || hi > max || lo > hi) {
            return { ok: false, message: `Range in "${part}" for ${name} must fall within ${min}-${max}.` };
          }
        } else {
          const n = Number(base);
          if (n < min || n > max) return { ok: false, message: `Value in "${part}" for ${name} must be within ${min}-${max}.` };
        }
      }
      continue;
    }
    if (rangeMatch) {
      const lo = Number(rangeMatch[1]);
      const hi = Number(rangeMatch[2]);
      if (lo < min || hi > max || lo > hi) {
        return { ok: false, message: `Range "${part}" for ${name} must fall within ${min}-${max} and have start <= end.` };
      }
      continue;
    }
    if (singleMatch) {
      const n = Number(part);
      if (n < min || n > max) return { ok: false, message: `Value "${part}" for ${name} must be within ${min}-${max}.` };
      continue;
    }
    return { ok: false, message: `"${part}" is not a valid value for ${name}.` };
  }
  return { ok: true };
}

/** Produces a human-readable description for common patterns: presets, single values, steps, ranges, and lists. Does not attempt to describe every exotic combination. */
export function describeCron(fields: string[]): string {
  const [minute, hour, dom, month, dow] = fields;

  if (minute === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') {
    return 'Runs every minute.';
  }

  const parts: string[] = [];

  // Minute/hour phrase
  if (minute.startsWith('*/') && hour === '*') {
    parts.push(`Every ${minute.slice(2)} minutes`);
  } else if (minute === '0' && hour === '*') {
    parts.push('Every hour, on the hour');
  } else if (/^\d+$/.test(minute) && /^\d+$/.test(hour)) {
    parts.push(`At ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`);
  } else if (minute === '*' && hour === '*') {
    parts.push('Every minute');
  } else {
    parts.push(`At minute ${minute} of hour ${hour}`);
  }

  // Day-of-month / month / day-of-week phrase
  if (dom === '*' && month === '*' && dow === '*') {
    parts.push('every day');
  } else if (dom === '*' && month === '*' && dow === '1-5') {
    parts.push('every weekday (Monday through Friday)');
  } else if (dom === '*' && month === '*' && /^\d+$/.test(dow)) {
    const d = Number(dow) % 7;
    parts.push(`every ${DAY_NAMES[d]}`);
  } else if (dom === '1' && month === '*' && dow === '*') {
    parts.push('on the 1st of every month');
  } else if (/^\d+$/.test(dom) && month === '*' && dow === '*') {
    parts.push(`on day ${dom} of every month`);
  } else if (dom === '*' && /^\d+$/.test(month) && dow === '*') {
    parts.push(`every day in ${MONTH_NAMES[Number(month) - 1]}`);
  } else {
    parts.push(`on day-of-month "${dom}", month "${month}", day-of-week "${dow}"`);
  }

  return `Runs ${parts[0]}, ${parts[1]}.`;
}

export default function CronExpressionGenerator() {
  const [minute, setMinute] = useState('0');
  const [hour, setHour] = useState('0');
  const [dom, setDom] = useState('*');
  const [month, setMonth] = useState('*');
  const [dow, setDow] = useState('*');

  const fields = [minute, hour, dom, month, dow];
  const expression = fields.join(' ');

  const validations = useMemo(
    () => fields.map((f, i) => validateField(f, i as FieldIndex)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [minute, hour, dom, month, dow],
  );
  const firstError = validations.find((v) => !v.ok) as { ok: false; message: string } | undefined;

  const description = useMemo(() => {
    if (firstError) return null;
    return describeCron(fields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minute, hour, dom, month, dow, firstError]);

  function applyPreset(expr: string) {
    const [m, h, d, mo, w] = expr.split(' ');
    setMinute(m);
    setHour(h);
    setDom(d);
    setMonth(mo);
    setDow(w);
  }

  function copy() {
    navigator.clipboard.writeText(expression);
  }

  const setters: [(v: string) => void, string][] = [
    [setMinute, minute],
    [setHour, hour],
    [setDom, dom],
    [setMonth, month],
    [setDow, dow],
  ];

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Presets</span>
        </div>
        <div className="control-row" style={{ flexWrap: 'wrap', padding: 12 }}>
          {PRESETS.map((p) => (
            <button key={p.label} className="icon-btn" onClick={() => applyPreset(p.expression)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Unix cron (5 fields): minute hour day-of-month month day-of-week</span>
        </div>
        <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {FIELD_NAMES.map((name, i) => (
            <div key={name}>
              <label className="mono" style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block' }}>
                {name} ({FIELD_RANGES[i][0]}-{FIELD_RANGES[i][1]})
              </label>
              <input
                className="mono"
                value={setters[i][1]}
                onChange={(e) => setters[i][0](e.target.value)}
                style={{ width: '100%', padding: '4px 6px' }}
              />
            </div>
          ))}
        </div>
      </div>

      {firstError && <div className="status-line status-invalid">✗ {firstError.message}</div>}

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Cron expression</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copy}>
              Copy
            </button>
          </div>
        </div>
        <div className="output mono" style={{ minHeight: 'auto', padding: '10px 12px' }}>
          {expression}
        </div>
      </div>

      {description && (
        <div className="panel">
          <div className="panel-bar">
            <span>Plain-English description</span>
          </div>
          <div style={{ padding: 12 }}>{description}</div>
          <div className="status-line status-neutral">
            Covers common single-value, step, range, list, and preset patterns - it does not
            attempt to perfectly describe every exotic combination of fields. The schedule runs
            according to the timezone configured by the system executing the cron job.
          </div>
        </div>
      )}
    </div>
  );
}
