'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const SAMPLE = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sample page</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; }
    .card { border: 1px solid #ccc; border-radius: 8px; padding: 16px; max-width: 360px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello!</h1>
    <p>Resize the preview to check how this looks on tablet or mobile.</p>
    <button id="btn">Click me</button>
  </div>
  <script>
    console.log('Page loaded');
    document.getElementById('btn').addEventListener('click', function () {
      console.log('Button clicked at', new Date().toISOString());
    });
  </script>
</body>
</html>
`;

type ViewMode = 'preview' | 'source';
type Viewport = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

const CONSOLE_MESSAGE_SOURCE = 'formatiq-html-viewer';

const CONSOLE_SHIM = `<script>
(function () {
  function serialize(arg) {
    try {
      if (typeof arg === 'string') return arg;
      return JSON.stringify(arg, null, 2);
    } catch (e) {
      return String(arg);
    }
  }
  ['log', 'warn', 'error', 'info'].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      var args = Array.prototype.slice.call(arguments).map(serialize);
      try {
        window.parent.postMessage({ source: '${CONSOLE_MESSAGE_SOURCE}', level: level, args: args }, '*');
      } catch (e) {}
      original.apply(console, arguments);
    };
  });
  window.addEventListener('error', function (e) {
    window.parent.postMessage(
      { source: '${CONSOLE_MESSAGE_SOURCE}', level: 'error', args: [e.message + ' (line ' + e.lineno + ')'] },
      '*'
    );
  });
  window.addEventListener('unhandledrejection', function (e) {
    window.parent.postMessage(
      { source: '${CONSOLE_MESSAGE_SOURCE}', level: 'error', args: ['Unhandled promise rejection: ' + e.reason] },
      '*'
    );
  });
})();
</script>`;

function injectConsoleShim(html: string): string {
  const headMatch = html.match(/<head[^>]*>/i);
  if (headMatch && headMatch.index !== undefined) {
    const insertAt = headMatch.index + headMatch[0].length;
    return html.slice(0, insertAt) + CONSOLE_SHIM + html.slice(insertAt);
  }
  const htmlMatch = html.match(/<html[^>]*>/i);
  if (htmlMatch && htmlMatch.index !== undefined) {
    const insertAt = htmlMatch.index + htmlMatch[0].length;
    return html.slice(0, insertAt) + CONSOLE_SHIM + html.slice(insertAt);
  }
  return CONSOLE_SHIM + html;
}

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function lintHtml(html: string): string[] {
  const warnings: string[] = [];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g;
  const stack: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(html))) {
    const full = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = full.startsWith('</');
    const isSelfClosing = full.endsWith('/>') || VOID_ELEMENTS.has(tagName);

    if (isClosing) {
      if (stack.length === 0) {
        warnings.push(`Unexpected closing tag </${tagName}> with no matching open tag.`);
      } else if (stack[stack.length - 1] !== tagName) {
        warnings.push(`Mismatched tag: expected </${stack[stack.length - 1]}> but found </${tagName}>.`);
        const idx = stack.lastIndexOf(tagName);
        if (idx !== -1) stack.length = idx;
        else stack.pop();
      } else {
        stack.pop();
      }
    } else if (!isSelfClosing) {
      stack.push(tagName);
    }
  }

  stack
    .slice()
    .reverse()
    .forEach((tag) => warnings.push(`Unclosed tag: <${tag}> was never closed.`));

  const idRegex = /\sid=["']([^"']+)["']/g;
  const idCounts = new Map<string, number>();
  let idMatch: RegExpExecArray | null;
  while ((idMatch = idRegex.exec(html))) {
    const id = idMatch[1];
    idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
  }
  idCounts.forEach((count, id) => {
    if (count > 1) warnings.push(`Duplicate id "${id}" used ${count} times.`);
  });

  return warnings;
}

interface Token {
  text: string;
  cls?: string;
}

function tokenizeTag(tag: string): Token[] {
  const tokens: Token[] = [];
  const isClosingBracket = tag.endsWith('/>');
  const openMatch = tag.match(/^<\/?[a-zA-Z][a-zA-Z0-9-]*/);
  let cursor = 0;

  if (openMatch) {
    tokens.push({ text: openMatch[0], cls: 'html-tag' });
    cursor = openMatch[0].length;
  }

  const bracketLen = isClosingBracket ? 2 : 1;
  const rest = tag.slice(cursor, tag.length - bracketLen);
  const closingBracket = tag.slice(tag.length - bracketLen);

  const attrRegex = /([a-zA-Z_:][a-zA-Z0-9_:.-]*)(=)("[^"]*"|'[^']*')?/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(rest))) {
    if (m.index > lastIndex) tokens.push({ text: rest.slice(lastIndex, m.index) });
    tokens.push({ text: m[1], cls: 'html-attr' });
    if (m[2]) tokens.push({ text: m[2] });
    if (m[3]) tokens.push({ text: m[3], cls: 'html-string' });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < rest.length) tokens.push({ text: rest.slice(lastIndex) });

  tokens.push({ text: closingBracket, cls: 'html-tag' });
  return tokens;
}

function tokenizeHtml(html: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = html.length;

  while (i < n) {
    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i);
      const stop = end === -1 ? n : end + 3;
      tokens.push({ text: html.slice(i, stop), cls: 'html-comment' });
      i = stop;
      continue;
    }

    if (html[i] === '<') {
      const end = html.indexOf('>', i);
      const stop = end === -1 ? n : end + 1;
      tokens.push(...tokenizeTag(html.slice(i, stop)));
      i = stop;
      continue;
    }

    const nextLt = html.indexOf('<', i);
    const stop = nextLt === -1 ? n : nextLt;
    if (stop > i) tokens.push({ text: html.slice(i, stop) });
    i = stop;
  }

  return tokens;
}

interface ConsoleEntry {
  level: 'log' | 'warn' | 'error' | 'info';
  text: string;
}

export default function HtmlViewer() {
  const [input, setInput] = useState(SAMPLE);
  const [debounced, setDebounced] = useState(SAMPLE);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [fullscreen, setFullscreen] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(input), 300);
    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    setConsoleEntries([]);
  }, [debounced]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      if (!event.data || event.data.source !== CONSOLE_MESSAGE_SOURCE) return;
      setConsoleEntries((prev) => [...prev.slice(-49), { level: event.data.level, text: event.data.args.join(' ') }]);
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const srcDoc = useMemo(() => injectConsoleShim(debounced), [debounced]);
  const warnings = useMemo(() => lintHtml(debounced), [debounced]);
  const highlighted = useMemo(() => tokenizeHtml(debounced), [debounced]);

  function downloadHtml() {
    const blob = new Blob([input], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'page.html';
    link.click();
    URL.revokeObjectURL(url);
  }

  function copyDataUri() {
    navigator.clipboard.writeText(`data:text/html;charset=utf-8,${encodeURIComponent(input)}`);
  }

  if (fullscreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="control-row" style={{ padding: 12, marginBottom: 0, borderBottom: '1px solid var(--border)' }}>
          <button className="icon-btn" onClick={() => setFullscreen(false)}>
            Exit fullscreen
          </button>
        </div>
        <iframe
          ref={iframeRef}
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          style={{ flex: 1, width: '100%', border: 'none', background: '#fff' }}
          title="HTML preview (fullscreen)"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button
          className={`icon-btn${viewMode === 'preview' ? ' is-active' : ''}`}
          onClick={() => setViewMode('preview')}
        >
          Preview
        </button>
        <button
          className={`icon-btn${viewMode === 'source' ? ' is-active' : ''}`}
          onClick={() => setViewMode('source')}
        >
          Formatted source
        </button>
      </div>

      {viewMode === 'preview' && (
        <div className="control-row">
          {(['desktop', 'tablet', 'mobile'] as Viewport[]).map((v) => (
            <button
              key={v}
              className={`icon-btn${viewport === v ? ' is-active' : ''}`}
              onClick={() => setViewport(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
          <button className="icon-btn" onClick={() => setFullscreen(true)}>
            Fullscreen
          </button>
          <button className="icon-btn" onClick={downloadHtml}>
            Download as .html
          </button>
          <button className="icon-btn" onClick={copyDataUri}>
            Copy as data URI
          </button>
        </div>
      )}

      {warnings.length > 0 && (
        <div
          className="status-line status-invalid"
          style={{
            border: '1px solid var(--accent-dim)',
            borderRadius: 6,
            padding: '8px 12px',
            marginBottom: 12,
          }}
        >
          ⚠ {warnings.length} issue{warnings.length === 1 ? '' : 's'} found (preview still renders below):
          <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>HTML source</span>
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
            placeholder="Paste HTML here..."
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>{viewMode === 'preview' ? `Preview (${viewport})` : 'Formatted source'}</span>
          </div>
          {viewMode === 'preview' ? (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', background: 'var(--surface)', overflow: 'auto' }}>
              <iframe
                ref={iframeRef}
                srcDoc={srcDoc}
                sandbox="allow-scripts"
                style={{
                  width: VIEWPORT_WIDTHS[viewport],
                  minHeight: 260,
                  border: viewport === 'desktop' ? 'none' : '1px solid var(--border)',
                  background: '#fff',
                }}
                title="HTML preview"
              />
            </div>
          ) : (
            <div className="output mono" style={{ whiteSpace: 'pre-wrap' }}>
              {highlighted.map((token, i) => (
                <span key={i} className={token.cls}>
                  {token.text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>Console output ({consoleEntries.length})</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setConsoleEntries([])}>
              Clear
            </button>
            <button className="icon-btn" onClick={() => setConsoleOpen((v) => !v)}>
              {consoleOpen ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
        {consoleOpen && (
          <div className="output mono" style={{ minHeight: 'auto', maxHeight: 200, overflowY: 'auto' }}>
            {consoleEntries.length === 0
              ? '// console.log/warn/error output from the preview will appear here'
              : consoleEntries.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      color:
                        entry.level === 'error'
                          ? 'var(--invalid)'
                          : entry.level === 'warn'
                          ? 'var(--accent)'
                          : 'var(--text-primary)',
                    }}
                  >
                    [{entry.level}] {entry.text}
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}
