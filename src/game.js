import { STAGES } from "./stages.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const restartButton = document.querySelector("#restart-button");
ctx.imageSmoothingEnabled = false;

const stage = STAGES[0];
const keys = new Set();
const player = { x: 0, y: 0, width: 38, height: 54, vx: 0, vy: 0, grounded: false, facing: 1 };
let cameraX = 0;
let gameState = "playing";
let lives = 3;
let score = 0;
let enemies = [];
let collectibles = [];
let lastTime = performance.now();

const GRAVITY = 1900;
const SPEED = 330;
const JUMP = 720;

function resetPlayer() {
  Object.assign(player, { ...stage.spawn, vx: 0, vy: 0, grounded: false });
  cameraX = Math.max(0, player.x - 180);
  keys.clear();
}

function startGame() {
  lives = 3;
  score = 0;
  gameState = "playing";
  enemies = stage.enemies.map((enemy) => ({ ...enemy, direction: 1 }));
  collectibles = stage.collectibles.map((item, index) => ({ ...item, id: index, collected: false }));
  restartButton.hidden = true;
  resetPlayer();
  canvas.focus();
}

function loseLife() {
  if (gameState !== "playing") return;
  lives -= 1;
  if (lives === 0) {
    gameState = "gameover";
    player.vx = 0;
    player.vy = 0;
    restartButton.hidden = false;
  } else {
    resetPlayer();
  }
}

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function update(dt) {
  if (gameState !== "playing") return;
  for (const enemy of enemies) {
    enemy.x += enemy.speed * enemy.direction * dt;
    if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) {
      enemy.x = Math.max(enemy.minX, Math.min(enemy.maxX - enemy.width, enemy.x));
      enemy.direction *= -1;
    }
  }

  const direction = (keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0);
  player.vx = direction * SPEED;
  if (direction) player.facing = direction;
  player.x = Math.max(0, Math.min(stage.width - player.width, player.x + player.vx * dt));

  const previousBottom = player.y + player.height;
  player.vy += GRAVITY * dt;
  player.y += player.vy * dt;
  player.grounded = false;
  for (const platform of stage.platforms) {
    const newBottom = player.y + player.height;
    const horizontal = player.x + player.width > platform.x && player.x < platform.x + platform.width;
    if (horizontal && player.vy >= 0 && previousBottom <= platform.y && newBottom >= platform.y) {
      player.y = platform.y - player.height;
      player.vy = 0;
      player.grounded = true;
    }
  }
  if (player.y > canvas.height + 180) {
    loseLife();
    return;
  }
  if (enemies.some((enemy) => overlaps(player, enemy))) {
    loseLife();
    return;
  }
  for (const item of collectibles) {
    if (!item.collected && overlaps(player, item)) {
      item.collected = true;
      score += item.points;
    }
  }
  if (overlaps(player, stage.exit)) {
    score += stage.clearBonus;
    gameState = "cleared";
    player.vx = 0;
  }

  const target = player.x - canvas.width * 0.38;
  cameraX += (Math.max(0, Math.min(stage.width - canvas.width, target)) - cameraX) * Math.min(1, dt * 6);
}

function rect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h); }

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#17163d"); gradient.addColorStop(1, "#4a2457");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
  rect(760 - cameraX * .04, 62, 96, 96, "#f8d98b");
  rect(760 - cameraX * .04, 62, 20, 18, "#e8b875"); rect(814 - cameraX * .04, 116, 27, 22, "#e8b875");
  for (let i = 0; i < 28; i++) rect((i * 157 + 43 - cameraX * .08) % 1100, 40 + (i * 67) % 210, 4, 4, i % 3 ? "#d8d2ef" : "#51d7cc");
  const base = 405;
  stage.skyline.forEach((h, i) => {
    const x = i * 110 - (cameraX * .22) % 1650;
    rect(x, base - h, 84, h + 150, "#252047");
    for (let wy = base - h + 25; wy < base - 20; wy += 28) for (let wx = x + 14; wx < x + 70; wx += 25) rect(wx, wy, 8, 11, (i + wy + wx) % 3 ? "#62446d" : "#e9a955");
  });
  rect(0, 450, canvas.width, 90, "#101128");
}

function drawPlatform(p) {
  const x = p.x - cameraX;
  rect(x, p.y, p.width, p.height, "#34294c");
  rect(x, p.y, p.width, 10, "#51d1c4"); rect(x, p.y + 10, p.width, 7, "#267b83");
  for (let bx = x + 8; bx < x + p.width; bx += 42) {
    rect(bx, p.y + 29, 29, 15, "#4a3658"); rect(bx + 4, p.y + 33, 21, 3, "#664667");
  }
  if (p.height > 70) for (let bx = x + 29; bx < x + p.width; bx += 42) rect(bx, p.y + 57, 29, 15, "#4a3658");
}

function drawExit() {
  const x = stage.exit.x - cameraX, y = stage.exit.y;
  rect(x - 10, y - 22, 90, 136, "#1a1630"); rect(x, y, 70, 114, "#6a3565"); rect(x + 8, y + 8, 54, 106, "#18162f");
  rect(x + 23, y - 44, 24, 24, "#ffce6b"); rect(x + 28, y - 39, 14, 14, "#fff0ad");
  ctx.fillStyle = "#ff598b"; ctx.font = "bold 12px monospace"; ctx.fillText("EXIT", x + 8, y - 58);
}

