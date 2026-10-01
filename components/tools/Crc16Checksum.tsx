'use client';

import { useMemo, useState } from 'react';
import { crc16Variant, CRC16_VARIANTS, type Crc16Variant } from '@/lib/tools/crc16';

const VARIANTS: Crc16Variant[] = ['CRC-16/ARC', 'CRC-16/CCITT-FALSE', 'CRC-16/XMODEM'];

const VARIANT_NOTES: Record<Crc16Variant, string> = {
  'CRC-16/ARC': 'Used by ARC/LHA archives and Modbus-style protocols. Reflected input and output.',
  'CRC-16/CCITT-FALSE': 'A common CCITT-derived variant used in some firmware and protocol checksums. Non-reflected.',
  'CRC-16/XMODEM': 'Used by the XMODEM file transfer protocol. Non-reflected, zero initial value.',
};

export default function Crc16Checksum() {
  const [text, setText] = useState('Formatiq');
  const [variant, setVariant] = useState<Crc16Variant>('CRC-16/ARC');

  const checksum = useMemo(() => {
    if (!text) return null;
    return crc16Variant(new TextEncoder().encode(text), variant);
  }, [text, variant]);

  const hex = checksum !== null ? checksum.toString(16).padStart(4, '0').toUpperCase() : null;
  const params = CRC16_VARIANTS[variant];

  function copy() {
    if (hex) navigator.clipboard.writeText(hex);
  }

  return (
    <div>
      <div className="control-row">
        {VARIANTS.map((v) => (
          <button
            key={v}
            className={`icon-btn ${variant === v ? 'is-active' : ''}`}
            onClick={() => setVariant(v)}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Text input</span>
        </div>
        <textarea className="mono" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>{variant} checksum</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={copy} disabled={!hex}>
              Copy
            </button>
          </div>
        </div>
        <div className="output mono" style={{ minHeight: 'auto', padding: '10px 12px' }}>
          {hex ?? '- enter text above'}
        </div>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Variant parameters</span>
        </div>
        <div className="mono" style={{ padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
          <div>poly=0x{params.poly.toString(16).toUpperCase()}, init=0x{params.init.toString(16).toUpperCase().padStart(4, '0')}, refin={String(params.refin)}, refout={String(params.refout)}, xorout=0x{params.xorout.toString(16).toUpperCase().padStart(4, '0')}</div>
          <div style={{ marginTop: 6 }}>{VARIANT_NOTES[variant]}</div>
        </div>
        <div className="status-line status-neutral">
          CRC-16 is a checksum for detecting accidental data corruption (bit flips, transmission
          errors) - it is not a cryptographic hash. Never rely on it for passwords, digital
          signatures, or protecting data against deliberate tampering.
        </div>
      </div>
    </div>
  );
}
