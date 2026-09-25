import Link from 'next/link';
import ToolSearch from '@/components/ToolSearch';
import ToolCard from '@/components/ToolCard';
import HeroPreview from '@/components/home/HeroPreview';
import StatsRow from '@/components/home/StatsRow';
import CategoryDirectory from '@/components/home/CategoryDirectory';
import { ArrowRightIcon, BrowserIcon, CheckIcon, TagIcon } from '@/components/icons/UiIcons';
import { categories, tools } from '@/lib/tools/registry';
import { ALL_TOOLS_HREF, HOME_SECTION_IDS } from '@/lib/tools/navigation';

const BASE_URL = 'https://formatiq.tools';
const NEW_TOOL_COUNT = 5;

export default function HomePage() {
  // Curated by the registry's isPopular flag (hand-picked, not usage analytics).
  const popularTools = tools.filter((t) => t.isPopular);
  // Same logic as before: registry-order slice of the isNew flag.
  const newTools = tools.filter((t) => t.isNew).slice(0, NEW_TOOL_COUNT);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'Formatiq',
        url: BASE_URL,
        description:
          'Free formatters, converters, validators, and generators for developers. Most tools run in your browser.',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${BASE_URL}/sitemap-page?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'ItemList',
        name: 'Formatiq tool categories',
        itemListElement: categories.map((category, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: category.title,
          url: `${BASE_URL}/tools/${category.slug}`,
        })),
      },
    ],
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="hero-section">
        <div className="container hero">
          <div className="hero-copy">
            <ul className="trust-chips" aria-label="Highlights">
              <li>
                <BrowserIcon size={16} /> Runs in your browser
              </li>
              <li>
                <CheckIcon size={16} /> No sign-up
              </li>
              <li>
                <TagIcon size={16} /> Free to use
              </li>
            </ul>
            <h1>Format, convert, and validate - without leaving your browser.</h1>
            <p className="lede">
              {tools.length} free developer tools - formatters, converters, validators, and generators. Most run
              entirely in your browser, with no account needed.
            </p>
            <div className="hero-actions">
              <Link href="/tools/formatters/json-formatter" className="btn btn-primary">
                Try the JSON formatter
              </Link>
              <Link href={ALL_TOOLS_HREF} className="btn btn-secondary">
                Browse all tools
              </Link>
            </div>
          </div>
          <HeroPreview />
        </div>
      </section>

      <section id="search" className="search-strip" aria-label="Search tools">
        <div className="container">
          <ToolSearch
            idPrefix="hero"
            variant="large"
            label="Search all tools"
            placeholder={`Search ${tools.length} tools… (e.g. JSON formatter, Base64, UUID, word counter)`}
          />
        </div>
      </section>

      <StatsRow />

      {popularTools.length > 0 && (
        <section id={HOME_SECTION_IDS.popular} className="home-section" aria-labelledby="popular-heading">
          <div className="container">
            <div className="home-section-header">
              <div>
                <h2 id="popular-heading" className="section-title">Popular tools</h2>
                <p>Hand-picked tools people reach for most.</p>
              </div>
              <Link href={ALL_TOOLS_HREF} className="section-link">
                View all tools <ArrowRightIcon size={16} />
              </Link>
            </div>
            <div className="tool-grid tool-grid-4">
              {popularTools.map((tool) => (
                <ToolCard key={`${tool.category}-${tool.slug}`} tool={tool} />
              ))}
            </div>
          </div>
        </section>
      )}

      {newTools.length > 0 && (
        <section id={HOME_SECTION_IDS.new} className="home-section home-section-alt" aria-labelledby="new-heading">
          <div className="container">
            <div className="home-section-header">
              <div>
                <h2 id="new-heading" className="section-title">New additions</h2>
                <p>Recently added to Formatiq.</p>
              </div>
              <Link href={ALL_TOOLS_HREF} className="section-link">
                View all tools <ArrowRightIcon size={16} />
              </Link>
            </div>
            <div className="tool-grid tool-grid-5">
              {newTools.map((tool) => (
                <ToolCard key={`${tool.category}-${tool.slug}`} tool={tool} size="compact" />
              ))}
            </div>
          </div>
        </section>
      )}

      <CategoryDirectory />
    </>
  );
}
