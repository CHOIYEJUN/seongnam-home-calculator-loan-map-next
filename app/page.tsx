'use client';

import { useEffect } from 'react';
import { Header } from '@/widgets/header/ui/header';
import { MapView } from '@/widgets/map-view/ui/map-view';
import { LoanCalculator } from '@/widgets/calculator-view/ui/loan-calculator';
import { useAppStore } from '@/shared/config/store';
import { loadKakaoMapScript } from '@/shared/lib/kakao-map';

export default function HomePage() {
  const { currentView } = useAppStore();

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || '';
    if (apiKey) {
      loadKakaoMapScript(apiKey);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      
      {currentView === 'map' ? (
        <MapView />
      ) : (
        <div className="flex-1 overflow-auto">
          <LoanCalculator />
        </div>
      )}
    </div>
  );
}
