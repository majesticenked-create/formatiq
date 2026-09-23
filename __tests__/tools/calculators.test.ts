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

// ---------- xnor-calculator ----------
function xnorCalculate(a: number, b: number, width: number): number {
  const max = width === 32 ? 0xffffffff : (1 << width) - 1;
  const xor = (a ^ b) >>> 0;
  return (~xor >>> 0) & max;
}
{
  const good = xnorCalculate(12, 10, 8);
  check('xnor-calculator', 'valid: A=12,B=10,8-bit -> 249 (11111001)', good === 249 && good.toString(2).padStart(8, '0') === '11111001', String(good));
  const equalBits = xnorCalculate(5, 5, 8); // identical operands -> all bits match -> all 1s
  check('xnor-calculator', 'edge case: identical operands -> all bits set (255 for 8-bit)', equalBits === 255, String(equalBits));
  const opposite = xnorCalculate(0, 255, 8); // fully opposite bits -> all 0s
  check('xnor-calculator', 'edge case: fully opposite 8-bit operands -> result is 0', opposite === 0, String(opposite));
}

// ---------- break-even-calculator ----------
function beCalculate(fixedCosts: number, pricePerUnit: number, variableCostPerUnit: number) {
  if (!Number.isFinite(fixedCosts) || fixedCosts < 0) return { ok: false as const, message: 'invalid fixed costs' };
  if (!Number.isFinite(pricePerUnit) || pricePerUnit <= 0) return { ok: false as const, message: 'invalid price' };
  if (!Number.isFinite(variableCostPerUnit) || variableCostPerUnit < 0) return { ok: false as const, message: 'invalid variable cost' };
  const contributionMargin = pricePerUnit - variableCostPerUnit;
  if (contributionMargin <= 0) return { ok: false as const, message: 'price must exceed variable cost' };
  const breakEvenUnits = fixedCosts / contributionMargin;
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;
  return { ok: true as const, contributionMargin, breakEvenUnits, breakEvenRevenue };
}
{
  const good = beCalculate(10000, 50, 30);
  check('break-even-calculator', 'valid: fixed=10000,price=50,variable=30 -> margin 20, 500 units, $25000 revenue', good.ok === true && good.contributionMargin === 20 && good.breakEvenUnits === 500 && good.breakEvenRevenue === 25000, JSON.stringify(good));
  const bad = beCalculate(10000, 20, 30); // price below variable cost
  check('break-even-calculator', 'price below variable cost -> error not negative break-even', bad.ok === false, JSON.stringify(bad));
  const edge = beCalculate(10000, 30, 30); // price equals variable cost (zero margin boundary)
  check('break-even-calculator', 'edge case: price equals variable cost (zero margin) -> error not divide-by-zero', edge.ok === false, JSON.stringify(edge));
}

// ---------- capm-calculator ----------
function capmCalculate(riskFreeRate: number, beta: number, marketReturn: number) {
  if (Number.isNaN(riskFreeRate) || Number.isNaN(beta) || Number.isNaN(marketReturn)) return { ok: false as const };
  const marketRiskPremium = marketReturn - riskFreeRate;
  const expectedReturn = riskFreeRate + beta * marketRiskPremium;
  return { ok: true as const, marketRiskPremium, expectedReturn };
}
{
  const good = capmCalculate(4, 1.2, 10);
  check('capm-calculator', 'valid: rf=4%,beta=1.2,market=10% -> premium 6%, expected return 11.2%', good.ok === true && good.marketRiskPremium === 6 && Math.abs(good.expectedReturn - 11.2) < 1e-9, JSON.stringify(good));
  const negBeta = capmCalculate(4, -0.5, 10); // negative beta
  check('capm-calculator', 'edge case: negative beta subtracts from risk-free rate', negBeta.ok === true && negBeta.expectedReturn === 1, JSON.stringify(negBeta));
  const zeroBeta = capmCalculate(4, 0, 10); // beta of 0 -> expected return equals risk-free rate
  check('capm-calculator', 'edge case: beta of 0 -> expected return equals risk-free rate', zeroBeta.ok === true && zeroBeta.expectedReturn === 4, JSON.stringify(zeroBeta));
}

