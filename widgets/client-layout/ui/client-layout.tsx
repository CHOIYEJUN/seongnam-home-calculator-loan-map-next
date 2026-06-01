'use client';

import { useAppStore } from '@/shared/config/store';
import { Header } from '@/widgets/header/ui/header';
import { MapView } from '@/widgets/map-view/ui/map-view';
import { LoanCalculator } from '@/widgets/calculator-view/ui/loan-calculator';

export function ClientLayout() {
  const { currentView } = useAppStore();

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
