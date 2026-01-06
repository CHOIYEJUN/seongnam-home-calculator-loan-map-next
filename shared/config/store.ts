'use client';

import { create } from 'zustand';
import { Property, PropertyUnit } from '../types/property';

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
}));

