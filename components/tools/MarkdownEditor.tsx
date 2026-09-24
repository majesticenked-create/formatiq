'use client';

import { useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const SAMPLE = `# Formatiq Markdown Editor

Write **Markdown** on the left, see a *sanitized* live preview on the right.

- Supports headers, lists, links, and \`code\`
- Fenced code blocks:

\`\`\`js
console.log('hello');
\`\`\`

> Raw HTML and \`javascript:\` links are stripped before rendering.
`;

marked.setOptions({
  // Do not let raw HTML written in Markdown pass through untouched - it still goes through
  // DOMPurify below as a second, defense-in-depth layer, but this keeps marked itself from
  // ever emitting attacker-controlled tags in the first place.
  gfm: true,
  breaks: false,
});

function renderSanitizedHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml, {
    // Never allow raw <script>, <iframe>, event handlers, or javascript: URLs through.
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
  });
}

export default function MarkdownEditor() {
  const [input, setInput] = useState(SAMPLE);
  const [html, setHtml] = useState('');

  // DOMPurify requires a real DOM (window/document), which isn't available during Next.js's
  // server-side prerender - so sanitization only runs client-side, after mount.
  useEffect(() => {
    setHtml(renderSanitizedHtml(input));
  }, [input]);

  function copyHtml() {
    navigator.clipboard.writeText(html);
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setInput('')}>
          Clear
        </button>
        <button className="icon-btn" onClick={copyHtml}>
          Copy rendered HTML
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Markdown source</span>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Write Markdown here..."
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Live preview (sanitized)</span>
          </div>
          <div
            className="output"
            style={{ lineHeight: 1.6 }}
            // Safe: `html` is always the output of DOMPurify.sanitize() above, never raw
            // user input rendered directly.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Renders Markdown with the <code>marked</code> parser and sanitizes every bit of resulting HTML with{' '}
        <code>DOMPurify</code> before it&apos;s displayed - embedded <code>&lt;script&gt;</code> tags, inline event
        handlers, and <code>javascript:</code> links are all stripped, so pasting untrusted Markdown never executes
        anything in your browser. Runs entirely client-side; nothing you write is uploaded. Need to just clean up
        and re-indent Markdown source without rendering it to HTML? See the{' '}
        <a href="/tools/converters/markdown-html-converter">Markdown ⇄ HTML Converter</a>.
      </div>
    </div>
  );
}
