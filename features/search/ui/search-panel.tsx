'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/shared/config/store';

export function SearchPanel() {
  const {
    searchQuery,
    setSearchQuery,
    propertyTypeFilter,
    setPropertyTypeFilter,
    priceRange,
    setPriceRange,
  } = useAppStore();

  const handleSearch = () => {
    // 검색 실행 (이미 필터링되므로 추가 동작 불필요)
    console.log('Searching for:', searchQuery);
  };

  const handlePropertyTypeToggle = (type: 'apartment' | 'officetel', checked: boolean) => {
    if (checked) {
      setPropertyTypeFilter([...propertyTypeFilter, type]);
    } else {
      setPropertyTypeFilter(propertyTypeFilter.filter(t => t !== type));
    }
  };

  return (
    <div className="absolute top-4 left-4 w-96 bg-white rounded-lg shadow-lg p-4 space-y-4 z-10">
      {/* 검색바 */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="주소, 건물명으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} size="icon">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* 필터 영역 */}
      <div className="space-y-4 pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <SlidersHorizontal className="w-4 h-4" />
          <span>필터</span>
        </div>

        {/* 매물 유형 */}
        <div className="space-y-2">
          <Label>매물 유형</Label>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="apartment"
                checked={propertyTypeFilter.includes('apartment')}
                onCheckedChange={(checked) => 
                  handlePropertyTypeToggle('apartment', checked as boolean)
                }
              />
              <label
                htmlFor="apartment"
                className="cursor-pointer select-none"
              >
                아파트
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="officetel"
                checked={propertyTypeFilter.includes('officetel')}
                onCheckedChange={(checked) => 
                  handlePropertyTypeToggle('officetel', checked as boolean)
                }
              />
              <label
                htmlFor="officetel"
                className="cursor-pointer select-none"
              >
                오피스텔
              </label>
            </div>
          </div>
        </div>

        {/* 전세가 범위 */}
        <div className="space-y-2">
          <Label>전세가 범위</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="최소 (억)"
                value={priceRange[0] / 100000000 || ''}
                onChange={(e) => {
                  const value = Number(e.target.value) * 100000000;
                  setPriceRange([value || 0, priceRange[1]]);
                }}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="최대 (억)"
                value={priceRange[1] === Infinity ? '' : priceRange[1] / 100000000}
                onChange={(e) => {
                  const value = Number(e.target.value) * 100000000;
                  setPriceRange([priceRange[0], value || Infinity]);
                }}
              />
            </div>
          </div>
        </div>

        {/* 필터 초기화 */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setPropertyTypeFilter(['apartment', 'officetel']);
            setPriceRange([0, Infinity]);
          }}
        >
          필터 초기화
        </Button>
      </div>
    </div>
  );
}

