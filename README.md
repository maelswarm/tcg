# TCG Price Index

Live card price dashboard for 10 TCG games (Pokémon, MTG, Yu-Gi-Oh, One Piece, Lorcana, Digimon, Dragon Ball, Gundam, Star Wars Unlimited, Riftbound). Powered by [PriceCharting](https://www.pricecharting.com).

## Features

- Live card prices (Ungraded / Grade 9 / PSA 10)
- Sort by price, name, or grading
- Real-time search & filter
- High-value highlighting (gold $100+, orange PSA 10 $500+)
- Multiple named collections with persistent storage
- Dark/light mode toggle
- Responsive design with horizontal game bar scrolling

## Setup

Requires Node.js (no npm packages).

```bash
node server/server.js
```

Open **http://localhost:3847**

## How It Works

**Frontend** (`site/`) — Single-page app for browsing, filtering, and managing collections  
**Backend** (`server/server.js`) — Proxy server that fetches and parses PriceCharting HTML, caches with hourly refresh

## Collections

Click **"Your Collection"** to manage inventory:

- Add/remove cards with grading levels
- Create multiple collections
- Search owned cards
- Data persists across sessions

## Extending

### Adding Sets
Edit `GAME_DATA` in `server/server.js`:
```javascript
pokemon: {
  label: 'Pokémon',
  sets: [
    { name: 'Base Set', slug: 'pokemon-base-set', released: '1999-01-09' }
  ]
}
```

### Adding Games
Add key to `GAME_DATA` and color to `ACCENTS` in `site/app.js`:
```javascript
ACCENTS.newgame = { accent: '#hexcolor', dim: 'rgba(...)', rgb: 'r,g,b' };
```
