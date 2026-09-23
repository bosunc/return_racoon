# RETURN RACCOON

1990년대 한국 PC/아케이드 게임 감성의 HTML5 Canvas 플랫폼 액션 프로토타입입니다.

## 실행

ES module을 사용하므로 저장소 루트에서 간단한 정적 서버를 실행합니다.

```bash
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 열고 방향키 **←/→**로 이동, **Space**로 점프합니다.

## 스테이지 확장

`src/stages.js`의 `STAGES` 배열에 맵 크기, 시작 위치, 출구, 발판과 배경 데이터를 가진 객체를 추가할 수 있습니다. 렌더링·물리 로직은 `src/game.js`에 분리되어 있습니다.
