# 작업지시서 WO002 — 대출 상품 확장 & 계산기 개선

> 담당: frontend-dev  
> 설계 문서: `docs/04-loan-expansion/design-loan-expansion.md`  
> 날짜: 2026-06-02  
> 완료 후 보고서: `docs/04-loan-expansion/work-report-loan-WO002.md`

---

## 작업 순서 (순서 준수 필요)

### STEP 1 — 타입 확장 (`shared/types/loan.ts`)

기존 파일을 Read한 후 다음을 추가:

```typescript
export type LoanCategory = 'bank' | 'housing' | 'government' | 'public';

export type InterestRateType = 'variable' | 'fixed' | 'mixed';

export type TargetGroup = 'general' | 'youth' | 'newlywed' | 'multi-child' | 'senior';

export interface LoanProduct {
  id: string;
  category: LoanCategory;
  name: string;
  provider: string;
  interestRate: number;          // 대표 금리 (= interestRateMin)
  interestRateMin: number;       // 최저 금리
  interestRateMax: number;       // 최고 금리
  interestRateType: InterestRateType;
  maxAmount: number;
  minPeriod: number;
  maxPeriod: number;
  repaymentMethods: RepaymentMethod[];
  targetGroups: TargetGroup[];
  description: string;
  conditions: string[];
  url?: string;
}
// LoanCalculation, LoanScheduleItem 은 그대로 유지
```

---

### STEP 2 — 대출 상품 데이터 교체 (`entities/loan/model/loan-products.ts`)

기존 11개를 완전히 대체하여 아래 36개를 구현. 각 상품의 `interestRate = interestRateMin`으로 설정.

#### 은행 상품 18개

