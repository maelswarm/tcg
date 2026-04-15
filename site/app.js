/* ═══════════════════════════════════════════════════
   TCG Price Index — App Logic
   10 games · All sets · Live from PriceCharting
   ═══════════════════════════════════════════════════ */

const API = (() => {
  const h = location.hostname;
  return (h === 'localhost' || h === '127.0.0.1') ? `http://${h}:3847` : '';
})();

// ── Game accent palette ──────────────────────────────────────────────────
const ACCENTS = {
  pokemon:    { accent: '#ffcb05', dim: 'rgba(255,203,5,0.10)',   rgb: '255,203,5'   },
  mtg:        { accent: '#c8a97e', dim: 'rgba(200,169,126,0.12)', rgb: '200,169,126' },
  yugioh:     { accent: '#a855f7', dim: 'rgba(168,85,247,0.10)',  rgb: '168,85,247'  },
  onepiece:   { accent: '#ff4757', dim: 'rgba(255,71,87,0.10)',   rgb: '255,71,87'   },
  lorcana:    { accent: '#60a5fa', dim: 'rgba(96,165,250,0.10)',  rgb: '96,165,250'  },
  digimon:    { accent: '#38bdf8', dim: 'rgba(56,189,248,0.10)',  rgb: '56,189,248'  },
  dragonball: { accent: '#fb923c', dim: 'rgba(251,146,60,0.10)',  rgb: '251,146,60'  },
  gundam:     { accent: '#f87171', dim: 'rgba(248,113,113,0.10)', rgb: '248,113,113' },
  swu:        { accent: '#ffe81f', dim: 'rgba(255,232,31,0.10)',  rgb: '255,232,31'  },
  riftbound:  { accent: '#2dd4bf', dim: 'rgba(45,212,191,0.10)',  rgb: '45,212,191'  },
};

function applyAccent(gameKey) {
  const a = ACCENTS[gameKey] || ACCENTS.swu;
  const r = document.documentElement;
  r.style.setProperty('--game-accent',     a.accent);
  r.style.setProperty('--game-accent-dim', a.dim);
  r.style.setProperty('--game-accent-rgb', a.rgb);
}

// ── State ────────────────────────────────────────────────────────────────
const S = {
  game: 'pokemon',
  slug: null,
  games: {},
  allCards: [],
  visibleCards: [],
  query: '',
  setQuery: '',
  sort: 'default',
  loadId: 0,
  cacheAgeSeconds: 0,
  cacheSets: 0,
  setsView: false,
  saleView: false,
  inventoryView: false,
  saleCards: [],
  setStats: new Map(),
  cardCache: new Map(),
  tcgCards: new Map(), // normName → tcg card data
  userId: null,
  authToken: null,
  isAdmin: false,
  cart: new Map(),
  storeInventory: new Map(), // `${game}|${slug}|${cardId}|${grading}` → {quantity_available, price_cents}
  adminInventory: [],
  // Infinite scroll pagination
  pagination: {
    cards: { rendered: 0, total: 0, batchSize: 50, sentinel: null, loading: false },
    sets: { rendered: 0, total: 0, batchSize: 50, sentinel: null, loading: false },
    sale: { rendered: 0, total: 0, batchSize: 50, sentinel: null, loading: false },
    inventory: { rendered: 0, total: 0, batchSize: 50, sentinel: null, loading: false },
  },
  renderQueue: {
    cards: null,
    sets: null,
    sale: null,
    inventory: null,
  },
};

// ── DOM ───────────────────────────────────────────────────────────────────
const g = id => document.getElementById(id);
const E = {
  gameBar:       document.querySelector('.game-bar'),
  gameBarInner:  document.querySelector('.game-bar-inner'),
  gameTabs:      g('game-tabs'),
  setList:       g('set-list'),
  setSkeleton:   g('set-skeleton'),
  setBadge:      g('set-badge'),
  setSearch:     g('set-search'),
  setTitle:      g('set-title'),
  sidebarTitle:  g('sidebar-title'),
  setExtLink:    g('set-ext-link'),
  statsBar:      g('stats-bar'),
  statCount:     g('stat-count'),
  statAvg:       g('stat-avg'),
  statMax:       g('stat-max'),
  statPsa10:     g('stat-psa10'),
  statCache:     g('stat-cache'),
  statCacheAge:  g('stat-cache-age'),
  cardSearch:    g('card-search'),
  sortSelect:    g('sort-select'),
  stateWelcome:  g('state-welcome'),
  stateLoading:  g('state-loading'),
  loadingLabel:  g('loading-label'),
  stateError:    g('state-error'),
  errorMsg:      g('error-msg'),
  btnRetry:      g('btn-retry'),
  stateNoRes:    g('state-no-results'),
  noResQ:        g('no-results-q'),
  tableWrap:     g('table-wrap'),
  tbody:         g('price-tbody'),
  footerBar:     g('footer-bar'),
  footerCount:   g('footer-count'),
  cachePill:     g('cache-pill'),
  totalCount:    g('total-sets-count'),
  imgModal:      g('img-modal'),
  imgModalImg:   g('img-modal-img'),
  imgModalName:  g('img-modal-name'),
  imgModalClose: g('img-modal-close'),
  imgModalBackdrop: g('img-modal-backdrop'),
  btnViewSets:   g('btn-view-sets'),
  btnViewSale:   g('btn-view-sale'),
  stateSetsView: g('state-sets-view'),
  stateSaleView: g('state-sale-view'),
  stateInventoryView: g('state-inventory-view'),
  setsOvTitle:   g('sets-ov-title'),
  btnLoadAllStats: g('btn-load-all-stats'),
  setsOvTbody:   g('sets-ov-tbody'),
  saleSearch:    g('sale-search'),
  saleTbody:     g('sale-tbody'),
  inventoryTitle: g('inventory-title'),
  inventoryTbody: g('inventory-tbody'),
  sidebarToggle: g('sidebar-toggle'),
  sidebarOverlay:g('sidebar-overlay'),
  sidebar:       g('sidebar'),
  gameTabsSidebar: g('game-tabs-sidebar'),
  gameDropdown: g('game-dropdown'),
  gameDropdownToggle: g('game-dropdown-toggle'),
  gameDropdownMenu: g('game-dropdown-menu'),
  gameDropdownLabel: g('game-dropdown-label'),
  invPopover: g('inv-popover'),
  invCardName: g('inv-card-name'),
  invGrading: g('inv-grading-select'),
  btnInvCart: g('btn-inv-cart'),
  invStockStatus: g('inv-stock-status'),
  invAdminSection: g('inv-admin-section'),
  invAdminQty: g('inv-admin-qty'),
  invAdminPrice: g('inv-admin-price'),
  btnInvAdminUpdate: g('btn-inv-admin-update'),
  btnInvAdminDelete: g('btn-inv-admin-delete'),
  invStatus: g('inv-status'),
  invClose: g('inv-popover-close'),
  btnAuth: g('btn-auth'),
  btnCart: g('btn-cart'),
  cartCount: g('cart-count'),
  btnInventory: g('btn-inventory'),
  invItemCount: g('inv-item-count'),
  authModal: g('auth-modal'),
  authEmail: g('auth-email'),
  authPassword: g('auth-password'),
  btnAuthLogin: g('btn-auth-login'),
  btnAuthRegister: g('btn-auth-register'),
  authError: g('auth-error'),
  authModalClose: g('auth-modal-close'),
  authModalBackdrop: g('auth-modal-backdrop'),
  cartModal: g('cart-modal'),
  cartList: g('cart-list'),
  cartTotal: g('cart-total'),
  btnCheckout: g('btn-checkout'),
  cartModalClose: g('cart-modal-close'),
  cartModalBackdrop: g('cart-modal-backdrop'),
};

// ── Theme toggle ─────────────────────────────────────────────────────────
(function() {
  const btn = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = 'dark';
  root.setAttribute('data-theme', theme);
  function setIcon(t) {
    if (!btn) return;
    btn.setAttribute('aria-label', `Switch to ${t === 'dark' ? 'light' : 'dark'} mode`);
    btn.innerHTML = t === 'dark'
      ? `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
      : `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }
  setIcon(theme);
  btn && btn.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    setIcon(theme);
  });
})();

