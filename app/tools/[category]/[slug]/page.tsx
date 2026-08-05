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
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    keywords: tool.keywords,
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
