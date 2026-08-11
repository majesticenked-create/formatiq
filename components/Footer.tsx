import Link from 'next/link';
import { categories } from '@/lib/tools/registry';
import ThemeToggle from './ThemeToggle';

const POPULAR_TOOLS = [
  { category: 'formatters', slug: 'json-formatter', title: 'JSON Formatter' },
  { category: 'encoders-decoders', slug: 'hash-generator', title: 'Hash Generator' },
  { category: 'generators', slug: 'uuid-generator', title: 'UUID Generator' },
  { category: 'converters', slug: 'timestamp-converter', title: 'Timestamp Converter' },
  { category: 'text-tools', slug: 'regex-tester', title: 'Regex Tester' },
  { category: 'calculators', slug: 'bmi-calculator', title: 'BMI Calculator' },
];

export default function Footer() {
  const year = new Date().getFullYear();

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
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link href={`/tools/${category.slug}`}>{category.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h2>Popular tools</h2>
            <ul>
              {POPULAR_TOOLS.map((tool) => (
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
