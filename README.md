<img width="2182" height="1545" alt="image" src="https://github.com/user-attachments/assets/d8c41bd9-0383-439a-a445-f2439f083448" />

##

# TCG Price Index

Multi-source card price aggregator for 10 TCGs (Pokémon, MTG, Yu-Gi-Oh, One Piece, Lorcana, Digimon, Dragon Ball, Gundam, Star Wars Unlimited, Riftbound). Live prices scraped from **PriceCharting** and **TCGPlayer**, with user accounts, shopping cart, inventory management, and Stripe checkout. Runs as web app (Node.js) or desktop (Windows/macOS via Tauri).

## How It Works

**Price Sources:**
- **PriceCharting** — HTML scraping of card listings, set catalogs, and prices (Ungraded / Grade 9 / PSA 10)
- **TCGPlayer** — Puppeteer browser automation for JavaScript-rendered product pages with real-time stock data

**Real-Time Pipeline:**
- Server aggregates both sources on-demand (caches results 1-hour)
- Frontend listens via Socket.io for live scrape progress
- Products streamed per-page, accumulated in UI during scrape
- Card search matches across both sources

**Store & Checkout:**
- Admin stocks inventory with quantities and prices (PostgreSQL backend)
- Users browse cards, add to cart, checkout via Stripe
- Orders created in database, cart cleared on payment success

## Key Features

- **Dual-source pricing** — Aggregated PriceCharting + TCGPlayer data with live scraping
- **3-tier pricing** — Ungraded, Grade 9, PSA 10
- **Smart search & sort** — By name, price, rarity; toggle sealed products (boxes/decks)
- **Real-time scraping** — Socket.io progress updates, per-page product streaming
- **User accounts** — Email/password registration, JWT auth, admin roles
- **Shopping cart** — Persist across sessions, per-grading selections
- **Stripe checkout** — Full payment processing, order tracking
- **Admin inventory** — Stock cards, set prices, manage quantities
- **Collections** — Wishlists (DB support, API routes available)
- **9 color themes** — Round-robin cycling, light/dark auto-detect
- **Desktop app** — Tauri v2 standalone Windows/macOS (auto-installs PostgreSQL on Windows)

---

## Quick Start

### 1. Prerequisites

**Web or Desktop:**
- Node.js v14+, npm
- PostgreSQL v12+ (auto-installed on Windows, use `brew install postgresql` on macOS)

