'use client';

import { useMemo } from 'react';
import { KakaoMap } from './kakao-map';
import { SearchPanel } from '@/features/search/ui/search-panel';
import { PropertyPanel } from '@/features/property-selection/ui/property-panel';
import { getProperties } from '@/entities/property/model/properties';
import { useAppStore } from '@/shared/config/store';

export function MapView() {
  const { searchQuery, propertyTypeFilter, priceRange } = useAppStore();

  // 필터링된 매물 목록
  const filteredProperties = useMemo(() => {
    const properties = getProperties();
    return properties.filter((property) => {
      // 매물 유형 필터
      if (!propertyTypeFilter.includes(property.type)) {
        return false;
      }

      // 검색어 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = property.name.toLowerCase().includes(query);
        const matchesAddress = property.address.toLowerCase().includes(query);
        if (!matchesName && !matchesAddress) {
          return false;
        }
      }

      // 가격 범위 필터
      const hasUnitInRange = property.units.some(
        (unit) => unit.jeonsePrice >= priceRange[0] && unit.jeonsePrice <= priceRange[1]
      );
      if (!hasUnitInRange) {
        return false;
      }

      return true;
    });
  }, [searchQuery, propertyTypeFilter, priceRange]);

  return (
    <div className="flex-1 relative">
      {/* 지도 - 전체 배경 */}
      <KakaoMap properties={filteredProperties} />

      {/* 검색 패널 (좌측) */}
      <SearchPanel />

      {/* 매물 정보 패널 (우측) */}
      <PropertyPanel />
    </div>
  );
}

