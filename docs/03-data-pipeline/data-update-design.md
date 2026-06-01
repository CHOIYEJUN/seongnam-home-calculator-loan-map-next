# 데이터 파이프라인 설계 — 매물 데이터 최신화

> 대상 에이전트: data-engineer  
> 담당: planner 설계 / data-engineer 구현  
> 기반: rowData/ 엑셀 파일 실제 구조 분석 (2026-06-02)

---

## 1. 현재 상황 요약

사용자가 **국토부 실거래가 공개시스템**에서 엑셀을 수동 다운로드한 후,
파이썬으로 가공하여 `entities/property/model/properties.json`과
`entities/property/model/prices.json`을 만들고 있다.

**현재 문제:**
- 매번 수동 작업 필요 (다운로드 → 파이썬 실행 → JSON 복사)
- 데이터 갱신 주기가 불규칙
- 파이프라인이 문서화되어 있지 않음

---

## 2. 입력 데이터 구조 (rowData/ 엑셀 분석 결과)

모든 파일: 헤더 13행, 데이터 시작 14행, 공통 메타 1-12행

### 아파트(매매)_실거래가_*.xlsx

| 컬럼명 | 예시 | 용도 |
|--------|------|------|
| 시군구 | 경기도 성남시 분당구 서현동 | 주소 (구 수준) |
| 단지명 | 시범삼성 | 건물명 → property.name |
| 전용면적(㎡) | 192.15 | 면적 → 평 변환 |
| 계약년월 | 202605 | 거래일 |
| 거래금액(만원) | 263,000 | **시세 (marketPrice)** |
| 층 | 2 | 유닛 층수 |
| 건축년도 | 1992 | property.buildYear |
| 도로명 | 중앙공원로 53 | geocoding용 주소 |
| 주택유형 | 아파트 | property.type |

### 아파트(전월세)_실거래가_*.xlsx

| 컬럼명 | 예시 | 용도 |
|--------|------|------|
| 시군구 | 경기도 성남시 분당구 야탑동 | 주소 |
| 단지명 | 목련마을(영남) | 건물명 |
| 전월세구분 | 전세 / 월세 | 전세=jeonsePrice, 월세=monthlyRent |
| 전용면적(㎡) | 53.60 | 면적 |
| 보증금(만원) | 10,000 | **전세가 (jeonsePrice)** 또는 월세 보증금 |
| 월세금(만원) | 70 | **월세 (monthlyRent)** |
| 층 | 7 | 유닛 층수 |
| 건축년도 | 1995 | |
| 도로명 | 판교로 669 | |
| 주택유형 | 아파트 | |

### 오피스텔(매매)_실거래가_*.xlsx

아파트(매매)와 동일 구조 (주택유형 컬럼 없음, type='officetel' 하드코딩)

### 오피스텔(전월세)_실거래가_*.xlsx

아파트(전월세)와 동일 구조 (주택유형 컬럼 없음)

---

## 3. 출력 데이터 구조

### properties.json (매물 마스터)

```json
[
  {
    "id": "apt-시범삼성-분당구서현동",
    "name": "시범삼성",
    "address": "경기도 성남시 분당구 서현동",
    "roadAddress": "경기도 성남시 분당구 중앙공원로 53",
    "type": "apartment",
    "lat": 37.3801,
    "lng": 127.1219,
    "buildYear": 1992,
    "units": ["apt-시범삼성-분당구서현동-192"]
  }
]
```

### prices.json (유닛별 가격)

```json
[
  {
    "id": "apt-시범삼성-분당구서현동-192",
    "propertyId": "apt-시범삼성-분당구서현동",
    "area": 58.2,
    "areaPyeong": 17.6,
    "floor": 2,
    "officialPrice": 0,
    "marketPrice": 2630000000,
    "jeonsePrice": 0,
    "monthlyRent": 0,
    "lastTransactionDate": "2026-05",
    "transactionCount": 3
  }
]
```

> `officialPrice` 공시지가는 국토부 실거래가에 없음 → 0으로 저장 또는 별도 API 연동 필요

