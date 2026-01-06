# 성남시 전세정보 - Next.js 프로젝트

React 19와 Next.js 15를 사용한 성남시 전세 매물 정보 및 대출 계산기 애플리케이션입니다.

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **React**: 19.2.3
- **상태 관리**: Zustand
- **폼 관리**: React Hook Form + Zod
- **UI 컴포넌트**: shadcn/ui
- **스타일링**: Tailwind CSS
- **아키텍처**: Feature-Sliced Design (FSD)

## 프로젝트 구조 (FSD)

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── shared/                 # 공유 레이어
│   ├── config/            # 설정 (Zustand 스토어)
│   ├── lib/               # 유틸리티 함수
│   ├── types/             # 타입 정의
│   └── ui/                # 공유 UI 컴포넌트
├── entities/              # 엔티티 레이어
│   ├── property/          # 매물 엔티티
│   └── loan/              # 대출 엔티티
├── features/              # 기능 레이어
│   ├── search/            # 검색 기능
│   ├── property-selection/ # 매물 선택 기능
│   └── loan-calculation/  # 대출 계산 기능
├── widgets/               # 위젯 레이어
│   ├── header/            # 헤더 위젯
│   ├── map-view/          # 지도 뷰 위젯
│   └── calculator-view/   # 계산기 뷰 위젯
└── components/            # shadcn/ui 컴포넌트
    └── ui/
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here
```

카카오맵 API 키는 [카카오 개발자 콘솔](https://developers.kakao.com/)에서 발급받을 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 4. 빌드

```bash
npm run build
npm start
```

## 주요 기능

- 🗺️ **지도 기반 매물 검색**: 카카오맵을 활용한 성남시 전세 매물 지도
- 🔍 **필터링**: 매물 유형, 가격 범위 필터
- 📊 **대출 계산기**: 다양한 대출 상품 비교 및 상환액 계산
- 💰 **대출 상품**: 은행, 주택공사, 정부 상품 비교

## 사용된 라이브러리

- `next`: Next.js 프레임워크
- `react`, `react-dom`: React 19
- `zustand`: 상태 관리
- `react-hook-form`: 폼 관리
- `zod`: 스키마 검증
- `@hookform/resolvers`: RHF + Zod 통합
- `lucide-react`: 아이콘
- `recharts`: 차트 (향후 확장용)
- `tailwindcss`: 스타일링
- `shadcn/ui`: UI 컴포넌트

## 라이선스

MIT
