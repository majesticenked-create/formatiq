import Link from 'next/link';
import type { Metadata } from 'next';
import { tools } from '@/lib/tools/registry';

const TITLE = '404 - Page Not Found | Formatiq';
const DESCRIPTION =
  'This page doesn’t exist. Browse Formatiq’s full catalog of free developer tools by category, or head back to the homepage.';

// No canonical URL here deliberately: a 404 has no single canonical location to point
// to, and the page is marked noindex below so it shouldn't be a search-landing target anyway.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: false,
    follow: true,
  },
};

const POPULAR_SLUGS = ['json-formatter', 'uuid-generator', 'word-counter', 'hash-generator', 'css-formatter', 'age-calculator'];

const popularTools = POPULAR_SLUGS.map((slug) => tools.find((t) => t.slug === slug)).filter(
  (t): t is NonNullable<typeof t> => Boolean(t)
);

export default function NotFound() {
  return (
    <div className="container">
      <div className="tool-header" style={{ paddingLeft: 0, paddingRight: 0, borderBottom: 'none' }}>
        <div className="eyebrow">404 - unhandled route</div>
        <h1>This page threw an exception it couldn&apos;t catch.</h1>
        <p>The route you requested doesn&apos;t exist. Let&apos;s get you back to something that works.</p>

        <div className="hero-actions" style={{ marginTop: 20 }}>
          <Link href="/" className="btn btn-primary">
            Back to homepage
          </Link>
          <Link href="/tools/formatters" className="btn btn-secondary">
            Browse tools
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 40, marginBottom: 56 }}>
        <h2 className="section-title">Popular tools</h2>
        <div className="tool-list">
          {popularTools.map((tool) => (
            <Link key={tool.slug} href={`/tools/${tool.category}/${tool.slug}`} className="tool-list-item">
              <strong>{tool.title}</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{tool.shortDescription}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