---

## 4. 변환 로직

### 면적 변환

```python
# ㎡ → 평 (반올림 1자리)
pyeong = round(area_m2 * 0.3025, 1)
```

### 금액 변환

```python
# 만원 → 원 (쉼표 제거 후 × 10000)
price_won = int(str(price_manwon).replace(',', '')) * 10000
```

### 시세(marketPrice) 결정 로직

같은 단지+면적의 매매 거래 데이터가 여러 건일 경우:

```python
# 최근 12개월 거래 중 중간값 사용 (이상치 제거)
import statistics
market_price = statistics.median(recent_prices)
```

### 전세가(jeonsePrice) 결정 로직

```python
# 최근 12개월 전세 거래 중 최신 거래 보증금 또는 중간값
jeonse_price = statistics.median(recent_jeonse_prices)
```

### Property ID 생성

```python
import re
def make_property_id(name: str, sigungu: str, ptype: str) -> str:
    prefix = 'apt' if ptype == 'apartment' else 'opt'
    # 시군구에서 구 이름만 추출: "경기도 성남시 분당구 서현동" → "분당구서현동"
    district = re.sub(r'경기도 성남시\s*', '', sigungu).replace(' ', '')
    clean_name = re.sub(r'[^가-힣a-zA-Z0-9]', '', name)
    return f'{prefix}-{clean_name}-{district}'
```

---

## 5. 구현 방안 비교

### Option A: Python CLI 스크립트 (권장 — 단기 구현)

**방식**: `rowData/`에 엑셀 파일 넣고 명령어 실행

```bash
python scripts/process_excel.py
# 또는
npm run update-data
```

**장점**:
- 기존 Python 환경 그대로 활용
- 복잡한 데이터 로직 처리 용이 (pandas, openpyxl)
- ML 파이프라인과 통합 가능
- 구현 빠름 (약 1-2시간)

**단점**:
- Python 환경 필요 (openpyxl, pandas 설치)
- 터미널 사용 필요
- 비개발자에게 불편

**파일 위치**: `scripts/process_excel.py`

---

### Option B: Next.js 웹 UI 업로드 (권장 — 중기 구현)

**방식**: 브라우저에서 엑셀 4개 업로드 → 자동 변환

```
/admin/data-upload 페이지 접속
  → 파일 4개 드래그앤드롭
  → [데이터 업데이트] 버튼 클릭
  → properties.json + prices.json 자동 생성
  → (선택) 좌표 업데이트 자동 실행
```

**장점**:
- Python 불필요
- 브라우저에서 간단히 처리
- 좌표 업데이트까지 한번에 가능
- 비개발자도 사용 가능

**단점**:
- 구현 복잡도 높음 (약 4-8시간)
- `xlsx` npm 패키지 추가 필요
- 파일 크기 제한 고려 필요
- 보안 (admin 보호) 필요

**파일 위치**: `app/admin/data-upload/page.tsx`, `app/api/process-excel/route.ts`

---

## 6. 권장 구현 계획 (2단계)

### Phase 1: Python CLI (즉시 구현)

```
scripts/
  process_excel.py      ← 메인 처리 스크립트
  pipeline/
    __init__.py
    parser.py           ← 엑셀 파싱
    aggregator.py       ← 단지별 집계
    transformer.py      ← 타입 변환
    writer.py           ← JSON 출력
```

`package.json`에 스크립트 추가:
```json
{
  "scripts": {
    "update-data": "python3 scripts/process_excel.py && npm run update-coordinates"
  }
}
```

**전체 워크플로우:**
```
1. 국토부 실거래가 사이트에서 엑셀 4개 다운로드
2. rowData/ 폴더에 저장 (기존 파일 덮어쓰기 가능)
3. npm run update-data 실행
4. properties.json + prices.json 자동 업데이트
5. 좌표 없는 신규 매물 자동 geocoding
```

### Phase 2: 웹 UI 업로드 (나중에 구현)

