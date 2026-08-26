import Link from 'next/link';
import type { Metadata } from 'next';
import { categories, getToolsByCategory } from '@/lib/tools/registry';

const TITLE = 'Sitemap - Every Tool & Page on Formatiq';
const DESCRIPTION =
  'Every tool and page on Formatiq in one place, organized by category, for quick navigation without digging through menus or search.';
const CANONICAL_URL = 'https://formatiq.tools/sitemap-page';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    url: CANONICAL_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const OTHER_PAGES = [
  { title: 'Home', href: '/' },
  { title: 'About', href: '/about' },
  { title: 'Contact', href: '/contact' },
  { title: 'Privacy Policy', href: '/privacy' },
  { title: 'Terms of Service', href: '/terms' },
  { title: 'Cookie Policy', href: '/cookies' },
  { title: 'Accessibility Statement', href: '/accessibility' },
];

export default function SitemapPage() {
  return (
    <div className="container">
      <div className="tool-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="breadcrumb">
          <Link href="/">Formatiq</Link> / Sitemap
        </div>
        <h1>Sitemap</h1>
        <p>Every tool and page on Formatiq, in one place.</p>
      </div>

      <div style={{ marginTop: 24, marginBottom: 48 }}>
        <div className="footer-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', paddingBottom: 0 }}>
          {categories.map((category) => {
            const categoryTools = [...getToolsByCategory(category.slug)].sort((a, b) => a.title.localeCompare(b.title));
            return (
              <div className="footer-column" key={category.slug}>
                <h2 style={{ fontSize: 15, marginBottom: 12 }}>
                  <Link href={`/tools/${category.slug}`}>{category.title}</Link>
                </h2>
                <ul>
                  {categoryTools.map((tool) => (
                    <li key={tool.slug}>
                      <Link href={`/tools/${category.slug}/${tool.slug}`}>{tool.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="seo-content" style={{ borderTop: '1px solid var(--border)', paddingTop: 32 }}>
        <h2>Other pages</h2>
        <div className="footer-column" style={{ maxWidth: 320 }}>
          <ul>
            {OTHER_PAGES.map((page) => (
              <li key={page.href}>
                <Link href={page.href}>{page.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
