import { describe, it, expect } from 'vitest';

// Logic copied verbatim from the corresponding component file(s) in components/tools/
// to test in isolation without modifying the real components (many tools embed their
// pure logic directly in the component rather than exporting it separately).

const results: { tool: string; test: string; pass: boolean; detail?: string }[] = [];
function check(tool: string, test: string, pass: boolean, detail?: string) {
  results.push({ tool, test, pass, detail });
}

// ---------- email-validator ----------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function evTryValidate(input: string) {
  const value = input.trim();
  if (!value) return { ok: false as const, message: 'empty' };
  if (!value.includes('@')) return { ok: false as const, message: 'missing @' };
  const parts = value.split('@');
  if (parts.length > 2) return { ok: false as const, message: 'too many @' };
  const [local, domain] = parts;
  if (!local) return { ok: false as const, message: 'missing local' };
  if (!domain) return { ok: false as const, message: 'missing domain' };
  if (!domain.includes('.')) return { ok: false as const, message: 'missing dot' };
  if (domain.endsWith('.') || domain.startsWith('.')) return { ok: false as const, message: 'dot wrong place' };
  if (/\s/.test(value)) return { ok: false as const, message: 'has space' };
  if (!EMAIL_RE.test(value)) return { ok: false as const, message: 'pattern fail' };
  return { ok: true as const, local, domain };
}
{
  const good = evTryValidate('jane.doe@example.com');
  check('email-validator', 'valid email', good.ok === true && (good as any).domain === 'example.com', JSON.stringify(good));
  const bad = evTryValidate('not-an-email');
  check('email-validator', 'invalid (no @) -> specific error', bad.ok === false && bad.message === 'missing @');
  const edge = evTryValidate('a@b@c.com');
  check('email-validator', 'edge case: multiple @ signs rejected', edge.ok === false && edge.message === 'too many @');
}

// ---------- url-validator ----------
function uvTryValidate(input: string) {
  const value = input.trim();
  if (!value) return { ok: false as const, message: 'empty' };
  try {
    const url = new URL(value);
    return { ok: true as const, protocol: url.protocol, host: url.host, pathname: url.pathname };
  } catch {
    return { ok: false as const, message: value.includes('://') ? 'malformed' : 'missing scheme' };
  }
}
{
  const good = uvTryValidate('https://formatiq.com:8080/tools?x=1#y');
  check('url-validator', 'valid URL parses', good.ok === true && (good as any).protocol === 'https:' && (good as any).host === 'formatiq.com:8080', JSON.stringify(good));
  const bad = uvTryValidate('formatiq.com/tools');
  check('url-validator', 'invalid (no scheme) -> error not crash', bad.ok === false && bad.message === 'missing scheme');
  const edge = uvTryValidate('   ');
  check('url-validator', 'edge case: whitespace-only input -> empty error', edge.ok === false && edge.message === 'empty');
}

// ---------- cron-validator ----------
const FIELD_RANGES: [number, number][] = [[0,59],[0,23],[1,31],[1,12],[0,6]];
function cvValidateField(field: string, index: number) {
  const [min, max] = FIELD_RANGES[index];
  if (field === '*') return { ok: true as const };
  const parts = field.split(',');
  for (const part of parts) {
    const stepMatch = part.match(/^(\*|\d+(-\d+)?)\/(\d+)$/);
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    const singleMatch = part.match(/^\d+$/);
    if (stepMatch) { if (Number(stepMatch[3]) <= 0) return { ok: false as const }; continue; }
    if (rangeMatch) { const lo=Number(rangeMatch[1]), hi=Number(rangeMatch[2]); if (lo<min||hi>max||lo>hi) return {ok:false as const}; continue; }
    if (singleMatch) { const v=Number(part); if (v<min||v>max) return {ok:false as const}; continue; }
    return { ok: false as const };
  }
  return { ok: true as const };
}
function cvTryValidate(input: string) {
  const value = input.trim();
  if (!value) return { ok: false as const, message: 'empty' };
  const fields = value.split(/\s+/);
  if (fields.length !== 5) return { ok: false as const, message: `expected 5 got ${fields.length}` };
  for (let i=0;i<5;i++) { if (!cvValidateField(fields[i], i).ok) return { ok: false as const, message: `field ${i} invalid` }; }
  return { ok: true as const };
}
{
  const good = cvTryValidate('0 2 * * *');
  check('cron-validator', 'valid 5-field cron', good.ok === true, JSON.stringify(good));
  const bad = cvTryValidate('70 2 * * *'); // minute out of range
  check('cron-validator', 'invalid (minute out of range) -> error', bad.ok === false, JSON.stringify(bad));
  const edge = cvTryValidate('* * * *'); // only 4 fields
  check('cron-validator', 'edge case: wrong field count -> error not crash', edge.ok === false && edge.message.includes('4'), JSON.stringify(edge));
}

