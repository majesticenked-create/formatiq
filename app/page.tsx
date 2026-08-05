import Link from 'next/link';
import HeroDemo from '@/components/HeroDemo';
import { categories, getToolsByCategory } from '@/lib/tools/registry';

export default function HomePage() {
  return (
    <div className="container">
      <section className="hero">
        <div>
          <div className="eyebrow">100% client-side · no sign-up</div>
          <h1>Format, convert, and validate — without leaving your browser.</h1>
          <p className="lede">
            Formatiq is a growing collection of free developer tools: formatters, converters, validators, and
            generators. Nothing you paste is ever uploaded anywhere.
          </p>
          <div className="hero-actions">
            <Link href="/tools/formatters/json-formatter" className="btn btn-primary">
              Try the JSON formatter
            </Link>
            <Link href="/tools/formatters" className="btn btn-secondary">
              Browse all tools
            </Link>
          </div>
        </div>
        <HeroDemo />
      </section>

      <section>
        <h2 className="section-title">Browse by category</h2>
        <div className="category-grid">
          {categories.map((category) => {
            const count = getToolsByCategory(category.slug).length;
            return (
              <Link key={category.slug} href={`/tools/${category.slug}`} className="category-card">
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <span className="count">{count} tool{count === 1 ? '' : 's'}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
