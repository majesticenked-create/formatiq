'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cookie-consent';

type ConsentValue = 'accepted' | 'rejected';

function recordConsent(value: ConsentValue) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, timestamp: new Date().toISOString() }));
  // Lets already-mounted components (e.g. GoogleAnalytics) react immediately without
  // requiring a page reload - see components/GoogleAnalytics.tsx for the listener.
  window.dispatchEvent(new CustomEvent('formatiq-cookie-consent', { detail: value }));
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
          This site uses Google Analytics to understand traffic - no tool input is ever included. See our{' '}
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
