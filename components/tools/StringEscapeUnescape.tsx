'use client';

import { useMemo, useState } from 'react';

type Language = 'js' | 'java' | 'regex';
type Mode = 'escape' | 'unescape';

const SAMPLES: Record<Language, string> = {
  js: 'She said, "Let\'s go!"\nNext line\twith a tab.',
  java: 'She said, "Let\'s go!"\nNext line\twith a tab.',
  regex: 'Price: $19.99 (was $24.99)',
};

function escapeCLikeString(input: string, includeSingleQuote: boolean): string {
  let out = '';
  for (const ch of input) {
    switch (ch) {
      case '\\':
        out += '\\\\';
        break;
      case '"':
        out += '\\"';
        break;
      case "'":
        out += includeSingleQuote ? "\\'" : ch;
        break;
      case '\n':
        out += '\\n';
        break;
      case '\r':
        out += '\\r';
        break;
      case '\t':
        out += '\\t';
        break;
      case '\f':
        out += '\\f';
        break;
      case '\b':
        out += '\\b';
        break;
      default:
        out += ch;
    }
  }
  return out;
}

function unescapeCLikeString(input: string, allowHexEscape: boolean): string {
  let out = '';
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (ch !== '\\' || i + 1 >= input.length) {
      out += ch;
      i++;
      continue;
    }
    const next = input[i + 1];
    switch (next) {
      case '\\':
        out += '\\';
        i += 2;
        break;
      case '"':
        out += '"';
        i += 2;
        break;
      case "'":
        out += "'";
        i += 2;
        break;
      case 'n':
        out += '\n';
        i += 2;
        break;
      case 'r':
        out += '\r';
        i += 2;
        break;
      case 't':
        out += '\t';
        i += 2;
        break;
      case 'f':
        out += '\f';
        i += 2;
        break;
      case 'b':
        out += '\b';
        i += 2;
        break;
      case 'u': {
        const hex = input.slice(i + 2, i + 6);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          out += String.fromCharCode(parseInt(hex, 16));
          i += 6;
        } else {
          out += next;
          i += 2;
        }
        break;
      }
      case 'x': {
        if (allowHexEscape) {
          const hex = input.slice(i + 2, i + 4);
          if (/^[0-9a-fA-F]{2}$/.test(hex)) {
            out += String.fromCharCode(parseInt(hex, 16));
            i += 4;
            break;
          }
        }
        out += next;
        i += 2;
        break;
      }
      default:
        // Unrecognized escape — JS/Java both just drop the backslash and keep the character.
        out += next;
        i += 2;
    }
  }
  return out;
}

const REGEX_SPECIALS = /[.*+?^${}()|[\]\\/]/g;

function escapeRegex(input: string): string {
  return input.replace(REGEX_SPECIALS, '\\$&');
}

function unescapeRegex(input: string): string {
  return input.replace(/\\([.*+?^${}()|[\]\\/])/g, '$1');
}

function transform(language: Language, mode: Mode, input: string): string {
  if (language === 'regex') {
    return mode === 'escape' ? escapeRegex(input) : unescapeRegex(input);
  }
  const includeSingleQuote = true;
  const allowHexEscape = language === 'js';
  return mode === 'escape' ? escapeCLikeString(input, includeSingleQuote) : unescapeCLikeString(input, allowHexEscape);
}

const LANGUAGE_LABELS: Record<Language, string> = {
  js: 'JavaScript',
  java: 'Java',
  regex: 'Regex',
};

export default function StringEscapeUnescape() {
  const [language, setLanguage] = useState<Language>('js');
  const [mode, setMode] = useState<Mode>('escape');
  const [input, setInput] = useState(SAMPLES.js);

  const output = useMemo(() => transform(language, mode, input), [language, mode, input]);

  function switchLanguage(next: Language) {
    setLanguage(next);
    setInput(SAMPLES[next]);
  }

  function swap() {
    setInput(output);
    setMode(mode === 'escape' ? 'unescape' : 'escape');
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
  }

  return (
    <div>
      <div className="control-row">
        {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
          <button
            key={lang}
            className={`icon-btn${language === lang ? ' is-active' : ''}`}
            onClick={() => switchLanguage(lang)}
          >
            {LANGUAGE_LABELS[lang]}
          </button>
        ))}
      </div>

      <div className="control-row">
        <button className={`icon-btn${mode === 'escape' ? ' is-active' : ''}`} onClick={() => setMode('escape')}>
          Escape
        </button>
        <button className={`icon-btn${mode === 'unescape' ? ' is-active' : ''}`} onClick={() => setMode('unescape')}>
          Unescape
        </button>
        <button className="icon-btn" onClick={swap}>
          Swap input ↔ output
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'escape' ? 'Raw text' : 'Escaped text'}</span>
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
            <span>{mode === 'escape' ? 'Escaped text' : 'Raw text'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono" style={{ whiteSpace: 'pre-wrap' }}>
            {output}
          </div>
        </div>
      </div>
    </div>
  );
}
