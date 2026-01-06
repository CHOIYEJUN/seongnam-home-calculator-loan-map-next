'use client';

import { PropertyUnit } from '@/shared/types/property';
import { formatCurrency } from '@/shared/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Building2, MapPin, Home, Calculator } from 'lucide-react';
import { useAppStore } from '@/shared/config/store';

export function PropertyPanel() {
  const { selectedProperty, selectedUnit, setSelectedUnit, setCurrentView } = useAppStore();

  const handleCalculateLoan = () => {
    if (selectedProperty && selectedUnit) {
      setCurrentView('calculator');
    }
  };

  if (!selectedProperty) {
    return (
      <div className="absolute top-4 right-4 w-96 bg-white rounded-lg shadow-lg p-6 z-10">
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Building2 className="w-16 h-16 mb-4 opacity-30" />
          <p>지도에서 매물을 선택하거나</p>
          <p>검색해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 w-96 bg-white rounded-lg shadow-lg overflow-hidden z-10 flex flex-col" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
      {/* 매물 정보 헤더 */}
      <div className="bg-primary text-primary-foreground p-4 space-y-2 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3>{selectedProperty.name}</h3>
            <div className="flex items-center gap-1 mt-1 opacity-90">
              <MapPin className="w-4 h-4" />
              <p className="text-sm">{selectedProperty.address}</p>
            </div>
          </div>
          <Badge variant="secondary" className="ml-2">
            {selectedProperty.type === 'apartment' ? '아파트' : '오피스텔'}
          </Badge>
        </div>
      </div>

      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="overflow-y-auto flex-1">
        {/* 평형 선택 */}
        <div className="p-4 border-b border-border">
          <Label className="mb-3 block">평형 선택</Label>
          <div className="grid grid-cols-2 gap-2">
            {selectedProperty.units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => setSelectedUnit(unit)}
                className={`p-3 border rounded-md transition-all ${
                  selectedUnit?.id === unit.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50 hover:bg-accent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  <span>{unit.area}평</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 선택된 평형 정보 */}
        {selectedUnit && (
          <div className="p-4 space-y-4">
            <div>
              <h4 className="mb-3">매물 정보</h4>
              <div className="space-y-3">
                <Card className="p-3 bg-accent/30">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">공시지가</span>
                    <span>{formatCurrency(selectedUnit.officialPrice)}</span>
                  </div>
                </Card>
                <Card className="p-3 bg-accent/30">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">시세</span>
                    <span>{formatCurrency(selectedUnit.marketPrice)}</span>
                  </div>
                </Card>
                <Card className="p-3 bg-primary/10 border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">전세가</span>
                    <span className="text-primary">
                      {formatCurrency(selectedUnit.jeonsePrice)}
                    </span>
                  </div>
                </Card>
              </div>
            </div>

            {/* 대출 계산 버튼 */}
            <Button
              onClick={handleCalculateLoan}
              className="w-full"
              size="lg"
            >
              <Calculator className="w-4 h-4 mr-2" />
              전세 대출 한도 계산하기
            </Button>

            {/* 추가 정보 */}
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                * 대출 한도와 금리는 은행 및 주택공사 데이터를 기준으로 예측됩니다.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                * 실제 대출 조건은 개인 신용도와 소득에 따라 달라질 수 있습니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

