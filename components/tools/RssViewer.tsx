'use client';

import { useMemo, useState } from 'react';
import DOMPurify from 'dompurify';

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Formatiq Blog</title>
    <link>https://formatiq.tools</link>
    <description>Updates from the Formatiq tools blog.</description>
    <item>
      <title>New batch of formatters shipped</title>
      <link>https://formatiq.tools/blog/batch-010</link>
      <description>We added <b>ten</b> new tools, including an RSS viewer. &lt;script&gt;alert(1)&lt;/script&gt;</description>
      <pubDate>Wed, 24 Sep 2026 12:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Formatting tips for messy JSON</title>
      <link>https://formatiq.tools/blog/json-tips</link>
      <description>A quick guide to cleaning up nested JSON payloads.</description>
      <pubDate>Mon, 15 Sep 2026 09:30:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

interface ParsedFeed {
  title: string;
  link: string;
  description: string;
  items: RssItem[];
}

type Result = { ok: true; feed: ParsedFeed } | { ok: false; message: string };

function textOf(el: Element | null, tag: string): string {
  if (!el) return '';
  // Only look at direct children so an <item><title> doesn't get confused with <channel><title>.
  const child = Array.from(el.children).find((c) => c.tagName.toLowerCase() === tag);
  return child?.textContent?.trim() ?? '';
}

function parseFeed(input: string): Result {
  if (typeof window === 'undefined') {
    return { ok: false, message: 'Loading...' };
  }
  if (!input.trim()) {
    return { ok: false, message: 'Paste an RSS 2.0 feed to parse.' };
  }

  // DOMParser is the browser's built-in XML parser - it does not fetch or resolve external
  // entities/DTDs, and no user-supplied URL is ever requested by this tool. Input is pasted
  // XML text only.
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    return { ok: false, message: errorNode.textContent?.trim() ?? 'Invalid XML.' };
  }

  const channel = doc.querySelector('rss > channel') ?? doc.querySelector('channel');
  if (!channel) {
    return { ok: false, message: 'No <rss><channel> element found - this doesn’t look like an RSS 2.0 feed.' };
  }

  const items: RssItem[] = Array.from(channel.children)
    .filter((c) => c.tagName.toLowerCase() === 'item')
    .map((item) => ({
      title: textOf(item, 'title'),
      link: textOf(item, 'link'),
      description: textOf(item, 'description'),
      pubDate: textOf(item, 'pubdate') || textOf(item, 'pubDate'),
    }));

  return {
    ok: true,
    feed: {
      title: textOf(channel, 'title'),
      link: textOf(channel, 'link'),
      description: textOf(channel, 'description'),
      items,
    },
  };
}

// Item <description> fields may contain embedded HTML per the RSS spec. It is sanitized with
// the same DOMPurify dependency already used by the Markdown Editor before ever being rendered
// - raw description text is never dropped into the DOM unsanitized.
function sanitizeDescription(html: string): string {
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
  });
}

export default function RssViewer() {
  const [input, setInput] = useState(SAMPLE);
  const [view, setView] = useState<'parsed' | 'json'>('parsed');

  const result = useMemo(() => parseFeed(input), [input]);

  const jsonOutput = useMemo(() => {
    if (!result.ok) return '';
    return JSON.stringify(result.feed, null, 2);
  }, [result]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(view === 'json' ? jsonOutput : result.feed.title);
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
        <button
          className={`icon-btn${view === 'parsed' ? ' is-active' : ''}`}
          onClick={() => setView('parsed')}
        >
          Parsed view
        </button>
        <button className={`icon-btn${view === 'json' ? ' is-active' : ''}`} onClick={() => setView('json')}>
          JSON view
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>RSS 2.0 input</span>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste RSS 2.0 XML here..."
          />
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? `✓ Parsed - ${result.feed.items.length} item(s)` : `✗ ${result.message}`}
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>{view === 'json' ? 'JSON representation' : 'Channel & items'}</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput} disabled={!result.ok}>
                Copy
              </button>
            </div>
          </div>
          {!result.ok ? (
            <div className="output mono">Fix the errors on the left to see the parsed feed</div>
          ) : view === 'json' ? (
            <div className="output mono">{jsonOutput}</div>
          ) : (
            <div className="output" style={{ lineHeight: 1.6 }}>
              <h3 style={{ marginTop: 0 }}>{result.feed.title || '(untitled feed)'}</h3>
              {result.feed.link && (
                <p style={{ fontSize: 13 }}>
                  <a href={result.feed.link} rel="noreferrer">
                    {result.feed.link}
                  </a>
                </p>
              )}
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{result.feed.description}</p>
              <hr />
              {result.feed.items.map((item, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <strong>{item.title || '(untitled item)'}</strong>
                  {item.pubDate && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.pubDate}</div>
                  )}
                  <div
                    style={{ fontSize: 13 }}
                    // Safe: sanitizeDescription() always runs DOMPurify before this reaches the DOM.
                    dangerouslySetInnerHTML={{ __html: sanitizeDescription(item.description) }}
                  />
                  {item.link && (
                    <a href={item.link} rel="noreferrer" style={{ fontSize: 12 }}>
                      {item.link}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Parses pasted RSS 2.0 XML with the browser&apos;s built-in <code>DOMParser</code> (the same real XML parser used
        by the <a href="/tools/formatters/xml-formatter">XML Formatter</a>), not regex tag-matching - it reads the
        actual <code>&lt;rss&gt;&lt;channel&gt;</code> structure. <code>DOMParser</code> never resolves external
        entities or DTDs, and this tool never fetches a feed URL for you - only pasted XML is parsed. Any HTML
        embedded in an item&apos;s <code>&lt;description&gt;</code> is sanitized with <code>DOMPurify</code> before
        rendering, exactly like the <a href="/tools/formatters/markdown-editor">Markdown Editor</a>.
      </div>
    </div>
  );
}
