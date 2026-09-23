// 새 스테이지는 이 배열에 같은 형식의 객체를 추가하면 됩니다.
export const STAGES = [
  {
    id: 1,
    name: "달빛 골목",
    width: 3600,
    spawn: { x: 110, y: 390 },
    exit: { x: 3440, y: 326, width: 70, height: 114 },
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
