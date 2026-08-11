'use client';

import { useState } from 'react';

type Region = 'US' | 'UK' | 'INTL';

const US_STREET_NAMES = ['Maple', 'Oak', 'Cedar', 'Elm', 'Washington', 'Lake', 'Hill', 'Park', 'Sunset', 'Birch'];
const US_STREET_TYPES = ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Rd', 'Ct'];
const US_CITIES = ['Springfield', 'Riverside', 'Franklin', 'Georgetown', 'Clinton', 'Salem', 'Fairview', 'Madison'];
const US_STATES = [
  { abbr: 'CA', name: 'California' },
  { abbr: 'TX', name: 'Texas' },
  { abbr: 'NY', name: 'New York' },
  { abbr: 'FL', name: 'Florida' },
  { abbr: 'IL', name: 'Illinois' },
  { abbr: 'WA', name: 'Washington' },
  { abbr: 'CO', name: 'Colorado' },
];

const UK_STREET_NAMES = ['Church', 'Station', 'Victoria', 'King', 'Queen', 'High', 'Mill', 'Manor', 'Green', 'Windsor'];
const UK_STREET_TYPES = ['Street', 'Road', 'Lane', 'Close', 'Avenue', 'Way', 'Gardens'];
const UK_TOWNS = ['Ashby', 'Bramley', 'Clifton', 'Denby', 'Elmsworth', 'Foxton', 'Greendale', 'Hawksworth'];
const UK_COUNTIES = ['Surrey', 'Kent', 'Yorkshire', 'Essex', 'Sussex', 'Hampshire', 'Cheshire'];

const INTL_STREET_NAMES = ['Rue de la Paix', 'Via Roma', 'Bahnhofstrasse', 'Calle Mayor', 'Ginza', 'Nanjing Road'];
const INTL_CITIES = [
  { city: 'Paris', country: 'France' },
  { city: 'Berlin', country: 'Germany' },
  { city: 'Tokyo', country: 'Japan' },
  { city: 'Sydney', country: 'Australia' },
  { city: 'Toronto', country: 'Canada' },
  { city: 'São Paulo', country: 'Brazil' },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDigits(n: number): string {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
}

function randomLetters(n: number): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return Array.from({ length: n }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
}

function generateUsAddress(): string {
  const number = Math.floor(Math.random() * 9000) + 100;
  const state = pick(US_STATES);
  return `${number} ${pick(US_STREET_NAMES)} ${pick(US_STREET_TYPES)}\n${pick(US_CITIES)}, ${state.abbr} ${randomDigits(5)}\nUnited States`;
}

function generateUkAddress(): string {
  const number = Math.floor(Math.random() * 200) + 1;
  const postcode = `${randomLetters(2)}${Math.floor(Math.random() * 9) + 1} ${Math.floor(Math.random() * 9)}${randomLetters(2)}`;
  return `${number} ${pick(UK_STREET_NAMES)} ${pick(UK_STREET_TYPES)}\n${pick(UK_TOWNS)}, ${pick(UK_COUNTIES)}\n${postcode}\nUnited Kingdom`;
}

function generateIntlAddress(): string {
  const number = Math.floor(Math.random() * 200) + 1;
  const place = pick(INTL_CITIES);
  return `${number} ${pick(INTL_STREET_NAMES)}\n${randomDigits(5)} ${place.city}\n${place.country}`;
}

function generateAddress(region: Region): string {
  if (region === 'US') return generateUsAddress();
  if (region === 'UK') return generateUkAddress();
  return generateIntlAddress();
}

export default function RandomAddressGenerator() {
  const [region, setRegion] = useState<Region>('US');
  const [count, setCount] = useState(5);
  const [addresses, setAddresses] = useState<string[]>(() => Array.from({ length: 5 }, () => generateUsAddress()));
  const [copied, setCopied] = useState(false);

  function regenerate(r = region, n = count) {
    setAddresses(Array.from({ length: n }, () => generateAddress(r)));
  }

  function copyAll() {
    navigator.clipboard.writeText(addresses.join('\n\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="control-row">
        <button
          className={`icon-btn ${region === 'US' ? 'is-active' : ''}`}
          onClick={() => {
            setRegion('US');
            regenerate('US', count);
          }}
        >
          United States
        </button>
        <button
          className={`icon-btn ${region === 'UK' ? 'is-active' : ''}`}
          onClick={() => {
            setRegion('UK');
            regenerate('UK', count);
          }}
        >
          United Kingdom
        </button>
        <button
          className={`icon-btn ${region === 'INTL' ? 'is-active' : ''}`}
          onClick={() => {
            setRegion('INTL');
            regenerate('INTL', count);
          }}
        >
          International
        </button>
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Count:
        </label>
        <input
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(e) => {
            const n = Math.min(20, Math.max(1, Number(e.target.value) || 1));
            setCount(n);
          }}
          className="mono"
          style={{
            width: 64,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
        <button className="btn btn-primary" onClick={() => regenerate()}>
          Generate
        </button>
        <button className="icon-btn" onClick={copyAll}>
          {copied ? 'Copied!' : 'Copy all'}
        </button>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Generated addresses</span>
        </div>
        <div className="output mono" style={{ whiteSpace: 'pre-wrap' }}>
          {addresses.join('\n\n')}
        </div>
        <div className="status-line status-neutral">{addresses.length} generated</div>
      </div>
    </div>
  );
}