// ── Utilities ─────────────────────────────────────────────────────────────
function parsePrice(str) {
  if (!str || str === '—') return null;
  return parseFloat(str.replace(/[$,]/g, '')) || null;
}
function fmt(n) {
  if (n == null) return '—';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function avg(arr) {
  const ns = arr.map(parsePrice).filter(n => n != null);
  return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : null;
}
function maxVal(arr) {
  const ns = arr.map(parsePrice).filter(n => n != null);
  return ns.length ? Math.max(...ns) : null;
}
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escA(s) {
  return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function fmtAge(sec) {
  if (sec == null) return 'unknown';
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.round(sec/60)}m ago`;
  return `${Math.round(sec/3600)}h ago`;
}

function storeKey(game, slug, cardId, grading) {
  return `${game}|${slug}|${cardId}|${grading}`;
}

async function loadStoreInventory(game, slug) {
  try {
    const res = await fetch(`${API}/api/store-inventory?game=${encodeURIComponent(game)}&set_slug=${encodeURIComponent(slug)}`);
    const items = await res.json();
    for (const key of S.storeInventory.keys()) {
      if (key.startsWith(`${game}|${slug}|`)) S.storeInventory.delete(key);
    }
    items.forEach(item => {
      S.storeInventory.set(storeKey(game, slug, item.card_number, item.grading), item);
    });
  } catch (err) {}
}

// ── Show/hide states ──────────────────────────────────────────────────────
function showState(name) {
  E.stateWelcome.style.display  = name === 'welcome'    ? 'flex' : 'none';
  E.stateLoading.style.display  = name === 'loading'    ? 'flex' : 'none';
  E.stateError.style.display    = name === 'error'      ? 'flex' : 'none';
  E.stateNoRes.style.display    = name === 'noresults'  ? 'flex' : 'none';
  E.tableWrap.style.display     = name === 'table'      ? 'block': 'none';
  E.stateSetsView.style.display = name === 'sets-view'  ? 'flex' : 'none';
  E.stateSaleView.style.display = name === 'sale-view'  ? 'flex' : 'none';
  E.stateInventoryView.style.display = name === 'inventory-view' ? 'flex' : 'none';
}

// ── Fetch ─────────────────────────────────────────────────────────────────
async function fetchGames() {
  if (!API) throw new Error('No API proxy — run: node server/server.js');
  const r = await fetch(`${API}/api/games`);
  return r.json();
}
function normName(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }

async function fetchTCGSet(slug, game) {
  if (!API) return { cards: [] };
  try {
    const r = await fetch(`${API}/api/tcgset?slug=${encodeURIComponent(slug)}&game=${encodeURIComponent(game)}`);
    return r.ok ? r.json() : { cards: [] };
  } catch (_) { return { cards: [] }; }
}

async function fetchSet(slug, force = false) {
  if (!API) throw new Error('No API proxy — run: node server/server.js');
  const url = `${API}/api/set?slug=${encodeURIComponent(slug)}&pages=5${force ? '&force=true' : ''}`;
  const r = await fetch(url);
  const d = await r.json();
  if (d.error && !d.cards?.length) throw new Error(d.error);
  return d;
}
// ── Game Tabs ─────────────────────────────────────────────────────────────
const GAME_ORDER = ['pokemon','mtg','yugioh','onepiece','lorcana','digimon','dragonball','gundam','swu','riftbound'];

function buildGameTabs() {
  [E.gameTabs, E.gameTabsSidebar].forEach(container => {
    if (!container) return;
    container.innerHTML = '';
    for (const key of GAME_ORDER) {
      const gd = S.games[key];
      if (!gd) continue;
      const btn = document.createElement('button');
      btn.className = 'game-tab' + (key === S.game ? ' active' : '');
      btn.role = 'tab';
      btn.dataset.game = key;
      btn.setAttribute('aria-selected', key === S.game ? 'true' : 'false');
      const dot = `<span class="tab-dot" style="background:${ACCENTS[key]?.accent || '#aaa'}"></span>`;
      btn.innerHTML = `${dot}${esc(gd.label)}`;
      btn.addEventListener('click', () => switchGame(key));
      container.appendChild(btn);
    }
  });
}

function switchGame(key) {
  if (key === S.game) return;
  S.game = key;
  S.slug = null;
  S.allCards = [];
  S.visibleCards = [];
  S.query = '';
  S.setQuery = '';
  loadStatsFromStorage(); // load stats for new game (keep other games' stats)
  E.cardSearch.value = '';
  E.setSearch.value = '';

  applyAccent(key);
  document.querySelectorAll('.game-tab').forEach(t => {
    const active = t.dataset.game === key;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  // Update dropdown label and close
  if (E.gameDropdownLabel && S.games[key]) {
    E.gameDropdownLabel.textContent = S.games[key].label;
  }
  closeGameDropdown();

  E.setTitle.textContent = 'Select a set';
  E.setExtLink.style.display = 'none';
  E.statsBar.style.display = 'none';
  E.footerBar.style.display = 'none';

  // Exit special views when switching games
  if (S.saleView) { S.saleView = false; E.btnViewSale.classList.remove('active'); }
  if (S.inventoryView) { S.inventoryView = false; E.btnInventory.classList.remove('active'); }

  if (S.setsView) {
    renderSetsOverview();
    showState('sets-view');
  } else {
    showState('welcome');
  }
  renderSetList();
  updateCachePill();
  updateLoadQueueUI();
  pushState();
}

// ── Set list ──────────────────────────────────────────────────────────────
function getFilteredSets() {
  let sets = S.games[S.game]?.sets || [];
  const q = S.setQuery.toLowerCase().trim();
  if (q) sets = sets.filter(s => s.name.toLowerCase().includes(q));

  // Sort by release date, most recent first
  return sets.sort((a, b) => {
    const dateA = a.released ? new Date(a.released).getTime() : -1;
    const dateB = b.released ? new Date(b.released).getTime() : -1;
    return dateB - dateA;
  });
}

function renderSetList() {
  const sets = getFilteredSets();
  E.setBadge.textContent = sets.length;
  E.setSkeleton && (E.setSkeleton.style.display = 'none');

  // Clear existing items (keep skeleton node)
  Array.from(E.setList.children).forEach(ch => {
    if (ch.id !== 'set-skeleton') ch.remove();
  });

  if (sets.length === 0) {
    const msg = document.createElement('div');
    msg.style.cssText = 'padding:1rem;font-size:var(--text-xs);color:var(--faint);text-align:center';
    msg.textContent = S.setQuery ? 'No sets match' : 'No sets available';
    E.setList.appendChild(msg);
    return;
  }

  // Render in chunks to keep UI responsive for large lists
  const CHUNK = 80;
  let i = 0;
  function renderChunk() {
    const frag = document.createDocumentFragment();
    const end = Math.min(i + CHUNK, sets.length);
    for (; i < end; i++) {
      const s = sets[i];
      const btn = document.createElement('button');
      btn.className = 'set-item' + (s.slug === S.slug ? ' active' : '');
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', s.slug === S.slug ? 'true' : 'false');
      btn.dataset.slug = s.slug;
      btn.dataset.name = s.name;
      btn.textContent = s.name;
      btn.addEventListener('click', () => loadSet(s.slug, s.name, btn));
      frag.appendChild(btn);
    }
    E.setList.appendChild(frag);
    if (i < sets.length) requestAnimationFrame(renderChunk);
  }
  renderChunk();
}

// ── Load set ───────────────────────────────────────────────────────────────
async function loadSet(slug, name, btn) {
  // Exit other views if active (loadSet will handle the state transition itself)
  if (S.setsView) exitSetsView(false);
  if (S.saleView) exitSaleView(false);
  if (S.inventoryView) exitInventoryView();
  // Close mobile sidebar when user selects a set
  if (isMobile()) closeSidebar();
  if (S.slug === slug && S.allCards.length > 0) {
    // Set already loaded — just make sure the table is visible (e.g. navigating from sets view)
    renderCards();
    updateStats();
    return;
  }
  S.slug = slug;
  const lid = ++S.loadId;

  // Update sidebar active state
  document.querySelectorAll('.set-item').forEach(el => {
    el.classList.remove('active', 'loading');
    el.setAttribute('aria-selected', 'false');
  });
  if (btn) { btn.classList.add('active', 'loading'); btn.setAttribute('aria-selected','true'); }

  E.setTitle.textContent = name;
  E.setExtLink.style.display = 'none';
  E.statsBar.style.display = 'none';
  E.footerBar.style.display = 'none';
  E.loadingLabel.textContent = `Loading ${name}…`;
  showState('loading');

  // Server handles retries (3 attempts with 1–1.5s backoff), so one call here is enough.
  try {
    const data = await fetchSet(slug);
    if (lid !== S.loadId) return;

    S.allCards = data.cards || [];
    // Populate card cache for owned products view
    for (const card of S.allCards) {
      const cacheKey = `${S.game}|${slug}|${card.id}`;
      S.cardCache.set(cacheKey, card);
    }
    saveProductsToStorage();
    if (btn) btn.classList.remove('loading');

    // Clean up title
    const cleanTitle = (data.title || name)
      .replace(/^Prices for\s+/i, '')
      .replace(/\s+(?:Pokemon|Magic|YuGiOh|Star Wars|One Piece|Digimon|Dragon Ball|Lorcana|Gundam|Riftbound)\s+Cards.*$/i, '')
      .trim();
    E.setTitle.textContent = cleanTitle || name;

    if (data.source) {
      E.setExtLink.href = data.source;
      E.setExtLink.style.display = 'inline';
    }

    // Cache age indicator
    if (data.fromCache && data.cachedAt) {
      const ageSec = Math.round((Date.now() - data.cachedAt) / 1000);
      E.statCache.style.display = 'flex';
      E.statCacheAge.textContent = fmtAge(ageSec);
      S.cacheAgeSeconds = ageSec;
    } else {
      E.statCache.style.display = 'none';
      S.cacheAgeSeconds = 0;
    }
    const mins = Math.round(S.cacheAgeSeconds / 60);
    E.cachePill.textContent = `Sets: ${S.cacheSets} · ${mins}m old`;
    E.cachePill.className = `cache-pill${S.cacheAgeSeconds < 120 ? ' fresh' : ''}`;

    S.query = '';
    E.cardSearch.value = '';
    E.cardSearch.placeholder = 'Search cards…';
    S.sort = 'default';
    E.sortSelect.value = 'default';
    document.querySelectorAll('.price-table th.sortable').forEach(t => t.classList.remove('sort-active'));

    cacheSetStats(slug, S.allCards);
    await loadStoreInventory(S.game, slug);

    // Clear stale TCG data before rendering, then fetch in background
    S.tcgCards.clear();
    renderCards();
    updateStats();
    pushState();

    // Kick off TCGPlayer fetch in background — re-renders when it arrives
    const tcgLid = S.loadId;
    fetchTCGSet(slug, S.game).then(tcgData => {
      if (S.loadId !== tcgLid) return; // stale — user switched set
      S.tcgCards.clear();
      for (const c of (tcgData.cards || [])) S.tcgCards.set(normName(c.name), c);
      renderCards();
    });
  } catch (err) {
    if (lid !== S.loadId) return;
    if (btn) btn.classList.remove('loading', 'active');
    E.errorMsg.textContent = err?.message || 'Failed to load. Try again.';
    showState('error');
  }
}

// ── Stats ──────────────────────────────────────────────────────────────────
function updateStats() {
  if (!S.allCards.length) { E.statsBar.style.display = 'none'; return; }
  E.statsBar.style.display = 'flex';
  const regularCards = S.allCards.filter(c => !c.sealed);
  E.statCount.textContent  = regularCards.length;
  E.statAvg.textContent    = fmt(avg(regularCards.map(c => c.ungraded)));
  E.statMax.textContent    = fmt(maxVal(regularCards.map(c => c.ungraded)));
  E.statPsa10.textContent  = fmt(maxVal(regularCards.map(c => c.psa10)));
}

// ── URL Routing ────────────────────────────────────────────────────────────
function buildPath() {
  // Build path from current state: /{game}[/{slug}][/sets-overview][/on-sale][/inventory]
  let path = `/${S.game}`;
  if (S.setsView) {
    path += '/sets-overview';
  } else if (S.saleView) {
    path += '/on-sale';
  } else if (S.inventoryView) {
    path += '/inventory';
  } else if (S.slug) {
    path += `/${encodeURIComponent(S.slug)}`;
  }
  return path;
}

function pushState() {
  const path = buildPath();
  window.history.pushState(
    { game: S.game, slug: S.slug, setsView: S.setsView, saleView: S.saleView, inventoryView: S.inventoryView },
    '',
    path
  );
}

async function restoreFromUrl() {
  const path = location.pathname;
  const parts = path.split('/').filter(Boolean); // remove empty strings from leading/trailing /

  // Default to welcome state
  if (parts.length === 0) {
    S.setsView = false;
    S.saleView = false;
    S.inventoryView = false;
    S.slug = null;
    return;
  }

  const gameKey = parts[0];
  // Verify game exists
  if (!S.games[gameKey]) return;
  if (gameKey !== S.game) {
    S.game = gameKey;
    applyAccent(gameKey);
    loadStatsFromStorage();
    buildGameTabs();
    if (E.gameDropdownLabel && S.games[gameKey]) {
      E.gameDropdownLabel.textContent = S.games[gameKey].label;
    }
    document.querySelectorAll('.game-tab').forEach(t => {
      const active = t.dataset.game === gameKey;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  // Check for /sets-overview flag
  if (parts[parts.length - 1] === 'sets-overview') {
    S.setsView = true;
    S.saleView = false;
    S.inventoryView = false;
    E.btnViewSets.classList.add('active');
    E.btnViewSale.classList.remove('active');
    E.cardSearch.value = '';
    E.cardSearch.placeholder = 'Filter sets…';
    renderSetList();
    renderSetsOverview();
    showState('sets-view');
    return;
  }

  // Check for /on-sale flag
  if (parts[parts.length - 1] === 'on-sale') {
    S.saleView = true;
    S.setsView = false;
    S.inventoryView = false;
    E.btnViewSale.classList.add('active');
    E.btnViewSets.classList.remove('active');
    E.cardSearch.value = '';
    E.cardSearch.placeholder = 'Filter sale items…';
    renderSetList();
    renderSaleView();
    showState('sale-view');
    return;
  }

  // Check for /inventory flag
  if (parts[parts.length - 1] === 'inventory') {
    S.inventoryView = true;
    S.setsView = false;
    S.saleView = false;
    E.btnInventory.classList.add('active');
    E.btnViewSets.classList.remove('active');
    E.btnViewSale.classList.remove('active');
    renderSetList();
    renderInventoryTable();
    showState('inventory-view');
    return;
  }

  // Otherwise load set if slug is present
  if (parts.length >= 2) {
    const slug = decodeURIComponent(parts[1]);
    const setInfo = S.games[gameKey]?.sets?.find(s => s.slug === slug);
    if (setInfo) {
      S.slug = slug;
      S.setsView = false;
      S.saleView = false;
      S.inventoryView = false;
      E.btnViewSets.classList.remove('active');
      E.btnViewSale.classList.remove('active');
      E.btnInventory.classList.remove('active');
      await loadSet(slug, setInfo.name);
    }
  } else {
    // Just game selected, no set
    S.slug = null;
    S.setsView = false;
    S.saleView = false;
    S.inventoryView = false;
    renderSetList();
    showState('welcome');
  }
}

// ── Render cards ────────────────────────────────────────────────────────────
const HOT_U   = 100;   // highlight ungraded ≥ $100
const GEM_P10 = 500;   // highlight PSA10 ≥ $500

function getGlobalSearchResults(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  // Search across all cached cards and group by set
  const results = new Map(); // slug → { setName, cards: [] }

  for (const [cacheKey, card] of S.cardCache) {
    if (!card.name.toLowerCase().includes(q)) continue;
    const [game, slug] = cacheKey.split('|');
    if (game !== S.game) continue;

    if (!results.has(slug)) {
      // Find set name from loaded sets
      const setInfo = S.games[S.game]?.sets?.find(s => s.slug === slug);
      results.set(slug, { setName: setInfo?.name || slug, cards: [] });
    }
    results.get(slug).cards.push(card);
  }

  return results;
}

function getProcessedCards() {
  let cards = [...S.allCards];
  const q = S.query.toLowerCase().trim();
  if (q) cards = cards.filter(c => c.name.toLowerCase().includes(q));

  // Split sealed from individual cards
  const sealed = cards.filter(c => c.sealed);
  const individual = cards.filter(c => !c.sealed);

  // Sort each group independently
  const sortGroup = (arr) => {
    switch (S.sort) {
      case 'price-desc':  arr.sort((a,b) => (parsePrice(b.ungraded)||0) - (parsePrice(a.ungraded)||0)); break;
      case 'price-asc':   arr.sort((a,b) => (parsePrice(a.ungraded)||0) - (parsePrice(b.ungraded)||0)); break;
      case 'psa10-desc':  arr.sort((a,b) => (parsePrice(b.psa10)||0)    - (parsePrice(a.psa10)||0));    break;
      case 'grade9-desc': arr.sort((a,b) => (parsePrice(b.grade9)||0)   - (parsePrice(a.grade9)||0));   break;
      case 'name-asc':    arr.sort((a,b) => a.name.localeCompare(b.name)); break;
    }
    return arr;
  };

  if (sealed.length > 0) {
    // Sealed always pinned to top, then individual cards
    return [...sortGroup(sealed), ...sortGroup(individual)];
  }
  return sortGroup(individual);
}

function renderCards() {
  const cards = getProcessedCards();
  S.visibleCards = cards;

  if (!cards.length && S.query) {
    E.noResQ.textContent = S.query;
    showState('noresults');
    E.footerBar.style.display = 'none';
    return;
  }
  if (!S.allCards.length) { showState('welcome'); return; }

  showState('table');

  // Setup pagination
  S.pagination.cards.total = cards.length;
  S.pagination.cards.rendered = 0;

  E.tbody.innerHTML = '';
  E.footerBar.style.display = 'flex';
  const totalLabel = `${cards.length} cards`;
  E.footerCount.textContent = totalLabel;

  // Setup infinite scroll first (creates sentinel) before loading items
  setupInfiniteScroll('#price-tbody', 'cards');
  // Load first batch
  loadMoreItems('cards');
}

function renderGlobalSearchResults(query) {
  const globalResults = getGlobalSearchResults(query);
  if (globalResults.size === 0) {
    E.noResQ.textContent = query;
    showState('noresults');
    E.footerBar.style.display = 'none';
    return;
  }

  showState('table');
  const frag = document.createDocumentFragment();
  let totalResults = 0;

  // Sort results by set name
  const sortedSets = Array.from(globalResults.entries()).sort((a, b) =>
    a[1].setName.localeCompare(b[1].setName)
  );

  for (const [slug, { setName, cards }] of sortedSets) {
    // Set divider
    const setDiv = document.createElement('tr');
    setDiv.className = 'section-divider';
    setDiv.innerHTML = `<td colspan="7"><span class="section-label">${esc(setName)} <span class="section-count">${cards.length}</span></span></td>`;
    frag.appendChild(setDiv);

    // Render cards for this set
    const sealed = cards.filter(c => c.sealed);
    const individual = cards.filter(c => !c.sealed);
    let rowNum = totalResults;

    sealed.forEach(card => {
      const tr = document.createElement('tr');
      tr.className = 'card-row sealed-row';
      const uv = parsePrice(card.ungraded);
      const uClass = `price price-u${uv && uv >= HOT_U ? ' hot' : ''}`;
      const u2Class = card.ungraded === '—' ? 'price price-nil' : uClass;
      const g9Class = card.grade9 === '—' ? 'price price-nil' : 'price price-g9';
      const pv = parsePrice(card.psa10);
      const pClass = `price price-p10${pv && pv >= GEM_P10 ? ' gem' : ''}`;
      tr.innerHTML = `
        <td class="td-num">${++rowNum}</td>
        <td class="td-img">
          ${card.img
            ? `<img class="card-thumb" src="${escA(card.img)}" alt="${escA(card.name)}" loading="lazy" onerror="this.outerHTML='<div class=\\'card-thumb-ph\\'>📦</div>'">`
            : `<div class="card-thumb-ph">📦</div>`}
        </td>
        <td><a class="card-link" href="${escA(card.url)}" target="_blank" rel="noopener">${esc(card.name)}</a></td>
        <td class="td-price"><span class="${u2Class}">${esc(card.ungraded)}</span></td>
        <td class="td-price td-grade9"><span class="${g9Class}">${esc(card.grade9)}</span></td>
        <td class="td-price td-psa10"><span class="${pCard(card.psa10, pClass)}">${esc(card.psa10)}</span></td>
        <td class="td-action"><button class="btn-dots" data-card-id="${escA(card.id)}" aria-label="Options">⋮</button></td>`;
      frag.appendChild(tr);
    });

    individual.forEach(card => {
      const tr = document.createElement('tr');
      tr.className = 'card-row';
      const uv = parsePrice(card.ungraded);
      const pv = parsePrice(card.psa10);
      const uClass = `price price-u${uv && uv >= HOT_U ? ' hot' : ''}`;
      const pClass  = `price price-p10${pv && pv >= GEM_P10 ? ' gem' : ''}`;
      const g9Class = card.grade9 === '—' ? 'price price-nil' : 'price price-g9';
      const u2Class = card.ungraded === '—' ? 'price price-nil' : uClass;
      tr.innerHTML = `
        <td class="td-num">${++rowNum}</td>
        <td class="td-img">
          ${card.img
            ? `<img class="card-thumb" src="${escA(card.img)}" alt="${escA(card.name)}" loading="lazy" onerror="this.outerHTML='<div class=\\'card-thumb-ph\\'>🃏</div>'">`
            : `<div class="card-thumb-ph">🃏</div>`}
        </td>
        <td><a class="card-link" href="${escA(card.url)}" target="_blank" rel="noopener">${esc(card.name)}</a></td>
        <td class="td-price"><span class="${u2Class}">${esc(card.ungraded)}</span></td>
        <td class="td-price td-grade9"><span class="${g9Class}">${esc(card.grade9)}</span></td>
        <td class="td-price td-psa10"><span class="${pCard(card.psa10, pClass)}">${esc(card.psa10)}</span></td>
        <td class="td-action"><button class="btn-dots" data-card-id="${escA(card.id)}" aria-label="Options">⋮</button></td>`;
      frag.appendChild(tr);
    });

    totalResults += cards.length;
  }

  E.tbody.innerHTML = '';
  E.tbody.appendChild(frag);
  E.footerBar.style.display = 'flex';
  E.footerCount.textContent = `${totalResults} results across ${globalResults.size} sets`;
}

function pCard(p, cls) {
  return p === '—' ? 'price price-nil' : cls;
}

// ── Search & sort events ──────────────────────────────────────────────────
function filterSetsOverview(query) {
  const q = query.toLowerCase().trim();
  E.setsOvTbody.querySelectorAll('tr.sov-row').forEach(row => {
    const name = row.querySelector('.sov-set-name')?.textContent?.toLowerCase() || '';
    row.style.display = !q || name.includes(q) ? '' : 'none';
  });
}

let searchTimer;
E.cardSearch.addEventListener('input', e => {
  if (S.setsView) { filterSetsOverview(e.target.value); return; }
  if (S.saleView) { filterSaleView(e.target.value); return; }

  const query = e.target.value;
  clearTimeout(searchTimer);

  // If no set is loaded, do global search across all cached products
  if (!S.slug) {
    if (!query.trim()) {
      showState('welcome');
      return;
    }
    searchTimer = setTimeout(() => renderGlobalSearchResults(query), 160);
  } else {
    // Otherwise search within current set
    S.query = query;
    searchTimer = setTimeout(renderCards, 160);
  }
});

function sortSetsOverview(sortValue) {
  const rows = Array.from(E.setsOvTbody.querySelectorAll('tr.sov-row'));
  const stat = (row, key) => S.setStats.get(row.dataset.slug)?.[key] ?? null;
  const nullsLast = (a, b, desc) => {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    return desc ? b - a : a - b;
  };
  rows.sort((a, b) => {
    switch (sortValue) {
      case 'name-asc':    return (a.querySelector('.sov-set-name')?.textContent || '').localeCompare(b.querySelector('.sov-set-name')?.textContent || '');
      case 'price-desc':  return nullsLast(stat(a, 'avgUngraded'), stat(b, 'avgUngraded'), true);
      case 'price-asc':   return nullsLast(stat(a, 'avgUngraded'), stat(b, 'avgUngraded'), false);
      case 'psa10-desc':  return nullsLast(stat(a, 'topPsa10'),    stat(b, 'topPsa10'),    true);
      case 'grade9-desc': return nullsLast(stat(a, 'topUngraded'), stat(b, 'topUngraded'), true);
      default: { // restore original index order
        const ai = parseInt(a.querySelector('.td-num')?.textContent || 0);
        const bi = parseInt(b.querySelector('.td-num')?.textContent || 0);
        return ai - bi;
      }
    }
  });
  const frag = document.createDocumentFragment();
  rows.forEach(r => frag.appendChild(r));
  E.setsOvTbody.appendChild(frag);
}

E.sortSelect.addEventListener('change', e => {
  if (S.setsView) { sortSetsOverview(e.target.value); return; }
  S.sort = e.target.value;
  document.querySelectorAll('.price-table th.sortable').forEach(t => t.classList.remove('sort-active'));
  renderCards();
});

document.querySelectorAll('.price-table th.sortable').forEach(th => {
  th.addEventListener('click', () => {
    const col = th.dataset.col;
    const map = { ungraded: 'price-desc', grade9: 'grade9-desc', psa10: 'psa10-desc' };
    const rev = { 'price-desc': 'price-asc', 'grade9-desc': 'price-asc', 'psa10-desc': 'price-asc' };
    S.sort = S.sort === map[col] ? rev[S.sort] : map[col];
    E.sortSelect.value = S.sort;
    document.querySelectorAll('.price-table th.sortable').forEach(t => t.classList.remove('sort-active'));
    th.classList.add('sort-active');
    renderCards();
  });
});

// ── Set search ────────────────────────────────────────────────────────────
let setSearchTimer;
E.setSearch.addEventListener('input', e => {
  S.setQuery = e.target.value;
  clearTimeout(setSearchTimer);
  setSearchTimer = setTimeout(renderSetList, 150);
});

// ── Retry ──────────────────────────────────────────────────────────────────
E.btnRetry.addEventListener('click', () => {
  if (S.slug) {
    const btn = document.querySelector(`.set-item[data-slug="${CSS.escape(S.slug)}"]`);
    loadSet(S.slug, btn ? btn.dataset.name : S.slug, btn);
  }
});

// ── Cache pill ─────────────────────────────────────────────────────────────
let isRefreshingCache = false;

function updateCachePillDisplay() {
  S.cacheAgeSeconds += 60; // Increment by 1 minute
  const mins = Math.round(S.cacheAgeSeconds / 60);
  E.cachePill.textContent = `Sets: ${S.cacheSets} · ${mins}m old`;
  E.cachePill.className = `cache-pill${S.cacheAgeSeconds < 120 ? ' fresh' : ''}`;
}

async function updateCachePill() {
  if (!API) return;
  try {
    const r = await fetch(`${API}/api/cache-status`);
    const status = await r.json();
    const cur = status[S.game];
    if (cur && cur.ageSeconds != null) {
      S.cacheAgeSeconds = cur.ageSeconds;
      S.cacheSets = cur.sets;
      const mins = Math.round(cur.ageSeconds / 60);
      const nextMins = cur.nextRefreshIn ? Math.round(cur.nextRefreshIn / 60) : null;
      E.cachePill.textContent = `Sets: ${cur.sets} · ${mins}m old`;
      E.cachePill.className = `cache-pill${cur.ageSeconds < 120 ? ' fresh' : ''}`;
      E.cachePill.title = nextMins ? `Next refresh in ~${nextMins}m` : 'Refreshing hourly — Click to refresh now';
      E.statCache.style.cursor = 'pointer';
      E.cachePill.style.cursor = 'pointer';
    }
  } catch { /* silent */ }
}

async function refreshCacheNow() {
  if (!API || isRefreshingCache) return;
  isRefreshingCache = true;
  const originalText = E.cachePill.textContent;
  E.cachePill.textContent = 'Refreshing all…';
  E.cachePill.style.opacity = '0.6';
  E.statCache.style.opacity = '0.6';
  try {
    // Refresh cache for all games
    for (const gameKey of GAME_ORDER) {
      if (!S.games[gameKey]) continue;
      try {
        await fetch(`${API}/api/refresh-cache?game=${encodeURIComponent(gameKey)}`);
      } catch (err) {
      }
    }
    // Wait for server to complete
    await new Promise(r => setTimeout(r, 2000));

    // Clear in-memory card cache to force fresh fetch
    S.cardCache.clear();

    // Update status
    await updateCachePill();

    // If a set is currently loaded, reload its card prices
    if (S.slug) {
      S.allCards = [];
      const btn = document.querySelector(`.set-item[data-slug="${CSS.escape(S.slug)}"]`);
      await loadSet(S.slug, btn ? btn.dataset.name : S.slug, btn);
    }

    // If sets overview is open, load all stats
    if (S.setsView) {
      await loadAllStats();
    }
  } catch (err) {
    E.cachePill.textContent = originalText;
  } finally {
    E.cachePill.style.opacity = '1';
    E.statCache.style.opacity = '1';
    isRefreshingCache = false;
  }
}

// ── LocalStorage: Set stats cache ─────────────────────────────────────────
const LS_STATS_KEY = 'tcg-set-stats-v2';
const LS_STATS_TTL_MS = 60 * 60 * 1000; // 1 hour (matches server cache)
const LS_PRODUCTS_KEY = 'tcg-products-v1';
const LS_PRODUCTS_TTL_MS = 60 * 60 * 1000; // 1 hour (matches server cache)

function loadStatsFromStorage() {
  try {
    const raw = localStorage.getItem(LS_STATS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return;

    // Extract stats for current game
    const gameStats = parsed[S.game];
    if (!gameStats || typeof gameStats !== 'object') return;

    const now = Date.now();
    let loaded = 0, expired = 0;
    for (const [slug, rec] of Object.entries(gameStats)) {
      if (!rec || typeof rec !== 'object') continue;
      if (now - (rec.cachedAt || 0) > LS_STATS_TTL_MS) { expired++; continue; }
      const { cachedAt, ...stats } = rec;
      S.setStats.set(slug, stats);
      loaded++;
    }
    if (expired > 0) saveStatsToStorage(); // rewrite without expired entries
  } catch (e) {
  }
}

let saveStatsTimer = null;
function saveStatsToStorage() {
  clearTimeout(saveStatsTimer);
  saveStatsTimer = setTimeout(() => {
    try {
      const raw = localStorage.getItem(LS_STATS_KEY);
      let data = {};
      try {
        if (raw) data = JSON.parse(raw);
      } catch {}

      // Update only current game's stats, preserve other games
      const entries = {};
      const now = Date.now();
      for (const [slug, stats] of S.setStats.entries()) {
        entries[slug] = { ...stats, cachedAt: stats.cachedAt || now };
      }
      data[S.game] = entries;

      localStorage.setItem(LS_STATS_KEY, JSON.stringify(data));
    } catch (e) {
    }
  }, 300);
}

function loadProductsFromStorage() {
  try {
    const raw = localStorage.getItem(LS_PRODUCTS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return;

    const now = Date.now();
    let loaded = 0, expired = 0;
    for (const [cacheKey, rec] of Object.entries(parsed)) {
      if (!rec || typeof rec !== 'object' || !rec.card) continue;
      if (now - (rec.cachedAt || 0) > LS_PRODUCTS_TTL_MS) { expired++; continue; }
      S.cardCache.set(cacheKey, rec.card);
      loaded++;
    }
    if (expired > 0) saveProductsToStorage(); // rewrite without expired entries
  } catch (e) {
  }
}

let saveProductsTimer = null;
function saveProductsToStorage() {
  clearTimeout(saveProductsTimer);
  saveProductsTimer = setTimeout(() => {
    try {
      const entries = {};
      const now = Date.now();
      for (const [cacheKey, card] of S.cardCache.entries()) {
        entries[cacheKey] = { card, cachedAt: now };
      }
      localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(entries));
    } catch (e) {
    }
  }, 500);
}

// ── Sets Overview ─────────────────────────────────────────────────────────
function calcStats(cards) {
  const regular = cards.filter(c => !c.sealed);
  const ungraded = regular.map(c => parsePrice(c.ungraded)).filter(n => n != null);
  const psa10    = regular.map(c => parsePrice(c.psa10)).filter(n => n != null);
  return {
    count:       regular.length,
    avgUngraded: ungraded.length ? ungraded.reduce((a,b) => a+b, 0) / ungraded.length : null,
    topUngraded: ungraded.length ? Math.max(...ungraded) : null,
    topPsa10:    psa10.length    ? Math.max(...psa10)    : null,
  };
}

function cacheSetStats(slug, cards) {
  const stats = calcStats(cards);
  stats.cachedAt = Date.now();
  S.setStats.set(slug, stats);
  saveStatsToStorage();
  // Update row in sets overview if it's currently visible
  const row = E.setsOvTbody?.querySelector(`tr[data-slug="${CSS.escape(slug)}"]`);
  if (row) updateSovRow(row, stats);
}

function updateSovRow(row, stats) {
  const cells = row.querySelectorAll('td');
  if (cells.length < 7) return;
  cells[2].textContent = stats.count;
  cells[3].innerHTML = `<span class="sov-price">${fmt(stats.avgUngraded)}</span>`;
  cells[4].innerHTML = `<span class="sov-price">${fmt(stats.topUngraded)}</span>`;
  cells[5].innerHTML = `<span class="sov-price-psa">${fmt(stats.topPsa10)}</span>`;
  cells[6].innerHTML = '';
}

function enterSetsView() {
  if (S.setsView) { exitSetsView(); return; }
  // Exit other views if active
  if (S.saleView) exitSaleView(false);
  if (S.inventoryView) exitInventoryView();
  S.setsView = true;
  S.saleView = false;
  S.inventoryView = false;
  E.btnViewSets.classList.add('active');
  E.btnViewSale.classList.remove('active');
  E.btnInventory.classList.remove('active');
  E.statsBar.style.display = 'none';
  E.footerBar.style.display = 'none';
  E.setExtLink.style.display = 'none';
  // Clear card search, reset sort, deselect sidebar items
  E.cardSearch.value = '';
  E.cardSearch.placeholder = 'Filter sets…';
  E.sortSelect.value = 'default';
  document.querySelectorAll('.set-item').forEach(el => {
    el.classList.remove('active');
    el.setAttribute('aria-selected', 'false');
  });
  renderSetsOverview();
  showState('sets-view');
  pushState();
}

function exitSetsView(restoreState = true) {
  S.setsView = false;
  E.btnViewSets.classList.remove('active');
  E.cardSearch.value = '';
  E.cardSearch.placeholder = S.slug ? 'Search cards…' : 'Search all products…';
  E.sortSelect.value = S.sort; // restore card sort state
  // Re-highlight the active sidebar item if a set was loaded
  if (S.slug) {
    const activeItem = document.querySelector(`.set-item[data-slug="${CSS.escape(S.slug)}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
      activeItem.setAttribute('aria-selected', 'true');
    }
  }
  if (!restoreState) return;
  if (S.slug && S.allCards.length) {
    E.statsBar.style.display = 'flex';
    E.footerBar.style.display = 'flex';
    showState('table');
  } else {
    showState('welcome');
  }
  pushState();
}

