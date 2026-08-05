'use client';

import { useMemo, useState } from 'react';

export default function WordCounter() {
  const [input, setInput] = useState('');

  const stats = useMemo(() => {
    const words = input.trim().length ? input.trim().split(/\s+/) : [];
    const sentences = input.trim().length ? input.split(/[.!?]+/).filter((s) => s.trim().length) : [];
    const paragraphs = input.trim().length ? input.split(/\n{2,}/).filter((p) => p.trim().length) : [];
    return {
      words: words.length,
      characters: input.length,
      charactersNoSpaces: input.replace(/\s/g, '').length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      readingTime: Math.max(1, Math.ceil(words.length / 200)),
    };
  }, [input]);

  return (
    <div>
      <div className="panels" style={{ gridTemplateColumns: '1fr' }}>
        <div className="panel">
          <div className="panel-bar">
            <span>Your text</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={() => setInput('')}>
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste or type text to count..."
            style={{ minHeight: 220 }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 12,
          marginTop: 16,
        }}
      >
        {[
          ['Words', stats.words],
          ['Characters', stats.characters],
          ['Chars (no spaces)', stats.charactersNoSpaces],
          ['Sentences', stats.sentences],
          ['Paragraphs', stats.paragraphs],
          ['Reading time', `${stats.readingTime} min`],
        ].map(([label, value]) => (
          <div key={label as string} className="panel" style={{ padding: 14 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              {label}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, marginTop: 4 }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
