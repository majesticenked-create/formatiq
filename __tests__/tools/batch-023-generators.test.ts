import { describe, it, expect } from 'vitest';
import { generateCorruptedText, MAX_INPUT_LENGTH, INTENSITY_CAPS } from '../../lib/tools/corrupted-text';
import {
  BEZIER_PRESETS,
  isValidBezierX,
  isValidBezierY,
  buildBezierCss,
  bezierPointAt,
} from '../../lib/tools/cubic-bezier';
import { toCursiveText } from '../../lib/tools/cursive-text';
import { generateCultistPersonalName, generateCultistNameWithTitle, generateCultistOrderName } from '../../lib/tools/cultist-names';
import { computeDoughnutSegments, clampHoleSize, parseRowValue, defaultSegmentColor } from '../../lib/tools/doughnut-chart';
import { mulberry32 } from '../../lib/tools/seeded-random';
import { buildResizeCss } from '../../lib/tools/css-box-resize';
import { buildButtonCss, buildButtonHtml } from '../../lib/tools/css-button';
import { buildGlassCss } from '../../lib/tools/css-glassmorphism';

// ---------- Regression: Corrupted Text Generator core logic untouched ----------
describe('corrupted text generator regression (Batch 023 only touched registry keywords)', () => {
  it('still produces deterministic output for a given rng', () => {
    let s = 1;
    const rng = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return (s % 10000) / 10000;
    };
    const out = generateCorruptedText('Hi', 'medium', rng);
    expect(out.length).toBeGreaterThan(2);
    expect(out[0]).toBe('H');
  });

  it('still respects the hard intensity caps', () => {
    expect(INTENSITY_CAPS.low.max).toBe(2);
    expect(INTENSITY_CAPS.medium.max).toBe(4);
    expect(INTENSITY_CAPS.high.max).toBe(7);
  });

  it('still truncates input at MAX_INPUT_LENGTH', () => {
    const long = 'a'.repeat(MAX_INPUT_LENGTH + 50);
    const out = generateCorruptedText(long, 'low', () => 0);
    // Count base characters (strip combining marks) - should equal MAX_INPUT_LENGTH
    const stripped = out.normalize('NFD').replace(/[̀-ͯ]/g, '');
    expect(stripped.length).toBe(MAX_INPUT_LENGTH);
  });
});

// ---------- CSS Border Generator per-corner extension ----------
describe('css border generator per-corner radius (component source)', () => {
  it('component includes independent corner state fields', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const content = fs.readFileSync(path.join(__dirname, '../../components/tools/CssBorderGenerator.tsx'), 'utf-8');
    expect(content).toContain('topLeft');
    expect(content).toContain('topRight');
    expect(content).toContain('bottomRight');
    expect(content).toContain('bottomLeft');
    expect(content).toContain('linkCorners');
  });
});

// ---------- CSS Box Resize Generator ----------
describe('css box resize generator', () => {
  it('builds resize/overflow pairs for every combination', () => {
    expect(buildResizeCss('both', 'auto')).toBe('resize: both;\noverflow: auto;');
    expect(buildResizeCss('horizontal', 'hidden')).toBe('resize: horizontal;\noverflow: hidden;');
    expect(buildResizeCss('vertical', 'scroll')).toBe('resize: vertical;\noverflow: scroll;');
    expect(buildResizeCss('none', 'auto')).toBe('resize: none;\noverflow: auto;');
  });
});

