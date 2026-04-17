// ═══════════════════════════════════════════════════════════════════════════
// IndexedDB Helper — TCGDb global
// ═══════════════════════════════════════════════════════════════════════════

window.TCGDb = (() => {
  const DB_NAME = 'tcg-price-tracker';
  const DB_VERSION = 1;
  let _dbPromise = null;

  function open() {
    if (_dbPromise) return _dbPromise;
    _dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('tcgplayer-products')) db.createObjectStore('tcgplayer-products');
        if (!db.objectStoreNames.contains('tcgplayer-cards'))    db.createObjectStore('tcgplayer-cards');
        if (!db.objectStoreNames.contains('price-products'))     db.createObjectStore('price-products');
        if (!db.objectStoreNames.contains('set-stats'))          db.createObjectStore('set-stats');
        if (!db.objectStoreNames.contains('games-sets'))         db.createObjectStore('games-sets');
      };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror   = e => reject(e.target.error);
    });
    return _dbPromise;
  }

  async function tx(store, mode, fn) {
    const db = await open();
    return new Promise(async (resolve, reject) => {
      const t = db.transaction(store, mode);
      t.onerror = () => reject(new Error(`Transaction error on ${store}`));
      try {
        const result = await fn(t.objectStore(store));
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }

  function wrap(req) {
    return new Promise((res, rej) => {
      req.onsuccess = e => res(e.target.result);
      req.onerror = e => rej(e.target.error);
    });
  }

  async function get(store, key) {
    return await tx(store, 'readonly', s => wrap(s.get(key)));
  }

  async function put(store, key, value) {
    return await tx(store, 'readwrite', s => wrap(s.put(value, key)));
  }

  async function del(store, key) {
    return tx(store, 'readwrite', s => wrap(s.delete(key)));
  }

  async function clear(store) {
    return tx(store, 'readwrite', s => wrap(s.clear()));
  }

  async function getAllKeys(store) {
    return tx(store, 'readonly', s => wrap(s.getAllKeys()));
  }

  async function getAll(store) {
    return tx(store, 'readonly', s => new Promise((res, rej) => {
      const results = [];
      const req = s.openCursor();
      req.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
          results.push({ key: cursor.key, value: cursor.value });
          cursor.continue();
        } else {
          res(results);
        }
      };
      req.onerror = e => rej(e.target.error);
    }));
  }

  async function migrateFromLocalStorage() {
    // 1. tcgplayer-products-by-game-set-v1 → tcgplayer-products
    const raw1 = localStorage.getItem('tcg-tcgplayer-products-by-game-set-v1');
    if (raw1) {
      const keys = await getAllKeys('tcgplayer-products');
      if (keys.length === 0) {
        const stored = JSON.parse(raw1);
        for (const [gk, sets] of Object.entries(stored)) {
          for (const [canonical, setData] of Object.entries(sets)) {
            if (canonical.endsWith('__indexed') || !setData?.products) continue;
            await put('tcgplayer-products', [gk, canonical], {
              products: setData.products,
              originalName: setData.originalName,
              canonical: setData.canonical,
              paramName: setData.paramName,
              scrapedAt: setData.scrapedAt
            });
          }
        }
        localStorage.removeItem('tcg-tcgplayer-products-by-game-set-v1');
      }
    }

    // 2. tcg-tcgplayer-v1 → tcgplayer-cards
    const raw2 = localStorage.getItem('tcg-tcgplayer-v1');
    if (raw2) {
      const keys = await getAllKeys('tcgplayer-cards');
      if (keys.length === 0) {
        for (const [k, v] of Object.entries(JSON.parse(raw2))) {
          if (v?.cards) await put('tcgplayer-cards', k, v);
        }
        localStorage.removeItem('tcg-tcgplayer-v1');
      }
    }

    // 3. tcg-products-v1 → price-products
    const raw3 = localStorage.getItem('tcg-products-v1');
    if (raw3) {
      const keys = await getAllKeys('price-products');
      if (keys.length === 0) {
        for (const [k, v] of Object.entries(JSON.parse(raw3))) {
          if (v?.card) await put('price-products', k, v);
        }
        localStorage.removeItem('tcg-products-v1');
      }
    }

    // 4. tcg-set-stats-v2 → set-stats
    const raw4 = localStorage.getItem('tcg-set-stats-v2');
    if (raw4) {
      const existing = await get('set-stats', 'all');
      if (!existing) {
        await put('set-stats', 'all', JSON.parse(raw4));
        localStorage.removeItem('tcg-set-stats-v2');
      }
    }

    // 5. tcg-tcgplayer-games-sets-v1 → games-sets
    const raw5 = localStorage.getItem('tcg-tcgplayer-games-sets-v1');
    if (raw5) {
      const existing = await get('games-sets', 'all');
      if (!existing) {
        await put('games-sets', 'all', JSON.parse(raw5));
        localStorage.removeItem('tcg-tcgplayer-games-sets-v1');
      }
    }
  }

  async function clearAll() {
    const stores = ['tcgplayer-products', 'tcgplayer-cards', 'price-products', 'set-stats', 'games-sets'];
    for (const store of stores) {
      await clear(store);
    }
  }

  return { open, get, put, delete: del, clear, clearAll, getAllKeys, getAll, migrateFromLocalStorage };
})();
