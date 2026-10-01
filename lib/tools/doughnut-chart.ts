/**
 * Percentage/geometry math for the Doughnut Chart Maker, kept separate from
 * the component so it can be unit tested directly.
 */

export interface DoughnutRow {
  label: string;
  value: string;
}

export interface DoughnutSegment {
  label: string;
  value: number;
  percentage: number;
  /** Cumulative start angle in degrees, 0 = top of circle, clockwise. */
  startAngle: number;
  endAngle: number;
}

/** Parses raw row values, rejecting NaN/Infinite values by treating them as zero (flagged separately by the caller). */
export function parseRowValue(raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export interface DoughnutComputation {
  segments: DoughnutSegment[];
  total: number;
  isEmpty: boolean;
  hasInvalid: boolean;
}

/** Computes percentages and cumulative angles for each row. If every value is zero/invalid, returns isEmpty: true with no segments. */
export function computeDoughnutSegments(rows: DoughnutRow[]): DoughnutComputation {
  let hasInvalid = false;
  const values = rows.map((r) => {
    const n = Number(r.value);
    if (!Number.isFinite(n) || n < 0) {
      hasInvalid = true;
      return 0;
    }
    return n;
  });
  const total = values.reduce((a, b) => a + b, 0);

  if (total <= 0) {
    return { segments: [], total: 0, isEmpty: true, hasInvalid };
  }

  let cumulative = 0;
  const segments: DoughnutSegment[] = rows.map((row, i) => {
    const value = values[i];
    const percentage = (value / total) * 100;
    const startAngle = (cumulative / total) * 360;
    cumulative += value;
    const endAngle = (cumulative / total) * 360;
    return { label: row.label, value, percentage, startAngle, endAngle };
  });

  return { segments, total, isEmpty: false, hasInvalid };
}

/** Clamps the hole-size (inner radius) percentage to the 40-80% range required for a readable doughnut (not a pie, not an unreadably thin ring). */
export function clampHoleSize(pct: number): number {
  if (!Number.isFinite(pct)) return 60;
  return Math.min(80, Math.max(40, pct));
}

const DEFAULT_PALETTE = [
  '#7c5cff', '#2dd4bf', '#f97316', '#f43f5e', '#eab308',
  '#38bdf8', '#a3e635', '#fb7185', '#8b5cf6', '#22d3ee',
];

/** An accessible default color palette distinct enough to tell apart without relying on color alone (paired with the legend's label/value/percentage text). */
export function defaultSegmentColor(index: number): string {
  return DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
}
