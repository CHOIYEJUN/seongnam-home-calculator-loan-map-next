# 작업 결과보고서 — frontend-dev WO001

> 작업 날짜: 2026-06-02  
> 에이전트: frontend-dev  
> 작업지시서: `docs/02-tasks/work-orders-20260602-001.md`

---

## 완료 체크리스트

- [x] WO-01: 매물 선택 시 지도 전체 재초기화 버그 수정
- [x] WO-02: AI 예측에 잘못된 floor 값 전달 수정
- [x] WO-03: CTA 버튼 핸들러 없음 수정
- [x] WO-04: 루트 페이지 'use client' 제거
- [x] WO-05: Primary 색상 통일
- [x] WO-06: LoanEstimate 타입 정리
- [x] WO-07: Kakao SDK 로딩 방식 개선
- [x] WO-08: Heading 타이포그래피 통일
- [x] WO-09: 미사용 mock-properties.ts 삭제
- [x] WO-10: 대출금액 입력 최솟값 검증
- [x] WO-11: recharts 활용 — 상환 스케줄 Bar Chart 구현
- [x] WO-12: .env.example 파일 추가

---

## 수정된 파일 목록

| 파일 | 수정 내용 |
|------|-----------|
| `widgets/map-view/ui/kakao-map.tsx` | WO-01: useEffect 2개로 분리 (지도초기화 / 카메라이동). WO-07: setInterval 폴링 → `kakao-map-ready` 이벤트 방식. `mapInstanceRef`, `markersRef` useRef 추가 |
| `features/property-selection/ui/property-panel.tsx` | WO-02: `selectedUnit.floor ?? Math.round((selectedProperty.floor ?? 10) / 2)` 적용. WO-08: h3, h4 타이포그래피 클래스 추가 |
| `widgets/calculator-view/ui/loan-calculator.tsx` | WO-03: `handleReset` 구현 + "다른 조건으로 계산" onClick. "대출 상담 신청" disabled + 호버 툴팁 "서비스 준비 중". WO-05: `bg-blue-*`/`text-blue-*` 하드코딩 → `primary` 토큰 치환. WO-08: h2/h3/h4 타이포그래피 클래스. WO-10: Input에 `min={0}`, `max={selectedProduct.maxAmount}`, 음수 방어 로직. WO-11: recharts `BarChart` 월별 원금/이자 stacked bar 추가 |
| `app/page.tsx` | WO-04: `'use client'` 제거, `<ClientLayout />` 렌더링만 하는 서버 컴포넌트로 변경 |
| `widgets/client-layout/ui/client-layout.tsx` | WO-04: 신규 생성. Kakao 스크립트 로딩 + 뷰 전환 로직을 담는 클라이언트 컴포넌트 |
| `app/globals.css` | WO-05: `--primary` → `oklch(0.546 0.196 258.316)` (blue-600). dark mode primary → `oklch(0.707 0.165 258.316)` (blue-400) |
| `shared/types/property.ts` | WO-02: `PropertyUnit`에 `floor?: number` 필드 추가. WO-06: `LoanEstimate` 인터페이스 삭제 |
| `app/layout.tsx` | WO-07: Next.js `<Script strategy="afterInteractive">` 로 카카오맵 SDK 로드, onLoad에서 `kakao-map-ready` 이벤트 dispatch |
| `widgets/header/ui/header.tsx` | WO-08: h1에 `text-2xl font-bold` 클래스 추가 |
| `shared/lib/loan-calculator.ts` | WO-06: `LoanEstimate` import 제거, 내부 `LegacyLoanEstimate` 인터페이스로 대체 (파일은 미사용 상태) |
| `.env.example` | WO-12: 신규 생성. `NEXT_PUBLIC_KAKAO_MAP_API_KEY`, `KAKAO_REST_API_KEY`, `JEONSE_PREDICT_API` 환경 변수 예시 |
| ~~`entities/property/model/mock-properties.ts`~~ | WO-09: 삭제 (source 내 import 없음 확인 후 제거) |

---

## 특이사항

### WO-03 — 대출 상담 신청 버튼
작업지시서의 (a)안(disabled + 툴팁)을 채택했습니다. 외부 은행 URL이 없으므로 현재 기능 구현 불가. 버튼 위 호버 시 "서비스 준비 중" 툴팁이 표시됩니다.

### WO-06 — LoanEstimate & shared/lib/loan-calculator.ts
`LoanEstimate`는 `shared/lib/loan-calculator.ts`에서만 사용되고 있었으나, `calculateLoanEstimate` 함수 자체가 어떤 소스 파일에서도 import되지 않는 dead code였습니다. `LoanEstimate`를 property.ts에서 삭제하고, loan-calculator.ts는 내부 타입으로 대체하여 타입 에러 없이 처리했습니다.

### WO-11 — recharts Bar Chart
`LoanCalculation.schedule`의 데이터가 월 단위 원금/이자 정보를 포함하므로 stacked bar chart를 구현했습니다. Y축 단위는 만원으로 표시합니다. `schedule`이 없거나 빈 경우 차트 섹션 자체가 렌더링되지 않도록 조건부 처리했습니다.

---

## 후속 작업 권고사항

1. **WO-02 중기 작업**: `prices.json` 데이터에 유닛별 `floor` 컬럼 추가 필요 (data-engineer WO-D01 참조). 현재는 건물 총 층수를 2로 나눠 중간층으로 추정하는 fallback 사용 중.
2. **WO-03 후속**: 대출 상담 신청 버튼 활성화를 위해 각 대출 상품(`LoanProduct`)에 `url?: string` 필드 추가 및 은행별 링크 연동 권고.
3. **shared/lib/loan-calculator.ts**: `calculateLoanEstimate` 함수가 실제 사용되지 않으므로 향후 정리 권고. 현재는 타입 안전성 유지를 위해 잔존시킴.
4. **WO-07**: layout.tsx의 Script `onLoad` 콜백에서 `window.kakao.maps` 타입이 `any`로 추론됨. kakao maps 타입 패키지 추가 시 개선 가능.
