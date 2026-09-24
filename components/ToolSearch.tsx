'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { categories, tools } from '@/lib/tools/registry';
import { filterTools } from '@/lib/tools/search';

const MAX_RESULTS = 8;

interface ToolSearchProps {
  /** Distinguishes DOM ids when more than one ToolSearch is mounted at once
   *  (e.g. the compact header search alongside the homepage hero search) so
   *  ids/aria-controls never collide. */
  idPrefix?: string;
  /** 'compact' is used for the persistent header search: smaller footprint,
   *  shorter placeholder. 'default' is the larger, primary hero search. */
  variant?: 'default' | 'compact';
  label?: string;
  placeholder?: string;
}

export default function ToolSearch({
  idPrefix = 'site',
  variant = 'default',
  label = 'Search tools by name or keyword',
  placeholder,
}: ToolSearchProps = {}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => filterTools(tools, query, MAX_RESULTS), [query]);
  const showDropdown = isFocused && query.trim().length > 0;

  function goToResult(index: number) {
    const tool = results[index];
    if (!tool) return;
    setIsFocused(false);
    router.push(`/tools/${tool.category}/${tool.slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        goToResult(activeIndex);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  }

  const inputId = `${idPrefix}-tool-search`;
  const listboxId = `${idPrefix}-tool-search-listbox`;

  return (
    <div className={`tool-search${variant === 'compact' ? ' tool-search-compact' : ''}`} role="search">
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        className="tool-search-input mono"
        placeholder={placeholder ?? (variant === 'compact' ? 'Search tools…' : 'Search 200+ tools by name or keyword…')}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
        autoComplete="off"
      />

      {showDropdown && (
        <div className="tool-search-dropdown" id={listboxId} role="listbox">
          {results.length === 0 ? (
            <div className="tool-search-empty">No tools found for &ldquo;{query}&rdquo;.</div>
          ) : (
            results.map((tool, index) => (
              <Link
                key={`${tool.category}-${tool.slug}`}
                href={`/tools/${tool.category}/${tool.slug}`}
                className={`tool-search-result${index === activeIndex ? ' tool-search-result-active' : ''}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span className="tool-search-result-title">
                  {tool.title}
                  <span className="tool-search-result-category">
                    {categories.find((c) => c.slug === tool.category)?.navLabel ?? tool.category}
                  </span>
                </span>
                <span className="tool-search-result-desc">{tool.shortDescription}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