// ---------- CSS Button Generator ----------
describe('css button generator', () => {
  const baseConfig = {
    fontSize: 16,
    fontWeight: 600,
    textColor: '#ffffff',
    bgColor: '#7c5cff',
    hoverEnabled: false,
    hoverBgColor: '#7c5cff',
    hoverTextColor: '#ffffff',
    borderWidth: 0,
    borderStyle: 'none',
    borderColor: '#000000',
    borderRadius: 8,
    paddingV: 10,
    paddingH: 20,
    shadowEnabled: false,
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 0,
    shadowSpread: 0,
    shadowColor: '#00000040',
  };

  it('includes base colors, padding, and border in the CSS output', () => {
    const css = buildButtonCss(baseConfig);
    expect(css).toContain('color: #ffffff');
    expect(css).toContain('background-color: #7c5cff');
    expect(css).toContain('padding: 10px 20px');
    expect(css).toContain('border-radius: 8px');
  });

  it('omits the :hover block when hover colors are unchanged from the base state', () => {
    const css = buildButtonCss({ ...baseConfig, hoverEnabled: true, hoverBgColor: '#7c5cff', hoverTextColor: '#ffffff' });
    expect(css).not.toContain(':hover');
  });

  it('includes a :hover block when hover colors differ from the base state', () => {
    const css = buildButtonCss({ ...baseConfig, hoverEnabled: true, hoverBgColor: '#000000', hoverTextColor: '#ffffff' });
    expect(css).toContain(':hover');
    expect(css).toContain('background-color: #000000');
  });

  it('includes box-shadow only when shadow is enabled', () => {
    const withoutShadow = buildButtonCss(baseConfig);
    expect(withoutShadow).not.toContain('box-shadow');
    const withShadow = buildButtonCss({ ...baseConfig, shadowEnabled: true, shadowX: 0, shadowY: 4, shadowBlur: 12, shadowSpread: 0, shadowColor: 'rgba(0,0,0,0.2)' });
    expect(withShadow).toContain('box-shadow: 0px 4px 12px 0px rgba(0,0,0,0.2)');
  });

  it('builds a matching HTML snippet with the label text', () => {
    expect(buildButtonHtml('Buy now')).toBe('<button class="my-button">Buy now</button>');
    expect(buildButtonHtml('')).toBe('<button class="my-button">Click me</button>');
  });
});

// ---------- CSS Glassmorphism Generator ----------
describe('css glassmorphism generator', () => {
  it('includes both prefixed and unprefixed backdrop-filter with the given blur', () => {
    const css = buildGlassCss({
      bgColorInput: '#ffffff',
      opacityPct: 20,
      blurPx: 10,
      borderOpacityPct: 30,
      borderWidthPx: 1,
      radiusPx: 16,
      shadowEnabled: false,
    });
    expect(css).toContain('backdrop-filter: blur(10px);');
    expect(css).toContain('-webkit-backdrop-filter: blur(10px);');
  });

  it('clamps opacity percentages into 0-1 fractional rgba alpha', () => {
    const css = buildGlassCss({
      bgColorInput: '#000000',
      opacityPct: 150, // out of range, should clamp to 100 -> alpha 1
      blurPx: 5,
      borderOpacityPct: -10, // out of range, should clamp to 0
      borderWidthPx: 1,
      radiusPx: 8,
      shadowEnabled: false,
    });
    expect(css).toContain('background: rgba(0, 0, 0, 1);');
    expect(css).toContain('border: 1px solid rgba(255, 255, 255, 0);');
  });

  it('includes box-shadow only when enabled', () => {
    const without = buildGlassCss({ bgColorInput: '#fff', opacityPct: 20, blurPx: 10, borderOpacityPct: 30, borderWidthPx: 1, radiusPx: 16, shadowEnabled: false });
    expect(without).not.toContain('box-shadow');
    const withShadow = buildGlassCss({ bgColorInput: '#fff', opacityPct: 20, blurPx: 10, borderOpacityPct: 30, borderWidthPx: 1, radiusPx: 16, shadowEnabled: true });
    expect(withShadow).toContain('box-shadow');
  });

  it('applies border radius correctly', () => {
    const css = buildGlassCss({ bgColorInput: '#fff', opacityPct: 20, blurPx: 10, borderOpacityPct: 30, borderWidthPx: 1, radiusPx: 24, shadowEnabled: false });
    expect(css).toContain('border-radius: 24px;');
  });
});

