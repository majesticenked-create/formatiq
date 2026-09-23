'use client';

import { useMemo, useState } from 'react';
import { hmsToSeconds, formatHms } from '@/lib/tools/duration-utils';

function calculatePlaybackSpeed(hoursStr: string, minutesStr: string, secondsStr: string, speedStr: string) {
  const hours = Number(hoursStr || '0');
  const minutes = Number(minutesStr || '0');
  const seconds = Number(secondsStr || '0');
  const speed = Number(speedStr);

  if ([hoursStr, minutesStr, secondsStr].every((v) => v === '')) {
    return { ok: false as const, message: 'Enter the original duration (hours, minutes, and/or seconds).' };
  }
  if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds) || hours < 0 || minutes < 0 || seconds < 0) {
    return { ok: false as const, message: 'Enter valid, non-negative hours, minutes, and seconds.' };
  }
  const totalSeconds = hmsToSeconds(hours, minutes, seconds);
  if (totalSeconds <= 0) {
    return { ok: false as const, message: 'Enter an original duration greater than zero.' };
  }
  if (!speedStr || Number.isNaN(speed) || speed <= 0) {
    return { ok: false as const, message: 'Enter a playback speed greater than zero (e.g. 1.5 for 1.5x).' };
  }

  const adjustedSeconds = totalSeconds / speed;
  const timeSavedSeconds = totalSeconds - adjustedSeconds;

  return { ok: true as const, totalSeconds, adjustedSeconds, timeSavedSeconds };
}

const inputStyle = {
  width: 90,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function PlaybackSpeedCalculator() {
  const [hours, setHours] = useState('2');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const [speed, setSpeed] = useState('1.5');

  const result = useMemo(() => calculatePlaybackSpeed(hours, minutes, seconds, speed), [hours, minutes, seconds, speed]);

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Original duration:
        </label>
        <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className="mono" style={inputStyle} placeholder="hh" />
        <span className="mono">h</span>
        <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="mono" style={inputStyle} placeholder="mm" />
        <span className="mono">m</span>
        <input type="number" value={seconds} onChange={(e) => setSeconds(e.target.value)} className="mono" style={inputStyle} placeholder="ss" />
        <span className="mono">s</span>
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Playback speed (×):
        </label>
        <input type="number" value={speed} onChange={(e) => setSpeed(e.target.value)} className="mono" style={inputStyle} />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Playback Speed</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Original duration: ${formatHms(result.totalSeconds)}`,
                `Adjusted duration: ${formatHms(result.adjustedSeconds)}`,
                `Time saved:        ${formatHms(result.timeSavedSeconds)}`,
                '',
                'Formula: Adjusted duration = Original duration ÷ Speed',
                '         Time saved = Original duration − Adjusted duration',
              ].join('\n')
            : '// Enter an original duration and playback speed above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
