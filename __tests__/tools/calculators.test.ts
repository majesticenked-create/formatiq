import { describe, it, expect } from 'vitest';

// Logic copied verbatim from the corresponding component file(s) in components/tools/
// to test in isolation without modifying the real components (many tools embed their
// pure logic directly in the component rather than exporting it separately).

const results: { tool: string; test: string; pass: boolean; detail?: string }[] = [];
function check(tool: string, test: string, pass: boolean, detail?: string) {
  results.push({ tool, test, pass, detail });
}

// ---------- percentage-calculator ----------
function pcComputePercentOf(x: string, y: string) {
  const xNum = Number(x), yNum = Number(y);
  if (x === '' || y === '' || Number.isNaN(xNum) || Number.isNaN(yNum)) return { ok: false as const, message: 'Enter both numbers.' };
  return { ok: true as const, result: (xNum / 100) * yNum };
}
function pcComputeWhatPercent(x: string, y: string) {
  const xNum = Number(x), yNum = Number(y);
  if (x === '' || y === '' || Number.isNaN(xNum) || Number.isNaN(yNum)) return { ok: false as const, message: 'Enter both numbers.' };
  if (yNum === 0) return { ok: false as const, message: 'Cannot divide by zero - Y must not be 0.' };
  return { ok: true as const, result: (xNum / yNum) * 100 };
}
{
  const good = pcComputePercentOf('20', '150');
  check('percentage-calculator', 'valid: 20% of 150 = 30', good.ok === true && good.result === 30, JSON.stringify(good));
  const bad = pcComputeWhatPercent('5', '0');
  check('percentage-calculator', 'divide-by-zero (Y=0) -> error not crash/Infinity', bad.ok === false, JSON.stringify(bad));
  const edge = pcComputePercentOf('', '150'); // empty X
  check('percentage-calculator', 'edge case: empty X field -> error not NaN', edge.ok === false, JSON.stringify(edge));
}

// ---------- unit-converter ----------
const LENGTH_TO_METERS: Record<string, number> = { m: 1, km: 1000, mi: 1609.344, ft: 0.3048, in: 0.0254 };
function ucConvertLinear(value: number, fromUnit: string, toUnit: string, table: Record<string, number>): number {
  return (value * table[fromUnit]) / table[toUnit];
}
function ucToCelsius(value: number, unit: string): number {
  if (unit === 'C') return value;
  if (unit === 'F') return ((value - 32) * 5) / 9;
  return value - 273.15;
}
function ucFromCelsius(value: number, unit: string): number {
  if (unit === 'C') return value;
  if (unit === 'F') return (value * 9) / 5 + 32;
  return value + 273.15;
}
function ucConvertTemperature(value: number, fromUnit: string, toUnit: string): number { return ucFromCelsius(ucToCelsius(value, fromUnit), toUnit); }
{
  const good = ucConvertLinear(1, 'km', 'mi', LENGTH_TO_METERS);
  check('unit-converter', 'valid: 1 km = 0.621371 mi', Math.abs(good - 0.621371) < 0.0001, String(good));
  const bad = ucConvertLinear(Number('abc'), 'km', 'mi', LENGTH_TO_METERS); // NaN propagation, guarded upstream by isNaN check in component
  check('unit-converter', 'invalid numeric input produces NaN (caught by component-level isNaN guard, not this pure fn)', Number.isNaN(bad));
  const edge = ucConvertTemperature(0, 'C', 'K'); // boundary: absolute check at 0C
  check('unit-converter', 'edge case: 0°C converts to exactly 273.15K', edge === 273.15, String(edge));
}

