<img width="3839" height="1990" alt="image" src="https://github.com/user-attachments/assets/6ce9e05c-c40c-4f19-8545-d355a6c23d68" />

##

# TCG Price Index

Live card price dashboard for 10 TCG games (Pokémon, MTG, Yu-Gi-Oh, One Piece, Lorcana, Digimon, Dragon Ball, Gundam, Star Wars Unlimited, Riftbound). Browse prices from [PriceCharting](https://www.pricecharting.com), manage collections, and purchase cards via Stripe checkout.

## Features

- **Live card prices** — Ungraded / Grade 9 / PSA 10
- **Smart filtering** — Sort by price, name, or grading; real-time search
- **Visual highlighting** — Gold $100+, orange PSA 10 $500+
- **User accounts** — Email/password authentication
- **Collections** — Create multiple named wishlists (persistent, server-backed)
- **Shopping cart** — Add any card to cart, manage quantities
- **Checkout** — Stripe payment processing with webhook confirmation
- **Admin inventory** — Dashboard to manage store stock and pricing
- **Dark/light mode** — Theme toggle
- **Responsive design** — Horizontal game bar, mobile-friendly

## Quick Start

### Prerequisites

- **Node.js** v14+
- **PostgreSQL** v12+
- **npm** (bundled with Node.js)

### 1. Clone & Install

```bash
git clone <repository>
cd tcg-price-tracker
npm install
```

### 2. Set Up Environment

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/tcg_tracker

# JWT secret for auth tokens (generate a random string)
JWT_SECRET=your_random_jwt_secret_key_here

# Stripe test keys from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...

# Admin API key (for managing inventory via CLI/API)
ADMIN_API_KEY=your_random_admin_api_key

# Server port
PORT=3847
NODE_ENV=development
```

### 3. Set Up Database

**Create PostgreSQL database:**

```bash
createdb tcg_tracker
```

**Run migrations:**

```bash
node db/migrate.js
```

This will:
- Create all tables (users, collections, inventory, cart_items, orders)
- Add `is_admin` column to users
- Mark the first user as admin

**Optional: Load SQL directly:**

```bash
psql -U postgres -d tcg_tracker -f db/schema.sql
```

### 4. Start the Server

```bash
node server/server.js
```

Server runs on **http://localhost:3847**

---

## Desktop Application (Tauri v2)

The TCG Price Tracker can also run as a standalone desktop application on Windows and macOS.

### Desktop Prerequisites

- **Rust** — Install from [rustup.rs](https://rustup.rs)
  - On Windows: Install MSVC toolchain (default) and Visual Studio 2022 Build Tools with "C++ build tools" workload
- **Node.js** v14+ (same as web version)
- **PostgreSQL** v12+ (running locally — required for the desktop app)

### Building the Desktop App

```bash
# Install Tauri and caxa
npm install --save-dev @tauri-apps/cli@^2 caxa

# Build for Windows
npm run tauri:build

# Or build and run in dev mode
npm run tauri:dev
```

**Build outputs:**
- **Windows**: `src-tauri/target/release/bundle/nsis/TCG Price Tracker_1.0.0_x64-setup.exe`
- **macOS**: `src-tauri/target/release/bundle/dmg/TCG Price Tracker_1.0.0_arm64.dmg` (Apple Silicon) and `x86_64.dmg` (Intel)

### Running the Desktop App

1. **First run**: The desktop app will:
   - Start the Node.js server (sidecar) automatically
   - Load your `.env` file from the project root
   - Wait for the server to be ready
   - Display the app window when ready

2. **Closing the app**: When you close the window, all server processes are automatically terminated

3. **Configuration**: The app uses the `.env` file from your project directory. Make sure it contains:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/tcg_tracker
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=sk_test_...
   ADMIN_API_KEY=your_admin_key
   PORT=3847
   ```

### Desktop App Platform Support

- **Windows 10/11**: Full support via NSIS installer
- **macOS 10.13+**: Full support via DMG installer (both Intel and Apple Silicon)
  - Note: First install may require clicking "Open" in Security preferences

### Troubleshooting Desktop App

**App won't start / "Start the proxy server" error**
- Ensure PostgreSQL is running
- Check `.env` file has correct `DATABASE_URL`
- Check port 3847 is available (not in use)

**Process still running after close**
- Desktop app automatically kills all server processes on close
- If a process persists, manually kill: `taskkill /F /IM server-sidecar.exe`

**Reinstaller fails with "Error opening file for writing"**
- Uninstall the previous version first
- Or run installer again — it will automatically kill any running instances

---

## How to Use

### Browsing Cards

1. **Select a game** — Click game tabs at the top
2. **Pick a set** — Sidebar shows all sets for that game
3. **Search cards** — Use search bar to find by name or number
4. **View prices** — See Ungraded, Grade 9, and PSA 10 prices
5. **Click a card** — Expand row to see full details

### Creating an Account

1. Click **Log In** in the top toolbar
2. Enter email & password
3. Click **Register** (creates new account) or **Login**
4. You're authenticated! Token stored in browser

### Managing Collections

1. Click **Your Collection** in sidebar
2. **Add cards:**
   - Click **+** next to any card
   - Pick grading (Ungraded / 9 / 10)
   - Set quantity
3. **Create new collection:**
   - Click **New Collection** button
   - Name it and add cards
4. **View collection:**
   - Collections saved in your account
   - Switch between them in sidebar
5. **Remove cards:**
   - Click **−** next to a card in your collection

### Shopping Cart

1. Click **On Sale** button to see items with prices
2. Click **+ Add to Cart** on any card
3. Click **Cart** icon (top right) to view
4. Adjust quantities or remove items
5. Click **Checkout** to go to Stripe payment form
6. Complete payment — order confirmed via webhook

### Admin: Managing Inventory

**Only admins** can manage store inventory (first user is marked admin by default).

1. Click **Inventory** button (sidebar) — admin-only view
2. See all inventory items with columns:
   - Game, Set, Card, Grading
   - Current qty, Price, Available stock
3. **Add/update stock:**
   - Click **Edit** button (pencil)
   - Popover appears with qty/price fields
   - Update and save
4. **Set pricing:**
   - Same edit popover
   - Enter price in cents (e.g., `9999` = $99.99)
5. **Delete items:**
   - Click **Edit** button
   - Click **Delete Item** at bottom
   - Confirms and removes completely
6. **On Sale view:**
   - Only shows items with price > $0 AND qty > 0
   - Zero-stock items hidden from public view

### Admin: CLI Inventory Management

Add inventory items without UI (useful for bulk operations):

```bash
curl -X POST http://localhost:3847/api/admin/inventory/add \
  -H "Authorization: your_admin_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "game": "pokemon",
    "set_slug": "pokemon-base-set",
    "card_number": "1",
    "grading": 0,
    "quantity_available": 5,
    "price_cents": 1999,
    "card_name": "Bulbasaur"
  }'
```

List all inventory:

```bash
curl -H "Authorization: your_admin_api_key" \
  http://localhost:3847/api/admin/inventory
```

---

## Project Structure

```
tcg-price-tracker/
├── site/                  # Frontend (Single Page App)
│   ├── index.html         # Main HTML
│   ├── app.js             # All frontend logic
│   └── style.css          # Styling
├── server/
│   ├── server.js          # Express API server
│   └── sidecar-entry.js   # Entry point for Tauri sidecar
├── src-tauri/             # Tauri desktop app (Windows/macOS)
│   ├── src/
│   │   └── main.rs        # Tauri app setup & sidecar spawning
│   ├── Cargo.toml         # Rust dependencies
│   ├── tauri.conf.json    # Tauri configuration
│   ├── capabilities/      # Permission definitions
│   ├── binaries/          # Compiled sidecar binary
│   └── nsis/              # Windows installer scripts
├── db/
│   ├── schema.sql         # PostgreSQL schema
│   ├── migrate.js         # Migration runner
│   └── add_is_admin_column.sql
├── package.json
├── .env.example
└── README.md
```

### Key Files

| File | Purpose |
|------|---------|
| `site/app.js` | Frontend state, UI, cart, collections, auth token management |
| `server/server.js` | Express routes: auth, cart, checkout, admin inventory, PriceCharting proxy |
| `server/sidecar-entry.js` | Entry point for Tauri bundled sidecar (loads .env and starts server) |
| `src-tauri/src/main.rs` | Tauri app setup: spawns sidecar, polls for readiness, handles process cleanup |
| `src-tauri/tauri.conf.json` | Desktop app configuration: window settings, sidecar bundling |
| `db/schema.sql` | PostgreSQL tables & indexes |
| `db/migrate.js` | One-time setup (creates columns, marks first user as admin) |

---

## API Endpoints

### Authentication

```
POST /api/auth/register     { email, password } → { token, userId, isAdmin }
POST /api/auth/login        { email, password } → { token, userId, isAdmin }
```

### Collections

```
GET    /api/collections                    (requires auth token)
POST   /api/collections                    { name }
DELETE /api/collections/:id
GET    /api/collections/:id/items
POST   /api/collections/:id/items          { game, set_slug, card_number, grading, quantity }
DELETE /api/collections/:id/items/:itemId
```

### Cart

```
GET    /api/cart                           (requires auth token)
POST   /api/cart/add                       { game, set_slug, card_number, grading, quantity }
PUT    /api/cart/update                    { game, set_slug, card_number, grading, quantity }
DELETE /api/cart/remove                    { game, set_slug, card_number, grading }
```

### Checkout

```
POST   /api/checkout/session               (requires auth token)
POST   /api/checkout/webhook               (Stripe signature validation)
```

### Admin Inventory (API key auth)

```
GET    /api/admin/inventory                -H "Authorization: your_admin_api_key"
POST   /api/admin/inventory/add            { game, set_slug, card_number, grading, quantity_available, price_cents, card_name }
DELETE /api/admin/inventory/remove         { game, set_slug, card_number, grading }
```

---

## Customization

### Adding Sets

Edit `GAME_DATA` in `server/server.js`:

```javascript
pokemon: {
  label: 'Pokémon',
  sets: [
    { name: 'Base Set', slug: 'pokemon-base-set', released: '1999-01-09' },
    { name: 'Jungle', slug: 'pokemon-jungle', released: '1999-06-16' }
  ]
}
```

### Adding Games

1. Add to `GAME_DATA` in `server/server.js`
2. Add color accent to `ACCENTS` in `site/app.js`:

```javascript
ACCENTS.newgame = {
  accent: '#hexcolor',
  dim: 'rgba(r, g, b, 0.10)',
  rgb: 'r,g,b'
};
```

### Changing Port

Edit `.env`:

```env
PORT=3847
```

---

## Troubleshooting

### "Database connection failed"

- Check PostgreSQL is running: `psql -U postgres`
- Verify `DATABASE_URL` in `.env` matches your setup
- Run migrations: `node db/migrate.js`

### "Inventory not updating"

- Hard refresh browser: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)
- Check JWT token is valid: Browser DevTools → Application → Storage
- Verify user is admin: Login with email/password

### "Stripe checkout fails"

- Use Stripe test keys from https://dashboard.stripe.com/test/apikeys
- Set `STRIPE_SECRET_KEY` in `.env`
- Restart server: `node server/server.js`

### "Cart items not saving"

- Ensure auth token is valid
- Check browser console for API errors
- Verify database is running and migrations completed

---

## Development

### Running Tests

```bash
npm test
```

### Debugging

Enable verbose logging:

```bash
DEBUG=* node server/server.js
```

---

## License

MIT
