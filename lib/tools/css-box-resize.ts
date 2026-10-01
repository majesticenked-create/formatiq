export type ResizeValue = 'none' | 'both' | 'horizontal' | 'vertical';
export type OverflowValue = 'auto' | 'hidden' | 'scroll';

/** Builds the resize/overflow CSS declaration pair. */
export function buildResizeCss(resize: ResizeValue, overflow: OverflowValue): string {
  return `resize: ${resize};\noverflow: ${overflow};`;
}
