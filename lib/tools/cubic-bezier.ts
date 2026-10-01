/**
 * Cubic bezier timing-function helpers shared by the Cubic Bezier Curve
 * Generator. x1/x2 are control-point X coordinates and MUST stay within
 * [0, 1] for a valid CSS cubic-bezier() timing function (CSS rejects an
 * out-of-range X). y1/y2 are control-point Y coordinates and are explicitly
 * allowed outside [0, 1] - that's what produces "overshoot"/"bounce" easing
 * curves, and clamping them would silently break that valid use case.
 */

export interface BezierPoint {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface BezierPreset {
  label: string;
  /** The exact cubic-bezier(...) or keyword value for this preset. */
  value: string;
  /** Control points, or null for presets (like "linear") that aren't a cubic-bezier at all. */
  points: BezierPoint | null;
}

// Exact standard CSS easing values - verified against the CSS Easing Functions spec.
export const BEZIER_PRESETS: BezierPreset[] = [
  { label: 'ease', value: 'cubic-bezier(0.25, 0.1, 0.25, 1)', points: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 } },
  { label: 'ease-in', value: 'cubic-bezier(0.42, 0, 1, 1)', points: { x1: 0.42, y1: 0, x2: 1, y2: 1 } },
  { label: 'ease-out', value: 'cubic-bezier(0, 0, 0.58, 1)', points: { x1: 0, y1: 0, x2: 0.58, y2: 1 } },
  { label: 'ease-in-out', value: 'cubic-bezier(0.42, 0, 0.58, 1)', points: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 } },
  // linear is NOT expressible as a cubic-bezier() - it's its own keyword, equivalent to a
  // straight line from (0,0) to (1,1), included here for reference but flagged as not a bezier.
  { label: 'linear', value: 'linear', points: null },
];

/** Whether an X control-point value is valid per the CSS spec (must be within [0, 1]). */
export function isValidBezierX(x: number): boolean {
  return Number.isFinite(x) && x >= 0 && x <= 1;
}

/** Y control-point values may legitimately be outside [0, 1] (overshoot/bounce) - only finiteness is required. */
export function isValidBezierY(y: number): boolean {
  return Number.isFinite(y);
}

export function isValidBezierPoint(p: BezierPoint): boolean {
  return isValidBezierX(p.x1) && isValidBezierX(p.x2) && isValidBezierY(p.y1) && isValidBezierY(p.y2);
}

/** Builds the cubic-bezier(...) CSS value string from control points, clamping nothing - caller should validate first. */
export function buildBezierCss(p: BezierPoint): string {
  return `cubic-bezier(${p.x1}, ${p.y1}, ${p.x2}, ${p.y2})`;
}

/** Evaluates the cubic bezier curve's Y value at parametric t, for drawing the SVG curve. */
export function bezierPointAt(p: BezierPoint, t: number): { x: number; y: number } {
  const mt = 1 - t;
  const x = 3 * mt * mt * t * p.x1 + 3 * mt * t * t * p.x2 + t * t * t;
  const y = 3 * mt * mt * t * p.y1 + 3 * mt * t * t * p.y2 + t * t * t;
  return { x, y };
}
