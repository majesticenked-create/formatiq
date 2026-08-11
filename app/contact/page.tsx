import Link from 'next/link';
import type { Metadata } from 'next';

const TITLE = 'Contact | Formatiq';
const DESCRIPTION =
  'Get in touch with Formatiq about bug reports, tool suggestions, general feedback, or questions about how your data is handled.';
const CANONICAL_URL = 'https://formatiq.tools/contact';

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

// TODO: Replace contact@REPLACE-WITH-YOUR-DOMAIN.example with a real,
// monitored email address before launch.
//
// This uses plain mailto: links because there's no backend API route in
// this codebase today, and a form that silently goes nowhere is worse than
// no form at all. A real contact form (e.g. via a service like Formspree,
// or a Next.js API route + an email-sending service) is a bigger addition
// — worth doing later, but this ships something that actually works now.
const CONTACT_EMAIL = 'contact@REPLACE-WITH-YOUR-DOMAIN.example';

const CATEGORIES = [
  {
    label: 'Report a bug',
    subject: 'Bug report',
    description: 'Found something broken? Mention which tool (e.g. category/slug from the URL, like formatters/json-formatter) and what happened.',
  },
  {
    label: 'Suggest a tool',
    subject: 'Tool suggestion',
    description: 'Have an idea for a tool that isn’t here yet? Let us know what it should do.',
  },
  {
    label: 'Privacy question',
    subject: 'Privacy question',
    description: 'Questions about data handling - see the Privacy Policy first, then reach out here if it doesn’t answer yours.',
  },
];

function mailtoWithSubject(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export default function ContactPage() {
  return (
    <div className="container">
      <div className="tool-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="breadcrumb">
          <Link href="/">Formatiq</Link> / Contact
        </div>
        <h1>Contact</h1>
      </div>

      <div className="seo-content" style={{ borderTop: 'none' }}>
        <h2>Get in touch</h2>
        <p>
          Reach out about a bug on a specific tool, a suggestion for a new tool, general feedback, or a question
          about the <Link href="/privacy">Privacy Policy</Link> or <Link href="/terms">Terms of Service</Link>. If
          you&apos;re reporting a bug, mentioning which tool you were using - its category and slug from the URL,
          like <code>formatters/json-formatter</code> or <code>validators/credit-card-validator</code> - makes it
          much faster to track down and fix, since there are over 50 tools on this site.
        </p>

        <div className="hero-actions" style={{ marginTop: 20, marginBottom: 32 }}>
          <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-primary">
            Email us
          </a>
        </div>

        <h2>Or contact us about something specific</h2>
        <p>
          These links pre-fill the subject line so your message gets sorted at a glance:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16, marginBottom: 8 }}>
          {CATEGORIES.map((cat) => (
            <div key={cat.subject} className="panel" style={{ padding: 16 }}>
              <a href={mailtoWithSubject(cat.subject)} className="btn btn-secondary" style={{ marginBottom: 8 }}>
                {cat.label}
              </a>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>{cat.description}</p>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: 32 }}>How to reach us</h2>
        <p>
          Email is currently the only way to reach Formatiq - there&apos;s no live chat or support ticket system.
          We read every message, but as a small free tools site, response times may vary.
        </p>

        <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Last updated: August 6, 2026</p>
      </div>
    </div>
  );
}
