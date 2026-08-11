import Link from 'next/link';
import type { Metadata } from 'next';

const TITLE = 'Accessibility Statement | Formatiq';
const DESCRIPTION =
  'Formatiq’s current accessibility practices and known limitations across the site’s tools, plus how to report an issue you run into.';
const CANONICAL_URL = 'https://formatiq.tools/accessibility';

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

export default function AccessibilityPage() {
  return (
    <div className="container">
      <div className="tool-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="breadcrumb">
          <Link href="/">Formatiq</Link> / Accessibility Statement
        </div>
        <h1>Accessibility Statement</h1>
      </div>

      <div className="seo-content" style={{ borderTop: 'none' }}>
        <h2>Our commitment</h2>
        <p>
          Accessibility matters to us, and we want Formatiq&apos;s tools to be usable by as many people as possible,
          including people using screen readers, keyboard-only navigation, or a preference for reduced motion.
          That said, we want to be upfront: this is an ongoing effort, not a finished state. We are not claiming
          full WCAG 2.1 AA or AAA compliance, and this page has not been through a formal accessibility audit or
          certification. What follows is an honest account of what&apos;s actually in place today and what
          isn&apos;t yet, so you know what to expect rather than reading aspirational marketing copy.
        </p>

        <h2>What&apos;s implemented so far</h2>
        <p>Based on what&apos;s actually in the codebase today:</p>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: 20, marginBottom: 16 }}>
          <li>Visible keyboard focus indicators are applied site-wide via a global <code>:focus-visible</code> style, so tabbing through the site shows a clear outline around the focused element.</li>
          <li>Reduced motion is respected: a <code>prefers-reduced-motion</code> media query disables and shortens animations and transitions for users who&apos;ve set that preference in their OS or browser.</li>
          <li>Images that appear in tool output (like the image preview in the Base64 Image Converter) include descriptive <code>alt</code> text rather than being left blank.</li>
          <li>Icon-only controls we&apos;ve specifically checked - the theme toggle and the cookie consent dismiss button - have explicit <code>aria-label</code>s describing their action, not just a bare icon.</li>
        </ul>

        <h2>Known limitations</h2>
        <p>
          We&apos;d rather list these plainly than let you discover them yourself:
        </p>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: 20, marginBottom: 16 }}>
          <li>
            Many of the calculator and generator tools (date pickers, number inputs, range sliders) use a
            visually-adjacent <code>&lt;label&gt;</code> next to the input rather than a programmatically
            associated label (via <code>htmlFor</code>/<code>id</code> or <code>aria-label</code>). Sighted mouse
            users see the label; screen reader users focusing the input directly may not hear it announced. This
            affects a meaningful number of tools and is the most significant gap we&apos;re aware of right now.
          </li>
          <li>
            A few tools use hardcoded text colors for status indicators - for example, the Password Generator&apos;s
            strength label - that were chosen against the dark theme and haven&apos;t been individually verified for
            contrast against the light theme&apos;s white background. Most of the site&apos;s colors come from a
            shared token system that was checked across both themes, but these specific hardcoded values were not
            part of that system and may need adjusting.
          </li>
          <li>
            No formal accessibility audit (automated tooling like axe, or manual screen reader testing) has been
            performed across the site&apos;s 50+ tools. What&apos;s listed above reflects a direct code review, not
            comprehensive testing, so there are likely other gaps we haven&apos;t found yet.
          </li>
        </ul>

        <h2>How to get help or report an issue</h2>
        <p>
          If you run into an accessibility barrier using any tool on this site, please{' '}
          <Link href="/contact">get in touch</Link> - mentioning which tool (its category and slug from the URL)
          and what assistive technology or browser you were using helps us track it down faster.
        </p>

        <h2>Changes to this statement</h2>
        <p>
          As gaps are fixed or new ones are found, we&apos;ll update this page to reflect the current state rather
          than leaving outdated claims in place.
        </p>

        <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Last updated: August 6, 2026</p>
      </div>
    </div>
  );
}
