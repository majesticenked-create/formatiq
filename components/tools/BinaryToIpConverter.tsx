'use client';

import { useMemo, useState } from 'react';
import { binaryToIp } from '@/lib/tools/ip-utils';

const SAMPLE_BINARY = '11000000 10101000 00000001 00000001';

export default function BinaryToIpConverter() {
  const [input, setInput] = useState(SAMPLE_BINARY);

  const result = useMemo(() => binaryToIp(input), [input]);

  function copyOutput() {
    if (result.ok) navigator.clipboard.writeText(result.ip);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Binary (32 bits, IPv4 only)</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={() => setInput('')}>
              Clear
            </button>
          </div>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="e.g. 11000000 10101000 00000001 00000001"
        />
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Valid 32-bit binary value' : `✗ ${result.message}`}
        </div>
      </div>

      {result.ok && (
        <div className="panel">
          <div className="panel-bar">
            <span>IPv4 address</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyOutput}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono" style={{ minHeight: 'auto', padding: '8px 12px' }}>
            {result.ip}
          </div>
        </div>
      )}
    </div>
  );
}
