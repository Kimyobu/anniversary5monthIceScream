/* ============================================
   Dreamy Scoops — Ice Cream Shop Game
   script.js
   ============================================ */

'use strict';

// ──────────────────────────────────────────
// 🔧 CONFIG — แก้ตรงนี้ได้เลย
// ──────────────────────────────────────────
const CONFIG = {
  totalCustomers:  10,        // จำนวนลูกค้าที่ต้องเสิร์ฟ
  timerSeconds:    30,        // เวลาต่อออเดอร์ (วินาที)
  minItems:        1,         // ออเดอร์ขั้นต่ำ (ชิ้น)
  maxItems:        3,         // ออเดอร์สูงสุด (ชิ้น)
  pointsPerServe:  100,       // คะแนนต่อการเสิร์ฟถูกต้อง
  bonusThreshold:  10,        // วินาทีที่เหลือเพื่อรับ bonus
  bonusPoints:     50,        // bonus คะแนน
  redirectDelay:   3000,      // ms ก่อน redirect (หลัง win)

  // 🔗 URL ปลายทาง (ใส่ URL ซัปไพรส์ตรงนี้)
  redirectUrl: 'https://kimyobu.github.io/anniversary5month/',

  // 🔊 SFX ENABLED
  sfxEnabled:      true,      // เปิด/ปิดเสียง
};

// ──────────────────────────────────────────
// 🔊 SOUND EFFECTS SYSTEM
// ──────────────────────────────────────────
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency = 800, duration = 100, type = 'sine', volume = 0.3) {
  if (!CONFIG.sfxEnabled) return;
  try {
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);
    
    osc.start(now);
    osc.stop(now + duration / 1000);
  } catch(e) {
    console.log('Audio play error:', e);
  }
}

// Sound presets
const SFX = {
  click:     () => playSound(600, 100, 'sine', 0.2),
  select:    () => playSound(800, 120, 'sine', 0.25),
  remove:    () => playSound(400, 100, 'sine', 0.2),
  success:   () => { playSound(800, 80); setTimeout(() => playSound(1000, 80), 100); },
  warning:   () => playSound(700, 150, 'triangle', 0.3),
  gameover:  () => { playSound(300, 400, 'sine', 0.3); },
  win:       () => { 
    playSound(523.25, 150);
    setTimeout(() => playSound(659.25, 150), 160);
    setTimeout(() => playSound(783.99, 300), 320);
  },
};

// ──────────────────────────────────────────
// 🍦 MENU DATA
// ──────────────────────────────────────────
const MENU = [
  { id: 'strawberry',  emoji: '🍓', name: 'สตรอเบอร์รี่' },
  { id: 'vanilla',     emoji: '🍦', name: 'วานิลลา' },
  { id: 'chocolate',   emoji: '🍫', name: 'ช็อคโกแลต' },
  { id: 'mint',        emoji: '🌿', name: 'มินต์' },
  { id: 'blueberry',   emoji: '🫐', name: 'บลูเบอร์รี่' },
  { id: 'mango',       emoji: '🥭', name: 'มะม่วง' },
  { id: 'cherry',      emoji: '🍒', name: 'เชอร์รี่' },
  { id: 'melon',       emoji: '🍈', name: 'เมลอน' },
  { id: 'lemon',       emoji: '🍋', name: 'เลมอน' },
  { id: 'grape',       emoji: '🍇', name: 'องุ่น' },
  { id: 'cone',        emoji: '🍧', name: 'กรวย' },
  { id: 'sprinkles',   emoji: '🌈', name: 'สปริงเกิล' },
];

