export interface KakaoPolygonStyle {
  strokeWeight: number;
  strokeColor: string;
  strokeOpacity: number;
  fillColor: string;
  fillOpacity: number;
}

const DEFAULT_STYLE: KakaoPolygonStyle = {
  strokeWeight: 3,
  strokeColor: '#1D4ED8',
  strokeOpacity: 0.9,
  fillColor: '#3B82F6',
  fillOpacity: 0.1,
};

type Ring = number[][];

function toLatLngs(ring: Ring) {
  return ring.map(
    ([lng, lat]) => new window.kakao.maps.LatLng(lat, lng)
  );
}

function polygonRings(
  geometry: { type: string; coordinates: number[][][] | number[][][][] }
): Ring[][] {
  if (geometry.type === 'Polygon') {
    return [geometry.coordinates as Ring[]];
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates as Ring[][];
  }
  return [];
}

/** GeoJSON Polygon/MultiPolygon을 카카오맵 Polygon 오버레이로 그림 */
export function overlayGeoJsonOnKakaoMap(
  map: any,
  feature: { geometry: { type: string; coordinates: number[][][] | number[][][][] } },
  style: Partial<KakaoPolygonStyle> = {}
) {
  const merged = { ...DEFAULT_STYLE, ...style };
  const polygons = polygonRings(feature.geometry).map((rings) => {
    const polygon = new window.kakao.maps.Polygon({
      path: rings.map(toLatLngs),
      strokeWeight: merged.strokeWeight,
      strokeColor: merged.strokeColor,
      strokeOpacity: merged.strokeOpacity,
      strokeStyle: 'solid',
      fillColor: merged.fillColor,
      fillOpacity: merged.fillOpacity,
      zIndex: 0,
    });
    polygon.setMap(map);
    return polygon;
  });

  return polygons;
}
