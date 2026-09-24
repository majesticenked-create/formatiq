/**
 * Small inline line icons for the homepage category directory. No icon library is used here on
 * purpose (the project doesn't depend on one - see package.json), matching the existing inline-SVG
 * convention already used elsewhere (see ThemeToggle.tsx): 24x24 viewBox, fill="none",
 * stroke="currentColor", strokeWidth 1.5, aria-hidden since the icon is decorative - the category
 * title text next to it is always the real accessible label.
 */

type IconProps = { className?: string };

function FormattersIcon({ className }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M9 4c-2 0-3 1-3 3v2c0 1.3-.7 2-2 2 1.3 0 2 .7 2 2v2c0 2 1 3 3 3M15 4c2 0 3 1 3 3v2c0 1.3.7 2 2 2-1.3 0-2 .7-2 2v2c0 2-1 3-3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EncodersIcon({ className }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="8" cy="15" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.3 12.7 19 4M19 4h-4M19 4v4M15.5 8.5 18 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GeneratorsIcon({ className }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M11 4.5 12.4 8l3.6 1.4-3.6 1.4L11 14.5 9.6 10.8 6 9.4l3.6-1.4L11 4.5ZM18 13.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9.9-2.3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TextToolsIcon({ className }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M5 6.5V5h14v1.5M12 5v14M9.5 19h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ConvertersIcon({ className }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M4 9h13M17 9l-3-3M17 9l-3 3M20 15H7M7 15l3-3M7 15l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalculatorsIcon({ className }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.5 6.5h9v3.5h-9zM7.5 13h2.2v2.2H7.5zM10.9 13h2.2v2.2h-2.2zM14.3 13h2.2v5.7h-2.2zM7.5 16.8h2.2v2.2H7.5zM10.9 16.8h2.2v2.2h-2.2z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ValidatorsIcon({ className }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 3.5 5 6v6c0 4.4 3 7.6 7 8.5 4-.9 7-4.1 7-8.5V6l-7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 12.2l2 2 4-4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Generic fallback for any category slug without an explicit icon mapped below. */
function GenericCategoryIcon({ className }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<string, (props: IconProps) => JSX.Element> = {
  formatters: FormattersIcon,
  'encoders-decoders': EncodersIcon,
  generators: GeneratorsIcon,
  'text-tools': TextToolsIcon,
  converters: ConvertersIcon,
  calculators: CalculatorsIcon,
  validators: ValidatorsIcon,
};

/** Resolves a category slug to its icon component, falling back to a generic tile icon so a
 * future category added without an explicit mapping here never breaks rendering. */
export function getCategoryIcon(slug: string): (props: IconProps) => JSX.Element {
  return CATEGORY_ICONS[slug] ?? GenericCategoryIcon;
}
