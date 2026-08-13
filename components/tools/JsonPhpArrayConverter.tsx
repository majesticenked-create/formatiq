'use client';

import { useMemo, useState } from 'react';

type Mode = 'jsonToPhp' | 'phpToJson';

const SAMPLE_JSON = JSON.stringify(
  {
    name: 'Formatiq',
    active: true,
    tags: ['json', 'php'],
    meta: { version: 1, deprecated: null },
  },
  null,
  2
);

const SAMPLE_PHP = `[\n    'name' => 'Formatiq',\n    'active' => true,\n    'tags' => [\n        'json',\n        'php',\n    ],\n    'meta' => [\n        'version' => 1,\n        'deprecated' => null,\n    ],\n]`;

// --- PHP array literal -> JSON -------------------------------------------------

type Token =
  | { type: 'array' }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'lbracket' }
  | { type: 'rbracket' }
  | { type: 'comma' }
  | { type: 'arrow' }
  | { type: 'string'; value: string }
  | { type: 'number'; value: number }
  | { type: 'bool'; value: boolean }
  | { type: 'null' };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }
    if (ch === '[') {
      tokens.push({ type: 'lbracket' });
      i++;
      continue;
    }
    if (ch === ']') {
      tokens.push({ type: 'rbracket' });
      i++;
      continue;
    }
    if (ch === ',') {
      tokens.push({ type: 'comma' });
      i++;
      continue;
    }
    if (ch === '=' && input[i + 1] === '>') {
      tokens.push({ type: 'arrow' });
      i += 2;
      continue;
    }

    if (ch === "'" || ch === '"') {
      const quote = ch;
      let str = '';
      i++;
      while (i < input.length && input[i] !== quote) {
        if (input[i] === '\\' && (input[i + 1] === quote || input[i + 1] === '\\')) {
          str += input[i + 1];
          i += 2;
        } else {
          str += input[i];
          i++;
        }
      }
      i++; // closing quote
      tokens.push({ type: 'string', value: str });
      continue;
    }

    if (/[0-9-]/.test(ch)) {
      let numStr = '';
      while (i < input.length && /[0-9.\-]/.test(input[i])) {
        numStr += input[i];
        i++;
      }
      tokens.push({ type: 'number', value: Number(numStr) });
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      let word = '';
      while (i < input.length && /[a-zA-Z_]/.test(input[i])) {
        word += input[i];
        i++;
      }
      const lower = word.toLowerCase();
      if (lower === 'array') tokens.push({ type: 'array' });
      else if (lower === 'true') tokens.push({ type: 'bool', value: true });
      else if (lower === 'false') tokens.push({ type: 'bool', value: false });
      else if (lower === 'null') tokens.push({ type: 'null' });
      else throw new Error(`Unexpected identifier "${word}" - expected array, true, false, or null.`);
      continue;
    }

    throw new Error(`Unexpected character "${ch}" at position ${i}.`);
  }
  return tokens;
}

interface Entry {
  key: string | number | null;
  value: unknown;
}

