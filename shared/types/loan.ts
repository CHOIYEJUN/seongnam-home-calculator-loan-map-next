export type LoanCategory = 'bank' | 'housing' | 'government';

export type RepaymentMethod = 'equal-principal' | 'equal-payment' | 'maturity';

export interface LoanProduct {
  id: string;
  category: LoanCategory;
  name: string;
  provider: string; // 제공기관
  interestRate: number; // 금리 (%)
  maxAmount: number; // 최대 대출 한도
  minPeriod: number; // 최소 대출 기간 (개월)
  maxPeriod: number; // 최대 대출 기간 (개월)
  repaymentMethods: RepaymentMethod[]; // 상환 방법
  description: string;
  conditions: string[]; // 대출 조건
}

export interface LoanCalculation {
  loanAmount: number;
  interestRate: number;
  loanPeriod: number; // 개월
  repaymentMethod: RepaymentMethod;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule?: LoanScheduleItem[];
}

export interface LoanScheduleItem {
  month: number;
  principal: number;
  interest: number;
  payment: number;
  balance: number;
}

