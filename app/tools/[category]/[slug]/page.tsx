import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ToolLayout from '@/components/ToolLayout';
import { getTool, tools } from '@/lib/tools/registry';

export function generateStaticParams() {
  return tools.map((t) => ({ category: t.category, slug: t.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Metadata {
  const tool = getTool(params.category, params.slug);
  if (!tool) return {};
  const canonicalUrl = `https://formatiq.tools/tools/${tool.category}/${tool.slug}`;
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
  };
}

export default function ToolPage({ params }: { params: { category: string; slug: string } }) {
  const tool = getTool(params.category, params.slug);
  if (!tool) notFound();

  const { Component } = tool;

  return (
    <ToolLayout tool={tool}>
      <Component />
    </ToolLayout>
  );
}