// ---------- slug-validator ----------
function svSuggestSlug(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}
function svTryValidate(input: string) {
  const value = input.trim();
  if (!value) return { ok: false as const, message: 'empty' };
  if (value !== value.toLowerCase()) return { ok: false as const, message: 'not lowercase', suggestion: svSuggestSlug(value) };
  if (value.startsWith('-')) return { ok: false as const, message: 'leading hyphen', suggestion: svSuggestSlug(value) };
  if (value.endsWith('-')) return { ok: false as const, message: 'trailing hyphen', suggestion: svSuggestSlug(value) };
  if (value.includes('--')) return { ok: false as const, message: 'double hyphen', suggestion: svSuggestSlug(value) };
  if (!/^[a-z0-9-]+$/.test(value)) return { ok: false as const, message: 'invalid chars', suggestion: svSuggestSlug(value) };
  return { ok: true as const };
}
{
  const good = svTryValidate('my-blog-post-2026');
  check('slug-validator', 'valid slug', good.ok === true);
  const bad = svTryValidate('My Blog Post!');
  check('slug-validator', 'invalid slug -> error + suggestion', bad.ok === false && (bad as any).suggestion === 'my-blog-post', JSON.stringify(bad));
  const edge = svTryValidate('a--b');
  check('slug-validator', 'edge case: double hyphen specifically flagged', edge.ok === false && edge.message === 'double hyphen', JSON.stringify(edge));
}

// ---------- credit-card-validator ----------
function ccvLuhnCheck(digits: string): boolean {
  let sum = 0; let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit; shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}
function ccvDetectNetwork(digits: string): string {
  const NETWORKS = [
    { name: 'Visa', pattern: /^4/, lengths: [13,16,19] },
    { name: 'Mastercard', pattern: /^(5[1-5]|2[2-7])/, lengths: [16] },
    { name: 'American Express', pattern: /^3[47]/, lengths: [15] },
    { name: 'Discover', pattern: /^6(011|5)/, lengths: [16] },
  ];
  const match = NETWORKS.find((n) => n.pattern.test(digits) && n.lengths.includes(digits.length));
  return match ? match.name : 'Unknown';
}
function ccvTryValidate(input: string) {
  const digits = input.replace(/[\s-]/g, '');
  if (!digits) return { ok: false as const, message: 'empty' };
  if (!/^\d+$/.test(digits)) return { ok: false as const, message: 'non-digit' };
  if (digits.length < 12 || digits.length > 19) return { ok: false as const, message: 'bad length' };
  if (!ccvLuhnCheck(digits)) return { ok: false as const, message: 'luhn failed' };
  return { ok: true as const, network: ccvDetectNetwork(digits) };
}
{
  const good = ccvTryValidate('4532015112830366'); // known valid test Visa number (passes Luhn)
  check('credit-card-validator', 'valid test Visa number passes Luhn + detected', good.ok === true && (good as any).network === 'Visa', JSON.stringify(good));
  const bad = ccvTryValidate('4532015112830367'); // off by one digit -> fails luhn
  check('credit-card-validator', 'invalid (Luhn fails) -> error', bad.ok === false && bad.message === 'luhn failed', JSON.stringify(bad));
  const edge = ccvTryValidate('1234');
  check('credit-card-validator', 'edge case: too short -> length error not crash', edge.ok === false && edge.message === 'bad length', JSON.stringify(edge));
}

