'use client';

import { useMemo, useState } from 'react';

type Platform = 'apache' | 'nginx' | 'php';

const SAMPLE_SOURCE = '/old-page';
const SAMPLE_DEST = 'https://example.com/new-page';

/** Escapes a string for safe interpolation inside a PHP double-quoted string literal. */
function escapePhpDoubleQuoted(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$');
}

interface ValidationResult {
  ok: boolean;
  message: string;
}

function validateInputs(source: string, dest: string): ValidationResult {
  if (!source.trim()) return { ok: false, message: 'Enter a source path, e.g. /old-page.' };
  if (!dest.trim()) return { ok: false, message: 'Enter a destination URL, e.g. https://example.com/new-page.' };
  if (!source.startsWith('/')) return { ok: false, message: 'Source path must start with a forward slash, e.g. /old-page.' };
  if (/\s/.test(source)) return { ok: false, message: 'Source path cannot contain whitespace.' };
  if (/\s/.test(dest)) return { ok: false, message: 'Destination URL cannot contain whitespace.' };
  return { ok: true, message: '' };
}

function buildApache(source: string, dest: string): string {
  return `Redirect 301 ${source} ${dest}`;
}

function buildNginx(source: string, dest: string): string {
  return `location = ${source} {\n    return 301 ${dest};\n}`;
}

function buildPhp(source: string, dest: string): string {
  const safeDest = escapePhpDoubleQuoted(dest);
  return `<?php\n// Redirect for ${source}\nheader("Location: ${safeDest}", true, 301);\nexit;`;
}

const PLATFORM_LABELS: Record<Platform, string> = {
  apache: 'Apache (.htaccess)',
  nginx: 'Nginx (server block)',
  php: 'PHP',
};

export default function RedirectCodeGenerator() {
  const [source, setSource] = useState(SAMPLE_SOURCE);
  const [dest, setDest] = useState(SAMPLE_DEST);
  const [platform, setPlatform] = useState<Platform>('apache');
  const [copied, setCopied] = useState(false);

  const validation = useMemo(() => validateInputs(source, dest), [source, dest]);

  const snippet = useMemo(() => {
    if (!validation.ok) return '';
    if (platform === 'apache') return buildApache(source, dest);
    if (platform === 'nginx') return buildNginx(source, dest);
    return buildPhp(source, dest);
  }, [validation.ok, platform, source, dest]);

  function copy() {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="control-row">
        <input
          className="mono"
          style={{ flex: 1 }}
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="/old-page"
          spellCheck={false}
        />
        <input
          className="mono"
          style={{ flex: 1 }}
          value={dest}
          onChange={(e) => setDest(e.target.value)}
          placeholder="https://example.com/new-page"
          spellCheck={false}
        />
      </div>

      <div className="control-row">
        {(Object.keys(PLATFORM_LABELS) as Platform[]).map((p) => (
          <button
            key={p}
            className={`icon-btn ${platform === p ? 'is-active' : ''}`}
            onClick={() => setPlatform(p)}
          >
            {PLATFORM_LABELS[p]}
          </button>
        ))}
      </div>

      <div className={`status-line ${validation.ok ? 'status-valid' : 'status-invalid'}`}>
        {validation.ok ? '✓ Snippet generated below' : `✗ ${validation.message}`}
      </div>

      {snippet && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>{PLATFORM_LABELS[platform]} - 301 redirect snippet</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <pre className="output mono" style={{ whiteSpace: 'pre-wrap' }}>
            {snippet}
          </pre>
        </div>
      )}

      <div className="status-line status-neutral" style={{ marginTop: 8 }}>
        These are real HTTP 301 (permanent redirect) responses generated server-side. This tool does not generate
        client-side redirects (meta refresh or JavaScript window.location) since those are a fundamentally
        different mechanism and are not real HTTP 301s.
      </div>
    </div>
  );
}
