'use client';

import { useMemo, useState } from 'react';

type Mode = 'textToMorse' | 'morseToText';

const MORSE_MAP: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  "'": '.----.',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  ';': '-.-.-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  '_': '..--.-',
  '"': '.-..-.',
  '$': '...-..-',
  '@': '.--.-.',
};

const REVERSE_MORSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([char, code]) => [code, char])
);

const SAMPLE_TEXT = 'HELLO WORLD';
const SAMPLE_MORSE = '.... . .-.. .-.. --- / .-- --- .-. .-.. -..';

function textToMorse(input: string) {
  const words = input.trim().toUpperCase().split(/\s+/);
  const unknownChars = new Set<string>();

  const morseWords = words.map((word) =>
    Array.from(word)
      .map((char) => {
        if (MORSE_MAP[char]) return MORSE_MAP[char];
        unknownChars.add(char);
        return '';
      })
      .filter(Boolean)
      .join(' ')
  );

  if (unknownChars.size > 0) {
    return {
      ok: false as const,
      message: `No Morse mapping for: ${Array.from(unknownChars).join(', ')}`,
    };
  }

  return { ok: true as const, output: morseWords.join(' / ') };
}

function morseToText(input: string) {
  const trimmed = input.trim();
  if (!/^[.\-/\s]+$/.test(trimmed)) {
    return { ok: false as const, message: 'Morse code can only contain dots, dashes, spaces, and "/" for word breaks.' };
  }

  const words = trimmed.split('/');
  const unknownCodes = new Set<string>();

  const textWords = words.map((word) =>
    word
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((code) => {
        if (REVERSE_MORSE_MAP[code]) return REVERSE_MORSE_MAP[code];
        unknownCodes.add(code);
        return '';
      })
      .join('')
  );

  if (unknownCodes.size > 0) {
    return { ok: false as const, message: `Unrecognized Morse code sequence(s): ${Array.from(unknownCodes).join(', ')}` };
  }

  return { ok: true as const, output: textWords.join(' ') };
}

function tryConvert(mode: Mode, input: string) {
  if (!input.trim()) {
    return { ok: false as const, message: mode === 'textToMorse' ? 'Enter some text to convert.' : 'Enter some Morse code to convert.' };
  }
  return mode === 'textToMorse' ? textToMorse(input) : morseToText(input);
}

export default function MorseCodeConverter() {
  const [mode, setMode] = useState<Mode>('textToMorse');
  const [input, setInput] = useState(SAMPLE_TEXT);

  const result = useMemo(() => tryConvert(mode, input), [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'textToMorse' ? SAMPLE_TEXT : SAMPLE_MORSE);
  }

  function swap() {
    if (result.ok) {
      setInput(result.output);
      setMode(mode === 'textToMorse' ? 'morseToText' : 'textToMorse');
    }
  }

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'textToMorse' ? 'var(--accent-dim)' : undefined,
            color: mode === 'textToMorse' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('textToMorse')}
        >
          Text → Morse
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'morseToText' ? 'var(--accent-dim)' : undefined,
            color: mode === 'morseToText' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('morseToText')}
        >
          Morse → Text
        </button>
        <button className="icon-btn" onClick={swap} disabled={!result.ok}>
          Swap input ↔ output
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'textToMorse' ? 'Text' : 'Morse code'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={() => setInput('')}>
                Clear
              </button>
            </div>
          </div>
          <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'textToMorse' ? 'Morse code' : 'Text'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : ''}</div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Converted' : `✗ ${result.message}`}
          </div>
        </div>
      </div>
    </div>
  );
}