**Desktop Build (Windows/macOS):**
- Rust (from [rustup.rs](https://rustup.rs))
- Windows: MSVC toolchain + Visual Studio 2022 Build Tools (C++ workload)

### 2. Setup

```bash
git clone <repository>
cd tcg-price-tracker
npm install

cp .env.example .env
# Edit .env with your database URL, JWT secret, Stripe keys, admin API key
```

**Required `.env` variables:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/tcg_tracker
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADMIN_API_KEY=your-admin-key
PORT=3847
```

### 3. Run (Web)

```bash
node server/server.js
```

Open **http://localhost:3847** in your browser.

### 4. Or Build Desktop App

```bash
npm run tauri:build
```

Installer runs `db/init.js` on first startup (auto-creates PostgreSQL database + tables on Windows).

---

## Scraping Data Flow

**On-Demand Scraping** (`POST /api/data/{game}/{set}`)

1. **Check cache** — If fresh (<1 hour), return cached results
2. **PriceCharting** — HTTP scrape set page, extract cards with prices
3. **TCGPlayer** — Puppeteer launch, navigate set page, paginate products, emit progress via Socket.io
4. **Merge** — Combine results, deduplicate by card name + product number
5. **Stream to client** — Clients receive `tcgplayer:page-scraped` events with product arrays
6. **Cache** — Store 1 hour in memory
7. **Return** — Final combined array of all products

**Real-Time Socket.io Events (Client listens):**
- `tcgplayer:page-scraped` — Per-page payload: `{ game, slug, page, products[] }`
- `tcgplayer:scrape-complete` — Summary: `{ productCount, totalPages }`

**Example client integration:**
```javascript
socket.on('tcgplayer:page-scraped', ({ game, slug, page, products }) => {
  console.log(`Scraped page ${page}, got ${products.length} products`);
  // Accumulate in UI during live scrape
});
```

---

## Data Sources & Scraping Strategy

### PriceCharting

| Aspect | Details |
|--------|---------|
| **Source URL** | `https://www.pricecharting.com/category/{game}-cards` |
| **Method** | HTTP scraping + regex parsing |
| **Data** | Card name, product ID, prices (Ungraded/Grade 9/PSA 10), image URLs |
| **Sealed detection** | Regex filters booster boxes, theme decks, products |
| **Rate limit** | 500–1500ms random delay per request |
| **Cache TTL** | 1 hour per set |

### TCGPlayer

| Aspect | Details |
|--------|---------|
| **Source URL** | `https://www.tcgplayer.com/search/{game}/{set}` |
| **Method** | Puppeteer (headless Chrome + DOM extraction) |
| **Data** | Product ID, card name, card number, rarity, foil status, listings count, prices |
| **Browser config** | User-Agent: Chrome 120 on Windows 10, `waitUntil: domcontentloaded` (45s timeout) |
| **Pagination** | Auto-detects page count, scrapes all pages (1s delay between) |
| **Queue** | Single-threaded, prevents concurrent Puppeteer launches |
| **Cache TTL** | 1 hour per game/set pair |

### Card Matching

Results deduplicated by:
- **Card name** (exact match, case-insensitive)
- **Product number** (TCGPlayer product ID or PriceCharting product ID)

If both sources have the same card, prices merged into single result.

---

## Features in Depth

### User Features

**Browsing & Search**
- Browse 10 games, 100+ sets per game
- Search cards by name, sort by price/rarity
- View 3-tier prices: Ungraded, Grade 9, PSA 10
- Toggle sealed products (filter booster boxes vs. singles)
- Cache age display (shows when data was last scraped)
- Stats bar: card count, average price, max price, rarity distribution

**Authentication** (`POST /api/auth/register`, `POST /api/auth/login`)
- Email/password registration
- JWT tokens (7-day expiry)
- Persistent sessions via `Authorization: Bearer` header

**Shopping Cart**
- Add cards with grading selection (Ungraded/Grade 9/PSA 10)
- Cart persists across sessions (PostgreSQL)
- Quantity updates, item removal
- Real-time inventory availability check
- **Endpoints:** `GET /api/cart`, `POST /api/cart/add`, `DELETE /api/cart/remove`, `PUT /api/cart/update`

**Checkout** (Stripe integration)
- `POST /api/checkout/session` — Create Stripe checkout session
- Validates inventory availability, calculates total
- Redirects to Stripe payment page
- `POST /api/checkout/webhook` — Stripe webhook listener
  - Listens for `checkout.session.completed` event
  - Decrements inventory, marks order complete, clears cart

**Collections** (Wishlists)
- Multiple wishlists per user (database schema: `collections`, `collection_items`)
- **Note:** API routes (`GET /api/collections`, `POST /api/collections`) available but not yet fully integrated in UI

### Admin Features

**Inventory Management** (API key OR JWT with `is_admin: true`)
- `GET /api/admin/inventory` — List all stocked items
- `POST /api/admin/inventory/add` — Upsert card (quantity, price in cents)
- `DELETE /api/admin/inventory/remove` — Remove item
- Stores: game, set, card number, grading, quantity, price, card name

**Public Store View**
- `GET /api/store-inventory?game=X&set_slug=Y` — Check in-stock items
- `GET /api/inventory` — Full public inventory (shows available qty, accounts for cart reservations)
- Users can browse store stock and add to cart

### Visual Customization

**Themes** (9 options with round-robin cycling)
- Pokémon, Lavender, Ocean Pro, Coral Blush, Forest, Slate, Warm Earth, Mint Fresh, Amethyst
- Per-game accent colors applied to UI
- Manual light/dark override (stored in localStorage)
- Auto light/dark based on time of day (evening/night = dark mode)

---

## System Architecture

```
┌─ Frontend (site/app.js) ─────────────────────────────────────┐
│  Vanilla JS SPA + IndexedDB caching                           │
│  Socket.io listener for scrape progress                       │
│  Auth modal, cart modal, game/set browser                    │
└───────────────────────┬──────────────────────────────────────┘
                        │ HTTP + Socket.io
┌───────────────────────▼──────────────────────────────────────┐
│ Backend (server/server.js, Node.js)                          │
│                                                               │
│  ┌─ Scraping Pipeline ──────────────────────┐               │
│  │ HTTP (PriceCharting) + Puppeteer (TCGPlayer)             │
│  │ Caching (1-hour TTL in memory)                           │
│  │ Socket.io emit: `tcgplayer:page-scraped`                │
│  └──────────────────────────────────────────┘               │
│                                                               │
│  ┌─ API Endpoints ──────────────────────────┐               │
│  │ /api/data/{game}/{set}                                  │
│  │ /api/auth/register, /api/auth/login                     │
│  │ /api/cart/*, /api/checkout/*                            │
│  │ /api/admin/inventory/* (admin only)                     │
│  │ /api/collections/* (user wishlists)                     │
│  └──────────────────────────────────────────┘               │
└───────────────────────┬──────────────────────────────────────┘
                        │ PostgreSQL
┌───────────────────────▼──────────────────────────────────────┐
│ Database (PostgreSQL)                                         │
│                                                               │
│ Tables:                                                       │
│  • users (email, password_hash, is_admin)                   │
│  • cart_items (user cart state)                             │
│  • inventory (admin stock: qty, price)                      │
│  • orders (completed purchases)                              │
│  • collections, collection_items (wishlists)                │
└───────────────────────────────────────────────────────────────┘
```

**Desktop App (Tauri v2):**
- Rust launcher spawns Node.js sidecar process
- Polls port 3847 until server ready (30s timeout)
- Shows window, serves frontend via `http://localhost:3847`
- Kills sidecar on window close
- Windows: Auto-installs PostgreSQL if missing (NSIS + PowerShell)
- macOS: Uses existing PostgreSQL install (or fails with clear error)

### Key Files

| File | Purpose | LOC |
|------|---------|-----|
| `server/server.js` | API server, scraping logic, game data | ~7500 |
| `site/app.js` | Frontend SPA, state management, UI | ~3300 |
| `site/index.html` | HTML shell | ~50 |
| `db/schema.sql` | PostgreSQL schema | ~120 |
| `db/init.js` | Auto-init DB on startup | ~80 |
| `server/sidecar-entry.js` | Desktop app entry point | ~10 |
| `src-tauri/src/main.rs` | Tauri launcher | ~100 |

---

## Customization & Extending

### Adding a New TCG Game

1. **Add game configuration** in `server/server.js` (see `GAME_DATA` section, line ~51):
```javascript
newgame: {
  label: 'Game Name',
  color: '#FF6B6B',  // Accent color for UI
  catUrl: 'https://www.pricecharting.com/category/newgame-cards',
  sets: [
    { name: 'Set 1', slug: 'set-1', released: '2024-01-01' },
    // ... more sets
  ]
}
```

2. **Add TCGPlayer URL mapping** (if available). Scraping pipeline auto-handles:
   - Set slug translation to TCGPlayer search URL
   - Product extraction via Puppeteer

3. **Add theme color** in `site/app.js` (see `THEMES` section):
```javascript
{
  id: 'newgame',
  name: 'New Game Theme',
  colors: {
    primary: '#FF6B6B',
    // ... other colors
  }
}
```

4. **Test scraping:**
   - `POST /api/data/newgame/set-1` from frontend
   - Check browser console for Socket.io events
   - Monitor `server.log` for scrape progress

### Changing Settings

| Setting | File | Variable |
|---------|------|----------|
| **Port** | `.env` | `PORT=3847` |
| **Database** | `.env` | `DATABASE_URL=...` |
| **JWT expiry** | `server.js` | Modify token `expiresIn` |
| **Scrape cache TTL** | `server.js` | Search `CACHE_DURATION` (~line 100) |
| **Puppeteer timeouts** | `server.js` | Search `goto({waitUntil`, `timeout` params |

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| **"Connection refused" on startup** | PostgreSQL not running | Start PostgreSQL service, verify `DATABASE_URL` in `.env` |
| **Desktop app shows blank window** | Server not ready on port 3847 | Check firewall, ensure port is free, check `db/init.js` logs |
| **"Puppeteer could not find browser"** | Chromium not bundled (rare) | Re-run `npm install` to fetch Chromium binary |
| **Scrape hangs or times out** | TCGPlayer site blocked requests, network issue | Check browser Network tab, verify user-agent not blocked by TCGPlayer |
| **Cart items lost on page refresh** | IndexedDB not persisting | Hard refresh (Ctrl+Shift+R), check browser storage permissions |
| **Stripe checkout fails** | Invalid test keys, webhook not configured | Use Stripe test keys (`sk_test_...`), verify webhook secret in `.env` |
| **Admin inventory not saving** | User not admin, or API key invalid | Ensure `is_admin: true` in JWT or use correct `ADMIN_API_KEY` header |

---

## Environment Variables Reference

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/tcg_tracker

# Auth
JWT_SECRET=your-very-secret-key-min-32-chars
ADMIN_API_KEY=optional-api-key-for-admin-endpoints

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Server
PORT=3847
BASE_URL=http://localhost:3847  # For production, change to https://yourdomain.com

# Optional
NODE_ENV=development
```

---

## Project Structure

```
tcg-price-tracker/
├── site/
│   ├── app.js              # 3300+ lines: frontend SPA, all client-side logic
│   ├── index.html          # HTML shell, loads app.js
│   └── db.js               # IndexedDB caching layer
├── server/
│   ├── server.js           # 7500+ lines: API routes, scraping, game data
│   └── sidecar-entry.js    # Entry point for Tauri desktop app
├── db/
│   ├── schema.sql          # PostgreSQL schema (tables, indexes)
│   ├── init.js             # Auto-init database on startup
│   └── migrate.js          # One-time migration runner
├── src-tauri/
│   ├── src/main.rs         # Tauri v2 launcher: spawn sidecar, poll for ready
│   ├── tauri.conf.json     # Tauri app configuration
│   ├── Cargo.toml          # Rust dependencies
│   └── nsis/
│       ├── installer.nsh   # Windows NSIS script with PostgreSQL auto-install
│       └── license.rtf
├── node_modules/           # npm dependencies
├── .env.example            # Example environment variables
├── package.json            # npm scripts & dependencies
├── README.md               # This file
└── .gitignore
```

---

## Known Limitations & Future Work

- **Collections API** — Wishlist endpoints exist but UI integration incomplete
- **Multi-user support** — Works for single user per machine in desktop mode (Tauri doesn't isolate sessions)
- **TCGPlayer rate limits** — Puppeteer throttled to avoid blocks (may be slow on large sets)
- **PriceCharting availability** — Site structure changes may break HTML scraping
- **macOS PostgreSQL** — No auto-install; manual `brew install postgresql` required

---

## License

MIT
