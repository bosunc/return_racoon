import { STAGES } from "./stages.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const stage = STAGES[0];
const keys = new Set();
const player = { x: 0, y: 0, width: 38, height: 54, vx: 0, vy: 0, grounded: false, facing: 1 };
let cameraX = 0;
let cleared = false;
let lastTime = performance.now();

const GRAVITY = 1900;
const SPEED = 330;
const JUMP = 720;

function reset() {
  Object.assign(player, { ...stage.spawn, vx: 0, vy: 0, grounded: false });
  cameraX = Math.max(0, player.x - 180);
}

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function update(dt) {
  if (cleared) return;
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
  if (player.y > canvas.height + 180) reset();
  if (overlaps(player, stage.exit)) cleared = true;

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

function drawPlayer() {
  const x = player.x - cameraX, y = player.y, flip = player.facing;
  rect(x + 5, y + 5, 28, 35, "#8d6b72"); rect(x + 1, y + 11, 36, 18, "#6a4c61");
  rect(x + (flip > 0 ? 21 : 8), y + 13, 8, 7, "#f5d5ad"); rect(x + (flip > 0 ? 25 : 8), y + 14, 3, 3, "#16152d");
  rect(x + 6, y + 1, 9, 10, "#b37d73"); rect(x + 24, y + 1, 9, 10, "#b37d73");
  rect(x + 4, y + 31, 30, 12, "#e45078"); rect(x + 7, y + 43, 10, 11, "#e5a849"); rect(x + 23, y + 43, 10, 11, "#e5a849");
  rect(x + (flip > 0 ? -8 : 31), y + 23, 12, 8, "#6a4c61"); rect(x + (flip > 0 ? -13 : 38), y + 20, 7, 7, "#b18a83");
}

function drawHUD() {
  ctx.fillStyle = "#111127cc"; ctx.fillRect(20, 18, 330, 50); ctx.strokeStyle = "#584b73"; ctx.strokeRect(20.5, 18.5, 330, 50);
  ctx.fillStyle = "#ff5a8c"; ctx.font = "bold 16px monospace"; ctx.fillText("STAGE 1", 37, 49);
  ctx.fillStyle = "#f9e8ba"; ctx.font = "bold 14px monospace"; ctx.fillText(stage.name, 168, 48);
  const progress = Math.min(1, player.x / stage.exit.x);
  rect(700, 37, 220, 8, "#292542"); rect(700, 37, 220 * progress, 8, "#4dd7c9"); rect(696 + 220 * progress, 31, 8, 20, "#fff0bd");
}

function drawClear() {
  ctx.fillStyle = "#0a0920cc"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center"; ctx.fillStyle = "#ff578c"; ctx.font = "bold 58px monospace"; ctx.fillText("STAGE CLEAR", canvas.width / 2 + 4, 238 + 5);
  ctx.fillStyle = "#fff0bd"; ctx.fillText("STAGE CLEAR", canvas.width / 2, 238);
  ctx.fillStyle = "#53d8ca"; ctx.font = "bold 18px monospace"; ctx.fillText("달빛 골목 탈출 성공!", canvas.width / 2, 293);
  ctx.fillStyle = "#aaa0bf"; ctx.font = "bold 14px monospace"; ctx.fillText("ENTER — 다시 시작", canvas.width / 2, 350); ctx.textAlign = "start";
}

function render() { drawBackground(); stage.platforms.forEach(drawPlatform); drawExit(); drawPlayer(); drawHUD(); if (cleared) drawClear(); }

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 1 / 30); lastTime = now;
  update(dt); render(); requestAnimationFrame(loop);
}

addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) event.preventDefault();
  keys.add(event.code);
  if (event.code === "Space" && player.grounded && !cleared) { player.vy = -JUMP; player.grounded = false; }
  if (event.code === "Enter" && cleared) { cleared = false; reset(); }
});
addEventListener("keyup", (event) => keys.delete(event.code));
canvas.addEventListener("pointerdown", () => canvas.focus());
reset(); requestAnimationFrame(loop);
