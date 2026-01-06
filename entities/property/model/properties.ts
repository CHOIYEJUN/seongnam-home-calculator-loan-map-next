import { Property, PropertyUnit } from '@/shared/types/property';
import propertiesData from './properties.json';
import pricesData from './prices.json';

interface PropertyData {
  id: string;
  name: string;
  siGunGu: string;
  roadName: string;
  bonBeon: number;
  buBeon: number;
  floor: number;
  type: 'apartment' | 'officetel';
  lat: number;
  lng: number;
  constructionYear: number;
}

interface PriceData {
  area: number;
  officialPrice: number;
  marketPrice: number;
  jeonsePrice: number;
  lastTransactionDate: string;
}

type PropertiesJson = PropertyData[];
type PricesJson = Record<string, PriceData[]>;

// 주소 생성 함수
function createAddress(property: PropertyData): string {
  const address = property.siGunGu;
  if (property.roadName) {
    return `${address} ${property.roadName} ${property.bonBeon}${property.buBeon > 0 ? `-${property.buBeon}` : ''}`;
  }
  return address;
}

// 두 JSON 파일을 합쳐서 Property[]로 변환
export function loadProperties(): Property[] {
  const properties = propertiesData as PropertiesJson;
  const prices = pricesData as PricesJson;

  return properties
    .filter((property) => {
      // 좌표가 유효한 경우만 포함 (lat, lng가 0이 아닌 경우)
      return property.lat !== 0 && property.lng !== 0;
    })
    .map((property) => {
      const priceInfo = prices[property.id] || [];
      
      // units 변환
      const units: PropertyUnit[] = priceInfo.map((price, index) => ({
        id: `${property.id}-${index + 1}`,
        propertyId: property.id,
        area: price.area,
        officialPrice: price.officialPrice,
        marketPrice: price.marketPrice,
        jeonsePrice: price.jeonsePrice,
      }));

      return {
        id: property.id,
        name: property.name,
        address: createAddress(property),
        type: property.type,
        lat: property.lat,
        lng: property.lng,
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