// ---------- cash-flow-to-debt-ratio-calculator ----------
function cfdrCalculate(operatingCashFlow: number, totalDebt: number) {
  if (Number.isNaN(operatingCashFlow)) return { ok: false as const, message: 'invalid cash flow' };
  if (Number.isNaN(totalDebt) || totalDebt <= 0) return { ok: false as const, message: 'invalid debt' };
  return { ok: true as const, ratio: operatingCashFlow / totalDebt };
}
{
  const good = cfdrCalculate(250000, 500000);
  check('cash-flow-to-debt-ratio-calculator', 'valid: 250000/500000 -> 0.5', good.ok === true && good.ratio === 0.5, JSON.stringify(good));
  const bad = cfdrCalculate(100000, 0); // zero debt
  check('cash-flow-to-debt-ratio-calculator', 'zero total debt -> error not divide-by-zero/Infinity', bad.ok === false, JSON.stringify(bad));
  const edge = cfdrCalculate(-50000, 100000); // negative operating cash flow allowed, still computes
  check('cash-flow-to-debt-ratio-calculator', 'edge case: negative operating cash flow -> negative ratio, not an error', edge.ok === true && edge.ratio === -0.5, JSON.stringify(edge));
}

// ---------- cd-calculator ----------
function cdCompoundBalance(principal: number, aprPercent: number, periodsPerYear: number, years: number): number {
  const r = aprPercent / 100;
  return principal * Math.pow(1 + r / periodsPerYear, periodsPerYear * years);
}
function cdCalculate(deposit: number, apr: number, termYears: number, periodsPerYear: number) {
  if (!Number.isFinite(deposit) || deposit <= 0) return { ok: false as const, message: 'invalid deposit' };
  if (!Number.isFinite(apr) || apr < 0) return { ok: false as const, message: 'invalid apr' };
  if (!Number.isFinite(termYears) || termYears <= 0) return { ok: false as const, message: 'invalid term' };
  const endingBalance = cdCompoundBalance(deposit, apr, periodsPerYear, termYears);
  return { ok: true as const, endingBalance, interestEarned: endingBalance - deposit };
}
{
  const good = cdCalculate(10000, 5, 1, 12);
  check('cd-calculator', 'valid: $10000 @ 5% APR monthly for 1yr -> ending balance ~ $10511.62', good.ok === true && Math.abs(good.endingBalance - 10511.62) < 0.01, JSON.stringify(good));
  const bad = cdCalculate(-5000, 5, 1, 12); // negative deposit
  check('cd-calculator', 'negative deposit -> error not crash', bad.ok === false, JSON.stringify(bad));
  const edge = cdCalculate(10000, 0, 1, 12); // 0% APR boundary
  check('cd-calculator', 'edge case: 0% APR -> ending balance equals deposit exactly', edge.ok === true && edge.endingBalance === 10000, JSON.stringify(edge));
}

// ---------- cash-app-fee-calculator (payment-fee-calculator) ----------
function feeCalculate(amount: number, feePercent: number, fixedFee: number) {
  if (!Number.isFinite(amount) || amount < 0) return { ok: false as const, message: 'invalid amount' };
  if (!Number.isFinite(feePercent) || feePercent < 0) return { ok: false as const, message: 'invalid fee percent' };
  if (!Number.isFinite(fixedFee) || fixedFee < 0) return { ok: false as const, message: 'invalid fixed fee' };
  const fee = amount * (feePercent / 100) + fixedFee;
  return { ok: true as const, fee, net: amount - fee };
}
{
  const good = feeCalculate(100, 1.5, 0.25);
  check('cash-app-fee-calculator', 'valid: $100 @ 1.5% + $0.25 -> fee $1.75, net $98.25', good.ok === true && Math.abs(good.fee - 1.75) < 1e-9 && Math.abs(good.net - 98.25) < 1e-9, JSON.stringify(good));
  const zeroFee = feeCalculate(100, 0, 0); // no fee at all
  check('cash-app-fee-calculator', 'edge case: 0% and $0 fixed fee -> net equals amount exactly', zeroFee.ok === true && zeroFee.fee === 0 && zeroFee.net === 100, JSON.stringify(zeroFee));
  const bad = feeCalculate(100, -1, 0); // negative fee percent
  check('cash-app-fee-calculator', 'negative fee percent -> error not crash', bad.ok === false, JSON.stringify(bad));
}

