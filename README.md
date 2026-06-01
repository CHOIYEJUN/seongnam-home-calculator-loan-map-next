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
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_javascript_key_here
KAKAO_REST_API_KEY=your_kakao_rest_api_key_here
```

카카오맵 API 키는 [카카오 개발자 콘솔](https://developers.kakao.com/)에서 발급받을 수 있습니다.
- **JavaScript 키**: 지도 표시용 (NEXT_PUBLIC_KAKAO_MAP_API_KEY)
- **REST API 키**: 주소 검색 API용 (KAKAO_REST_API_KEY) - 좌표 업데이트 스크립트에서 사용

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 4. 좌표 업데이트 (선택사항)

`properties.json`의 좌표를 아파트 단지명을 포함한 주소 검색으로 더 정확하게 업데이트할 수 있습니다.

**주의**: 많은 API 호출이 발생하므로 카카오맵 API 일일 호출 제한을 확인하세요.

```bash
# 1. REST API 키 발급 (카카오 개발자 콘솔)
# 2. .env.local에 KAKAO_REST_API_KEY 추가
# 3. 스크립트 실행
npm run update-coordinates
```

이 스크립트는 아파트 단지명을 포함한 여러 검색어 패턴으로 좌표를 검색하여 `properties.json`의 좌표를 업데이트합니다:
- `시군구 + 도로명 + 단지명` (가장 정확)
- `시군구 + 단지명`
- `시군구 + 도로명 + 단지명(괄호 제거)`
- `시군구 + 단지명(괄호 제거)`

### 5. 빌드

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