```typescript
// KB국민은행
{ id: 'kb-001', category: 'bank', name: 'KB 전세자금대출', provider: 'KB국민은행',
  interestRate: 3.70, interestRateMin: 3.70, interestRateMax: 5.50, interestRateType: 'variable',
  maxAmount: 500000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity', 'equal-principal', 'equal-payment'],
  targetGroups: ['general'],
  description: '비대면 신청 가능, 전세보증금 80% 이내 최대 5억',
  conditions: ['무주택 세대주', '전세보증금의 80% 이내', '주택가격 9억 이하'],
  url: 'https://www.kbstar.com' },

{ id: 'kb-002', category: 'bank', name: 'KB 청년 전세자금대출', provider: 'KB국민은행',
  interestRate: 3.40, interestRateMin: 3.40, interestRateMax: 4.80, interestRateType: 'variable',
  maxAmount: 300000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity'],
  targetGroups: ['youth'],
  description: '청년 우대금리 적용, 최대 3억',
  conditions: ['만 19~34세', '무주택 세대주 또는 세대원', '연소득 5천만원 이하', '전세보증금 3억 이하'],
  url: 'https://www.kbstar.com' },

// 신한은행
{ id: 'shinhan-001', category: 'bank', name: '신한 쏠편한 전세론', provider: '신한은행',
  interestRate: 3.60, interestRateMin: 3.60, interestRateMax: 5.40, interestRateType: 'variable',
  maxAmount: 500000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity', 'equal-principal', 'equal-payment'],
  targetGroups: ['general'],
  description: '신한 SOL 앱 비대면 신청, 0.3%p 우대금리',
  conditions: ['무주택 세대주', '전세계약서 및 확정일자 필수', '주택 시세 9억 이하'],
  url: 'https://www.shinhan.com' },

{ id: 'shinhan-002', category: 'bank', name: '신한 청년 전세론', provider: '신한은행',
  interestRate: 3.30, interestRateMin: 3.30, interestRateMax: 4.70, interestRateType: 'variable',
  maxAmount: 300000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity'],
  targetGroups: ['youth'],
  description: '청년 전용 우대금리 전세자금대출',
  conditions: ['만 19~34세', '무주택 세대주', '연소득 5천만원 이하'],
  url: 'https://www.shinhan.com' },

// 우리은행
{ id: 'woori-001', category: 'bank', name: '우리 전세론', provider: '우리은행',
  interestRate: 3.65, interestRateMin: 3.65, interestRateMax: 5.45, interestRateType: 'variable',
  maxAmount: 500000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity', 'equal-principal', 'equal-payment'],
  targetGroups: ['general'],
  description: '우리WON뱅킹 비대면 신청 가능',
  conditions: ['무주택 세대주', '전세보증금 80% 이내', '주택가격 9억 이하'],
  url: 'https://www.wooribank.com' },

{ id: 'woori-002', category: 'bank', name: '우리 WON 전세론(청년)', provider: '우리은행',
  interestRate: 3.35, interestRateMin: 3.35, interestRateMax: 4.75, interestRateType: 'variable',
  maxAmount: 300000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity'],
  targetGroups: ['youth'],
  description: '청년 전용 WON 전세자금대출',
  conditions: ['만 19~34세', '무주택 세대주', '연소득 5천만원 이하'],
  url: 'https://www.wooribank.com' },

// 하나은행
{ id: 'hana-001', category: 'bank', name: '하나 전세자금대출', provider: '하나은행',
  interestRate: 3.70, interestRateMin: 3.70, interestRateMax: 5.50, interestRateType: 'variable',
  maxAmount: 500000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity', 'equal-principal', 'equal-payment'],
  targetGroups: ['general'],
  description: '하나멤버스 우대금리 최대 0.5%p',
  conditions: ['무주택 세대주', '전세보증금 80% 이내', '주택가격 9억 이하'],
  url: 'https://www.hanabank.com' },

{ id: 'hana-002', category: 'bank', name: '하나 청년 전세자금대출', provider: '하나은행',
  interestRate: 3.30, interestRateMin: 3.30, interestRateMax: 4.70, interestRateType: 'variable',
  maxAmount: 300000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity'],
  targetGroups: ['youth'],
  description: '청년 전용 하나은행 전세자금대출',
  conditions: ['만 19~34세', '무주택', '연소득 5천만원 이하'],
  url: 'https://www.hanabank.com' },

// NH농협은행
{ id: 'nh-001', category: 'bank', name: 'NH 전세자금대출', provider: 'NH농협은행',
  interestRate: 3.60, interestRateMin: 3.60, interestRateMax: 5.40, interestRateType: 'variable',
  maxAmount: 500000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity', 'equal-principal', 'equal-payment'],
  targetGroups: ['general'],
  description: 'NH농협은행 일반 전세자금대출',
  conditions: ['무주택 세대주', '전세보증금 80% 이내', '주택가격 9억 이하'],
  url: 'https://www.nonghyup.com' },

{ id: 'nh-002', category: 'bank', name: 'NH 청년 전세자금대출', provider: 'NH농협은행',
  interestRate: 3.30, interestRateMin: 3.30, interestRateMax: 4.70, interestRateType: 'variable',
  maxAmount: 300000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity'],
  targetGroups: ['youth'],
  description: 'NH농협 청년 우대 전세자금대출',
  conditions: ['만 19~34세', '무주택', '연소득 5천만원 이하'],
  url: 'https://www.nonghyup.com' },

// IBK기업은행
{ id: 'ibk-001', category: 'bank', name: 'IBK 전세자금대출', provider: 'IBK기업은행',
  interestRate: 3.65, interestRateMin: 3.65, interestRateMax: 5.45, interestRateType: 'variable',
  maxAmount: 500000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity', 'equal-principal', 'equal-payment'],
  targetGroups: ['general'],
  description: '중소기업 재직자 우대금리 적용',
  conditions: ['무주택 세대주', '중소기업 재직자 우대', '전세보증금 80% 이내'],
  url: 'https://www.ibk.co.kr' },

// SC제일은행
{ id: 'sc-001', category: 'bank', name: 'SC제일 전세자금대출', provider: 'SC제일은행',
  interestRate: 3.80, interestRateMin: 3.80, interestRateMax: 5.60, interestRateType: 'variable',
  maxAmount: 500000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity', 'equal-principal', 'equal-payment'],
  targetGroups: ['general'],
  description: 'SC제일은행 일반 전세자금대출',
  conditions: ['무주택 세대주', '전세보증금 80% 이내'],
  url: 'https://www.standardchartered.co.kr' },

// 카카오뱅크
{ id: 'kakao-001', category: 'bank', name: '카카오뱅크 전세자금대출', provider: '카카오뱅크',
  interestRate: 3.45, interestRateMin: 3.45, interestRateMax: 5.10, interestRateType: 'variable',
  maxAmount: 500000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity'],
  targetGroups: ['general'],
  description: '100% 비대면, 카카오앱으로 간편 신청',
  conditions: ['무주택 세대주', '전세보증금 80% 이내', '주택가격 9억 이하'],
  url: 'https://www.kakaobank.com' },

{ id: 'kakao-002', category: 'bank', name: '카카오뱅크 청년 전세자금대출', provider: '카카오뱅크',
  interestRate: 3.20, interestRateMin: 3.20, interestRateMax: 4.60, interestRateType: 'variable',
  maxAmount: 300000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity'],
  targetGroups: ['youth'],
  description: '청년 전용, 100% 비대면 카카오앱 신청',
  conditions: ['만 19~34세', '무주택', '연소득 5천만원 이하'],
  url: 'https://www.kakaobank.com' },

// 케이뱅크
{ id: 'kbank-001', category: 'bank', name: '케이뱅크 전세자금대출', provider: '케이뱅크',
  interestRate: 3.50, interestRateMin: 3.50, interestRateMax: 5.20, interestRateType: 'variable',
  maxAmount: 500000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity'],
  targetGroups: ['general'],
  description: '케이뱅크 비대면 전세자금대출',
  conditions: ['무주택 세대주', '전세보증금 80% 이내'],
  url: 'https://www.kbanknow.com' },

// 토스뱅크
{ id: 'toss-001', category: 'bank', name: '토스뱅크 전세자금대출', provider: '토스뱅크',
  interestRate: 3.50, interestRateMin: 3.50, interestRateMax: 5.20, interestRateType: 'variable',
  maxAmount: 300000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity'],
  targetGroups: ['general', 'youth'],
  description: '토스앱 100% 비대면, 한도 최대 3억',
  conditions: ['무주택 세대주', '전세보증금 80% 이내'],
  url: 'https://www.tossbank.com' },

// BNK부산은행
{ id: 'bnk-001', category: 'bank', name: 'BNK 전세자금대출', provider: 'BNK부산은행',
  interestRate: 3.70, interestRateMin: 3.70, interestRateMax: 5.50, interestRateType: 'variable',
  maxAmount: 500000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity', 'equal-principal', 'equal-payment'],
  targetGroups: ['general'],
  description: '부산·경남 지역 우대 혜택',
  conditions: ['무주택 세대주', '전세보증금 80% 이내'],
  url: 'https://www.busanbank.co.kr' },

// DGB대구은행
{ id: 'dgb-001', category: 'bank', name: 'DGB 전세자금대출', provider: 'DGB대구은행',
  interestRate: 3.70, interestRateMin: 3.70, interestRateMax: 5.50, interestRateType: 'variable',
  maxAmount: 500000000, minPeriod: 12, maxPeriod: 24,
  repaymentMethods: ['maturity', 'equal-principal', 'equal-payment'],
  targetGroups: ['general'],
  description: '대구·경북 지역 우대 혜택',
  conditions: ['무주택 세대주', '전세보증금 80% 이내'],
  url: 'https://www.dgb.co.kr' },
```