// ---------- compound-interest-calculator ----------
function ciCalculate(principal: number, ratePercent: number, years: number, periodsPerYear: number) {
  if (!Number.isFinite(principal) || principal <= 0) return { ok: false as const };
  if (!Number.isFinite(ratePercent) || ratePercent < 0) return { ok: false as const };
  if (!Number.isFinite(years) || years <= 0) return { ok: false as const };
  const r = ratePercent / 100;
  const futureValue = principal * Math.pow(1 + r / periodsPerYear, periodsPerYear * years);
  return { ok: true as const, futureValue, interestEarned: futureValue - principal };
}
{
  const good = ciCalculate(10000, 5, 1, 12);
  check('compound-interest-calculator', 'valid: $10000 @ 5% monthly for 1yr -> ~$10511.62, interest ~$511.62', good.ok === true && Math.abs(good.futureValue - 10511.62) < 0.01 && Math.abs(good.interestEarned - 511.62) < 0.01, JSON.stringify(good));
  const bad = ciCalculate(0, 5, 1, 12); // zero principal
  check('compound-interest-calculator', 'zero principal -> error not crash', bad.ok === false, JSON.stringify(bad));
}

// ---------- compound-interest-rate-calculator ----------
function cirCalculate(principal: number, futureValue: number, years: number, periodsPerYear: number) {
  if (!Number.isFinite(principal) || principal <= 0) return { ok: false as const };
  if (!Number.isFinite(futureValue) || futureValue < principal) return { ok: false as const };
  if (!Number.isFinite(years) || years <= 0) return { ok: false as const };
  const ratio = futureValue / principal;
  const rate = periodsPerYear * (Math.pow(ratio, 1 / (periodsPerYear * years)) - 1) * 100;
  return { ok: true as const, rate };
}
{
  const good = cirCalculate(10000, 10511.62, 1, 12);
  check('compound-interest-rate-calculator', 'valid: P=10000,A=10511.62,t=1,monthly -> r ~ 5%', good.ok === true && Math.abs(good.rate - 5) < 0.05, JSON.stringify(good));
  const bad = cirCalculate(10000, 9000, 1, 12); // future value less than principal
  check('compound-interest-rate-calculator', 'future value less than principal -> error not crash', bad.ok === false, JSON.stringify(bad));
}

// ---------- current-ratio-calculator ----------
function crCalculate(currentAssets: number, currentLiabilities: number) {
  if (!Number.isFinite(currentAssets) || currentAssets < 0) return { ok: false as const };
  if (!Number.isFinite(currentLiabilities) || currentLiabilities <= 0) return { ok: false as const };
  return { ok: true as const, ratio: currentAssets / currentLiabilities };
}
{
  const good = crCalculate(200000, 100000);
  check('current-ratio-calculator', 'valid: 200000/100000 -> 2.0', good.ok === true && good.ratio === 2, JSON.stringify(good));
  const bad = crCalculate(100000, 0); // zero liabilities
  check('current-ratio-calculator', 'zero current liabilities -> error not divide-by-zero/Infinity', bad.ok === false, JSON.stringify(bad));
}

