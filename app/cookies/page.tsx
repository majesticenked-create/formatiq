import Link from 'next/link';
import type { Metadata } from 'next';

const TITLE = 'Cookie Policy - How Formatiq Uses Cookies';
const DESCRIPTION =
  'What cookies and local storage Formatiq uses today, and what will be added if advertising or analytics are introduced in the future.';
const CANONICAL_URL = 'https://formatiq.tools/cookies';

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

export default function CookiesPage() {
  return (
    <div className="container">
      <div className="tool-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="breadcrumb">
          <Link href="/">Formatiq</Link> / Cookie Policy
        </div>
        <h1>Cookie Policy</h1>
      </div>

      <div className="seo-content" style={{ borderTop: 'none' }}>
        <h2>What cookies are</h2>
        <p>
          Cookies are small pieces of data a website asks your browser to store, then sends back to that site on
          later visits - commonly used to remember a preference, keep you signed in, or track activity across
          visits for analytics or advertising. This policy covers cookies specifically; for a broader look at how
          Formatiq handles data generally, see our <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <h2>What this site currently uses</h2>
        <p>
          As of this writing, Formatiq does not set any browser cookies. What the site does use is your
          browser&apos;s <code>localStorage</code> - a different, non-cookie storage mechanism that saves data only
          on your own device and is never automatically sent back to any server the way a cookie is. Specifically,
          two things are stored in <code>localStorage</code> today:
        </p>
        <p>
          <strong>Theme preference</strong> - which of the light or dark themes you last selected, so the site
          remembers your choice on your next visit.
        </p>
        <p>
          <strong>Cookie consent choice</strong> - whether you clicked &quot;Accept all&quot; or &quot;Reject
          non-essential&quot; on the cookie banner, along with a timestamp, so the banner doesn&apos;t reappear on
          every visit once you&apos;ve made a choice.
        </p>
        <p>Neither of these is a cookie, and neither is transmitted to Formatiq or any third party.</p>

        <h2>What will be added once advertising or analytics go live</h2>
        <p>
          Formatiq does not currently run display advertising or analytics. When we enable advertising, we expect to
          use Google AdSense, which sets its own cookies to serve and measure ads - including personalized ads based
          on browsing activity. Details on how Google uses cookies for advertising are available at{' '}
          <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">
            Google&apos;s Cookies page
          </a>
          . See the <Link href="/privacy">Privacy Policy</Link>&apos;s &quot;Cookies and ads&quot; section for the
          broader data-handling context once that happens. This page will be updated with the specific cookie names
          and purposes once an ad network or analytics tool is actually integrated into the site.
        </p>

        <h2>Managing or clearing your preferences</h2>
        <p>
          Since Formatiq doesn&apos;t currently set cookies, there&apos;s nothing to clear on that front yet. To
          reset your theme preference or your cookie consent choice (so the consent banner reappears), clear this
          site&apos;s data through your browser&apos;s settings - usually found under a site or storage permissions
          panel, sometimes labeled &quot;Clear browsing data&quot; or &quot;Site settings.&quot; Once advertising
          cookies are added, this section will include specific instructions for opting out of or clearing those as
          well, alongside the standard browser-level cookie controls every major browser provides.
        </p>

        <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Last updated: August 6, 2026</p>
      </div>
    </div>
  );
}
