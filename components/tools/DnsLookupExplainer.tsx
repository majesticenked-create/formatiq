'use client';

import { useState } from 'react';

interface RecordType {
  type: string;
  name: string;
  description: string;
  example: string;
  ttlNote: string;
}

const RECORD_TYPES: RecordType[] = [
  {
    type: 'A',
    name: 'Address record',
    description:
      'Maps a domain name to an IPv4 address. This is the most common DNS record type - when a browser resolves example.com, it\'s almost always looking up an A record to find the IPv4 address to connect to.',
    example: 'example.com.    3600  IN  A      93.184.216.34',
    ttlNote: 'Typically cached for minutes to a few hours (TTL commonly 300-3600 seconds).',
  },
  {
    type: 'AAAA',
    name: 'IPv6 address record',
    description:
      'The IPv6 equivalent of an A record, mapping a domain name to a 128-bit IPv6 address instead of a 32-bit IPv4 one. A domain can have both A and AAAA records simultaneously, letting clients connect over whichever protocol they support.',
    example: 'example.com.    3600  IN  AAAA   2606:2800:220:1:248:1893:25c8:1946',
    ttlNote: 'Typically cached similarly to A records (minutes to hours).',
  },
  {
    type: 'CNAME',
    name: 'Canonical name record',
    description:
      'An alias that points one domain name to another domain name, which is then resolved in turn. Commonly used to point a subdomain (like www.example.com) at a service\'s own domain (like a CDN or hosting provider) without needing to know or update that service\'s IP address directly.',
    example: 'www.example.com. 3600  IN  CNAME  example.com.',
    ttlNote: 'A CNAME cannot coexist with other record types on the same name (e.g. no A record alongside a CNAME for the same subdomain).',
  },
  {
    type: 'MX',
    name: 'Mail exchange record',
    description:
      'Specifies which mail servers accept email on behalf of a domain, along with a priority value - lower numbers are tried first. A domain can have multiple MX records for redundancy, with mail delivery falling back to the next one if the highest-priority server is unavailable.',
    example: 'example.com.    3600  IN  MX  10 mail.example.com.',
    ttlNote: 'Often cached longer than A records since mail routing changes infrequently.',
  },
  {
    type: 'TXT',
    name: 'Text record',
    description:
      'Holds arbitrary text data attached to a domain, most commonly used today for domain ownership verification (proving you control a domain to a third-party service) and email authentication standards like SPF, DKIM, and DMARC that help prevent email spoofing.',
    example: 'example.com.    3600  IN  TXT  "v=spf1 include:_spf.example.com ~all"',
    ttlNote: 'TTL varies widely by use case; SPF/DKIM records are often set low to allow quick updates.',
  },
  {
    type: 'NS',
    name: 'Name server record',
    description:
      'Delegates a domain (or subdomain) to a specific set of authoritative DNS name servers responsible for answering queries about it. NS records are what a domain registrar uses to point your domain at your DNS host\'s servers.',
    example: 'example.com.    86400 IN  NS   ns1.examplehost.com.',
    ttlNote: 'Usually cached for a full day (TTL commonly 86400 seconds) since name server assignments change rarely.',
  },
];

export default function DnsLookupExplainer() {
  const [selected, setSelected] = useState<string>('A');

  const record = RECORD_TYPES.find((r) => r.type === selected) ?? RECORD_TYPES[0];

  return (
    <div>
      <div className="status-line status-neutral" style={{ marginBottom: 16 }}>
        This tool explains what each DNS record type does and shows a typical example - it does not perform a
        live DNS lookup, since that requires a server-side resolver rather than something a browser can do
        entirely on its own.
      </div>

      <div className="control-row" style={{ flexWrap: 'wrap' }}>
        {RECORD_TYPES.map((r) => (
          <button
            key={r.type}
            className={`icon-btn ${selected === r.type ? 'is-active' : ''}`}
            onClick={() => setSelected(r.type)}
          >
            {r.type}
          </button>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>
            {record.type} - {record.name}
          </span>
        </div>
        <div style={{ padding: '16px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)' }}>
            {record.description}
          </p>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
            Typical example
          </div>
          <div className="output mono" style={{ minHeight: 'auto', padding: '10px 12px' }}>
            {record.example}
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10 }}>
            {record.ttlNote}
          </div>
        </div>
      </div>
    </div>
  );
}
