/**
 * 카카오맵 주소 검색 API를 사용하여 주소를 좌표로 변환
 * 단지명을 포함한 상세 주소로 검색하여 정확한 좌표를 얻습니다
 * 
 * 주의: 이 함수는 REST API 키가 필요합니다 (JavaScript 키가 아님)
 * REST API 키는 카카오 개발자 콘솔에서 발급받을 수 있습니다
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  address: string;
}

/**
 * 카카오맵 주소 검색 API를 사용하여 좌표 검색
 * @param query 검색어 (예: "경기도 성남시 분당구 서현동 효자촌(임광)")
 * @param apiKey 카카오맵 REST API 키 (JavaScript 키 아님!)
 * @returns 좌표 정보 또는 null
 */
export async function searchAddressToCoordinates(
  query: string,
  apiKey: string
): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error('카카오맵 주소 검색 API 오류:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.documents && data.documents.length > 0) {
      // 첫 번째 결과를 사용 (가장 정확한 매칭)
      const result = data.documents[0];
      return {
        lat: parseFloat(result.y),
        lng: parseFloat(result.x),
        address: result.address_name,
      };
    }

    return null;
  } catch (error) {
    console.error('주소 검색 오류:', error);
    return null;
  }
}

/**
 * 아파트 단지명을 포함한 전체 주소 생성
 * @param name 단지명 (예: "효자촌(임광)")
 * @param siGunGu 시군구 (예: "경기도 성남시 분당구 서현동")
 * @param roadName 도로명 (예: "불정로 397")
 * @returns 검색 쿼리 문자열
 */
export function createSearchQuery(
  name: string,
  siGunGu: string,
  roadName?: string
): string {
  // 단지명과 시군구를 포함한 검색어 생성
  // 예: "경기도 성남시 분당구 서현동 효자촌(임광)"
  let query = `${siGunGu} ${name}`;
  
  // 도로명이 있으면 추가로 포함
  if (roadName) {
    query = `${siGunGu} ${roadName} ${name}`;
  }
  
  return query;
}

/**
 * 단지명과 기본 주소 정보로 여러 검색어 시도
 * @param name 단지명
 * @param siGunGu 시군구
 * @param roadName 도로명
 * @param apiKey 카카오맵 JavaScript 키
 * @returns 좌표 정보 또는 null
 */
export async function searchPropertyCoordinates(
  name: string,
  siGunGu: string,
  roadName: string | null,
  apiKey: string
): Promise<GeocodingResult | null> {
  // 여러 검색어 패턴 시도 (우선순위 순서)
  const searchQueries = [
    // 1. 단지명 + 시군구 + 도로명 (가장 정확)
    roadName ? `${siGunGu} ${roadName} ${name}` : null,
    // 2. 단지명 + 시군구
    `${siGunGu} ${name}`,
    // 3. 시군구 + 도로명 + 단지명 (괄호 제거)
    roadName ? `${siGunGu} ${roadName} ${name.replace(/\([^)]*\)/g, '').trim()}` : null,
    // 4. 시군구 + 단지명 (괄호 제거)
    `${siGunGu} ${name.replace(/\([^)]*\)/g, '').trim()}`,
  ].filter((q): q is string => q !== null);

  // 각 검색어를 순서대로 시도
  for (const query of searchQueries) {
    const result = await searchAddressToCoordinates(query, apiKey);
    if (result) {
      return result;
    }
    
    // API 호출 간 짧은 지연 (Rate limit 방지)
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return null;
}

