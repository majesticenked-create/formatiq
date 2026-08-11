'use client';

import { useMemo, useState } from 'react';

const SAMPLE = `<!DOCTYPE html>\n<html>\n  <head>\n    <!-- page title -->\n    <title>Formatiq</title>\n  </head>\n  <body>\n    <h1>Hello, world!</h1>\n    <p>\n      This is a sample paragraph with   extra   spaces.\n    </p>\n  </body>\n</html>`;

function minifyHtml(input: string) {
  let output = input;
  output = output.replace(/<!--[\s\S]*?-->/g, '');
  output = output.replace(/>\s+</g, '><');
  output = output.replace(/[ \t]+/g, ' ');
  output = output.replace(/\n\s*/g, '');
  output = output.trim();
  return output;
}

function formatBytes(n: number) {
  return `${n} byte${n === 1 ? '' : 's'}`;
}

function tryMinify(input: string) {
  if (!input.trim()) {
    return { ok: false as const, message: 'Paste some HTML to minify.' };
  }

  const output = minifyHtml(input);
  const before = new Blob([input]).size;
  const after = new Blob([output]).size;
  const reduction = before === 0 ? 0 : Math.round((1 - after / before) * 1000) / 10;

  return { ok: true as const, output, before, after, reduction };
}

export default function HtmlMinifier() {
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
            placeholder="Paste HTML here..."
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
            {result.ok ? `${formatBytes(result.after)} after - ${result.reduction}% smaller` : ' '}
          </div>
        </div>
      </div>
    </div>
  );
}
