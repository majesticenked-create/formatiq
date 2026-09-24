import Link from 'next/link';
import { categories, tools } from '@/lib/tools/registry';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="brand" aria-label="Formatiq home">
              <span className="brand-mark" aria-hidden="true">{'{'}</span>
              Formatiq
              <span className="brand-mark" aria-hidden="true">{'}'}</span>
            </Link>
            <p>Free developer tools that run in your browser - formatters, converters, validators, and generators.</p>
          </div>

          <nav className="footer-column" aria-label="Tools">
            <h2>Tools</h2>
            <ul>
              {categories.map((category) => {
                const count = tools.filter((t) => t.category === category.slug).length;
                return (
                  <li key={category.slug}>
                    <Link href={`/tools/${category.slug}`}>
                      {category.title} <span className="footer-count">({count})</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <nav className="footer-column" aria-label="Company">
            <h2>Company</h2>
            <ul>
              <li>
                <Link href="/about">About</Link>
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
          </nav>

          <nav className="footer-column" aria-label="Legal">
            <h2>Legal</h2>
            <ul>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link href="/cookies">Cookie Policy</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>© {year} Formatiq. All rights reserved.</span>
          <span>Most tools run in your browser; a few (like currency conversion) fetch live data.</span>
        </div>
      </div>
    </footer>
  );
}
