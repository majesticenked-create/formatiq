import Link from 'next/link';
import type { ToolDefinition } from '@/lib/tools/types';

export default function RelatedTools({ tools }: { tools: ToolDefinition[] }) {
  if (tools.length === 0) return null;

  return (
    <div className="related-tools">
      <h2 className="section-title">Related tools</h2>
      <div className="related-tools-grid">
        {tools.map((tool) => (
          <Link key={tool.slug} href={`/tools/${tool.category}/${tool.slug}`} className="category-card">
            <h3>{tool.title}</h3>
            <p>{tool.shortDescription}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