// ---------- Cubic Bezier ----------
describe('cubic bezier curve generator', () => {
  it('exact preset values match the CSS Easing spec', () => {
    const ease = BEZIER_PRESETS.find((p) => p.label === 'ease')!;
    expect(ease.value).toBe('cubic-bezier(0.25, 0.1, 0.25, 1)');
    const easeIn = BEZIER_PRESETS.find((p) => p.label === 'ease-in')!;
    expect(easeIn.value).toBe('cubic-bezier(0.42, 0, 1, 1)');
    const easeOut = BEZIER_PRESETS.find((p) => p.label === 'ease-out')!;
    expect(easeOut.value).toBe('cubic-bezier(0, 0, 0.58, 1)');
    const easeInOut = BEZIER_PRESETS.find((p) => p.label === 'ease-in-out')!;
    expect(easeInOut.value).toBe('cubic-bezier(0.42, 0, 0.58, 1)');
    const linear = BEZIER_PRESETS.find((p) => p.label === 'linear')!;
    expect(linear.value).toBe('linear');
    expect(linear.points).toBeNull();
  });

  it('rejects x values outside 0-1', () => {
    expect(isValidBezierX(-0.1)).toBe(false);
    expect(isValidBezierX(1.1)).toBe(false);
    expect(isValidBezierX(0)).toBe(true);
    expect(isValidBezierX(1)).toBe(true);
  });

  it('allows y values outside 0-1 (overshoot)', () => {
    expect(isValidBezierY(-0.5)).toBe(true);
    expect(isValidBezierY(1.8)).toBe(true);
    expect(isValidBezierY(NaN)).toBe(false);
  });

  it('builds the correct cubic-bezier() css string', () => {
    expect(buildBezierCss({ x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 })).toBe('cubic-bezier(0.25, 0.1, 0.25, 1)');
  });

  it('evaluates the bezier curve endpoints correctly', () => {
    const p = { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 };
    const start = bezierPointAt(p, 0);
    const end = bezierPointAt(p, 1);
    expect(start.x).toBeCloseTo(0);
    expect(start.y).toBeCloseTo(0);
    expect(end.x).toBeCloseTo(1);
    expect(end.y).toBeCloseTo(1);
  });
});

// ---------- Cursive Text Generator - real Unicode accuracy ----------
describe('cursive text generator unicode accuracy', () => {
  it('maps bold capital A to U+1D400', () => {
    expect(toCursiveText('A', 'bold')).toBe('\u{1D400}');
  });

  it('maps italic capital A to U+1D434', () => {
    expect(toCursiveText('A', 'italic')).toBe('\u{1D434}');
  });

  it('maps italic lowercase h to its gap substitute U+210E (PLANCK CONSTANT)', () => {
    expect(toCursiveText('h', 'italic')).toBe('\u{210E}');
  });

  it('maps script capital B to its gap substitute U+212C (SCRIPT CAPITAL B)', () => {
    expect(toCursiveText('B', 'script')).toBe('\u{212C}');
  });

  it('maps script capital E to its gap substitute U+2130', () => {
    expect(toCursiveText('E', 'script')).toBe('\u{2130}');
  });

  it('maps script capital F to its gap substitute U+2131', () => {
    expect(toCursiveText('F', 'script')).toBe('\u{2131}');
  });

  it('maps script capital H to its gap substitute U+210B', () => {
    expect(toCursiveText('H', 'script')).toBe('\u{210B}');
  });

  it('maps script capital I to its gap substitute U+2110', () => {
    expect(toCursiveText('I', 'script')).toBe('\u{2110}');
  });

  it('maps script capital L to its gap substitute U+2112', () => {
    expect(toCursiveText('L', 'script')).toBe('\u{2112}');
  });

  it('maps script capital M to its gap substitute U+2133', () => {
    expect(toCursiveText('M', 'script')).toBe('\u{2133}');
  });

  it('maps script capital R to its gap substitute U+211B', () => {
    expect(toCursiveText('R', 'script')).toBe('\u{211B}');
  });

  it('maps script lowercase e to its gap substitute U+212F', () => {
    expect(toCursiveText('e', 'script')).toBe('\u{212F}');
  });

  it('maps script lowercase g to its gap substitute U+210A', () => {
    expect(toCursiveText('g', 'script')).toBe('\u{210A}');
  });

  it('maps script lowercase o to its gap substitute U+2134', () => {
    expect(toCursiveText('o', 'script')).toBe('\u{2134}');
  });

  it('maps a non-gap script letter via the contiguous Math Alphanumeric range', () => {
    expect(toCursiveText('a', 'script')).toBe('\u{1D4B6}');
    expect(toCursiveText('Z', 'script')).toBe('\u{1D4B5}');
  });

  it('passes unmapped characters (digits, punctuation) through unchanged', () => {
    expect(toCursiveText('123', 'bold')).toBe('123');
    expect(toCursiveText('!? ', 'script')).toBe('!? ');
    expect(toCursiveText('Hello, World! 42', 'bold')).toContain(', ');
    expect(toCursiveText('Hello, World! 42', 'bold')).toContain('42');
  });
});

