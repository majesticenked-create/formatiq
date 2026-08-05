'use client';

import { useMemo, useState } from 'react';

const SAMPLE = '0 2 * * *';

const FIELD_NAMES = ['minute', 'hour', 'day of month', 'month', 'day of week'] as const;
const FIELD_RANGES: [number, number][] = [
  [0, 59],
  [0, 23],
  [1, 31],
  [1, 12],
  [0, 6],
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function validateField(field: string, index: number): { ok: true } | { ok: false; message: string } {
  const [min, max] = FIELD_RANGES[index];
  const name = FIELD_NAMES[index];

  if (field === '*') return { ok: true };

  const parts = field.split(',');
  for (const part of parts) {
    const stepMatch = part.match(/^(\*|\d+(-\d+)?)\/(\d+)$/);
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    const singleMatch = part.match(/^\d+$/);

    if (stepMatch) {
      const step = Number(stepMatch[3]);
      if (step <= 0) return { ok: false, message: `Step value in "${part}" for ${name} must be greater than 0.` };
      continue;
    }
    if (rangeMatch) {
      const lo = Number(rangeMatch[1]);
      const hi = Number(rangeMatch[2]);
      if (lo < min || hi > max || lo > hi) {
        return { ok: false, message: `Range "${part}" for ${name} must fall within ${min}-${max} and have start ≤ end.` };
      }
      continue;
    }
    if (singleMatch) {
      const value = Number(part);
      if (value < min || value > max) {
        return { ok: false, message: `Value "${part}" for ${name} must be between ${min} and ${max}.` };
      }
      continue;
    }
    return { ok: false, message: `"${part}" isn’t a valid value for ${name}.` };
  }

  return { ok: true };
}

function describeField(field: string, index: number, unit: string, names?: string[]): string {
  if (field === '*') return `every ${unit}`;

  const parts = field.split(',');
  const described = parts.map((part) => {
    const stepMatch = part.match(/^(\*|\d+(?:-\d+)?)\/(\d+)$/);
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    if (stepMatch) {
      return `every ${stepMatch[3]} ${unit}s starting at ${stepMatch[1] === '*' ? 0 : stepMatch[1]}`;
    }
    if (rangeMatch) {
      const lo = names ? names[Number(rangeMatch[1])] : rangeMatch[1];
      const hi = names ? names[Number(rangeMatch[2])] : rangeMatch[2];
      return `${lo} through ${hi}`;
    }
    return names ? names[Number(part)] : part;
  });

  return described.join(', ');
}

function describeCron(minute: string, hour: string, dom: string, month: string, dow: string): string {
  const isSimpleTime = /^\d+$/.test(minute) && /^\d+$/.test(hour);
  const dowAny = dow === '*';
  const domAny = dom === '*';
  const monthAny = month === '*';

  if (isSimpleTime && domAny && monthAny && dowAny) {
    const h = Number(hour);
    const m = Number(minute);
    const period = h < 12 ? 'AM' : 'PM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `Every day at ${displayHour}:${String(m).padStart(2, '0')} ${period}`;
  }

  if (isSimpleTime && domAny && monthAny && !dowAny) {
    const h = Number(hour);
    const m = Number(minute);
    const period = h < 12 ? 'AM' : 'PM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const days = describeField(dow, 4, 'day', [...DAY_NAMES]);
    return `At ${displayHour}:${String(m).padStart(2, '0')} ${period} on ${days}`;
  }

  const parts: string[] = [];
  parts.push(`Minute: ${describeField(minute, 0, 'minute')}`);
  parts.push(`Hour: ${describeField(hour, 1, 'hour')}`);
  parts.push(`Day of month: ${describeField(dom, 2, 'day')}`);
  parts.push(`Month: ${describeField(month, 3, 'month', ['', ...MONTH_NAMES])}`);
  parts.push(`Day of week: ${describeField(dow, 4, 'day', [...DAY_NAMES])}`);
  return parts.join('\n');
}

function tryValidate(input: string) {
  const value = input.trim();

  if (!value) {
    return { ok: false as const, message: 'Enter a cron expression.' };
  }

  const fields = value.split(/\s+/);
  if (fields.length !== 5) {
    return {
      ok: false as const,
      message: `Expected 5 fields (minute hour day-of-month month day-of-week), got ${fields.length}.`,
    };
  }

  for (let i = 0; i < 5; i++) {
    const result = validateField(fields[i], i);
    if (!result.ok) {
      return { ok: false as const, message: result.message };
    }
  }

  const [minute, hour, dom, month, dow] = fields;
  return { ok: true as const, description: describeCron(minute, hour, dom, month, dow) };
}

export default function CronValidator() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => tryValidate(input), [input]);

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setInput('')}>
          Clear
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Cron expression</span>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="minute hour day-of-month month day-of-week"
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Valid cron expression' : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Schedule</span>
          </div>
          <div className="output mono">{result.ok ? result.description : '// Fix the errors on the left to see the schedule'}</div>
          <div className="status-line status-neutral">{' '}</div>
        </div>
      </div>
    </div>
  );
}