// ---------- phone-number-validator ----------
function pnvOnlyDigits(s: string): string { return s.replace(/\D/g, ''); }
function pnvValidateUS(input: string) {
  const digits = pnvOnlyDigits(input);
  const withoutCC = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (withoutCC.length !== 10) return { ok: false as const, message: 'bad length' };
  if (withoutCC[0] === '0' || withoutCC[0] === '1') return { ok: false as const, message: 'bad area code' };
  return { ok: true as const, formatted: `(${withoutCC.slice(0,3)}) ${withoutCC.slice(3,6)}-${withoutCC.slice(6)}` };
}
{
  const good = pnvValidateUS('(555) 123-4567');
  check('phone-number-validator', 'valid US number formats correctly', good.ok === true && (good as any).formatted === '(555) 123-4567', JSON.stringify(good));
  const bad = pnvValidateUS('12345');
  check('phone-number-validator', 'invalid (too short) -> error', bad.ok === false && bad.message === 'bad length');
  const edge = pnvValidateUS('1-555-123-4567'); // with country code prefix
  check('phone-number-validator', 'edge case: leading country code 1 stripped correctly', edge.ok === true && (edge as any).formatted === '(555) 123-4567', JSON.stringify(edge));
}

// ---------- password-strength-checker ----------
function pscGetChecks(password: string) {
  return [
    password.length >= 8,
    password.length >= 12,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
}
function pscGetStrength(password: string, checks: boolean[]) {
  if (!password) return 'empty';
  const ratio = checks.filter(Boolean).length / checks.length;
  if (ratio < 0.4) return 'Weak';
  if (ratio < 0.65) return 'Fair';
  if (ratio < 0.9) return 'Good';
  return 'Strong';
}
{
  const goodPw = 'Tr0ub4dor&3';
  const goodChecks = pscGetChecks(goodPw);
  check('password-strength-checker', 'strong sample password -> Strong/Good rating', pscGetStrength(goodPw, goodChecks) === 'Strong' || pscGetStrength(goodPw, goodChecks) === 'Good', JSON.stringify({checks: goodChecks, rating: pscGetStrength(goodPw, goodChecks)}));
  const weakPw = 'abc';
  const weakChecks = pscGetChecks(weakPw);
  check('password-strength-checker', 'weak password -> Weak rating not crash', pscGetStrength(weakPw, weakChecks) === 'Weak', JSON.stringify({checks: weakChecks, rating: pscGetStrength(weakPw, weakChecks)}));
  const emptyChecks = pscGetChecks('');
  check('password-strength-checker', 'edge case: empty password handled distinctly', pscGetStrength('', emptyChecks) === 'empty');
}

// ---------- iban-validator ----------
function ivMod97(numericString: string): number {
  let remainder = 0;
  for (const char of numericString) remainder = (remainder * 10 + Number(char)) % 97;
  return remainder;
}
function ivToNumericString(iban: string): string {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let numeric = '';
  for (const char of rearranged) {
    if (/[0-9]/.test(char)) numeric += char;
    else numeric += (char.charCodeAt(0) - 55).toString();
  }
  return numeric;
}
const COUNTRY_LENGTHS: Record<string, number> = { DE: 22, GB: 22, FR: 27 };
function ivTryValidate(input: string) {
  const cleaned = input.replace(/\s/g, '').toUpperCase();
  if (!cleaned) return { ok: false as const, message: 'empty' };
  const countryCode = cleaned.slice(0, 2);
  const expectedLength = COUNTRY_LENGTHS[countryCode];
  if (!expectedLength) return { ok: false as const, message: 'unknown country' };
  if (cleaned.length !== expectedLength) return { ok: false as const, message: 'bad length' };
  const checksumValid = ivMod97(ivToNumericString(cleaned)) === 1;
  if (!checksumValid) return { ok: false as const, message: 'checksum failed' };
  return { ok: true as const, countryCode, bban: cleaned.slice(4) };
}
{
  const good = ivTryValidate('DE89 3704 0044 0532 0130 00'); // well-known valid example IBAN
  check('iban-validator', 'valid well-known example IBAN passes mod-97', good.ok === true && (good as any).countryCode === 'DE', JSON.stringify(good));
  const bad = ivTryValidate('DE89 3704 0044 0532 0130 01'); // last digit changed -> checksum fails
  check('iban-validator', 'invalid (checksum fails on typo) -> error', bad.ok === false && bad.message === 'checksum failed', JSON.stringify(bad));
  const edge = ivTryValidate('XX89370400440532013000'); // unrecognized country in our limited test map
  check('iban-validator', 'edge case: unrecognized country code -> error not crash', edge.ok === false && edge.message === 'unknown country', JSON.stringify(edge));
}

describe('Validators', () => {
  results.forEach((r) => {
    it(`${r.tool}: ${r.test}`, () => {
      expect(r.pass, r.detail).toBe(true);
    });
  });
});