// ──────────────────────────────────────────
// 👥 CUSTOMER DATA
// ──────────────────────────────────────────
const CUSTOMERS = [
  { name: 'น้องมิ้ว',    emoji: '👧', lines: ['หนูอยากได้ไอศกรีมอร่อยๆ เลย!', 'โปรดทำให้หนูหน่อยนะคะ 🥺'] },
  { name: 'คุณโต',       emoji: '👦', lines: ['ขอหน่อยนะครับ ร้อนมากเลย!', 'เร็วๆ หน่อยนะ ผมรอ!'] },
  { name: 'ป้าแดง',      emoji: '👩', lines: ['ขอไอติมเย็นๆ ซักทีสิคะ', 'หอมอย่างงี้ อยากกินเลย!'] },
  { name: 'น้องหมู',    emoji: '🐷', lines: ['อ๊อยๆ ขอด้วยนะ!', 'เอาให้ครบเลยนะจ๊ะ!'] },
  { name: 'คุณนก',       emoji: '🐦', lines: ['แค่อยากได้ไอศกรีมเย็นๆ ค่า', 'ขอบคุณล่วงหน้าเลยนะ!'] },
  { name: 'พี่บิ๊ก',     emoji: '🧔', lines: ['เฮ้ ขอบ้างนะ หิวแล้ว!', 'ถ้าอร่อยจะมาอีกนะ!'] },
  { name: 'น้องดาว',    emoji: '⭐', lines: ['ขอให้ครบตามที่สั่งนะคะ', 'ดาวรอด้วยความใจเย็นนะ ✨'] },
  { name: 'คุณปลา',     emoji: '🐟', lines: ['ขอเย็นๆ ชื่นใจหน่อยนะ!', 'รีบเลยนะ ปลากำลังร้อน 🐟'] },
  { name: 'น้องฟ้า',    emoji: '🌤', lines: ['วันนี้ฟ้าใสเลยอยากกินไอติม!', 'ขอดีๆ หน่อยนะจ๊ะ!'] },
  { name: 'คุณหนิง',    emoji: '👩‍🦱', lines: ['ขอสิ่งที่อยากได้เลยนะคะ', 'ขอบคุณมากๆ เลยค่ะ!'] },
  { name: 'น้องมะลิ',   emoji: '🌸', lines: ['น่ารักอย่างนี้ ขอด้วยนะ!', 'เสิร์ฟให้หน่อยนะจ๊ะ 🌸'] },
  { name: 'คุณโอ๊ต',    emoji: '👨‍🍳', lines: ['แม้เป็นเชฟ แต่ก็ชอบไอศกรีม!', 'ขอตามที่สั่งได้เลย!'] },
];

// ──────────────────────────────────────────
// 🎮 GAME STATE
// ──────────────────────────────────────────
const state = {
  screen:          'start',
  score:           0,
  customersDone:   0,
  currentOrder:    [],   // [{ id, emoji, name }]
  tray:            [],   // [{ id, emoji, name }]
  timerValue:      CONFIG.timerSeconds,
  timerInterval:   null,
  customerQueue:   [],
  activeCustomer:  null,
  lastWarnedTimer: null, // Track last timer warning
};

// ──────────────────────────────────────────
// 🎨 DOM REFS
// ──────────────────────────────────────────
const $ = id => document.getElementById(id);

const screens = {
  start:  $('screen-start'),
  game:   $('screen-game'),
  win:    $('screen-win'),
  over:   $('screen-over'),
};

// ──────────────────────────────────────────
// 📺 SCREEN MANAGEMENT
// ──────────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  state.screen = name;
}

// ──────────────────────────────────────────
// 🏪 INIT GAME
// ──────────────────────────────────────────
function initGame() {
  state.score         = 0;
  state.customersDone = 0;
  state.tray          = [];
  state.currentOrder  = [];

  // Shuffle customer pool
  state.customerQueue = shuffle([...CUSTOMERS])
    .slice(0, CONFIG.totalCustomers);

  // Build menu grid
  buildMenu();

  // Init scroll controls
  setTimeout(initMenuScroll, 50);

  // Add progress bar
  addProgressBar();

  // Show game screen
  showScreen('game');

  // Next customer
  nextCustomer();
}

// ──────────────────────────────────────────
// 🍽 BUILD MENU
// ──────────────────────────────────────────
function buildMenu() {
  const grid = $('menu-grid');
  grid.innerHTML = '';
  MENU.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'menu-btn';
    btn.dataset.id = item.id;
    btn.innerHTML = `
      <span>${item.emoji}</span>
      <span class="menu-btn-label">${item.name}</span>
    `;
    btn.addEventListener('click', () => {
      SFX.select();
      addToTray(item);
    });
    grid.appendChild(btn);
  });
}