```
app/
  admin/
    data-upload/
      page.tsx          ← 업로드 UI
app/
  api/
    process-excel/
      route.ts          ← 파싱 + JSON 생성 API
```

---

## 7. Python 스크립트 상세 명세 (data-engineer 구현 가이드)

### scripts/process_excel.py

```python
#!/usr/bin/env python3
"""
국토부 실거래가 엑셀 → properties.json + prices.json 변환 스크립트

사용법:
  python3 scripts/process_excel.py [--row-data ./rowData] [--output ./entities/property/model]

필요 패키지:
  pip install openpyxl pandas
"""

import argparse
import json
import os
import glob
import re
import statistics
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import openpyxl

HEADER_ROW = 13  # 모든 파일 공통 헤더 행 번호
DATA_START_ROW = 14

# 엑셀 컬럼 매핑
COL_MAPS = {
    'apt_sale': {   # 아파트(매매)
        'sigungu': '시군구',
        'name': '단지명',
        'area': '전용면적(㎡)',
        'year_month': '계약년월',
        'price': '거래금액(만원)',
        'floor': '층',
        'build_year': '건축년도',
        'road': '도로명',
        'cancel': '해제사유발생일',
    },
    'apt_jeonse': {  # 아파트(전월세)
        'sigungu': '시군구',
        'name': '단지명',
        'contract_type': '전월세구분',
        'area': '전용면적(㎡)',
        'year_month': '계약년월',
        'deposit': '보증금(만원)',
        'monthly': '월세금(만원)',
        'floor': '층',
        'build_year': '건축년도',
        'road': '도로명',
    },
}
# 오피스텔은 아파트와 동일 구조 (주택유형 컬럼 없음)

def sqm_to_pyeong(sqm: float) -> float:
    return round(float(sqm) * 0.3025, 1)

def parse_price(price_str) -> Optional[int]:
    """'263,000' → 2630000000 (원)"""
    if not price_str or str(price_str).strip() in ['-', '', 'None']:
        return None
    return int(str(price_str).replace(',', '').strip()) * 10000

def make_property_id(name: str, sigungu: str, ptype: str) -> str:
    prefix = 'apt' if ptype == 'apartment' else 'opt'
    district = re.sub(r'경기도 성남시\s*', '', sigungu).replace(' ', '')
    clean_name = re.sub(r'[^가-힣a-zA-Z0-9]', '', name)
    return f'{prefix}-{clean_name}-{district}'

def make_unit_id(property_id: str, area_pyeong: float, floor: int) -> str:
    return f'{property_id}-{area_pyeong}평{floor}층'

def read_excel(filepath: str) -> Tuple[List[str], List[List]]:
    """헤더와 데이터 행을 반환"""
    wb = openpyxl.load_workbook(filepath, read_only=False)
    ws = wb.active
    headers = [ws.cell(row=HEADER_ROW, column=c).value for c in range(1, ws.max_column + 1)]
    rows = []
    for r in range(DATA_START_ROW, ws.max_row + 1):
        row = [ws.cell(row=r, column=c).value for c in range(1, ws.max_column + 1)]
        if any(v for v in row if v is not None):
            rows.append(dict(zip(headers, row)))
    wb.close()
    return headers, rows

def detect_file_type(filename: str) -> str:
    """파일명으로 타입 감지"""
    fn = os.path.basename(filename)
    if '아파트' in fn and '매매' in fn:
        return 'apt_sale'
    elif '아파트' in fn and ('전월세' in fn or '전세' in fn):
        return 'apt_jeonse'
    elif '오피스텔' in fn and '매매' in fn:
        return 'opt_sale'
    elif '오피스텔' in fn and ('전월세' in fn or '전세' in fn):
        return 'opt_jeonse'
    raise ValueError(f'알 수 없는 파일: {filename}')

def aggregate_properties(sale_rows: List[dict], jeonse_rows: List[dict], ptype: str) -> Tuple[List[dict], List[dict]]:
    """
    매매/전월세 데이터를 단지+면적 기준으로 집계하여
    properties와 prices 리스트 반환
    """
    # 단지별 집계 딕셔너리
    buildings: Dict[str, dict] = {}  # property_id → property
    units: Dict[str, dict] = {}      # unit_id → unit

    # 1. 매매 데이터로 시세 계산
    for row in sale_rows:
        if str(row.get('해제사유발생일', '-')).strip() not in ['-', '', 'None']:
            continue  # 해제된 거래 건너뜀

        name = str(row.get('단지명', '')).strip()
        sigungu = str(row.get('시군구', '')).strip()
        area_sqm = float(row.get('전용면적(㎡)', 0) or 0)
        floor = int(row.get('층', 1) or 1)
        build_year = int(row.get('건축년도', 2000) or 2000)
        road = str(row.get('도로명', '')).strip()
        price = parse_price(row.get('거래금액(만원)'))
        year_month = str(row.get('계약년월', '')).strip()

        if not name or not price:
            continue

        prop_id = make_property_id(name, sigungu, ptype)
        area_pyeong = sqm_to_pyeong(area_sqm)
        unit_id = make_unit_id(prop_id, area_pyeong, floor)

        # property 등록
        if prop_id not in buildings:
            # 주소 조합
            address = sigungu  # "경기도 성남시 분당구 서현동"
            buildings[prop_id] = {
                'id': prop_id,
                'name': name,
                'address': address,
                'roadAddress': f'{address.rsplit(" ", 1)[0]} {road}'.strip(),
                'type': ptype,
                'lat': 0,  # geocoding으로 채움
                'lng': 0,
                'buildYear': build_year,
                'units': [],
            }

        # unit 등록 (가격 집계)
        if unit_id not in units:
            units[unit_id] = {
                'id': unit_id,
                'propertyId': prop_id,
                'area': area_sqm,
                'areaPyeong': area_pyeong,
                'floor': floor,
                'officialPrice': 0,
                'marketPrices': [],  # 집계용
                'jeonsePrices': [],  # 집계용
                'monthlyRents': [],  # 집계용
                'lastTransactionDate': year_month,
            }
            if unit_id not in buildings[prop_id]['units']:
                buildings[prop_id]['units'].append(unit_id)

        units[unit_id]['marketPrices'].append(price)
        # 최신 거래일 업데이트
        if str(year_month) > str(units[unit_id]['lastTransactionDate']):
            units[unit_id]['lastTransactionDate'] = year_month

    # 2. 전월세 데이터로 전세가/월세 계산
    for row in jeonse_rows:
        name = str(row.get('단지명', '')).strip()
        sigungu = str(row.get('시군구', '')).strip()
        area_sqm = float(row.get('전용면적(㎡)', 0) or 0)
        floor = int(row.get('층', 1) or 1)
        contract_type = str(row.get('전월세구분', '')).strip()
        deposit = parse_price(row.get('보증금(만원)'))
        monthly = parse_price(row.get('월세금(만원)'))

        if not name:
            continue

        prop_id = make_property_id(name, sigungu, ptype)
        area_pyeong = sqm_to_pyeong(area_sqm)
        unit_id = make_unit_id(prop_id, area_pyeong, floor)

        if unit_id not in units:
            continue  # 매매 데이터 없는 유닛은 스킵 (선택적으로 추가 가능)

        if contract_type == '전세' and deposit:
            units[unit_id]['jeonsePrices'].append(deposit)
        elif contract_type == '월세' and monthly:
            units[unit_id]['monthlyRents'].append(monthly)

    # 3. 집계 → 최종 prices 생성
    prices = []
    for unit_id, unit in units.items():
        market_prices = unit.pop('marketPrices', [])
        jeonse_prices = unit.pop('jeonsePrices', [])
        monthly_rents = unit.pop('monthlyRents', [])

        unit['marketPrice'] = int(statistics.median(market_prices)) if market_prices else 0
        unit['jeonsePrice'] = int(statistics.median(jeonse_prices)) if jeonse_prices else 0
        unit['monthlyRent'] = int(statistics.median(monthly_rents)) if monthly_rents else 0
        unit['transactionCount'] = len(market_prices)
        unit['lastTransactionDate'] = str(unit['lastTransactionDate'])[:6]  # YYYYMM

        prices.append(unit)

    properties = list(buildings.values())
    return properties, prices


def main():
    parser = argparse.ArgumentParser(description='국토부 실거래가 엑셀 → JSON 변환')
    parser.add_argument('--row-data', default='./rowData', help='엑셀 파일 폴더')
    parser.add_argument('--output', default='./entities/property/model', help='출력 폴더')
    parser.add_argument('--no-geocoding', action='store_true', help='좌표 업데이트 건너뜀')
    args = parser.parse_args()

    # 엑셀 파일 검색
    excel_files = glob.glob(os.path.join(args.row_data, '*.xlsx'))
    if not excel_files:
        print(f'오류: {args.row_data}에 xlsx 파일이 없습니다.')
        return

    # 타입별 분류
    typed_files = {}
    for f in excel_files:
        try:
            ftype = detect_file_type(f)
            typed_files[ftype] = f
        except ValueError as e:
            print(f'경고: {e}')

    all_properties = []
    all_prices = []

    # 아파트 처리
    if 'apt_sale' in typed_files and 'apt_jeonse' in typed_files:
        print('아파트 데이터 처리 중...')
        _, sale_rows = read_excel(typed_files['apt_sale'])
        _, jeonse_rows = read_excel(typed_files['apt_jeonse'])
        props, prices = aggregate_properties(sale_rows, jeonse_rows, 'apartment')
        all_properties.extend(props)
        all_prices.extend(prices)
        print(f'  → 아파트 {len(props)}개 단지, {len(prices)}개 유닛')

    # 오피스텔 처리
    if 'opt_sale' in typed_files and 'opt_jeonse' in typed_files:
        print('오피스텔 데이터 처리 중...')
        _, sale_rows = read_excel(typed_files['opt_sale'])
        _, jeonse_rows = read_excel(typed_files['opt_jeonse'])
        props, prices = aggregate_properties(sale_rows, jeonse_rows, 'officetel')
        all_properties.extend(props)
        all_prices.extend(prices)
        print(f'  → 오피스텔 {len(props)}개 단지, {len(prices)}개 유닛')

    # JSON 저장
    output_dir = Path(args.output)
    props_path = output_dir / 'properties.json'
    prices_path = output_dir / 'prices.json'

    with open(props_path, 'w', encoding='utf-8') as f:
        json.dump(all_properties, f, ensure_ascii=False, indent=2)
    with open(prices_path, 'w', encoding='utf-8') as f:
        json.dump(all_prices, f, ensure_ascii=False, indent=2)

    print(f'\n완료! properties: {len(all_properties)}개, prices: {len(all_prices)}개')
    print(f'저장 위치: {props_path}, {prices_path}')

    if not args.no_geocoding:
        print('\n좌표 업데이트 중... (KAKAO_REST_API_KEY 필요)')
        os.system('npm run update-coordinates')


if __name__ == '__main__':
    main()
```

