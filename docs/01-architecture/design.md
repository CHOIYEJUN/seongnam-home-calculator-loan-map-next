# 성남시 전세정보 — 프로젝트 설계 문서

> 대상: 개발자 에이전트 (frontend-dev, data-engineer, ml-engineer, qa-engineer)  
> 마지막 업데이트: 2026-06-02  
> 작성: planner

---

## 1. 서비스 개요

**성남시 전세정보 지도 + 대출 계산기**

성남시(분당구·수정구·중원구) 아파트·오피스텔 전세 매물을 카카오맵 위에 시각화하고,
전세 대출 한도·상환액 계산 및 XGBoost 기반 AI 전세가 예측을 제공하는 웹 서비스.

### 핵심 기능

| 기능 | 설명 | 상태 |
|------|------|------|
| 지도 기반 매물 탐색 | 카카오맵 위 200+ 매물 마커 시각화 | ✅ 구현됨 |
| 매물 검색 + 필터 | 이름/주소 검색, 유형·가격 필터 | ✅ 구현됨 |
| 매물 상세 정보 | 평형별 공시지가·시세·전세가 조회 | ✅ 구현됨 |
| AI 전세가 예측 | XGBoost 모델 기반 예측가 표시 | ✅ 구현됨 |
| 대출 계산기 | 12개 상품 기반 상환액 계산 | ✅ 구현됨 |
| 데이터 파이프라인 | 엑셀 → JSON 자동 변환 | 🔧 설계 필요 |

---

## 2. 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | Next.js 15 (App Router) |
| UI | React 19 + shadcn/ui (new-york) + Tailwind CSS v4 |
| 상태 관리 | Zustand 5.0 |
| 폼 | React Hook Form 7 + Zod 4 |
| 지도 | 카카오맵 JavaScript API |
| 아이콘 | Lucide React |
| 차트 | Recharts 3 (설치됨, 미사용) |
| 언어 | TypeScript 5 (strict mode) |
| ML 백엔드 | FastAPI + XGBoost (jeonse-ai-project/) |

---

## 3. 아키텍처: Feature-Sliced Design (FSD)

### 레이어 구조 및 의존 방향

```
app
 └── widgets
      └── features
           └── entities
                └── shared
                     └── components/ui (shadcn 프리미티브)
```

> 규칙: 상위 레이어 → 하위 레이어만 import 허용. 역방향 금지. 같은 레이어 내 슬라이스 간 직접 import 금지.

### 디렉토리 맵

```
seongnam-home-calculator-loan-map-next/
│
├── app/                              # Next.js App Router
│   ├── layout.tsx                   # RootLayout (Geist 폰트, ko lang)
│   ├── page.tsx                     # HomePage — 뷰 전환 컨테이너
│   ├── globals.css                  # Tailwind + CSS 변수 (디자인 토큰)
│   └── api/
│       └── jeonse-predict/route.ts  # POST /api/jeonse-predict (ML 프록시)
│
├── shared/
│   ├── config/store.ts              # Zustand AppState
│   ├── lib/
│   │   ├── format.ts                # formatCurrency()
│   │   ├── kakao-map.ts             # loadKakaoMapScript()
│   │   ├── kakao-geocoding.ts       # searchPropertyCoordinates()
│   │   ├── jeonse-predict.ts        # predictJeonsePrice() → API 호출
│   │   ├── loan-calculator.ts       # calculateLoanEstimate() — LTV 계산
│   │   └── loan-repayment-calculator.ts  # calculateLoanRepayment()
│   ├── types/
│   │   ├── property.ts              # Property, PropertyUnit, LoanEstimate(미사용)
│   │   └── loan.ts                  # LoanProduct, LoanCalculation, LoanScheduleItem
│   └── ui/
│       └── image-with-fallback.tsx
│
├── entities/
│   ├── property/model/
│   │   ├── properties.json          # 매물 마스터 데이터 (200+건)
│   │   ├── prices.json              # 유닛별 가격 데이터
│   │   ├── properties.ts            # loadProperties() — JSON 로더 + 캐시
│   │   └── mock-properties.ts       # ⚠️ 미사용 (삭제 예정)
│   └── loan/model/
│       └── loan-products.ts         # 12개 대출 상품 정의
│
├── features/
│   ├── search/ui/search-panel.tsx   # 검색 + 필터 패널 (지도 위 좌상단)
│   ├── property-selection/ui/       # 매물 상세 패널 (지도 위 우상단)
│   │   └── property-panel.tsx
│   └── loan-calculation/            # ⚠️ 빈 디렉토리 (구현 예정)
│
├── widgets/
│   ├── header/ui/header.tsx         # GNB + 뷰 전환 LNB
│   ├── map-view/ui/
│   │   ├── map-view.tsx             # 검색·필터 상태 조합 + KakaoMap 전달
│   │   └── kakao-map.tsx            # 카카오맵 SDK 초기화 + 마커
│   └── calculator-view/ui/
│       └── loan-calculator.tsx      # 대출 상품 선택 + 계산 결과 전체
│
├── components/ui/                   # shadcn/ui 프리미티브 (직접 수정 금지)
│   └── [badge, button, card, checkbox, input, label,
│       radio-group, scroll-area, select, separator, tabs]
│
├── scripts/
│   └── update-coordinates.ts        # 좌표 없는 매물 geocoding 업데이트
│
├── rowData/                         # 원본 엑셀 데이터 (국토부 실거래가)
│   └── (엑셀 파일 위치)
│
└── docs/                            # 프로젝트 문서
    ├── 01-architecture/design.md    # 이 파일
    ├── 02-tasks/work-orders.md      # 작업지시서
    └── 03-data-pipeline/data-update-design.md
```

