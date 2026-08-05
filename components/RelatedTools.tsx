import Link from 'next/link';
import type { ToolDefinition } from '@/lib/tools/types';

export default function RelatedTools({ tools }: { tools: ToolDefinition[] }) {
  if (tools.length === 0) return null;

  return (
    <div className="related-tools">
      <h2 className="section-title">Related tools</h2>
      <ul>
        {tools.map((tool) => (
          <li key={tool.slug}>
            <Link href={`/tools/${tool.category}/${tool.slug}`}>{tool.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
