import type { ToolDefinition } from '@/lib/tools/types';
import ToolCard from '@/components/ToolCard';

export default function RelatedTools({ tools }: { tools: ToolDefinition[] }) {
  if (tools.length === 0) return null;

  return (
    <div className="related-tools">
      <h2 className="section-title">Related tools</h2>
      <div className="related-tools-grid">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
