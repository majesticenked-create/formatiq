'use client';

import { useMemo, useState } from 'react';

function ratioAssessment(ratio: number): string {
  if (ratio >= 2) return 'Strong - current assets comfortably exceed current liabilities';
  if (ratio >= 1) return 'Healthy - current assets cover current liabilities';
  if (ratio >= 0.8) return 'Moderate - worth watching alongside other liquidity metrics';
  return 'Weak - current liabilities exceed current assets by a meaningful margin';
}

function calculateCurrentRatio(currentAssetsStr: string, currentLiabilitiesStr: string) {
  const currentAssets = Number(currentAssetsStr);
  const currentLiabilities = Number(currentLiabilitiesStr);

  if (!currentAssetsStr || Number.isNaN(currentAssets) || currentAssets < 0) {
    return { ok: false as const, message: 'Enter current assets of zero or greater.' };
  }
  if (!currentLiabilitiesStr || Number.isNaN(currentLiabilities) || currentLiabilities <= 0) {
    return { ok: false as const, message: 'Enter current liabilities greater than zero.' };
  }

  const ratio = currentAssets / currentLiabilities;
  return { ok: true as const, ratio, assessment: ratioAssessment(ratio) };
}

const inputStyle = {
  width: 160,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  padding: '6px 8px',
};

export default function CurrentRatioCalculator() {
  const [currentAssets, setCurrentAssets] = useState('200000');
  const [currentLiabilities, setCurrentLiabilities] = useState('100000');

  const result = useMemo(
    () => calculateCurrentRatio(currentAssets, currentLiabilities),
    [currentAssets, currentLiabilities]
  );

  return (
    <div>
      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Current assets ($):
        </label>
        <input
          type="number"
          value={currentAssets}
          onChange={(e) => setCurrentAssets(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Current liabilities ($):
        </label>
        <input
          type="number"
          value={currentLiabilities}
          onChange={(e) => setCurrentLiabilities(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Current Ratio</span>
        </div>
        <div className="output mono">
          {result.ok
            ? [
                `Current ratio: ${result.ratio.toFixed(2)}`,
                '',
                result.assessment,
                '',
                'Formula: current ratio = current assets ÷ current liabilities',
              ].join('\n')
            : '// Enter current assets and current liabilities above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
