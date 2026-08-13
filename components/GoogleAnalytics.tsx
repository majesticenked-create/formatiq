'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const STORAGE_KEY = 'cookie-consent';
const MEASUREMENT_ID = 'G-PBFVDJRGY8';

export default function GoogleAnalytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    function checkConsent() {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
        if (stored?.value === 'accepted') setConsented(true);
      } catch {
        /* malformed storage value - treat as no consent */
      }
    }

    checkConsent();

    function handleConsentEvent(e: Event) {
      const detail = (e as CustomEvent<'accepted' | 'rejected'>).detail;
      if (detail === 'accepted') setConsented(true);
    }

    window.addEventListener('formatiq-cookie-consent', handleConsentEvent);
    return () => window.removeEventListener('formatiq-cookie-consent', handleConsentEvent);
  }, []);

  if (!consented) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