// ──────────────────────────────────────────
// 👤 NEXT CUSTOMER
// ──────────────────────────────────────────
function nextCustomer() {
  // Stop any running timer
  clearInterval(state.timerInterval);
  state.lastWarnedTimer = null; // Reset warning tracker

  // Done?
  if (state.customersDone >= CONFIG.totalCustomers) {
    triggerWin();
    return;
  }

  // Pick customer
  state.activeCustomer = state.customerQueue[state.customersDone];

  // Generate order
  const count = randInt(CONFIG.minItems, CONFIG.maxItems);
  state.currentOrder = [];
  const pool = shuffle([...MENU]);
  for (let i = 0; i < count; i++) {
    state.currentOrder.push(pool[i]);
  }

  // Clear tray
  state.tray = [];

  // Render
  renderCustomer();
  renderOrder();
  renderTray();
  updateHUD();

  // Start timer
  startTimer();
}

// ──────────────────────────────────────────
// 🎨 RENDER
// ──────────────────────────────────────────
function renderCustomer() {
  const c = state.activeCustomer;
  $('customer-char').textContent = c.emoji;
  $('customer-char').style.animation = 'none';
  requestAnimationFrame(() => {
    $('customer-char').style.animation = '';
  });
  $('customer-name').textContent = c.name;
  const line = c.lines[randInt(0, c.lines.length - 1)];
  $('customer-bubble').textContent = line;
}

function renderOrder() {
  const container = $('order-items');
  container.innerHTML = '';
  state.currentOrder.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'order-item';
    div.dataset.idx = i;
    div.innerHTML = `${item.emoji}<span class="order-item-label">${item.name}</span>`;
    container.appendChild(div);
  });
}

function renderTray() {
  const tray = $('tray');
  tray.innerHTML = '';

  state.tray.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'tray-item';
    div.textContent = item.emoji;
    div.title = item.name;
    div.addEventListener('click', () => {
      SFX.remove();
      removeFromTray(i);
    });
    tray.appendChild(div);
  });

  if (state.tray.length === 0) {
    tray.innerHTML = '<span style="font-size:.8rem;color:var(--text-light);font-weight:600">เลือกไอศกรีมจากด้านล่าง</span>';
  }

  // Update serve button + order matching
  updateServeButton();
  highlightMatches();
}

function highlightMatches() {
  const orderItems = document.querySelectorAll('.order-item');
  const trayCopy = [...state.tray];

  orderItems.forEach(el => {
    const idx = parseInt(el.dataset.idx);
    const needed = state.currentOrder[idx];
    const foundIdx = trayCopy.findIndex(t => t.id === needed.id);
    if (foundIdx !== -1) {
      el.classList.add('matched');
      trayCopy.splice(foundIdx, 1);
    } else {
      el.classList.remove('matched');
    }
  });
}

function updateServeButton() {
  const btn = $('btn-serve');
  const ready = checkOrderMatch();
  btn.disabled = !ready;
  if (ready) {
    btn.classList.add('ready');
  } else {
    btn.classList.remove('ready');
  }
}

function updateHUD() {
  $('c-done').textContent    = state.customersDone;
  $('hud-score').textContent = state.score;
}

// ──────────────────────────────────────────
// ➕ TRAY ACTIONS
// ──────────────────────────────────────────
function addToTray(item) {
  if (state.tray.length >= CONFIG.maxItems + 1) {
    showToast('ถาดเต็มแล้ว! ลบออกก่อนนะ 🍽', 'warn');
    return;
  }
  state.tray.push(item);
  renderTray();
}

function removeFromTray(index) {
  state.tray.splice(index, 1);
  renderTray();
}

