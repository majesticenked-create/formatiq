'use client';

import { useMemo, useState } from 'react';

type Mode = 'to24' | 'to12';

function to24Hour(input: string) {
  const match = input.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!match) return { ok: false as const, message: 'Enter a 12-hour time like 2:30 PM.' };

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toLowerCase();

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return { ok: false as const, message: 'Hour must be 1-12 and minutes 00-59.' };
  }

  if (period === 'am') {
    if (hour === 12) hour = 0;
  } else if (hour !== 12) {
    hour += 12;
  }

  return { ok: true as const, output: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` };
}

function to12Hour(input: string) {
  const match = input.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return { ok: false as const, message: 'Enter a 24-hour time like 14:30.' };

  const hour24 = Number(match[1]);
  const minute = Number(match[2]);

  if (hour24 < 0 || hour24 > 23 || minute < 0 || minute > 59) {
    return { ok: false as const, message: 'Hour must be 00-23 and minutes 00-59.' };
  }

  const period = hour24 < 12 ? 'AM' : 'PM';
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;

  return { ok: true as const, output: `${hour12}:${String(minute).padStart(2, '0')} ${period}` };
}

export default function TimeFormatConverter() {
  const [mode, setMode] = useState<Mode>('to24');
  const [input, setInput] = useState('2:30 PM');

  const result = useMemo(() => (mode === 'to24' ? to24Hour(input) : to12Hour(input)), [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'to24' ? '2:30 PM' : '14:30');
  }

  return (
    <div>
      <div className="control-row">
        <button className={`icon-btn${mode === 'to24' ? ' is-active' : ''}`} onClick={() => switchMode('to24')}>
          12-hour → 24-hour
        </button>
        <button className={`icon-btn${mode === 'to12' ? ' is-active' : ''}`} onClick={() => switchMode('to12')}>
          24-hour → 12-hour
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'to24' ? '12-hour time' : '24-hour time'}</span>
          </div>
          <input
            className="mono"
            style={{ width: '100%', padding: '10px 12px' }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={mode === 'to24' ? '2:30 PM' : '14:30'}
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'to24' ? '24-hour time' : '12-hour time'}</span>
          </div>
          <div className="output mono">{result.ok ? result.output : `// ${result.message}`}</div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Converted' : `✗ ${result.message}`}
          </div>
        </div>
      </div>
    </div>
  );
}
