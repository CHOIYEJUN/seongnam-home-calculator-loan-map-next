export const loadKakaoMapScript = (apiKey: string) => {
  if (typeof window === 'undefined') return;
  
  if (document.getElementById('kakao-map-script')) {
    return;
  }

  const script = document.createElement('script');
  script.id = 'kakao-map-script';
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
  script.async = true;

  document.head.appendChild(script);
};

