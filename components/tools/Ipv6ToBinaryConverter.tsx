'use client';

import { useMemo, useState } from 'react';

interface Ipv6Result {
  ok: true;
  groups: string[];
  binaryGroups: string[];
  fullBinary: string;
}
interface Ipv6Error {
  ok: false;
  message: string;
}

function isIPv4Tail(segment: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(segment);
}

function ipv4ToHexGroups(ipv4: string): string[] | null {
  const parts = ipv4.split('.');
  if (parts.length !== 4) return null;
  const values = parts.map(Number);
  if (values.some((v) => !Number.isInteger(v) || v < 0 || v > 255)) return null;
  const hex = values.map((v) => v.toString(16).padStart(2, '0')).join('');
  return [hex.slice(0, 4), hex.slice(4, 8)];
}

function expandIpv6(input: string): Ipv6Result | Ipv6Error {
  const trimmed = input.trim();
  if (trimmed === '') return { ok: false, message: 'Enter an IPv6 address.' };

  const doubleColonCount = (trimmed.match(/::/g) || []).length;
  if (doubleColonCount > 1) {
    return { ok: false, message: 'An IPv6 address can contain at most one "::" compression.' };
  }

  let left: string;
  let right: string;
  let hasCompression = false;

  if (doubleColonCount === 1) {
    hasCompression = true;
    const sides = trimmed.split('::');
    left = sides[0];
    right = sides[1];
  } else {
    left = trimmed;
    right = '';
  }

  // Handle an embedded IPv4 tail, e.g. ::ffff:192.168.1.1
  let rightGroups = right === '' ? [] : right.split(':');
  const lastRightSegment = rightGroups[rightGroups.length - 1];
  if (lastRightSegment && isIPv4Tail(lastRightSegment)) {
    const ipv4Hex = ipv4ToHexGroups(lastRightSegment);
    if (!ipv4Hex) {
      return { ok: false, message: `"${lastRightSegment}" is not a valid embedded IPv4 tail.` };
    }
    rightGroups = [...rightGroups.slice(0, -1), ...ipv4Hex];
  }

  let leftGroups = left === '' ? [] : left.split(':');
  const lastLeftSegment = leftGroups[leftGroups.length - 1];
  if (!hasCompression && lastLeftSegment && isIPv4Tail(lastLeftSegment)) {
    const ipv4Hex = ipv4ToHexGroups(lastLeftSegment);
    if (!ipv4Hex) {
      return { ok: false, message: `"${lastLeftSegment}" is not a valid embedded IPv4 tail.` };
    }
    leftGroups = [...leftGroups.slice(0, -1), ...ipv4Hex];
  }

  const isValidHexGroup = (g: string) => /^[0-9a-fA-F]{1,4}$/.test(g);

  if (leftGroups.some((g) => g !== '' && !isValidHexGroup(g))) {
    return { ok: false, message: 'Each group must be 1-4 hexadecimal digits.' };
  }
  if (rightGroups.some((g) => g !== '' && !isValidHexGroup(g))) {
    return { ok: false, message: 'Each group must be 1-4 hexadecimal digits.' };
  }

  // Filter out a single empty string that results from splitting "" (e.g. "::" alone -> left="" right="")
  const leftFiltered = leftGroups.length === 1 && leftGroups[0] === '' ? [] : leftGroups;
  const rightFiltered = rightGroups.length === 1 && rightGroups[0] === '' ? [] : rightGroups;

  let allGroups: string[];

  if (hasCompression) {
    const zerosNeeded = 8 - leftFiltered.length - rightFiltered.length;
    if (zerosNeeded < 0) {
      return { ok: false, message: 'Too many groups for a compressed IPv6 address (8 groups max, including the "::" expansion).' };
    }
    if (zerosNeeded === 0) {
      return {
        ok: false,
        message: 'The "::" must represent at least one group of zeros - this address already has all 8 groups.',
      };
    }
    allGroups = [...leftFiltered, ...Array(zerosNeeded).fill('0'), ...rightFiltered];
  } else {
    allGroups = leftFiltered;
    if (allGroups.length !== 8) {
      return {
        ok: false,
        message: `Expected exactly 8 groups without "::" compression, but found ${allGroups.length}.`,
      };
    }
  }

  const groups = allGroups.map((g) => g.toLowerCase().padStart(1, '0') || '0');
  const binaryGroups = groups.map((g) => parseInt(g, 16).toString(2).padStart(16, '0'));

  return {
    ok: true,
    groups: groups.map((g) => g.padStart(4, '0')),
    binaryGroups,
    fullBinary: binaryGroups.join(''),
  };
}

export default function Ipv6ToBinaryConverter() {
  const [input, setInput] = useState('2001:db8::1');

  const result = useMemo(() => expandIpv6(input), [input]);

  function copyBinary() {
    if (result.ok) navigator.clipboard.writeText(result.fullBinary);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>IPv6 address</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setInput('')}>
              Clear
            </button>
          </div>
        </div>
        <input
          className="mono"
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="e.g. 2001:db8::1 or ::1"
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Valid IPv6 address' : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div>
          <div className="panel" style={{ marginBottom: 8 }}>
            <div className="panel-bar">
              <span>Full 128-bit binary</span>
              <div className="panel-actions">
                <button className="icon-btn" onClick={copyBinary}>
                  Copy
                </button>
              </div>
            </div>
            <div className="output mono" style={{ minHeight: 'auto', padding: '8px 12px', wordBreak: 'break-all' }}>
              {result.fullBinary}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {result.groups.map((g, i) => (
              <div key={i} className="panel" style={{ padding: 14 }}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  Group {i + 1}: {g}
                </div>
                <div className="mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 4, wordBreak: 'break-all' }}>
                  {result.binaryGroups[i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
