/** 브라우저에서는 같은 출처 API 라우트를 써서 CORS 회피 */
const PREDICT_ENDPOINT =
  typeof window !== 'undefined'
    ? '/api/jeonse-predict'
    : (process.env.JEONSE_PREDICT_API ?? 'http://localhost:8000') + '/predict';

export interface JeonsePredictRequest {
  /** 매매가(시세) 만원 단위 */
  salePrice: number;
  /** 전용면적 평 */
  area: number;
  /** 층수 */
  floor: number;
  /** 준공년도 */
  buildYear: number;
  /** 거래(예측) 연도 */
  saleYear: number;
}

export interface JeonsePredictResponse {
  /** 매매가 대비 전세가 비율 (0~1, 예: 0.5577 = 매매가의 55.77%가 전세가) */
  predicted_jeonse_price: number;
}

/**
 * 전세가 AI 예측 API 호출
 * API는 매매가 대비 전세가 비율(0~1)을 반환하므로, 매매가(만원) × 비율로 예측 전세가(원) 계산
 * @returns 예측 전세가 (원 단위)
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
    }),
  });

  if (!res.ok) {
    throw new Error(`전세 예측 API 오류: ${res.status}`);
  }

  const data: JeonsePredictResponse = await res.json();
  // API는 predicted_jeonse_price를 만원 단위로 반환 → 원 단위로 변환
  const predictedMan = data.predicted_jeonse_price ?? 0;
  return Math.round(predictedMan * 10000);
}
