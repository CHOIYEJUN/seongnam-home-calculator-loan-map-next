import { LoanProduct } from '@/shared/types/loan';

export const loanProducts: LoanProduct[] = [
  // 은행 상품
  {
    id: 'bank-1',
    category: 'bank',
    name: '우리은행 전세자금대출',
    provider: '우리은행',
    interestRate: 4.2,
    maxAmount: 500000000,
    minPeriod: 12,
    maxPeriod: 24,
    repaymentMethods: ['maturity', 'equal-principal', 'equal-payment'],
    description: '전세 계약서 기준 전세보증금의 최대 80%까지 대출 가능',
    conditions: [
      '만 19세 이상',
      '연소득 7천만원 이하',
      '무주택 세대주',
      '전세보증금 5억원 이하'
    ]
  },
  {
    id: 'bank-2',
    category: 'bank',
    name: 'KB국민은행 전세자금대출',
    provider: 'KB국민은행',
    interestRate: 4.0,
    maxAmount: 600000000,
    minPeriod: 12,
    maxPeriod: 24,
    repaymentMethods: ['maturity','equal-principal', 'equal-payment'],
    description: 'KB스타클럽 회원 우대금리 적용',
    conditions: [
      '만 19세 이상',
      '재직 또는 사업 영위 6개월 이상',
      '연소득 8천만원 이하',
      '전세보증금 6억원 이하'
    ]
  },
  {
    id: 'bank-3',
    category: 'bank',
    name: '신한은행 전세론',
    provider: '신한은행',
    interestRate: 4.1,
    maxAmount: 500000000,
    minPeriod: 12,
    maxPeriod: 24,
    repaymentMethods: ['maturity', 'equal-principal', 'equal-payment'],
    description: '신한 모바일 전용 우대금리 0.3%p 추가 할인',
    conditions: [
      '만 19세 이상',
      '연소득 7천만원 이하',
      '무주택자',
      '전세보증금 5억원 이하'
    ]
  },
  {
    id: 'bank-4',
    category: 'bank',
    name: '하나은행 전세자금대출',
    provider: '하나은행',
    interestRate: 3.9,
    maxAmount: 500000000,
    minPeriod: 12,
    maxPeriod: 24,
    repaymentMethods: ['maturity','equal-principal', 'equal-payment'],
    description: '하나멤버스 우대금리 최대 0.5%p',
    conditions: [
      '만 19세 이상',
      '연소득 8천만원 이하',
      '무주택 또는 1주택자',
      '전세보증금 5억원 이하'
    ]
  },

  // 주택공사 상품
  {
    id: 'housing-1',
    category: 'housing',
    name: 'LH 전세임대 지원',
    provider: 'LH 한국토지주택공사',
    interestRate: 1.8,
    maxAmount: 120000000,
    minPeriod: 12,
    maxPeriod: 24,
    repaymentMethods: ['maturity'],
    description: '무주택 저소득층 전세 입주 지원',
    conditions: [
      '무주택 세대구성원',
      '도시근로자 월평균소득 70% 이하',
      '자산 2억 8,800만원 이하',
      '전용면적 85㎡ 이하'
    ]
  },
  {
    id: 'housing-2',
    category: 'housing',
    name: 'LH 전세자금 융자',
    provider: 'LH 한국토지주택공사',
    interestRate: 2.1,
    maxAmount: 180000000,
    minPeriod: 12,
    maxPeriod: 24,
    repaymentMethods: ['maturity'],
    description: '신혼부부 및 청년 전세자금 지원',
    conditions: [
      '무주택 세대구성원',
      '혼인 7년 이내 또는 만 39세 이하',
      '부부합산 연소득 6천만원 이하',
      '전용면적 85㎡ 이하'
    ]
  },
  {
    id: 'housing-3',
    category: 'housing',
    name: 'SH 전세자금 지원',
    provider: 'SH 서울주택도시공사',
    interestRate: 2.0,
    maxAmount: 150000000,
    minPeriod: 12,
    maxPeriod: 24,
    repaymentMethods: ['maturity'],
    description: '서울시민 전세자금 지원',
    conditions: [
      '서울시 거주 무주택자',
      '연소득 7천만원 이하',
      '자산 3억 6,100만원 이하',
      '전세보증금 4억원 이하'
    ]
  },

  // 정부 상품
  {
    id: 'gov-1',
    category: 'government',
    name: '주택도시기금 버팀목 전세자금',
    provider: '주택도시보증공사(HUG)',
    interestRate: 2.3,
    maxAmount: 200000000,
    minPeriod: 24,
    maxPeriod: 24,
    repaymentMethods: ['maturity'],
    description: '무주택 서민의 주거안정을 위한 저금리 전세자금',
    conditions: [
      '무주택 세대주',
      '부부합산 연소득 5천만원 이하',
      '순자산 3억 4,500만원 이하',
      '전용면적 85㎡ 이하'
    ]
  },
  {
    id: 'gov-2',
    category: 'government',
    name: '주택도시기금 청년 전세자금',
    provider: '주택도시보증공사(HUG)',
    interestRate: 1.8,
    maxAmount: 120000000,
    minPeriod: 12,
    maxPeriod: 24,
    repaymentMethods: ['maturity'],
    description: '만 19~34세 청년의 전세자금 지원',
    conditions: [
      '만 19세 이상 34세 이하',
      '무주택자',
      '연소득 5천만원 이하',
      '순자산 2억 8,800만원 이하'
    ]
  },
  {
    id: 'gov-3',
    category: 'government',
    name: '주택도시기금 신혼부부 전세자금',
    provider: '주택도시보증공사(HUG)',
    interestRate: 1.5,
    maxAmount: 240000000,
    minPeriod: 12,
    maxPeriod: 24,
    repaymentMethods: ['maturity'],
    description: '혼인 7년 이내 신혼부부 전세자금 최우대 지원',
    conditions: [
      '혼인 7년 이내',
      '무주택 세대주',
      '부부합산 연소득 6천만원 이하',
      '순자산 3억 6,100만원 이하'
    ]
  },
  {
    id: 'gov-4',
    category: 'government',
    name: '주택도시기금 다자녀 가구 전세자금',
    provider: '주택도시보증공사(HUG)',
    interestRate: 1.2,
    maxAmount: 300000000,
    minPeriod: 12,
    maxPeriod: 24,
    repaymentMethods: ['maturity'],
    description: '2자녀 이상 다자녀 가구 전세자금 특별 지원',
    conditions: [
      '2자녀 이상 가구',
      '무주택 세대주',
      '부부합산 연소득 7천만원 이하',
      '순자산 3억 8,800만원 이하'
    ]
  },
];

