const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const storyText = document.getElementById('storyText');
const statusText = document.getElementById('status');

const gravity = 0.6;
const floorY = 500;

const storySteps = [
  'Ночь. Камера сырой тюрьмы. Ты — молчаливый герой в темной форме, и это твой единственный шанс выбраться.',
  'Сначала отключи решетку камеры рычагом за стеной.',
  'Теперь возьми ключ-карту у охранного поста и доберись до главных ворот.',
  'Свобода близко. Используй ключ-карту на выходе!'
];

const player = {
  x: 80,
  y: 420,
  w: 34,
  h: 60,
  vx: 0,
  vy: 0,
  speed: 4.1,
  jumpPower: 13,
  onGround: false,
  hasKeycard: false,
};

const cameraDoor = { x: 270, y: 390, w: 20, h: 110, open: false };
const lever = { x: 350, y: 455, w: 26, h: 45, used: false };
const keycard = { x: 600, y: 460, w: 16, h: 10, taken: false };
const exitDoor = { x: 880, y: 360, w: 45, h: 140, unlocked: false };

const platforms = [
  { x: 0, y: floorY, w: 960, h: 40 },
  { x: 430, y: 438, w: 150, h: 18 },
  { x: 740, y: 410, w: 80, h: 18 },
];

const keys = {
  left: false,
  right: false,
};

let activeStory = 0;
let won = false;

function setStory(step) {
  activeStory = Math.max(activeStory, step);
  storyText.textContent = storySteps[activeStory];
}

function setStatus(text) {
  statusText.textContent = `Статус: ${text}`;
}

function resetGame() {
  player.x = 80;
  player.y = 420;
  player.vx = 0;
  player.vy = 0;
  player.hasKeycard = false;
  cameraDoor.open = false;
  lever.used = false;
  keycard.taken = false;
  exitDoor.unlocked = false;
  won = false;
  activeStory = 0;
  setStory(0);
  setStatus('в камере.');
}

function rectsCollide(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function nearObject(obj, dist = 40) {
  const dx = player.x + player.w / 2 - (obj.x + obj.w / 2);
  const dy = player.y + player.h / 2 - (obj.y + obj.h / 2);
  return Math.hypot(dx, dy) <= dist;
}

function update() {
  if (won) return;

  player.vx = 0;
  if (keys.left) player.vx = -player.speed;
  if (keys.right) player.vx = player.speed;

  player.x += player.vx;

  if (!cameraDoor.open && rectsCollide(player, cameraDoor)) {
    if (player.vx > 0) player.x = cameraDoor.x - player.w;
    if (player.vx < 0) player.x = cameraDoor.x + cameraDoor.w;
  }

  player.vy += gravity;
  player.y += player.vy;
  player.onGround = false;

  for (const p of platforms) {
    if (rectsCollide(player, p) && player.vy >= 0) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

  if (lever.used && !keycard.taken && rectsCollide(player, keycard)) {
    keycard.taken = true;
    player.hasKeycard = true;
    setStory(3);
    setStatus('ключ-карта найдена. Иди к воротам.');
  }

  if (player.hasKeycard && nearObject(exitDoor, 60)) {
    setStatus('нажми E, чтобы открыть главные ворота.');
  }
}

function handleInteract() {
  if (won) return;

  if (!lever.used && nearObject(lever, 70)) {
    lever.used = true;
    cameraDoor.open = true;
    setStory(2);
    setStatus('решетка отключена, путь открыт.');
    return;
  }

  if (player.hasKeycard && nearObject(exitDoor, 70)) {
    exitDoor.unlocked = true;
    won = true;
    setStatus('ты выбрался из тюрьмы!');
  }
}

function drawPrisonBackground() {
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#1f2937';
  for (let i = 0; i < canvas.width; i += 80) {
    ctx.fillRect(i, 0, 4, floorY);
  }

  ctx.fillStyle = '#374151';
  ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);

  // Guard post
  ctx.fillStyle = '#334155';
  ctx.fillRect(560, 390, 120, 110);
  ctx.fillStyle = '#475569';
  ctx.fillRect(570, 408, 100, 10);
}

function drawPlatforms() {
  ctx.fillStyle = '#64748b';
  for (const p of platforms) {
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }
}

function drawDoorsAndObjects() {
  if (!cameraDoor.open) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cameraDoor.x, cameraDoor.y, cameraDoor.w, cameraDoor.h);
    ctx.fillStyle = '#cbd5e1';
    for (let y = cameraDoor.y; y < cameraDoor.y + cameraDoor.h; y += 16) {
      ctx.fillRect(cameraDoor.x - 16, y, 12, 6);
    }
  }

  ctx.fillStyle = lever.used ? '#22c55e' : '#f59e0b';
  ctx.fillRect(lever.x, lever.y, lever.w, lever.h);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(lever.x + 8, lever.y - 18, 10, 20);

  if (!keycard.taken) {
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(keycard.x, keycard.y, keycard.w, keycard.h);
  }

  ctx.fillStyle = exitDoor.unlocked ? '#22c55e' : '#ef4444';
  ctx.fillRect(exitDoor.x, exitDoor.y, exitDoor.w, exitDoor.h);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(exitDoor.x + 14, exitDoor.y + 60, 18, 28);
}

function drawPlayer() {
  // Персонаж с черным силуэтом
  ctx.fillStyle = '#050505';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.beginPath();
  ctx.arc(player.x + player.w / 2, player.y - 10, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(player.x + 8, player.y + 20, 5, 5);
  ctx.fillRect(player.x + 20, player.y + 20, 5, 5);
}

function drawWinOverlay() {
  if (!won) return;

  ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText('ПОБЕГ УДАЛСЯ', 300, 230);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '24px sans-serif';
  ctx.fillText('Ты оставил тюрьму позади. Нажми R для новой попытки.', 175, 290);
}

function draw() {
  drawPrisonBackground();
  drawPlatforms();
  drawDoorsAndObjects();
  drawPlayer();
  drawWinOverlay();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyA') keys.left = true;
  if (event.code === 'KeyD') keys.right = true;

  if ((event.code === 'KeyW' || event.code === 'Space') && player.onGround && !won) {
    player.vy = -player.jumpPower;
  }

  if (event.code === 'KeyE') {
    handleInteract();
  }

  if (event.code === 'KeyR') {
    resetGame();
  }
});

window.addEventListener('keyup', (event) => {
  if (event.code === 'KeyA') keys.left = false;
  if (event.code === 'KeyD') keys.right = false;
});

setStory(0);
setStatus('в камере.');
gameLoop();
