'use client';

import { useState } from 'react';

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button type="button" className="copy-link-btn" onClick={copyLink}>
      {copied ? 'Copied!' : 'Copy link to this tool'}
    </button>
  );
}
