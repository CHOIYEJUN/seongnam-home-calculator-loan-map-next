'use client';

import Script from 'next/script';

export function KakaoMapScript() {
  return (
    <Script
      src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`}
      strategy="afterInteractive"
      onLoad={() => {
        window.kakao.maps.load(() => {
          window.dispatchEvent(new Event('kakao-map-ready'));
        });
      }}
    />
  );
}
