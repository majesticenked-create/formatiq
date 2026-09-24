'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { categories } from '@/lib/tools/registry';
import { getActiveCategorySlug } from '@/lib/tools/navigation';

export default function CategoryNav() {
  const pathname = usePathname();
  const activeSlug = getActiveCategorySlug(
    pathname ?? '',
    categories.map((c) => c.slug)
  );

  return (
    <nav className="site-category-nav" aria-label="Tool categories">
      <div className="site-category-nav-track">
        {categories.map((category) => {
          const isActive = category.slug === activeSlug;
          return (
            <Link
              key={category.slug}
              href={`/tools/${category.slug}`}
              className="site-category-nav-link"
              aria-current={isActive ? 'page' : undefined}
              data-active={isActive || undefined}
            >
              {category.navLabel}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
