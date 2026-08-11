'use client';

import { useMemo, useState } from 'react';

const SAMPLE = '  Hello    world!  \n\n\tThis  line has   a tab.\n\n\n   Extra blank lines above.   \n';

interface Options {
  trimLines: boolean;
  collapseSpaces: boolean;
  removeBlankLines: boolean;
  tabsToSpaces: boolean;
}

function processText(input: string, options: Options): string {
  let lines = input.split('\n');

  if (options.tabsToSpaces) {
    lines = lines.map((line) => line.replace(/\t/g, '  '));
  }
  if (options.collapseSpaces) {
    lines = lines.map((line) => line.replace(/ {2,}/g, ' '));
  }
  if (options.trimLines) {
    lines = lines.map((line) => line.trim());
  }
  if (options.removeBlankLines) {
    lines = lines.filter((line) => line.trim().length > 0);
  }

  return lines.join('\n');
}

export default function WhitespaceRemover() {
  const [input, setInput] = useState(SAMPLE);
  const [options, setOptions] = useState<Options>({
    trimLines: true,
    collapseSpaces: true,
    removeBlankLines: false,
    tabsToSpaces: false,
  });

  const output = useMemo(() => processText(input, options), [input, options]);

  function toggle(key: keyof Options) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
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

      <div className="control-row">
        <button
          className="icon-btn"
          style={{
            borderColor: options.trimLines ? 'var(--accent-dim)' : undefined,
            color: options.trimLines ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => toggle('trimLines')}
        >
          Trim leading/trailing per line
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: options.collapseSpaces ? 'var(--accent-dim)' : undefined,
            color: options.collapseSpaces ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => toggle('collapseSpaces')}
        >
          Collapse multiple spaces
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: options.removeBlankLines ? 'var(--accent-dim)' : undefined,
            color: options.removeBlankLines ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => toggle('removeBlankLines')}
        >
          Remove blank lines
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: options.tabsToSpaces ? 'var(--accent-dim)' : undefined,
            color: options.tabsToSpaces ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => toggle('tabsToSpaces')}
        >
          Tabs → spaces
        </button>
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
            <span>Cleaned output</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{output}</div>
          <div className="status-line status-valid">
            {output.length} characters ({input.length - output.length >= 0 ? '-' : '+'}
            {Math.abs(input.length - output.length)})
          </div>
        </div>
      </div>
    </div>
  );
}
