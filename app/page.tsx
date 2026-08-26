import Link from 'next/link';
import HeroDemo from '@/components/HeroDemo';
import ToolSearch from '@/components/ToolSearch';
import ScrollReveal from '@/components/ScrollReveal';
import { categories, getToolsByCategory, tools } from '@/lib/tools/registry';
import type { ToolDefinition } from '@/lib/tools/types';

const MAX_TOOL_TAGS = 4;
const BASE_URL = 'https://formatiq.tools';

function ToolCardRow({ items }: { items: ToolDefinition[] }) {
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

// Deliberately distinct from ToolCardRow's horizontal-scroll layout - three
// consecutive sections all using the same card-row pattern reads as repetitive.
// A compact 2-column list (1-column on mobile) breaks that up in the middle.
function NewToolsList({ items }: { items: ToolDefinition[] }) {
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

// TODO: once real analytics (e.g. GA4 pageview data) exists, replace this
// pseudo-random selection with actual most-viewed-this-week logic from real
// traffic data. Until then, this deterministically rotates a set of tools
// once per week (seeded by the week number) so the section isn't a fake
// static claim of "trending" data, but also isn't hardcoded forever.
function getTrendingTools(allTools: ToolDefinition[], count: number): ToolDefinition[] {
  const weekSeed = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  let seed = weekSeed;
  function nextRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  const shuffled = [...allTools];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export default function HomePage() {
  const stats = [
    { value: String(tools.length), label: `tool${tools.length === 1 ? '' : 's'}` },
    { value: String(categories.length), label: `categor${categories.length === 1 ? 'y' : 'ies'}` },
    { value: '100%', label: 'client-side' },
    { value: '$0', label: 'cost' },
  ];

  // Excluded from the homepage's rotating "Trending" pool: BMI and loan calculators
  // are YMYL topics (medical/financial) dominated by authority sites we have no
  // realistic shot at outranking, and are off-brand for a dev-tools site — they stay
  // indexed and usable, we just don't feature them in homepage promotion.
  const TRENDING_EXCLUDED_SLUGS = new Set(['bmi-calculator', 'loan-calculator']);

  const popularTools = tools.filter((t) => t.isPopular);
  const newTools = tools.filter((t) => t.isNew).slice(0, 6);
  const trendingTools = getTrendingTools(
    tools.filter((t) => !TRENDING_EXCLUDED_SLUGS.has(t.slug)),
    6
  );

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'Formatiq',
        url: BASE_URL,
        description:
          'Free formatters, converters, validators, and generators for developers. Everything runs in your browser.',
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

      <div className="container">
        <section className="hero">
          <div>
            <div className="eyebrow">100% client-side · no sign-up</div>
            <h1>Format, convert, and validate - without leaving your browser.</h1>
            <p className="lede">
              Formatiq is a growing collection of free developer tools: formatters, converters, validators, and
              generators. Nothing you paste leaves your browser.
            </p>
            <div className="hero-actions">
              <Link href="/tools/formatters/json-formatter" className="btn btn-primary">
                Try the JSON formatter
              </Link>
              <Link href="/tools/formatters" className="btn btn-secondary">
                Browse all tools
              </Link>
            </div>
          </div>
          <HeroDemo />
        </section>

        <section className="stats-bar">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-block">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </section>

        <section className="search-section">
          <ToolSearch />
        </section>
      </div>

      {popularTools.length > 0 && (
        <section className="home-section">
          <div className="container">
            <ScrollReveal>
              <div className="home-section-header">
                <h2 className="section-title">Popular Tools</h2>
                <p>The most reached-for tools on Formatiq, based on real-world search demand.</p>
              </div>
            </ScrollReveal>
            <ToolCardRow items={popularTools} />
          </div>
        </section>
      )}

      {newTools.length > 0 && (
        <section className="home-section home-section-alt">
          <div className="container">
            <ScrollReveal>
              <div className="home-section-header">
                <h2 className="section-title">New Additions</h2>
                <p>The latest tools added to Formatiq.</p>
              </div>
            </ScrollReveal>
            <NewToolsList items={newTools} />
          </div>
        </section>
      )}

      {trendingTools.length > 0 && (
        <section className="home-section">
          <div className="container">
            <ScrollReveal>
              <div className="home-section-header">
                <h2 className="section-title">Trending This Week</h2>
                <p>A rotating pick of tools worth checking out, refreshed weekly.</p>
              </div>
            </ScrollReveal>
            <ToolCardRow items={trendingTools} />
          </div>
        </section>
      )}

      <div className="container">
        <section style={{ marginBottom: 40 }}>
          <ScrollReveal>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '70ch' }}>
              Formatiq exists because most day-to-day developer tasks - reformatting a JSON blob, decoding a JWT, checking
              whether an email address is even valid - don’t need an account, a subscription, or a round trip to a
              server. Every tool here runs entirely in your browser: nothing you paste, encode, validate, or convert is
              ever uploaded anywhere, which matters more than it sounds when what you’re working with is a real API
              response, a production config file, or a token you’d rather not hand to an unfamiliar site. New tools get
              added as real gaps show up, not on a release schedule, and every one of them stays free.
            </p>
          </ScrollReveal>
        </section>

        <section>
          <ScrollReveal>
            <h2 className="section-title">Browse by category</h2>
          </ScrollReveal>
          <div className="category-grid">
            {categories.map((category) => {
              const categoryTools = getToolsByCategory(category.slug);
              const shown = categoryTools.slice(0, MAX_TOOL_TAGS);
              const remaining = categoryTools.length - shown.length;

              return (
                <div key={category.slug} className="category-card">
                  <Link href={`/tools/${category.slug}`} className="category-card-link">
                    <h3>{category.title}</h3>
                    <p>{category.description}</p>
                  </Link>
                  {shown.length > 0 && (
                    <div className="category-tool-tags">
                      {shown.map((tool) => (
                        <Link
                          key={tool.slug}
                          href={`/tools/${category.slug}/${tool.slug}`}
                          className="tool-tag"
                        >
                          {tool.title}
                        </Link>
                      ))}
                      {remaining > 0 && (
                        <Link href={`/tools/${category.slug}`} className="tool-tag tool-tag-more">
                          +{remaining} more
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
