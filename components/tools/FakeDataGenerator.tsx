'use client';

import { useState } from 'react';

const FIRST_NAMES = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'Sofia', 'Wei', 'Amara', 'Diego'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Chen', 'Okafor'];
const STREET_NAMES = ['Maple', 'Oak', 'Main', 'Cedar', 'Elm', 'Washington', 'Lake', 'Hill', 'Park', 'Sunset'];
const STREET_TYPES = ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Rd'];
const CITIES = ['Springfield', 'Riverside', 'Franklin', 'Georgetown', 'Clinton', 'Salem', 'Fairview', 'Madison'];
const STATES = ['CA', 'TX', 'NY', 'FL', 'IL', 'OH', 'WA', 'CO'];
const COMPANY_PREFIXES = ['Nexa', 'Vertex', 'Bright', 'Summit', 'Cobalt', 'Falcon', 'Lumen', 'Atlas', 'Quantum', 'Cedar'];
const COMPANY_SUFFIXES = ['Solutions', 'Group', 'Technologies', 'Industries', 'Partners', 'Labs', 'Dynamics', 'Systems'];
const EMAIL_DOMAINS = ['example.com', 'mail.com', 'testmail.io', 'sample.org'];

interface Field {
  key: string;
  label: string;
}

const FIELDS: Field[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'company', label: 'Company' },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDigits(n: number): string {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
}

function generateRow(): Record<string, string> {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const name = `${first} ${last}`;
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(Math.random() * 100)}@${pick(EMAIL_DOMAINS)}`;
  const phone = `(${randomDigits(3)}) ${randomDigits(3)}-${randomDigits(4)}`;
  const address = `${Math.floor(Math.random() * 9000) + 100} ${pick(STREET_NAMES)} ${pick(STREET_TYPES)}, ${pick(CITIES)}, ${pick(
    STATES
  )} ${randomDigits(5)}`;
  const company = `${pick(COMPANY_PREFIXES)} ${pick(COMPANY_SUFFIXES)}`;

  return { name, email, phone, address, company };
}

export default function FakeDataGenerator() {
  const [count, setCount] = useState(10);
  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({
    name: true,
    email: true,
    phone: true,
    address: true,
    company: true,
  });
  const [rows, setRows] = useState<Record<string, string>[]>(() => Array.from({ length: 10 }, generateRow));

  function regenerate() {
    setRows(Array.from({ length: count }, generateRow));
  }

  function toggleField(key: string) {
    setEnabledFields((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const activeFields = FIELDS.filter((f) => enabledFields[f.key]);

  function copyAsCsv() {
    const headers = activeFields.map((f) => f.label).join(',');
    const lines = rows.map((row) =>
      activeFields
        .map((f) => {
          const value = row[f.key];
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(',')
    );
    navigator.clipboard.writeText([headers, ...lines].join('\n'));
  }

  function copyAsJson() {
    const data = rows.map((row) => {
      const obj: Record<string, string> = {};
      activeFields.forEach((f) => {
        obj[f.key] = row[f.key];
      });
      return obj;
    });
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  }

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Rows: {count}
        </label>
        <input
          type="range"
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={{ width: 160 }}
        />
        <button className="btn btn-primary" onClick={regenerate}>
          Generate
        </button>
        <button className="icon-btn" onClick={copyAsCsv} disabled={activeFields.length === 0}>
          Copy as CSV
        </button>
        <button className="icon-btn" onClick={copyAsJson} disabled={activeFields.length === 0}>
          Copy as JSON
        </button>
      </div>

      <div className="control-row">
        {FIELDS.map((f) => (
          <button
            key={f.key}
            className="icon-btn"
            style={{
              borderColor: enabledFields[f.key] ? 'var(--accent-dim)' : undefined,
              color: enabledFields[f.key] ? 'var(--text-primary)' : undefined,
            }}
            onClick={() => toggleField(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Generated data ({rows.length} row(s))</span>
        </div>
        <div style={{ overflowX: 'auto', padding: 12 }}>
          {activeFields.length === 0 ? (
            <div className="mono">Select at least one field to display data.</div>
          ) : (
            <table className="mono" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  {activeFields.map((f) => (
                    <th
                      key={f.key}
                      style={{
                        textAlign: 'left',
                        borderBottom: '1px solid var(--border)',
                        padding: '6px 10px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    {activeFields.map((f) => (
                      <td
                        key={f.key}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          padding: '6px 10px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row[f.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
