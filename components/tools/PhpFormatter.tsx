'use client';

import { useMemo, useState } from 'react';

const SAMPLE = `<?php
function greet($name) {
if ($name === '') {
return "Hello, stranger!";
} else {
return "Hello, " . $name . "!";
}
}

class Greeter {
public function run() {
foreach ($this->names as $name) {
echo greet($name);
}
}
}`;

interface Token {
  type: 'code' | 'string' | 'comment';
  text: string;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let buf = '';
  function flush() {
    if (buf) {
      tokens.push({ type: 'code', text: buf });
      buf = '';
    }
  }
  while (i < input.length) {
    const ch = input[i];
    const two = input.slice(i, i + 2);
    if (ch === '"' || ch === "'") {
      flush();
      const quote = ch;
      let str = ch;
      i++;
      while (i < input.length) {
        const c = input[i];
        if (c === '\\' && i + 1 < input.length) {
          str += c + input[i + 1];
          i += 2;
          continue;
        }
        str += c;
        i++;
        if (c === quote) break;
      }
      tokens.push({ type: 'string', text: str });
      continue;
    }
    if (two === '//' || ch === '#') {
      flush();
      const start = i;
      while (i < input.length && input[i] !== '\n') i++;
      tokens.push({ type: 'comment', text: input.slice(start, i) });
      continue;
    }
    if (two === '/*') {
      flush();
      const start = i;
      i += 2;
      while (i < input.length && input.slice(i, i + 2) !== '*/') i++;
      i += 2;
      tokens.push({ type: 'comment', text: input.slice(start, Math.min(i, input.length)) });
      continue;
    }
    buf += ch;
    i++;
  }
  flush();
  return tokens;
}

function formatPhp(input: string): string {
  const tokens = tokenize(input);
  let out = '';
  let parenDepth = 0;
  let lastWasSpace = false;

  for (const token of tokens) {
    if (token.type !== 'code') {
      out += token.text;
      if (token.type === 'comment') out += '\n';
      lastWasSpace = false;
      continue;
    }

    // Force PHP open/close tags onto their own line before the general reflow.
    const text = token.text.replace(/<\?php/gi, '\n<?php\n').replace(/\?>/g, '\n?>\n');

    for (const ch of text) {
      if (ch === '(') {
        parenDepth++;
        out += ch;
        lastWasSpace = false;
        continue;
      }
      if (ch === ')') {
        parenDepth--;
        out += ch;
        lastWasSpace = false;
        continue;
      }
      if (ch === '{') {
        out += '{\n';
        lastWasSpace = true;
        continue;
      }
      if (ch === '}') {
        out += '\n}\n';
        lastWasSpace = true;
        continue;
      }
      if (ch === ';') {
        // Only break the line on a top-level statement terminator — a for(;;)
        // header's semicolons stay inline since parenDepth is above zero there.
        if (parenDepth <= 0) {
          out += ';\n';
          lastWasSpace = true;
        } else {
          out += ';';
          lastWasSpace = false;
        }
        continue;
      }
      if (ch === '\n') {
        out += '\n';
        lastWasSpace = true;
        continue;
      }
      if (ch === ' ' || ch === '\t' || ch === '\r') {
        if (!lastWasSpace) {
          out += ' ';
          lastWasSpace = true;
        }
        continue;
      }
      out += ch;
      lastWasSpace = false;
    }
  }

  // PSR-12 style: "} else {", "} catch (...) {", etc. share a line rather than
  // putting the closing brace alone.
  out = out.replace(/\}[ \t]*\n[ \t]*(else\b|elseif\b|catch\b|finally\b)/gi, '} $1');

  const rawLines = out
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let depth = 0;
  const indented: string[] = [];
  for (const line of rawLines) {
    const leadingCloses = /^\}/.test(line) ? 1 : 0;
    const isCaseLabel = /^(case\s|default\s*:)/.test(line);
    let thisDepth = depth - leadingCloses;
    if (isCaseLabel) thisDepth -= 1;
    thisDepth = Math.max(0, thisDepth);
    indented.push('    '.repeat(thisDepth) + line);

    let opens = 0;
    let closes = 0;
    for (const ch of line) {
      if (ch === '{') opens++;
      if (ch === '}') closes++;
    }
    depth = Math.max(0, depth + opens - closes);
  }

  return indented.join('\n');
}

function tryFormat(input: string) {
  if (!input.trim()) {
    return { ok: false as const, message: 'Paste some PHP code to format.' };
  }
  return { ok: true as const, output: formatPhp(input) };
}

export default function PhpFormatter() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => tryFormat(input), [input]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

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
            <span>Input</span>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste PHP code here..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Formatted' : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Formatted output</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : '// Paste PHP code on the left to see formatted output'}</div>
        </div>
      </div>
    </div>
  );
}
