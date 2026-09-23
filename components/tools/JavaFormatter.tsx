'use client';

import { useMemo, useState } from 'react';

const SAMPLE = `public class Greeter {
private String name;
public Greeter(String name) {
this.name = name;
}
public String greet() {
if (name == null || name.isEmpty()) {
return "Hello, stranger!";
} else {
return "Hello, " + name + "!";
}
}
}`;

interface Token {
  type: 'code' | 'string' | 'char' | 'comment';
  text: string;
}

// Tokenizes Java source into code / string / char-literal / comment chunks so
// that braces, semicolons, and quote characters occurring *inside* a string,
// char literal, or comment are never mistaken for real code structure.
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

    if (ch === '"') {
      flush();
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
        if (c === '"') break;
        if (c === '\n') break; // unterminated string - bail out of the literal
      }
      tokens.push({ type: 'string', text: str });
      continue;
    }

    if (ch === "'") {
      flush();
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
        if (c === "'") break;
        if (c === '\n') break;
      }
      tokens.push({ type: 'char', text: str });
      continue;
    }

    if (two === '//') {
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

function formatJava(input: string): string {
  if (input.includes('"""')) {
    throw new Error(
      'Java text blocks ("""…""") are not supported by this formatter - they can contain unescaped braces and quotes that would break brace-aware reindenting. Remove or convert them before formatting.'
    );
  }

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

    for (const ch of token.text) {
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

  // Keep "} else {", "} catch (...) {", "} finally {" on one line.
  out = out.replace(/\}[ \t]*\n[ \t]*(else\b|catch\b|finally\b)/g, '} $1');

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
    return { ok: false as const, message: 'Paste some Java code to format.' };
  }
  try {
    return { ok: true as const, output: formatJava(input) };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Could not format this Java code.' };
  }
}

export default function JavaFormatter() {
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
            placeholder="Paste Java code here..."
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
          <div className="output mono">{result.ok ? result.output : '// Paste Java code on the left to see formatted output'}</div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        This reformats brace placement and indentation only - it tracks string literals, char literals, and both
        comment styles so braces and quotes inside them are never miscounted. Java 15+ text blocks (
        <code className="mono">&quot;&quot;&quot;…&quot;&quot;&quot;</code>) are not supported and will be rejected rather than
        silently mangled.
      </div>
    </div>
  );
}