---

## 8. 운영 워크플로우

### 매월 데이터 갱신 절차 (단기 — CLI 방식)

```
1. 국토부 실거래가 공개시스템 접속
   https://rt.molit.go.kr

2. 조건 설정:
   - 지역: 경기도 > 성남시 > 분당구 / 수정구 / 중원구
   - 기간: 최근 12개월
   - 유형: 아파트(매매), 아파트(전월세), 오피스텔(매매), 오피스텔(전월세)
   → 엑셀 다운로드 × 4개

3. rowData/ 폴더에 파일 저장
   (기존 파일 덮어쓰기 가능 — 파일명 패턴 유지)

4. 스크립트 실행:
   npm run update-data
   (= python3 scripts/process_excel.py && npm run update-coordinates)

5. 결과 확인:
   - entities/property/model/properties.json 업데이트 확인
   - entities/property/model/prices.json 업데이트 확인
   - 콘솔에서 단지 수 / 유닛 수 확인

6. 개발 서버에서 지도 확인:
   npm run dev
```

---

## 9. 웹 UI 업로드 설계 (Phase 2 — 미래 구현)

**페이지**: `/admin/data-upload`

```
┌────────────────────────────────────────────────────┐
│  매물 데이터 업로드                                 │
│                                                    │
│  [아파트 매매] ──────── 파일 없음  [파일 선택]    │
│  [아파트 전월세] ─────── 파일 없음  [파일 선택]    │
│  [오피스텔 매매] ──────── 파일 없음  [파일 선택]    │
│  [오피스텔 전월세] ────── 파일 없음  [파일 선택]    │
│                                                    │
│  ☑ 좌표 자동 업데이트 (카카오 REST API)            │
│  ☑ 기존 데이터 덮어쓰기                           │
│                                                    │
│  [데이터 업데이트 실행]                            │
│                                                    │
│  ──────────────────────────────────────           │
│  마지막 업데이트: 2026-06-02 00:33                 │
│  아파트: 245개 단지 / 오피스텔: 67개 단지          │
└────────────────────────────────────────────────────┘
```

