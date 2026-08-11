'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cookie-consent';

type ConsentValue = 'accepted' | 'rejected';

function recordConsent(value: ConsentValue) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, timestamp: new Date().toISOString() }));

  // TODO: Once Google AdSense or an analytics script (GA4, Plausible, etc.) is
  // actually added to this codebase, it must check this stored consent value
  // BEFORE loading — do not fire any ad or tracking script unconditionally.
  // e.g.:
  //   const consent = JSON.parse(localStorage.getItem('cookie-consent') ?? 'null');
  //   if (consent?.value === 'accepted') { /* load ad/analytics script here */ }
  // No such script exists in the codebase yet, so there is nothing to gate today —
  // this comment marks exactly where that gate belongs when one is added.
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    recordConsent('accepted');
    setVisible(false);
  }

  function handleReject() {
    recordConsent('rejected');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="region" aria-label="Cookie consent">
      <div className="cookie-consent-inner">
        <p>
          This site may use cookies for ads and analytics once those are live. See our{' '}
          <Link href="/privacy">Privacy Policy</Link> for details.
        </p>
        <div className="cookie-consent-actions">
          <button type="button" className="btn btn-secondary" onClick={handleReject}>
            Reject non-essential
          </button>
          <button type="button" className="btn btn-primary" onClick={handleAccept}>
            Accept all
          </button>
          <button
            type="button"
            className="cookie-consent-close"
            onClick={handleReject}
            aria-label="Dismiss (counts as reject non-essential)"
            title="Dismiss (counts as reject non-essential)"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
