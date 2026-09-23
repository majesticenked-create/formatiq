'use client';

import { useMemo, useState } from 'react';
import { fleschKincaidGradeLevel } from '@/lib/tools/readability-utils';

export default function FleschKincaidCalculator() {
  const [input, setInput] = useState('');

  const result = useMemo(() => fleschKincaidGradeLevel(input), [input]);

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
            placeholder="Paste or type text to analyze..."
            style={{ minHeight: 220 }}
          />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>Flesch-Kincaid Grade Level (estimate)</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Grade level: ${result.gradeLevel.toFixed(1)}`,
                `Words: ${result.wordCount}`,
                `Sentences: ${result.sentenceCount}`,
                `Syllables (estimated): ${result.syllableCount}`,
                '',
                'Formula: 0.39 × (words/sentences) + 11.8 × (syllables/words) − 15.59',
                'Syllable counts are a vowel-group estimate, not a dictionary lookup.',
              ].join('\n')
            : '// Enter text above to see its estimated grade level'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
