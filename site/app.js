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
  game: 'swu',
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
  setStats: new Map(), // slug → { count, avgUngraded, topUngraded, topPsa10 }
  cardCache: new Map(), // `${game}|${slug}|${cardId}` → card object
  wallet: { connected: false, address: null },
  collections: [],          // Array of { id, name, items: Map<string, number> }
  activeCollectionId: null,
  inventory: new Map(),     // always points to active collection's items Map
  inventorySynced: new Set(), // items synced to contract
  filterOwned: false,
};

// ── DOM ───────────────────────────────────────────────────────────────────
const g = id => document.getElementById(id);
const E = {
  gameTabs:      g('game-tabs'),
  setList:       g('set-list'),
  setSkeleton:   g('set-skeleton'),
  setBadge:      g('set-badge'),
  setSearch:     g('set-search'),
  setTitle:      g('set-title'),
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
  stateSetsView: g('state-sets-view'),
  setsOvTitle:   g('sets-ov-title'),
  btnLoadAllStats: g('btn-load-all-stats'),
  setsOvTbody:   g('sets-ov-tbody'),
  stateOwnedView: g('state-owned-view'),
  ownedProductsTbody: g('owned-products-tbody'),
  sidebarToggle: g('sidebar-toggle'),
  sidebarOverlay:g('sidebar-overlay'),
  sidebar:       g('sidebar'),
  gameTabsSidebar: g('game-tabs-sidebar'),
  gameDropdown: g('game-dropdown'),
  gameDropdownToggle: g('game-dropdown-toggle'),
  gameDropdownMenu: g('game-dropdown-menu'),
  gameDropdownLabel: g('game-dropdown-label'),
  walletWrap: g('wallet-wrap'),
  filterOwnedBtn: g('btn-filter-owned'),
  btnSyncInv: g('btn-sync-inv'),
  invPopover: g('inv-popover'),
  invCardName: g('inv-card-name'),
  invQtyRows: g('inv-qty-rows'),
  invGrading: g('inv-grading-select'),
  invQtyInput: g('inv-qty-input'),
  btnInvAdd: g('btn-inv-add'),
  btnInvRemove: g('btn-inv-remove'),
  btnInvSet: g('btn-inv-set'),
  invStatus: g('inv-status'),
  invClose: g('inv-popover-close'),
  collectionControls: g('collection-controls'),
  collectionSelect: g('collection-select'),
  btnCollectionAdd: g('btn-collection-add'),
  btnCollectionDelete: g('btn-collection-delete'),
  collectionNameInput: g('collection-name-input'),
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
    if (window.__appkit) window.__appkit.setThemeMode(theme);
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
function invKey(game, slug, cardId, grading) {
  return `${game}|${slug}|${cardId}|${grading}`;
}
function invTotalForCard(cardId) {
  return [0, 9, 10].reduce((sum, g) => sum + (S.inventory.get(invKey(S.game, S.slug, cardId, g)) || 0), 0);
}
function fmtAge(sec) {
  if (sec == null) return 'unknown';
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.round(sec/60)}m ago`;
  return `${Math.round(sec/3600)}h ago`;
}

function makeCollId() { return 'col_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); }

function getActiveCollection() {
  return S.collections.find(c => c.id === S.activeCollectionId) || S.collections[0];
}

function ensureDefaultCollection() {
  if (S.collections.length > 0) return;
  const col = { id: makeCollId(), name: 'New Collection', items: new Map() };
  S.collections.push(col);
  S.activeCollectionId = col.id;
  S.inventory = col.items;
  saveCollectionsToStorage();
}

function switchCollection(id) {
  const col = S.collections.find(c => c.id === id);
  if (!col) return;
  S.activeCollectionId = col.id;
  S.inventory = col.items;
  saveCollectionsToStorage();
  updateCollectionControls();
  if (S.filterOwned) renderOwnedProducts();
}

function createCollection(name) {
  const col = { id: makeCollId(), name: name || 'New Collection', items: new Map() };
  S.collections.push(col);
  saveCollectionsToStorage();
  switchCollection(col.id);
}

function deleteCollection(id) {
  if (S.collections.length <= 1) return;
  S.collections = S.collections.filter(c => c.id !== id);
  if (S.activeCollectionId === id) {
    const next = S.collections[0];
    S.activeCollectionId = next.id;
    S.inventory = next.items;
  }
  saveCollectionsToStorage();
  updateCollectionControls();
  if (S.filterOwned) renderOwnedProducts();
}

function renameCollection(id, newName) {
  const col = S.collections.find(c => c.id === id);
  if (!col || !newName.trim()) return;
  col.name = newName.trim();
  saveCollectionsToStorage();
  updateCollectionControls();
}

// ── Show/hide states ──────────────────────────────────────────────────────
function showState(name) {
  E.stateWelcome.style.display  = name === 'welcome'    ? 'flex' : 'none';
  E.stateLoading.style.display  = name === 'loading'    ? 'flex' : 'none';
  E.stateError.style.display    = name === 'error'      ? 'flex' : 'none';
  E.stateNoRes.style.display    = name === 'noresults'  ? 'flex' : 'none';
  E.tableWrap.style.display     = name === 'table'      ? 'block': 'none';
  E.stateSetsView.style.display = name === 'sets-view'  ? 'flex' : 'none';
  E.stateOwnedView.style.display = name === 'owned-view' ? 'flex' : 'none';
}

// ── Fetch ─────────────────────────────────────────────────────────────────
async function fetchGames() {
  if (!API) throw new Error('No API proxy — run: node server/server.js');
  const r = await fetch(`${API}/api/games`);
  return r.json();
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
  E.cardSearch.value = '';
  E.setSearch.value = '';

  applyAccent(key);
  if (window.__updateWalletAccent) window.__updateWalletAccent();
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
  if (S.setsView) {
    renderSetsOverview();
    showState('sets-view');
  } else {
    showState('welcome');
  }
  renderSetList();
  updateCachePill();
}

// ── Set list ──────────────────────────────────────────────────────────────
function getFilteredSets() {
  const sets = S.games[S.game]?.sets || [];
  const q = S.setQuery.toLowerCase().trim();
  if (!q) return sets;
  return sets.filter(s => s.name.toLowerCase().includes(q));
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
  // Exit sets overview if active (loadSet will handle the state transition itself)
  if (S.setsView) exitSetsView(false);
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
    S.sort = 'default';
    E.sortSelect.value = 'default';
    document.querySelectorAll('.price-table th.sortable').forEach(t => t.classList.remove('sort-active'));

    cacheSetStats(slug, S.allCards);
    renderCards();
    updateStats();
    updateCollectionControls();
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

// ── Render cards ────────────────────────────────────────────────────────────
const HOT_U   = 100;   // highlight ungraded ≥ $100
const GEM_P10 = 500;   // highlight PSA10 ≥ $500

function getProcessedCards() {
  let cards = [...S.allCards];
  const q = S.query.toLowerCase().trim();
  if (q) cards = cards.filter(c => c.name.toLowerCase().includes(q));

  // Filter owned
  if (S.filterOwned && S.wallet.connected) {
    cards = cards.filter(c => invTotalForCard(c.id) > 0);
  }

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

  const sealedCards = cards.filter(c => c.sealed);
  const regularCards = cards.filter(c => !c.sealed);
  const hasSealedSection = sealedCards.length > 0;

  const frag = document.createDocumentFragment();
  let rowNum = 0;

  // ── Sealed products section ──
  if (hasSealedSection) {
    const dividerRow = document.createElement('tr');
    dividerRow.className = 'section-divider';
    dividerRow.innerHTML = `<td colspan="7"><span class="section-label sealed-label">📦 Sealed Products <span class="section-count">${sealedCards.length}</span></span></td>`;
    frag.appendChild(dividerRow);

    sealedCards.forEach((card, idx) => {
      const tr = document.createElement('tr');
      tr.className = 'card-row sealed-row';
      tr.style.animationDelay = `${Math.min(idx * 10, 250)}ms`;
      const uv = parsePrice(card.ungraded);
      const uClass = `price price-u${uv && uv >= HOT_U ? ' hot' : ''}`;
      const u2Class = card.ungraded === '—' ? 'price price-nil' : uClass;
      const g9Class = card.grade9 === '—' ? 'price price-nil' : 'price price-g9';
      const pv = parsePrice(card.psa10);
      const pClass = `price price-p10${pv && pv >= GEM_P10 ? ' gem' : ''}`;
      const total = invTotalForCard(card.id);
      const qtyBadge = total > 0 ? `<span class="qty-badge">${total}</span>` : '';
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
        <td class="td-action">${qtyBadge}<button class="btn-dots" data-card-id="${escA(card.id)}" aria-label="Inventory options">⋮</button></td>`;
      frag.appendChild(tr);
    });
  }

  // ── Individual cards section ──
  if (hasSealedSection && regularCards.length > 0) {
    const dividerRow2 = document.createElement('tr');
    dividerRow2.className = 'section-divider';
    dividerRow2.innerHTML = `<td colspan="7"><span class="section-label cards-label">🃏 Individual Cards <span class="section-count">${regularCards.length}</span></span></td>`;
    frag.appendChild(dividerRow2);
  }

  regularCards.forEach((card, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'card-row';
    tr.style.animationDelay = `${Math.min((hasSealedSection ? sealedCards.length + idx : idx) * 10, 250)}ms`;

    const uv = parsePrice(card.ungraded);
    const pv = parsePrice(card.psa10);
    const uClass = `price price-u${uv && uv >= HOT_U ? ' hot' : ''}`;
    const pClass  = `price price-p10${pv && pv >= GEM_P10 ? ' gem' : ''}`;
    const g9Class = card.grade9 === '—' ? 'price price-nil' : 'price price-g9';
    const u2Class = card.ungraded === '—' ? 'price price-nil' : uClass;
    const total = invTotalForCard(card.id);
    const qtyBadge = total > 0 ? `<span class="qty-badge">${total}</span>` : '';

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
      <td class="td-action">${qtyBadge}<button class="btn-dots" data-card-id="${escA(card.id)}" aria-label="Inventory options">⋮</button></td>`;
    frag.appendChild(tr);
  });

  E.tbody.innerHTML = '';
  E.tbody.appendChild(frag);

  E.footerBar.style.display = 'flex';
  const totalLabel = hasSealedSection
    ? `${regularCards.length} cards · ${sealedCards.length} sealed · ${S.allCards.length} total`
    : `${cards.length} of ${S.allCards.length} cards`;
  E.footerCount.textContent = totalLabel;
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
  if (S.filterOwned) { filterOwnedProducts(e.target.value); return; }
  S.query = e.target.value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(renderCards, 160);
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

function filterOwnedProducts(query) {
  const q = query.toLowerCase().trim();
  E.ownedProductsTbody.querySelectorAll('tr.owned-row').forEach(row => {
    const name = row.querySelector('.td-name')?.textContent?.toLowerCase() || '';
    row.style.display = !q || name.includes(q) ? '' : 'none';
  });
}

function sortOwnedProducts(sortValue) {
  const rows = Array.from(E.ownedProductsTbody.querySelectorAll('tr.owned-row'));
  rows.sort((a, b) => {
    const getPrice = (row, col) => parseFloat(row.cells[col]?.textContent || '0') || 0;
    const getNum = (row, col) => parseInt(row.cells[col]?.textContent || '0') || 0;
    const getName = (row) => row.cells[2]?.textContent || '';

    switch (sortValue) {
      case 'name-asc':    return getName(a).localeCompare(getName(b));
      case 'price-desc':  return getPrice(b, 5) - getPrice(a, 5);  // Ungraded col
      case 'price-asc':   return getPrice(a, 5) - getPrice(b, 5);
      case 'psa10-desc':  return getPrice(b, 7) - getPrice(a, 7);  // PSA 10 col
      case 'grade9-desc': return getPrice(b, 6) - getPrice(a, 6);  // Grade 9 col
      default: return getNum(a, 0) - getNum(b, 0);                 // Default: restore index order
    }
  });
  const frag = document.createDocumentFragment();
  rows.forEach(r => frag.appendChild(r));
  E.ownedProductsTbody.appendChild(frag);
}

E.sortSelect.addEventListener('change', e => {
  if (S.setsView) { sortSetsOverview(e.target.value); return; }
  if (S.filterOwned) { sortOwnedProducts(e.target.value); return; }
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
  if (!API || !S.game || isRefreshingCache) return;
  isRefreshingCache = true;
  const originalText = E.cachePill.textContent;
  E.cachePill.textContent = 'Refreshing…';
  E.cachePill.style.opacity = '0.6';
  E.statCache.style.opacity = '0.6';
  try {
    await fetch(`${API}/api/refresh-cache?game=${encodeURIComponent(S.game)}`);
    // Wait a moment for the server to complete the refresh
    await new Promise(r => setTimeout(r, 1500));
    await updateCachePill();
    // If a set is currently loaded, reload its card prices
    if (S.slug) {
      S.allCards = []; // Clear cached cards to force a fresh fetch
      const btn = document.querySelector(`.set-item[data-slug="${CSS.escape(S.slug)}"]`);
      await loadSet(S.slug, btn ? btn.dataset.name : S.slug, btn);
    }
  } catch (err) {
    E.cachePill.textContent = originalText;
    console.error('Failed to refresh cache:', err);
  } finally {
    E.cachePill.style.opacity = '1';
    E.statCache.style.opacity = '1';
    isRefreshingCache = false;
  }
}

// ── LocalStorage: Set stats cache ─────────────────────────────────────────
const LS_STATS_KEY = 'tcg-set-stats-v1';
const LS_STATS_TTL_MS = 60 * 60 * 1000; // 1 hour (matches server cache)

function loadStatsFromStorage() {
  try {
    const raw = localStorage.getItem(LS_STATS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.entries) return;
    const now = Date.now();
    let loaded = 0, expired = 0;
    for (const [slug, rec] of Object.entries(parsed.entries)) {
      if (!rec || typeof rec !== 'object') continue;
      if (now - (rec.cachedAt || 0) > LS_STATS_TTL_MS) { expired++; continue; }
      const { cachedAt, ...stats } = rec;
      S.setStats.set(slug, stats);
      loaded++;
    }
    if (expired > 0) saveStatsToStorage(); // rewrite without expired entries
    if (loaded > 0) console.log(`[ls-stats] loaded ${loaded} cached set stats${expired ? ` (${expired} expired)` : ''}`);
  } catch (e) {
    console.warn('[ls-stats] load failed', e);
  }
}

let saveStatsTimer = null;
function saveStatsToStorage() {
  clearTimeout(saveStatsTimer);
  saveStatsTimer = setTimeout(() => {
    try {
      const entries = {};
      const now = Date.now();
      for (const [slug, stats] of S.setStats.entries()) {
        entries[slug] = { ...stats, cachedAt: stats.cachedAt || now };
      }
      localStorage.setItem(LS_STATS_KEY, JSON.stringify({ v: 1, entries }));
    } catch (e) {
      console.warn('[ls-stats] save failed', e);
    }
  }, 300);
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
  S.setsView = true;
  E.btnViewSets.classList.add('active');
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
}

function exitSetsView(restoreState = true) {
  S.setsView = false;
  E.btnViewSets.classList.remove('active');
  E.cardSearch.value = '';
  E.cardSearch.placeholder = 'Search cards…';
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
}

function renderSetsOverview() {
  const game   = S.games[S.game];
  const sets   = game?.sets || [];
  const label  = game?.label || 'Sets';
  E.setsOvTitle.textContent = `${label} — ${sets.length} Sets`;
  E.setsOvTbody.innerHTML = '';

  const CHUNK = 60;
  let i = 0;
  function renderChunk() {
    const frag = document.createDocumentFragment();
    const end = Math.min(i + CHUNK, sets.length);
    for (; i < end; i++) {
      const s = sets[i];
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
      // Click row to navigate to set
      tr.addEventListener('click', (e) => {
        if (e.target.closest('.btn-load-row')) return;
        const btn = document.querySelector(`.set-item[data-slug="${CSS.escape(s.slug)}"]`);
        loadSet(s.slug, s.name, btn);
      });
      frag.appendChild(tr);
    }
    E.setsOvTbody.appendChild(frag);
    if (i < sets.length) requestAnimationFrame(renderChunk);
  }
  renderChunk();
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
      saveStatsToStorage();
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

let loadAllAbort = false;
async function loadAllStats() {
  const sets = S.games[S.game]?.sets || [];
  if (!sets.length) return;
  loadAllAbort = false;
  E.btnLoadAllStats.disabled = true;
  let done = 0;
  for (const s of sets) {
    if (loadAllAbort) break;
    E.btnLoadAllStats.textContent = `Loading ${done + 1}/${sets.length}…`;
    const row = E.setsOvTbody?.querySelector(`tr[data-slug="${CSS.escape(s.slug)}"]`);
    if (row) await loadSetStatsRow(s.slug, s.name, row, true);
    done++;
    if (done < sets.length) await new Promise(r => setTimeout(r, 200));
  }
  E.btnLoadAllStats.disabled = false;
  E.btnLoadAllStats.textContent = 'Load All Stats';
}

// ── Inventory Management ──────────────────────────────────────────────────
function loadCollectionsFromStorage() {
  try {
    // Legacy migration
    const legacy = localStorage.getItem('tcg-inventory');
    if (legacy) {
      try {
        const obj = JSON.parse(legacy);
        const items = new Map(Object.entries(obj).map(([k, v]) => [k, Number(v)]));
        const col = { id: makeCollId(), name: 'My Collection', items };
        S.collections = [col];
        S.activeCollectionId = col.id;
        S.inventory = col.items;
        localStorage.removeItem('tcg-inventory');
        localStorage.removeItem('tcg-inventory-synced');
        saveCollectionsToStorage();
        return;
      } catch {}
    }

    const raw = localStorage.getItem('tcg-collections');
    if (raw) {
      try {
        const { cols, active } = JSON.parse(raw);
        S.collections = cols.map(c => ({
          id: c.id,
          name: c.name,
          items: new Map(Object.entries(c.items || {}).map(([k, v] ) => [k, Number(v)]))
        }));
        S.activeCollectionId = active;
        const col = getActiveCollection();
        if (col) { S.activeCollectionId = col.id; S.inventory = col.items; }
      } catch {}
    }
  } catch (err) { console.warn('[collections] load from storage failed', err); }
  ensureDefaultCollection();
}

async function syncInventoryToContract() {
  if (!S.wallet.connected || !window.__inventory?.isAvailable()) {
    E.btnSyncInv?.classList.remove('syncing');
    return;
  }

  E.btnSyncInv?.classList.add('syncing');
  E.btnSyncInv.textContent = 'Syncing…';
  E.btnSyncInv.disabled = true;

  try {
    const toSync = [];
    for (const [k, v] of S.inventory) {
      if (!S.inventorySynced.has(k)) {
        toSync.push({ key: k, qty: v });
      }
    }

    for (const { key, qty } of toSync) {
      const [game, slug, cardId, grading] = key.split('|');
      if (qty > 0) {
        await window.__inventory.setCardQuantity(game, slug, cardId, Number(grading), qty);
      }
      S.inventorySynced.add(key);
    }

    saveCollectionsToStorage();
    E.btnSyncInv.textContent = toSync.length > 0 ? 'Synced!' : 'Up to date';
  } catch (err) {
    console.error('[inventory] sync failed', err);
    E.btnSyncInv.textContent = 'Sync failed';
  } finally {
    E.btnSyncInv?.classList.remove('syncing');
    E.btnSyncInv.disabled = false;
    setTimeout(() => {
      if (E.btnSyncInv) E.btnSyncInv.textContent = '↔ Sync';
    }, 2000);
  }
}

function saveCollectionsToStorage() {
  try {
    localStorage.setItem('tcg-collections', JSON.stringify({
      cols: S.collections.map(c => ({ id: c.id, name: c.name, items: Object.fromEntries(c.items) })),
      active: S.activeCollectionId
    }));
    localStorage.setItem('tcg-inventory-synced', JSON.stringify([...S.inventorySynced]));
  } catch (err) { console.warn('[collections] save to storage failed', err); }
}

function updateInventoryUI() {
  const connected = S.wallet.connected;
  // Enable the owned button always (there's always a collection)
  if (E.filterOwnedBtn) E.filterOwnedBtn.disabled = false;
  if (E.btnSyncInv) E.btnSyncInv.disabled = !connected;
}

function updateCollectionControls() {
  const inOwned = S.filterOwned;
  // toolbar-left: show set-title OR collection-name-input
  E.setTitle.style.display = inOwned ? 'none' : '';
  E.setExtLink.style.display = inOwned ? 'none' : (S.slug ? '' : 'none');
  E.collectionNameInput.style.display = inOwned ? '' : 'none';
  // toolbar-right: show collection controls only in owned view
  E.collectionControls.style.display = inOwned ? 'flex' : 'none';

  if (!inOwned) return;

  const col = getActiveCollection();
  E.collectionNameInput.value = col?.name || '';
  E.collectionSelect.innerHTML = S.collections.map(c =>
    `<option value="${escA(c.id)}"${c.id === S.activeCollectionId ? ' selected' : ''}>${esc(c.name)}</option>`
  ).join('');
  E.btnCollectionDelete.disabled = S.collections.length <= 1;
}

// ── Wallet State Handler ──────────────────────────────────────────────────
window.__walletStateChange = function({ address, isConnected }) {
  S.wallet.connected = isConnected;
  S.wallet.address = address || null;
  if (isConnected && address) {
    localStorage.setItem('tcg-wallet-addr', address);
  } else {
    localStorage.removeItem('tcg-wallet-addr');
  }
  if (E.btnSyncInv) E.btnSyncInv.disabled = !isConnected;
  updateInventoryUI();
};

// ── Init ──────────────────────────────────────────────────────────────────
async function init() {
  applyAccent(S.game);
  if (window.__updateWalletAccent) window.__updateWalletAccent();
  loadStatsFromStorage();
  loadCollectionsFromStorage();
  console.log('[init] inventory loaded:', S.inventory.size, 'items');
  console.log('[init] filter btn:', E.filterOwnedBtn);
  updateInventoryUI();

  const savedAddr = localStorage.getItem('tcg-wallet-addr');
  if (savedAddr) S.wallet.address = savedAddr;

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
    renderSetList();
    updateCachePill();
    // Update cache display every minute
    setInterval(updateCachePillDisplay, 60 * 1000);
    // Refresh cache status every 5 minutes
    setInterval(updateCachePill, 5 * 60 * 1000);
  } catch (err) {
    E.setSkeleton.style.display = 'none';
    const msg = document.createElement('div');
    msg.style.cssText = 'padding:1rem;font-size:var(--text-xs);color:var(--error)';
    msg.textContent = 'Could not reach proxy server. Make sure it\'s running on port 3847.';
    E.setList.appendChild(msg);
  }
}

// ── Render Owned Products Table ──────────────────────────────────────────
async function renderOwnedProducts() {
  console.log('[renderOwnedProducts] starting, inventory size:', S.inventory.size);
  console.log('[renderOwnedProducts] cardCache size:', S.cardCache.size);

  const items = [];
  const setsToFetch = new Set();

  for (const [key, qty] of S.inventory) {
    const [game, slug, cardId, grading] = key.split('|');
    const g = S.games[game];
    if (!g) continue;

    const sets = g.sets || [];
    const set = sets.find(s => s.slug === slug);
    if (!set) continue;

    const cardKey = `${game}|${slug}|${cardId}`;
    const cardEntry = items.find(i => i.cardKey === cardKey);

    if (!cardEntry) {
      items.push({
        cardKey,
        game, slug, cardId,
        gameName: g.label,
        setName: set.name,
        card: null,
        qty: { 0: 0, 9: 0, 10: 0 }
      });
    }

    const entry = items.find(i => i.cardKey === cardKey);
    entry.qty[parseInt(grading)] = qty;

    // Check if this card is in cache; if not, mark set for fetching
    if (!S.cardCache.has(cardKey)) {
      setsToFetch.add(slug);
    }
  }

  // Fetch any missing sets
  if (setsToFetch.size > 0) {
    console.log('[renderOwnedProducts] fetching', setsToFetch.size, 'sets');
    if (E.loadingLabel) E.loadingLabel.textContent = 'Loading collection…';
    showState('loading');
    for (const slug of setsToFetch) {
      try {
        const d = await fetchSet(slug);
        if (d.cards && d.cards.length) {
          for (const card of d.cards) {
            // Find the game from items using this slug
            const item = items.find(i => i.slug === slug);
            const game = item?.game || S.game;
            const cacheKey = `${game}|${slug}|${card.id}`;
            S.cardCache.set(cacheKey, card);
          }
        }
      } catch (err) {
        console.warn('[renderOwnedProducts] failed to fetch set', slug, err);
      }
    }
  }

  console.log('[renderOwnedProducts] found', items.length, 'unique items to render');
  let html = '';
  let rowIdx = 1;
  items.forEach((item) => {
    const cacheKey = `${item.game}|${item.slug}|${item.cardId}`;
    const card = S.cardCache.get(cacheKey);
    if (!card) {
      console.log('[renderOwnedProducts] card still not in cache:', cacheKey);
      return;
    }

    const thumb = card.thumb || card.image || '';
    const imgHtml = thumb ? `<img class="card-thumb" src="${escA(thumb)}" alt="${escA(card.name)}" style="cursor:pointer">` : '';
    const total = item.qty[0] + item.qty[9] + item.qty[10];
    const qtyBadge = total > 0 ? `<span class="qty-badge">${total}</span>` : '';

    html += `
      <tr class="owned-row">
        <td class="td-num">${rowIdx}</td>
        <td class="td-img">${imgHtml}</td>
        <td class="td-name" title="${escA(card.name)}">${esc(card.name)}</td>
        <td class="td-name" title="${escA(item.setName)}">${esc(item.setName)}</td>
        <td class="td-name" title="${escA(item.gameName)}">${esc(item.gameName)}</td>
        <td class="td-price">${esc(card.ungraded)}</td>
        <td class="td-price">${esc(card.grade9)}</td>
        <td class="td-price">${esc(card.psa10)}</td>
        <td class="td-action">${qtyBadge}<button class="btn-dots" data-card-id="${escA(card.id)}" data-game="${escA(item.game)}" data-slug="${escA(item.slug)}" aria-label="Inventory options">⋮</button></td>
      </tr>
    `;
    rowIdx++;
  });

  E.ownedProductsTbody.innerHTML = html;
  updateCollectionControls();
  showState('owned-view');
}

// ── Filter Owned Toggle ───────────────────────────────────────────────────
E.filterOwnedBtn?.addEventListener('click', async () => {
  S.filterOwned = !S.filterOwned;
  E.filterOwnedBtn.setAttribute('aria-pressed', S.filterOwned ? 'true' : 'false');
  E.filterOwnedBtn.classList.toggle('active', S.filterOwned);
  updateCollectionControls();
  if (S.filterOwned) await renderOwnedProducts();
  else renderCards();
});

// ── Sets Overview events ──────────────────────────────────────────────────
E.btnViewSets.addEventListener('click', enterSetsView);
E.btnLoadAllStats.addEventListener('click', loadAllStats);

// Delegate per-row Load/Retry buttons (added dynamically)
E.setsOvTbody.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-load-row');
  if (!btn) return;
  e.stopPropagation(); // prevent row click from also firing loadSet()
  const row = btn.closest('tr');
  if (row) loadSetStatsRow(btn.dataset.slug, btn.dataset.name, row);
});

// ── Cache click handlers ──────────────────────────────────────────────────
E.cachePill.addEventListener('click', refreshCacheNow);
E.statCache.addEventListener('click', refreshCacheNow);

// ── Collection controls ───────────────────────────────────────────────────
E.collectionSelect?.addEventListener('change', () => switchCollection(E.collectionSelect.value));

E.btnCollectionAdd?.addEventListener('click', () => {
  const name = prompt('Collection name:', `Collection ${S.collections.length + 1}`);
  if (name !== null) createCollection(name.trim() || `Collection ${S.collections.length + 1}`);
});

E.btnCollectionDelete?.addEventListener('click', () => {
  const col = getActiveCollection();
  if (!col || S.collections.length <= 1) return;
  if (confirm(`Delete "${col.name}"? This cannot be undone.`)) deleteCollection(col.id);
});

E.collectionNameInput?.addEventListener('change', () =>
  renameCollection(S.activeCollectionId, E.collectionNameInput.value));
E.collectionNameInput?.addEventListener('blur', () =>
  renameCollection(S.activeCollectionId, E.collectionNameInput.value));

init();

// ── Sidebar toggle (mobile) ───────────────────────────────────────────────
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

function openInvPopover(card, triggerBtn, game, slug) {
  invCurrentCard = card;
  invCurrentGame = game || S.game;
  invCurrentSlug = slug || S.slug;
  E.invCardName.textContent = card.name;
  refreshInvQtyRows();
  E.invStatus.textContent = '';
  E.invQtyInput.value = '1';
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
}

function refreshInvQtyRows() {
  if (!invCurrentCard) return;
  const labels = { 0: 'Ungraded', 9: 'Grade 9', 10: 'PSA 10' };
  const gradings = [0, 9, 10];
  let hasQty = false;

  gradings.forEach(g => {
    const qty = S.inventory.get(invKey(invCurrentGame, invCurrentSlug, invCurrentCard.id, g)) || 0;
    const rowId = `inv-qty-row-${g}`;
    let row = document.getElementById(rowId);

    if (qty > 0) {
      hasQty = true;
      if (!row) {
        row = document.createElement('div');
        row.id = rowId;
        row.className = 'inv-qty-row';
        row.innerHTML = `<span>${labels[g]}</span><span class="inv-qty-val"></span>`;
        E.invQtyRows.appendChild(row);
      }
      // Update qty value only
      const valSpan = row.querySelector('.inv-qty-val');
      if (valSpan) valSpan.textContent = qty;
    } else {
      if (row) row.remove();
    }
  });

  // Show empty message only if no quantities exist
  if (!hasQty && !E.invQtyRows.querySelector('.inv-qty-empty')) {
    const col = getActiveCollection();
    const colName = col?.name || 'Collection';
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'inv-qty-empty';
    emptyDiv.textContent = `Not in ${colName}`;
    E.invQtyRows.appendChild(emptyDiv);
  } else if (hasQty) {
    const empty = E.invQtyRows.querySelector('.inv-qty-empty');
    if (empty) empty.remove();
  }
}

function invAction(action) {
  if (!invCurrentCard) return;
  const grading = Number(E.invGrading.value);
  const qty = parseInt(E.invQtyInput.value, 10);
  if (!qty || qty < 1) {
    E.invStatus.textContent = 'Enter a valid quantity.';
    return;
  }

  const key = invKey(invCurrentGame, invCurrentSlug, invCurrentCard.id, grading);
  const current = S.inventory.get(key) || 0;
  let newQty = current;

  if (action === 'add') newQty = current + qty;
  else if (action === 'remove') {
    if (current < qty) {
      E.invStatus.textContent = 'Not enough in inventory.';
      return;
    }
    newQty = current - qty;
  } else if (action === 'set') newQty = qty;

  if (newQty > 0) {
    S.inventory.set(key, newQty);
  } else {
    S.inventory.delete(key);
  }

  // Mark as unsynced
  S.inventorySynced.delete(key);
  saveCollectionsToStorage();

  // Populate card cache for owned products view
  if (invCurrentCard && invCurrentGame && invCurrentSlug) {
    const cacheKey = `${invCurrentGame}|${invCurrentSlug}|${invCurrentCard.id}`;
    S.cardCache.set(cacheKey, invCurrentCard);
  }

  E.invStatus.textContent = 'Saved locally. Sync to blockchain →';
  refreshInvQtyRows();

  // Update owned products table if visible
  if (S.filterOwned) {
    const totalQty = [0, 9, 10].reduce((sum, g) => sum + (S.inventory.get(invKey(invCurrentGame, invCurrentSlug, invCurrentCard.id, g)) || 0), 0);
    const row = E.ownedProductsTbody.querySelector(`button[data-card-id="${escA(invCurrentCard.id)}"][data-game="${escA(invCurrentGame)}"][data-slug="${escA(invCurrentSlug)}"]`)?.closest('tr');
    if (row) {
      if (totalQty === 0) {
        row.remove();
      } else {
        const badge = row.querySelector('.qty-badge');
        if (badge) badge.textContent = totalQty;
      }
    }
  }

  if (invCurrentSlug && S.allCards.length) renderCards();

  // Show sync button more prominently
  if (E.btnSyncInv) {
    E.btnSyncInv.classList.add('unsync');
  }
}

E.btnInvAdd.addEventListener('click', () => invAction('add'));
E.btnInvRemove.addEventListener('click', () => invAction('remove'));
E.btnInvSet.addEventListener('click', () => invAction('set'));
E.invClose.addEventListener('click', closeInvPopover);

E.btnSyncInv?.addEventListener('click', () => {
  if (!E.btnSyncInv.disabled) syncInventoryToContract();
});

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

E.ownedProductsTbody.addEventListener('click', e => {
  const btn = e.target.closest('.btn-dots');
  if (!btn) return;
  const cardId = btn.dataset.cardId;
  const game = btn.dataset.game;
  const slug = btn.dataset.slug;
  const card = Array.from(S.cardCache.values()).find(c => c.id === cardId);
  if (!card) return;
  if (E.invPopover.style.display !== 'none' && invCurrentCard?.id === card.id) {
    closeInvPopover();
  } else {
    openInvPopover(card, btn, game, slug);
  }
});

document.addEventListener('click', e => {
  if (!E.invPopover || E.invPopover.style.display === 'none') return;
  if (!E.invPopover.contains(e.target) && !e.target.closest('.btn-dots')) {
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
