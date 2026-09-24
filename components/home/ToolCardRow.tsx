import Link from 'next/link';
import type { ToolDefinition } from '@/lib/tools/types';

export default function ToolCardRow({ items }: { items: ToolDefinition[] }) {
  return (
    <div className="tool-card-row">
      {items.map((tool) => (
        <Link key={`${tool.category}-${tool.slug}`} href={`/tools/${tool.category}/${tool.slug}`} className="tool-card-compact">
          <h3>{tool.title}</h3>
          <p>{tool.shortDescription}</p>
        </Link>
      ))}
    </div>
  );
}
