/** 브라우저에서는 같은 출처 API 라우트를 써서 CORS 회피 */
const PREDICT_ENDPOINT =
  typeof window !== 'undefined'
    ? '/api/jeonse-predict'
    : (process.env.JEONSE_PREDICT_API ?? 'http://127.0.0.1:8000') + '/predict';

export interface JeonsePredictRequest {
  /** 매매가(시세) 만원 단위 */
  salePrice: number;
  /** 전용면적 ㎡ (평 아님) */
  area: number;
  /** 층수 */
  floor: number;
  /** 준공년도 */
  buildYear: number;
  /** 거래(예측) 연도 */
  saleYear: number;
  /** 단지명. 학습에 없으면 서버가 기타로 처리 */
  apartmentName?: string;
  /** 법정동. 예: 정자동 */
  dong?: string;
  /** 최근 전세보증금 만원. 직전 전세가율 계산에 사용 */
  lastJeonsePrice?: number;
  /** 최신 매매 기준월 YYYY-MM */
  lastSaleDate?: string;
  /** 최신 전세 기준월 YYYY-MM */
  lastJeonseDate?: string;
}

export interface JeonsePredictResponse {
  predicted_jeonse_price: number;
  predicted_jeonse_ratio?: number;
}

/**
 * 전세가 AI 예측 API 호출
 * API는 보증금을 만원 단위로 반환 → 원 단위로 변환
 */
export async function predictJeonsePrice(
  params: JeonsePredictRequest
): Promise<number> {
  const res = await fetch(PREDICT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      salePrice: params.salePrice,
      area: params.area,
      floor: params.floor,
      buildYear: params.buildYear,
      saleYear: params.saleYear,
      apartmentName: params.apartmentName,
      dong: params.dong,
      lastJeonsePrice: params.lastJeonsePrice,
      lastSaleDate: params.lastSaleDate,
      lastJeonseDate: params.lastJeonseDate,
    }),
  });

  if (!res.ok) {
    throw new Error(`전세 예측 API 오류: ${res.status}`);
  }

  const data: JeonsePredictResponse = await res.json();
  const predictedMan = data.predicted_jeonse_price ?? 0;
  return Math.round(predictedMan * 10000);
}

/** 주소 마지막 토큰을 동으로 쓴다. "경기도 성남시 분당구 정자동" → "정자동" */
export function dongFromAddress(address: string): string {
  const parts = address.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] || '기타';
}
