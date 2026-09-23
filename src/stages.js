// 새 스테이지는 이 배열에 같은 형식의 객체를 추가하면 됩니다.
export const STAGES = [
  {
    id: 1,
    name: "달빛 골목",
    width: 3600,
    spawn: { x: 110, y: 390 },
    exit: { x: 3440, y: 326, width: 70, height: 114 },
    clearBonus: 1000,
    enemies: [
      { x: 2050, y: 376, width: 42, height: 44, minX: 1970, maxX: 2290, speed: 90 },
    ],
    collectibles: [
      { x: 390, y: 420, width: 24, height: 24, points: 100 },
      { x: 805, y: 380, width: 24, height: 24, points: 100 },
      { x: 1115, y: 315, width: 24, height: 24, points: 150 },
      { x: 1450, y: 375, width: 24, height: 24, points: 100 },
      { x: 1760, y: 285, width: 24, height: 24, points: 200 },
      { x: 2200, y: 370, width: 24, height: 24, points: 150 },
      { x: 2490, y: 310, width: 24, height: 24, points: 200 },
      { x: 2748, y: 245, width: 24, height: 24, points: 250 },
      { x: 3160, y: 345, width: 24, height: 24, points: 150 },
    ],
    platforms: [
      { x: 0, y: 470, width: 620, height: 90 },
      { x: 700, y: 430, width: 260, height: 110 },
      { x: 1030, y: 365, width: 210, height: 30 },
      { x: 1310, y: 425, width: 300, height: 115 },
      { x: 1680, y: 335, width: 190, height: 30 },
      { x: 1930, y: 420, width: 410, height: 120 },
      { x: 2410, y: 360, width: 190, height: 30 },
      { x: 2670, y: 295, width: 180, height: 30 },
      { x: 2920, y: 395, width: 680, height: 145 },
    ],
    skyline: [160, 105, 190, 135, 220, 95, 175, 125, 200, 115, 155, 210, 100, 185, 140],
  },
];