// ── On Sale View ──────────────────────────────────────────────────────────
async function enterSaleView() {
  if (S.saleView) { exitSaleView(); return; }
  // Exit other views if active
  if (S.setsView) exitSetsView(false);
  if (S.inventoryView) exitInventoryView();
  S.saleView = true;
  S.setsView = false;
  S.inventoryView = false;
  E.btnViewSale.classList.add('active');
  E.btnViewSets.classList.remove('active');
  E.btnInventory.classList.remove('active');
  E.statsBar.style.display = 'none';
  E.footerBar.style.display = 'none';
  E.setExtLink.style.display = 'none';
  E.cardSearch.value = '';
  E.cardSearch.placeholder = 'Filter sale items…';
  E.sortSelect.value = 'default';
  document.querySelectorAll('.set-item').forEach(el => {
    el.classList.remove('active');
    el.setAttribute('aria-selected', 'false');
  });
  // Reload inventory to get latest items added after page load
  await loadInventory();
  renderSaleView();
  showState('sale-view');
  pushState();
}

function exitSaleView(restoreState = true) {
  S.saleView = false;
  E.btnViewSale.classList.remove('active');
  E.saleSearch.value = '';
  if (!restoreState) return;
  if (S.slug && S.allCards.length) {
    E.statsBar.style.display = 'flex';
    E.footerBar.style.display = 'flex';
    E.setExtLink.style.display = '';
    E.cardSearch.value = '';
    E.cardSearch.placeholder = 'Search cards…';
    showState('table');
  } else {
    showState('welcome');
  }
  pushState();
}

