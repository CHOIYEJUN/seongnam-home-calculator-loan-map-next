# 성남시 전세정보 프로젝트 — CLAUDE.md

이 파일은 Claude Code의 모든 에이전트·세션에 공통으로 적용되는 프로젝트 컨텍스트입니다.

---

## 서비스 개요

**성남시 전세정보 지도 + 대출 계산기**  
성남시(분당구·수정구·중원구) 아파트·오피스텔 전세 매물을 카카오맵 위에 시각화하고,
전세 대출 한도·상환액 계산 및 XGBoost 기반 AI 전세가 예측을 제공하는 웹 서비스.

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| UI | React 19 + shadcn/ui + Tailwind CSS |
| 상태 관리 | Zustand |
| 폼 | React Hook Form + Zod |
| 지도 | 카카오맵 JavaScript API |
| 아키텍처 | Feature-Sliced Design (FSD) |
| 언어 | TypeScript (프론트) / Python (ML) |
| ML | XGBoost (전세가 예측), scikit-learn |

---

## 프로젝트 구조 (FSD)

```
app/                          # Next.js 라우팅 (page.tsx, layout.tsx, api/)
shared/                       # 공통 레이어
  ├── config/store.ts          # Zustand 스토어
  ├── lib/                    # 유틸 (kakao-map, kakao-geocoding, loan-calculator, jeonse-predict, format)
  ├── types/                  # 타입 정의 (property.ts, loan.ts)
  └── ui/                     # 공용 UI 컴포넌트
entities/                     # 도메인 모델
  ├── property/model/          # properties.json, prices.json, properties.ts
  └── loan/model/              # loan-products.ts
features/                     # 기능 단위
  ├── property-selection/ui/   # property-panel.tsx
  ├── search/ui/               # search-panel.tsx
  └── loan-calculation/        # (구현 예정)
widgets/                      # 화면 블록 조합
  ├── map-view/ui/             # kakao-map.tsx, map-view.tsx
  ├── calculator-view/ui/      # loan-calculator.tsx
  └── header/ui/               # header.tsx
components/ui/                # shadcn/ui 컴포넌트
jeonse-ai-project/            # Python ML 프로젝트
  ├── api/app.py               # FastAPI 예측 서버
  ├── preprocessing/           # 데이터 전처리
  ├── training/                # XGBoost 학습·튜닝
  ├── dataset/merged_dataset.csv
  └── data/row/                # 국토부 실거래가 엑셀 (분당/서울)
scripts/                      # 유틸리티 스크립트
  └── update-coordinates.ts   # 카카오 geocoding으로 좌표 업데이트
```

---

## 환경 변수 (.env.local)

```env
NEXT_PUBLIC_KAKAO_MAP_API_KEY=   # 클라이언트 지도 (JavaScript 키)
KAKAO_REST_API_KEY=              # 서버/스크립트 전용 REST API 키
```

**중요**: `KAKAO_REST_API_KEY`는 절대 클라이언트 코드에 노출 금지.

---

## 핵심 타입

```typescript
// shared/types/property.ts
Property: { id, name, address, type('apartment'|'officetel'), lat, lng, floor?, buildYear?, units[] }
PropertyUnit: { id, propertyId, area, officialPrice, marketPrice, jeonsePrice, monthlyRent? }
LoanEstimate: { maxLoanAmount, interestRate, monthlyPayment, loanType }
```

---

## 레이어 의존 규칙 (FSD)

```
app → widgets → features → entities → shared
```
- 상위 레이어가 하위 레이어를 import (역방향 금지)
- 같은 레이어 내 다른 슬라이스 간 직접 import 금지

---

## 명령어

```bash
npm run dev              # 개발 서버 http://localhost:3000
npm run build            # 프로덕션 빌드
npm run lint             # ESLint
npm run update-coordinates  # 카카오 geocoding으로 좌표 업데이트

# ML (jeonse-ai-project/)
python preprocessing/build_dataset.py   # 데이터셋 빌드
python training/train_xgboost.py        # 모델 학습
python training/tune_xgboost.py         # 하이퍼파라미터 튜닝
python api/app.py                       # FastAPI 예측 서버
```

---

## 에이전트 팀 (.claude/agents/)

| 에이전트 | 역할 | 주요 키워드 |
|----------|------|------------|
| **planner** | 기획·PRD·요구사항·로드맵 | 기획, PRD, 유저스토리, 로드맵 |
| **data-engineer** | 실거래가 데이터 처리·지오코딩·파이프라인 | 엑셀, CSV, 지오코딩, properties.json |
| **frontend-dev** | Next.js·React·shadcn/ui 컴포넌트 개발 | 컴포넌트, UI, 지도, 프론트엔드 |
| **ml-engineer** | XGBoost 전세가 예측 모델 개발·개선 | 모델, XGBoost, ML, 예측 |
| **qa-engineer** | 테스트 케이스 설계·수동/자동 테스트 | 테스트, QA, 버그, 검증 |

---

## 코딩 컨벤션

- 언어: 한국어 (주석, 변수명 의미, 커밋 메시지)
- UI 텍스트: 한국어
- TypeScript strict mode 적용
- Server Component 우선, 필요시만 `"use client"`
- 가격 단위: 만원 (표시 시 `shared/lib/format.ts` 사용)
- 지역 범위: 성남시 분당구·수정구·중원구
