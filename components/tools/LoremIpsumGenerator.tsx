'use client';

import { useEffect, useState } from 'react';

const WORDS =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(
    ' '
  );

const CLASSIC_OPENER =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateSentence(): string {
  const wordCount = randomInt(6, 14);
  const words = Array.from({ length: wordCount }, () => WORDS[randomInt(0, WORDS.length - 1)]);
  return capitalize(words.join(' ')) + '.';
}

function generateParagraph(isFirst: boolean, startWithClassic: boolean): string {
  const sentenceCount = randomInt(4, 7);
  const sentences = Array.from({ length: sentenceCount }, () => generateSentence());
  if (isFirst && startWithClassic) {
    sentences[0] = CLASSIC_OPENER;
  }
  return sentences.join(' ');
}

function generate(paragraphCount: number, startWithClassic: boolean): string[] {
  return Array.from({ length: paragraphCount }, (_, i) => generateParagraph(i === 0, startWithClassic));
}

export default function LoremIpsumGenerator() {
  const [paragraphCount, setParagraphCount] = useState(3);
  const [startWithClassic, setStartWithClassic] = useState(true);
  const [paragraphs, setParagraphs] = useState<string[]>([]);

  function regenerate() {
    setParagraphs(generate(paragraphCount, startWithClassic));
  }

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paragraphCount, startWithClassic]);

  function copyAll() {
    navigator.clipboard.writeText(paragraphs.join('\n\n'));
  }

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Paragraphs: {paragraphCount}
        </label>
        <input
          type="range"
          min={1}
          max={20}
          value={paragraphCount}
          onChange={(e) => setParagraphCount(Number(e.target.value))}
          style={{ width: 160 }}
        />
        <button
          className="icon-btn"
          style={{
            borderColor: startWithClassic ? 'var(--accent-dim)' : undefined,
            color: startWithClassic ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => setStartWithClassic((v) => !v)}
        >
          Start with classic opener
        </button>
        <button className="btn btn-primary" onClick={regenerate}>
          Generate
        </button>
        <button className="icon-btn" onClick={copyAll}>
          Copy all
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Generated text</span>
        </div>
        <div className="output mono">{paragraphs.join('\n\n')}</div>
        <div className="status-line status-neutral">{paragraphs.length} paragraph{paragraphs.length === 1 ? '' : 's'}</div>
      </div>
    </div>
  );
}
