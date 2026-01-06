export interface Property {
  id: string;
  name: string;
  address: string;
  type: 'apartment' | 'officetel';
  lat: number;
  lng: number;
  units: PropertyUnit[];
}

export interface PropertyUnit {
  id: string;
  propertyId: string;
  area: number; // 평형
  officialPrice: number; // 공시지가
  marketPrice: number; // 시세
  jeonsePrice: number; // 전세가
  monthlyRent?: number; // 월세 (옵션)
}

export interface LoanEstimate {
  maxLoanAmount: number; // 최대 대출 한도
  interestRate: number; // 금리 (%)
  monthlyPayment: number; // 월 상환액
  loanType: string; // 대출 유형
}

