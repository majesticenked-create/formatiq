'use client';

import { useMemo, useState } from 'react';

const SAMPLE = 'Café Déjà Vu - 10 Tips & Tricks for 2026!';

const COMBINING_MARKS = /[̀-ͯ]/g;

function toSlug(input: string): string {
  return input
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function SlugGenerator() {
  const [input, setInput] = useState(SAMPLE);

  const slug = useMemo(() => toSlug(input), [input]);

  function copySlug() {
    if (slug) navigator.clipboard.writeText(slug);
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
            <span>Input text</span>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Enter a title or text to slugify..."
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Slug</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copySlug} disabled={!slug}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{slug || '// Enter some text to see the generated slug'}</div>
          <div className="status-line status-neutral">{' '}</div>
        </div>
      </div>
    </div>
  );
}
