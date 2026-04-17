<img width="2182" height="1545" alt="image" src="https://github.com/user-attachments/assets/d8c41bd9-0383-439a-a445-f2439f083448" />

##

# TCG Price Index

Live card price dashboard for 10 TCG games (Pokémon, MTG, Yu-Gi-Oh, One Piece, Lorcana, Digimon, Dragon Ball, Gundam, Star Wars Unlimited, Riftbound). Browse prices, manage collections, and purchase cards via Stripe checkout. Works as **web app** (Node.js) or **desktop app** (Windows/macOS with Tauri).

## Features

- **Live card prices** — Ungraded / Grade 9 / PSA 10
- **Browse & search** — 10 games, 100+ sets each, filter by price/rarity/grading
- **User accounts** — Email/password registration, JWT auth
- **Shopping cart & checkout** — Stripe payment processing
- **Admin inventory** — Stock cards, manage quantities and pricing
- **Collections** — Wishlists per user
- **9 color themes** — Round-robin cycling with light/dark mode
- **Desktop app** — Standalone Windows/macOS (auto-installs PostgreSQL on Windows)

---

## Data Flow Architecture

### Overview

The application pulls card pricing data from **two sources**:

1. **PriceCharting** — Scraped via HTTP requests (fast, hourly cached)
2. **TCGPlayer** — Scraped via Puppeteer (game/set discovery, optional product details)

Both flows feed into a **cache layer**, **PostgreSQL database** (user data, inventory), and **client-side IndexedDB** (browser cache).

---

### Data Flow 1: PriceCharting Card Scraping

```
User requests cards for a set
        ↓
Browser: GET /api/set?slug=pokemon-base-set
        ↓
Server: Check cardCache (1 hour TTL, 50k entry LRU limit)
        ↓
    [Cache HIT] → Return cached data, fromCache: true
        OR
    [Cache MISS/STALE] → Scrape PriceCharting
        ↓
fetchSetPages(slug) / fetchSetPagesFresh(slug)
        ↓
httpGet() → PriceCharting category page (e.g., /console/pokemon-base-set)
        ↓
Parse HTML: Extract card rows
  - Card name, card ID, image URL
  - Ungraded price, Grade 9 price, PSA 10 price
  - Determine if sealed product (booster box, etc.)
        ↓
Paginate: POST requests with cursor to load more cards (if >50 per page)
  - Loop until no more results
        ↓
Store in cardCache: { slug, title, cards[], count, sealedCount, fetchedAt }
        ↓
Return to client: { cards: [...], fromCache: false, cachedAt: null }
        ↓
Client: Store in IndexedDB, render UI
```

**Cache Behavior:**
- On fetch error: Return stale cache if available (graceful degradation)
- Only cache non-empty results
- LRU eviction when cache reaches 50k entries

---

### Data Flow 2: TCGPlayer Game & Set Discovery

```
App startup / User browses games
        ↓
Browser: GET /api/tcgplayer/games-sets
        ↓
Server: Check tcgGamesSetCache (24 hour TTL)
        ↓
    [Cache HIT] → Return cached { games, sets }
        OR
    [Cache MISS/STALE] → Launch Puppeteer and scrape
        ↓
fetchTCGPlayerGamesAndSets()
        ↓
For each of 11 games:
  - Navigate to TCGPlayer game page
  - Extract all available sets
  - Normalize set names (remove "Promo", "Pre-Release" suffixes)
  - Filter to prefer non-promo variants when duplicates exist
  - Convert to canonical form: { canonical, paramName, slug }
        ↓
Store in tcgGamesSetCache: { games: {...}, sets: [...], fetchedAt }
        ↓
Return to client: { games, sets }
        ↓
Client: Cache in IndexedDB, populate game/set dropdowns
```

**Promo Filtering Logic:**
- Groups sets by canonical name (e.g., "ME01: Mega Evolution" and "ME01: Mega Evolution Promo" → "me01-mega-evolution")
- Keeps only non-promo variant (or single variant if no promo exists)
- Prevents duplicate set entries and ensures correct URL parameter generation

---

### Data Flow 3: TCGPlayer Product Scraping (On-Demand)