#### 정부기금 상품 6개 (category: 'government')

```typescript
{ id: 'gov-001', category: 'government', name: '버팀목전세자금 (일반)', provider: '주택도시기금',
  interestRate: 2.30, interestRateMin: 2.30, interestRateMax: 2.90, interestRateType: 'fixed',
  maxAmount: 120000000, minPeriod: 24, maxPeriod: 48,
  repaymentMethods: ['maturity'],
  targetGroups: ['general'],
  description: '무주택 서민 주거안정을 위한 저금리 정책 전세자금',
  conditions: ['무주택 세대주', '연소득 5천만원 이하 (부부합산)', '순자산 3.45억 이하', '전용면적 85㎡ 이하', '수도권 전세금 3억 이하'],
  url: 'https://nhuf.molit.go.kr' },

{ id: 'gov-002', category: 'government', name: '청년전용 버팀목전세자금', provider: '주택도시기금',
  interestRate: 1.80, interestRateMin: 1.80, interestRateMax: 2.70, interestRateType: 'fixed',
  maxAmount: 200000000, minPeriod: 24, maxPeriod: 48,
  repaymentMethods: ['maturity'],
  targetGroups: ['youth'],
  description: '청년 우대금리 최저 1.8%, 수도권 최대 2억',
  conditions: ['만 19~34세 무주택 단독세대주', '연소득 5천만원 이하', '순자산 3.45억 이하', '전용면적 85㎡ 이하'],
  url: 'https://nhuf.molit.go.kr' },

{ id: 'gov-003', category: 'government', name: '신혼부부전용 전세자금', provider: '주택도시기금',
  interestRate: 1.20, interestRateMin: 1.20, interestRateMax: 2.70, interestRateType: 'fixed',
  maxAmount: 300000000, minPeriod: 24, maxPeriod: 48,
  repaymentMethods: ['maturity'],
  targetGroups: ['newlywed'],
  description: '신혼부부 소득에 따라 1.2~2.7%, 최대 3억',
  conditions: ['혼인 7년 이내 또는 3개월 내 결혼 예정', '무주택 세대주', '연소득 7천5백만원 이하 (부부합산)', '순자산 3.45억 이하'],
  url: 'https://nhuf.molit.go.kr' },

{ id: 'gov-004', category: 'government', name: '다자녀가구 전세자금', provider: '주택도시기금',
  interestRate: 1.00, interestRateMin: 1.00, interestRateMax: 2.70, interestRateType: 'fixed',
  maxAmount: 300000000, minPeriod: 24, maxPeriod: 48,
  repaymentMethods: ['maturity'],
  targetGroups: ['multi-child'],
  description: '자녀 수에 따라 최저 1.0%, 2자녀 이상 가구',
  conditions: ['2자녀 이상 가구', '무주택 세대주', '연소득 6천만원 이하 (부부합산)', '순자산 3.45억 이하'],
  url: 'https://nhuf.molit.go.kr' },

{ id: 'gov-005', category: 'government', name: '주거안정월세대출 (청년)', provider: '주택도시기금',
  interestRate: 1.50, interestRateMin: 1.50, interestRateMax: 2.50, interestRateType: 'fixed',
  maxAmount: 9600000, minPeriod: 24, maxPeriod: 24,
  repaymentMethods: ['equal-payment'],
  targetGroups: ['youth'],
  description: '월 최대 40만원×24개월, 취업준비생·사회초년생 대상',
  conditions: ['만 19~34세', '무주택 단독세대주', '연소득 2천만원 이하', '월세 60만원 이하'],
  url: 'https://nhuf.molit.go.kr' },

{ id: 'gov-006', category: 'government', name: '주거안정월세대출 (일반)', provider: '주택도시기금',
  interestRate: 2.00, interestRateMin: 2.00, interestRateMax: 3.00, interestRateType: 'fixed',
  maxAmount: 9600000, minPeriod: 24, maxPeriod: 24,
  repaymentMethods: ['equal-payment'],
  targetGroups: ['general'],
  description: '무주택 세대주 월세 지원, 월 최대 40만원',
  conditions: ['무주택 세대주', '연소득 5천만원 이하', '순자산 3.45억 이하', '월세 60만원 이하'],
  url: 'https://nhuf.molit.go.kr' },
```

