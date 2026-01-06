import { Property } from '@/shared/types/property';

export const mockProperties: Property[] = [
  // 분당구 - 판교/삼평동 지역
  {
    id: '1',
    name: '판교원마을푸르지오',
    address: '경기도 성남시 분당구 삼평동 681',
    type: 'apartment',
    lat: 37.4021,
    lng: 127.1084,
    units: [
      { id: '1-1', propertyId: '1', area: 24, officialPrice: 450000000, marketPrice: 850000000, jeonsePrice: 600000000 },
      { id: '1-2', propertyId: '1', area: 33, officialPrice: 550000000, marketPrice: 1100000000, jeonsePrice: 780000000 },
      { id: '1-3', propertyId: '1', area: 42, officialPrice: 650000000, marketPrice: 1350000000, jeonsePrice: 950000000 },
    ]
  },
  {
    id: '2',
    name: '판교역 코오롱하늘채',
    address: '경기도 성남시 분당구 백현동 532',
    type: 'apartment',
    lat: 37.3951,
    lng: 127.1106,
    units: [
      { id: '2-1', propertyId: '2', area: 29, officialPrice: 480000000, marketPrice: 920000000, jeonsePrice: 650000000 },
      { id: '2-2', propertyId: '2', area: 36, officialPrice: 580000000, marketPrice: 1200000000, jeonsePrice: 850000000 },
      { id: '2-3', propertyId: '2', area: 49, officialPrice: 720000000, marketPrice: 1550000000, jeonsePrice: 1100000000 },
    ]
  },
  {
    id: '3',
    name: '판교 알파돔시티',
    address: '경기도 성남시 분당구 백현동 541',
    type: 'officetel',
    lat: 37.3947,
    lng: 127.1115,
    units: [
      { id: '3-1', propertyId: '3', area: 18, officialPrice: 210000000, marketPrice: 360000000, jeonsePrice: 250000000 },
      { id: '3-2', propertyId: '3', area: 23, officialPrice: 260000000, marketPrice: 430000000, jeonsePrice: 300000000 },
      { id: '3-3', propertyId: '3', area: 30, officialPrice: 320000000, marketPrice: 520000000, jeonsePrice: 360000000 },
    ]
  },
  {
    id: '4',
    name: '운중동 힐스테이트',
    address: '경기도 성남시 분당구 운중동 910',
    type: 'apartment',
    lat: 37.3832,
    lng: 127.0987,
    units: [
      { id: '4-1', propertyId: '4', area: 27, officialPrice: 460000000, marketPrice: 880000000, jeonsePrice: 620000000 },
      { id: '4-2', propertyId: '4', area: 34, officialPrice: 550000000, marketPrice: 1050000000, jeonsePrice: 740000000 },
      { id: '4-3', propertyId: '4', area: 40, officialPrice: 630000000, marketPrice: 1250000000, jeonsePrice: 880000000 },
    ]
  },

  // 분당구 - 서현/수내동 지역
  {
    id: '5',
    name: '분당서현역 푸르지오시티',
    address: '경기도 성남시 분당구 서현동 255',
    type: 'apartment',
    lat: 37.3838,
    lng: 127.1233,
    units: [
      { id: '5-1', propertyId: '5', area: 26, officialPrice: 420000000, marketPrice: 780000000, jeonsePrice: 550000000 },
      { id: '5-2', propertyId: '5', area: 34, officialPrice: 520000000, marketPrice: 980000000, jeonsePrice: 690000000 },
      { id: '5-3', propertyId: '5', area: 43, officialPrice: 620000000, marketPrice: 1180000000, jeonsePrice: 830000000 },
    ]
  },
  {
    id: '6',
    name: '수내역 래미안',
    address: '경기도 성남시 분당구 수내동 48',
    type: 'apartment',
    lat: 37.3847,
    lng: 127.1021,
    units: [
      { id: '6-1', propertyId: '6', area: 25, officialPrice: 400000000, marketPrice: 750000000, jeonsePrice: 530000000 },
      { id: '6-2', propertyId: '6', area: 32, officialPrice: 490000000, marketPrice: 920000000, jeonsePrice: 650000000 },
      { id: '6-3', propertyId: '6', area: 39, officialPrice: 580000000, marketPrice: 1100000000, jeonsePrice: 780000000 },
    ]
  },
  {
    id: '7',
    name: '서현역 센트럴타워',
    address: '경기도 성남시 분당구 서현동 268',
    type: 'officetel',
    lat: 37.3856,
    lng: 127.1247,
    units: [
      { id: '7-1', propertyId: '7', area: 16, officialPrice: 190000000, marketPrice: 340000000, jeonsePrice: 240000000 },
      { id: '7-2', propertyId: '7', area: 21, officialPrice: 240000000, marketPrice: 410000000, jeonsePrice: 290000000 },
      { id: '7-3', propertyId: '7', area: 28, officialPrice: 300000000, marketPrice: 500000000, jeonsePrice: 350000000 },
    ]
  },

  // 분당구 - 야탑/이매동 지역
  {
    id: '8',
    name: '야탑역 센트럴파크',
    address: '경기도 성남시 분당구 야탑동 353',
    type: 'officetel',
    lat: 37.4113,
    lng: 127.1279,
    units: [
      { id: '8-1', propertyId: '8', area: 15, officialPrice: 180000000, marketPrice: 320000000, jeonsePrice: 220000000 },
      { id: '8-2', propertyId: '8', area: 20, officialPrice: 220000000, marketPrice: 380000000, jeonsePrice: 260000000 },
      { id: '8-3', propertyId: '8', area: 25, officialPrice: 270000000, marketPrice: 450000000, jeonsePrice: 310000000 },
    ]
  },
  {
    id: '9',
    name: '야탑 SK뷰',
    address: '경기도 성남시 분당구 야탑동 365',
    type: 'apartment',
    lat: 37.4123,
    lng: 127.1302,
    units: [
      { id: '9-1', propertyId: '9', area: 24, officialPrice: 360000000, marketPrice: 680000000, jeonsePrice: 480000000 },
      { id: '9-2', propertyId: '9', area: 30, officialPrice: 430000000, marketPrice: 820000000, jeonsePrice: 580000000 },
      { id: '9-3', propertyId: '9', area: 37, officialPrice: 510000000, marketPrice: 980000000, jeonsePrice: 690000000 },
    ]
  },
  {
    id: '10',
    name: '이매동 e편한세상',
    address: '경기도 성남시 분당구 이매동 24',
    type: 'apartment',
    lat: 37.3987,
    lng: 127.1321,
    units: [
      { id: '10-1', propertyId: '10', area: 23, officialPrice: 350000000, marketPrice: 660000000, jeonsePrice: 470000000 },
      { id: '10-2', propertyId: '10', area: 31, officialPrice: 430000000, marketPrice: 810000000, jeonsePrice: 570000000 },
      { id: '10-3', propertyId: '10', area: 44, officialPrice: 540000000, marketPrice: 1020000000, jeonsePrice: 720000000 },
    ]
  },

  // 중원구 지역
  {
    id: '11',
    name: '성남중앙 e편한세상',
    address: '경기도 성남시 중원구 상대원동 190',
    type: 'apartment',
    lat: 37.4330,
    lng: 127.1371,
    units: [
      { id: '11-1', propertyId: '11', area: 25, officialPrice: 350000000, marketPrice: 650000000, jeonsePrice: 460000000 },
      { id: '11-2', propertyId: '11', area: 34, officialPrice: 430000000, marketPrice: 800000000, jeonsePrice: 560000000 },
      { id: '11-3', propertyId: '11', area: 45, officialPrice: 520000000, marketPrice: 980000000, jeonsePrice: 690000000 },
    ]
  },
  {
    id: '12',
    name: '모란역 래미안',
    address: '경기도 성남시 중원구 성남동 3496',
    type: 'apartment',
    lat: 37.4343,
    lng: 127.1292,
    units: [
      { id: '12-1', propertyId: '12', area: 28, officialPrice: 380000000, marketPrice: 700000000, jeonsePrice: 490000000 },
      { id: '12-2', propertyId: '12', area: 36, officialPrice: 460000000, marketPrice: 850000000, jeonsePrice: 600000000 },
      { id: '12-3', propertyId: '12', area: 42, officialPrice: 540000000, marketPrice: 1000000000, jeonsePrice: 710000000 },
    ]
  },
  {
    id: '13',
    name: '상대원역 힐스테이트',
    address: '경기도 성남시 중원구 상대원동 159',
    type: 'apartment',
    lat: 37.4385,
    lng: 127.1425,
    units: [
      { id: '13-1', propertyId: '13', area: 26, officialPrice: 340000000, marketPrice: 630000000, jeonsePrice: 450000000 },
      { id: '13-2', propertyId: '13', area: 33, officialPrice: 410000000, marketPrice: 770000000, jeonsePrice: 540000000 },
      { id: '13-3', propertyId: '13', area: 40, officialPrice: 490000000, marketPrice: 920000000, jeonsePrice: 650000000 },
    ]
  },
  {
    id: '14',
    name: '은행역 자이',
    address: '경기도 성남시 중원구 은행동 4978',
    type: 'apartment',
    lat: 37.4415,
    lng: 127.1488,
    units: [
      { id: '14-1', propertyId: '14', area: 24, officialPrice: 330000000, marketPrice: 620000000, jeonsePrice: 440000000 },
      { id: '14-2', propertyId: '14', area: 32, officialPrice: 400000000, marketPrice: 750000000, jeonsePrice: 530000000 },
      { id: '14-3', propertyId: '14', area: 38, officialPrice: 470000000, marketPrice: 880000000, jeonsePrice: 620000000 },
    ]
  },
  {
    id: '15',
    name: '성남아트센터역 더샵',
    address: '경기도 성남시 중원구 여수동 89',
    type: 'apartment',
    lat: 37.4452,
    lng: 127.1379,
    units: [
      { id: '15-1', propertyId: '15', area: 27, officialPrice: 360000000, marketPrice: 680000000, jeonsePrice: 480000000 },
      { id: '15-2', propertyId: '15', area: 35, officialPrice: 440000000, marketPrice: 830000000, jeonsePrice: 580000000 },
      { id: '15-3', propertyId: '15', area: 46, officialPrice: 540000000, marketPrice: 1020000000, jeonsePrice: 720000000 },
    ]
  },
  {
    id: '16',
    name: '성남시청역 메트로시티',
    address: '경기도 성남시 중원구 여수동 167',
    type: 'officetel',
    lat: 37.4389,
    lng: 127.1336,
    units: [
      { id: '16-1', propertyId: '16', area: 14, officialPrice: 170000000, marketPrice: 300000000, jeonsePrice: 210000000 },
      { id: '16-2', propertyId: '16', area: 19, officialPrice: 210000000, marketPrice: 370000000, jeonsePrice: 260000000 },
      { id: '16-3', propertyId: '16', area: 24, officialPrice: 260000000, marketPrice: 440000000, jeonsePrice: 310000000 },
    ]
  },

  // 수정구 지역
  {
    id: '17',
    name: '신흥역 래미안',
    address: '경기도 성남시 수정구 신흥동 4368',
    type: 'apartment',
    lat: 37.4285,
    lng: 127.1401,
    units: [
      { id: '17-1', propertyId: '17', area: 23, officialPrice: 310000000, marketPrice: 580000000, jeonsePrice: 410000000 },
      { id: '17-2', propertyId: '17', area: 30, officialPrice: 370000000, marketPrice: 700000000, jeonsePrice: 490000000 },
      { id: '17-3', propertyId: '17', area: 36, officialPrice: 430000000, marketPrice: 820000000, jeonsePrice: 580000000 },
    ]
  },
  {
    id: '18',
    name: '단대오거리역 푸르지오',
    address: '경기도 성남시 수정구 단대동 268',
    type: 'apartment',
    lat: 37.4211,
    lng: 127.1289,
    units: [
      { id: '18-1', propertyId: '18', area: 22, officialPrice: 300000000, marketPrice: 560000000, jeonsePrice: 400000000 },
      { id: '18-2', propertyId: '18', area: 29, officialPrice: 360000000, marketPrice: 680000000, jeonsePrice: 480000000 },
      { id: '18-3', propertyId: '18', area: 35, officialPrice: 420000000, marketPrice: 800000000, jeonsePrice: 560000000 },
    ]
  },
  {
    id: '19',
    name: '수정역 더샵',
    address: '경기도 성남시 수정구 수진동 3312',
    type: 'apartment',
    lat: 37.4368,
    lng: 127.1458,
    units: [
      { id: '19-1', propertyId: '19', area: 25, officialPrice: 320000000, marketPrice: 600000000, jeonsePrice: 420000000 },
      { id: '19-2', propertyId: '19', area: 32, officialPrice: 390000000, marketPrice: 730000000, jeonsePrice: 510000000 },
      { id: '19-3', propertyId: '19', area: 38, officialPrice: 450000000, marketPrice: 850000000, jeonsePrice: 600000000 },
    ]
  },
  {
    id: '20',
    name: '태평역 센트럴파크',
    address: '경기도 성남시 수정구 태평동 7118',
    type: 'officetel',
    lat: 37.4188,
    lng: 127.1351,
    units: [
      { id: '20-1', propertyId: '20', area: 13, officialPrice: 160000000, marketPrice: 280000000, jeonsePrice: 200000000 },
      { id: '20-2', propertyId: '20', area: 17, officialPrice: 200000000, marketPrice: 350000000, jeonsePrice: 250000000 },
      { id: '20-3', propertyId: '20', area: 22, officialPrice: 240000000, marketPrice: 420000000, jeonsePrice: 300000000 },
    ]
  },
];

