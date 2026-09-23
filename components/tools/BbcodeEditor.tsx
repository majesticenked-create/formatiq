'use client';

import { useMemo, useState } from 'react';

const SAMPLE = `[b]Welcome[/b] to the forum!
[i]This is italic[/i], and [u]this is underlined[/u].
Visit [url=https://example.com]our site[/url] for more.
[color=red]Important:[/color] please read the [b]rules[/b].
[quote]Someone else said this.[/quote]
[code]const x = 1;[/code]
[list]
[*] First item
[*] Second item
[/list]`;

const ALLOWED_COLORS = new Set([
  'red',
  'blue',
  'green',
  'yellow',
  'orange',
  'purple',
  'black',
  'white',
  'gray',
  'grey',
  'pink',
  'brown',
  'cyan',
  'magenta',
  'navy',
  'teal',
  'lime',
  'maroon',
  'silver',
  'gold',
]);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isSafeHttpUrl(raw: string): boolean {
  const url = raw.trim();
  // Reject anything that isn't plain http(s) - blocks javascript:, data:,
  // vbscript:, and any other scheme that could execute in the browser.
  return /^https?:\/\/[^\s"'<>]+$/i.test(url);
}

/**
 * Converts BBCode to a small, fixed set of safe HTML tags. The input is fully
 * HTML-entity-escaped FIRST, so any raw HTML (e.g. a literal <script> tag
 * typed by the user) is neutralized into inert text before any BBCode tag
 * substitution ever runs. Only our own explicit replacements below can
 * introduce real HTML tags into the output, and every attribute value they
 * emit (href, src, color) is itself validated or escaped.
 */
function bbcodeToSafeHtml(raw: string): string {
  let text = escapeHtml(raw);

  // Simple non-nesting-sensitive tags: replace paired [tag]...[/tag].
  const simple: [RegExp, string, string][] = [
    [/\[b\]([\s\S]*?)\[\/b\]/gi, '<b>', '</b>'],
    [/\[i\]([\s\S]*?)\[\/i\]/gi, '<i>', '</i>'],
    [/\[u\]([\s\S]*?)\[\/u\]/gi, '<u>', '</u>'],
    [/\[s\]([\s\S]*?)\[\/s\]/gi, '<s>', '</s>'],
    [/\[quote\]([\s\S]*?)\[\/quote\]/gi, '<blockquote>', '</blockquote>'],
    [/\[code\]([\s\S]*?)\[\/code\]/gi, '<code>', '</code>'],
  ];
  for (const [pattern, open, close] of simple) {
    text = text.replace(pattern, (_m, inner: string) => `${open}${inner}${close}`);
  }

  // [url]plain[/url] and [url=href]label[/url] - href validated as http(s) only.
  text = text.replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, (_m, href: string, label: string) => {
    const decoded = href.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    if (!isSafeHttpUrl(decoded)) return escapeHtml(label);
    return `<a href="${escapeHtml(decoded)}" target="_blank" rel="noopener noreferrer nofollow">${label}</a>`;
  });
  text = text.replace(/\[url\]([\s\S]*?)\[\/url\]/gi, (_m, href: string) => {
    const decoded = href.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    if (!isSafeHttpUrl(decoded)) return escapeHtml(href);
    return `<a href="${escapeHtml(decoded)}" target="_blank" rel="noopener noreferrer nofollow">${escapeHtml(decoded)}</a>`;
  });

  // [img]http://...[/img] - src validated as http(s) only.
  text = text.replace(/\[img\]([\s\S]*?)\[\/img\]/gi, (_m, src: string) => {
    const decoded = src.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    if (!isSafeHttpUrl(decoded)) return escapeHtml(src);
    return `<img src="${escapeHtml(decoded)}" alt="" style="max-width:100%" />`;
  });

  // [color=name]...[/color] - only an allowlisted CSS color keyword is honored.
  text = text.replace(/\[color=([a-zA-Z]+)\]([\s\S]*?)\[\/color\]/gi, (_m, color: string, inner: string) => {
    const safeColor = ALLOWED_COLORS.has(color.toLowerCase()) ? color.toLowerCase() : null;
    return safeColor ? `<span style="color:${safeColor}">${inner}</span>` : inner;
  });

  // [size=NN]...[/size] - only a plain integer 8-36 is honored, as a px value.
  text = text.replace(/\[size=(\d{1,2})\]([\s\S]*?)\[\/size\]/gi, (_m, size: string, inner: string) => {
    const n = Math.min(36, Math.max(8, Number(size)));
    return `<span style="font-size:${n}px">${inner}</span>`;
  });

  // [list]...[/list] with [*] items.
  text = text.replace(/\[list\]([\s\S]*?)\[\/list\]/gi, (_m, inner: string) => {
    const items = inner
      .split(/\[\*\]/i)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => `<li>${s}</li>`)
      .join('');
    return `<ul>${items}</ul>`;
  });

  // Remaining newlines become line breaks.
  text = text.replace(/\n/g, '<br />');

  return text;
}

export default function BbcodeEditor() {
  const [input, setInput] = useState(SAMPLE);

  const html = useMemo(() => bbcodeToSafeHtml(input), [input]);

  function insertTag(open: string, close: string) {
    setInput((prev) => `${prev}${open}text${close}`);
  }

  function copyHtml() {
    navigator.clipboard.writeText(html);
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => insertTag('[b]', '[/b]')}>
          Bold
        </button>
        <button className="icon-btn" onClick={() => insertTag('[i]', '[/i]')}>
          Italic
        </button>
        <button className="icon-btn" onClick={() => insertTag('[u]', '[/u]')}>
          Underline
        </button>
        <button className="icon-btn" onClick={() => insertTag('[url=https://example.com]', '[/url]')}>
          Link
        </button>
        <button className="icon-btn" onClick={() => insertTag('[color=red]', '[/color]')}>
          Color
        </button>
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
            <span>BBCode input</span>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Type BBCode here, e.g. [b]bold[/b]..."
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Rendered preview</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyHtml}>
                Copy HTML
              </button>
            </div>
          </div>
          <div className="output" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Supported tags: <code className="mono">[b] [i] [u] [s] [url] [img] [quote] [code] [list]/[*] [color] [size]</code>.
        All other text is HTML-escaped before any tag is applied, links and images are restricted to plain http(s)
        URLs, and colors are restricted to a fixed allowlist - so pasted HTML like a <code className="mono">&lt;script&gt;</code>{' '}
        tag is rendered as harmless text, never executed.
      </div>
    </div>
  );
}
