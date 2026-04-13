-- ════════════════════════════════════════════════════════════════════
-- TCG Price Tracker — PostgreSQL Schema
-- Users, Collections, Inventory, Cart, Orders
-- ════════════════════════════════════════════════════════════════════

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Collections (user collections/wishlists)
CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Collection items (cards in collections)
CREATE TABLE IF NOT EXISTS collection_items (
  id SERIAL PRIMARY KEY,
  collection_id INT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  game VARCHAR(50) NOT NULL,
  set_slug VARCHAR(100) NOT NULL,
  card_number VARCHAR(50) NOT NULL,
  grading INT CHECK (grading IN (0, 9, 10)),
  quantity INT DEFAULT 1,
  UNIQUE(collection_id, game, set_slug, card_number, grading)
);

-- Admin inventory (cards available for sale)
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  game VARCHAR(50) NOT NULL,
  set_slug VARCHAR(100) NOT NULL,
  card_number VARCHAR(50) NOT NULL,
  grading INT CHECK (grading IN (0, 9, 10)),
  quantity_available INT DEFAULT 0,
  price_cents INT,
  UNIQUE(game, set_slug, card_number, grading)
);

-- Shopping cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game VARCHAR(50) NOT NULL,
  set_slug VARCHAR(100) NOT NULL,
  card_number VARCHAR(50) NOT NULL,
  grading INT CHECK (grading IN (0, 9, 10)),
  quantity INT DEFAULT 1,
  UNIQUE(user_id, game, set_slug, card_number, grading)
);

-- Orders (Stripe checkouts)
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_session_id VARCHAR(255) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  total_cents INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items (what was in each order)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  game VARCHAR(50) NOT NULL,
  set_slug VARCHAR(100) NOT NULL,
  card_number VARCHAR(50) NOT NULL,
  grading INT,
  quantity INT,
  price_cents INT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_inventory_game_slug ON inventory(game, set_slug);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
