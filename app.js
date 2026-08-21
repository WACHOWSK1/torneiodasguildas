/* ============================================
   TORNEIO DAS GUILDAS DOS MAGOS
   Application Logic
   ============================================ */

// ----- Guild Color/Theme Presets -----
const GUILD_PRESETS = [
  {
    name: 'Guilda Carmesim',
    icon: '⚔️',
    color: '#c62828',
    colorLight: '#ef5350',
    colorDark: '#8e1c1c',
  },
  {
    name: 'Guilda Safira',
    icon: '🛡️',
    color: '#1565c0',
    colorLight: '#42a5f5',
    colorDark: '#0d47a1',
  },
  {
    name: 'Guilda Esmeralda',
    icon: '🏹',
    color: '#2e7d32',
    colorLight: '#66bb6a',
    colorDark: '#1b5e20',
  },
  {
    name: 'Guilda Ametista',
    icon: '🔮',
    color: '#6a1b9a',
    colorLight: '#ab47bc',
    colorDark: '#4a148c',
  },
  {
    name: 'Guilda Dourada',
    icon: '👑',
    color: '#f57f17',
    colorLight: '#ffb300',
    colorDark: '#e65100',
  },
  {
    name: 'Guilda Gelo',
    icon: '❄️',
    color: '#00838f',
    colorLight: '#4dd0e1',
    colorDark: '#006064',
  },
  {
    name: 'Guilda Fogo',
    icon: '🔥',
    color: '#d84315',
    colorLight: '#ff7043',
    colorDark: '#bf360c',
  },
  {
    name: 'Guilda Arcana',
    icon: '💎',
    color: '#ad1457',
    colorLight: '#ec407a',
    colorDark: '#880e4f',
  },
];

// ----- App State -----
let state = {
  guilds: [],
  nextId: 1,
  usedPresetIndices: [],
};

// ----- DOM Elements -----
const guildsGrid = document.getElementById('guildsGrid');
const addGuildBtn = document.getElementById('addGuildBtn');
const rankingSection = document.getElementById('rankingSection');
const rankingList = document.getElementById('rankingList');
const resetContainer = document.getElementById('resetContainer');
const resetBtn = document.getElementById('resetBtn');
const leaderBanner = document.getElementById('leaderBanner');
const leaderText = document.getElementById('leaderText');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalConfirm = document.getElementById('modalConfirm');
const modalCancel = document.getElementById('modalCancel');
const toastContainer = document.getElementById('toastContainer');
const particlesContainer = document.getElementById('particles');

// Page elements
const pageMenu = document.getElementById('pageMenu');
const pageStart = document.getElementById('pageStart');
const pageTournament = document.getElementById('pageTournament');
const pageMarket = document.getElementById('pageMarket');
const pageAbout = document.getElementById('pageAbout') || document.getElementById('pageCredits');

const allPages = {
  menu: pageMenu,
  start: pageStart,
  tournament: pageTournament,
  market: pageMarket,
  about: pageAbout,
  credits: pageAbout,
};

// Quick Controls & Audio Elements
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const sfxToggleBtn = document.getElementById('sfxToggleBtn');
const sfxIcon = document.getElementById('sfxIcon');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const musicPlayingIndicator = document.getElementById('musicPlayingIndicator');

const musicPlayerPanel = document.getElementById('musicPlayerPanel');
const musicCloseBtn = document.getElementById('musicCloseBtn');
const musicTrackTitle = document.getElementById('musicTrackTitle');
const musicTrackMeta = document.getElementById('musicTrackMeta');
const musicDiscWrapper = document.getElementById('musicDiscWrapper');
const musicCurrentTime = document.getElementById('musicCurrentTime');
const musicTotalTime = document.getElementById('musicTotalTime');
const musicProgressBar = document.getElementById('musicProgressBar');
const musicProgressBarWrap = document.getElementById('musicProgressBarWrap');
const musicPrevBtn = document.getElementById('musicPrevBtn');
const musicPlayBtn = document.getElementById('musicPlayBtn');
const musicNextBtn = document.getElementById('musicNextBtn');
const musicPlaylistToggleBtn = document.getElementById('musicPlaylistToggleBtn');
const musicVolumeSlider = document.getElementById('musicVolumeSlider');
const musicVolIcon = document.getElementById('musicVolIcon');
const musicVolumeValue = document.getElementById('musicVolumeValue');
const musicPlaylistDrawer = document.getElementById('musicPlaylistDrawer');
const musicPlaylistList = document.getElementById('musicPlaylistList');

let musicPlayerInstance = null;