**API Route**: `POST /api/process-excel`

```typescript
// app/api/process-excel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = {
    apt_sale: formData.get('apt_sale') as File | null,
    apt_jeonse: formData.get('apt_jeonse') as File | null,
    opt_sale: formData.get('opt_sale') as File | null,
    opt_jeonse: formData.get('opt_jeonse') as File | null,
  };

  // 파싱 → 집계 → JSON 생성 → 파일 쓰기
  // (Python 스크립트 로직을 TypeScript로 포팅)

  return NextResponse.json({ success: true, propertyCount: ..., unitCount: ... });
}
```

**필요 패키지**:
```bash
npm install xlsx
```

---

## 10. 주의사항 및 제약

### 공시지가 부재

국토부 실거래가 데이터에는 **공시지가가 없음**.
현재 코드에서 `officialPrice`는 사용되지 않고 표시만 하므로 `0` 처리.
향후 공시지가가 필요하다면:
- 국토부 공시지가 API 별도 연동 필요
- 또는 시세의 일정 비율로 추정

### 중복 거래 처리

같은 단지+면적+층 조합이 여러 건 있을 경우 **중간값(median)** 사용.
극단값 거래(경매, 특수거래)를 자동으로 배제.

### 해제된 거래 건너뜀

`해제사유발생일` 컬럼에 값이 있는 행은 취소된 거래이므로 파싱 시 건너뜀.