// Cache product images to localStorage as data URLs
async function cacheImagesToLocalStorage(items) {
  // Collect unique cards that need caching
  const cardsToCache = new Set();
  for (const item of items) {
    const card = item.cardData || S.cardCache.get(`${item.game}|${item.set_slug}|${item.card_number}`);
    if (card && card.img && !card.img.startsWith('data:')) {
      cardsToCache.add(card);
    }
  }

  // Download and cache each image as data URL
  for (const card of cardsToCache) {
    try {
      const res = await fetch(card.img);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => {
        card.img = reader.result; // Replace with data URL
        saveProductsToStorage(); // Persist to localStorage
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      // Network error, keep original URL
    }
  }
}

function renderSaleView() {
  // Fetch all sale items from inventory (must have price and available stock)
  const allItems = [];
  for (const item of S.adminInventory) {
    if (item.price_cents > 0 && item.available_stock > 0) {
      allItems.push(item);
    }
  }
  S.saleCards = allItems;

  // Start caching images in background
  cacheImagesToLocalStorage(allItems);

  E.setTitle.textContent = `On Sale — ${allItems.length} Items`;
  E.saleTbody.innerHTML = '';

  // Setup pagination
  S.pagination.sale.total = allItems.length;
  S.pagination.sale.rendered = 0;

  // Setup infinite scroll first (creates sentinel) before loading items
  setupInfiniteScroll('#sale-tbody', 'sale');
  // Load first batch
  loadMoreItems('sale');
}

function filterSaleView(query) {
  const q = query.toLowerCase().trim();
  E.saleTbody.querySelectorAll('tr.sale-row').forEach(row => {
    const cardName = row.querySelector('.td-name')?.textContent?.toLowerCase() || '';
    const setName = row.querySelector('.td-name:nth-child(2)')?.textContent?.toLowerCase() || '';
    const matches = !q || cardName.includes(q) || setName.includes(q);
    row.style.display = matches ? '' : 'none';
  });
}

function markQueuedRows(gameKey) {
  // Mark row that is currently processing (in-flight) with spinners and restore row references
  const q = getGameQueue(gameKey);
  const queuedSlugs = new Set(q.queue.map(item => item.slug));

  E.setsOvTbody.querySelectorAll('tr[data-slug]').forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 7) {
      if (q.inFlight && q.inFlight.slug === row.dataset.slug) {
        // Show spinners only on the item currently being processed
        cells[2].innerHTML = '<span class="sov-spinner"></span>';
        cells[3].innerHTML = '<span class="sov-spinner"></span>';
        cells[4].innerHTML = '<span class="sov-spinner"></span>';
        cells[5].innerHTML = '<span class="sov-spinner"></span>';
        cells[6].innerHTML = '';
      } else if (queuedSlugs.has(row.dataset.slug)) {
        // Just restore row reference for queued items (no spinners)
        const item = q.queue.find(i => i.slug === row.dataset.slug);
        if (item) item.row = row;
      }
    }
  });

  // Resume processing for this game if queue has items and not already processing
  if (q.queue.length > 0 && !q.processing) {
    processLoadQueue(gameKey);
  }
}