#### 공공임대 상품 6개 (category: 'public')

```typescript
{ id: 'lh-001', category: 'public', name: 'LH 청년 전세임대', provider: 'LH한국토지주택공사',
  interestRate: 1.00, interestRateMin: 1.00, interestRateMax: 2.00, interestRateType: 'fixed',
  maxAmount: 120000000, minPeriod: 24, maxPeriod: 72,
  repaymentMethods: ['maturity'],
  targetGroups: ['youth'],
  description: 'LH가 전세계약 후 청년에 재임대, 수도권 최대 1.2억',
  conditions: ['만 19~39세 무주택 청년', '대학생·취업준비생·사회초년생', '연소득 5천만원 이하'],
  url: 'https://www.lh.or.kr' },

{ id: 'lh-002', category: 'public', name: 'LH 신혼부부 전세임대 I', provider: 'LH한국토지주택공사',
  interestRate: 1.00, interestRateMin: 1.00, interestRateMax: 2.00, interestRateType: 'fixed',
  maxAmount: 240000000, minPeriod: 24, maxPeriod: 72,
  repaymentMethods: ['maturity'],
  targetGroups: ['newlywed'],
  description: '저소득 신혼부부 우선 지원, 최대 2.4억',
  conditions: ['혼인 7년 이내 또는 예비신혼부부', '무주택 세대구성원', '도시근로자 월평균소득 70% 이하'],
  url: 'https://www.lh.or.kr' },

{ id: 'lh-003', category: 'public', name: 'LH 신혼부부 전세임대 II', provider: 'LH한국토지주택공사',
  interestRate: 1.00, interestRateMin: 1.00, interestRateMax: 2.00, interestRateType: 'fixed',
  maxAmount: 240000000, minPeriod: 24, maxPeriod: 72,
  repaymentMethods: ['maturity'],
  targetGroups: ['newlywed'],
  description: '소득 기준 완화 신혼부부 II유형, 최대 2.4억',
  conditions: ['혼인 7년 이내 또는 예비신혼부부', '무주택 세대구성원', '도시근로자 월평균소득 100% 이하'],
  url: 'https://www.lh.or.kr' },

{ id: 'lh-004', category: 'public', name: 'LH 고령자 전세임대', provider: 'LH한국토지주택공사',
  interestRate: 1.00, interestRateMin: 1.00, interestRateMax: 2.00, interestRateType: 'fixed',
  maxAmount: 100000000, minPeriod: 24, maxPeriod: 72,
  repaymentMethods: ['maturity'],
  targetGroups: ['senior'],
  description: '만 65세 이상 주거약자 우선 지원',
  conditions: ['만 65세 이상', '무주택 세대구성원', '도시근로자 월평균소득 50% 이하'],
  url: 'https://www.lh.or.kr' },

{ id: 'sh-001', category: 'public', name: 'SH 청년 전세임대', provider: 'SH서울주택도시공사',
  interestRate: 1.00, interestRateMin: 1.00, interestRateMax: 2.00, interestRateType: 'fixed',
  maxAmount: 150000000, minPeriod: 24, maxPeriod: 72,
  repaymentMethods: ['maturity'],
  targetGroups: ['youth'],
  description: '서울 청년 전세임대, 서울 시세 반영 최대 1.5억',
  conditions: ['서울 거주 또는 서울 소재 대학 재학·취업 청년', '만 19~39세 무주택', '연소득 5천만원 이하'],
  url: 'https://www.i-sh.co.kr' },

{ id: 'sh-002', category: 'public', name: 'SH 신혼부부 전세임대', provider: 'SH서울주택도시공사',
  interestRate: 1.00, interestRateMin: 1.00, interestRateMax: 2.00, interestRateType: 'fixed',
  maxAmount: 270000000, minPeriod: 24, maxPeriod: 72,
  repaymentMethods: ['maturity'],
  targetGroups: ['newlywed'],
  description: '서울 신혼부부 전세임대, 최대 2.7억',
  conditions: ['서울 거주 신혼부부 (혼인 7년 이내)', '무주택 세대구성원', '도시근로자 월평균소득 100% 이하'],
  url: 'https://www.i-sh.co.kr' },
```

