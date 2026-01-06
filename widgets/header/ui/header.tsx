'use client';

import { Home, Building2, Calculator } from 'lucide-react';
import { useAppStore } from '@/shared/config/store';

export function Header() {
  const { currentView, setCurrentView } = useAppStore();

  return (
    <header className="bg-white border-b border-border shadow-sm">
      {/* GNB */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          <h1 className="text-primary">성남시 전세정보</h1>
        </div>
        <nav className="flex items-center gap-6">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            공지사항
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            이용안내
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            고객센터
          </button>
        </nav>
      </div>
      
      {/* LNB */}
      <div className="flex items-center gap-2 px-6 py-3 bg-secondary/30">
        <button
          onClick={() => setCurrentView('map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            currentView === 'map'
              ? 'bg-primary text-primary-foreground'
              : 'bg-white text-foreground hover:bg-accent'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>매물 지도</span>
        </button>
        <button
          onClick={() => setCurrentView('calculator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            currentView === 'calculator'
              ? 'bg-primary text-primary-foreground'
              : 'bg-white text-foreground hover:bg-accent'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>대출 계산</span>
        </button>
      </div>
    </header>
  );
}

