'use client';

import { useMemo, useState } from 'react';

type Category = 'length' | 'weight' | 'temperature';

const LENGTH_TO_METERS: Record<string, number> = {
  m: 1,
  km: 1000,
  mi: 1609.344,
  ft: 0.3048,
  in: 0.0254,
};

const WEIGHT_TO_GRAMS: Record<string, number> = {
  kg: 1000,
  lb: 453.59237,
  oz: 28.349523125,
  g: 1,
};

const LENGTH_UNITS = ['m', 'km', 'mi', 'ft', 'in'];
const WEIGHT_UNITS = ['kg', 'lb', 'oz', 'g'];
const TEMPERATURE_UNITS = ['C', 'F', 'K'];

function convertLinear(value: number, fromUnit: string, toUnit: string, table: Record<string, number>): number {
  const base = value * table[fromUnit];
  return base / table[toUnit];
}

function toCelsius(value: number, unit: string): number {
  if (unit === 'C') return value;
  if (unit === 'F') return ((value - 32) * 5) / 9;
  return value - 273.15;
}

function fromCelsius(value: number, unit: string): number {
  if (unit === 'C') return value;
  if (unit === 'F') return (value * 9) / 5 + 32;
  return value + 273.15;
}

function convertTemperature(value: number, fromUnit: string, toUnit: string): number {
  return fromCelsius(toCelsius(value, fromUnit), toUnit);
}

function convert(category: Category, value: number, fromUnit: string, toUnit: string): number {
  if (category === 'length') return convertLinear(value, fromUnit, toUnit, LENGTH_TO_METERS);
  if (category === 'weight') return convertLinear(value, fromUnit, toUnit, WEIGHT_TO_GRAMS);
  return convertTemperature(value, fromUnit, toUnit);
}

const CATEGORY_CONFIG: Record<Category, { label: string; units: string[]; defaultFrom: string; defaultTo: string }> = {
  length: { label: 'Length', units: LENGTH_UNITS, defaultFrom: 'km', defaultTo: 'mi' },
  weight: { label: 'Weight', units: WEIGHT_UNITS, defaultFrom: 'kg', defaultTo: 'lb' },
  temperature: { label: 'Temperature', units: TEMPERATURE_UNITS, defaultFrom: 'C', defaultTo: 'F' },
};

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>('length');
  const [fromUnit, setFromUnit] = useState('km');
  const [toUnit, setToUnit] = useState('mi');
  const [fromValue, setFromValue] = useState('1');

  const config = CATEGORY_CONFIG[category];

  function switchCategory(next: Category) {
    setCategory(next);
    setFromUnit(CATEGORY_CONFIG[next].defaultFrom);
    setToUnit(CATEGORY_CONFIG[next].defaultTo);
    setFromValue('1');
  }

  const result = useMemo(() => {
    const num = Number(fromValue);
    if (fromValue === '' || Number.isNaN(num)) {
      return { ok: false as const, message: 'Enter a number to convert.' };
    }
    return { ok: true as const, value: convert(category, num, fromUnit, toUnit) };
  }, [category, fromValue, fromUnit, toUnit]);

  const selectStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    color: 'var(--text-primary)',
    padding: '6px 8px',
  };

  const inputStyle = {
    width: 160,
    ...selectStyle,
  };

  return (
    <div>
      <div className="control-row">
        {(Object.keys(CATEGORY_CONFIG) as Category[]).map((c) => (
          <button
            key={c}
            className="icon-btn"
            style={{
              borderColor: category === c ? 'var(--accent-dim)' : undefined,
              color: category === c ? 'var(--text-primary)' : undefined,
            }}
            onClick={() => switchCategory(c)}
          >
            {CATEGORY_CONFIG[c].label}
          </button>
        ))}
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          From:
        </label>
        <input
          type="number"
          value={fromValue}
          onChange={(e) => setFromValue(e.target.value)}
          className="mono"
          style={inputStyle}
        />
        <select className="mono" value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} style={selectStyle}>
          {config.units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          To:
        </label>
        <select className="mono" value={toUnit} onChange={(e) => setToUnit(e.target.value)} style={selectStyle}>
          {config.units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Result</span>
        </div>
        <div className="output mono">
          {result.ok
            ? `${fromValue} ${fromUnit} = ${result.value.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${toUnit}`
            : '// Enter a value above to see the result'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Converted' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