// ---------- age-calculator ----------
function acCalculateAge(birthDateStr: string, asOfStr: string) {
  const birthDate = new Date(birthDateStr + 'T00:00:00');
  const asOfDate = new Date(asOfStr + 'T00:00:00');
  if (Number.isNaN(birthDate.getTime())) return { ok: false as const, message: 'Enter a valid birth date.' };
  if (Number.isNaN(asOfDate.getTime())) return { ok: false as const, message: 'Enter a valid "as of" date.' };
  if (birthDate > asOfDate) return { ok: false as const, message: 'Birth date must not be after the "as of" date.' };
  let years = asOfDate.getFullYear() - birthDate.getFullYear();
  let months = asOfDate.getMonth() - birthDate.getMonth();
  let days = asOfDate.getDate() - birthDate.getDate();
  if (days < 0) { months -= 1; const prevMonth = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), 0); days += prevMonth.getDate(); }
  if (months < 0) { years -= 1; months += 12; }
  return { ok: true as const, years, months, days };
}
{
  const good = acCalculateAge('1990-06-15', '2026-06-15');
  check('age-calculator', 'valid: exact anniversary date gives round years, 0 months, 0 days', good.ok === true && good.years === 36 && good.months === 0 && good.days === 0, JSON.stringify(good));
  const bad = acCalculateAge('2030-01-01', '2026-01-01'); // birth date after "as of" date
  check('age-calculator', 'birth date after as-of date -> error not negative age', bad.ok === false, JSON.stringify(bad));
  const edge = acCalculateAge('2000-02-29', '2026-03-01'); // leap-day birthday boundary
  check('age-calculator', 'edge case: leap-day (Feb 29) birth date handled without crash', edge.ok === true, JSON.stringify(edge));
}

// ---------- ip-subnet-calculator ----------
function iscParseIp(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  if (parts.some((p) => !/^\d+$/.test(p))) return null;
  const values = parts.map(Number);
  if (values.some((v) => v < 0 || v > 255)) return null;
  return ((values[0] << 24) | (values[1] << 16) | (values[2] << 8) | values[3]) >>> 0;
}
function iscIntToIp(n: number): string { return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.'); }
function iscTryCalculate(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false as const, message: 'empty' };
  const parts = trimmed.split('/');
  if (parts.length !== 2) return { ok: false as const, message: 'Expected format: IP/prefix' };
  const [ipStr, prefixStr] = parts;
  const ipInt = iscParseIp(ipStr);
  if (ipInt === null) return { ok: false as const, message: `"${ipStr}" is not a valid IPv4 address` };
  if (!/^\d+$/.test(prefixStr)) return { ok: false as const, message: 'invalid prefix' };
  const prefix = Number(prefixStr);
  if (prefix < 0 || prefix > 32) return { ok: false as const, message: 'prefix out of range' };
  const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;
  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? 0 : totalHosts - 2;
  return { ok: true as const, network: iscIntToIp(networkInt), broadcast: iscIntToIp(broadcastInt), usableHosts, totalHosts };
}
{
  const good = iscTryCalculate('192.168.1.0/24');
  check('ip-subnet-calculator', 'valid: 192.168.1.0/24 gives correct network/broadcast/host count', good.ok === true && good.network === '192.168.1.0' && good.broadcast === '192.168.1.255' && good.usableHosts === 254, JSON.stringify(good));
  const bad = iscTryCalculate('300.1.1.1/24'); // octet out of range
  check('ip-subnet-calculator', 'invalid octet (300) -> error not crash', bad.ok === false, JSON.stringify(bad));
  const edge = iscTryCalculate('10.0.0.0/31'); // boundary: /31 has 0 usable hosts (point-to-point link)
  check('ip-subnet-calculator', 'edge case: /31 prefix correctly gives 0 usable hosts', edge.ok === true && edge.usableHosts === 0, JSON.stringify(edge));
}

