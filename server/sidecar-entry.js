// sidecar-entry.js
// Entry point for Tauri sidecar.
// Loads .env from the bundled project root, then boots the server.

const path = require('path');

// Load .env from the bundled path (caxa extracts to a temp dir with the full project structure)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

require('./server.js');