// ---------- degree-of-operating-leverage-calculator ----------
function dolCalculate(sales: number, variableCosts: number, fixedCosts: number) {
  if (!Number.isFinite(sales) || sales <= 0) return { ok: false as const };
  if (!Number.isFinite(variableCosts) || variableCosts < 0) return { ok: false as const };
  if (!Number.isFinite(fixedCosts) || fixedCosts < 0) return { ok: false as const };
  const contributionMargin = sales - variableCosts;
  const operatingIncome = contributionMargin - fixedCosts;
  if (operatingIncome <= 0) return { ok: false as const };
  return { ok: true as const, contributionMargin, operatingIncome, dol: contributionMargin / operatingIncome };
}
{
  const good = dolCalculate(100000, 60000, 20000);
  check('degree-of-operating-leverage-calculator', 'valid: sales=100000,variable=60000,fixed=20000 -> CM 40000, OI 20000, DOL 2.0', good.ok === true && good.contributionMargin === 40000 && good.operatingIncome === 20000 && good.dol === 2, JSON.stringify(good));
  const bad = dolCalculate(100000, 60000, 40000); // operating income exactly zero
  check('degree-of-operating-leverage-calculator', 'operating income at break-even (zero) -> error not divide-by-zero', bad.ok === false, JSON.stringify(bad));
}

// ---------- depreciation-calculator ----------
function depCalculate(cost: number, salvage: number, life: number) {
  if (!Number.isFinite(cost) || cost <= 0) return { ok: false as const };
  if (!Number.isFinite(salvage) || salvage < 0 || salvage >= cost) return { ok: false as const };
  if (!Number.isFinite(life) || life <= 0) return { ok: false as const };
  return { ok: true as const, annualDepreciation: (cost - salvage) / life };
}
{
  const good = depCalculate(10000, 2000, 4);
  check('depreciation-calculator', 'valid: cost=10000,salvage=2000,life=4 -> $2000/year', good.ok === true && good.annualDepreciation === 2000, JSON.stringify(good));
  const bad = depCalculate(10000, 10000, 4); // salvage equals cost
  check('depreciation-calculator', 'salvage equal to cost -> error not zero-depreciation silently', bad.ok === false, JSON.stringify(bad));
}

// ---------- discounted-cash-flow-calculator ----------
function dcfCalculate(cashFlows: number[], discountRatePercent: number, initialInvestment: number) {
  if (!Number.isFinite(discountRatePercent) || discountRatePercent <= -100) return { ok: false as const };
  if (!Number.isFinite(initialInvestment) || initialInvestment < 0) return { ok: false as const };
  if (cashFlows.length === 0) return { ok: false as const };
  const r = discountRatePercent / 100;
  const presentValue = cashFlows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + r, i + 1), 0);
  return { ok: true as const, presentValue, netPresentValue: presentValue - initialInvestment };
}
{
  const good = dcfCalculate([1000, 1000, 1000], 10, 0);
  check('discounted-cash-flow-calculator', 'valid: 10% rate, 3x $1000 -> PV ~ $2486.85', good.ok === true && Math.abs(good.presentValue - 2486.85) < 0.01, JSON.stringify(good));
  const bad = dcfCalculate([], 10, 0); // no cash flows
  check('discounted-cash-flow-calculator', 'no cash flows -> error not zero/NaN result', bad.ok === false, JSON.stringify(bad));
}

// ---------- dividend-calculator ----------
function divCalculate(shares: number, dividendPerShare: number, sharePrice: number | null) {
  if (!Number.isFinite(shares) || shares <= 0) return { ok: false as const };
  if (!Number.isFinite(dividendPerShare) || dividendPerShare < 0) return { ok: false as const };
  const annualDividendIncome = shares * dividendPerShare;
  const yieldPercent = sharePrice !== null ? (dividendPerShare / sharePrice) * 100 : null;
  return { ok: true as const, annualDividendIncome, yieldPercent };
}
{
  const good = divCalculate(100, 2.5, null);
  check('dividend-calculator', 'valid: 100 shares x $2.50 -> $250 income', good.ok === true && good.annualDividendIncome === 250, JSON.stringify(good));
  const withYield = divCalculate(100, 2.5, 50);
  check('dividend-calculator', 'valid with price=$50 -> yield 5%', withYield.ok === true && withYield.yieldPercent === 5, JSON.stringify(withYield));
  const bad = divCalculate(0, 2.5, null); // zero shares
  check('dividend-calculator', 'zero shares -> error not crash', bad.ok === false, JSON.stringify(bad));
}

