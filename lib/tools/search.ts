import type { ToolDefinition } from './types';

/**
 * Pure, testable filtering logic behind the homepage/site tool search.
 * Matches on title, short description, category slug, and keywords.
 * Kept separate from the ToolSearch component so it can be unit-tested
 * without rendering React, and so it stays the single search implementation
 * on the site (no parallel/duplicate search logic).
 */
export function filterTools(
  allTools: ToolDefinition[],
  query: string,
  maxResults = 8
): ToolDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return allTools
    .filter((tool) => {
      const haystack = [tool.title, tool.shortDescription, tool.category, ...tool.keywords]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, maxResults);
}