// ---------- bmi-calculator ----------
function bcBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}
function bcCalculateBmi(cm: string, weightValue: string) {
  const cmNum = Number(cm);
  if (!cm || Number.isNaN(cmNum) || cmNum <= 0) return { ok: false as const, message: 'Enter a valid height in cm.' };
  const heightMeters = cmNum / 100;
  const weightNum = Number(weightValue);
  if (!weightValue || Number.isNaN(weightNum) || weightNum <= 0) return { ok: false as const, message: 'Enter a valid weight.' };
  const bmi = weightNum / (heightMeters * heightMeters);
  return { ok: true as const, bmi, category: bcBmiCategory(bmi) };
}
{
  const good = bcCalculateBmi('170', '70');
  check('bmi-calculator', 'valid: 170cm/70kg gives correct BMI and category', good.ok === true && Math.abs(good.bmi - 24.22) < 0.01 && good.category === 'Normal weight', JSON.stringify(good));
  const bad = bcCalculateBmi('170', '-5'); // negative weight
  check('bmi-calculator', 'negative weight -> error not crash/negative BMI', bad.ok === false, JSON.stringify(bad));
  const edge = bcCalculateBmi('170', '0'); // zero weight boundary
  check('bmi-calculator', 'edge case: zero weight -> error not BMI of 0', edge.ok === false, JSON.stringify(edge));
}

// ---------- date-difference-calculator ----------
function ddcCountBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const cursor = new Date(start);
  while (cursor < end) { const day = cursor.getDay(); if (day !== 0 && day !== 6) count++; cursor.setDate(cursor.getDate() + 1); }
  return count;
}
function ddcCalculateDifference(startStr: string, endStr: string) {
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  if (Number.isNaN(start.getTime())) return { ok: false as const, message: 'Enter a valid start date.' };
  if (Number.isNaN(end.getTime())) return { ok: false as const, message: 'Enter a valid end date.' };
  const earlier = start <= end ? start : end;
  const later = start <= end ? end : start;
  const reversed = start > end;
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.round((later.getTime() - earlier.getTime()) / msPerDay);
  const businessDays = ddcCountBusinessDays(earlier, later);
  return { ok: true as const, reversed, totalDays, businessDays };
}
{
  const good = ddcCalculateDifference('2026-01-01', '2026-01-08');
  check('date-difference-calculator', 'valid: 1 week apart gives 7 total days', good.ok === true && good.totalDays === 7, JSON.stringify(good));
  const bad = ddcCalculateDifference('not-a-date', '2026-01-08');
  check('date-difference-calculator', 'invalid date string -> error not NaN propagation', bad.ok === false, JSON.stringify(bad));
  const edge = ddcCalculateDifference('2026-01-08', '2026-01-01'); // reversed order (start after end)
  check('date-difference-calculator', 'edge case: start after end -> reversed flag set, absolute totalDays still correct', edge.ok === true && edge.reversed === true && edge.totalDays === 7, JSON.stringify(edge));
}

// ---------- loan-calculator ----------
function lcCalculateLoan(amount: number, annualRatePercent: number, termMonths: number) {
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false as const, message: 'Enter a loan amount greater than zero.' };
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) return { ok: false as const, message: 'Enter a valid annual interest rate (0 or greater).' };
  if (!Number.isFinite(termMonths) || termMonths <= 0) return { ok: false as const, message: 'Enter a loan term greater than zero.' };
  const monthlyRate = annualRatePercent / 100 / 12;
  let monthlyPayment: number;
  if (monthlyRate === 0) monthlyPayment = amount / termMonths;
  else monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  const totalPaid = monthlyPayment * termMonths;
  return { ok: true as const, monthlyPayment, totalPaid, totalInterest: totalPaid - amount };
}
{
  const good = lcCalculateLoan(20000, 6.5, 60);
  check('loan-calculator', 'valid: $20k @ 6.5% for 60mo gives correct monthly payment', good.ok === true && Math.abs(good.monthlyPayment - 391.3) < 1, JSON.stringify(good));
  const bad = lcCalculateLoan(-5000, 6.5, 60); // negative loan amount
  check('loan-calculator', 'negative loan amount -> error not crash', bad.ok === false, JSON.stringify(bad));
  const edge = lcCalculateLoan(12000, 0, 12); // 0% interest boundary (avoids division by zero in amortization formula)
  check('loan-calculator', 'edge case: 0% interest rate -> simple division, no divide-by-zero crash', edge.ok === true && edge.monthlyPayment === 1000, JSON.stringify(edge));
}

describe('Calculators', () => {
  results.forEach((r) => {
    it(`${r.tool}: ${r.test}`, () => {
      expect(r.pass, r.detail).toBe(true);
    });
  });
});