// ──────────────────────────────────────────
// ✅ CHECK ORDER
// ──────────────────────────────────────────
function checkOrderMatch() {
  if (state.tray.length !== state.currentOrder.length) return false;

  const trayIds  = [...state.tray].map(t => t.id).sort();
  const orderIds = [...state.currentOrder].map(o => o.id).sort();
  return JSON.stringify(trayIds) === JSON.stringify(orderIds);
}

// ──────────────────────────────────────────
// 🛎 SERVE
// ──────────────────────────────────────────
function serve() {
  if (!checkOrderMatch()) return;

  clearInterval(state.timerInterval);

  // Score
  SFX.success();
  let pts = CONFIG.pointsPerServe;
  if (state.timerValue >= CONFIG.bonusThreshold) {
    pts += CONFIG.bonusPoints;
    showToast(`เร็วมาก! +${pts} คะแนน ⭐`, 'success');
  } else {
    showToast(`เสิร์ฟสำเร็จ! +${pts} คะแนน 🎉`, 'success');
  }

  state.score += pts;
  state.customersDone++;

  // Animate customer leaving
  const charEl = $('customer-char');
  charEl.style.transition = 'transform .3s ease, opacity .3s ease';
  charEl.style.transform = 'translateX(60px) scale(.7)';
  charEl.style.opacity = '0';

  updateHUD();
  updateProgressBar();

  setTimeout(() => {
    charEl.style.transition = '';
    charEl.style.transform  = '';
    charEl.style.opacity    = '';
    nextCustomer();
  }, 500);
}

// ──────────────────────────────────────────
// ⏱ TIMER
// ──────────────────────────────────────────
function startTimer() {
  state.timerValue = CONFIG.timerSeconds;
  renderTimer();

  state.timerInterval = setInterval(() => {
    state.timerValue--;
    renderTimer();

    if (state.timerValue <= 0) {
      clearInterval(state.timerInterval);
      triggerGameOver();
    }
  }, 1000);
}

function renderTimer() {
  const t   = state.timerValue;
  const pct = (t / CONFIG.timerSeconds) * 100;
  const bar = $('timer-bar');
  const num = $('hud-timer');

  bar.style.width = pct + '%';
  num.textContent = t;

  // Color states
  bar.classList.remove('warn', 'danger');
  num.classList.remove('warn', 'danger');

  if (t <= 5) {
    bar.classList.add('danger');
    num.classList.add('danger');
    // Play warning sound when hitting danger
    if (state.lastWarnedTimer !== 5) {
      SFX.warning();
      state.lastWarnedTimer = 5;
    }
  } else if (t <= 9) {
    bar.classList.add('warn');
    num.classList.add('warn');
    // Play warning sound when hitting warning level
    if (state.lastWarnedTimer !== 9) {
      SFX.warning();
      state.lastWarnedTimer = 9;
    }
  }
}

// ──────────────────────────────────────────
// 📊 PROGRESS BAR
// ──────────────────────────────────────────
function addProgressBar() {
  let existing = document.querySelector('.progress-bar-wrap');
  if (existing) existing.remove();

  const wrap = document.createElement('div');
  wrap.className = 'progress-bar-wrap';
  const fill = document.createElement('div');
  fill.className = 'progress-bar-fill';
  fill.id = 'progress-fill';
  fill.style.width = '0%';
  wrap.appendChild(fill);
  $('screen-game').appendChild(wrap);
}

function updateProgressBar() {
  const fill = $('progress-fill');
  if (fill) {
    fill.style.width = (state.customersDone / CONFIG.totalCustomers * 100) + '%';
  }
}

// ──────────────────────────────────────────
// 🏆 WIN
// ──────────────────────────────────────────
function triggerWin() {
  SFX.win();
  showScreen('win');
  $('win-score-num').textContent = state.score;

  // Confetti
  launchConfetti();

  // Redirect after delay
  setTimeout(() => {
    window.location.href = CONFIG.redirectUrl;
  }, CONFIG.redirectDelay);
}

// ──────────────────────────────────────────
// 💀 GAME OVER
// ──────────────────────────────────────────
function triggerGameOver() {
  SFX.gameover();
  $('over-done').textContent = state.customersDone;
  showScreen('over');
}

