'use client';

import { useMemo, useState } from 'react';

const SAMPLE = `Hello, world! Isn't this great? "Formatiq" is free — no sign-up (really).`;

interface Category {
  key: string;
  label: string;
  chars: string;
}

const CATEGORIES: Category[] = [
  { key: 'periods', label: 'Periods (.)', chars: '.' },
  { key: 'commas', label: 'Commas (,)', chars: ',' },
  { key: 'exclamation', label: 'Exclamation marks (!)', chars: '!' },
  { key: 'question', label: 'Question marks (?)', chars: '?' },
  { key: 'quotes', label: 'Quotes (\' " ‘ ’ “ ”)', chars: '\'"‘’“”' },
  { key: 'other', label: 'Other symbols (; : - ( ) [ ] { } / & # @ etc.)', chars: ';:\\-()[\\]{}/\\\\@#$%^&*_+=<>|~`—–' },
];

function escapeForCharClass(chars: string): string {
  return chars;
}

function stripPunctuation(input: string, enabled: Record<string, boolean>): string {
  const activeChars = CATEGORIES.filter((c) => enabled[c.key])
    .map((c) => escapeForCharClass(c.chars))
    .join('');
  if (!activeChars) return input;
  const pattern = new RegExp(`[${activeChars}]`, 'g');
  return input.replace(pattern, '');
}

export default function RemovePunctuation() {
  const [input, setInput] = useState(SAMPLE);
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.key, true]))
  );
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => stripPunctuation(input, enabled), [input, enabled]);

  function toggle(key: string) {
    setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function removeAll() {
    setEnabled(Object.fromEntries(CATEGORIES.map((c) => [c.key, true])));
  }

  function keepAll() {
    setEnabled(Object.fromEntries(CATEGORIES.map((c) => [c.key, false])));
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const removedCount = input.length - output.length;

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setInput('')}>
          Clear
        </button>
        <button className="icon-btn" onClick={removeAll}>
          Remove all
        </button>
        <button className="icon-btn" onClick={keepAll}>
          Keep all
        </button>
      </div>

      <div className="control-row">
        {CATEGORIES.map((category) => (
          <button
            key={category.key}
            className={`icon-btn${enabled[category.key] ? ' is-active' : ''}`}
            onClick={() => toggle(category.key)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Input</span>
          </div>
          <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
          <div className="status-line status-neutral">{input.length} characters</div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Result</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="output mono">{output}</div>
          <div className="status-line status-valid">
            {output.length} characters ({removedCount >= 0 ? '-' : '+'}
            {Math.abs(removedCount)})
          </div>
        </div>
      </div>
    </div>
  );
}
