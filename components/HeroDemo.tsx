'use client';

import { useEffect, useState } from 'react';

const RAW = '{"tool":"json-formatter","runs":"in-browser","private":true,"speed":"instant"}';

const FORMATTED: Array<{ text: string; cls?: string }> = [
  { text: '{\n' },
  { text: '  "tool"', cls: 'k' },
  { text: ': ' },
  { text: '"json-formatter"', cls: 's' },
  { text: ',\n' },
  { text: '  "runs"', cls: 'k' },
  { text: ': ' },
  { text: '"in-browser"', cls: 's' },
  { text: ',\n' },
  { text: '  "private"', cls: 'k' },
  { text: ': ' },
  { text: 'true', cls: 'n' },
  { text: ',\n' },
  { text: '  "speed"', cls: 'k' },
  { text: ': ' },
  { text: '"instant"', cls: 's' },
  { text: '\n}' },
];

type Phase = 'typing' | 'formatting' | 'holding';

export default function HeroDemo() {
  const [phase, setPhase] = useState<Phase>('typing');
  const [typedChars, setTypedChars] = useState(0);

  useEffect(() => {
    let raf: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (typedChars < RAW.length) {
        raf = setTimeout(() => setTypedChars((c) => c + 1), 18);
      } else {
        raf = setTimeout(() => setPhase('formatting'), 450);
      }
    } else if (phase === 'formatting') {
      raf = setTimeout(() => setPhase('holding'), 500);
    } else if (phase === 'holding') {
      raf = setTimeout(() => {
        setTypedChars(0);
        setPhase('typing');
      }, 2600);
    }

    return () => clearTimeout(raf);
  }, [phase, typedChars]);

  return (
    <div className="demo-panel">
      <div className="demo-panel-bar">
        <span className="demo-dot" />
        <span className="demo-dot" />
        <span className="demo-dot" />
        <span className="demo-label">json-formatter.tsx</span>
      </div>
      <div className="demo-body">
        {phase === 'typing' ? (
          <>
            <span className="p">{RAW.slice(0, typedChars)}</span>
            <span style={{ opacity: 0.5 }}>|</span>
          </>
        ) : (
          <span
            style={{
              display: 'inline-block',
              transition: 'opacity 0.25s ease',
              opacity: phase === 'formatting' ? 0.3 : 1,
            }}
          >
            {FORMATTED.map((chunk, i) => (
              <span key={i} className={chunk.cls}>
                {chunk.text}
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
