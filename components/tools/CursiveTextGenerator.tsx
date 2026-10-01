'use client';

import { useMemo, useState } from 'react';
import { toCursiveText, CURSIVE_VARIANT_LABELS, type CursiveVariant } from '@/lib/tools/cursive-text';

const VARIANTS: CursiveVariant[] = ['script', 'bold', 'italic'];

export default function CursiveTextGenerator() {
  const [input, setInput] = useState('Cursive text');

  const outputs = useMemo(
    () => VARIANTS.map((variant) => ({ variant, label: CURSIVE_VARIANT_LABELS[variant], text: toCursiveText(input, variant) })),
    [input],
  );

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Your text</span>
        </div>
        <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
      </div>

      {outputs.map(({ variant, label, text }) => (
        <div className="panel" style={{ marginBottom: 16 }} key={variant}>
          <div className="panel-bar">
            <span>{label}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={() => copy(text)} disabled={!text}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono" style={{ minHeight: 'auto', padding: '10px 12px', wordBreak: 'break-word', fontSize: 18 }}>
            {text || '(empty)'}
          </div>
        </div>
      ))}

      <div className="status-line status-neutral">
        These use real Unicode Mathematical Alphanumeric Symbols (and, for a few script letters with no
        Math-Alphanumeric codepoint, the older Letterlike Symbols block) rather than an actual font or markup
        change - they are different characters, not styled text. Only A-Z and a-z are mapped; digits,
        punctuation, and non-Latin characters pass through unchanged since no real codepoint exists for them in
        these variants. Appearance depends heavily on the viewer&apos;s font and platform, search and copy-paste
        matching may not work the way it does for plain text, and plain text remains the better choice anywhere
        accessibility (such as screen readers) matters.
      </div>
    </div>
  );
}
