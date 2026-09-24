import Link from 'next/link';
import HeroDemo from '@/components/HeroDemo';
import ToolSearch from '@/components/ToolSearch';
import ScrollReveal from '@/components/ScrollReveal';
import CategoryDirectory from '@/components/home/CategoryDirectory';
import TrustSection from '@/components/home/TrustSection';
import ToolCardRow from '@/components/home/ToolCardRow';
import NewToolsList from '@/components/home/NewToolsList';
import { categories, tools } from '@/lib/tools/registry';
import type { ToolDefinition } from '@/lib/tools/types';

const BASE_URL = 'https://formatiq.tools';

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
  // Excluded from the homepage's rotating "Trending" pool: BMI and loan calculators
  // are YMYL topics (medical/financial) dominated by authority sites we have no
  // realistic shot at outranking, and are off-brand for a dev-tools site — they stay
  // indexed and usable, we just don't feature them in homepage promotion.
  const TRENDING_EXCLUDED_SLUGS = new Set(['bmi-calculator', 'loan-calculator']);

  const popularTools = tools.filter((t) => t.isPopular);
  const newTools = tools.filter((t) => t.isNew).slice(0, 8);
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

      <div className="container">
        <section className="hero">
          <div>
            <div className="eyebrow">100% free · no sign-up</div>
            <h1>
              {tools.length} developer tools, ready in your browser - no account, no upload.
            </h1>
            <p className="lede">
              Formatiq is a growing collection of free formatters, converters, validators, and generators. Search
              for what you need below, or browse by category.
            </p>
            <div className="hero-actions">
              <ToolSearch />
            </div>
            <div className="hero-actions">
              <Link href="/tools/formatters/json-formatter" className="btn btn-primary">
                Try the JSON formatter
              </Link>
              <Link href="/sitemap-page" className="btn btn-secondary">
                Browse all tools
              </Link>
            </div>
          </div>
          <HeroDemo />
        </section>
      </div>

      <div className="container">
        <CategoryDirectory />
        <TrustSection />
      </div>

      {popularTools.length > 0 && (
        <section className="home-section">
          <div className="container">
            <ScrollReveal>
              <div className="home-section-header">
                <h2 className="section-title">Popular tools</h2>
                <p>A hand-picked set of the tools people reach for most - JSON, Base64, UUIDs, hashes, and more.</p>
              </div>
            </ScrollReveal>
            <ToolCardRow items={popularTools} />
          </div>
        </section>
      )}

      <div className="container">
        <section style={{ marginBottom: 40 }}>
          <ScrollReveal>
            <h2 className="section-title">About Formatiq</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '70ch' }}>
              Formatiq exists because most day-to-day developer tasks - reformatting a JSON blob, decoding a JWT,
              checking whether an email address is even valid - don’t need an account, a subscription, or a round
              trip to a server. Most tools here run entirely in your browser: nothing you paste, encode, validate,
              or convert is uploaded anywhere, which matters more than it sounds when what you’re working with is a
              real API response, a production config file, or a token you’d rather not hand to an unfamiliar site.
              New tools get added as real gaps show up, not on a release schedule, and every one of them stays free.
            </p>
            <p style={{ marginTop: 12 }}>
              <Link href="/about" className="btn btn-secondary">
                More about Formatiq
              </Link>
            </p>
          </ScrollReveal>
        </section>
      </div>

      {newTools.length > 0 && (
        <section className="home-section home-section-alt">
          <div className="container">
            <ScrollReveal>
              <div className="home-section-header">
                <h2 className="section-title">Recently added</h2>
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
                <h2 className="section-title">Trending this week</h2>
                <p>A rotating pick of tools worth checking out, refreshed weekly.</p>
              </div>
            </ScrollReveal>
            <ToolCardRow items={trendingTools} />
          </div>
        </section>
      )}
    </>
  );
}
