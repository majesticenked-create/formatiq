'use client';

import { useMemo, useState } from 'react';
import { format as formatSql } from 'sql-formatter';

const SAMPLE =
  'select u.id, u.name, o.total from users u join orders o on o.user_id = u.id where o.total > 100 and u.active = true order by o.total desc';

const DIALECTS = [
  { value: 'sql', label: 'Standard SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'transactsql', label: 'T-SQL (SQL Server)' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'plsql', label: 'PL/SQL (Oracle)' },
] as const;

type Dialect = (typeof DIALECTS)[number]['value'];

function tryFormat(input: string, dialect: Dialect) {
  if (!input.trim()) {
    return { ok: false as const, message: 'Paste a SQL statement to format.' };
  }
  try {
    const output = formatSql(input, { language: dialect, keywordCase: 'upper' });
    return { ok: true as const, output };
  } catch (err) {
    return { ok: false as const, message: err instanceof Error ? err.message : 'Could not format this SQL.' };
  }
}

export default function SqlFormatter() {
  const [input, setInput] = useState(SAMPLE);
  const [dialect, setDialect] = useState<Dialect>('sql');

  const result = useMemo(() => tryFormat(input, dialect), [input, dialect]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.output);
  }

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Dialect:
        </label>
        <select
          className="icon-btn"
          value={dialect}
          onChange={(e) => setDialect(e.target.value as Dialect)}
          style={{ paddingRight: 8 }}
        >
          {DIALECTS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
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
          <div className="output mono">{result.ok ? result.output : '-- Fix the errors on the left to see formatted output'}</div>
          <div className="status-line status-neutral">
            {result.ok ? `${result.output.split('\n').length} lines` : ' '}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Formats SQL using the <code>sql-formatter</code> package - a purpose-built parser that understands SQL
        clause structure across several real dialects, rather than regex keyword-matching. Pick a dialect above to
        match the SQL flavor you&apos;re working with. Runs entirely client-side; nothing you paste is uploaded.
      </div>
    </div>
  );
}
