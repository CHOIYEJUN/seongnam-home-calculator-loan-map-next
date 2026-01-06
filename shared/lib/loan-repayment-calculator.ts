import { LoanCalculation, LoanScheduleItem, RepaymentMethod } from '../types/loan';

/**
 * 대출 상환 계산기
 */
export function calculateLoanRepayment(
  loanAmount: number,
  interestRate: number,
  loanPeriod: number,
  repaymentMethod: RepaymentMethod
): LoanCalculation {
  const monthlyRate = interestRate / 100 / 12;
  let monthlyPayment = 0;
  let totalPayment = 0;
  let totalInterest = 0;
  const schedule: LoanScheduleItem[] = [];

  switch (repaymentMethod) {
    case 'equal-principal': // 원금균등상환
      totalInterest = calculateEqualPrincipal(
        loanAmount,
        monthlyRate,
        loanPeriod,
        schedule
      );
      monthlyPayment = schedule[0]?.payment || 0;
      totalPayment = loanAmount + totalInterest;
      break;

    case 'equal-payment': // 원리금균등상환
      monthlyPayment = calculateEqualPayment(loanAmount, monthlyRate, loanPeriod);
      totalPayment = monthlyPayment * loanPeriod;
      totalInterest = totalPayment - loanAmount;
      calculateEqualPaymentSchedule(
        loanAmount,
        monthlyRate,
        loanPeriod,
        monthlyPayment,
        schedule
      );
      break;

    case 'maturity': // 만기일시상환
      totalInterest = loanAmount * monthlyRate * loanPeriod;
      monthlyPayment = loanAmount * monthlyRate; // 월 이자만
      totalPayment = loanAmount + totalInterest;
      calculateMaturitySchedule(loanAmount, monthlyRate, loanPeriod, schedule);
      break;
  }

  return {
    loanAmount,
    interestRate,
    loanPeriod,
    repaymentMethod,
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    schedule
  };
}

/**
 * 원금균등상환 계산
 */
function calculateEqualPrincipal(
  loanAmount: number,
  monthlyRate: number,
  loanPeriod: number,
  schedule: LoanScheduleItem[]
): number {
  const principalPayment = loanAmount / loanPeriod;
  let balance = loanAmount;
  let totalInterest = 0;

  for (let month = 1; month <= loanPeriod; month++) {
    const interest = balance * monthlyRate;
    const payment = principalPayment + interest;
    balance -= principalPayment;
    totalInterest += interest;

    schedule.push({
      month,
      principal: Math.round(principalPayment),
      interest: Math.round(interest),
      payment: Math.round(payment),
      balance: Math.round(Math.max(0, balance))
    });
  }

  return totalInterest;
}

/**
 * 원리금균등상환 월 납입액 계산
 */
function calculateEqualPayment(
  loanAmount: number,
  monthlyRate: number,
  loanPeriod: number
): number {
  if (monthlyRate === 0) return loanAmount / loanPeriod;
  
  return (
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanPeriod)) /
    (Math.pow(1 + monthlyRate, loanPeriod) - 1)
  );
}

/**
 * 원리금균등상환 스케줄 계산
 */
function calculateEqualPaymentSchedule(
  loanAmount: number,
  monthlyRate: number,
  loanPeriod: number,
  monthlyPayment: number,
  schedule: LoanScheduleItem[]
): void {
  let balance = loanAmount;

  for (let month = 1; month <= loanPeriod; month++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance -= principal;

    schedule.push({
      month,
      principal: Math.round(principal),
      interest: Math.round(interest),
      payment: Math.round(monthlyPayment),
      balance: Math.round(Math.max(0, balance))
    });
  }
}

/**
 * 만기일시상환 스케줄 계산
 */
function calculateMaturitySchedule(
  loanAmount: number,
  monthlyRate: number,
  loanPeriod: number,
  schedule: LoanScheduleItem[]
): void {
  const monthlyInterest = loanAmount * monthlyRate;

  for (let month = 1; month <= loanPeriod; month++) {
    const isLastMonth = month === loanPeriod;
    const principal = isLastMonth ? loanAmount : 0;
    const payment = isLastMonth ? loanAmount + monthlyInterest : monthlyInterest;

    schedule.push({
      month,
      principal: Math.round(principal),
      interest: Math.round(monthlyInterest),
      payment: Math.round(payment),
      balance: Math.round(isLastMonth ? 0 : loanAmount)
    });
  }
}

export function getRepaymentMethodName(method: RepaymentMethod): string {
  switch (method) {
    case 'maturity':
      return '만기일시상환';
    case 'equal-principal':
      return '원금균등상환';
    case 'equal-payment':
      return '원리금균등상환';
    default:
      return '';
  }
}

