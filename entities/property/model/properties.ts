import { Property, PropertyUnit } from '@/shared/types/property';
import propertiesData from './properties.json';
import pricesData from './prices.json';

// ──────────────────────────────────────────
// 새 JSON 구조 (process_excel.py 생성)
// ──────────────────────────────────────────

interface NewPropertyData {
  id: string;
  name: string;
  address: string;
  roadAddress: string;
  type: 'apartment' | 'officetel';
  lat: number;
  lng: number;
  buildYear: number;
  units: string[];
}

interface NewPriceData {
  id: string;
  propertyId: string;
  area: number;
  areaPyeong: number;
  floor: number;
  officialPrice: number;
  marketPrice: number;
  jeonsePrice: number;
  monthlyRent?: number;
  lastTransactionDate: string;
  transactionCount: number;
}

// ──────────────────────────────────────────
// 로더 — 두 JSON 파일을 합쳐서 Property[] 반환
// ──────────────────────────────────────────

export function loadProperties(): Property[] {
  const properties = propertiesData as NewPropertyData[];
  const prices = pricesData as NewPriceData[];

  // prices를 propertyId 기준으로 인덱싱
  const pricesByProperty = new Map<string, NewPriceData[]>();
  for (const price of prices) {
    if (!pricesByProperty.has(price.propertyId)) {
      pricesByProperty.set(price.propertyId, []);
    }
    pricesByProperty.get(price.propertyId)!.push(price);
  }

  return properties
    .filter((property) => {
      // 좌표가 유효한 경우만 포함 (lat, lng가 0이 아닌 경우)
      return property.lat !== 0 && property.lng !== 0;
    })
    .map((property) => {
      const priceList = pricesByProperty.get(property.id) || [];

      const units: PropertyUnit[] = priceList.map((price) => ({
        id: price.id,
        propertyId: price.propertyId,
        area: price.areaPyeong,   // 화면에 평 단위로 표시
        floor: price.floor,
        officialPrice: price.officialPrice,
        marketPrice: price.marketPrice,
        jeonsePrice: price.jeonsePrice,
        monthlyRent: price.monthlyRent ?? 0,
      }));

      return {
        id: property.id,
        name: property.name,
        address: property.address,
        type: property.type,
        lat: property.lat,
        lng: property.lng,
        buildYear: property.buildYear,
        units,
      };
    })
    .filter((property) => {
      // units가 있는 매물만 포함
      return property.units.length > 0;
    });
}

// 캐시된 properties
let cachedProperties: Property[] | null = null;

export function getProperties(): Property[] {
  if (!cachedProperties) {
    cachedProperties = loadProperties();
  }
  return cachedProperties;
}
