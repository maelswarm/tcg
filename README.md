# TCG Price Index

Live card price dashboard for **Star Wars Unlimited**, **Pokémon**, and **Magic: The Gathering** — powered by [PriceCharting](https://www.pricecharting.com).

## Features

- Live prices pulled directly from PriceCharting
- Card images, Ungraded / Grade 9 / PSA 10 columns
- Stats bar: card count, avg price, highest ungraded, highest PSA 10
- Sort by price, PSA 10, or name
- Real-time search/filter
- High-value card highlighting (gold = $100+, orange = PSA 10 $500+)
- Dark/light mode toggle
- 30 Pokémon sets, 25 MTG sets, all 4 Star Wars Unlimited sets

## Setup

**Requires Node.js** (no npm packages needed — pure Node stdlib).

```bash
node server/server.js
```

Then open: **http://localhost:3847**

## How It Works

The local proxy server (`server/server.js`) fetches and parses HTML from PriceCharting set pages (bypassing browser CORS restrictions), then serves the parsed JSON to the frontend. Up to 250 cards are loaded per set (5 pages × 50 cards).

## Extending

To add more sets, edit `GAME_DATA` in `server/server.js` and add entries with `name` and `slug` matching the PriceCharting URL pattern:
`https://www.pricecharting.com/console/{slug}`
