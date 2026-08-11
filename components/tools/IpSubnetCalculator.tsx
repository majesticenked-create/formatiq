'use client';

import { useMemo, useState } from 'react';

const SAMPLE = '192.168.1.0/24';

function parseIp(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  if (parts.some((p) => !/^\d+$/.test(p))) return null;
  const values = parts.map(Number);
  if (values.some((v) => v < 0 || v > 255)) return null;
  return ((values[0] << 24) | (values[1] << 16) | (values[2] << 8) | values[3]) >>> 0;
}

function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

function tryCalculate(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false as const, message: 'Enter an IP address with CIDR notation, e.g. 192.168.1.0/24.' };
  }

  const parts = trimmed.split('/');
  if (parts.length !== 2) {
    return { ok: false as const, message: 'Expected format: IP/prefix, e.g. 192.168.1.0/24.' };
  }

  const [ipStr, prefixStr] = parts;
  const ipInt = parseIp(ipStr);
  if (ipInt === null) {
    return { ok: false as const, message: `"${ipStr}" is not a valid IPv4 address - each of the 4 parts must be 0-255.` };
  }

  if (!/^\d+$/.test(prefixStr)) {
    return { ok: false as const, message: `"${prefixStr}" is not a valid CIDR prefix.` };
  }
  const prefix = Number(prefixStr);
  if (prefix < 0 || prefix > 32) {
    return { ok: false as const, message: `CIDR prefix must be between 0 and 32, got ${prefix}.` };
  }

  const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;

  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? 0 : totalHosts - 2;

  const firstUsable = prefix >= 31 ? intToIp(networkInt) : intToIp(networkInt + 1);
  const lastUsable = prefix >= 31 ? intToIp(broadcastInt) : intToIp(broadcastInt - 1);

  return {
    ok: true as const,
    network: intToIp(networkInt),
    broadcast: intToIp(broadcastInt),
    subnetMask: intToIp(maskInt),
    prefix,
    firstUsable,
    lastUsable,
    usableHosts,
    totalHosts,
  };
}

export default function IpSubnetCalculator() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => tryCalculate(input), [input]);

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setInput('')}>
          Clear
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>IP address / CIDR</span>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="e.g. 192.168.1.0/24"
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Valid subnet' : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div className="panel">
          <div className="panel-bar">
            <span>Subnet details</span>
          </div>
          <div className="output mono">
            {[
              `Network address:    ${result.network}`,
              `Broadcast address:  ${result.broadcast}`,
              `Subnet mask:        ${result.subnetMask} (/${result.prefix})`,
              `Usable host range:  ${result.firstUsable} - ${result.lastUsable}`,
              `Usable hosts:       ${result.usableHosts.toLocaleString()}`,
              `Total addresses:    ${result.totalHosts.toLocaleString()}`,
            ].join('\n')}
          </div>
        </div>
      )}
    </div>
  );
}
