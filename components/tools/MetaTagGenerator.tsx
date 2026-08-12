'use client';

import { useMemo, useState } from 'react';

interface FormState {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  siteName: string;
  twitterHandle: string;
}

const SAMPLE: FormState = {
  title: 'Formatiq - Free Browser-Based Developer Tools',
  description: 'Free formatters, converters, validators, and generators for developers. Everything runs in your browser.',
  url: 'https://formatiq.tools',
  imageUrl: 'https://formatiq.tools/og-image.png',
  siteName: 'Formatiq',
  twitterHandle: '@formatiq',
};

function escapeHtmlAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function normalizeHandle(handle: string): string {
  const trimmed = handle.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function buildHtml(form: FormState): string {
  const title = escapeHtmlAttr(form.title);
  const description = escapeHtmlAttr(form.description);
  const url = escapeHtmlAttr(form.url);
  const image = escapeHtmlAttr(form.imageUrl);
  const siteName = escapeHtmlAttr(form.siteName);
  const handle = escapeHtmlAttr(normalizeHandle(form.twitterHandle));

  const lines = [`<title>${title}</title>`, `<meta name="description" content="${description}" />`, ''];

  lines.push('<!-- Open Graph -->');
  lines.push(`<meta property="og:title" content="${title}" />`);
  lines.push(`<meta property="og:description" content="${description}" />`);
  lines.push('<meta property="og:type" content="website" />');
  if (form.url) lines.push(`<meta property="og:url" content="${url}" />`);
  if (form.imageUrl) lines.push(`<meta property="og:image" content="${image}" />`);
  if (form.siteName) lines.push(`<meta property="og:site_name" content="${siteName}" />`);
  lines.push('');

  lines.push('<!-- Twitter Card -->');
  lines.push(`<meta name="twitter:card" content="${form.imageUrl ? 'summary_large_image' : 'summary'}" />`);
  lines.push(`<meta name="twitter:title" content="${title}" />`);
  lines.push(`<meta name="twitter:description" content="${description}" />`);
  if (form.imageUrl) lines.push(`<meta name="twitter:image" content="${image}" />`);
  if (form.twitterHandle) lines.push(`<meta name="twitter:site" content="${handle}" />`);

  return lines.join('\n');
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function Field({ label, value, onChange, placeholder }: FieldProps) {
  return (
    <div className="control-row">
      <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', width: 140 }}>
        {label}:
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mono"
        style={{
          flex: 1,
          minWidth: 200,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          color: 'var(--text-primary)',
          padding: '6px 8px',
        }}
      />
    </div>
  );
}

export default function MetaTagGenerator() {
  const [form, setForm] = useState<FormState>(SAMPLE);
  const [copied, setCopied] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const html = useMemo(() => buildHtml(form), [form]);
  const hasContent = form.title.trim().length > 0;

  function copyHtml() {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setForm(SAMPLE)}>
          Load sample
        </button>
        <button
          className="icon-btn"
          onClick={() =>
            setForm({ title: '', description: '', url: '', imageUrl: '', siteName: '', twitterHandle: '' })
          }
        >
          Clear
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16, padding: '16px 20px' }}>
        <Field label="Page title" value={form.title} onChange={(v) => update('title', v)} placeholder="Your page title" />
        <Field
          label="Description"
          value={form.description}
          onChange={(v) => update('description', v)}
          placeholder="A one-sentence summary of the page"
        />
        <Field label="URL" value={form.url} onChange={(v) => update('url', v)} placeholder="https://example.com/page" />
        <Field
          label="Image URL"
          value={form.imageUrl}
          onChange={(v) => update('imageUrl', v)}
          placeholder="https://example.com/social-image.png"
        />
        <Field label="Site name" value={form.siteName} onChange={(v) => update('siteName', v)} placeholder="Your Site" />
        <Field
          label="Twitter handle"
          value={form.twitterHandle}
          onChange={(v) => update('twitterHandle', v)}
          placeholder="@yoursite (optional)"
        />
      </div>

      {hasContent && (
        <div className="panels">
          <div className="panel">
            <div className="panel-bar">
              <span>Google search preview</span>
            </div>
            <div style={{ padding: '16px 20px', fontFamily: 'arial, sans-serif' }}>
              <div style={{ fontSize: 14, color: '#202124' }}>{form.siteName || getHostname(form.url) || 'example.com'}</div>
              <div style={{ fontSize: 13, color: '#4d5156' }}>{form.url || 'https://example.com'}</div>
              <div style={{ fontSize: 20, color: '#1a0dab', marginTop: 2, lineHeight: 1.3 }}>
                {form.title || 'Page title'}
              </div>
              <div style={{ fontSize: 14, color: '#4d5156', marginTop: 4, lineHeight: 1.4 }}>
                {form.description || 'Page description'}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-bar">
              <span>Social share card preview</span>
            </div>
            <div style={{ margin: 16, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              {form.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.imageUrl}
                  alt={`Social share preview image for ${form.title || 'this page'}`}
                  style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block', background: 'var(--surface)' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div style={{ padding: '10px 14px', background: 'var(--surface)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  {getHostname(form.url) || 'example.com'}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{form.title || 'Page title'}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {form.description || 'Page description'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>Generated HTML</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copyHtml} disabled={!hasContent}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="output mono" style={{ whiteSpace: 'pre-wrap' }}>
          {hasContent ? html : '// Enter a page title above to generate meta tags'}
        </div>
      </div>
    </div>
  );
}
