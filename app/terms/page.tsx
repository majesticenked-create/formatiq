import Link from 'next/link';
import type { Metadata } from 'next';

const TITLE = 'Terms of Service | Formatiq';
const DESCRIPTION =
  'The terms governing use of Formatiq’s free, browser-based developer tools, including acceptable use and liability limitations.';
const CANONICAL_URL = 'https://formatiq.tools/terms';

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

export default function TermsPage() {
  return (
    <div className="container">
      <div className="tool-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="breadcrumb">
          <Link href="/">Formatiq</Link> / Terms of Service
        </div>
        <h1>Terms of Service</h1>
      </div>

      <div className="seo-content" style={{ borderTop: 'none' }}>
        <h2>Acceptance of terms</h2>
        <p>
          By accessing or using Formatiq, you agree to these Terms of Service. If you don&apos;t agree with any part
          of these terms, please don&apos;t use the site.
        </p>

        <h2>Description of service</h2>
        <p>
          Formatiq provides free, browser-based developer tools - formatters, converters, validators, generators,
          and related utilities - made available &quot;as-is&quot; and &quot;as-available.&quot; We don&apos;t
          guarantee that the site will be available at all times, free of interruptions, or free of bugs, nor do we
          guarantee that any tool&apos;s output will always be accurate, complete, or fit for any particular
          purpose.
        </p>

        <h2>No warranty on tool accuracy</h2>
        <p>
          Every tool on this site is provided for convenience, and none of them come with a guarantee of
          correctness. This matters most for the validator tools specifically - for example, the credit card
          validator only checks Luhn checksum formatting and does not confirm a card is real, active, or funded; the
          cron validator checks standard 5-field syntax but doesn&apos;t know about every scheduler&apos;s
          dialect-specific extensions; and every formatter, converter, and calculator on the site can have edge
          cases it doesn&apos;t handle perfectly. You are responsible for independently verifying any result before
          relying on it for a production system, a financial decision, a legal document, or any other
          consequential or safety-critical use. Do not treat any tool&apos;s output as a substitute for your own
          review or for professional advice where relevant (legal, medical, financial, or otherwise).
        </p>

        <h2>Acceptable use</h2>
        <p>
          You agree not to use Formatiq to attempt to abuse, disrupt, or gain unauthorized access to the site or its
          infrastructure; to scrape or send automated requests at a volume that degrades the service for other
          users; or to use the site in furtherance of any illegal purpose.
        </p>

        <h2>Intellectual property</h2>
        <p>
          Formatiq&apos;s name, branding, design, and site code are owned by Formatiq (or its licensors) and are not
          licensed to you beyond what&apos;s needed to use the tools as intended. Separately: anything you type or
          paste into a tool is processed entirely in your own browser, is never transmitted to or stored on our
          servers, and is never claimed by Formatiq in any way - it remains entirely yours.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Formatiq and its operators will not be liable for any indirect,
          incidental, special, or consequential damages arising from your use of, or inability to use, the site or
          any tool on it - including damages resulting from inaccurate tool output, service interruptions, or data
          loss. The site is provided free of charge, without warranty of any kind, express or implied.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We may update these terms from time to time as the site evolves. Continued use of Formatiq after changes
          are posted constitutes acceptance of the updated terms. Please check back periodically for the current
          version.
        </p>

        <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Last updated: August 6, 2026</p>
      </div>
    </div>
  );
}
