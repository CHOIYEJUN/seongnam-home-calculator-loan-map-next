'use client';

import { create } from 'zustand';
import { Property, PropertyUnit } from '../types/property';
import { LoanProduct, TargetGroup } from '../types/loan';

type LoanSortKey = 'rateAsc' | 'rateDesc' | 'amountDesc' | 'amountAsc' | 'providerAsc';

interface AppState {
  // View state
  currentView: 'map' | 'calculator';
  setCurrentView: (view: 'map' | 'calculator') => void;

  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Filter state
  propertyTypeFilter: ('apartment' | 'officetel')[];
  setPropertyTypeFilter: (types: ('apartment' | 'officetel')[]) => void;

  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;

  // Property selection
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;

  selectedUnit: PropertyUnit | null;
  setSelectedUnit: (unit: PropertyUnit | null) => void;

  // Loan calculator filter & sort
  loanSortKey: LoanSortKey;
  setLoanSortKey: (key: LoanSortKey) => void;

  loanSearchQuery: string;
  setLoanSearchQuery: (q: string) => void;

  loanTargetFilter: TargetGroup | 'all';
  setLoanTargetFilter: (g: TargetGroup | 'all') => void;

  // Product comparison
  compareProducts: LoanProduct[];
  addCompareProduct: (p: LoanProduct) => void;
  removeCompareProduct: (id: string) => void;
  clearCompareProducts: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // View state
  currentView: 'map',
  setCurrentView: (view) => set({ currentView: view }),

  // Search state
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Filter state
  propertyTypeFilter: ['apartment', 'officetel'],
  setPropertyTypeFilter: (types) => set({ propertyTypeFilter: types }),

  priceRange: [0, Infinity],
  setPriceRange: (range) => set({ priceRange: range }),

  // Property selection
  selectedProperty: null,
  setSelectedProperty: (property) => {
    set({ selectedProperty: property });
    // 첫 번째 평형을 자동 선택
    if (property && property.units.length > 0) {
      set({ selectedUnit: property.units[0] });
    } else {
      set({ selectedUnit: null });
    }
  },

  selectedUnit: null,
  setSelectedUnit: (unit) => set({ selectedUnit: unit }),

  // Loan calculator filter & sort
  loanSortKey: 'rateAsc',
  setLoanSortKey: (key) => set({ loanSortKey: key }),

  loanSearchQuery: '',
  setLoanSearchQuery: (q) => set({ loanSearchQuery: q }),

  loanTargetFilter: 'all',
  setLoanTargetFilter: (g) => set({ loanTargetFilter: g }),

  // Product comparison
  compareProducts: [],
  addCompareProduct: (p) =>
    set((state) => {
      if (state.compareProducts.length >= 3) return state;
      if (state.compareProducts.find((x) => x.id === p.id)) return state;
      return { compareProducts: [...state.compareProducts, p] };
    }),
  removeCompareProduct: (id) =>
    set((state) => ({
      compareProducts: state.compareProducts.filter((p) => p.id !== id),
    })),
  clearCompareProducts: () => set({ compareProducts: [] }),
}));