function renderSetsOverview() {
  const game   = S.games[S.game];
  const sets   = game?.sets || [];
  const label  = game?.label || 'Sets';
  E.setsOvTitle.textContent = `${label} — ${sets.length} Sets`;
  E.setsOvTbody.innerHTML = '';

  // Setup pagination
  S.pagination.sets.total = sets.length;
  S.pagination.sets.rendered = 0;

  // Setup infinite scroll first (creates sentinel) before loading items
  setupInfiniteScroll('#sets-ov-tbody', 'sets');
  // Load first batch
  loadMoreItems('sets');

  // Mark queued rows after initial render
  setTimeout(() => markQueuedRows(S.game), 0);
}

async function loadSetStatsRow(slug, name, row, force = false) {
  // Show spinners in stat cells
  const cells = row.querySelectorAll('td');
  if (cells.length >= 7) {
    cells[2].innerHTML = '<span class="sov-spinner"></span>';
    cells[3].innerHTML = '<span class="sov-spinner"></span>';
    cells[4].innerHTML = '<span class="sov-spinner"></span>';
    cells[5].innerHTML = '<span class="sov-spinner"></span>';
    cells[6].innerHTML = '';
  }
  // Server handles HTTP retries. We only retry here once if we get 0 cards
  // back while forcing a refresh — a fallback to the cached copy.
  try {
    let data = await fetchSet(slug, force);
    let cards = data.cards || [];
    if (cards.length === 0 && force) {
      data = await fetchSet(slug, false);
      cards = data.cards || [];
    }
    if (cards.length > 0) {
      // Inline the cache + row update — avoids a querySelector that can fail
      // with slugs containing special chars (e.g. &).
      const stats = calcStats(cards);
      stats.cachedAt = Date.now();
      S.setStats.set(slug, stats);

      // Also cache the products for global search
      for (const card of cards) {
        const cacheKey = `${S.game}|${slug}|${card.id}`;
        S.cardCache.set(cacheKey, card);
      }

      saveStatsToStorage();
      saveProductsToStorage();
      updateSovRow(row, stats);
      return;
    }
  } catch {
    // fall through to error state
  }
  // Failed or returned 0 cards
  if (cells.length >= 7) {
    cells[2].innerHTML = '<span class="sov-price-empty">err</span>';
    cells[3].innerHTML = cells[4].innerHTML = cells[5].innerHTML = '<span class="sov-price-empty">—</span>';
    cells[6].innerHTML = `<button class="btn-load-row" data-slug="${escA(slug)}" data-name="${escA(name)}">Retry</button>`;
  }
}

// ── Load Queue (throttle scraper requests) ────────────────────────────────
// Per-game queue: { gameKey: { queue: [], processing: false } }
const loadQueues = {};
let loadAllAbort = false; // only applies to current game's "Load All Stats"

function getGameQueue(gameKey) {
  if (!loadQueues[gameKey]) {
    loadQueues[gameKey] = { queue: [], processing: false, inFlight: null };
  }
  return loadQueues[gameKey];
}

function saveQueuesToStorage() {
  // Queue state is not persisted to storage
}

function loadQueuesFromStorage() {
  // Queue state is not persisted to storage
  return [];
}

async function processLoadQueue(gameKey) {
  const q = getGameQueue(gameKey);
  if (q.processing) return;
  q.processing = true;

  while (q.queue.length > 0) {
    if (loadAllAbort && gameKey === S.game) {
      q.queue = [];
      break;
    }
    const item = q.queue[0]; // peek, don't shift yet
    const { slug, name, row } = item;

    // Mark as in-flight before processing (in case of reload)
    q.inFlight = { slug, name };
    saveQueuesToStorage();

    if (row && row.closest('tbody')) {
      await loadSetStatsRow(slug, name, row, true);
    }

    // Remove from queue and in-flight after successful processing
    q.queue.shift();
    q.inFlight = null;
    saveQueuesToStorage();

    // Throttle: delay between requests to avoid overwhelming scraper
    if (q.queue.length > 0) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  q.processing = false;
  saveQueuesToStorage();
  // Only update UI if this is the currently viewed game
  if (gameKey === S.game) {
    updateLoadQueueUI();
  }
}

function queueSetLoad(slug, name, row, gameKey = S.game) {
  const q = getGameQueue(gameKey);
  q.queue.push({ slug, name, row });
  saveQueuesToStorage();
  // Update UI button
  if (gameKey === S.game) {
    updateLoadQueueUI();
  }
  processLoadQueue(gameKey);
}

function updateLoadQueueUI() {
  if (!E.btnLoadAllStats) return;
  const q = getGameQueue(S.game);
  const total = q.queue.length + (q.processing ? 1 : 0);
  if (total === 0) {
    E.btnLoadAllStats.disabled = false;
    E.btnLoadAllStats.textContent = 'Load All Stats';
  } else {
    E.btnLoadAllStats.disabled = true;
    E.btnLoadAllStats.textContent = `Queue: ${total}…`;
  }
}

async function loadAllStats() {
  const sets = S.games[S.game]?.sets || [];
  if (!sets.length) return;
  loadAllAbort = false;
  const q = getGameQueue(S.game);
  // Clear existing queue to force refresh all
  q.queue = [];
  q.inFlight = null;
  saveQueuesToStorage();

  for (const s of sets) {
    if (loadAllAbort) break;
    const row = E.setsOvTbody?.querySelector(`tr[data-slug="${CSS.escape(s.slug)}"]`);
    if (row) queueSetLoad(s.slug, s.name, row, S.game);
  }
}


async function init() {
  applyAccent(S.game);
  loadAuthToken();
  loadStatsFromStorage();
  loadProductsFromStorage();
  loadQueuesFromStorage();
  // Load public on-sale inventory for all users
  await loadInventory();
  if (S.authToken) {
    await loadCart();
  }

  if (!API) {
    E.setSkeleton.style.display = 'none';
    const msg = document.createElement('div');
    msg.style.cssText = 'padding:1rem;font-size:var(--text-xs);color:var(--muted);line-height:1.6';
    msg.innerHTML = `Start the proxy server:<br><code style="font-family:var(--font-mono);color:var(--faint);font-size:11px">node server/server.js</code>`;
    E.setList.appendChild(msg);
    return;
  }

  try {
    S.games = await fetchGames();
    // Count total sets
    const total = Object.values(S.games).reduce((acc, g) => acc + (g.sets?.length || 0), 0);
    if (E.totalCount) E.totalCount.textContent = total.toLocaleString();

    buildGameTabs();
    // Initialize dropdown label
    if (E.gameDropdownLabel && S.games[S.game]) {
      E.gameDropdownLabel.textContent = S.games[S.game].label;
    }
    E.cardSearch.placeholder = 'Search all products…';
    renderSetList();
    updateCachePill();
    // Update cache display every minute
    setInterval(updateCachePillDisplay, 60 * 1000);
    // Refresh cache status every 5 minutes
    setInterval(updateCachePill, 5 * 60 * 1000);

    // Restore from URL path (must be after S.games is loaded)
    await restoreFromUrl();

    // Listen for back/forward navigation
    window.addEventListener('popstate', restoreFromUrl);
  } catch (err) {
    E.setSkeleton.style.display = 'none';
    const msg = document.createElement('div');
    msg.style.cssText = 'padding:1rem;font-size:var(--text-xs);color:var(--error)';
    msg.textContent = 'Could not reach proxy server. Make sure it\'s running on port 3847.';
    E.setList.appendChild(msg);
  }
}


// ── Sets Overview events ──────────────────────────────────────────────────
E.btnViewSets.addEventListener('click', enterSetsView);
E.btnLoadAllStats.addEventListener('click', loadAllStats);

// Delegate per-row Load/Retry buttons (added dynamically)
E.setsOvTbody.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-load-row');
  if (!btn) return;
  e.stopPropagation(); // prevent row click from also firing loadSet()
  const row = btn.closest('tr');
  if (row) queueSetLoad(btn.dataset.slug, btn.dataset.name, row);
});

// ── On Sale View events ───────────────────────────────────────────────────
E.btnViewSale.addEventListener('click', enterSaleView);
E.saleSearch.addEventListener('input', (e) => filterSaleView(e.target.value));

// Delegate Add to Cart buttons (added dynamically)
E.saleTbody.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-add-to-cart');
  if (!btn) return;
  if (btn.disabled) return; // Prevent adding if out of stock

  const game = btn.dataset.game;
  const setSlug = btn.dataset.set;
  const cardNumber = btn.dataset.card;
  const grading = parseInt(btn.dataset.grading, 10);

  // Find and update the stock cell in real-time
  const row = btn.closest('tr');
  const stockCell = row.querySelector('.td-stock');
  if (stockCell) {
    const currentStock = parseInt(stockCell.textContent, 10);
    if (currentStock > 0) {
      const newStock = currentStock - 1;
      stockCell.textContent = newStock;
      // Update button state if stock hits 0
      if (newStock === 0) {
        btn.disabled = true;
        btn.textContent = 'Out of Stock';
      }
      // Also update the sale cards data
      const item = S.saleCards.find(i => i.game === game && i.set_slug === setSlug && i.card_number === cardNumber && i.grading === grading);
      if (item) item.available_stock = newStock;
    }
  }

  addToCart(game, setSlug, cardNumber, grading);
  if (!btn.disabled) {
    btn.textContent = '✓ Added';
    setTimeout(() => { btn.textContent = 'Add'; }, 1500);
  }
});

// ── Cache click handlers ──────────────────────────────────────────────────
E.cachePill.addEventListener('click', refreshCacheNow);
E.statCache.addEventListener('click', refreshCacheNow);

if (E.gameBar) {
  E.gameBar.addEventListener('wheel', (e) => {
    e.preventDefault();
    E.gameBarInner.scrollLeft += e.deltaY > 0 ? 50 : -50;
  }, { passive: false, capture: true });
}

document.addEventListener('wheel', (e) => {
  if (E.gameBar.contains(e.target)) {
    e.preventDefault();
    E.gameBarInner.scrollLeft += e.deltaY > 0 ? 50 : -50;
  }
}, { passive: false, capture: true });
// ── Auth & Cart Management ────────────────────────────────────────

function saveAuthToken(token, userId, isAdmin) {
  S.authToken = token;
  S.userId = userId;
  S.isAdmin = !!isAdmin;
  localStorage.setItem('tcg-auth-token', token);
  localStorage.setItem('tcg-user-id', String(userId));
  localStorage.setItem('tcg-is-admin', isAdmin ? '1' : '0');
  updateAuthUI();
}

function loadAuthToken() {
  S.authToken = localStorage.getItem('tcg-auth-token');
  S.userId = localStorage.getItem('tcg-user-id');
  S.isAdmin = localStorage.getItem('tcg-is-admin') === '1';
  updateAuthUI();
}

function clearAuthToken() {
  S.authToken = null;
  S.userId = null;
  S.isAdmin = false;
  S.cart.clear();
  localStorage.removeItem('tcg-auth-token');
  localStorage.removeItem('tcg-user-id');
  localStorage.removeItem('tcg-is-admin');
  updateAuthUI();
}

