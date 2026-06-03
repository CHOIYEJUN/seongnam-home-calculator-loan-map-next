export interface Property {
  id: string;
  name: string;
  address: string;
  roadAddress?: string; // 도로명 주소
  type: 'apartment' | 'officetel';
  lat: number;
  lng: number;
  /** 동/건물 총 층수 */
  floor?: number;
  /** 준공년도 */
  buildYear?: number;
  units: PropertyUnit[];
}

export interface PropertyUnit {
  id: string;
  propertyId: string;
  area: number; // 평형
  floor?: number; // 유닛 층수 (해당 호수의 실제 층)
  officialPrice: number; // 공시지가
  marketPrice: number; // 시세
  jeonsePrice: number; // 전세가
  monthlyRent?: number; // 월세 (옵션)
  lastSaleDate?: string; // 최신 매매 거래 기준 (예: "2026-05")
  lastJeonseDate?: string; // 최신 전세 거래 기준 (예: "2025-11")
}

