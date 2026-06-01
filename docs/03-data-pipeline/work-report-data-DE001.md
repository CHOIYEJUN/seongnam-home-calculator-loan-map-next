# 작업 보고서 — DE001: process_excel.py 구현

| 항목 | 내용 |
|------|------|
| 작업 날짜 | 2026-06-02 |
| 에이전트 | data-engineer |
| 기반 설계 | `docs/03-data-pipeline/data-update-design.md` |
| 상태 | 완료 |

---

## 1. 구현 파일 목록

| 파일 | 작업 | 설명 |
|------|------|------|
| `scripts/process_excel.py` | 신규 생성 | 엑셀 → JSON 변환 메인 스크립트 |
| `entities/property/model/properties.ts` | 수정 | 새 JSON 구조에 맞게 로더 재작성 |
| `scripts/update-coordinates.ts` | 수정 | 새 JSON 구조(address/roadAddress)에 맞게 갱신 |
| `package.json` | 수정 | `update-data` 스크립트 추가 |
| `entities/property/model/properties.backup.json` | 신규 | 기존 properties.json 백업 |
| `entities/property/model/prices.backup.json` | 신규 | 기존 prices.json 백업 |

---

## 2. 실행 결과

```
python3 scripts/process_excel.py --no-geocoding
```

| 항목 | 수치 |
|------|------|
| 아파트 단지 수 | 182개 |
| 아파트 유닛 수 | 1,395개 |
| 오피스텔 단지 수 | 72개 |
| 오피스텔 유닛 수 | 481개 |
| **전체 단지 수** | **254개** |
| **전체 유닛 수** | **1,876개** |

---

## 3. 엑셀 → JSON 변환 통계

| 파일 | 원본 행 수 |
|------|-----------|
| 아파트(매매) | 1,710행 |
| 아파트(전월세) | 6,231행 |
| 오피스텔(매매) | 547행 |
| 오피스텔(전월세) | 2,694행 |

| 처리 내용 | 수치 |
|----------|------|
| 해제 거래 건너뜀 (아파트) | 33건 |
| 해제 거래 건너뜀 (오피스텔) | 17건 |
| **해제 거래 합계** | **50건** |
| 좌표 없는 신규 단지 (아파트) | 26개 |
| 좌표 없는 신규 단지 (오피스텔) | 3개 |
| **좌표 없는 신규 단지 합계** | **29개** |

---

## 4. 특이사항

### 4-1. 기존 좌표 보존

기존 `properties.json`(276개 단지)에서 526개의 좌표 항목을 로드하여,
새 properties에서 동일한 단지명+주소 조합이 있으면 좌표를 자동 보존.

**좌표 보존 매핑 방식:**
- 키: `{name}|{siGunGu}` 형식으로 기존 데이터 인덱싱
- 새 단지 생성 시 동일 키로 조회 → 기존 좌표 적용
- 예: `목련마을(영남)|경기도 성남시 분당구 야탑동` → `lat: 37.4059725007389, lng: 127.122271876441` 보존 확인

### 4-2. 새 JSON 구조 (설계 문서 명세 준수)

**properties.json** (배열):
```json
{
  "id": "apt-시범삼성-분당구서현동",
  "name": "시범삼성",
  "address": "경기도 성남시 분당구 서현동",
  "roadAddress": "경기도 성남시 분당구 중앙공원로 53",
  "type": "apartment",
  "lat": 37.38...,
  "lng": 127.12...,
  "buildYear": 1992,
  "units": ["apt-시범삼성-분당구서현동-192.15sqm2f", ...]
}
```

**prices.json** (배열):
```json
{
  "id": "apt-시범삼성-분당구서현동-192.15sqm2f",
  "propertyId": "apt-시범삼성-분당구서현동",
  "area": 192.15,
  "areaPyeong": 58.1,
  "floor": 2,
  "officialPrice": 0,
  "marketPrice": 2630000000,
  "jeonsePrice": 0,
  "monthlyRent": 0,
  "lastTransactionDate": "2026-05",
  "transactionCount": 1
}
```

### 4-3. macOS 파일명 유니코드 이슈

macOS는 파일명에 NFD(Canonical Decomposition) 유니코드를 사용.
Python의 `str in str` 연산이 NFC 문자열과 NFD 파일명 사이에서 False를 반환하는 버그 발생.
→ `unicodedata.normalize('NFC', filename)` 로 해결.

### 4-4. 기존 JSON 구조와의 차이

기존 `properties.json`은 주소 기반 ID(`경기도-성남시-분당구-서현동-292`) 및
`siGunGu`, `roadName`, `bonBeon`, `buBeon`, `constructionYear` 등의 필드를 사용했으나,
새 구조는 설계 문서 명세에 따라 단지명+구동 기반 ID(`apt-시범삼성-분당구서현동`) 및
`address`, `roadAddress`, `buildYear` 필드로 전환됨.
`entities/property/model/properties.ts` 로더도 함께 업데이트하여 호환성 유지.

---

## 5. 후속 작업 권고사항

### 필수 (우선순위 높음)

1. **좌표 업데이트 (29개 신규 단지)**
   - 좌표가 0,0인 29개 단지는 카카오 지도에 표시되지 않음
   - `KAKAO_REST_API_KEY` 환경 변수 설정 후 실행:
     ```bash
     npm run update-coordinates
     ```
   - 또는 전체 한번에: `npm run update-data` (좌표 업데이트 자동 포함)

2. **TypeScript 빌드 확인**
   - `properties.ts` 로더 구조 변경으로 인해 `npm run build`로 타입 오류 없는지 확인 권장

### 선택 (우선순위 낮음)

3. **units 집계 방식 검토**
   - 현재 같은 단지+면적+층이 같아도 별도 유닛으로 저장됨 (floor 기준)
   - 필요 시 층 범주화(저/중/고층) 집계 방식으로 변경 검토

4. **전세 데이터가 없는 유닛 처리**
   - 매매 데이터만 있고 전세 데이터가 없는 유닛은 `jeonsePrice: 0`으로 저장
   - AI 예측(jeonse-predict.ts)이 대신 사용되므로 기능상 문제 없음

5. **Phase 2 웹 UI 구현**
   - 설계 문서 §9 참조: `/admin/data-upload` 페이지 및 `POST /api/process-excel` API Route
   - 비개발자 친화적 업데이트 워크플로우를 위해 향후 구현 권장

---

## 6. 실행 방법 요약

```bash
# 1. rowData/ 폴더에 국토부 엑셀 4개 저장

# 2-a. 좌표 업데이트 없이 JSON만 생성
python3 scripts/process_excel.py --no-geocoding

# 2-b. JSON 생성 + 좌표 업데이트 (KAKAO_REST_API_KEY 필요)
npm run update-data
```