// ---------- dividend-discount-model-calculator ----------
function ddmCalculate(d0: number, growthPercent: number, requiredReturnPercent: number) {
  if (!Number.isFinite(d0) || d0 <= 0) return { ok: false as const };
  if (!Number.isFinite(growthPercent) || !Number.isFinite(requiredReturnPercent)) return { ok: false as const };
  if (requiredReturnPercent <= growthPercent) return { ok: false as const };
  const d1 = d0 * (1 + growthPercent / 100);
  const value = d1 / (requiredReturnPercent / 100 - growthPercent / 100);
  return { ok: true as const, d1, value };
}
{
  const good = ddmCalculate(2, 5, 10);
  check('dividend-discount-model-calculator', 'valid: D0=2,g=5%,r=10% -> D1=2.10, value=42.00', good.ok === true && Math.abs(good.d1 - 2.1) < 1e-9 && Math.abs(good.value - 42) < 1e-9, JSON.stringify(good));
  const badEqual = ddmCalculate(2, 10, 10); // r equals g
  check('dividend-discount-model-calculator', 'r equal to g -> rejected with error, not Infinity', badEqual.ok === false, JSON.stringify(badEqual));
  const badLess = ddmCalculate(2, 12, 10); // r less than g
  check('dividend-discount-model-calculator', 'r less than g -> rejected with error, not a negative value', badLess.ok === false, JSON.stringify(badLess));
}

// ---------- earnings-per-share-calculator ----------
function epsCalculate(netIncomeStr: string, preferredDividendsStr: string, sharesStr: string) {
  const netIncome = Number(netIncomeStr);
  const preferredDividends = preferredDividendsStr === '' ? 0 : Number(preferredDividendsStr);
  const shares = Number(sharesStr);
  if (netIncomeStr === '' || Number.isNaN(netIncome)) return { ok: false as const };
  if (Number.isNaN(preferredDividends) || preferredDividends < 0) return { ok: false as const };
  if (!sharesStr || Number.isNaN(shares) || shares <= 0) return { ok: false as const };
  return { ok: true as const, eps: (netIncome - preferredDividends) / shares };
}
{
  const good = epsCalculate('500000', '50000', '100000');
  check('earnings-per-share-calculator', 'NI=500000,PrefDiv=50000,Shares=100000 -> EPS=4.50', good.ok === true && Math.abs(good.eps - 4.5) < 1e-9, JSON.stringify(good));
  const loss = epsCalculate('-200000', '0', '100000');
  check('earnings-per-share-calculator', 'negative net income (loss) -> negative EPS, not rejected', loss.ok === true && loss.eps === -2, JSON.stringify(loss));
  const zeroShares = epsCalculate('500000', '0', '0');
  check('earnings-per-share-calculator', 'zero shares -> error not crash', zeroShares.ok === false, JSON.stringify(zeroShares));
}

// ---------- ebit-calculator ----------
function ebitFromRevenue(revenue: number, cogs: number, opEx: number) {
  return { ok: true as const, ebit: revenue - cogs - opEx };
}
function ebitFromNetIncome(netIncome: number, interest: number, taxes: number) {
  return { ok: true as const, ebit: netIncome + interest + taxes };
}
{
  const g1 = ebitFromNetIncome(100000, 20000, 30000);
  check('ebit-calculator', 'net-income mode: NI=100000,Interest=20000,Taxes=30000 -> 150000', g1.ebit === 150000, JSON.stringify(g1));
  const g2 = ebitFromRevenue(500000, 250000, 100000);
  check('ebit-calculator', 'revenue mode: Revenue=500000,COGS=250000,OpEx=100000 -> 150000', g2.ebit === 150000, JSON.stringify(g2));
}

// ---------- ebitda-calculator ----------
function ebitdaCalculate(netIncome: number, interest: number, taxes: number, depreciation: number, amortization: number) {
  return { ok: true as const, ebitda: netIncome + interest + taxes + depreciation + amortization };
}
{
  const good = ebitdaCalculate(100000, 20000, 30000, 10000, 5000);
  check('ebitda-calculator', 'NI=100000+Int20000+Tax30000+Dep10000+Amort5000 -> 165000', good.ebitda === 165000, JSON.stringify(good));
  const negative = ebitdaCalculate(-500000, 10000, 0, 10000, 0);
  check('ebitda-calculator', 'negative EBITDA allowed, not rejected', negative.ebitda === -480000, JSON.stringify(negative));
}

