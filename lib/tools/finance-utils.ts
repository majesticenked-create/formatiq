/**
 * Shared compounding-interest helpers, extracted from ApyCalculator so CdCalculator (and any
 * future compounding-based tool) can reuse the same math without reimplementing it.
 * ApyCalculator's own behavior/output is unchanged - it now just calls this function.
 */

export type CompoundingFrequency = 'daily' | 'monthly' | 'quarterly' | 'semiannually' | 'annually';

export const COMPOUNDING_PERIODS_PER_YEAR: Record<CompoundingFrequency, number> = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  semiannually: 2,
  annually: 1,
};

export const COMPOUNDING_FREQUENCY_LABELS: Record<CompoundingFrequency, string> = {
  daily: 'Daily',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semiannually: 'Semi-annually',
  annually: 'Annually',
};

/**
 * Converts a nominal annual rate (APR, as a percentage) compounded at the given frequency
 * into the effective annual yield (APY, as a percentage): APY = (1 + r/n)^n - 1.
 */
export function nominalRateToApy(ratePercent: number, frequency: CompoundingFrequency): number {
  const n = COMPOUNDING_PERIODS_PER_YEAR[frequency];
  const r = ratePercent / 100;
  return (Math.pow(1 + r / n, n) - 1) * 100;
}

/**
 * Compounds a principal at a nominal annual rate (APR, as a percentage) over a number of years,
 * compounding at the given frequency: balance = principal * (1 + r/n)^(n*years).
 */
export function compoundBalance(
  principal: number,
  aprPercent: number,
  frequency: CompoundingFrequency,
  years: number,
): number {
  const n = COMPOUNDING_PERIODS_PER_YEAR[frequency];
  const r = aprPercent / 100;
  return principal * Math.pow(1 + r / n, n * years);
}

/**
 * Solves for the nominal annual rate (as a percentage) required to grow a principal into a
 * given future value over a number of years at the given compounding frequency - the inverse
 * of compoundBalance: r = n × ((A/P)^(1/(n*years)) - 1).
 */
export function solveForRate(
  principal: number,
  futureValue: number,
  years: number,
  frequency: CompoundingFrequency,
): number {
  const n = COMPOUNDING_PERIODS_PER_YEAR[frequency];
  const ratio = futureValue / principal;
  return n * (Math.pow(ratio, 1 / (n * years)) - 1) * 100;
}
