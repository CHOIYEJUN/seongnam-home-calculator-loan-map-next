export type LoanCategory = 'bank' | 'housing' | 'government' | 'public';

export type RepaymentMethod = 'equal-principal' | 'equal-payment' | 'maturity';

export type InterestRateType = 'variable' | 'fixed' | 'mixed';

export type TargetGroup = 'general' | 'youth' | 'newlywed' | 'multi-child' | 'senior';

export interface LoanProduct {
  id: string;
  category: LoanCategory;
  name: string;
  provider: string; // 제공기관
  interestRate: number; // 대표 금리 (= interestRateMin)
  interestRateMin: number; // 최저 금리
  interestRateMax: number; // 최고 금리
  interestRateType: InterestRateType; // 금리 유형
  maxAmount: number; // 최대 대출 한도
  minPeriod: number; // 최소 대출 기간 (개월)
  maxPeriod: number; // 최대 대출 기간 (개월)
  repaymentMethods: RepaymentMethod[]; // 상환 방법
  targetGroups: TargetGroup[]; // 대상 그룹 (복수 가능)
  description: string;
  conditions: string[]; // 대출 조건
  url?: string; // 공식 링크 (선택)
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
