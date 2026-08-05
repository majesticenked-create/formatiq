'use client';

import { useMemo, useState } from 'react';

const SAMPLE = 'https://formatiq.com:8080/tools/validators?ref=home#section-2';

function tryValidate(input: string) {
  const value = input.trim();

  if (!value) {
    return { ok: false as const, message: 'Enter a URL.' };
  }

  try {
    const url = new URL(value);
    return {
      ok: true as const,
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port || '(default)',
      pathname: url.pathname || '/',
      search: url.search || '(none)',
      hash: url.hash || '(none)',
    };
  } catch {
    return {
      ok: false as const,
      message: value.includes('://')
        ? 'Not a valid URL — check the characters after the protocol.'
        : 'Missing a protocol — URLs need a scheme like "https://" at the start.',
    };
  }
}

export default function UrlValidator() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => tryValidate(input), [input]);

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
            <span>URL</span>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Enter a URL..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ Valid URL' : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Parsed components</span>
          </div>
          <div className="output mono">
            {result.ok
              ? [
                  `Protocol:  ${result.protocol}`,
                  `Host:      ${result.host}`,
                  `Hostname:  ${result.hostname}`,
                  `Port:      ${result.port}`,
                  `Path:      ${result.pathname}`,
                  `Query:     ${result.search}`,
                  `Fragment:  ${result.hash}`,
                ].join('\n')
              : '// Fix the errors on the left to see parsed components'}
          </div>
          <div className="status-line status-neutral">{' '}</div>
        </div>
      </div>
    </div>
  );
}
