import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { categories, getCategory, getToolsByCategory } from '@/lib/tools/registry';

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const category = getCategory(params.category);
  if (!category) return {};
  const title = `${category.title} — Free Online Tools | Formatiq`;
  const canonicalUrl = `https://formatiq.tools/tools/${category.slug}`;
  return {
    title,
    description: category.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: category.description,
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: category.description,
    },
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = getCategory(params.category);
  if (!category) notFound();

  const toolsInCategory = [...getToolsByCategory(category.slug)].sort((a, b) => a.title.localeCompare(b.title));
  const otherCategories = categories.filter((c) => c.slug !== category.slug);

  const baseUrl = 'https://formatiq.tools';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.title} — Free Online Tools`,
    description: category.description,
    url: `${baseUrl}/tools/${category.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: toolsInCategory.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.title,
        description: tool.shortDescription,
        url: `${baseUrl}/tools/${category.slug}/${tool.slug}`,
      })),
    },
  };

  return (
    <div className="container">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="tool-header" style={{ paddingLeft: 0, paddingRight: 0, borderBottom: 'none' }}>
        <div className="breadcrumb">
          <Link href="/">Formatiq</Link> / {category.title}
        </div>

        <div className="category-tool-tags" style={{ marginTop: 0, marginBottom: 16 }}>
          {otherCategories.map((c) => (
            <Link key={c.slug} href={`/tools/${c.slug}`} className="tool-tag">
              {c.title}
            </Link>
          ))}
        </div>

        <h1>{category.title}</h1>
        <p>{category.description}</p>
        <div className="tool-badges">
          <span className="pill">
            {toolsInCategory.length} tool{toolsInCategory.length === 1 ? '' : 's'} in this category
          </span>
        </div>
      </div>

      <div className="tool-list" style={{ marginTop: 24, marginBottom: 56 }}>
        {toolsInCategory.map((tool) => (
          <Link key={tool.slug} href={`/tools/${category.slug}/${tool.slug}`} className="tool-list-item">
            <strong>{tool.title}</strong>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{tool.shortDescription}</p>
          </Link>
        ))}
        {toolsInCategory.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>Tools in this category are coming soon.</p>
        )}
      </div>
    </div>
  );
}