```
User selects a game/set combination
        ↓
Browser: POST /api/tcgplayer/scrape-game-set
  { gameSlug: "pokemon", setParamName: "base-set", setOriginalName: "Base Set" }
        ↓
Server: Return 202 Accepted immediately
        ↓
Background: enqueueScrape() → queue for processing (one at a time)
        ↓
scrapeTCGPlayerGameSet()
        ↓
Launch Puppeteer page
  - Navigate to TCGPlayer game/set URL
  - Execute JavaScript to load card grid
  - Wait for cards to render
  - Extract all visible product rows: name, number, price
        ↓
For each card found:
  - Match against PriceCharting cards (by name + card number)
  - If match found: Merge prices from both sources
  - If only TCGPlayer: Include with TCGPlayer prices only
  - Handle specialty variants (e.g., [GameStop], [Stamped]) → PriceCharting only, skip TCGPlayer match
        ↓
Emit socket.io events: "scrape_progress", "scrape_complete"
        ↓
Client: Receives real-time updates, displays merged card data
```

**Matching Logic:**
- Requires both card name AND product number match
- Uses strict comparison to avoid false positives
- Specialty brackets (e.g., [GameStop]) → Return PriceCharting-only prices

---

### Data Flow 4: User Data & Shopping Cart

```
User Registration/Login
        ↓
POST /api/auth/register or /api/auth/login
        ↓
Server: Hash password (bcrypt), store in PostgreSQL users table
        ↓
Return JWT token: { token, userId, email, isAdmin }
        ↓
Client: Store JWT in localStorage, include in subsequent requests
        ↓

User browses and adds to cart
        ↓
Client: Store in IndexedDB (persists across sessions)
  - { gameSlug, setSlug, cardNumber, grading, quantity }
        ↓
User clicks checkout
        ↓
POST /api/checkout/session { cartItems: [...] }
        ↓
Server: Create Stripe checkout session
        ↓
Return sessionId → Redirect to Stripe Checkout
        ↓
Stripe payment completed → Webhook to /api/webhooks/stripe
        ↓
Server: Create order in PostgreSQL, clear cart
        ↓
Client: Redirect to success page
```

---

### Data Flow 5: Admin Inventory Management

```
Admin adds card to inventory
        ↓
POST /api/admin/inventory/add
  Headers: Authorization: Bearer ADMIN_API_KEY or JWT(isAdmin: true)
  Body: { game, set_slug, card_number, grading, quantity_available, price_cents }
        ↓
Server: Validate API key or JWT admin status
        ↓
INSERT into PostgreSQL inventory table
        ↓
GET /api/inventory (public endpoint)
        ↓
Returns in-stock items for shopping cart display
```

---

### Data Flow 6: Sets Cache Refresh

```
Server startup
        ↓
initSetsCache()
        ↓
For each of 10 games:
  - scrapeSetsFromCategory(gameKey)
  - Fetch PriceCharting category page
  - Extract all set links and names
  - Filter out console noise (retro gaming)
  - Store in setsCache: { sets: [...], fetchedAt }
        ↓
scheduleHourlyRefresh()
        ↓
Every 1 hour:
  - Repeat scraping for all games
  - Update setsCache
  - Silent failure: If scrape fails, keep old cache
        ↓

GET /api/data/{game}/{set}
        ↓
Server: Lookup in setsCache, return { sets: [...] }
```

---

## Installation

### Prerequisites

