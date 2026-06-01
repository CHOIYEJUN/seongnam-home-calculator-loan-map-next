/**
 * 전세 대출 한도 및 이자 계산 (레거시 유틸 — 현재 미사용)
 * 실제로는 은행 API와 주택공사 데이터를 사용해야 하지만,
 * 여기서는 일반적인 규칙을 기반으로 예측합니다.
 */
interface LegacyLoanEstimate {
  maxLoanAmount: number;
  interestRate: number;
  monthlyPayment: number;
  loanType: string;
}

export function calculateLoanEstimate(
  jeonsePrice: number,
  marketPrice: number,
  officialPrice: number,
  propertyType: 'apartment' | 'officetel'
): LegacyLoanEstimate {
  // LTV (Loan To Value) 비율 설정
  // 아파트: 최대 80%, 오피스텔: 최대 70%
  const ltvRatio = propertyType === 'apartment' ? 0.80 : 0.70;
  
  // 전세가 기준 대출 한도 계산
  const maxLoanByJeonse = jeonsePrice * ltvRatio;
  
  // 시세 기준 대출 한도 계산
  const maxLoanByMarket = marketPrice * ltvRatio;
  
  // 더 낮은 금액을 한도로 설정
  const maxLoanAmount = Math.min(maxLoanByJeonse, maxLoanByMarket);
  
  // 금리 설정 (2024년 기준 예상)
  // 주택도시기금: 1.8~3.0%
  // 시중은행: 3.5~5.5%
  let interestRate: number;
  let loanType: string;
  
  if (jeonsePrice <= 300000000) {
    // 3억 이하: 주택도시기금 이용 가능
    interestRate = 2.3;
    loanType = '주택도시기금 전세자금대출';
  } else if (jeonsePrice <= 600000000) {
    // 6억 이하: 은행 우대금리
    interestRate = 3.8;
    loanType = '시중은행 전세자금대출 (우대)';
  } else {
    // 6억 초과: 일반 은행 대출
    interestRate = 4.5;
    loanType = '시중은행 전세자금대출';
  }
  
  // 월 이자 계산 (원금균등상환 기준)
  // 대출기간 2년 가정
  const monthlyInterestRate = interestRate / 100 / 12;
  const loanPeriodMonths = 24;
  
  const monthlyPrincipal = maxLoanAmount / loanPeriodMonths;
  const averageMonthlyInterest = (maxLoanAmount * monthlyInterestRate + 
    (maxLoanAmount - monthlyPrincipal * (loanPeriodMonths - 1)) * monthlyInterestRate) / 2;
  
  const monthlyPayment = monthlyPrincipal + averageMonthlyInterest;
  
  return {
    maxLoanAmount: Math.floor(maxLoanAmount),
    interestRate,
    monthlyPayment: Math.floor(monthlyPayment),
    loanType
  };
}

