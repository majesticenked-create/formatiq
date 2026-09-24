import Link from 'next/link';
import { categories, tools } from '@/lib/tools/registry';
import ThemeToggle from './ThemeToggle';

export default function Footer() {
  const year = new Date().getFullYear();
  // Sourced from the registry's isPopular flag rather than a hardcoded list,
  // so this column can never drift out of sync with real tool data.
  const popularTools = tools.filter((t) => t.isPopular).slice(0, 6);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column">
            <div className="brand">
              <span className="brand-mark">{'{'}</span>
              Formatiq
              <span className="brand-mark">{'}'}</span>
            </div>
            <p>Formatiq - free browser-based tools for developers. Nothing you paste is ever uploaded.</p>
            <ThemeToggle />
          </div>

          <div className="footer-column">
            <h2>Categories</h2>
            <ul>
              {categories.map((category) => {
                const count = tools.filter((t) => t.category === category.slug).length;
                return (
                  <li key={category.slug}>
                    <Link href={`/tools/${category.slug}`}>
                      {category.title} <span style={{ color: 'var(--text-tertiary)' }}>({count})</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="footer-column">
            <h2>Popular tools</h2>
            <ul>
              {popularTools.map((tool) => (
                <li key={tool.slug}>
                  <Link href={`/tools/${tool.category}/${tool.slug}`}>{tool.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h2>About</h2>
            <ul>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link href="/cookies">Cookie Policy</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/accessibility">Accessibility</Link>
              </li>
              <li>
                <Link href="/sitemap-page">Sitemap</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} Formatiq. All rights reserved.</span>
          <span>All tools run client-side - nothing you paste is ever uploaded.</span>
        </div>
      </div>
    </footer>
  );
}