---

### STEP 3 — Zustand 스토어 확장 (`shared/config/store.ts`)

```typescript
// 기존 AppState에 추가
loanSortKey: 'rateAsc' | 'rateDesc' | 'amountDesc' | 'amountAsc' | 'providerAsc'
setLoanSortKey: (key: ...) => void

loanSearchQuery: string
setLoanSearchQuery: (q: string) => void

loanTargetFilter: TargetGroup | 'all'
setLoanTargetFilter: (g: TargetGroup | 'all') => void

compareProducts: LoanProduct[]  // 최대 3개
addCompareProduct: (p: LoanProduct) => void
removeCompareProduct: (id: string) => void
clearCompareProducts: () => void
```

초기값:
```
loanSortKey: 'rateAsc'
loanSearchQuery: ''
loanTargetFilter: 'all'
compareProducts: []
```

---

### STEP 4 — 대출 계산기 UI 전면 개선 (`widgets/calculator-view/ui/loan-calculator.tsx`)

**4-1. 탭 변경**

```typescript
// 기존
type LoanCategory = 'bank' | 'housing' | 'government'
// 탭: [은행] [주택공사] [정부]

// 변경
const TABS = [
  { value: 'all',        label: '전체' },
  { value: 'bank',       label: '은행' },
  { value: 'government', label: '정부기금' },
  { value: 'public',     label: '공공임대' },  // housing + public 통합
] as const
```