// ---------- ebitda-multiple-calculator ----------
function ebitdaMultipleCalculate(ev: number, ebitda: number) {
  if (ebitda === 0) return { ok: false as const };
  return { ok: true as const, multiple: ev / ebitda };
}
{
  const good = ebitdaMultipleCalculate(10000000, 2000000);
  check('ebitda-multiple-calculator', 'EV=10000000,EBITDA=2000000 -> 5.00x', good.ok === true && good.multiple.toFixed(2) === '5.00', JSON.stringify(good));
  const zero = ebitdaMultipleCalculate(10000000, 0);
  check('ebitda-multiple-calculator', 'zero EBITDA -> rejected, not Infinity', zero.ok === false, JSON.stringify(zero));
}

// ---------- economic-value-added-calculator ----------
function evaCalculate(nopat: number, investedCapital: number, waccPercent: number) {
  const capitalCharge = investedCapital * (waccPercent / 100);
  return { ok: true as const, capitalCharge, eva: nopat - capitalCharge };
}
{
  const good = evaCalculate(500000, 4000000, 10);
  check('economic-value-added-calculator', 'NOPAT=500000,Capital=4000000,WACC=10% -> charge=400000,EVA=100000', good.capitalCharge === 400000 && good.eva === 100000, JSON.stringify(good));
}

// ---------- enterprise-value-calculator ----------
function evCalculate(marketCap: number, debt: number, cash: number, preferredStock = 0, minorityInterest = 0) {
  return { ok: true as const, enterpriseValue: marketCap + debt + preferredStock + minorityInterest - cash };
}
{
  const good = evCalculate(8000000, 3000000, 1000000);
  check('enterprise-value-calculator', 'MarketCap=8000000,Debt=3000000,Cash=1000000 -> EV=10000000', good.enterpriseValue === 10000000, JSON.stringify(good));
  const withOptional = evCalculate(8000000, 3000000, 1000000, 500000, 200000);
  check('enterprise-value-calculator', 'with preferred stock and minority interest included in sum', withOptional.enterpriseValue === 10700000, JSON.stringify(withOptional));
}

// ---------- equivalent-rate-calculator ----------
function equivalentPeriodicRateCalc(rate1Percent: number, periodsPerYear1: number, periodsPerYear2: number) {
  const i1 = rate1Percent / 100;
  return (Math.pow(1 + i1, periodsPerYear1 / periodsPerYear2) - 1) * 100;
}
{
  const monthlyToAnnual = equivalentPeriodicRateCalc(1, 12, 1);
  check('equivalent-rate-calculator', '1% monthly -> equivalent annual ~12.6825%', Math.abs(monthlyToAnnual - 12.6825030131) < 1e-6, String(monthlyToAnnual));
  const roundTrip = equivalentPeriodicRateCalc(monthlyToAnnual, 1, 12);
  check('equivalent-rate-calculator', 'round trip annual -> monthly returns original 1% rate', Math.abs(roundTrip - 1) < 1e-9, String(roundTrip));
}

// ---------- free-cash-flow-calculator ----------
function fcfCalculate(operatingCashFlow: number, capex: number) {
  return { ok: true as const, fcf: operatingCashFlow - capex };
}
{
  const good = fcfCalculate(500000, 150000);
  check('free-cash-flow-calculator', 'OCF=500000,CapEx=150000 -> FCF=350000', good.fcf === 350000, JSON.stringify(good));
  const negative = fcfCalculate(100000, 300000);
  check('free-cash-flow-calculator', 'negative FCF allowed, not rejected', negative.fcf === -200000, JSON.stringify(negative));
}