// ---------- Cultist Name Generator ----------
describe('cultist name generator', () => {
  it('produces a non-empty personal name string', () => {
    const rng = mulberry32(42);
    const name = generateCultistPersonalName(rng);
    expect(typeof name).toBe('string');
    expect(name.length).toBeGreaterThan(0);
  });

  it('produces a name with a title', () => {
    const rng = mulberry32(7);
    const result = generateCultistNameWithTitle(rng);
    expect(result.name.length).toBeGreaterThan(0);
    expect(result.title.length).toBeGreaterThan(0);
  });

  it('produces a non-empty order name string', () => {
    const rng = mulberry32(99);
    const order = generateCultistOrderName(rng);
    expect(typeof order).toBe('string');
    expect(order.length).toBeGreaterThan(0);
  });

  it('is deterministic for the same seed', () => {
    const a = generateCultistPersonalName(mulberry32(123));
    const b = generateCultistPersonalName(mulberry32(123));
    expect(a).toBe(b);
  });
});

// ---------- Doughnut Chart ----------
describe('doughnut chart percentage math', () => {
  it('computes correct percentages for simple values', () => {
    const { segments, total, isEmpty } = computeDoughnutSegments([
      { label: 'A', value: '50' },
      { label: 'B', value: '50' },
    ]);
    expect(isEmpty).toBe(false);
    expect(total).toBe(100);
    expect(segments[0].percentage).toBeCloseTo(50);
    expect(segments[1].percentage).toBeCloseTo(50);
  });

  it('handles uneven values correctly', () => {
    const { segments } = computeDoughnutSegments([
      { label: 'A', value: '1' },
      { label: 'B', value: '3' },
    ]);
    expect(segments[0].percentage).toBeCloseTo(25);
    expect(segments[1].percentage).toBeCloseTo(75);
  });

  it('reports isEmpty when all values are zero', () => {
    const result = computeDoughnutSegments([
      { label: 'A', value: '0' },
      { label: 'B', value: '0' },
    ]);
    expect(result.isEmpty).toBe(true);
    expect(result.segments.length).toBe(0);
  });

  it('treats NaN and negative values as zero and flags hasInvalid', () => {
    const result = computeDoughnutSegments([
      { label: 'A', value: 'not a number' },
      { label: 'B', value: '-5' },
      { label: 'C', value: '10' },
    ]);
    expect(result.hasInvalid).toBe(true);
    expect(result.total).toBe(10);
  });

  it('treats Infinite values as zero', () => {
    expect(parseRowValue('Infinity')).toBe(0);
    expect(parseRowValue('-Infinity')).toBe(0);
    expect(parseRowValue('NaN')).toBe(0);
  });

  it('clamps hole size to the 40-80% range', () => {
    expect(clampHoleSize(10)).toBe(40);
    expect(clampHoleSize(95)).toBe(80);
    expect(clampHoleSize(60)).toBe(60);
  });

  it('provides a distinct default color per index', () => {
    const colors = new Set([0, 1, 2, 3, 4].map(defaultSegmentColor));
    expect(colors.size).toBe(5);
  });
});