**4-2. 검색+정렬+필터 바** (탭 아래 삽입)

```tsx
<div className="px-4 py-3 space-y-2 border-b">
  {/* 검색 + 정렬 */}
  <div className="flex gap-2">
    <div className="relative flex-1">
      <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="은행명 검색..."
        className="pl-8"
        value={loanSearchQuery}
        onChange={(e) => setLoanSearchQuery(e.target.value)}
      />
    </div>
    <Select value={loanSortKey} onValueChange={setLoanSortKey}>
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="rateAsc">금리 낮은 순</SelectItem>
        <SelectItem value="rateDesc">금리 높은 순</SelectItem>
        <SelectItem value="amountDesc">한도 큰 순</SelectItem>
        <SelectItem value="amountAsc">한도 작은 순</SelectItem>
        <SelectItem value="providerAsc">기관명 순</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* 대상 그룹 필터 */}
  <div className="flex gap-1.5 flex-wrap">
    {(['all','general','youth','newlywed','multi-child','senior'] as const).map((g) => (
      <button
        key={g}
        onClick={() => setLoanTargetFilter(g)}
        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
          loanTargetFilter === g
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
      >
        {TARGET_GROUP_LABELS[g]}
      </button>
    ))}
  </div>
</div>
```

TARGET_GROUP_LABELS:
```typescript
const TARGET_GROUP_LABELS = {
  all: '전체', general: '일반', youth: '청년',
  newlywed: '신혼부부', 'multi-child': '다자녀', senior: '고령자',
}
```

**4-3. 필터링 + 정렬 로직**

```typescript
const filteredAndSortedProducts = useMemo(() => {
  let list = loanProducts.filter(p => {
    // 탭 필터
    if (selectedTab === 'public') {
      if (p.category !== 'housing' && p.category !== 'public') return false;
    } else if (selectedTab !== 'all') {
      if (p.category !== selectedTab) return false;
    }
    // 검색
    if (loanSearchQuery) {
      const q = loanSearchQuery.toLowerCase();
      if (!p.provider.toLowerCase().includes(q) && !p.name.toLowerCase().includes(q)) return false;
    }
    // 대상 그룹 필터
    if (loanTargetFilter !== 'all') {
      if (!p.targetGroups.includes(loanTargetFilter)) return false;
    }
    return true;
  });

  // 정렬
  list = [...list].sort((a, b) => {
    switch (loanSortKey) {
      case 'rateAsc':    return a.interestRateMin - b.interestRateMin;
      case 'rateDesc':   return b.interestRateMin - a.interestRateMin;
      case 'amountDesc': return b.maxAmount - a.maxAmount;
      case 'amountAsc':  return a.maxAmount - b.maxAmount;
      case 'providerAsc':return a.provider.localeCompare(b.provider, 'ko');
      default: return 0;
    }
  });

  return list;
}, [loanProducts, selectedTab, loanSearchQuery, loanTargetFilter, loanSortKey]);
```

**4-4. 상품 카드 개선**

상품 카드에 다음 요소 추가:
- **금리 유형 배지**: `[변동]` blue / `[고정]` green / `[혼합]` purple
- **대상 그룹 배지**: `[청년]` orange / `[신혼부부]` pink / `[다자녀]` teal / `[고령자]` gray
- **금리 범위 표시**: `3.45% ~ 5.10%` (기존 단일 금리 대신)
- **비교 추가 체크박스**: 카드 우상단 체크박스 (`☐ 비교`) → 최대 3개까지