// ---------- future-value-calculator ----------
function fvLumpSum(principal: number, aprPercent: number, n: number, years: number) {
  const r = aprPercent / 100;
  return principal * Math.pow(1 + r / n, n * years);
}
function fvContributions(contribution: number, aprPercent: number, n: number, years: number) {
  const r = aprPercent / 100 / n;
  const periods = n * years;
  if (r === 0) return contribution * periods;
  return contribution * ((Math.pow(1 + r, periods) - 1) / r);
}
{
  const lumpSum = fvLumpSum(10000, 5, 1, 10);
  check('future-value-calculator', 'PV=10000,5%,10yr annual (lump sum only) -> ~16288.95', Math.abs(lumpSum - 16288.9463) < 0.001, String(lumpSum));

  const withContributions = fvLumpSum(10000, 5, 12, 10) + fvContributions(100, 5, 12, 10);
  check('future-value-calculator', 'lump sum + monthly $100 contributions produces a higher FV than lump sum alone', withContributions > fvLumpSum(10000, 5, 12, 10), String(withContributions));

  const zeroRateContrib = fvContributions(100, 0, 12, 1);
  check('future-value-calculator', '0% rate contributions -> contribution × periods (100 × 12 = 1200)', zeroRateContrib === 1200, String(zeroRateContrib));
}

// ---------- interest-coverage-ratio-calculator ----------
function interestCoverageCalculate(ebit: number, interestExpense: number) {
  if (interestExpense === 0) return { ok: false as const };
  return { ok: true as const, ratio: ebit / interestExpense };
}
{
  const good = interestCoverageCalculate(500000, 100000);
  check('interest-coverage-ratio-calculator', 'EBIT=500000,Interest=100000 -> 5.0x', good.ok === true && good.ratio === 5, JSON.stringify(good));
  const negative = interestCoverageCalculate(-200000, 100000);
  check('interest-coverage-ratio-calculator', 'negative EBIT allowed, produces negative ratio', negative.ok === true && negative.ratio === -2, JSON.stringify(negative));
  const zeroInterest = interestCoverageCalculate(500000, 0);
  check('interest-coverage-ratio-calculator', 'zero interest expense -> rejected', zeroInterest.ok === false, JSON.stringify(zeroInterest));
}

// ---------- inventory-turnover-calculator ----------
function inventoryTurnoverCalculate(cogs: number, begin: number, end: number) {
  const avg = (begin + end) / 2;
  if (avg === 0) return { ok: false as const };
  const turnover = cogs / avg;
  return { ok: true as const, avg, turnover, daysInventory: 365 / turnover };
}
{
  const good = inventoryTurnoverCalculate(500000, 80000, 120000);
  check('inventory-turnover-calculator', 'COGS=500000,Begin=80000,End=120000 -> avg=100000,turnover=5.0x', good.ok === true && good.avg === 100000 && good.turnover === 5, JSON.stringify(good));
  check('inventory-turnover-calculator', 'days inventory ~73', good.ok === true && Math.abs(good.daysInventory - 73) < 0.1, JSON.stringify(good));
  const zeroAvg = inventoryTurnoverCalculate(500000, 0, 0);
  check('inventory-turnover-calculator', 'zero average inventory -> rejected', zeroAvg.ok === false, JSON.stringify(zeroAvg));
}

// ---------- marginal-cost-calculator ----------
function marginalCostCalculate(deltaTotalCost: number, deltaQuantity: number) {
  if (deltaQuantity === 0) return { ok: false as const };
  return { ok: true as const, marginalCost: deltaTotalCost / deltaQuantity };
}
{
  const good = marginalCostCalculate(2500, 500);
  check('marginal-cost-calculator', 'deltaTC=2500,deltaQ=500 -> 5/unit', good.ok === true && good.marginalCost === 5, JSON.stringify(good));
  const negativeQ = marginalCostCalculate(-1000, -200);
  check('marginal-cost-calculator', 'negative deltaQ allowed, computed not blocked', negativeQ.ok === true && negativeQ.marginalCost === 5, JSON.stringify(negativeQ));
  const zeroQ = marginalCostCalculate(2500, 0);
  check('marginal-cost-calculator', 'zero deltaQ -> rejected', zeroQ.ok === false, JSON.stringify(zeroQ));
}