function updateAuthUI() {
  if (S.userId) {
    E.btnAuth.textContent = 'Logout';
    if (S.isAdmin) {
      E.btnCart.style.display = 'none';
      E.btnInventory.style.display = '';
    } else {
      E.btnCart.style.display = '';
      E.btnInventory.style.display = 'none';
      E.cartCount.style.display = S.cart.size > 0 ? 'block' : 'none';
    }
  } else {
    E.btnAuth.textContent = 'Login';
    E.btnCart.style.display = '';
    E.btnInventory.style.display = 'none';
    E.cartCount.style.display = 'none';
  }
}

function openAuthModal() {
  E.authModal.style.display = 'flex';
  E.authEmail.value = '';
  E.authPassword.value = '';
  E.authError.style.display = 'none';
  E.authEmail.focus();
}

function closeAuthModal() {
  E.authModal.style.display = 'none';
}

async function login() {
  const email = E.authEmail.value.trim();
  const password = E.authPassword.value.trim();
  if (!email || !password) {
    E.authError.textContent = 'Please enter email and password';
    E.authError.style.display = 'block';
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    saveAuthToken(data.token, data.userId, data.isAdmin);
    closeAuthModal();
    await loadCart();
  } catch (err) {
    E.authError.textContent = err.message;
    E.authError.style.display = 'block';
  }
}

async function register() {
  const email = E.authEmail.value.trim();
  const password = E.authPassword.value.trim();
  if (!email || !password) {
    E.authError.textContent = 'Please enter email and password';
    E.authError.style.display = 'block';
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    saveAuthToken(data.token, data.userId, data.isAdmin);
    closeAuthModal();
    await loadCart();
  } catch (err) {
    E.authError.textContent = err.message;
    E.authError.style.display = 'block';
  }
}

function openCartModal() {
  if (!S.userId) {
    openAuthModal();
    return;
  }
  E.cartModal.style.display = 'flex';
  renderCartUI();
  document.body.style.overflow = 'hidden';
}

function closeCartModal() {
  E.cartModal.style.display = 'none';
  document.body.style.overflow = '';
}

async function loadCart() {
  if (!S.authToken) return;
  try {
    const res = await fetch(`${API}/api/cart`, {
      headers: { 'Authorization': `Bearer ${S.authToken}` }
    });
    const items = await res.json();
    S.cart.clear();
    items.forEach(item => {
      const key = `${item.game}|${item.set_slug}|${item.card_number}|${item.grading}`;
      S.cart.set(key, { ...item, quantity: item.quantity });
    });
    updateCartCount();
  } catch (err) {}
}

async function addToCart(game, slug, cardId, grading, quantity = 1) {
  if (!S.userId) {
    openAuthModal();
    return;
  }

  try {
    const res = await fetch(`${API}/api/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${S.authToken}`
      },
      body: JSON.stringify({ game, set_slug: slug, card_number: cardId, grading, quantity })
    });

    if (!res.ok) throw new Error('Failed to add to cart');
    await loadCart();
    // Reload inventory to recalculate available stock
    await loadInventory();
    // Re-render sale view if active to sync prices and stock
    if (S.saleView) renderSaleView();
  } catch (err) {
    console.error('Add to cart error:', err);
  }
}

async function removeFromCart(game, slug, cardId, grading) {
  if (!S.authToken) return;

  try {
    await fetch(`${API}/api/cart/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${S.authToken}`
      },
      body: JSON.stringify({ game, set_slug: slug, card_number: cardId, grading })
    });
    await loadCart();
    renderCartUI(); // Update cart display
    // Reload inventory to recalculate available stock
    await loadInventory();
    // Re-render sale view if active to sync prices and stock
    if (S.saleView) renderSaleView();
  } catch (err) {
    console.error('Remove from cart error:', err);
  }
}

async function updateCartItem(game, slug, cardId, grading, quantity) {
  if (!S.authToken) return;

  try {
    await fetch(`${API}/api/cart/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${S.authToken}`
      },
      body: JSON.stringify({ game, set_slug: slug, card_number: cardId, grading, quantity })
    });
    await loadCart();
    // Reload inventory to recalculate available stock
    await loadInventory();
    // Re-render sale view if active to sync prices and stock
    if (S.saleView) renderSaleView();
  } catch (err) {
    console.error('Update cart error:', err);
  }
}

function updateCartCount() {
  E.cartCount.textContent = S.cart.size;
  E.cartCount.style.display = S.cart.size > 0 ? 'block' : 'none';
}

function updateStockDisplay(game, slug, cardId, grading) {
  // Find and update the table row for this item
  const rowId = `${game}-${slug}-${cardId}-${grading}`;
  const row = E.saleTbody.querySelector(`[data-card-id="${rowId}"]`);
  if (row) {
    const item = S.adminInventory.find(i => i.game === game && i.set_slug === slug && i.card_number === cardId && i.grading === grading);
    if (item) {
      const stockCell = row.querySelector('.td-stock');
      if (stockCell) {
        stockCell.textContent = item.available_stock;
      }
    }
  }
}

function renderCartUI() {
  const items = Array.from(S.cart.values());
  let total = 0;

  if (items.length === 0) {
    E.cartList.innerHTML = '<p style="text-align:center;color:var(--muted)">Your cart is empty</p>';
  } else {
    E.cartList.innerHTML = items.map(item => {
      const price = item.price_cents || 0;
      const gradingLabel = item.grading === 0 ? 'Ungraded' : `Grade ${item.grading}`;
      total += price * item.quantity;
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--color-border)">
          <div>
            <div style="font-weight:500">${item.game} - ${item.set_slug}</div>
            <div style="font-size:var(--text-sm);color:var(--muted)">Card #${item.card_number} ${gradingLabel}</div>
          </div>
          <div style="display:flex;align-items:center;gap:1rem">
            <input type="number" min="1" value="${item.quantity}" class="cart-qty-input" data-game="${item.game}" data-slug="${item.set_slug}" data-card="${item.card_number}" data-grading="${item.grading}" style="width:50px;padding:4px" />
            <span style="min-width:60px;text-align:right">$${(price * item.quantity / 100).toFixed(2)}</span>
            <button class="btn-remove-cart" data-game="${item.game}" data-slug="${item.set_slug}" data-card="${item.card_number}" data-grading="${item.grading}" style="background:none;border:none;color:var(--muted);cursor:pointer">✕</button>
          </div>
        </div>
      `;
    }).join('');
  }

  E.cartTotal.textContent = '$' + (total / 100).toFixed(2);
}

// ── Admin Inventory Modal ─────────────────────────────────────────────────

async function loadInventory() {
  try {
    // Load public on-sale inventory (no auth required)
    const res = await fetch(`${API}/api/inventory`);
    const items = await res.json();
    // Mark sealed products based on card name
    S.adminInventory = Array.isArray(items) ? items.map(item => ({
      ...item,
      sealed: isSealedProduct(item.card_name || '')
    })) : [];

    // Fetch cards for each game/set combo and attach to inventory items
    const combos = new Set(items.map(i => `${i.game}|${i.set_slug}`));
    const cardsByKey = new Map(); // (game|slug|card_number) -> card object

    for (const combo of combos) {
      const [game, slug] = combo.split('|');
      try {
        const setRes = await fetch(`${API}/api/set?slug=${encodeURIComponent(slug)}&pages=5`);
        const setData = await setRes.json();
        if (setData.cards) {
          for (const card of setData.cards) {
            // Store by both card.id and card.number to handle different ID formats
            const key1 = `${game}|${slug}|${card.id}`;
            const key2 = `${game}|${slug}|${card.number}`;
            cardsByKey.set(key1, card);
            if (card.number) cardsByKey.set(key2, card);
            // Also cache for normal lookups
            S.cardCache.set(key1, card);
          }
        }
      } catch (err) {
        // Continue if one set fails to load
      }
    }

    // Attach card data to inventory items
    for (const item of S.adminInventory) {
      const key = `${item.game}|${item.set_slug}|${item.card_number}`;
      item.cardData = cardsByKey.get(key);
      // Fallback: try matching by name if ID doesn't match (for legacy inventory items)
      if (!item.cardData && item.card_name) {
        const [game, slug] = key.split('|');
        const gameSlugKey = `${game}|${slug}`;
        for (const [k, card] of cardsByKey) {
          if (k.startsWith(gameSlugKey) && card.name === item.card_name) {
            item.cardData = card;
            break;
          }
        }
      }
    }

    updateInvItemCount();
  } catch (err) {
    S.adminInventory = [];
  }
}

function isSealedProduct(cardName) {
  const sealedPatterns = [
    /\b(booster\s+box|booster\s+case|booster\s+display|booster\s+pack|blister|starter\s+(set|deck)|theme\s+deck|display\s+box|collector('s)?\s+box|elite\s+trainer\s+box|etb|fat\s+pack|bundle)\b/i
  ];
  return sealedPatterns.some(pattern => pattern.test(cardName));
}

function updateInvItemCount() {
  const count = (S.adminInventory || []).length;
  E.invItemCount.textContent = count;
  E.invItemCount.style.display = count > 0 ? 'block' : 'none';
}

async function enterInventoryView() {
  // Admin only
  if (!S.isAdmin) {
    alert('Inventory management is admin-only.');
    return;
  }

  // Exit other views
  if (S.setsView) exitSetsView(false);
  if (S.saleView) exitSaleView(false);

  S.inventoryView = true;
  S.setsView = false;
  S.saleView = false;
  E.btnInventory.classList.add('active');
  E.btnViewSets.classList.remove('active');
  E.btnViewSale.classList.remove('active');

  E.stateInventoryView.style.display = 'flex';

  // Show inventory indicator in sidebar
  if (E.sidebarTitle) E.sidebarTitle.textContent = 'INVENTORY';

  // Reload inventory to get latest items added after page load
  await loadInventory();
  renderInventoryTable();
  showState('inventory-view');
  pushState();
}

function exitInventoryView() {
  S.inventoryView = false;
  E.btnInventory.classList.remove('active');

  E.stateInventoryView.style.display = 'none';

  // Restore sidebar title
  if (E.sidebarTitle) E.sidebarTitle.textContent = 'Sets';

  showState('table');
  pushState();
}

function renderInventoryTable() {
  const items = S.adminInventory || [];
  E.inventoryTitle.textContent = `Inventory — ${items.length} Items`;
  E.inventoryTbody.innerHTML = '';

  if (items.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="8" style="text-align:center;padding:2rem;color:var(--muted)">No inventory items</td>`;
    E.inventoryTbody.appendChild(tr);
    return;
  }

  // Setup pagination
  S.pagination.inventory.total = items.length;
  S.pagination.inventory.rendered = 0;

  // Setup infinite scroll first (creates sentinel) before loading items
  setupInfiniteScroll('#inventory-tbody', 'inventory');
  // Load first batch
  loadMoreItems('inventory');
}

// ── Infinite Scroll System ──────────────────────────────────────────────────
function setupInfiniteScroll(tableSelector, paginationKey) {
  const tbody = document.querySelector(tableSelector);
  if (!tbody) return;

  // Remove existing sentinel if present
  const existingSentinel = tbody.querySelector('.scroll-sentinel');
  if (existingSentinel) existingSentinel.remove();

  // Create sentinel element
  const sentinel = document.createElement('tr');
  sentinel.className = 'scroll-sentinel';
  sentinel.style.height = '1px';
  tbody.appendChild(sentinel);

  S.pagination[paginationKey].sentinel = sentinel;
  S.pagination[paginationKey].loading = false;

  // Setup Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting &&
            !S.pagination[paginationKey].loading &&
            S.pagination[paginationKey].rendered < S.pagination[paginationKey].total) {
          S.pagination[paginationKey].loading = true;
          loadMoreItems(paginationKey);
        }
      });
    },
    { rootMargin: '200px' }
  );

  observer.observe(sentinel);
}