배지 헬퍼:
```typescript
const RATE_TYPE_BADGE = {
  variable: { label: '변동', class: 'bg-blue-100 text-blue-700' },
  fixed:    { label: '고정', class: 'bg-green-100 text-green-700' },
  mixed:    { label: '혼합', class: 'bg-purple-100 text-purple-700' },
}

const TARGET_BADGE = {
  youth:        { label: '청년',    class: 'bg-orange-100 text-orange-700' },
  newlywed:     { label: '신혼부부', class: 'bg-pink-100 text-pink-700' },
  'multi-child':{ label: '다자녀',  class: 'bg-teal-100 text-teal-700' },
  senior:       { label: '고령자',  class: 'bg-gray-100 text-gray-700' },
}
```

---

### STEP 5 — 상품 비교 모달 (`widgets/calculator-view/ui/compare-modal.tsx`)

**플로팅 바** (최하단, 비교 상품 1개 이상 선택 시 표시):
```tsx
{compareProducts.length > 0 && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
    <div className="bg-primary text-primary-foreground rounded-full px-6 py-3 shadow-xl flex items-center gap-4">
      <span>{compareProducts.length}개 상품 선택됨</span>
      <Button size="sm" variant="secondary" onClick={() => setCompareOpen(true)}>
        비교하기
      </Button>
      <button onClick={clearCompareProducts}>✕</button>
    </div>
  </div>
)}
```

**비교 모달** (Dialog):
- 선택된 상품들을 나란히 테이블로 표시
- 비교 항목: 최저금리, 최고금리, 금리유형, 최대한도, 대출기간, 대상, 월예상납입(매물 전세가 기준), 총이자
- 각 셀에서 최저값 하이라이트 (배경색)

---

### STEP 6 — 추천 상품 배너 (`widgets/calculator-view/ui/loan-calculator.tsx`)

매물이 선택된 상태로 계산기 진입 시, 적합한 정부·공공 상품이 있으면 상단 배너 표시:

```typescript
const recommendedProducts = filteredAndSortedProducts.filter(
  p => (p.category === 'government' || p.category === 'public')
    && p.maxAmount >= (selectedUnit?.jeonsePrice ?? 0) * 0.5
).slice(0, 2);
```

배너 UI:
```tsx
{recommendedProducts.length > 0 && (
  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
    <p className="text-sm font-medium text-amber-800 mb-1.5">
      💡 이 매물에 적합한 저금리 상품
    </p>
    <div className="flex flex-wrap gap-2">
      {recommendedProducts.map(p => (
        <button key={p.id} onClick={() => handleProductSelect(p)}
          className="text-xs px-2.5 py-1 bg-white border border-amber-300 rounded-full hover:bg-amber-50">
          {p.name} ({p.interestRateMin}%)
        </button>
      ))}
    </div>
  </div>
)}
```

---

### STEP 7 — 검색 결과 없음 처리

필터 결과가 0개일 때:
```tsx
{filteredAndSortedProducts.length === 0 && (
  <div className="p-8 text-center text-muted-foreground">
    <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
    <p>검색 결과가 없습니다</p>
    <button onClick={() => { setLoanSearchQuery(''); setLoanTargetFilter('all'); }}
      className="mt-2 text-primary text-sm underline">
      필터 초기화
    </button>
  </div>
)}
```

---

## 완료 기준

- [ ] TypeScript 빌드 에러 없음 (`npm run build`)
- [ ] 36개 상품 전체 표시 확인
- [ ] 탭 4개 (전체/은행/정부기금/공공임대) 정상 동작
- [ ] 은행명 검색 필터링 정상 동작
- [ ] 금리 낮은 순 정렬 기본 적용
- [ ] 대상 그룹 배지 표시
- [ ] 금리 유형 배지 표시
- [ ] 비교 모달 최대 3개 선택
- [ ] 추천 배너 표시 (매물 선택 시)

## 결과 보고서

완료 후 `docs/04-loan-expansion/work-report-loan-WO002.md` 작성.