---

## 4. 상태 관리 (Zustand AppState)

**파일**: `shared/config/store.ts`

```typescript
interface AppState {
  // 뷰 상태
  currentView: 'map' | 'calculator'
  setCurrentView: (view) => void

  // 검색
  searchQuery: string
  setSearchQuery: (query) => void

  // 필터
  propertyTypeFilter: ('apartment' | 'officetel')[]
  setPropertyTypeFilter: (types) => void
  priceRange: [number, number]       // 단위: 원
  setPriceRange: (range) => void

  // 선택된 매물
  selectedProperty: Property | null
  setSelectedProperty: (property) => void  // 자동으로 units[0] 선택
  selectedUnit: PropertyUnit | null
  setSelectedUnit: (unit) => void
}
```

**데이터 흐름**:
```
사용자 클릭 → KakaoMap → setSelectedProperty()
                              ↓
                    Zustand store 업데이트
                              ↓
              PropertyPanel useEffect 감지 → AI 예측 호출
                              ↓
              LoanCalculator → 선택된 unit.jeonsePrice 기준
```

---

## 5. 핵심 도메인 타입

### Property (매물)

```typescript
interface Property {
  id: string
  name: string
  address: string
  type: 'apartment' | 'officetel'
  lat: number
  lng: number
  floor?: number       // 건물 총 층수 (⚠️ 유닛 층수 아님)
  buildYear?: number   // 준공년도
  units: PropertyUnit[]
}
```

### PropertyUnit (평형별 매물)

```typescript
interface PropertyUnit {
  id: string
  propertyId: string
  area: number          // 전용면적 (평)
  officialPrice: number // 공시지가 (원)
  marketPrice: number   // 시세 (원)
  jeonsePrice: number   // 전세가 (원)
  monthlyRent?: number  // 월세 (원, 옵션)
}
```

> TODO: `floor` 필드를 PropertyUnit에 추가해야 AI 예측 정확도 향상 가능  
> 현재 property-panel.tsx:33에서 건물 총 층수를 유닛 층수로 오용 중

### LoanProduct (대출 상품)

```typescript
interface LoanProduct {
  id: string
  category: 'bank' | 'housing' | 'government'
  name: string
  provider: string
  interestRate: number          // 연 금리 (%)
  maxAmount: number             // 최대 대출액 (원)
  minPeriod: number             // 최소 기간 (개월)
  maxPeriod: number             // 최대 기간 (개월)
  repaymentMethods: RepaymentMethod[]
  description: string
  conditions: string[]
}
```

### LoanCalculation (계산 결과)

```typescript
interface LoanCalculation {
  loanAmount: number
  interestRate: number
  loanPeriod: number
  repaymentMethod: 'maturity' | 'equal-principal' | 'equal-payment'
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  schedule?: LoanScheduleItem[]
}
```

---

## 6. API 명세

### POST /api/jeonse-predict

ML 백엔드(FastAPI)로 전세가 예측 요청을 프록시.

**Request**:
```json
{
  "salePrice": 50000,   // 만원 단위
  "area": 25,           // 평
  "floor": 5,           // 층수
  "buildYear": 2015,    // 준공년도
  "saleYear": 2026      // 거래년도
}
```

**Response**:
```json
{
  "predicted_jeonse_price": 0.72   // 시세 대비 전세 비율 (0~1)
}
```

**실제 전세 예측가 계산** (jeonse-predict.ts):
```
예측 전세가(원) = marketPrice(원) × predicted_jeonse_price
```

**환경 변수**:
- `JEONSE_PREDICT_API`: ML 백엔드 URL 

---

## 7. 디자인 시스템

### 색상 토큰 (globals.css)

> 현재 문제: `--primary`가 near-black(neutral)으로 정의되어 있으나
> 컴포넌트에서 하드코딩된 `blue-*` 클래스가 사용됨. 통일 필요.

```css
/* 라이트 모드 주요 토큰 */
--primary: oklch(0.205 0 0)          /* near-black — 수정 필요 */
--primary-foreground: oklch(0.985 0 0)
--secondary: oklch(0.97 0 0)
--muted: oklch(0.97 0 0)
--muted-foreground: oklch(0.556 0 0)
--accent: oklch(0.97 0 0)
--border: oklch(0.922 0 0)
--destructive: oklch(0.577 0.245 27.325)
--radius: 0.625rem
```