| Platform | Requirements |
|----------|--------------|
| **Web** | Node.js v14+, npm, PostgreSQL v12+ |
| **Windows Desktop** | Node.js v14+, npm (PostgreSQL auto-installs) |
| **macOS Desktop** | Node.js v14+, npm, PostgreSQL (via `brew install postgresql`) |
| **Desktop Build** | Rust ([rustup.rs](https://rustup.rs)) + Visual Studio 2022 Build Tools (Windows only) |

### Setup Steps

**1. Clone and install dependencies:**
```bash
git clone <repository>
cd tcg-price-tracker
npm install
```

**2. Configure environment:**
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```bash
# Database (auto-created on first startup)
DATABASE_URL=postgresql://postgres:password@localhost:5432/tcg_tracker

# Authentication
JWT_SECRET=your-secret-key-here

# Stripe (optional, for checkout)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin access (optional)
ADMIN_API_KEY=your-admin-key

# Server
PORT=3847
```

---

## Running

### Web App

```bash
node server/server.js
```

Open **http://localhost:3847** in your browser.

**PostgreSQL must be running.** On first startup, the app auto-creates the database and tables.

### Desktop App

**Build:**
```bash
npm run tauri:build
```

Installers created in `src-tauri/target/release/bundle/`:
- `TCG Price Tracker.exe` (Windows)
- `TCG Price Tracker.dmg` (macOS)

**Run:**
- **Windows:** PostgreSQL auto-installs on first app launch (silent install via winget or direct download)
- **macOS:** Ensure PostgreSQL is running, or the app will error on startup

---

## Configuration

### Change Port

Edit `.env`: `PORT=3847` (default)

### Add a New Game

Edit `server/server.js`, find `GAME_DATA`:

```javascript
newgame: {
  label: 'Game Name',
  color: '#FF6B6B',
  catUrl: 'https://www.pricecharting.com/category/newgame-cards',
  sets: [
    { name: 'Set 1', slug: 'set-1', released: '2024-01-01' },
    { name: 'Set 2', slug: 'set-2', released: '2024-06-01' }
  ]
}
```

Then add a theme color in `site/app.js` under `THEMES`.

### Database Configuration

The app uses PostgreSQL. Connection string in `.env`:

```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
```

Default (dev): `postgresql://postgres:password@localhost:5432/tcg_tracker`

Schema is auto-created on first startup. To reset:
```bash
dropdb tcg_tracker
node server/server.js  # Will recreate database
```

---

## Usage

### For Users

1. **Browse cards** — Select a game and set from the sidebar
2. **Search** — Use the search bar to filter by card name
3. **View prices** — Click a card to see prices from both sources
4. **Add to cart** — Select grading (Ungraded/Grade 9/PSA 10) and quantity
5. **Checkout** — Review cart and pay with Stripe

### For Admins

**API Key Authentication:**
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  http://localhost:3847/api/admin/inventory
```

**Admin Endpoints:**
- `GET /api/admin/inventory` — List all stocked items
- `POST /api/admin/inventory/add` — Add/update card (requires `game`, `set_slug`, `card_number`, `grading`, `quantity_available`, `price_cents`)
- `DELETE /api/admin/inventory/{id}` — Remove item

Example add card:
```bash
curl -X POST http://localhost:3847/api/admin/inventory \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "game": "pokemon",
    "set_slug": "base-set",
    "card_number": "1",
    "grading": "ungraded",
    "quantity_available": 5,
    "price_cents": 2500
  }'
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **App won't start** | Ensure PostgreSQL is running. Check `.env` `DATABASE_URL` is correct. |
| **Port 3847 already in use** | Change `PORT` in `.env` to another port (e.g., `3848`). |
| **Desktop app shows blank window** | Ensure port 3847 is available and not blocked by firewall. |
| **Stripe checkout fails** | Use Stripe **test** keys (start with `sk_test_`). Set webhook URL in Stripe dashboard. |
| **Cart lost on refresh** | Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (macOS). |
| **Admin inventory endpoints return 401** | Check `ADMIN_API_KEY` in `.env` matches the header you're sending. |

---

## API Overview

### Public Endpoints

- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Get JWT token
- `GET /api/data/{game}/{set}` — Get cards for a set
- `GET /api/cart` — View cart (requires JWT)
- `POST /api/cart/add` — Add item to cart
- `DELETE /api/cart/remove` — Remove from cart
- `POST /api/checkout/session` — Create Stripe checkout
- `GET /api/inventory` — Public inventory (in-stock items)
- `GET /api/tcgplayer/games-sets` — Get TCGPlayer games and sets
- `POST /api/tcgplayer/scrape-game-set` — Enqueue scraping for a game/set
- `GET /api/set?slug=...` — Get card details for a PriceCharting set
- `GET /api/cache-status` — View cache state (debug endpoint)

### Admin Endpoints (API Key or JWT with `is_admin: true`)

- `GET /api/admin/inventory` — List all stocked cards
- `POST /api/admin/inventory/add` — Add/update card
- `DELETE /api/admin/inventory/{id}` — Delete card

---

## Project Structure

```
tcg-price-tracker/
├── site/                # Frontend (HTML, CSS, vanilla JS)
│   ├── app.js          # Main SPA logic
│   └── index.html
├── server/             # Backend (Node.js)
│   ├── server.js       # API routes, scraping logic
│   └── sidecar-entry.js # Desktop app entry point
├── db/                 # Database setup
│   ├── schema.sql      # PostgreSQL tables
│   └── init.js         # Auto-init on startup
├── src-tauri/          # Desktop app (Rust + Tauri)
│   ├── src/main.rs
│   ├── tauri.conf.json
│   └── nsis/           # Windows installer
├── .env.example        # Example configuration
└── package.json
```

---

## Desktop App Details

### Windows

1. Download `TCG Price Tracker.exe` from releases
2. Run installer — PostgreSQL auto-detects and installs if missing
3. App launches automatically
4. PostgreSQL service runs in background

### macOS

1. Install PostgreSQL: `brew install postgresql`
2. Start PostgreSQL: `brew services start postgresql`
3. Download `TCG Price Tracker.dmg` and run installer
4. App launches automatically

Both platforms create a `tcg_tracker` PostgreSQL database on first run.

---

## License

MIT
