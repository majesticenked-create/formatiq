'use client';

import { useMemo, useState } from 'react';
import { parse, print, GraphQLError } from 'graphql';

const SAMPLE = `query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts(first: 5) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
}`;

function tryFormat(input: string) {
  if (!input.trim()) {
    return { ok: false as const, message: 'Paste a GraphQL query, mutation, or schema to format.' };
  }

  try {
    const ast = parse(input);
    return { ok: true as const, output: print(ast) };
  } catch (err) {
    if (err instanceof GraphQLError) {
      const loc = err.locations?.[0];
      const where = loc ? ` (line ${loc.line}, column ${loc.column})` : '';
      return { ok: false as const, message: `${err.message}${where}` };
    }
    return { ok: false as const, message: err instanceof Error ? err.message : 'Could not parse this GraphQL document.' };
  }
}

export default function GraphqlFormatter() {
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
            placeholder="Paste a GraphQL query, mutation, or schema here..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Valid GraphQL - formatted' : `✗ ${result.message}`}
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

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Formatting is done entirely in your browser by parsing the document into an AST with the{' '}
        <code>graphql</code> reference library and printing it back out - nothing is sent to any GraphQL endpoint, and
        no query is ever executed. Need to format the JSON response instead? Try the{' '}
        <a href="/tools/formatters/json-formatter">JSON Formatter</a>.
      </div>
    </div>
  );
}