// ----- Remove Black Background from Logo -----
function removeBlackBackground(imgElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imgElement.src;

  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Threshold: pixels darker than this are considered "black background"
    const threshold = 45;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate brightness
      const brightness = (r + g + b) / 3;

      if (brightness < threshold) {
        // Make fully transparent
        data[i + 3] = 0;
      } else if (brightness < threshold + 30) {
        // Gradual fade for edge pixels (anti-aliasing)
        const factor = (brightness - threshold) / 30;
        data[i + 3] = Math.round(data[i + 3] * factor);
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Replace the img src with the processed canvas data
    imgElement.src = canvas.toDataURL('image/png');
  };
}

// ----- Page Navigation -----
function navigateTo(pageName) {
  // Hide all pages
  Object.values(allPages).forEach(page => {
    page.classList.remove('active');
  });

  // Show target page
  const targetPage = allPages[pageName];
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

// ----- Local Storage -----
const STORAGE_KEY = 'torneio_guildas_state';

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Erro ao salvar estado:', e);
  }
}

function sanitizeGuild(g, index) {
  if (typeof g.score !== 'number' || isNaN(g.score)) g.score = 0;
  if (!Array.isArray(g.history)) g.history = [];
  
  const presetIndex = typeof g.presetIndex === 'number' && g.presetIndex >= 0 ? g.presetIndex : (index % GUILD_PRESETS.length);
  const preset = GUILD_PRESETS[presetIndex] || GUILD_PRESETS[0];

  g.presetIndex = presetIndex;
  g.name = g.name || preset.name;
  g.icon = g.icon || preset.icon;
  g.color = g.color || preset.color;
  g.colorLight = g.colorLight || preset.colorLight;
  g.colorDark = g.colorDark || preset.colorDark;
  return g;
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.guilds)) {
        state = parsed;
        state.guilds = state.guilds.map((g, i) => sanitizeGuild(g, i));
        return true;
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar estado:', e);
  }
  return false;
}

// ----- Guild Management -----
function getNextPresetIndex() {
  for (let i = 0; i < GUILD_PRESETS.length; i++) {
    if (!state.usedPresetIndices.includes(i)) {
      return i;
    }
  }
  return -1;
}

function addGuild() {
  if (state.guilds.length >= 8) {
    showToast('Limite de 8 guildas atingido!');
    return;
  }

  const presetIndex = getNextPresetIndex();
  if (presetIndex === -1) {
    showToast('Todas as guildas já foram invocadas!');
    return;
  }

  const preset = GUILD_PRESETS[presetIndex];
  const guild = {
    id: state.nextId++,
    name: preset.name,
    icon: preset.icon,
    score: 0,
    presetIndex: presetIndex,
    color: preset.color,
    colorLight: preset.colorLight,
    colorDark: preset.colorDark,
    history: [],
  };

  state.guilds.push(guild);
  state.usedPresetIndices.push(presetIndex);
  saveState();
  render();

  // Vibrate & Sound
  vibrate(50);
  playArcaneSound('invoke');
  showToast(`${guild.name} foi invocada! ✨`);
}

function removeGuild(guildId) {
  const guild = state.guilds.find(g => g.id === guildId);
  if (!guild) return;

  showModal(
    '⚠️ Remover Guilda',
    `Deseja remover "${guild.name}" do torneio? Esta ação não pode ser desfeita.`,
    () => {
      state.guilds = state.guilds.filter(g => g.id !== guildId);
      state.usedPresetIndices = state.usedPresetIndices.filter(i => i !== guild.presetIndex);
      saveState();
      render();
      playArcaneSound('subtract');
      showToast(`${guild.name} foi banida do torneio`);
    }
  );
}

function updateGuildName(guildId, newName) {
  const guild = state.guilds.find(g => g.id === guildId);
  if (!guild) return;

  const trimmed = newName.trim();
  if (trimmed.length > 0 && trimmed.length <= 30) {
    guild.name = trimmed;
    saveState();
    renderLeader();
    renderRanking();
  }
}

function addScore(guildId, amount) {
  const guild = state.guilds.find(g => g.id === guildId);
  if (!guild) return;

  guild.score += amount;
  guild.history.push(amount);
  saveState();

  // Animate the score
  const card = document.querySelector(`[data-guild-id="${guildId}"]`);
  if (card) {
    animateScoreAdd(card, amount, guild);
  }

  renderLeader();
  renderRanking();
  updateLeaderHighlight();
  updateUndoButtons();

  // Vibrate & Sound
  vibrate(30);
  playArcaneSound(amount > 0 ? 'add' : 'subtract');
}