function drawCollectible(item) {
  if (item.collected) return;
  const x = item.x - cameraX, y = item.y;
  rect(x + 8, y, 8, 4, "#fff4b0"); rect(x + 4, y + 4, 16, 4, "#ffcf65");
  rect(x, y + 8, 24, 8, "#ff9c55"); rect(x + 4, y + 16, 16, 4, "#e9507f");
  rect(x + 8, y + 20, 8, 4, "#8b3d76"); rect(x + 8, y + 8, 8, 8, "#fff1a0");
}

function drawEnemy(enemy) {
  const x = enemy.x - cameraX, y = enemy.y;
  rect(x + 5, y + 7, 32, 27, "#744481"); rect(x + 1, y + 14, 40, 14, "#50315f");
  rect(x + 7, y + 2, 9, 10, "#a85d86"); rect(x + 27, y + 2, 9, 10, "#a85d86");
  rect(x + (enemy.direction > 0 ? 25 : 9), y + 15, 7, 6, "#f7e9b5");
  rect(x + (enemy.direction > 0 ? 29 : 9), y + 16, 3, 3, "#17142d");
  rect(x + 5, y + 34, 12, 10, "#51d1c4"); rect(x + 26, y + 34, 12, 10, "#51d1c4");
}

function drawPlayer() {
  const x = player.x - cameraX, y = player.y, flip = player.facing;
  rect(x + 5, y + 5, 28, 35, "#8d6b72"); rect(x + 1, y + 11, 36, 18, "#6a4c61");
  rect(x + (flip > 0 ? 21 : 8), y + 13, 8, 7, "#f5d5ad"); rect(x + (flip > 0 ? 25 : 8), y + 14, 3, 3, "#16152d");
  rect(x + 6, y + 1, 9, 10, "#b37d73"); rect(x + 24, y + 1, 9, 10, "#b37d73");
  rect(x + 4, y + 31, 30, 12, "#e45078"); rect(x + 7, y + 43, 10, 11, "#e5a849"); rect(x + 23, y + 43, 10, 11, "#e5a849");
  rect(x + (flip > 0 ? -8 : 31), y + 23, 12, 8, "#6a4c61"); rect(x + (flip > 0 ? -13 : 38), y + 20, 7, 7, "#b18a83");
}

function drawHUD() {
  ctx.fillStyle = "#111127dd"; ctx.fillRect(20, 18, 500, 50); ctx.strokeStyle = "#584b73"; ctx.strokeRect(20.5, 18.5, 500, 50);
  ctx.fillStyle = "#ff5a8c"; ctx.font = "bold 16px monospace"; ctx.fillText("STAGE 1", 37, 49);
  ctx.fillStyle = "#f9e8ba"; ctx.font = "bold 14px monospace"; ctx.fillText(`LIFE ${lives}`, 168, 48);
  ctx.fillStyle = "#53d8ca"; ctx.fillText(`SCORE ${String(score).padStart(5, "0")}`, 285, 48);
  const progress = Math.min(1, player.x / stage.exit.x);
  rect(700, 37, 220, 8, "#292542"); rect(700, 37, 220 * progress, 8, "#4dd7c9"); rect(696 + 220 * progress, 31, 8, 20, "#fff0bd");
}

function drawClear() {
  ctx.fillStyle = "#0a0920cc"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center"; ctx.fillStyle = "#ff578c"; ctx.font = "bold 58px monospace"; ctx.fillText("STAGE CLEAR", canvas.width / 2 + 4, 238 + 5);
  ctx.fillStyle = "#fff0bd"; ctx.fillText("STAGE CLEAR", canvas.width / 2, 238);
  ctx.fillStyle = "#53d8ca"; ctx.font = "bold 18px monospace"; ctx.fillText(`SCORE ${score}   LIFE ${lives}`, canvas.width / 2, 293);
  ctx.fillStyle = "#aaa0bf"; ctx.font = "bold 14px monospace"; ctx.fillText(`EXIT BONUS +${stage.clearBonus}`, canvas.width / 2, 333); ctx.fillText("ENTER — 다시 시작", canvas.width / 2, 370); ctx.textAlign = "start";
}

function drawGameOver() {
  ctx.fillStyle = "#0a0920df"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center"; ctx.fillStyle = "#551d58"; ctx.font = "bold 64px monospace"; ctx.fillText("GAME OVER", canvas.width / 2 + 5, 237);
  ctx.fillStyle = "#ff578c"; ctx.fillText("GAME OVER", canvas.width / 2, 232);
  ctx.fillStyle = "#fff0bd"; ctx.font = "bold 20px monospace"; ctx.fillText(`FINAL SCORE ${score}`, canvas.width / 2, 292);
  ctx.fillStyle = "#aaa0bf"; ctx.font = "bold 14px monospace"; ctx.fillText("ENTER 또는 아래 버튼으로 다시 시작", canvas.width / 2, 337); ctx.textAlign = "start";
}

function render() {
  drawBackground();
  stage.platforms.forEach(drawPlatform);
  drawExit();
  collectibles.forEach(drawCollectible);
  enemies.forEach(drawEnemy);
  drawPlayer();
  drawHUD();
  if (gameState === "cleared") drawClear();
  if (gameState === "gameover") drawGameOver();
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 1 / 30); lastTime = now;
  update(dt); render(); requestAnimationFrame(loop);
}

addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) event.preventDefault();
  keys.add(event.code);
  if (event.code === "Space" && player.grounded && gameState === "playing") { player.vy = -JUMP; player.grounded = false; }
  if (event.code === "Enter" && gameState !== "playing") startGame();
});
addEventListener("keyup", (event) => keys.delete(event.code));
canvas.addEventListener("pointerdown", () => canvas.focus());
restartButton.addEventListener("click", startGame);
startGame(); requestAnimationFrame(loop);
