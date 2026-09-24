import Link from 'next/link';
import { categories, tools } from '@/lib/tools/registry';
import { getCategoryIcon } from '@/components/icons/CategoryIcons';

export default function CategoryDirectory() {
  const cards = categories
    .map((category) => ({
      category,
      count: tools.filter((t) => t.category === category.slug).length,
    }))
    // A category with zero resolved tools would render a broken/empty card -
    // skip it rather than show it.
    .filter((c) => c.count > 0);

  return (
    <section>
      <h2 className="section-title">Browse by category</h2>
      <div className="category-directory-grid">
        {cards.map(({ category, count }) => {
          const Icon = getCategoryIcon(category.slug);
          return (
          <Link
            key={category.slug}
            href={`/tools/${category.slug}`}
            className="category-directory-card"
          >
            <span className="category-directory-icon" aria-hidden="true">
              <Icon />
            </span>
            <h3>{category.title}</h3>
            <p>{category.description}</p>
            <span className="category-directory-count">
              {count} tool{count === 1 ? '' : 's'}
            </span>
          </Link>
          );
        })}

        <Link
          href="/sitemap-page"
          className="category-directory-card category-directory-feature"
        >
          <div>
            <h3>Browse all tools</h3>
            <p>Every formatter, converter, validator, and generator on Formatiq in one list.</p>
          </div>
          <span className="category-directory-count">{tools.length} total</span>
        </Link>
      </div>
    </section>
  );
}