function undoScore(guildId) {
  const guild = state.guilds.find(g => g.id === guildId);
  if (!guild || !guild.history || guild.history.length === 0) return;

  const lastAmount = guild.history.pop();
  guild.score -= lastAmount;
  if (guild.score < 0) guild.score = 0;
  saveState();

  // Update the score display on the card
  const card = document.querySelector(`[data-guild-id="${guildId}"]`);
  if (card) {
    const scoreEl = card.querySelector('.score-value');
    if (scoreEl) {
      scoreEl.textContent = guild.score;
      scoreEl.classList.remove('pulse');
      void scoreEl.offsetWidth; // force reflow
      scoreEl.classList.add('pulse');
      setTimeout(() => scoreEl.classList.remove('pulse'), 400);
    }

    // Update the undo button on this card specifically
    const undoBtn = card.querySelector('.guild-undo');
    if (undoBtn) {
      undoBtn.disabled = guild.history.length === 0;
    }
  }

  renderLeader();
  renderRanking();
  updateLeaderHighlight();

  vibrate(20);
  playArcaneSound('undo');
  showToast(`-${lastAmount} pontos desfeitos`);
}

function resetTournament() {
  if (state.guilds.length === 0) return;

  showModal(
    '🔄 Resetar Torneio',
    'Todas as pontuações serão zeradas. Os nomes das guildas serão mantidos. Deseja continuar?',
    () => {
      state.guilds.forEach(g => {
        g.score = 0;
        g.history = [];
      });
      saveState();
      render();
      showToast('Torneio resetado! Todos começam do zero ⚡');
    }
  );
}

// ----- Rendering -----
function render() {
  renderGuilds();
  renderLeader();
  renderRanking();
  updateAddButton();
  updateResetVisibility();
}