// ──────────────────────────────────────────
// 🎊 CONFETTI
// ──────────────────────────────────────────
function launchConfetti() {
  const burst = $('win-burst');
  burst.innerHTML = '';

  const colors = ['#ff6b9d','#ffd6e3','#fff','#ffb3cc','#ffeaa7','#a29bfe','#55efc4'];
  const emojis = ['🍦','🍓','🌸','⭐','🎉','✨','🍒'];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';

    if (Math.random() > .5) {
      piece.textContent = emojis[randInt(0, emojis.length - 1)];
      piece.style.background = 'transparent';
      piece.style.fontSize = '1.4rem';
      piece.style.width = 'auto';
      piece.style.height = 'auto';
    } else {
      piece.style.background = colors[randInt(0, colors.length - 1)];
      piece.style.borderRadius = Math.random() > .5 ? '50%' : '2px';
    }

    piece.style.left      = Math.random() * 100 + 'vw';
    piece.style.top       = '-20px';
    piece.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
    piece.style.animationDelay    = Math.random() * 1 + 's';

    burst.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

// ──────────────────────────────────────────
// 🔔 TOAST
// ──────────────────────────────────────────
let toastTimeout = null;

function showToast(msg, type = 'default') {
  const toast = $('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

// ──────────────────────────────────────────
// 🎲 UTILS
// ──────────────────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ──────────────────────────────────────────
// 🎠 MENU SCROLL — arrows + drag + touch
// ──────────────────────────────────────────
function initMenuScroll() {
  const wrap  = document.querySelector('.menu-scroll-wrap');
  const btnL  = $('arrow-left');
  const btnR  = $('arrow-right');
  if (!wrap || !btnL || !btnR) return;

  const STEP = 200; // px per arrow click

  // ── Arrow buttons ──
  function scrollBy(px) {
    wrap.scrollBy({ left: px, behavior: 'smooth' });
  }

  btnL.addEventListener('click', () => scrollBy(-STEP));
  btnR.addEventListener('click', () => scrollBy(+STEP));

  // Update arrow disabled state
  function updateArrows() {
    const atStart = wrap.scrollLeft <= 4;
    const atEnd   = wrap.scrollLeft >= wrap.scrollWidth - wrap.clientWidth - 4;
    btnL.disabled = atStart;
    btnR.disabled = atEnd;
  }

  wrap.addEventListener('scroll', updateArrows, { passive: true });
  // call once after items are rendered
  setTimeout(updateArrows, 100);

  // ── Mouse drag (desktop) ──
  let isDragging = false;
  let dragStartX = 0;
  let scrollStartX = 0;

  wrap.addEventListener('mousedown', e => {
    isDragging  = true;
    dragStartX  = e.clientX;
    scrollStartX = wrap.scrollLeft;
    wrap.classList.add('grabbing');
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    wrap.scrollLeft = scrollStartX - dx;
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    wrap.classList.remove('grabbing');
  });

  // ── Touch swipe (iPad / mobile) ──
  // Native touch scroll already works via overflow-x: auto + -webkit-overflow-scrolling
  // We just block vertical scroll propagation while swiping horizontally
  let touchStartX = 0;
  let touchStartY = 0;
  let isHorizSwipe = false;

  wrap.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isHorizSwipe = false;
  }, { passive: true });

  wrap.addEventListener('touchmove', e => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (!isHorizSwipe && dx > dy + 5) isHorizSwipe = true;
    if (isHorizSwipe) e.stopPropagation();
  }, { passive: true });

  // Re-check arrows after touch ends
  wrap.addEventListener('touchend', updateArrows, { passive: true });
}

// ──────────────────────────────────────────
// 🖱 EVENT LISTENERS
// ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Start button
  $('btn-start').addEventListener('click', () => {
    SFX.click();
    initGame();
  });

  // Serve button
  $('btn-serve').addEventListener('click', () => {
    SFX.click();
    serve();
  });

  // Retry button
  $('btn-retry').addEventListener('click', () => {
    SFX.click();
    initGame();
  });

});
