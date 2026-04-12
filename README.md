# TCG Price Index

Live card price dashboard for **10 TCG games** — Pokémon, MTG, Yu-Gi-Oh, One Piece, Lorcana, Digimon, Dragon Ball, Gundam, Star Wars Unlimited, and Riftbound. Powered by [PriceCharting](https://www.pricecharting.com).

## Features

### Price & Stats
- Live prices pulled directly from PriceCharting
- Card images, Ungraded / Grade 9 / PSA 10 columns
- Stats bar: card count, avg price, highest ungraded, highest PSA 10
- Sort by price, PSA 10, or name
- Real-time search/filter
- High-value card highlighting (gold = $100+, orange = PSA 10 $500+)
- Per-game set overview with batch stats loading

### Collections & Inventory
- Create and manage multiple named collections per user
- Add/remove cards with grading levels (Ungraded, Grade 9, PSA 10)
- View collection contents with real-time quantity updates
- Search and sort owned cards within collection view
- Persistent storage across sessions

### Smart Queuing
- Request queue system (per-game) to throttle scraper load
- Queue state persists across page reloads
- In-progress items recovered on reload (no hanging spinners)
- Visual queue indicators on load buttons

### UI & Storage
- Dark/light mode toggle
- 10 games with 200+ sets total
- Release date ordering (newest sets first)
- Per-game stats caching with localStorage
- Hourly cache refresh for PriceCharting data

## Setup

**Requires Node.js** (no npm packages needed — pure Node stdlib).

```bash
node server/server.js
```

Then open: **http://localhost:3847**

## How It Works

### Architecture
- **Frontend** (`site/app.js`, `site/index.html`, `site/style.css`): Single-page app for browsing sets, viewing prices, and managing collections
- **Backend** (`server/server.js`): Lightweight Node proxy that fetches and parses PriceCharting HTML (bypasses CORS), caches results with hourly refresh

### Data Flow
1. Frontend loads list of games and sets from backend
2. When you view a set, frontend fetches parsed cards (up to 250 per set: 5 pages × 50 cards)
3. Set stats (count, avg price, top prices) are cached in localStorage per game
4. Collection inventory stored as JSON per-game in localStorage

### Queue System
- When loading multiple sets, requests are queued and processed sequentially with 200ms throttle
- Queue state persists across page reloads via `tcg-load-queue-v1` key
- In-flight items (interrupted mid-load) are recovered on reload and re-queued
- Per-game independent queues allow background processing while viewing other games

## Extending

### Adding Sets
Edit `GAME_DATA` in `server/server.js` under the game key. Add entries with:
- `name`: Display name (e.g., "Pokemon Base Set")
- `slug`: PriceCharting URL slug (from `https://www.pricecharting.com/console/{slug}`)
- `released`: Release date string (e.g., "1999-01-09") for sorting

Example:
```javascript
pokemon: {
  label: 'Pokémon',
  sets: [
    { name: 'Base Set', slug: 'pokemon-base-set', released: '1999-01-09' },
  ]
}
```

### Adding Games
Add a new game key to `GAME_DATA` in `server/server.js` and add its accent color to `ACCENTS` in `site/app.js`:
```javascript
ACCENTS.newgame = { accent: '#hexcolor', dim: 'rgba(...)', rgb: 'r,g,b' };
```

## Collections

Click the **"Your Collection"** button in the toolbar to manage your card inventory:

- **Create**: Click `+` to add a new named collection
- **Rename**: Click the collection name input to edit it
- **Switch**: Use the dropdown to select a different collection
- **Delete**: Click 🗑 to remove (disabled if only one collection exists)
- **Add Cards**: Click the ⋮ menu on any card to add to current collection with grading level
- **Remove Cards**: Click the ⋮ menu on owned cards to adjust quantity or remove

Collections are stored per-game and persist across sessions.

## Storage

### LocalStorage Keys
- `tcg-set-stats-v2`: Per-game card set stats (count, avg price, top prices)
- `tcg-collections`: Collections data (name, IDs, inventory items per collection)
- `tcg-load-queue-v1`: Pending and in-flight set load requests per game
- `tcg-wallet-addr`: Connected wallet address (if using inventory contracts)