function renderGuilds() {
  guildsGrid.innerHTML = '';

  if (state.guilds.length === 0) {
    guildsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏰</div>
        <p class="empty-state-text">
          Nenhuma guilda foi invocada ainda.<br>
          Toque no botão abaixo para começar!
        </p>
      </div>
    `;
    return;
  }

  state.guilds.forEach((guild, index) => {
    const card = createGuildCard(guild, index);
    guildsGrid.appendChild(card);
  });

  updateLeaderHighlight();
  updateUndoButtons();
}

function createGuildCard(guild, index) {
  const card = document.createElement('div');
  card.className = 'guild-card';
  card.dataset.guildId = guild.id;
  card.style.setProperty('--accent-color', guild.color);
  card.style.setProperty('--accent-dark', guild.colorDark);
  card.style.setProperty('--accent-light', guild.colorLight);
  card.style.setProperty('--accent-glow', guild.color + '66');
  card.style.animationDelay = `${index * 0.1}s`;

  const hasHistory = guild.history && guild.history.length > 0;

  card.innerHTML = `
    <div class="guild-card-inner">
      <div class="card-corner tl"></div>
      <div class="card-corner tr"></div>
      <div class="card-corner bl"></div>
      <div class="card-corner br"></div>

      <button class="guild-delete" data-action="delete" data-guild="${guild.id}" title="Remover guilda" aria-label="Remover ${escapeHtml(guild.name)}">✕</button>

      <div class="guild-shield">${guild.icon}</div>

      <div class="guild-name-container">
        <span class="guild-name" data-action="edit-name" data-guild="${guild.id}" title="Clique para editar o nome">${escapeHtml(guild.name)}</span>
        <button class="guild-edit-btn" data-action="edit-name" data-guild="${guild.id}" title="Editar nome" aria-label="Editar nome da ${escapeHtml(guild.name)}">✏️</button>
      </div>

      <div class="guild-score">
        <span class="score-value">${guild.score}</span>
        <span class="score-label">pontos</span>
      </div>

      <div class="guild-buttons">
        <div class="guild-buttons-row guild-buttons-add">
          <button class="score-btn score-btn-plus score-btn-25" data-action="add-score" data-guild="${guild.id}" data-amount="25">+25</button>
          <button class="score-btn score-btn-plus score-btn-50" data-action="add-score" data-guild="${guild.id}" data-amount="50">+50</button>
          <button class="score-btn score-btn-plus score-btn-100" data-action="add-score" data-guild="${guild.id}" data-amount="100">+100</button>
        </div>
        <div class="guild-buttons-row guild-buttons-sub">
          <button class="score-btn score-btn-minus score-btn-sub25" data-action="add-score" data-guild="${guild.id}" data-amount="-25">-25</button>
          <button class="score-btn score-btn-minus score-btn-sub50" data-action="add-score" data-guild="${guild.id}" data-amount="-50">-50</button>
          <button class="score-btn score-btn-minus score-btn-sub100" data-action="add-score" data-guild="${guild.id}" data-amount="-100">-100</button>
        </div>
      </div>

      <button class="guild-undo" data-action="undo" data-guild="${guild.id}" ${!hasHistory ? 'disabled' : ''}>
        ↩ Desfazer
      </button>
    </div>
  `;

  return card;
}

function renderLeader() {
  if (state.guilds.length === 0) {
    leaderText.textContent = 'Nenhuma guilda cadastrada';
    return;
  }

  const sorted = [...state.guilds].sort((a, b) => b.score - a.score);
  const leader = sorted[0];

  if (leader.score === 0) {
    leaderText.textContent = 'Torneio ainda não iniciou';
  } else {
    leaderText.textContent = `${leader.name} — ${leader.score} pts`;
  }
}

function renderRanking() {
  if (state.guilds.length === 0) {
    rankingSection.style.display = 'none';
    return;
  }

  rankingSection.style.display = 'block';

  const sorted = [...state.guilds].sort((a, b) => b.score - a.score);
  const medals = ['🥇', '🥈', '🥉'];

  rankingList.innerHTML = sorted.map((guild, index) => `
    <li class="ranking-item" style="animation-delay: ${index * 0.05}s">
      <span class="ranking-position">
        ${index < 3 ? `<span class="ranking-medal">${medals[index]}</span>` : `${index + 1}º`}
      </span>
      <span class="ranking-guild-name">${escapeHtml(guild.name)}</span>
      <span class="ranking-guild-score">${guild.score} pts</span>
    </li>
  `).join('');
}

function updateLeaderHighlight() {
  if (state.guilds.length === 0) return;

  const sorted = [...state.guilds].sort((a, b) => b.score - a.score);
  const leaderId = sorted[0].score > 0 ? sorted[0].id : null;

  document.querySelectorAll('.guild-card').forEach(card => {
    card.classList.toggle('is-leader', parseInt(card.dataset.guildId) === leaderId);
  });
}

function updateUndoButtons() {
  state.guilds.forEach(guild => {
    const card = document.querySelector(`[data-guild-id="${guild.id}"]`);
    if (card) {
      const undoBtn = card.querySelector('.guild-undo');
      if (undoBtn) {
        const hasHistory = guild.history && guild.history.length > 0;
        undoBtn.disabled = !hasHistory;
      }
    }
  });
}

function updateAddButton() {
  addGuildBtn.disabled = state.guilds.length >= 8;
  if (state.guilds.length >= 8) {
    addGuildBtn.querySelector('.add-guild-text').textContent = 'Limite de guildas atingido';
  } else {
    addGuildBtn.querySelector('.add-guild-text').textContent = 'Invocar Nova Guilda';
  }
}

function updateResetVisibility() {
  resetContainer.style.display = state.guilds.length > 0 ? 'block' : 'none';
}

// ----- Name Editing -----
// (Name editing handled via Medieval Modal below)

// ----- Animations -----
function animateScoreAdd(card, amount, guild) {
  // 1. Pulse the score number
  const scoreEl = card.querySelector('.score-value');
  scoreEl.textContent = guild.score;
  scoreEl.classList.remove('pulse');
  void scoreEl.offsetWidth; // force reflow
  scoreEl.classList.add('pulse');
  setTimeout(() => scoreEl.classList.remove('pulse'), 400);

  // 2. Float the score text
  const scoreArea = card.querySelector('.guild-score');
  const floatEl = document.createElement('div');
  floatEl.className = 'score-float';
  floatEl.textContent = `+${amount}`;

  // Color based on amount
  if (amount === 25) floatEl.style.color = '#42a5f5';
  else if (amount === 50) floatEl.style.color = '#ab47bc';
  else floatEl.style.color = '#66bb6a';

  floatEl.style.left = '50%';
  floatEl.style.top = '0';
  floatEl.style.transform = 'translateX(-50%)';
  scoreArea.appendChild(floatEl);
  setTimeout(() => floatEl.remove(), 1000);

  // 3. Card glow effect
  card.classList.add('score-added');
  setTimeout(() => card.classList.remove('score-added'), 500);

  // 4. Particle burst
  createCardParticles(scoreArea, guild.color);
}

function createCardParticles(parent, color) {
  const count = 6;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'card-particle';
    particle.style.background = color;
    particle.style.boxShadow = `0 0 6px ${color}`;
    particle.style.left = '50%';
    particle.style.top = '50%';

    const angle = (i / count) * Math.PI * 2;
    const distance = 30 + Math.random() * 30;
    particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);

    parent.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }
}

// ----- Background Particles -----
function createBackgroundParticles() {
  const count = 20;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.bottom = `${Math.random() * -20}%`;
    particle.style.setProperty('--duration', `${8 + Math.random() * 12}s`);
    particle.style.setProperty('--delay', `${Math.random() * 10}s`);
    particle.style.setProperty('--drift', `${(Math.random() - 0.5) * 100}px`);

    // Random colors: gold, purple, blue
    const colors = ['#c9a84c', '#9c6fd4', '#4fc3f7'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.boxShadow = `0 0 6px ${particle.style.background}`;

    particlesContainer.appendChild(particle);
  }
}

// ----- Toast -----
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ----- Theme Management (Light / Dark Mode) -----
function initTheme() {
  const savedTheme = localStorage.getItem('torneio_theme') || 'dark';
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.body.classList.toggle('light-theme', isLight);
  if (themeIcon) {
    themeIcon.textContent = isLight ? '🌙' : '☀️';
  }
  const tooltip = themeToggleBtn ? themeToggleBtn.querySelector('.quick-btn-tooltip') : null;
  if (tooltip) {
    tooltip.textContent = isLight ? 'Modo Escuro' : 'Modo Claro';
  }
  localStorage.setItem('torneio_theme', theme);
}

function toggleTheme() {
  const isCurrentlyLight = document.body.classList.contains('light-theme');
  const newTheme = isCurrentlyLight ? 'dark' : 'light';
  applyTheme(newTheme);
  playArcaneSound('invoke');
  showToast(newTheme === 'light' ? '📜 Modo Pergaminho Claro ativado' : '🌙 Modo Arcana Escuro ativado');
}

// ----- SFX Mute Management -----
let sfxMuted = localStorage.getItem('torneio_sfx_muted') === 'true';

function updateSfxButtonUI() {
  if (sfxIcon) {
    sfxIcon.textContent = sfxMuted ? '🔇' : '🔊';
  }
  const tooltip = sfxToggleBtn ? sfxToggleBtn.querySelector('.quick-btn-tooltip') : null;
  if (tooltip) {
    tooltip.textContent = sfxMuted ? 'Ativar Sons' : 'Desativar Sons';
  }
}

function toggleSfxMute() {
  sfxMuted = !sfxMuted;
  localStorage.setItem('torneio_sfx_muted', sfxMuted ? 'true' : 'false');
  updateSfxButtonUI();
  if (!sfxMuted) {
    playArcaneSound('add');
    showToast('🔊 Efeitos sonoros ativados');
  } else {
    showToast('🔇 Efeitos sonoros desativados (Mudo)');
  }
}

// ----- Audio Feedback (Web Audio API Synthesizer) -----
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playArcaneSound(type) {
  if (sfxMuted) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'add') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'subtract') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'invoke') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'undo') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(349.23, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch (e) {
    // Ignore audio failures if unsupported/blocked
  }
}

// ============================================
// MEDIEVAL BGM MUSIC PLAYER & PLAYLIST
// ============================================
const PLAYLIST = [
  {
    id: 1,
    title: 'Briga de Taverna',
    artist: 'Trilha Medieval • Enérgica',
    src: 'audio/BRIGA DE TAVERNA.mp3'
  },
  {
    id: 2,
    title: 'Biblioteca Sem Fim',
    artist: 'Trilha Medieval • Mistério & Estudo',
    src: 'audio/Biblioteca Sem Fim.mp3'
  },
  {
    id: 3,
    title: 'Pouso na Taverna',
    artist: 'Trilha Medieval • Aconchegante',
    src: 'audio/Pouso na Taverna.mp3'
  },
  {
    id: 4,
    title: 'Taverna Felizinha',
    artist: 'Trilha Medieval • Festiva',
    src: 'audio/TAVERNA FELIZINHA.mp3'
  },
  {
    id: 5,
    title: 'Taverna da Estrada',
    artist: 'Trilha Medieval • Aventura',
    src: 'audio/Taverna da Estrada.mp3'
  },
  {
    id: 6,
    title: 'Taverna dos Magos',
    artist: 'Trilha Medieval • Clássica',
    src: 'audio/taverna.mp3'
  },
  {
    id: 7,
    title: 'Taverna dos Aventureiros',
    artist: 'Trilha Medieval • Instrumental',
    src: 'audio/taverna_02.mp3'
  },
  {
    id: 8,
    title: 'Briga de Taverna (Versão 2)',
    artist: 'Trilha Medieval • Batalha',
    src: 'audio/BRIGA DE TAVERNA (1).mp3'
  },
  {
    id: 9,
    title: 'Biblioteca Sem Fim (Versão 2)',
    artist: 'Trilha Medieval • Arcano',
    src: 'audio/Biblioteca Sem Fim (1).mp3'
  },
  {
    id: 10,
    title: 'Pouso na Taverna (Versão 2)',
    artist: 'Trilha Medieval • Repouso',
    src: 'audio/Pouso na Taverna (1).mp3'
  },
  {
    id: 11,
    title: 'Taverna da Estrada (Versão 2)',
    artist: 'Trilha Medieval • Jornada',
    src: 'audio/Taverna da Estrada (1).mp3'
  }
];

class MedievalMusicPlayer {
  constructor() {
    this.playlist = PLAYLIST;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.volume = parseFloat(localStorage.getItem('torneio_bgm_volume') || '0.7');
    this.audio.volume = this.volume;
    this.isSynthFallback = false;
    this.synthInterval = null;

    this.bindEvents();
    this.renderPlaylist();
    this.loadTrack(0, false);
    this.updateVolumeUI();
  }

  bindEvents() {
    this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.audio.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
    this.audio.addEventListener('ended', () => this.nextTrack(true));
    this.audio.addEventListener('error', (e) => this.onAudioError(e));

    if (musicPlayBtn) {
      musicPlayBtn.addEventListener('click', () => this.togglePlay());
    }
    if (musicNextBtn) {
      musicNextBtn.addEventListener('click', () => {
        playArcaneSound('undo');
        this.nextTrack(false);
      });
    }
    if (musicPrevBtn) {
      musicPrevBtn.addEventListener('click', () => {
        playArcaneSound('undo');
        this.prevTrack();
      });
    }
    if (musicProgressBarWrap) {
      musicProgressBarWrap.addEventListener('click', (e) => this.seek(e));
    }
    if (musicVolumeSlider) {
      musicVolumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
    }
    if (musicVolIcon) {
      musicVolIcon.addEventListener('click', () => this.toggleMute());
    }
    if (musicPlaylistToggleBtn) {
      musicPlaylistToggleBtn.addEventListener('click', () => this.togglePlaylistDrawer());
    }
    if (musicToggleBtn) {
      musicToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePanel();
      });
    }
    if (musicCloseBtn) {
      musicCloseBtn.addEventListener('click', () => this.closePanel());
    }

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (musicPlayerPanel && musicPlayerPanel.classList.contains('active')) {
        if (!musicPlayerPanel.contains(e.target) && !musicToggleBtn.contains(e.target)) {
          this.closePanel();
        }
      }
    });
  }

  loadTrack(index, autoPlay = false) {
    if (index < 0) index = this.playlist.length - 1;
    if (index >= this.playlist.length) index = 0;
    this.currentIndex = index;

    const track = this.playlist[this.currentIndex];
    if (musicTrackTitle) musicTrackTitle.textContent = track.title;
    if (musicTrackMeta) musicTrackMeta.textContent = `Faixa ${index + 1} de ${this.playlist.length} • ${track.artist}`;

    this.stopSynthFallback();
    this.audio.src = track.src;

    this.updatePlaylistUI();

    if (autoPlay) {
      this.play();
    }
  }

  play() {
    this.stopSynthFallback();
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.isPlaying = true;
        this.updatePlayStateUI();
      }).catch((err) => {
        console.log('[Audio] Arquivo de áudio local ainda não encontrado. Tocando melodia sintetizada de demonstração.');
        this.startSynthFallback();
      });
    }
  }

  pause() {
    this.stopSynthFallback();
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayStateUI();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  nextTrack(auto = false) {
    this.loadTrack(this.currentIndex + 1, auto ? true : this.isPlaying);
  }

  prevTrack() {
    this.loadTrack(this.currentIndex - 1, this.isPlaying);
  }

  updatePlayStateUI() {
    if (musicPlayBtn) {
      musicPlayBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
    }
    if (musicDiscWrapper) {
      musicDiscWrapper.classList.toggle('spinning', this.isPlaying);
    }
    if (musicPlayingIndicator) {
      musicPlayingIndicator.classList.toggle('active', this.isPlaying);
    }
  }

  onTimeUpdate() {
    if (this.isSynthFallback) return;
    const cur = this.audio.currentTime || 0;
    const dur = this.audio.duration || 0;
    if (musicCurrentTime) musicCurrentTime.textContent = this.formatTime(cur);
    if (musicProgressBar && dur > 0) {
      musicProgressBar.style.width = `${(cur / dur) * 100}%`;
    }
  }

  onMetadataLoaded() {
    const dur = this.audio.duration || 0;
    if (musicTotalTime) musicTotalTime.textContent = this.formatTime(dur);
  }

  onAudioError(e) {
    if (this.isPlaying) {
      this.startSynthFallback();
    }
  }

  seek(e) {
    if (this.isSynthFallback || !this.audio.duration) return;
    const rect = musicProgressBarWrap.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    this.audio.currentTime = pos * this.audio.duration;
  }

  setVolume(val) {
    this.volume = parseFloat(val);
    this.audio.volume = this.volume;
    localStorage.setItem('torneio_bgm_volume', this.volume);
    this.updateVolumeUI();
  }

  toggleMute() {
    if (this.audio.volume > 0) {
      this.prevVolume = this.volume;
      this.setVolume(0);
    } else {
      this.setVolume(this.prevVolume || 0.7);
    }
  }

  updateVolumeUI() {
    if (musicVolumeSlider) musicVolumeSlider.value = this.volume;
    if (musicVolumeValue) musicVolumeValue.textContent = `${Math.round(this.volume * 100)}%`;
    if (musicVolIcon) {
      if (this.volume === 0) musicVolIcon.textContent = '🔇';
      else if (this.volume < 0.4) musicVolIcon.textContent = '🔈';
      else musicVolIcon.textContent = '🔊';
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  renderPlaylist() {
    if (!musicPlaylistList) return;
    musicPlaylistList.innerHTML = this.playlist.map((track, i) => `
      <li class="music-playlist-item ${i === this.currentIndex ? 'active' : ''}" data-index="${i}">
        <span>${track.id}. ${track.title}</span>
        <span style="opacity: 0.6; font-size: 0.7rem;">▶</span>
      </li>
    `).join('');

    musicPlaylistList.querySelectorAll('.music-playlist-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        this.loadTrack(idx, true);
      });
    });
  }

  updatePlaylistUI() {
    if (!musicPlaylistList) return;
    musicPlaylistList.querySelectorAll('.music-playlist-item').forEach((item, i) => {
      item.classList.toggle('active', i === this.currentIndex);
    });
  }

  togglePlaylistDrawer() {
    if (musicPlaylistDrawer) {
      musicPlaylistDrawer.classList.toggle('active');
    }
  }

  togglePanel() {
    if (musicPlayerPanel) {
      musicPlayerPanel.classList.toggle('active');
      if (musicPlayerPanel.classList.contains('active')) {
        playArcaneSound('add');
      }
    }
  }

  closePanel() {
    if (musicPlayerPanel) {
      musicPlayerPanel.classList.remove('active');
    }
  }

  // Fallback Procedural Ambient Medieval Harp Synth
  startSynthFallback() {
    this.isSynthFallback = true;
    this.isPlaying = true;
    this.updatePlayStateUI();
    if (musicTrackMeta) {
      musicTrackMeta.textContent = `(Melodia Medieval Sintetizada • Demonstração)`;
    }

    if (this.synthInterval) clearInterval(this.synthInterval);
    const chords = [
      [220, 261.63, 329.63, 440], // Am
      [174.61, 220, 261.63, 349.23], // F
      [261.63, 329.63, 392.00, 523.25], // C
      [196.00, 246.94, 293.66, 392.00]  // G
    ];
    let chordIdx = 0;
    let noteIdx = 0;

    this.synthInterval = setInterval(() => {
      if (!this.isPlaying) return;
      try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const currentChord = chords[chordIdx];
        const freq = currentChord[noteIdx];

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.04 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.2);

        noteIdx = (noteIdx + 1) % currentChord.length;
        if (noteIdx === 0) {
          chordIdx = (chordIdx + 1) % chords.length;
        }
      } catch (e) {}
    }, 450);
  }

  stopSynthFallback() {
    this.isSynthFallback = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }
}

// ----- Modal -----
let modalResolve = null;

function showModal(title, message, onConfirm) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalOverlay.classList.add('active');

  modalResolve = onConfirm;
}

function hideModal() {
  modalOverlay.classList.remove('active');
  modalResolve = null;
}

// ----- Edit Name Modal -----
const editNameModalOverlay = document.getElementById('editNameModalOverlay');
const editGuildNameInput = document.getElementById('editGuildNameInput');
const editNameConfirm = document.getElementById('editNameConfirm');
const editNameCancel = document.getElementById('editNameCancel');
let currentEditingGuildId = null;

function startNameEdit(guildId) {
  const guild = state.guilds.find(g => g.id === guildId);
  if (!guild) return;

  currentEditingGuildId = guildId;
  editGuildNameInput.value = guild.name;
  editNameModalOverlay.classList.add('active');
  setTimeout(() => {
    editGuildNameInput.focus();
    editGuildNameInput.select();
  }, 100);
}

function hideEditNameModal() {
  if (editNameModalOverlay) {
    editNameModalOverlay.classList.remove('active');
  }
  currentEditingGuildId = null;
}

function saveGuildNameEdit() {
  if (currentEditingGuildId === null) return;
  const newName = editGuildNameInput.value.trim();
  if (newName.length > 0 && newName.length <= 30) {
    updateGuildName(currentEditingGuildId, newName);
    renderGuilds();
    showToast(`Nome atualizado para "${escapeHtml(newName)}"! 📜`);
    playArcaneSound('invoke');
  }
  hideEditNameModal();
}

if (editNameConfirm) editNameConfirm.addEventListener('click', saveGuildNameEdit);
if (editNameCancel) editNameCancel.addEventListener('click', hideEditNameModal);
if (editNameModalOverlay) {
  editNameModalOverlay.addEventListener('click', (e) => {
    if (e.target === editNameModalOverlay) hideEditNameModal();
  });
}
if (editGuildNameInput) {
  editGuildNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveGuildNameEdit();
    if (e.key === 'Escape') hideEditNameModal();
  });
}

// ----- Haptic Feedback -----
function vibrate(duration) {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
}

// ----- Utilities -----
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ----- Event Listeners -----

// Event delegation for guild actions
guildsGrid.addEventListener('click', (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  // Skip if the target is disabled
  if (target.disabled) return;

  const action = target.dataset.action;
  const guildId = parseInt(target.dataset.guild);

  switch (action) {
    case 'add-score':
      const amount = parseInt(target.dataset.amount);
      addScore(guildId, amount);
      break;
    case 'delete':
      removeGuild(guildId);
      break;
    case 'edit-name':
      startNameEdit(guildId);
      break;
    case 'undo':
      e.preventDefault();
      e.stopPropagation();
      undoScore(guildId);
      break;
  }
});

// Also add a direct touch handler for undo buttons to improve reliability on mobile
guildsGrid.addEventListener('touchend', (e) => {
  const target = e.target.closest('[data-action="undo"]');
  if (!target || target.disabled) return;

  e.preventDefault();
  e.stopPropagation();

  const guildId = parseInt(target.dataset.guild);
  undoScore(guildId);
}, { passive: false });

addGuildBtn.addEventListener('click', addGuild);
resetBtn.addEventListener('click', resetTournament);

// Modal buttons
modalConfirm.addEventListener('click', () => {
  if (modalResolve) {
    modalResolve();
  }
  hideModal();
});

modalCancel.addEventListener('click', hideModal);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    hideModal();
  }
});

// Keyboard shortcut to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (modalOverlay.classList.contains('active')) hideModal();
    if (editNameModalOverlay && editNameModalOverlay.classList.contains('active')) hideEditNameModal();
  }
});

// ----- Menu Navigation Event Listeners -----
document.getElementById('menuNav').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-page]');
  if (!btn) return;

  const page = btn.dataset.page;
  vibrate(30);
  playArcaneSound('add');
  navigateTo(page);
});

// Back buttons
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    vibrate(20);
    playArcaneSound('undo');
    navigateTo(page);
  });
});

// Generic CTA [data-page] buttons (e.g. from Comece Aqui page)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-page]');
  if (!btn || btn.closest('#menuNav') || btn.classList.contains('back-btn')) return;
  const page = btn.dataset.page;
  vibrate(30);
  playArcaneSound('add');
  navigateTo(page);
});

// ----- Splash Screen -----
const splashScreen = document.getElementById('splashScreen');
const splashVideo = document.getElementById('splashVideo');
const splashSkip = document.getElementById('splashSkip');

function dismissSplash() {
  if (!splashScreen || splashScreen.style.display === 'none') return;
  splashScreen.classList.remove('active');
  try { if (splashVideo) splashVideo.pause(); } catch(e){}

  // After fade-out transition, remove from DOM
  setTimeout(() => {
    splashScreen.style.display = 'none';
  }, 900);

  // Show menu
  navigateTo('menu');

  // Mark as shown this session
  sessionStorage.setItem('intro_shown', '1');
}

// When video ends naturally, dismiss the splash
if (splashVideo) {
  splashVideo.addEventListener('ended', dismissSplash);

  // Fallback: if video fails to load or play, auto-dismiss after 1 second
  splashVideo.addEventListener('error', () => {
    setTimeout(dismissSplash, 1000);
  });
}

// Skip button and click on splash screen
if (splashSkip) {
  splashSkip.addEventListener('click', (e) => {
    e.stopPropagation();
    dismissSplash();
  });
}

if (splashScreen) {
  splashScreen.addEventListener('click', () => {
    dismissSplash();
  });
}

// Quick Controls Listeners
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    vibrate(20);
    toggleTheme();
  });
}

if (sfxToggleBtn) {
  sfxToggleBtn.addEventListener('click', () => {
    vibrate(20);
    toggleSfxMute();
  });
}

// ----- Initialize -----
function init() {
  initTheme();
  updateSfxButtonUI();
  musicPlayerInstance = new MedievalMusicPlayer();

  loadState();
  createBackgroundParticles();
  render();

  // Register Service Worker for PWA Offline capability
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        console.log('[SW] ServiceWorker registrado com sucesso:', reg.scope);
        reg.update();
      }).catch(err => {
        console.warn('[SW] Falha ao registrar ServiceWorker:', err);
      });
    });
  }

  // Process logos to remove black background
  document.querySelectorAll('.menu-logo, .credits-logo, .page-logo, .start-logo').forEach(logo => {
    removeBlackBackground(logo);
  });

  // Check if intro video is present and play it (or skip if already shown in this session)
  if (sessionStorage.getItem('intro_shown') === '1') {
    dismissSplash();
  } else if (splashVideo) {
    const isDesktop = window.innerWidth >= 768 || (!/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && window.innerWidth > window.innerHeight);
    const targetVideo = isDesktop ? 'intro-desktop.mp4' : 'intro.mp4';
    if (!splashVideo.src || !splashVideo.src.includes(targetVideo)) {
      splashVideo.src = targetVideo;
    }

    splashVideo.play().catch(() => {
      // Autoplay blocked or failed, fallback to dismiss
      setTimeout(dismissSplash, 1000);
    });
  } else {
    dismissSplash();
  }
}

init();
