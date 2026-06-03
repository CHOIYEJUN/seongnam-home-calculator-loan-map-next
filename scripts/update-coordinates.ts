/**
 * properties.json의 좌표를 아파트 단지명을 포함한 주소 검색으로 업데이트하는 스크립트
 *
 * 사용 방법:
 * 1. 카카오 개발자 콘솔에서 REST API 키 발급 (JavaScript 키 아님!)
 * 2. .env.local에 KAKAO_REST_API_KEY 추가
 * 3. npm run update-coordinates 실행
 *
 * 주의: 많은 API 호출이 발생하므로 하루 호출 제한을 확인하세요
 */

import * as fs from 'fs';
import * as path from 'path';

// 간단한 fetch 함수 (Node.js 18+)
const fetch = globalThis.fetch || require('node-fetch');

interface PropertyData {
  id: string;
  name: string;
  address: string;
  roadAddress: string;
  type: 'apartment' | 'officetel';
  lat: number;
  lng: number;
  buildYear: number;
  units: string[];
}

async function updateCoordinates() {
  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    console.error('❌ KAKAO_REST_API_KEY 환경 변수가 설정되지 않았습니다.');
    console.error('   .env.local 파일에 KAKAO_REST_API_KEY=your_rest_api_key를 추가하세요.');
    console.error('   주의: JavaScript 키가 아닌 REST API 키가 필요합니다!');
    process.exit(1);
  }

  const force = process.argv.includes('--force');
  const propertiesPath = path.join(process.cwd(), 'entities/property/model/properties.json');
  const properties: PropertyData[] = JSON.parse(fs.readFileSync(propertiesPath, 'utf-8'));

  // --force: 전체 재검색 / 기본: 좌표 없는 것만
  const targets = force
    ? properties
    : properties.filter(p => p.lat === 0 || p.lng === 0);

  if (targets.length === 0) {
    console.log('✅ 모든 매물에 좌표가 있습니다. 업데이트 불필요. (--force로 전체 재검색 가능)');
    return;
  }
  if (force) console.log('⚡ --force 모드: 전체 좌표 재검색');

  console.log(`📍 좌표 없는 매물 ${targets.length}개 / 전체 ${properties.length}개 업데이트...\n`);

  let updatedCount = 0;
  let errorCount = 0;

  // propertyId → index 맵
  const propMap = new Map<string, number>(properties.map((p, i) => [p.id, i]));

  for (let i = 0; i < targets.length; i++) {
    const property = targets[i];
    const progress = `[${i + 1}/${targets.length}]`;

    try {
      console.log(`${progress} 🔍 검색 중: ${property.name}...`);

      const vworldKey = process.env.VWORLD_API_KEY;
      const cleanName = property.name.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
      const guMatch = property.address.match(/(분당구|수정구|중원구)/);
      const gu = guMatch ? guMatch[1] : '성남시';
      const dongMatch = property.address.match(/(\S+동|\S+읍|\S+면)$/);
      const dong = dongMatch ? dongMatch[1] : '';

      let result: { lat: number; lng: number; address: string } | null = null;

      // 1순위: VWorld 도로명주소 API — 국토부 공식 건물 좌표 (WGS84), 가장 정확
      if (!result && vworldKey && property.roadAddress) {
        const addresses = [property.roadAddress];
        for (const addr of addresses) {
          if (result) break;
          try {
            const params = new URLSearchParams({
              service: 'address', request: 'getcoord', format: 'json',
              type: 'ROAD', key: vworldKey, address: addr,
            });
            const response = await fetch(`https://api.vworld.kr/req/address?${params}`,
              { headers: { 'User-Agent': 'seongnam-jeonse-app/1.0' } });
            if (response.ok) {
              const data = await response.json();
              if (data.response?.status === 'OK') {
                const pt = data.response.result.point;
                result = { lat: parseFloat(pt.y), lng: parseFloat(pt.x), address: addr };
              }
            }
          } catch (_) { /* 다음 시도 */ }
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // 2순위: Kakao 키워드 검색 (심사 통과 시 자동 작동 — 건물명 기반으로 정확)
      if (!result && apiKey) {
        const kakaoQueries = [`성남시 ${property.name}`, `성남시 ${cleanName}`];
        for (const q of kakaoQueries) {
          if (result) break;
          try {
            const response = await fetch(
              `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&category_group_code=AT4`,
              { headers: { Authorization: `KakaoAK ${apiKey}` } }
            );
            if (response.ok) {
              const data = await response.json();
              if (data.documents?.length > 0) {
                const doc = data.documents[0];
                result = { lat: parseFloat(doc.y), lng: parseFloat(doc.x), address: doc.address_name };
              }
            }
          } catch (_) { /* 다음 시도 */ }
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      // 3순위: Nominatim 단지명 검색 (fallback)
      if (!result) {
        const nameQueries = [
          `${property.name} ${gu} 성남시`,
          `${cleanName} ${dong} 성남시`,
        ];
        for (const q of nameQueries) {
          if (result) break;
          try {
            const params = new URLSearchParams({ q, format: 'json', limit: '3', countrycodes: 'kr', addressdetails: '1' });
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?${params}`,
              { headers: { 'User-Agent': 'seongnam-jeonse-app/1.0' } }
            );
            if (response.ok) {
              const data = await response.json();
              const building = data.find((d: any) =>
                d.addresstype === 'building' || d.type === 'apartments' || d.type === 'residential'
              ) || data[0];
              if (building) result = { lat: parseFloat(building.lat), lng: parseFloat(building.lon), address: property.address };
            }
          } catch (_) { /* 다음 시도 */ }
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      const idx = propMap.get(property.id);
      if (idx !== undefined && result) {
        properties[idx].lat = result.lat;
        properties[idx].lng = result.lng;

        console.log(`   ✅ 업데이트됨: ${property.name}`);
        console.log(`      좌표: (${result.lat}, ${result.lng})`);
        console.log(`      주소: ${result.address}\n`);

        updatedCount++;
      } else {
        console.log(`   ⚠️  검색 결과 없음: ${property.name}\n`);
        errorCount++;
      }

      // API 호출 제한 방지 (초당 2회 이하)
      await new Promise((resolve) => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`   ❌ 오류: ${property.name} - ${error}\n`);
      errorCount++;
    }
  }

  // 업데이트된 properties를 파일에 저장
  fs.writeFileSync(propertiesPath, JSON.stringify(properties, null, 2), 'utf-8');

  console.log('\n📊 업데이트 완료!');
  console.log(`   ✅ 업데이트됨: ${updatedCount}개`);
  console.log(`   ⚠️  검색 실패: ${errorCount}개`);
  console.log(`\n💾 properties.json 파일이 업데이트되었습니다.`);
}

updateCoordinates().catch(console.error);
