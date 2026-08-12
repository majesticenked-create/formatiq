'use client';

import { useState } from 'react';

interface Country {
  code: string;
  name: string;
  flag: string;
  continent: string;
}

const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', continent: 'North America' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', continent: 'North America' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', continent: 'North America' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', continent: 'South America' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', continent: 'South America' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', continent: 'South America' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', continent: 'South America' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', continent: 'Europe' },
  { code: 'FR', name: 'France', flag: '🇫🇷', continent: 'Europe' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', continent: 'Europe' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', continent: 'Europe' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', continent: 'Europe' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', continent: 'Europe' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', continent: 'Europe' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', continent: 'Europe' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', continent: 'Europe' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', continent: 'Europe' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', continent: 'Europe' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', continent: 'Europe' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', continent: 'Europe' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', continent: 'Europe' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', continent: 'Europe' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', continent: 'Asia' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', continent: 'Africa' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', continent: 'Africa' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', continent: 'Africa' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', continent: 'Africa' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', continent: 'Africa' },
  { code: 'CN', name: 'China', flag: '🇨🇳', continent: 'Asia' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', continent: 'Asia' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', continent: 'Asia' },
  { code: 'IN', name: 'India', flag: '🇮🇳', continent: 'Asia' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', continent: 'Asia' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', continent: 'Asia' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', continent: 'Asia' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', continent: 'Asia' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', continent: 'Asia' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', continent: 'Asia' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', continent: 'Asia' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', continent: 'Asia' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', continent: 'Oceania' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', continent: 'Oceania' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', continent: 'Europe' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', continent: 'Europe' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', continent: 'Europe' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', continent: 'Europe' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', continent: 'Europe' },
  { code: 'CZ', name: 'Czechia', flag: '🇨🇿', continent: 'Europe' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', continent: 'Europe' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', continent: 'South America' },
];

function randomCountry(exclude?: string): Country {
  const pool = exclude ? COUNTRIES.filter((c) => c.code !== exclude) : COUNTRIES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function RandomFlagGenerator() {
  const [country, setCountry] = useState<Country>(() => randomCountry());
  const [history, setHistory] = useState<Country[]>([]);

  function generateAnother() {
    setHistory((prev) => [country, ...prev].slice(0, 8));
    setCountry(randomCountry(country.code));
  }

  return (
    <div>
      <div className="panel" style={{ padding: '48px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 96, lineHeight: 1 }}>{country.flag}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginTop: 16 }}>
          {country.name}
        </div>
        <div className="mono" style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>
          {country.code} - {country.continent}
        </div>
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={generateAnother}>
          Generate another
        </button>
      </div>

      {history.length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-bar">
            <span>Recently shown</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: 14 }}>
            {history.map((c, i) => (
              <div
                key={`${c.code}-${i}`}
                className="mono"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  padding: '6px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ fontSize: 16 }}>{c.flag}</span>
                {c.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
