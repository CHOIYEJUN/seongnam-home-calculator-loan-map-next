import seongnamBoundaryData from './seongnam-boundary.json';

export interface BoundaryFeature {
  type: 'Feature';
  properties: {
    name: string;
    nameEn: string;
    sido: string;
    source: string;
    osmId: string;
    license: string;
    retrievedAt: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

/** 성남시 행정 경계 (OpenStreetMap, ODbL) */
export const seongnamBoundary = seongnamBoundaryData as BoundaryFeature;
