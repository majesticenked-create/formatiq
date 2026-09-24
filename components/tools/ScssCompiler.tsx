'use client';

import { useMemo, useState } from 'react';
import { compileSass } from '@/lib/tools/sass-utils';

const SAMPLE = `$primary: #3366ff;
$radius: 8px;

.card {
  border-radius: $radius;
  .title {
    color: $primary;
    font-weight: 600;
  }
}`;

export default function ScssCompiler() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => compileSass(input, 'scss'), [input]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.css);
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
            <span>SCSS input</span>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste SCSS here..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Compiled' : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Compiled CSS</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.css : '// Fix the errors on the left to see compiled CSS'}</div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Compiles SCSS (variables, nesting) into plain CSS using the official <code>sass</code> (Dart Sass) package,
        entirely in your browser - nothing you paste is uploaded. No filename is given to the compiler, so{' '}
        <code>@use</code>/<code>@import</code> can never resolve against a filesystem or network address; an
        unresolvable import simply fails with a clear error. Just want to reformat SCSS without compiling it? Use the{' '}
        <a href="/tools/formatters/scss-formatter">SCSS Formatter</a>. Writing indented-syntax Sass instead? Use the{' '}
        <a href="/tools/formatters/sass-compiler">SASS Compiler</a>.
      </div>
    </div>
  );
}