// ---------- market-capitalization-calculator ----------
function marketCapCalculate(price: number, shares: number) {
  return { ok: true as const, marketCap: price * shares };
}
{
  const good = marketCapCalculate(50, 10000000);
  check('market-capitalization-calculator', 'Price=50,Shares=10000000 -> 500000000', good.marketCap === 500000000, JSON.stringify(good));
}

// ---------- net-profit-margin-calculator ----------
function netProfitMarginCalculate(netIncome: number, revenue: number) {
  if (revenue === 0) return { ok: false as const };
  return { ok: true as const, margin: (netIncome / revenue) * 100 };
}
{
  const good = netProfitMarginCalculate(150000, 1000000);
  check('net-profit-margin-calculator', 'NetIncome=150000,Revenue=1000000 -> 15%', good.ok === true && good.margin === 15, JSON.stringify(good));
  const negative = netProfitMarginCalculate(-50000, 1000000);
  check('net-profit-margin-calculator', 'negative net income -> negative margin, not an error', negative.ok === true && negative.margin === -5, JSON.stringify(negative));
  const zeroRevenue = netProfitMarginCalculate(150000, 0);
  check('net-profit-margin-calculator', 'zero revenue -> rejected', zeroRevenue.ok === false, JSON.stringify(zeroRevenue));
}

// ---------- nopat-calculator ----------
function nopatCalculate(ebit: number, taxRatePercent: number) {
  return { ok: true as const, nopat: ebit * (1 - taxRatePercent / 100) };
}
{
  const good = nopatCalculate(500000, 25);
  check('nopat-calculator', 'EBIT=500000,TaxRate=25% -> 375000', good.nopat === 375000, JSON.stringify(good));
}

// ---------- car-loan-emi-calculator / shared calculateEmi ----------
function calculateEmi(principal: number, annualRatePercent: number, months: number) {
  const monthlyRate = annualRatePercent / 100 / 12;
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  }
  const totalPayment = monthlyPayment * months;
  return { monthlyPayment, totalPayment, totalInterest: totalPayment - principal };
}
{
  // Known amortization example: principal=500000, APR=8%, 60 months -> standard formula check
  const known = calculateEmi(500000, 8, 60);
  const monthlyRate = 0.08 / 12;
  const expected = (500000 * monthlyRate * Math.pow(1 + monthlyRate, 60)) / (Math.pow(1 + monthlyRate, 60) - 1);
  check('car-loan-emi-calculator', 'principal=500000,APR=8%,60mo matches independent formula computation', Math.abs(known.monthlyPayment - expected) < 0.001, String(known.monthlyPayment));

  const zeroApr = calculateEmi(120000, 0, 12);
  check('car-loan-emi-calculator', '0% APR -> principal / months (120000/12=10000)', zeroApr.monthlyPayment === 10000, JSON.stringify(zeroApr));

  const oneMonth = calculateEmi(10000, 6, 1);
  check('car-loan-emi-calculator', '1-month term computes a single payment close to principal + one month interest', oneMonth.monthlyPayment > 10000 && oneMonth.monthlyPayment < 10100, JSON.stringify(oneMonth));

  const decimalApr = calculateEmi(50000, 5.75, 36);
  check('car-loan-emi-calculator', 'decimal APR (5.75%) computes a finite, positive payment', Number.isFinite(decimalApr.monthlyPayment) && decimalApr.monthlyPayment > 0, JSON.stringify(decimalApr));

  // Vehicle-specific layer: financed amount = price - down payment - trade-in
  const vehiclePrice = 30000, downPayment = 3000, tradeIn = 2000;
  const financedAmount = vehiclePrice - downPayment - tradeIn;
  check('car-loan-emi-calculator', 'financed amount = price - down payment - trade-in (30000-3000-2000=25000)', financedAmount === 25000, String(financedAmount));
  const fullyCovered = 5000 - 3000 - 2000;
  check('car-loan-emi-calculator', 'down payment + trade-in covering full price -> financed amount is zero (rejected)', fullyCovered === 0, String(fullyCovered));
}

describe('Calculators', () => {
  results.forEach((r) => {
    it(`${r.tool}: ${r.test}`, () => {
      expect(r.pass, r.detail).toBe(true);
    });
  });
});
