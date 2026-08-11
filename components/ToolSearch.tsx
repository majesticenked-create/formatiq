'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { tools } from '@/lib/tools/registry';

const MAX_RESULTS = 8;

export default function ToolSearch() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return tools
      .filter((tool) => {
        const haystack = [tool.title, tool.shortDescription, ...tool.keywords].join(' ').toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, MAX_RESULTS);
  }, [query]);

  const showDropdown = isFocused && query.trim().length > 0;

  return (
    <div className="tool-search">
      <input
        type="text"
        className="tool-search-input mono"
        placeholder="Search tools by name or keyword…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        aria-label="Search tools"
      />

      {showDropdown && (
        <div className="tool-search-dropdown">
          {results.length === 0 ? (
            <div className="tool-search-empty">No tools found for &ldquo;{query}&rdquo;.</div>
          ) : (
            results.map((tool) => (
              <Link
                key={`${tool.category}-${tool.slug}`}
                href={`/tools/${tool.category}/${tool.slug}`}
                className="tool-search-result"
              >
                <span className="tool-search-result-title">{tool.title}</span>
                <span className="tool-search-result-desc">{tool.shortDescription}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
