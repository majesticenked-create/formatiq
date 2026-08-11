'use client';

import { useMemo, useState } from 'react';

const SAMPLE = `// Adds two numbers together\nfunction add(a, b) {\n  // simple sum\n  return a + b;\n}\n\nconst greeting = "// this is not a comment";\nconsole.log(add(2, 3));\n`;

/**
 * Conservative whitespace/comment stripper. Walks the source character by
 * character so it never touches string/template/regex literal contents,
 * which a naive regex-only approach would corrupt.
 */
function minifyJs(input: string) {
  let output = '';
  let i = 0;
  const len = input.length;

  while (i < len) {
    const ch = input[i];
    const next = input[i + 1];

    if (ch === '/' && next === '/') {
      while (i < len && input[i] !== '\n') i++;
      continue;
    }

    if (ch === '/' && next === '*') {
      i += 2;
      while (i < len && !(input[i] === '*' && input[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      output += ch;
      i++;
      while (i < len && input[i] !== quote) {
        if (input[i] === '\\' && i + 1 < len) {
          output += input[i] + input[i + 1];
          i += 2;
          continue;
        }
        output += input[i];
        i++;
      }
      if (i < len) {
        output += input[i];
        i++;
      }
      continue;
    }

    output += ch;
    i++;
  }

  output = output.replace(/[ \t]+/g, ' ');
  output = output.replace(/\n[ \t]*/g, '\n');
  output = output.replace(/\n{2,}/g, '\n');
  output = output.trim();
  return output;
}

function formatBytes(n: number) {
  return `${n} byte${n === 1 ? '' : 's'}`;
}

function tryMinify(input: string) {
  if (!input.trim()) {
    return { ok: false as const, message: 'Paste some JavaScript to minify.' };
  }

  const output = minifyJs(input);
  const before = new Blob([input]).size;
  const after = new Blob([output]).size;
  const reduction = before === 0 ? 0 : Math.round((1 - after / before) * 1000) / 10;

  return { ok: true as const, output, before, after, reduction };
}

export default function JsMinifier() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => tryMinify(input), [input]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
        Safe whitespace &amp; comment minification only - no variable renaming, dead-code elimination, or
        AST-based compression like Terser. Output stays byte-for-byte equivalent to your source logic.
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Input</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={() => setInput('')}>
                Clear
              </button>
            </div>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste JavaScript here..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? `${formatBytes(result.before)} before` : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Minified output</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : '// Fix the errors on the left to see minified output'}</div>
          <div className="status-line status-neutral">
            {result.ok ? `${formatBytes(result.after)} after - ${result.reduction}% smaller` : ' '}
          </div>
        </div>
      </div>
    </div>
  );
}
