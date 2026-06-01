export interface Property {
  id: string;
  name: string;
  address: string;
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
}

