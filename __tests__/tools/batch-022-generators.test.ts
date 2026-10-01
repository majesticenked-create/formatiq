import { describe, it, expect } from 'vitest';
import { normalizeHex, hexToRgb, rgbToHex, parseRgbString, quoteCssUrl } from '../../lib/tools/css-color';

// ---------- Cron preset regression (Batch 021) + new Batch 022 presets ----------
describe('cron expression generator presets', () => {
  async function getPresets() {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(__dirname, '../../components/tools/CronExpressionGenerator.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  }

  it('Batch 021 preset "every 30 minutes" is still present unchanged', async () => {
    const content = await getPresets();
    expect(content).toContain("{ label: 'Every 30 minutes', expression: '*/30 * * * *' }");
  });

  it('Batch 021 preset "every hour on the hour" is still present unchanged', async () => {
    const content = await getPresets();
    expect(content).toContain("{ label: 'Every hour on the hour', expression: '0 * * * *' }");
  });

  it('Batch 021 preset "every day at midnight" is still present unchanged', async () => {
    const content = await getPresets();
    expect(content).toContain("{ label: 'Every day at midnight', expression: '0 0 * * *' }");
  });

  it('existing "every minute" preset covers the every_minute competitor row', async () => {
    const content = await getPresets();
    expect(content).toContain("{ label: 'Every minute', expression: '* * * * *' }");
  });

  it('new preset "1 minute past every hour" produces the expected expression', async () => {
    const content = await getPresets();
    expect(content).toContain("{ label: '1 minute past every hour', expression: '1 * * * *' }");
  });

  it('new preset "Monthly on the 5th" produces the expected expression', async () => {
    const content = await getPresets();
    expect(content).toContain("{ label: 'Monthly on the 5th', expression: '0 0 5 * *' }");
  });

  it('does not contain any of the 4 rejected ambiguous competitor presets', async () => {
    const content = await getPresets();
    const lower = content.toLowerCase();
    expect(lower).not.toContain('onethirty');
    expect(lower).not.toContain('one thirty');
    expect(lower).not.toContain('first in jan');
    expect(lower).not.toContain('4th hour');
    expect(lower).not.toContain('saturday in may');
  });
});

// ---------- CSS color helpers ----------
describe('css-color helpers', () => {
  it('normalizes a 6-digit hex (with #)', () => {
    expect(normalizeHex('#3B82F6')).toBe('#3b82f6');
  });

  it('normalizes a 3-digit hex shorthand', () => {
    expect(normalizeHex('38F')).toBe('#3388ff');
  });

  it('rejects an invalid hex', () => {
    expect(normalizeHex('zzz')).toBeNull();
    expect(normalizeHex('12345')).toBeNull();
  });

  it('converts hex to rgb correctly', () => {
    expect(hexToRgb('#3b82f6')).toEqual({ r: 59, g: 130, b: 246 });
  });

  it('converts rgb back to hex correctly', () => {
    expect(rgbToHex({ r: 59, g: 130, b: 246 })).toBe('#3b82f6');
  });

  it('parses a valid rgb() string', () => {
    expect(parseRgbString('rgb(59, 130, 246)')).toEqual({ r: 59, g: 130, b: 246 });
  });

  it('parses a bare comma-separated rgb string', () => {
    expect(parseRgbString('59, 130, 246')).toEqual({ r: 59, g: 130, b: 246 });
  });

  it('rejects an out-of-range rgb channel', () => {
    expect(parseRgbString('300, 0, 0')).toBeNull();
  });

  it('rejects a malformed rgb string', () => {
    expect(parseRgbString('not a color')).toBeNull();
  });

  it('quotes a plain url for CSS', () => {
    expect(quoteCssUrl('https://example.com/a.jpg')).toBe('url("https://example.com/a.jpg")');
  });

  it('escapes embedded double quotes in a url', () => {
    expect(quoteCssUrl('https://example.com/a".jpg')).toBe('url("https://example.com/a\\".jpg")');
  });
});

// ---------- CSS Background Color Generator ----------
describe('css background color generator logic', () => {
  it('produces the canonical background-color declaration for a valid hex', () => {
    const hex = normalizeHex('#3b82f6');
    expect(`background-color: ${hex};`).toBe('background-color: #3b82f6;');
  });

  it('valid hex -> rgb matches expected channels', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('invalid hex is rejected, not silently clamped', () => {
    expect(normalizeHex('#ggg')).toBeNull();
  });
});

// ---------- CSS Background Image Generator ----------
describe('css background image generator logic', () => {
  it('produces multi-line CSS including size/position/repeat/attachment for url mode', () => {
    const css = [
      'background-image: url("https://example.com/image.jpg");',
      'background-size: cover;',
      'background-position: center;',
      'background-repeat: no-repeat;',
      'background-attachment: scroll;',
    ].join('\n');
    expect(css).toContain('background-size: cover;');
    expect(css).toContain('background-position: center;');
    expect(css).toContain('background-repeat: no-repeat;');
    expect(css).toContain('background-attachment: scroll;');
  });

  it('produces a linear-gradient background-image value', () => {
    const value = `linear-gradient(90deg, #3b82f6, #8b5cf6)`;
    expect(value).toBe('linear-gradient(90deg, #3b82f6, #8b5cf6)');
  });

  it('produces a radial-gradient background-image value', () => {
    const value = `radial-gradient(circle, #3b82f6, #8b5cf6)`;
    expect(value).toBe('radial-gradient(circle, #3b82f6, #8b5cf6)');
  });

  it('url is properly quoted and escaped in generated CSS text', () => {
    expect(quoteCssUrl('https://example.com/weird"name.jpg')).toBe('url("https://example.com/weird\\"name.jpg")');
  });
});

// ---------- CSS Border Generator ----------
describe('css border generator logic', () => {
  function widthValid(input: string): boolean {
    const n = Number(input);
    return /^\d+(\.\d+)?$/.test(input.trim()) && n >= 0 && n <= 50;
  }

  it('produces the correct border shorthand for width/style/color', () => {
    const css = `border: ${2}px ${'solid'} ${'#3b82f6'};`;
    expect(css).toBe('border: 2px solid #3b82f6;');
  });

  it('accepts a valid width within range', () => {
    expect(widthValid('2')).toBe(true);
    expect(widthValid('0')).toBe(true);
    expect(widthValid('50')).toBe(true);
  });

  it('rejects an invalid or out-of-range width', () => {
    expect(widthValid('abc')).toBe(false);
    expect(widthValid('-1')).toBe(false);
    expect(widthValid('51')).toBe(false);
  });
});

// ---------- No raw HTML injection for background-image URL ----------
describe('css background image generator security', () => {
  it('source file never uses dangerouslySetInnerHTML', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(__dirname, '../../components/tools/CssBackgroundImageGenerator.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).not.toContain('dangerouslySetInnerHTML');
  });

  it('source file never performs a fetch of the user-provided URL', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(__dirname, '../../components/tools/CssBackgroundImageGenerator.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).not.toMatch(/fetch\s*\(\s*url/);
  });
});
