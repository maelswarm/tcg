<img width="2182" height="1545" alt="image" src="https://github.com/user-attachments/assets/d8c41bd9-0383-439a-a445-f2439f083448" />

##

# TCG Price Index

Live card price dashboard for 10 TCG games (Pokémon, MTG, Yu-Gi-Oh, One Piece, Lorcana, Digimon, Dragon Ball, Gundam, Star Wars Unlimited, Riftbound). Browse prices from [PriceCharting](https://www.pricecharting.com), manage collections, and purchase cards via Stripe checkout. Works as **web app** (Node.js) or **desktop app** (Windows/macOS with Tauri).

## Key Features

- **Live card prices** — Ungraded / Grade 9 / PSA 10
- **Smart filtering** — Search, sort by price, filter by grading
- **User accounts** — Email/password auth with JWT tokens
- **Collections** — Multiple wishlists per user
- **Shopping cart & checkout** — Stripe payment processing
- **Admin inventory** — Manage store stock and pricing
- **9 color themes** — Including Pokémon theme with round-robin cycling
- **Desktop app** — Runs standalone on Windows/macOS (auto-installs PostgreSQL on Windows)

---

## Quick Start

### 1. Install Dependencies

```bash
git clone <repository>
cd tcg-price-tracker
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL, JWT, Stripe, and API key credentials
```

### 3. Start (Web)

```bash
node server/server.js
```

Server runs on **http://localhost:3847**

### 4. Or Build Desktop App

```bash
npm run tauri:build
```

**Windows**: On first install, PostgreSQL is automatically detected and installed if missing.  
**macOS**: Install PostgreSQL via `brew install postgresql` first.

---

## What's New in v1.1.0

✨ **Auto-install PostgreSQL (Windows)** — NSIS installer now:
- Detects if PostgreSQL is installed
- Silently installs via `winget` or direct download if missing
- Auto-creates `tcg_tracker` database and tables on app startup

✨ **9 color themes** with round-robin cycling:
- Pokémon, Lavender, Ocean Pro, Coral Blush, Forest, Slate, Warm Earth, Mint Fresh, Amethyst
- Click the light/dark button to cycle through themes
- Auto light/dark switching based on time of day

---

## Architecture

**Frontend**: Single-page app (vanilla JS, IndexedDB caching)  
**Backend**: Node.js HTTP server, PostgreSQL  
**Desktop**: Tauri v2 wraps the server as a sidecar, serves frontend via localhost

### Key Files

| File | Purpose |
|------|---------|
| `site/app.js` | Frontend UI, state, auth, cart, collections |
| `server/server.js` | API routes, auth, inventory, checkout |
| `db/init.js` | Auto-initialize database on sidecar startup |
| `db/schema.sql` | PostgreSQL tables & indexes |
| `src-tauri/main.rs` | Spawn sidecar, poll for readiness |

---

## API Endpoints

**Auth**: `POST /api/auth/register`, `POST /api/auth/login`  
**Cart**: `GET /api/cart`, `POST /api/cart/add`, `DELETE /api/cart/remove`  
**Checkout**: `POST /api/checkout/session`, `POST /api/checkout/webhook`  
**Admin**: `GET /api/admin/inventory`, `POST /api/admin/inventory/add` (API key auth)  
**Collections**: `GET /api/collections`, `POST /api/collections`

---

## Customization

### Adding a New Game

Edit `GAME_DATA` in `server/server.js`:

```javascript
newgame: {
  label: 'Game Name',
  sets: [
    { name: 'Set Name', slug: 'set-slug', released: 'YYYY-MM-DD' }
  ]
}
```

Add accent color to `THEMES` in `site/app.js`.

### Changing Port

Edit `.env`: `PORT=3847`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection failed | Verify PostgreSQL running, check `DATABASE_URL` in `.env` |
| Desktop app won't start | Ensure PostgreSQL is running, check port 3847 is available |
| Inventory not saving | Hard refresh (Ctrl+Shift+R), verify user is admin |
| Stripe checkout fails | Use Stripe test keys, set `STRIPE_SECRET_KEY` in `.env` |

---

## Prerequisites

**Web/Desktop Development**:
- Node.js v14+
- PostgreSQL v12+
- npm

**Desktop Build** (Windows/macOS):
- Rust (install from [rustup.rs](https://rustup.rs))
  - Windows: Include MSVC toolchain + Visual Studio 2022 Build Tools (C++ workload)

---

## Project Structure

```
tcg-price-tracker/
├── site/                  # Frontend SPA
├── server/
│   ├── server.js         # API server
│   └── sidecar-entry.js  # Tauri sidecar entry point
├── db/
│   ├── schema.sql        # PostgreSQL schema
│   ├── init.js           # Auto-init database on startup
│   └── migrate.js        # One-time setup
├── src-tauri/            # Tauri desktop app
│   ├── src/main.rs       # Sidecar spawning & process management
│   ├── tauri.conf.json   # App config
│   └── nsis/installer.nsh # Windows installer with PG auto-install
└── .env.example
```

---

## License

MIT
