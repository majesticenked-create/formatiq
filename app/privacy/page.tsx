import Link from 'next/link';
import type { Metadata } from 'next';

const TITLE = 'Privacy Policy | Formatiq';
const DESCRIPTION =
  'How Formatiq handles data: every tool runs entirely client-side in your browser, with no input ever sent to or stored on a server.';
const CANONICAL_URL = 'https://formatiq.tools/privacy';

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

export default function PrivacyPage() {
  return (
    <div className="container">
      <div className="tool-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="breadcrumb">
          <Link href="/">Formatiq</Link> / Privacy Policy
        </div>
        <h1>Privacy Policy</h1>
      </div>

      <div className="seo-content" style={{ borderTop: 'none' }}>
        <h2>Overview</h2>
        <p>
          Formatiq is a collection of free, browser-based developer tools - formatters, converters, validators, and
          generators. The core privacy commitment behind every tool on this site is simple: whatever you paste or
          type into a tool (JSON, a URL, a card number you&apos;re testing, anything) is processed entirely in your
          own browser using standard JavaScript and Web APIs. It is never transmitted to, received by, or stored on
          any Formatiq server. There is no backend request happening when you use a tool - the computation happens
          locally on your device, which is also why these tools work without an account and without a network
          round-trip.
        </p>

        <h2>What data we do collect</h2>
        <p>
          Formatiq uses Google Analytics (GA4) to understand aggregate site traffic - which pages are visited, how
          people arrive here, and general usage trends. This collects standard information such as page views,
          referring site, approximate geographic location (derived from IP address), and device/browser type. It
          does not, and cannot, collect the content of anything typed or pasted into a tool - that processing happens
          entirely in your browser and is never transmitted anywhere, regardless of whether analytics is present.
        </p>
        <p>
          Analytics only loads after you accept cookies via the banner shown on your first visit - choosing "Reject
          non-essential" keeps Google Analytics from loading at all. You can review or change your choice at any
          time by clearing this site&apos;s data in your browser. Google&apos;s own handling of Analytics data is
          described in their{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          .
        </p>
        <p>
          One thing worth noting for accuracy: the site&apos;s dark/light theme preference is saved using your
          browser&apos;s <code>localStorage</code>, not a cookie. This is a small piece of data stored locally on
          your device (which theme you picked) - it is not transmitted anywhere and cannot be read by any other
          website.
        </p>

        <h2>Cookies and ads</h2>
        <p>
          Formatiq does not currently run display advertising. When we enable advertising, we expect to use Google
          AdSense and/or similar ad networks, which may set cookies in your browser to serve ads - including
          personalized ads based on your browsing activity - and to measure ad performance. You can learn more about
          how Google uses data for advertising, and how to opt out of personalized advertising, at{' '}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
            Google&apos;s Ads Privacy &amp; Terms page
          </a>
          . This section will be updated with specifics once an ad network is actually integrated.
        </p>

        <h2>Third-party services</h2>
        <p>
          This site is hosted on Cloudflare Pages. Like virtually any web host, Cloudflare processes standard
          server-level logs as part of serving pages - this typically includes information such as IP address,
          requested URL, timestamp, and user agent, generated automatically by the act of loading a page over HTTP.
          This is separate from, and unrelated to, the content you paste into a tool, which is never sent to
          Cloudflare or anywhere else since tool processing happens entirely client-side. When accepted, Google
          Analytics is also used - see "What data we do collect" above for details.
        </p>

        <h2>Your rights</h2>
        <p>
          Depending on where you live, you may have rights under data protection laws such as the GDPR or CCPA
          regarding personal data collected about you, including the right to request access to, correction of, or
          deletion of your data. Given that Formatiq does not collect or store the content you use with its tools,
          and only loads analytics after you opt in via the cookie banner, there is generally very little personal
          data held about any visitor. If you have questions about privacy on this site, please contact us at{' '}
          <a href="mailto:privacy@formatiq.tools">privacy@formatiq.tools</a>.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this privacy policy from time to time - for example, if analytics or advertising is added,
          or if a new tool changes how data is handled. Please check back periodically for the current version. The
          date below reflects the last time this page was updated.
        </p>

        <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Last updated: August 13, 2026</p>
      </div>
    </div>
  );
}
