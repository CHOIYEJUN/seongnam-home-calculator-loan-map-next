'use client';

import { useEffect, useRef, useState } from 'react';
import { Property } from '@/shared/types/property';
import { useAppStore } from '@/shared/config/store';

interface KakaoMapProps {
  properties: Property[];
}

declare global {
  interface Window {
    kakao: any;
  }
}

export function KakaoMap({ properties }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { setSelectedProperty, selectedProperty } = useAppStore();

  // WO-07: setInterval 폴링 제거 → kakao-map-ready 이벤트 방식
  useEffect(() => {
    const onReady = () => setIsMapLoaded(true);

    if (window.kakao?.maps) {
      // 이미 로드된 경우
      onReady();
    } else {
      window.addEventListener('kakao-map-ready', onReady);
    }

    return () => {
      window.removeEventListener('kakao-map-ready', onReady);
    };
  }, []);

  // WO-01 Effect 1: 지도 + 마커 초기화 (selectedProperty 제거)
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    // 지도 초기화 - 성남시 중심
    const mapOption = {
      center: new window.kakao.maps.LatLng(37.4201, 127.1262),
      level: 6
    };

    const map = new window.kakao.maps.Map(mapRef.current, mapOption);
    mapInstanceRef.current = map;

    // 마커 생성
    const markers = properties.map((property) => {
      const markerPosition = new window.kakao.maps.LatLng(property.lat, property.lng);

      // 커스텀 마커 이미지 설정
      const imageSrc = property.type === 'apartment'
        ? '/assets/image/icon/apt-pin-icon.png'
        : '/assets/image/icon/opst-pin-icon.png';
      const imageSize = new window.kakao.maps.Size(46, 47);
      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        title: property.name,
        image: markerImage,
        clickable: true
      });

      marker.setMap(map);

      // 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:8px 12px;font-size:13px;white-space:nowrap;">
          <strong>${property.name}</strong><br/>
          <span style="color:#666;">${property.type === 'apartment' ? '아파트' : '오피스텔'}</span>
        </div>`
      });

      // 마커 호버 이벤트
      window.kakao.maps.event.addListener(marker, 'mouseover', () => {
        infowindow.open(map, marker);
      });

      window.kakao.maps.event.addListener(marker, 'mouseout', () => {
        infowindow.close();
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedProperty(property);
        map.setCenter(markerPosition);
        map.setLevel(4);
      });

      return marker;
    });

    markersRef.current = markers;

    return () => {
      markers.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      mapInstanceRef.current = null;
    };
  }, [isMapLoaded, properties, setSelectedProperty]);

  // WO-01 Effect 2: 선택된 매물로 카메라 이동만
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedProperty) return;

    const position = new window.kakao.maps.LatLng(selectedProperty.lat, selectedProperty.lng);
    mapInstanceRef.current.setCenter(position);
    mapInstanceRef.current.setLevel(4);
  }, [selectedProperty]);

  return (
    <div ref={mapRef} className="w-full h-full absolute inset-0">
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}