### rowData 파일명 패턴

현재 국토부 다운로드 파일명 패턴:
```
아파트(매매)_실거래가_YYYYMMDDHHMMSS.xlsx
아파트(전월세)_실거래가_YYYYMMDDHHMMSS.xlsx
오피스텔(매매)_실거래가_YYYYMMDDHHMMSS.xlsx
오피스텔(전월세)_실거래가_YYYYMMDDHHMMSS.xlsx
```

스크립트는 파일명에서 유형을 자동 감지하므로 파일명 변경 불필요.
단, 각 유형의 파일이 하나씩만 있어야 함 (여러 개면 가장 최신 파일 사용 권장).

---

## 11. 관련 파일 경로

```
scripts/
  process_excel.py           ← data-engineer가 구현할 메인 스크립트
  update-coordinates.ts      ← 기존 (좌표 업데이트)

rowData/
  아파트(매매)_*.xlsx         ← 국토부 다운로드 원본
  아파트(전월세)_*.xlsx
  오피스텔(매매)_*.xlsx
  오피스텔(전월세)_*.xlsx

entities/property/model/
  properties.json             ← 생성 대상
  prices.json                 ← 생성 대상

app/admin/data-upload/        ← Phase 2: 웹 UI (미구현)
  page.tsx
app/api/process-excel/        ← Phase 2: API Route (미구현)
  route.ts
```
