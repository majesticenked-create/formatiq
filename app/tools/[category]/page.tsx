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
  return {
    title: `${category.title} — Free Online Tools | Formatiq`,
    description: category.description,
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = getCategory(params.category);
  if (!category) notFound();

  const toolsInCategory = getToolsByCategory(category.slug);

  return (
    <div className="container">
      <div className="tool-header" style={{ paddingLeft: 0, paddingRight: 0, borderBottom: 'none' }}>
        <div className="breadcrumb">
          <Link href="/">Formatiq</Link> / {category.title}
        </div>
        <h1>{category.title}</h1>
        <p>{category.description}</p>
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