### 컴포넌트 사용 기준

| 컴포넌트 | 사용 위치 | 주의사항 |
|----------|-----------|----------|
| `Button` | 주요 액션, CTA | variant: default/outline/ghost |
| `Card` | 정보 그룹핑 | 직접 `className` 추가 가능 |
| `Badge` | 유형 태그 (아파트/오피스텔) | variant: default/secondary |
| `Tabs` | 대출 카테고리 전환 | TabsContent value는 현재 탭값과 일치 필요 |
| `ScrollArea` | 긴 목록 (대출 상품 리스트) | 고정 높이 필요 |
| `Select` | 대출 기간 선택 | |
| `RadioGroup` | 상환 방법 선택 | |
| `Input` | 대출 금액 입력 | min/max 검증 필요 |

### 타이포그래피 규칙

```
h2: text-2xl font-bold
h3: text-lg font-semibold
h4: text-base font-medium
본문: text-sm (muted 설명), text-base (일반)
가격: text-2xl ~ text-4xl font-bold
```

> 현재 h2/h3/h4 태그에 Tailwind 클래스가 없어 브라우저 기본값 사용 중. 수정 필요.

---

## 8. 데이터 파일 구조

### properties.json (매물 마스터)

```json
[
  {
    "id": "P001",
    "name": "분당 파크뷰 아파트",
    "address": "경기도 성남시 분당구 ...",
    "type": "apartment",
    "lat": 37.3845,
    "lng": 127.1234,
    "floor": 25,
    "buildYear": 2010,
    "units": ["U001", "U002"]
  }
]
```

### prices.json (유닛별 가격)

```json
[
  {
    "id": "U001",
    "propertyId": "P001",
    "area": 25,
    "officialPrice": 180000000,
    "marketPrice": 450000000,
    "jeonsePrice": 320000000,
    "lastTransactionDate": "2024-01"
  }
]
```

---

## 9. 환경 변수

```env
# .env.local (git ignore 대상)
NEXT_PUBLIC_KAKAO_MAP_API_KEY=   # 클라이언트 지도 렌더링 (JavaScript 키)
KAKAO_REST_API_KEY=               # 서버 전용 주소 → 좌표 변환 (REST 키)
JEONSE_PREDICT_API=http://localhost:8000   # ML 백엔드 URL (선택, 기본값 있음)
```

---

## 10. 주요 스크립트

```bash
# 개발
npm run dev                    # 개발 서버 (localhost:3000)
npm run build                  # 프로덕션 빌드
npm run lint                   # ESLint

# 데이터
npm run update-coordinates     # 좌표 없는 매물 geocoding 업데이트
                                # 필요: KAKAO_REST_API_KEY 환경 변수

# ML 백엔드 (jeonse-ai-project/)
python api/app.py              # FastAPI 서버 실행 (:8000)
python preprocessing/build_dataset.py
python training/train_xgboost.py
```

---

## 11. 에이전트 협업 가이드

각 에이전트가 주로 담당하는 영역:

| 에이전트 | 담당 레이어 | 주요 파일 |
|----------|------------|-----------|
| `frontend-dev` | widgets, features, shared/ui | kakao-map.tsx, property-panel.tsx, loan-calculator.tsx |
| `data-engineer` | entities/property, scripts, rowData | properties.json, prices.json, update-coordinates.ts |
| `ml-engineer` | jeonse-ai-project/, app/api/jeonse-predict | app.py, train_xgboost.py |
| `qa-engineer` | 전체 레이어 | 테스트 케이스, 버그 검증 |
| `planner` | docs/, CLAUDE.md | 요구사항, 설계, 작업 지시 |

---

## 12. 알려진 기술 부채

| ID | 위치 | 내용 | 심각도 |
|----|------|------|--------|
| TD-01 | kakao-map.tsx:111 | selectedProperty 변경 시 지도 전체 재초기화 | 높음 |
| TD-02 | property-panel.tsx:33 | 건물 총 층수를 유닛 층수로 오용 | 높음 |
| TD-03 | loan-calculator.tsx:347 | CTA 버튼 onClick 핸들러 없음 | 높음 |
| TD-04 | app/page.tsx:1 | 루트 페이지 `'use client'` — SSR 손실 | 중간 |
| TD-05 | globals.css:57 | primary 색상이 중간어두운회색 (blue 하드코딩과 불일치) | 중간 |
| TD-06 | shared/types/property.ts:25 | LoanEstimate 타입 위치 오류 + 미사용 | 낮음 |
| TD-07 | entities/property/model/ | mock-properties.ts 미사용 데드코드 | 낮음 |
| TD-08 | package.json | recharts 설치됨 + 미사용 | 낮음 |