function parsePhp(input: string): unknown {
  const tokens = tokenize(input);
  let pos = 0;

  function peek() {
    return tokens[pos];
  }
  function next() {
    return tokens[pos++];
  }

  function parseValue(): unknown {
    const tok = peek();
    if (!tok) throw new Error('Unexpected end of input.');

    if (tok.type === 'string') {
      next();
      return tok.value;
    }
    if (tok.type === 'number') {
      next();
      return tok.value;
    }
    if (tok.type === 'bool') {
      next();
      return tok.value;
    }
    if (tok.type === 'null') {
      next();
      return null;
    }
    if (tok.type === 'lbracket') {
      return parseArrayBody('lbracket', 'rbracket');
    }
    if (tok.type === 'array') {
      next();
      if (peek()?.type !== 'lparen') throw new Error('Expected "(" after "array".');
      return parseArrayBody('lparen', 'rparen');
    }
    throw new Error(`Unexpected token while parsing a value.`);
  }

  function parseArrayBody(openType: Token['type'], closeType: Token['type']): unknown {
    if (peek()?.type !== openType) throw new Error(`Expected opening bracket.`);
    next();

    const entries: Entry[] = [];
    while (peek() && peek().type !== closeType) {
      const first = parseValue();
      let entry: Entry;
      if (peek()?.type === 'arrow') {
        next();
        const value = parseValue();
        if (typeof first !== 'string' && typeof first !== 'number') {
          throw new Error('Array key must be a string or number.');
        }
        entry = { key: first, value };
      } else {
        entry = { key: null, value: first };
      }
      entries.push(entry);

      if (peek()?.type === 'comma') {
        next();
      } else {
        break;
      }
    }

    if (peek()?.type !== closeType) throw new Error('Expected closing bracket - missing "," between entries?');
    next();

    // Sequential-from-0 integer keys (explicit or implicit) become a JSON array,
    // matching how PHP's own json_encode() treats a PHP array - anything else
    // (string keys, or integer keys out of sequence) becomes a JSON object.
    let nextImplicitIndex = 0;
    let isSequential = true;
    const resolved = entries.map((entry) => {
      const key = entry.key === null ? nextImplicitIndex : entry.key;
      if (typeof key === 'number') nextImplicitIndex = Math.max(nextImplicitIndex, key + 1);
      return { key, value: entry.value };
    });
    resolved.forEach((entry, i) => {
      if (entry.key !== i) isSequential = false;
    });

    if (isSequential) return resolved.map((entry) => entry.value);

    const obj: Record<string, unknown> = {};
    resolved.forEach((entry) => {
      obj[String(entry.key)] = entry.value;
    });
    return obj;
  }

  const result = parseValue();
  if (pos < tokens.length) throw new Error('Unexpected content after the array literal.');
  return result;
}

function phpToJson(input: string) {
  if (!input.trim()) return { ok: false as const, message: 'Paste a PHP array to convert.' };
  try {
    const parsed = parsePhp(input.trim().replace(/;\s*$/, ''));
    return { ok: true as const, output: JSON.stringify(parsed, null, 2) };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Could not parse PHP array.' };
  }
}

// --- JSON -> PHP array literal -------------------------------------------------

function phpString(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function phpLiteral(value: unknown, depth: number): string {
  const pad = '    '.repeat(depth);
  const childPad = '    '.repeat(depth + 1);

  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return phpString(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((item) => `${childPad}${phpLiteral(item, depth + 1)},`).join('\n');
    return `[\n${items}\n${pad}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return '[]';
  const items = entries.map(([key, val]) => `${childPad}${phpString(key)} => ${phpLiteral(val, depth + 1)},`).join('\n');
  return `[\n${items}\n${pad}]`;
}

function jsonToPhp(input: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Invalid JSON' };
  }
  return { ok: true as const, output: phpLiteral(parsed, 0) };
}

export default function JsonPhpArrayConverter() {
  const [mode, setMode] = useState<Mode>('jsonToPhp');
  const [input, setInput] = useState(SAMPLE_JSON);

  const result = useMemo(() => (mode === 'jsonToPhp' ? jsonToPhp(input) : phpToJson(input)), [mode, input]);

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === 'jsonToPhp' ? SAMPLE_JSON : SAMPLE_PHP);
  }

  function swap() {
    if (result.ok) {
      setInput(result.output);
      setMode(mode === 'jsonToPhp' ? 'phpToJson' : 'jsonToPhp');
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
            borderColor: mode === 'jsonToPhp' ? 'var(--accent-dim)' : undefined,
            color: mode === 'jsonToPhp' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('jsonToPhp')}
        >
          JSON → PHP
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: mode === 'phpToJson' ? 'var(--accent-dim)' : undefined,
            color: mode === 'phpToJson' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => switchMode('phpToJson')}
        >
          PHP → JSON
        </button>
        <button className="icon-btn" onClick={swap} disabled={!result.ok}>
          Swap input ↔ output
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>{mode === 'jsonToPhp' ? 'JSON' : 'PHP array'}</span>
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
            <span>{mode === 'jsonToPhp' ? 'PHP array' : 'JSON'}</span>
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

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        PHP output uses short array syntax ([...]) with single-quoted string keys, matching modern PHP style
        (var_export()-like but not identical to its exact output format). A PHP array with sequential integer keys
        starting at 0 converts to a JSON array; anything else (string keys, or out-of-order integer keys) becomes a
        JSON object, matching how PHP&apos;s own json_encode() treats arrays.
      </div>
    </div>
  );
}
