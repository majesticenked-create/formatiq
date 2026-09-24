import Link from 'next/link';
import type { ToolDefinition } from '@/lib/tools/types';

// Deliberately distinct from ToolCardRow's horizontal-scroll layout - a compact
// 2-column list (1-column on mobile) reads differently from the featured-tools
// card row above it.
export default function NewToolsList({ items }: { items: ToolDefinition[] }) {
  return (
    <div className="new-tools-list">
      {items.map((tool) => (
        <Link key={`${tool.category}-${tool.slug}`} href={`/tools/${tool.category}/${tool.slug}`} className="new-tool-row">
          <div className="new-tool-row-text">
            <h3>{tool.title}</h3>
            <p>{tool.shortDescription}</p>
          </div>
          <span className="new-tool-badge">New</span>
        </Link>
      ))}
    </div>
  );
}
