'use client';

import { useMemo, useState } from 'react';

const SAMPLE =
  'select u.id, u.name, o.total from users u join orders o on o.user_id = u.id where o.total > 100 and u.active = true order by o.total desc';

const MAJOR_CLAUSES = [
  'SELECT',
  'FROM',
  'WHERE',
  'GROUP BY',
  'ORDER BY',
  'HAVING',
  'LIMIT',
  'INSERT INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE FROM',
  'UNION ALL',
  'UNION',
];

const JOIN_CLAUSES = ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'JOIN'];

const KEYWORDS = [
  ...MAJOR_CLAUSES,
  ...JOIN_CLAUSES,
  'ON',
  'AND',
  'OR',
  'NOT',
  'IN',
  'IS',
  'NULL',
  'AS',
  'DISTINCT',
  'BETWEEN',
  'LIKE',
  'DESC',
  'ASC',
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
];

function capitalizeKeywords(sql: string): string {
  let result = sql;
  const sortedKeywords = [...KEYWORDS].sort((a, b) => b.length - a.length);
  for (const kw of sortedKeywords) {
    const pattern = new RegExp(`\\b${kw.replace(/ /g, '\\s+')}\\b`, 'gi');
    result = result.replace(pattern, kw);
  }
  return result;
}

function addLineBreaks(sql: string): string {
  let result = sql;

  for (const clause of MAJOR_CLAUSES) {
    const pattern = new RegExp(`\\s*\\b${clause.replace(/ /g, '\\s+')}\\b`, 'g');
    result = result.replace(pattern, `\n${clause}`);
  }
  for (const clause of JOIN_CLAUSES) {
    const pattern = new RegExp(`\\s*\\b${clause.replace(/ /g, '\\s+')}\\b`, 'g');
    result = result.replace(pattern, `\n  ${clause}`);
  }

  result = result.replace(/\s+\bAND\b/g, '\n  AND');
  result = result.replace(/\s+\bOR\b/g, '\n  OR');
  result = result.replace(/,\s*/g, ',\n  ');

  return result
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

function formatSql(input: string): string {
  const capitalized = capitalizeKeywords(input.trim().replace(/\s+/g, ' '));
  return addLineBreaks(capitalized);
}

function tryFormat(input: string) {
  if (!input.trim()) {
    return { ok: false as const, message: 'Paste a SQL statement to format.' };
  }
  return { ok: true as const, output: formatSql(input) };
}

export default function SqlFormatter() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => tryFormat(input), [input]);

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
            placeholder="Paste SQL here..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Formatted' : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Formatted output</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono">{result.ok ? result.output : '// Fix the errors on the left to see formatted output'}</div>
          <div className="status-line status-neutral">
            {result.ok ? `${result.output.split('\n').length} lines` : ' '}
          </div>
        </div>
      </div>
    </div>
  );
}
