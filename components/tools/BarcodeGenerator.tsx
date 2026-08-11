'use client';

import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';

type Format = 'CODE128' | 'EAN13';

const SAMPLES: Record<Format, string> = {
  CODE128: 'FORMATIQ-2026',
  EAN13: '5901234123457',
};

export default function BarcodeGenerator() {
  const [format, setFormat] = useState<Format>('CODE128');
  const [input, setInput] = useState(SAMPLES.CODE128);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    if (!input.trim()) {
      setError(format === 'EAN13' ? 'Enter exactly 12 or 13 digits to generate an EAN-13 barcode.' : 'Enter text to encode.');
      svg.innerHTML = '';
      return;
    }

    try {
      JsBarcode(svg, input, {
        format,
        width: 2,
        height: 100,
        displayValue: true,
        background: 'transparent',
        lineColor: '#e7eaf0',
        fontOptions: '',
        font: 'monospace',
        textMargin: 6,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate a barcode for this input.');
      svg.innerHTML = '';
    }
  }, [input, format]);

  function switchFormat(next: Format) {
    setFormat(next);
    setInput(SAMPLES[next]);
  }

  function downloadPng() {
    const svg = svgRef.current;
    if (!svg || error) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 3;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.download = 'barcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  }

  return (
    <div>
      <div className="control-row">
        <button className={`icon-btn ${format === 'CODE128' ? 'is-active' : ''}`} onClick={() => switchFormat('CODE128')}>
          Code 128
        </button>
        <button className={`icon-btn ${format === 'EAN13' ? 'is-active' : ''}`} onClick={() => switchFormat('EAN13')}>
          EAN-13
        </button>
        <button className="icon-btn" onClick={downloadPng} disabled={!!error}>
          Download as PNG
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>{format === 'EAN13' ? '12 or 13 digit number' : 'Text or number to encode'}</span>
        </div>
        <textarea
          className="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder={format === 'EAN13' ? 'e.g. 5901234123457' : 'Enter text or a number to encode...'}
        />
        <div className={`status-line ${error ? 'status-invalid' : 'status-valid'}`}>
          {error ? `✗ ${error}` : '✓ Barcode generated below'}
        </div>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Barcode</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 16, background: 'var(--surface)' }}>
          <svg ref={svgRef} role="img" aria-label={input ? `Barcode encoding: ${input.slice(0, 80)}` : 'Barcode preview'} />
        </div>
      </div>
    </div>
  );
}
