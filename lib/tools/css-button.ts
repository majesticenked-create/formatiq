import { normalizeHex } from './css-color';

export interface ButtonConfig {
  fontSize: number;
  fontWeight: number;
  textColor: string;
  bgColor: string;
  hoverEnabled: boolean;
  hoverBgColor: string;
  hoverTextColor: string;
  borderWidth: number;
  borderStyle: string;
  borderColor: string;
  borderRadius: number;
  paddingV: number;
  paddingH: number;
  shadowEnabled: boolean;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;
}

function safeColor(input: string, fallback: string): string {
  return normalizeHex(input) ?? fallback;
}

/** Builds the .my-button{...} CSS block, plus an optional :hover block only when hover colors actually differ from the base state. */
export function buildButtonCss(config: ButtonConfig): string {
  const text = safeColor(config.textColor, '#ffffff');
  const bg = safeColor(config.bgColor, '#000000');
  const border = safeColor(config.borderColor, '#000000');

  const declarations = [
    `font-size: ${config.fontSize}px`,
    `font-weight: ${config.fontWeight}`,
    `color: ${text}`,
    `background-color: ${bg}`,
    `border: ${config.borderWidth}px ${config.borderStyle} ${border}`,
    `border-radius: ${config.borderRadius}px`,
    `padding: ${config.paddingV}px ${config.paddingH}px`,
    'cursor: pointer',
  ];
  if (config.shadowEnabled) {
    declarations.push(`box-shadow: ${config.shadowX}px ${config.shadowY}px ${config.shadowBlur}px ${config.shadowSpread}px ${config.shadowColor}`);
  }

  let css = `.my-button {\n  ${declarations.join(';\n  ')};\n}`;

  const hoverBg = safeColor(config.hoverBgColor, bg);
  const hoverText = safeColor(config.hoverTextColor, text);
  const hoverCustomized = config.hoverEnabled && (hoverBg !== bg || hoverText !== text);
  if (hoverCustomized) {
    css += `\n\n.my-button:hover {\n  background-color: ${hoverBg};\n  color: ${hoverText};\n}`;
  }

  return css;
}

export function buildButtonHtml(label: string): string {
  return `<button class="my-button">${label || 'Click me'}</button>`;
}
