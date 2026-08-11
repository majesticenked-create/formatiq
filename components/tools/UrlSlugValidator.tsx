'use client';

import { useMemo, useState } from 'react';

function suggestSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function tryValidate(input: string) {
  const value = input.trim();

  if (!value) {
    return { ok: false as const, message: 'Enter a slug to validate.', suggestion: '' };
  }
  if (value !== value.toLowerCase()) {
    return { ok: false as const, message: 'Slug must be lowercase only.', suggestion: suggestSlug(value) };
  }
  if (value.startsWith('-')) {
    return { ok: false as const, message: 'Slug cannot start with a hyphen.', suggestion: suggestSlug(value) };
  }
  if (value.endsWith('-')) {
    return { ok: false as const, message: 'Slug cannot end with a hyphen.', suggestion: suggestSlug(value) };
  }
  if (value.includes('--')) {
    return { ok: false as const, message: 'Slug cannot contain consecutive hyphens.', suggestion: suggestSlug(value) };
  }
  if (!/^[a-z0-9-]+$/.test(value)) {
    return {
      ok: false as const,
      message: 'Slug can only contain lowercase letters, numbers, and hyphens - no spaces or special characters.',
      suggestion: suggestSlug(value),
    };
  }

  return { ok: true as const };
}

export default function UrlSlugValidator() {
  const [input, setInput] = useState('my-blog-post-2026');

  const result = useMemo(() => tryValidate(input), [input]);

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput('my-blog-post-2026')}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setInput('')}>
          Clear
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Slug</span>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Enter a URL slug..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Valid slug' : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Suggestion</span>
          </div>
          <div className="output mono">
            {result.ok
              ? 'This slug is already valid - no suggestion needed.'
              : result.suggestion || '// Enter some text to see a valid slug suggestion'}
          </div>
          <div className="status-line status-neutral">{' '}</div>
        </div>
      </div>
    </div>
  );
}