function loadMoreItems(paginationKey) {
  const paging = S.pagination[paginationKey];
  if (paging.rendered >= paging.total) {
    paging.loading = false;
    return;
  }

  const startIdx = paging.rendered;
  const endIdx = Math.min(startIdx + paging.batchSize, paging.total);

  switch (paginationKey) {
    case 'cards':
      renderCardsBatch(startIdx, endIdx);
      break;
    case 'sets':
      renderSetsBatch(startIdx, endIdx);
      break;
    case 'sale':
      renderSaleBatch(startIdx, endIdx);
      break;
    case 'inventory':
      renderInventoryBatch(startIdx, endIdx);
      break;
  }

  paging.rendered = endIdx;
  paging.loading = false;
}

function renderCardsBatch(startIdx, endIdx) {
  const cards = S.visibleCards;
  if (!cards.length) return;

  const tbody = E.tbody;
  const sentinel = S.pagination.cards.sentinel;
  const batchCards = cards.slice(startIdx, endIdx);
  const frag = document.createDocumentFragment();

  let rowNum = startIdx + 1;
  batchCards.forEach((card) => {
    const tr = document.createElement('tr');
    tr.className = 'card-row' + (card.sealed ? ' sealed-row' : '');

    const uv = parsePrice(card.ungraded);
    const pv = parsePrice(card.psa10);
    const uClass = `price price-u${uv && uv >= HOT_U ? ' hot' : ''}`;
    const pClass = `price price-p10${pv && pv >= GEM_P10 ? ' gem' : ''}`;
    const g9Class = card.grade9 === '—' ? 'price price-nil' : 'price price-g9';
    const u2Class = card.ungraded === '—' ? 'price price-nil' : uClass;
    const icon = card.sealed ? '📦' : '🃏';

    const stockKey = storeKey(S.game, S.slug, card.id, 0);
    const stockItem = S.storeInventory.get(stockKey);
    const stockQty = stockItem ? stockItem.quantity_available : 0;
    const stockLabel = stockQty === 0 ? 'Out of stock' : `${stockQty} in stock`;
    const stockClass = stockQty === 0 ? 'stock-out' : 'stock-in';

    // Get TCGPlayer data if available
    const tcg = S.tcgCards.get(normName(card.name));
    const tuClass = tcg?.ungraded === '—' || !tcg ? 'price price-nil' : 'price price-u';
    const tg9Class = tcg?.grade9 === '—' || !tcg ? 'price price-nil' : 'price price-g9';
    const tp10Class = tcg?.psa10 === '—' || !tcg ? 'price price-nil' : 'price price-p10';

    // Build combined price cells with both PC and TCG
    const ungradedHtml = `
      <div class="price-source">
        <span class="source-label source-pc">PC</span>
        <span class="${u2Class}">${esc(card.ungraded)}</span>
      </div>
      ${tcg ? `<div class="price-source"><span class="source-label source-tcg">TCG</span><span class="${tuClass}">${esc(tcg.ungraded)}</span></div>` : ''}`;

    const grade9Html = `
      <div class="price-source">
        <span class="source-label source-pc">PC</span>
        <span class="${g9Class}">${esc(card.grade9)}</span>
      </div>
      ${tcg ? `<div class="price-source"><span class="source-label source-tcg">TCG</span><span class="${tg9Class}">${esc(tcg.grade9)}</span></div>` : ''}`;

    const psa10Html = `
      <div class="price-source">
        <span class="source-label source-pc">PC</span>
        <span class="${pClass}">${esc(card.psa10)}</span>
      </div>
      ${tcg ? `<div class="price-source"><span class="source-label source-tcg">TCG</span><span class="${tp10Class}">${esc(tcg.psa10)}</span></div>` : ''}`;

    tr.innerHTML = `
      <td class="td-num">${rowNum++}</td>
      <td class="td-img">
        ${card.img
          ? `<img class="card-thumb" src="${escA(card.img)}" alt="${escA(card.name)}" loading="lazy" onerror="this.outerHTML='<div class=\\'card-thumb-ph\\'>${icon}</div>'">`
          : `<div class="card-thumb-ph">${icon}</div>`}
      </td>
      <td>
        <a class="card-link" href="${escA(card.url)}" target="_blank" rel="noopener">${esc(card.name)}</a>
        ${tcg ? `<br><a class="source-link source-tcg" href="${escA(tcg.url)}" target="_blank" rel="noopener" style="font-size:0.7rem">TCGPlayer ↗</a>` : ''}
      </td>
      <td class="td-stock"><span class="stock-badge ${stockClass}">${esc(stockLabel)}</span></td>
      <td class="td-price">${ungradedHtml}</td>
      <td class="td-price td-grade9">${grade9Html}</td>
      <td class="td-price td-psa10">${psa10Html}</td>
      <td class="td-action"><button class="btn-dots" data-card-id="${escA(card.id)}" aria-label="Options">⋮</button></td>`;
    frag.appendChild(tr);
  });

  tbody.insertBefore(frag, sentinel);
}

function renderSetsBatch(startIdx, endIdx) {
  const game = S.games[S.game];
  const sets = game?.sets || [];
  const tbody = E.setsOvTbody;
  const sentinel = S.pagination.sets.sentinel;
  const batchSets = sets.slice(startIdx, endIdx);
  const frag = document.createDocumentFragment();

  batchSets.forEach((s, idx) => {
    const i = startIdx + idx;
    const stats = S.setStats.get(s.slug);
    const tr = document.createElement('tr');
    tr.className = 'sov-row';
    tr.dataset.slug = s.slug;
    tr.innerHTML = `
      <td class="td-num">${i + 1}</td>
      <td class="sov-set-name">${esc(s.name)}</td>
      <td class="td-price">${stats ? stats.count : '<span class="sov-price-empty">—</span>'}</td>
      <td class="td-price">${stats ? `<span class="sov-price">${fmt(stats.avgUngraded)}</span>` : '<span class="sov-price-empty">—</span>'}</td>
      <td class="td-price">${stats ? `<span class="sov-price">${fmt(stats.topUngraded)}</span>` : '<span class="sov-price-empty">—</span>'}</td>
      <td class="td-price">${stats ? `<span class="sov-price-psa">${fmt(stats.topPsa10)}</span>` : '<span class="sov-price-empty">—</span>'}</td>
      <td class="td-action">${stats ? '' : `<button class="btn-load-row" data-slug="${escA(s.slug)}" data-name="${escA(s.name)}">Load</button>`}</td>`;

    tr.addEventListener('click', (e) => {
      if (e.target.closest('.btn-load-row')) return;
      const btn = document.querySelector(`.set-item[data-slug="${CSS.escape(s.slug)}"]`);
      loadSet(s.slug, s.name, btn);
    });
    frag.appendChild(tr);
  });

  tbody.insertBefore(frag, sentinel);
}

