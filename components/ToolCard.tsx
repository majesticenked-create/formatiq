import Link from 'next/link';
import type { ToolDefinition } from '@/lib/tools/types';
import { getCategoryIcon } from '@/components/icons/CategoryIcons';
import { ArrowRightIcon } from '@/components/icons/UiIcons';

/**
 * The single tool-card used by Popular, New, and Related tools. There is no
 * per-tool icon in the registry, so the small icon is derived from the tool's
 * CATEGORY (getCategoryIcon) rather than invented per tool.
 */
export default function ToolCard({
  tool,
  size = 'default',
}: {
  tool: ToolDefinition;
  size?: 'default' | 'compact';
}) {
  const Icon = getCategoryIcon(tool.category);
  return (
    <Link
      href={`/tools/${tool.category}/${tool.slug}`}
      className={`tool-card${size === 'compact' ? ' tool-card-small' : ''}`}
    >
      <span className="tool-card-icon" aria-hidden="true">
        <Icon />
      </span>
      <h3>{tool.title}</h3>
      <p>{tool.shortDescription}</p>
      <span className="tool-card-arrow" aria-hidden="true">
        <ArrowRightIcon size={16} />
      </span>
    </Link>
  );
}
