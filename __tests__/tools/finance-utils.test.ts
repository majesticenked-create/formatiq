import { describe, it, expect } from 'vitest';
import { compoundBalance, nominalRateToApy } from '@/lib/tools/finance-utils';

describe('finance-utils', () => {
  it('nominalRateToApy: 5% APR monthly compounding produces APY slightly above 5%', () => {
    const apy = nominalRateToApy(5, 'monthly');
    expect(apy).toBeGreaterThan(5);
    expect(apy).toBeLessThan(5.2);
  });

  it('nominalRateToApy: annual compounding of an APR equals that same rate (no compounding effect)', () => {
    const apy = nominalRateToApy(5, 'annually');
    expect(apy).toBeCloseTo(5, 9);
  });

  it('compoundBalance: $10000 @ 5% APR monthly for 1 year matches hand-verified CD math', () => {
    const balance = compoundBalance(10000, 5, 'monthly', 1);
    expect(balance).toBeCloseTo(10511.62, 2);
  });

  it('compoundBalance: 0% APR leaves the principal unchanged regardless of term', () => {
    const balance = compoundBalance(10000, 0, 'monthly', 5);
    expect(balance).toBe(10000);
  });

  it('compoundBalance: more frequent compounding produces a higher balance for the same APR', () => {
    const monthly = compoundBalance(10000, 5, 'monthly', 1);
    const annually = compoundBalance(10000, 5, 'annually', 1);
    expect(monthly).toBeGreaterThan(annually);
  });
});