function renderSaleBatch(startIdx, endIdx) {
  const items = S.saleCards;
  const tbody = E.saleTbody;
  const sentinel = S.pagination.sale.sentinel;
  const batchItems = items.slice(startIdx, endIdx);
  const frag = document.createDocumentFragment();

  batchItems.forEach(item => {
    const gradingLabel = item.grading === 0 ? 'Ungraded' : item.grading === 9 ? 'Grade 9' : 'PSA 10';
    const price = (item.price_cents / 100).toFixed(2);
    const card = item.cardData || S.cardCache.get(`${item.game}|${item.set_slug}|${item.card_number}`);
    const imgUrl = card?.img;
    const icon = item.sealed ? '📦' : '🃏';
    const imgHtml = imgUrl
      ? `<img class="card-thumb" src="${escA(imgUrl)}" alt="${escA(item.card_name)}" loading="lazy" onerror="this.outerHTML='<div class=\\'card-thumb-ph\\'>${icon}</div>'">`
      : `<div class="card-thumb-ph">${icon}</div>`;

    const tr = document.createElement('tr');
    tr.className = 'sale-row' + (item.sealed ? ' sealed-row' : '');
    tr.dataset.cardId = `${item.game}-${item.set_slug}-${item.card_number}-${item.grading}`;
    const isOutOfStock = item.available_stock === 0;
    const btnDisabled = isOutOfStock ? 'disabled' : '';
    const btnText = isOutOfStock ? 'Out of Stock' : 'Add';
    tr.innerHTML = `
      <td class="td-img">${imgHtml}</td>
      <td class="td-name">${esc(item.card_name || `Card #${item.card_number}`)}</td>
      <td class="td-name">#${esc(item.card_number)}</td>
      <td class="td-name">${esc(item.set_slug)}</td>
      <td class="td-price">${esc(gradingLabel)}</td>
      <td class="td-price"><span class="sov-price">$${price}</span></td>
      <td class="td-price td-stock">${item.available_stock}</td>
      <td class="td-action"><button class="btn-add-to-cart" ${btnDisabled} data-game="${escA(item.game)}" data-set="${escA(item.set_slug)}" data-card="${escA(item.card_number)}" data-grading="${item.grading}">${btnText}</button></td>`;
    frag.appendChild(tr);
  });

  tbody.insertBefore(frag, sentinel);
}

function renderInventoryBatch(startIdx, endIdx) {
  const items = S.adminInventory;
  const tbody = E.inventoryTbody;
  const sentinel = S.pagination.inventory.sentinel;
  const batchItems = items.slice(startIdx, endIdx);
  const frag = document.createDocumentFragment();

  batchItems.forEach(item => {
    const gradingLabel = item.grading === 0 ? 'Ungraded' : item.grading === 9 ? 'Grade 9' : 'PSA 10';
    const price = (item.price_cents / 100).toFixed(2);
    const card = item.cardData || S.cardCache.get(`${item.game}|${item.set_slug}|${item.card_number}`);
    const imgHtml = card?.img
      ? `<img class="card-thumb" src="${escA(card.img)}" alt="${escA(item.card_name)}" loading="lazy" onerror="this.outerHTML='<div class=\\'card-thumb-ph\\'>📦</div>'">`
      : `<div class="card-thumb-ph">📦</div>`;

    const tr = document.createElement('tr');
    tr.className = 'inventory-row';
    tr.dataset.game = item.game;
    tr.dataset.slug = item.set_slug;
    tr.dataset.card = item.card_number;
    tr.dataset.grading = item.grading;
    tr.innerHTML = `
      <td class="td-img">${imgHtml}</td>
      <td class="td-name">${esc(item.card_name || `Card #${item.card_number}`)}</td>
      <td class="td-name">#${esc(item.card_number)}</td>
      <td class="td-name">${esc(item.set_slug)}</td>
      <td class="td-price">${esc(gradingLabel)}</td>
      <td class="td-price"><span class="sov-price">$${price}</span></td>
      <td class="td-price">${item.quantity_available}</td>
      <td class="td-action"><button class="btn-inv-edit" data-game="${escA(item.game)}" data-slug="${escA(item.set_slug)}" data-card="${escA(item.card_number)}" data-grading="${item.grading}">✎</button></td>`;
    frag.appendChild(tr);
  });

  tbody.insertBefore(frag, sentinel);
}

init();

function isMobile() { return window.innerWidth < 640; }

function openSidebar() {
  E.sidebar.classList.add('open');
  E.sidebarOverlay.classList.add('active');
  E.sidebarToggle.setAttribute('aria-expanded', 'true');
  E.sidebarToggle.setAttribute('aria-label', 'Close set list');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  E.sidebar.classList.remove('open');
  E.sidebarOverlay.classList.remove('active');
  E.sidebarToggle.setAttribute('aria-expanded', 'false');
  E.sidebarToggle.setAttribute('aria-label', 'Open set list');
  document.body.style.overflow = '';
}

function openGameDropdown() {
  if (!E.gameDropdownMenu || !E.gameDropdownToggle) return;
  E.gameDropdownMenu.style.display = 'block';
  E.gameDropdownToggle.setAttribute('aria-expanded', 'true');
}

function closeGameDropdown() {
  if (!E.gameDropdownMenu || !E.gameDropdownToggle) return;
  E.gameDropdownMenu.style.display = 'none';
  E.gameDropdownToggle.setAttribute('aria-expanded', 'false');
}

// ── Auth & Cart Event Listeners ────────────────────────────────────────

E.btnAuth.addEventListener('click', () => {
  if (S.userId) {
    clearAuthToken();
    closeCartModal();
    exitInventoryView();
  } else {
    openAuthModal();
  }
});

E.btnAuthLogin.addEventListener('click', login);
E.btnAuthRegister.addEventListener('click', register);

E.authEmail.addEventListener('keyup', e => {
  if (e.key === 'Enter') login();
});
E.authPassword.addEventListener('keyup', e => {
  if (e.key === 'Enter') E.btnAuthLogin.click();
});

E.authModalClose.addEventListener('click', closeAuthModal);
E.authModalBackdrop.addEventListener('click', closeAuthModal);

E.btnCart.addEventListener('click', openCartModal);
E.cartModalClose.addEventListener('click', closeCartModal);
E.cartModalBackdrop.addEventListener('click', closeCartModal);

E.btnInventory.addEventListener('click', enterInventoryView);

E.inventoryTbody.addEventListener('click', async e => {
  const btn = e.target.closest('.btn-inv-edit');
  if (!btn) return;
  const { game, slug, card, grading } = btn.dataset;
  const item = (S.adminInventory || []).find(i => i.game === game && i.set_slug === slug && i.card_number === card && String(i.grading) === grading);

  // Open inventory popover for this item
  if (item) {
    const cardObj = {
      name: item.card_name,
      id: item.card_number
    };
    // Set grading selector to match the item
    E.invGrading.value = String(item.grading);
    openInvPopover(cardObj, btn, game, slug);
  } else {
    // Fallback: try to open with just the button data
    const cardObj = {
      name: btn.dataset.name || 'Unknown Card',
      id: card
    };
    E.invGrading.value = String(grading);
    openInvPopover(cardObj, btn, game, slug);
  }
});

E.cartList.addEventListener('change', e => {
  const input = e.target.closest('.cart-qty-input');
  if (!input) return;
  const game = input.dataset.game;
  const slug = input.dataset.slug;
  const cardId = input.dataset.card;
  const grading = Number(input.dataset.grading);
  const quantity = Math.max(1, Number(input.value));
  updateCartItem(game, slug, cardId, grading, quantity);
});

E.cartList.addEventListener('click', e => {
  const btn = e.target.closest('.btn-remove-cart');
  if (!btn) return;
  removeFromCart(btn.dataset.game, btn.dataset.slug, btn.dataset.card, Number(btn.dataset.grading));
});

E.btnCheckout.addEventListener('click', async () => {
  if (!S.authToken || S.cart.size === 0) return;

  E.btnCheckout.disabled = true;
  E.btnCheckout.textContent = 'Processing...';

  try {
    const items = Array.from(S.cart.values()).map(item => ({
      game: item.game,
      set_slug: item.set_slug,
      card_number: item.card_number,
      grading: item.grading
    }));

    const res = await fetch(`${API}/api/checkout/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${S.authToken}`
      },
      body: JSON.stringify({ items })
    });

    if (!res.ok) throw new Error('Failed to create checkout session');
    const data = await res.json();

    // Redirect to Stripe checkout
    if (data.url) {
      window.location.href = data.url;
    }
  } catch (err) {
    alert('Checkout failed: ' + err.message);
    E.btnCheckout.disabled = false;
    E.btnCheckout.textContent = 'Checkout';
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && E.authModal.style.display !== 'none') closeAuthModal();
  if (e.key === 'Escape' && E.cartModal.style.display !== 'none') closeCartModal();
  if (e.key === 'Escape' && E.inventoryModal.style.display !== 'none') closeInventoryModal();
});

E.sidebarToggle.addEventListener('click', () => {
  E.sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});

E.sidebarOverlay.addEventListener('click', closeSidebar);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && E.sidebar.classList.contains('open')) {
    closeSidebar();
    E.sidebarToggle.focus();
  }
});

window.addEventListener('resize', () => {
  if (!isMobile() && E.sidebar.classList.contains('open')) {
    closeSidebar();
  }
});

// ── Image Modal ───────────────────────────────────────────────────────────
function openImgModal(src, name) {
  E.imgModalImg.src = src;
  E.imgModalImg.alt = name;
  E.imgModalName.textContent = name;
  E.imgModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeImgModal() {
  E.imgModal.style.display = 'none';
  E.imgModalImg.src = '';
  document.body.style.overflow = '';
}

document.addEventListener('click', e => {
  const thumb = e.target.closest('.card-thumb');
  if (thumb) { openImgModal(thumb.src, thumb.alt); return; }
});
E.imgModalClose.addEventListener('click', closeImgModal);
E.imgModalBackdrop.addEventListener('click', closeImgModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && E.imgModal.style.display !== 'none') closeImgModal();
});

// ── Inventory Popover ─────────────────────────────────────────────────────
let invCurrentCard = null;
let invCurrentGame = null;
let invCurrentSlug = null;
let invCurrentRow = null;

function openInvPopover(card, triggerBtn, game, slug) {
  invCurrentCard = card;
  invCurrentGame = game || S.game;
  invCurrentSlug = slug || S.slug;
  invCurrentRow = triggerBtn.closest('tr');
  E.invCardName.textContent = card.name;
  E.invStatus.textContent = '';
  updateInvPopoverStock();
  if (S.isAdmin) {
    E.invAdminSection.style.display = 'block';
    updateInvAdminFields();
  } else {
    E.invAdminSection.style.display = 'none';
  }
  const rect = triggerBtn.getBoundingClientRect();
  E.invPopover.style.display = 'block';
  const top = rect.bottom + 6;
  let left = rect.right - 260;
  left = Math.max(8, Math.min(left, window.innerWidth - 248));
  E.invPopover.style.top = `${top}px`;
  E.invPopover.style.left = `${left}px`;
}

function closeInvPopover() {
  E.invPopover.style.display = 'none';
  invCurrentCard = null;
  invCurrentGame = null;
  invCurrentSlug = null;
  invCurrentRow = null;
}

function updateInvPopoverStock() {
  if (!invCurrentCard) return;
  const grading = parseInt(E.invGrading.value, 10);
  const key = storeKey(invCurrentGame, invCurrentSlug, invCurrentCard.id, grading);
  const item = S.storeInventory.get(key);
  const inStock = item && item.quantity_available > 0;
  E.btnInvCart.style.display = inStock ? 'block' : 'none';
  if (E.invStockStatus) {
    if (inStock) {
      const price = item.price_cents ? `$${(item.price_cents / 100).toFixed(2)}` : 'Price TBD';
      E.invStockStatus.textContent = `In stock · ${price}`;
      E.invStockStatus.style.color = 'var(--color-success, #4ade80)';
    } else {
      E.invStockStatus.textContent = 'Out of stock';
      E.invStockStatus.style.color = 'var(--muted)';
    }
  }
}

function updateInvAdminFields() {
  if (!invCurrentCard) return;
  const grading = parseInt(E.invGrading.value, 10);
  // Look in adminInventory first (inventory view), then storeInventory (sale view)
  let item = (S.adminInventory || []).find(i =>
    i.game === invCurrentGame && i.set_slug === invCurrentSlug &&
    i.card_number === invCurrentCard.id && i.grading === grading
  );
  if (!item) {
    const key = storeKey(invCurrentGame, invCurrentSlug, invCurrentCard.id, grading);
    item = S.storeInventory.get(key);
  }
  if (E.invAdminQty) E.invAdminQty.value = item ? item.quantity_available : 0;
  if (E.invAdminPrice) E.invAdminPrice.value = item ? (item.price_cents / 100).toFixed(2) : '0.00';
}

E.invGrading.addEventListener('change', () => {
  updateInvPopoverStock();
  if (S.isAdmin) updateInvAdminFields();
});

E.btnInvCart.addEventListener('click', () => {
  if (!invCurrentCard) return;
  const grading = parseInt(E.invGrading.value, 10);

  // Update stock in real-time if we have a row reference
  if (invCurrentRow) {
    const stockCell = invCurrentRow.querySelector('.td-stock');
    if (stockCell) {
      const currentStock = parseInt(stockCell.textContent, 10);
      if (currentStock > 0) {
        const newStock = currentStock - 1;
        stockCell.textContent = newStock;
        // Also update the inventory data
        const item = S.adminInventory.find(i => i.game === invCurrentGame && i.set_slug === invCurrentSlug && i.card_number === invCurrentCard.id && i.grading === grading);
        if (item) item.quantity_available = newStock;
      }
    }
  }

  addToCart(invCurrentGame, invCurrentSlug, invCurrentCard.id, grading, 1);
  closeInvPopover();
});

E.btnInvAdminUpdate?.addEventListener('click', async () => {
  if (!invCurrentCard) return;
  const grading = parseInt(E.invGrading.value, 10);
  const qty = parseInt(E.invAdminQty.value, 10) || 0;
  const price = Math.round(parseFloat(E.invAdminPrice.value || '0') * 100);
  try {
    const res = await fetch(`${API}/api/admin/inventory/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${S.authToken}`
      },
      body: JSON.stringify({
        game: invCurrentGame,
        set_slug: invCurrentSlug,
        card_number: invCurrentCard.id,
        card_name: invCurrentCard.name,
        grading,
        quantity_available: qty,
        price_cents: price
      })
    });
    if (!res.ok) throw new Error('Failed');
    await loadStoreInventory(invCurrentGame, invCurrentSlug);
    await loadInventory();
    updateInvPopoverStock();
    updateInvAdminFields();
    if (E.stateInventoryView.style.display !== 'none') renderInventoryTable();
    E.invStatus.textContent = 'Stock updated.';
  } catch (err) {
    E.invStatus.textContent = 'Error: ' + err.message;
  }
});

E.btnInvAdminDelete?.addEventListener('click', async () => {
  if (!invCurrentCard) return;
  if (!confirm('Are you sure you want to permanently delete this inventory item? This cannot be undone.')) return;
  const grading = parseInt(E.invGrading.value, 10);
  try {
    const res = await fetch(`${API}/api/admin/inventory/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${S.authToken}`
      },
      body: JSON.stringify({
        game: invCurrentGame,
        set_slug: invCurrentSlug,
        card_number: invCurrentCard.id,
        grading
      })
    });
    if (!res.ok) throw new Error('Failed to delete');
    await loadStoreInventory(invCurrentGame, invCurrentSlug);
    await loadInventory();
    if (E.stateInventoryView.style.display !== 'none') renderInventoryTable();
    closeInvPopover();
  } catch (err) {
    E.invStatus.textContent = 'Error: ' + err.message;
  }
});

E.invClose.addEventListener('click', closeInvPopover);

E.tbody.addEventListener('click', e => {
  const btn = e.target.closest('.btn-dots');
  if (!btn) return;
  const card = S.allCards.find(c => c.id === btn.dataset.cardId);
  if (!card) return;
  if (E.invPopover.style.display !== 'none' && invCurrentCard?.id === card.id) {
    closeInvPopover();
  } else {
    openInvPopover(card, btn);
  }
});

document.addEventListener('click', e => {
  if (!E.invPopover || E.invPopover.style.display === 'none') return;
  if (!E.invPopover.contains(e.target) && !e.target.closest('.btn-dots') && !e.target.closest('.btn-inv-edit')) {
    closeInvPopover();
  }
});

// ── Game Dropdown ─────────────────────────────────────────────────────────
if (E.gameDropdownToggle) {
  E.gameDropdownToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = E.gameDropdownToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeGameDropdown() : openGameDropdown();
  });
}

if (E.gameDropdownMenu) {
  E.gameDropdownMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

document.addEventListener('click', (e) => {
  if (E.gameDropdown && !E.gameDropdown.contains(e.target)) {
    closeGameDropdown();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeGameDropdown();
  }
});
