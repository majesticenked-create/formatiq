'use client';

import { useMemo, useState } from 'react';

type HeightUnit = 'cm' | 'ftin';
type WeightUnit = 'kg' | 'lb';

function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function calculateBmi(
  heightUnit: HeightUnit,
  cm: string,
  feet: string,
  inches: string,
  weightUnit: WeightUnit,
  weightValue: string
) {
  let heightMeters: number;

  if (heightUnit === 'cm') {
    const cmNum = Number(cm);
    if (!cm || Number.isNaN(cmNum) || cmNum <= 0) {
      return { ok: false as const, message: 'Enter a valid height in cm.' };
    }
    heightMeters = cmNum / 100;
  } else {
    const feetNum = Number(feet) || 0;
    const inchesNum = Number(inches) || 0;
    if ((!feet && !inches) || feetNum < 0 || inchesNum < 0) {
      return { ok: false as const, message: 'Enter a valid height in feet and inches.' };
    }
    const totalInches = feetNum * 12 + inchesNum;
    if (totalInches <= 0) {
      return { ok: false as const, message: 'Height must be greater than zero.' };
    }
    heightMeters = totalInches * 0.0254;
  }

  const weightNum = Number(weightValue);
  if (!weightValue || Number.isNaN(weightNum) || weightNum <= 0) {
    return { ok: false as const, message: 'Enter a valid weight.' };
  }
  const weightKg = weightUnit === 'kg' ? weightNum : weightNum * 0.45359237;

  const bmi = weightKg / (heightMeters * heightMeters);

  return { ok: true as const, bmi, category: bmiCategory(bmi) };
}

export default function BmiCalculator() {
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm');
  const [cm, setCm] = useState('170');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('7');

  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [weightValue, setWeightValue] = useState('70');

  const result = useMemo(
    () => calculateBmi(heightUnit, cm, feet, inches, weightUnit, weightValue),
    [heightUnit, cm, feet, inches, weightUnit, weightValue]
  );

  const inputStyle = {
    width: 90,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    color: 'var(--text-primary)',
    padding: '6px 8px',
  };

  return (
    <div>
      <div
        className="status-line"
        style={{
          background: 'var(--status-invalid-bg, rgba(255,0,0,0.06))',
          border: '1px solid var(--accent-dim)',
          borderRadius: 6,
          padding: '8px 12px',
          marginBottom: 12,
        }}
      >
        ⚠ BMI is a general population screening measure based on height and weight only - it does not account
        for muscle mass, body composition, age, or sex, and is not a diagnostic health assessment. Consult a
        healthcare professional for individual health guidance.
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Height:
        </label>
        <button
          className="icon-btn"
          style={{
            borderColor: heightUnit === 'cm' ? 'var(--accent-dim)' : undefined,
            color: heightUnit === 'cm' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => setHeightUnit('cm')}
        >
          cm
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: heightUnit === 'ftin' ? 'var(--accent-dim)' : undefined,
            color: heightUnit === 'ftin' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => setHeightUnit('ftin')}
        >
          ft + in
        </button>
        {heightUnit === 'cm' ? (
          <input type="number" value={cm} onChange={(e) => setCm(e.target.value)} className="mono" style={inputStyle} />
        ) : (
          <>
            <input type="number" value={feet} onChange={(e) => setFeet(e.target.value)} className="mono" style={inputStyle} placeholder="ft" />
            <input
              type="number"
              value={inches}
              onChange={(e) => setInches(e.target.value)}
              className="mono"
              style={inputStyle}
              placeholder="in"
            />
          </>
        )}
      </div>

      <div className="control-row">
        <label className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Weight:
        </label>
        <button
          className="icon-btn"
          style={{
            borderColor: weightUnit === 'kg' ? 'var(--accent-dim)' : undefined,
            color: weightUnit === 'kg' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => setWeightUnit('kg')}
        >
          kg
        </button>
        <button
          className="icon-btn"
          style={{
            borderColor: weightUnit === 'lb' ? 'var(--accent-dim)' : undefined,
            color: weightUnit === 'lb' ? 'var(--text-primary)' : undefined,
          }}
          onClick={() => setWeightUnit('lb')}
        >
          lb
        </button>
        <input
          type="number"
          value={weightValue}
          onChange={(e) => setWeightValue(e.target.value)}
          className="mono"
          style={inputStyle}
        />
      </div>

      <div className="panel">
        <div className="panel-bar">
          <span>Result</span>
        </div>
        <div className="output mono">
          {result.ok ? `BMI: ${result.bmi.toFixed(1)}\nCategory: ${result.category}` : '// Enter valid height and weight above'}
        </div>
        <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
          {result.ok ? '✓ Calculated' : `✗ ${result.message}`}
        </div>
      </div>
    </div>
  );
}
