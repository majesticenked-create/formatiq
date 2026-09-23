'use client';

import { useMemo, useState } from 'react';

const SAMPLE = `const greet = (name) => {
  const message = \`Hello, \${name ?? 'stranger'}!\`;
  // a trailing comment
  return message?.toUpperCase();
};`;

interface LineCol {
  line: number;
  column: number;
}

function positionToLineCol(input: string, position: number): LineCol {
  let line = 1;
  let column = 1;
  for (let i = 0; i < position && i < input.length; i++) {
    if (input[i] === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}

type Result = { ok: true } | { ok: false; message: string; lineCol: LineCol | null };

// Checks JavaScript syntax by *constructing* a Function from the source and
// never invoking it. The Function constructor parses and compiles its body
// exactly like eval would, but compiling is not executing: nothing in the
// pasted code runs, no matter what it contains, because the returned function
// is thrown away unread and never called. This never uses eval.
function checkSyntax(input: string): Result {
  try {
    // eslint-disable-next-line no-new-func
    new Function(input);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Syntax error';
    const match = message.match(/:(\d+)/);
    // The Function constructor's stack/message doesn't give a reliable
    // absolute source offset across browsers, so we fall back to scanning
    // for the reported line only when the engine's message includes one.
    const lineNo = match ? Number(match[1]) : null;
    let lineCol: LineCol | null = null;
    if (lineNo && lineNo > 0) {
      const lines = input.split('\n');
      if (lineNo <= lines.length) {
        lineCol = { line: lineNo, column: 1 };
      }
    }
    return { ok: false, message, lineCol };
  }
}

export default function JsValidator() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo<Result | null>(() => (input.trim() ? checkSyntax(input) : null), [input]);

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

      <div className="panel">
        <div className="panel-bar">
          <span>JavaScript input</span>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="Paste JavaScript here..."
        />
        <div
          className={`status-line ${
            result === null ? 'status-neutral' : result.ok ? 'status-valid' : 'status-invalid'
          }`}
        >
          {result === null
            ? 'Enter some JavaScript to validate.'
            : result.ok
              ? '✓ Valid JavaScript syntax'
              : `✗ ${result.message}${result.lineCol ? ` (near line ${result.lineCol.line})` : ''}`}
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        This checks syntax only, entirely in your browser: the pasted code is compiled (never executed or called) to
        detect parse errors, then discarded. Nothing you paste runs, and nothing is sent anywhere. Module-only syntax
        (top-level <code className="mono">import</code>/<code className="mono">export</code>) isn&apos;t valid inside a
        plain function body and will be flagged even if it&apos;s valid in a module file - paste just the function or
        script body to check that.
      </div>
    </div>
  );
}
