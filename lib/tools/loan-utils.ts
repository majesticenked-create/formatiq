/**
 * Shared amortized-loan (EMI) math, extracted so any loan-shaped tool (Car Loan EMI Calculator,
 * and any future one) can reuse the same formula without reimplementing it. LoanCalculator's own
 * inline copy of this formula is left as-is (pre-existing, not touched by this batch); this
 * module is for new tools that need the same math.
 */

export interface EmiResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

/**
 * Computes a standard fixed-rate amortized loan payment: EMI = P × r × (1+r)^n / ((1+r)^n − 1),
 * where r is the monthly interest rate and n is the number of monthly installments. Falls back to
 * a straight-line principal/months split when the rate is 0%, since the standard formula divides
 * by zero in that case.
 */
export function calculateEmi(principal: number, annualRatePercent: number, months: number): EmiResult {
  const monthlyRate = annualRatePercent / 100 / 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  }

  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - principal;

  return { monthlyPayment, totalPayment, totalInterest };
}
