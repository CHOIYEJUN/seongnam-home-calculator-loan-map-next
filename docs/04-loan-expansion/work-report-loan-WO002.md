# 작업 보고서 — WO002 대출 상품 확장 & 계산기 개선

> 담당: frontend-dev  
> 완료일: 2026-06-02  
> 빌드 결과: ✅ 성공 (타입 에러 0)

---

## 완료 항목 체크리스트

- [x] STEP 1: `shared/types/loan.ts` 타입 확장
- [x] STEP 2: `entities/loan/model/loan-products.ts` 36개 상품으로 교체
- [x] STEP 3: `shared/config/store.ts` 필터·정렬·비교 상태 추가
- [x] STEP 4: `widgets/calculator-view/ui/loan-calculator.tsx` UI 전면 개선
- [x] STEP 5: `widgets/calculator-view/ui/compare-modal.tsx` 신규 생성
- [x] STEP 6: `npm run build` 타입 에러 없음 확인

### 세부 완료 항목

- [x] `LoanCategory`에 `'public'` 추가
- [x] `InterestRateType`, `TargetGroup` 타입 추가
- [x] `LoanProduct`에 `interestRateMin`, `interestRateMax`, `interestRateType`, `targetGroups`, `url?` 필드 추가
- [x] 기존 `interestRate` 유지 (하위 호환)
- [x] 36개 상품 전체 구현 (은행 18개 + 정부기금 6개 + 공공임대 6개)
- [x] 탭 4개 (전체/은행/정부기금/공공임대) 구현
- [x] 검색 Input + 정렬 Select 바 구현
- [x] 대상 그룹 필터 버튼 (전체/일반/청년/신혼부부/다자녀/고령자)
- [x] `useMemo` 필터링·정렬 로직
- [x] 금리 유형 배지 (변동/고정/혼합)
- [x] 대상 그룹 배지 (청년/신혼부부/다자녀/고령자)
- [x] 금리 범위 표시 (X.XX% ~ X.XX%)
- [x] 비교 체크박스 (최대 3개)
- [x] 추천 상품 배너 (매물 선택 시 정부/공공 저금리 추천)
- [x] 검색 결과 없음 처리 + 필터 초기화 버튼
- [x] 비교 플로팅 바 (1개 이상 선택 시 표시)
- [x] 비교 모달 테이블 (최저/최고금리, 금리유형, 한도, 기간, 대상, 월납입, 총이자)
- [x] 테이블 최적값 하이라이트 (초록색)

---

## 수정/생성된 파일 목록

| 파일 | 유형 | 내용 |
|------|------|------|
| `shared/types/loan.ts` | 수정 | `LoanCategory` 확장, `InterestRateType`·`TargetGroup` 신규, `LoanProduct` 필드 확장 |
| `entities/loan/model/loan-products.ts` | 전면 교체 | 11개 → 36개 상품 (은행 18 + 정부기금 6 + 공공임대 6) |
| `shared/config/store.ts` | 수정 | `loanSortKey`, `loanSearchQuery`, `loanTargetFilter`, `compareProducts` 상태 및 액션 추가 |
| `widgets/calculator-view/ui/loan-calculator.tsx` | 대폭 수정 | 탭 4개, 검색·정렬·필터 바, 카드 배지, 비교 체크박스, 추천 배너, 검색 없음 처리 |
| `widgets/calculator-view/ui/compare-modal.tsx` | 신규 생성 | 비교 플로팅 바 + Dialog 모달 (portal 기반 자체 구현) |
| `components/ui/dialog.tsx` | 신규 생성 | `@radix-ui/react-dialog` 미설치로 인해 React portal 기반 자체 Dialog 컴포넌트 구현 |

---

## 빌드 결과

```
▲ Next.js 16.1.1 (Turbopack)
✓ Compiled successfully in 1843.4ms
✓ Generating static pages (5/5)

타입 에러: 0
빌드 결과: 성공
```

---

## 특이사항

1. **Dialog 컴포넌트 자체 구현**: `@radix-ui/react-dialog`가 package.json에 없고 npm install 권한이 없어, `react-dom`의 `createPortal`을 이용한 자체 Dialog 컴포넌트를 구현했습니다. shadcn/ui 패턴의 API(Dialog, DialogContent, DialogHeader, DialogTitle 등)를 동일하게 유지합니다.

2. **`housing` 카테고리 호환성 유지**: 기존 `housing` 카테고리는 코드에서 제거되지 않고, 공공임대 탭 필터에서 `housing | public` 양쪽을 포함하도록 처리했습니다. 신규 데이터는 모두 `public`을 사용합니다.

3. **`interestRate` 하위 호환**: 기존 계산기 로직(`calculateLoanRepayment`)이 `interestRate`를 사용하므로 모든 신규 상품에서 `interestRate = interestRateMin`으로 설정하여 기존 계산 결과와 일관성을 유지했습니다.

4. **추천 배너 표시 조건**: `selectedUnit`이 있고, 정부/공공 카테고리이며 `maxAmount >= jeonsePrice * 0.5`를 만족하는 상품 최대 2개를 모든 탭에서 표시합니다.
