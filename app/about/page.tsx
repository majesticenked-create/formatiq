import Link from 'next/link';
import type { Metadata } from 'next';
import { categories, tools } from '@/lib/tools/registry';

const TITLE = 'About | Formatiq';
const DESCRIPTION =
  'What Formatiq is, why every tool runs entirely in your browser, and how the site is organized across formatters, converters, and more.';
const CANONICAL_URL = 'https://formatiq.tools/about';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    url: CANONICAL_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <div className="container">
      <div className="tool-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="breadcrumb">
          <Link href="/">Formatiq</Link> / About
        </div>
        <h1>About Formatiq</h1>
      </div>

      <div className="seo-content" style={{ borderTop: 'none' }}>
        <h2>What Formatiq is</h2>
        <p>
          Formatiq is a growing collection of {tools.length} free, browser-based developer tools - formatters,
          converters, validators, generators, encoders/decoders, text tools, and calculators. Each one is built to
          do one job well: paste something in - JSON, a URL, a timestamp, a CSV export - and get a clean, correct
          result back instantly, without an account, an upload step, or a paywall in the way. The catalog is meant to
          keep growing over time as new tools are added to fill gaps in what developers reach for day to day.
        </p>

        <h2>Why everything runs in your browser</h2>
        <p>
          Every tool on this site processes its input entirely client-side, using standard JavaScript and Web APIs
          running locally on your device. There is no backend request happening when you format JSON, decode a JWT,
          or validate a credit card number - the computation happens in your browser and the result never leaves it.
          This isn&apos;t just a privacy nicety; it&apos;s the actual architecture. A lot of what gets pasted into
          tools like these is genuinely sensitive - an API response with real customer data, a JWT from a
          production auth flow, a config file with internal details - and none of it is ever transmitted to,
          received by, or stored on a Formatiq server. It also means the tools work instantly, without waiting on a
          network round-trip.
        </p>

        <h2>Why it&apos;s free</h2>
        <p>
          Formatiq does not currently run display advertising, and there is no account, paywall, or upsell anywhere
          on the site - every tool is fully usable with no sign-up. When we do enable advertising, we expect to
          support the site with display ads (likely Google AdSense or a similar network) rather than by charging for
          access or gating tools behind a subscription. The goal is for the tools to stay free and immediately
          usable regardless of how the site is eventually monetized.
        </p>

        <h2>Who&apos;s behind this</h2>
        {/* TODO: Replace with real, accurate information about who built/maintains this site -
            do not fabricate a name, bio, or credentials. This directly affects user trust and
            Google's E-E-A-T signals. */}
        <p>This site is built and maintained independently. [Add your background/story here].</p>

        <h2>How the site is organized</h2>
        <p>Tools are grouped into {categories.length} categories, each with its own hub page:</p>
        <ul>
          {categories.map((category) => (
            <li key={category.slug}>
              <Link href={`/tools/${category.slug}`}>{category.title}</Link> - {category.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
