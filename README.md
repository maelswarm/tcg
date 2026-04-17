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
