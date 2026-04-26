
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const nodePath = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const puppeteer = require('puppeteer');
const { Server } = require('socket.io');
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: nodePath.join(__dirname, '..', '.env') });
}

const PORT = 3847;
const SITE_DIR = nodePath.join(__dirname, '..', 'site');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

// ── Database & Auth ───────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/tcg_tracker'
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-key-change-in-production';

// JWT token verification middleware
async function verifyAuth(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Extract auth token from Authorization header
function getAuthToken(req) {
  const authHeader = req.headers.authorization || '';
  return authHeader.replace('Bearer ', '');
}

// ── Game Data ─────────────────────────────────────────────────────────────
const GAME_DATA = {
  "pokemon": {
    "label": "Pokémon",
    "color": "#ffcb05",
    "catUrl": "https://www.pricecharting.com/category/pokemon-cards",
    "sets": [
      {
        "name": "Pokemon Promo",
        "slug": "pokemon-promo",
        "released": "2099-12-31"
      },
      {
        "name": "Pokemon Phantasmal Flames",
        "slug": "pokemon-phantasmal-flames",
        "released": "2024-04-12"
      },
      {
        "name": "Pokemon Mega Evolution",
        "slug": "pokemon-mega-evolution",
        "released": "2024-02-23"
      },
      {
        "name": "Pokemon Destined Rivals",
        "slug": "pokemon-destined-rivals",
        "released": "2023-11-17"
      },
      {
        "name": "Pokemon Base Set",
        "slug": "pokemon-base-set",
        "released": "1999-01-09"
      },
      {
        "name": "Pokemon Prismatic Evolutions",
        "slug": "pokemon-prismatic-evolutions",
        "released": "2024-01-26"
      },
      {
        "name": "Pokemon Scarlet & Violet 151",
        "slug": "pokemon-scarlet-&-violet-151",
        "released": "2024-06-14"
      },
      {
        "name": "Pokemon Journey Together",
        "slug": "pokemon-journey-together",
        "released": "2024-07-12"
      },
      {
        "name": "Pokemon Surging Sparks",
        "slug": "pokemon-surging-sparks",
        "released": "2024-11-15"
      },
      {
        "name": "Pokemon Japanese Mega Dream ex",
        "slug": "pokemon-japanese-mega-dream-ex",
        "released": "2099-12-31"
      },
      {
        "name": "Pokemon Japanese Promo",
        "slug": "pokemon-japanese-promo",
        "released": "2099-12-31"
      },
      {
        "name": "Pokemon Celebrations",
        "slug": "pokemon-celebrations",
        "released": "2021-10-08"
      },
      {
        "name": "Pokemon Crown Zenith",
        "slug": "pokemon-crown-zenith",
        "released": "2023-11-03"
      },
      {
        "name": "Pokemon Ascended Heroes",
        "slug": "pokemon-ascended-heroes",
        "released": "2023-08-09"
      },
      {
        "name": "Pokemon Evolving Skies",
        "slug": "pokemon-evolving-skies",
        "released": "2021-08-27"
      },
      {
        "name": "Pokemon Evolutions",
        "slug": "pokemon-evolutions",
        "released": "2016-11-02"
      },
      {
        "name": "Pokemon Black Bolt",
        "slug": "pokemon-black-bolt",
        "released": "2023-06-16"
      },
      {
        "name": "Pokemon Paldean Fates",
        "slug": "pokemon-paldean-fates",
        "released": "2024-08-09"
      },
      {
        "name": "Pokemon Team Rocket",
        "slug": "pokemon-team-rocket",
        "released": "2000-04-24"
      },
      {
        "name": "Pokemon White Flare",
        "slug": "pokemon-white-flare",
        "released": "2024-05-10"
      },
      {
        "name": "Perfect Order",
        "slug": "pokemon-perfect-order",
        "released": "2024-03-22"
      },
      {
        "name": "Japanese Ninja Spinner",
        "slug": "pokemon-japanese-ninja-spinner",
        "released": "2099-12-31"
      },
      {
        "name": "Chinese CSV8C",
        "slug": "pokemon-chinese-csv8c",
        "released": "2099-12-31"
      },
      {
        "name": "Chinese Gem Pack 4",
        "slug": "pokemon-chinese-gem-pack-4",
        "released": "2099-12-31"
      },
      {
        "name": "Pokemon 1999 Topps Movie",
        "slug": "pokemon-1999-topps-movie",
        "released": "1999-06-01"
      },
      {
        "name": "Pokemon 1999 Topps Movie Evolution",
        "slug": "pokemon-1999-topps-movie-evolution",
        "released": "1999-07-01"
      },
      {
        "name": "Pokemon 1999 Topps TV",
        "slug": "pokemon-1999-topps-tv",
        "released": "1999-05-01"
      },
      {
        "name": "Pokemon 2000 Topps Chrome",
        "slug": "pokemon-2000-topps-chrome",
        "released": "2000-08-01"
      },
      {
        "name": "Pokemon 2000 Topps TV",
        "slug": "pokemon-2000-topps-tv",
        "released": "2000-06-01"
      },
      {
        "name": "Pokemon 2020 Battle Academy",
        "slug": "pokemon-2020-battle-academy",
        "released": "2020-09-25"
      },
      {
        "name": "Pokemon Ancient Origins",
        "slug": "pokemon-ancient-origins",
        "released": "2015-08-12"
      },
      {
        "name": "Pokemon Aquapolis",
        "slug": "pokemon-aquapolis",
        "released": "2002-01-15"
      },
      {
        "name": "Pokemon Arceus",
        "slug": "pokemon-arceus",
        "released": "2022-01-28"
      },
      {
        "name": "Pokemon Astral Radiance",
        "slug": "pokemon-astral-radiance",
        "released": "2022-05-27"
      },
      {
        "name": "Pokemon BREAKpoint",
        "slug": "pokemon-breakpoint",
        "released": "2015-02-04"
      },
      {
        "name": "Pokemon BREAKthrough",
        "slug": "pokemon-breakthrough"
      },
      {
        "name": "Pokemon Base Set 2",
        "slug": "pokemon-base-set-2"
      },
      {
        "name": "Pokemon Battle Styles",
        "slug": "pokemon-battle-styles",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Best of Game",
        "slug": "pokemon-best-of-game",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Black & White",
        "slug": "pokemon-black-&-white",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Boundaries Crossed",
        "slug": "pokemon-boundaries-crossed",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Brilliant Stars",
        "slug": "pokemon-brilliant-stars",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Burger King",
        "slug": "pokemon-burger-king",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Burning Shadows",
        "slug": "pokemon-burning-shadows",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Call of Legends",
        "slug": "pokemon-call-of-legends",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Celestial Storm",
        "slug": "pokemon-celestial-storm",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Champion's Path",
        "slug": "pokemon-champion's-path",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Chilling Reign",
        "slug": "pokemon-chilling-reign",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Chinese 151 Collect",
        "slug": "pokemon-chinese-151-collect",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Chinese CS4aC",
        "slug": "pokemon-chinese-cs4ac",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Chinese CS4bC",
        "slug": "pokemon-chinese-cs4bc",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Chinese CSM2aC",
        "slug": "pokemon-chinese-csm2ac",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Chinese CSM2bC",
        "slug": "pokemon-chinese-csm2bc",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Chinese CSM2cC",
        "slug": "pokemon-chinese-csm2cc",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Chinese CSV4C",
        "slug": "pokemon-chinese-csv4c",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Chinese Gem Pack",
        "slug": "pokemon-chinese-gem-pack",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Chinese Gem Pack 2",
        "slug": "pokemon-chinese-gem-pack-2",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Chinese Gem Pack 3",
        "slug": "pokemon-chinese-gem-pack-3",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Chinese Promo",
        "slug": "pokemon-chinese-promo",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Chinese m2F",
        "slug": "pokemon-chinese-m2f",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Cosmic Eclipse",
        "slug": "pokemon-cosmic-eclipse",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Crimson Invasion",
        "slug": "pokemon-crimson-invasion",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Crystal Guardians",
        "slug": "pokemon-crystal-guardians",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Dark Explorers",
        "slug": "pokemon-dark-explorers",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Darkness Ablaze",
        "slug": "pokemon-darkness-ablaze",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Delta Species",
        "slug": "pokemon-delta-species",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Deoxys",
        "slug": "pokemon-deoxys",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Detective Pikachu",
        "slug": "pokemon-detective-pikachu",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Diamond & Pearl",
        "slug": "pokemon-diamond-&-pearl",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Double Crisis",
        "slug": "pokemon-double-crisis",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Dragon",
        "slug": "pokemon-dragon",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Dragon Frontiers",
        "slug": "pokemon-dragon-frontiers",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Dragon Majesty",
        "slug": "pokemon-dragon-majesty",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Dragon Vault",
        "slug": "pokemon-dragon-vault",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Dragons Exalted",
        "slug": "pokemon-dragons-exalted",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon EX Latias & Latios",
        "slug": "pokemon-ex-latias-&-latios",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Emerald",
        "slug": "pokemon-emerald",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Emerging Powers",
        "slug": "pokemon-emerging-powers",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Expedition",
        "slug": "pokemon-expedition",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Fates Collide",
        "slug": "pokemon-fates-collide",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Fire Red & Leaf Green",
        "slug": "pokemon-fire-red-&-leaf-green",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Flashfire",
        "slug": "pokemon-flashfire",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Forbidden Light",
        "slug": "pokemon-forbidden-light",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Fossil",
        "slug": "pokemon-fossil",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Furious Fists",
        "slug": "pokemon-furious-fists",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Fusion Strike",
        "slug": "pokemon-fusion-strike",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Generations",
        "slug": "pokemon-generations",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Go",
        "slug": "pokemon-go",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Great Encounters",
        "slug": "pokemon-great-encounters",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Guardians Rising",
        "slug": "pokemon-guardians-rising",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Gym Challenge",
        "slug": "pokemon-gym-challenge",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Gym Heroes",
        "slug": "pokemon-gym-heroes",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon HeartGold & SoulSilver",
        "slug": "pokemon-heartgold-&-soulsilver",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Hidden Fates",
        "slug": "pokemon-hidden-fates",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Hidden Legends",
        "slug": "pokemon-hidden-legends",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Holon Phantoms",
        "slug": "pokemon-holon-phantoms",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese 10th Movie Commemoration Promo",
        "slug": "pokemon-japanese-10th-movie-commemoration-promo",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese 1996 Carddass",
        "slug": "pokemon-japanese-1996-carddass",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese 1997 Carddass",
        "slug": "pokemon-japanese-1997-carddass",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese 2002 McDonald's",
        "slug": "pokemon-japanese-2002-mcdonald's",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese 2005 Gift Box",
        "slug": "pokemon-japanese-2005-gift-box",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese 20th Anniversary",
        "slug": "pokemon-japanese-20th-anniversary",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese 25th Anniversary Collection",
        "slug": "pokemon-japanese-25th-anniversary-collection",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese 25th Anniversary Golden Box",
        "slug": "pokemon-japanese-25th-anniversary-golden-box",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese 25th Anniversary Promo",
        "slug": "pokemon-japanese-25th-anniversary-promo",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Alter Genesis",
        "slug": "pokemon-japanese-alter-genesis",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Ancient Roar",
        "slug": "pokemon-japanese-ancient-roar",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Awakening Legends",
        "slug": "pokemon-japanese-awakening-legends",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Awakening Psychic King",
        "slug": "pokemon-japanese-awakening-psychic-king",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Bandit Ring",
        "slug": "pokemon-japanese-bandit-ring",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Battle Partners",
        "slug": "pokemon-japanese-battle-partners",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Battle Region",
        "slug": "pokemon-japanese-battle-region",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Best of XY",
        "slug": "pokemon-japanese-best-of-xy",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Black Bolt",
        "slug": "pokemon-japanese-black-bolt",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Blue Sky Stream",
        "slug": "pokemon-japanese-blue-sky-stream",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese CD Promo",
        "slug": "pokemon-japanese-cd-promo",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Challenge from the Darkness",
        "slug": "pokemon-japanese-challenge-from-the-darkness",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Charizard VMAX Starter Set",
        "slug": "pokemon-japanese-charizard-vmax-starter-set",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Clash of the Blue Sky",
        "slug": "pokemon-japanese-clash-of-the-blue-sky",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Classic: Blastoise",
        "slug": "pokemon-japanese-classic-blastoise",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Classic: Charizard",
        "slug": "pokemon-japanese-classic-charizard",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Classic: Venusaur",
        "slug": "pokemon-japanese-classic-venusaur",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Clay Burst",
        "slug": "pokemon-japanese-clay-burst",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Crimson Haze",
        "slug": "pokemon-japanese-crimson-haze",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Crossing the Ruins",
        "slug": "pokemon-japanese-crossing-the-ruins",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Cyber Judge",
        "slug": "pokemon-japanese-cyber-judge",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Dark Phantasma",
        "slug": "pokemon-japanese-dark-phantasma",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Darkness, and to Light",
        "slug": "pokemon-japanese-darkness-and-to-light",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Double Blaze",
        "slug": "pokemon-japanese-double-blaze",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Double Crisis",
        "slug": "pokemon-japanese-double-crisis",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Dream League",
        "slug": "pokemon-japanese-dream-league",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Dream Shine Collection",
        "slug": "pokemon-japanese-dream-shine-collection",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Eevee Heroes",
        "slug": "pokemon-japanese-eevee-heroes",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Emerald Break",
        "slug": "pokemon-japanese-emerald-break",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Expansion Pack",
        "slug": "pokemon-japanese-expansion-pack",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Expedition Expansion Pack",
        "slug": "pokemon-japanese-expedition-expansion-pack",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Fusion Arts",
        "slug": "pokemon-japanese-fusion-arts",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Future Flash",
        "slug": "pokemon-japanese-future-flash",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese GG End",
        "slug": "pokemon-japanese-gg-end",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese GX Ultra Shiny",
        "slug": "pokemon-japanese-gx-ultra-shiny",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Gengar Vmax High-Class",
        "slug": "pokemon-japanese-gengar-vmax-high-class",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Glory of Team Rocket",
        "slug": "pokemon-japanese-glory-of-team-rocket",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Go",
        "slug": "pokemon-japanese-go",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Gold, Silver, New World",
        "slug": "pokemon-japanese-gold-silver-new-world",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Golden Sky, Silvery Ocean",
        "slug": "pokemon-japanese-golden-sky-silvery-ocean",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Heat Wave Arena",
        "slug": "pokemon-japanese-heat-wave-arena",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Holon Phantom",
        "slug": "pokemon-japanese-holon-phantom",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Holon Research",
        "slug": "pokemon-japanese-holon-research",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Incandescent Arcana",
        "slug": "pokemon-japanese-incandescent-arcana",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Inferno X",
        "slug": "pokemon-japanese-inferno-x",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Intense Fight in the Destroyed Sky",
        "slug": "pokemon-japanese-intense-fight-in-the-destroyed-sky",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Jungle",
        "slug": "pokemon-japanese-jungle",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Leaders' Stadium",
        "slug": "pokemon-japanese-leaders'-stadium",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Legendary Shine Collection",
        "slug": "pokemon-japanese-legendary-shine-collection",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Lost Abyss",
        "slug": "pokemon-japanese-lost-abyss",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Mask of Change",
        "slug": "pokemon-japanese-mask-of-change",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Matchless Fighter",
        "slug": "pokemon-japanese-matchless-fighter",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Mega Brave",
        "slug": "pokemon-japanese-mega-brave",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Mega Starter Deck Gengar Ex",
        "slug": "pokemon-japanese-mega-starter-deck-gengar-ex",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Mega Symphonia",
        "slug": "pokemon-japanese-mega-symphonia",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Miracle Twins",
        "slug": "pokemon-japanese-miracle-twins",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Mysterious Mountains",
        "slug": "pokemon-japanese-mysterious-mountains",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Mystery of the Fossils",
        "slug": "pokemon-japanese-mystery-of-the-fossils",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Neo Premium File",
        "slug": "pokemon-japanese-neo-premium-file",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Night Unison",
        "slug": "pokemon-japanese-night-unison",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Night Wanderer",
        "slug": "pokemon-japanese-night-wanderer",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Nihil Zero",
        "slug": "pokemon-japanese-nihil-zero",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Offense and Defense of the Furthest Ends",
        "slug": "pokemon-japanese-offense-and-defense-of-the-furthest-ends",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Old Maid",
        "slug": "pokemon-japanese-old-maid",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Paradigm Trigger",
        "slug": "pokemon-japanese-paradigm-trigger",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Paradise Dragona",
        "slug": "pokemon-japanese-paradise-dragona",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Phantom Gate",
        "slug": "pokemon-japanese-phantom-gate",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Player's Club",
        "slug": "pokemon-japanese-player's-club",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese PokeKyun Collection",
        "slug": "pokemon-japanese-pokekyun-collection",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Raging Surf",
        "slug": "pokemon-japanese-raging-surf",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Remix Bout",
        "slug": "pokemon-japanese-remix-bout",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Rising Fist",
        "slug": "pokemon-japanese-rising-fist",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Rocket Gang",
        "slug": "pokemon-japanese-rocket-gang",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Rocket Gang Strikes Back",
        "slug": "pokemon-japanese-rocket-gang-strikes-back",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Ruler of the Black Flame",
        "slug": "pokemon-japanese-ruler-of-the-black-flame",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese SVG Special Set",
        "slug": "pokemon-japanese-svg-special-set",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Scarlet & Violet 151",
        "slug": "pokemon-japanese-scarlet-&-violet-151",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Scarlet Ex",
        "slug": "pokemon-japanese-scarlet-ex",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Shining Darkness",
        "slug": "pokemon-japanese-shining-darkness",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Shining Legends",
        "slug": "pokemon-japanese-shining-legends",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Shiny Collection",
        "slug": "pokemon-japanese-shiny-collection",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Shiny Star V",
        "slug": "pokemon-japanese-shiny-star-v",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Shiny Treasure ex",
        "slug": "pokemon-japanese-shiny-treasure-ex",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Sky Legend",
        "slug": "pokemon-japanese-sky-legend",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Snow Hazard",
        "slug": "pokemon-japanese-snow-hazard",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Southern Islands",
        "slug": "pokemon-japanese-southern-islands",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Split Earth",
        "slug": "pokemon-japanese-split-earth",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Star Birth",
        "slug": "pokemon-japanese-star-birth",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Start Deck 100",
        "slug": "pokemon-japanese-start-deck-100",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Start Deck 100 Battle Collection",
        "slug": "pokemon-japanese-start-deck-100-battle-collection",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Stellar Miracle",
        "slug": "pokemon-japanese-stellar-miracle",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Super Electric Breaker",
        "slug": "pokemon-japanese-super-electric-breaker",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Tag All Stars",
        "slug": "pokemon-japanese-tag-all-stars",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Tag Bolt",
        "slug": "pokemon-japanese-tag-bolt",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Tag Team Starter Set",
        "slug": "pokemon-japanese-tag-team-starter-set",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Terastal Festival",
        "slug": "pokemon-japanese-terastal-festival",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese The Town on No Map",
        "slug": "pokemon-japanese-the-town-on-no-map",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Time Gazer",
        "slug": "pokemon-japanese-time-gazer",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Topsun",
        "slug": "pokemon-japanese-topsun",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Triplet Beat",
        "slug": "pokemon-japanese-triplet-beat",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese VMAX Climax",
        "slug": "pokemon-japanese-vmax-climax",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese VS",
        "slug": "pokemon-japanese-vs",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese VSTAR Universe",
        "slug": "pokemon-japanese-vstar-universe",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Vending",
        "slug": "pokemon-japanese-vending",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Violet Ex",
        "slug": "pokemon-japanese-violet-ex",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Web",
        "slug": "pokemon-japanese-web",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese White Flare",
        "slug": "pokemon-japanese-white-flare",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Wild Blaze",
        "slug": "pokemon-japanese-wild-blaze",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Wild Force",
        "slug": "pokemon-japanese-wild-force",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Wind from the Sea",
        "slug": "pokemon-japanese-wind-from-the-sea",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese World Championships 2023",
        "slug": "pokemon-japanese-world-championships-2023",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Japanese Yamabuki City Gym",
        "slug": "pokemon-japanese-yamabuki-city-gym",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Jungle",
        "slug": "pokemon-jungle",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Korean Eevee Heroes",
        "slug": "pokemon-korean-eevee-heroes",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Korean Glory Of Team Rocket",
        "slug": "pokemon-korean-glory-of-team-rocket",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Korean Promo",
        "slug": "pokemon-korean-promo",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Korean Scarlet & Violet 151",
        "slug": "pokemon-korean-scarlet-&-violet-151",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Korean Terastal Festival ex",
        "slug": "pokemon-korean-terastal-festival-ex",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Legend Maker",
        "slug": "pokemon-legend-maker",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Legendary Collection",
        "slug": "pokemon-legendary-collection",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Legendary Treasures",
        "slug": "pokemon-legendary-treasures",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Legends Awakened",
        "slug": "pokemon-legends-awakened",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Lost Origin",
        "slug": "pokemon-lost-origin",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Lost Thunder",
        "slug": "pokemon-lost-thunder",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Majestic Dawn",
        "slug": "pokemon-majestic-dawn",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon McDonalds 2018",
        "slug": "pokemon-mcdonalds-2018",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon McDonalds 2019",
        "slug": "pokemon-mcdonalds-2019",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon McDonalds 2021",
        "slug": "pokemon-mcdonalds-2021",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon McDonalds 2022",
        "slug": "pokemon-mcdonalds-2022",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon McDonalds 2023",
        "slug": "pokemon-mcdonalds-2023",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon McDonalds 2024",
        "slug": "pokemon-mcdonalds-2024",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Mysterious Treasures",
        "slug": "pokemon-mysterious-treasures",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Neo Destiny",
        "slug": "pokemon-neo-destiny",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Neo Discovery",
        "slug": "pokemon-neo-discovery",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Neo Genesis",
        "slug": "pokemon-neo-genesis",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Neo Revelation",
        "slug": "pokemon-neo-revelation",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Next Destinies",
        "slug": "pokemon-next-destinies",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Noble Victories",
        "slug": "pokemon-noble-victories",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Obsidian Flames",
        "slug": "pokemon-obsidian-flames",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon POP Series 1",
        "slug": "pokemon-pop-series-1",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon POP Series 2",
        "slug": "pokemon-pop-series-2",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon POP Series 3",
        "slug": "pokemon-pop-series-3",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon POP Series 4",
        "slug": "pokemon-pop-series-4",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon POP Series 5",
        "slug": "pokemon-pop-series-5",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon POP Series 6",
        "slug": "pokemon-pop-series-6",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon POP Series 9",
        "slug": "pokemon-pop-series-9",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Paldea Evolved",
        "slug": "pokemon-paldea-evolved",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Paradox Rift",
        "slug": "pokemon-paradox-rift",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Phantom Forces",
        "slug": "pokemon-phantom-forces",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Pikachu Libre & Suicune",
        "slug": "pokemon-pikachu-libre-&-suicune",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Plasma Blast",
        "slug": "pokemon-plasma-blast",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Plasma Freeze",
        "slug": "pokemon-plasma-freeze",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Plasma Storm",
        "slug": "pokemon-plasma-storm",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Platinum",
        "slug": "pokemon-platinum",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Power Keepers",
        "slug": "pokemon-power-keepers",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Primal Clash",
        "slug": "pokemon-primal-clash",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Rebel Clash",
        "slug": "pokemon-rebel-clash",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Rising Rivals",
        "slug": "pokemon-rising-rivals",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Roaring Skies",
        "slug": "pokemon-roaring-skies",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Ruby & Sapphire",
        "slug": "pokemon-ruby-&-sapphire",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Rumble",
        "slug": "pokemon-rumble",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Sandstorm",
        "slug": "pokemon-sandstorm",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Scarlet & Violet",
        "slug": "pokemon-scarlet-&-violet",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Scarlet & Violet Energy",
        "slug": "pokemon-scarlet-&-violet-energy",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Secret Wonders",
        "slug": "pokemon-secret-wonders",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Shining Fates",
        "slug": "pokemon-shining-fates",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Shining Legends",
        "slug": "pokemon-shining-legends",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Shrouded Fable",
        "slug": "pokemon-shrouded-fable",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Silver Tempest",
        "slug": "pokemon-silver-tempest",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Skyridge",
        "slug": "pokemon-skyridge",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Southern Islands",
        "slug": "pokemon-southern-islands",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Steam Siege",
        "slug": "pokemon-steam-siege",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Stellar Crown",
        "slug": "pokemon-stellar-crown",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Stormfront",
        "slug": "pokemon-stormfront",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Sun & Moon",
        "slug": "pokemon-sun-&-moon",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Supreme Victors",
        "slug": "pokemon-supreme-victors",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Sword & Shield",
        "slug": "pokemon-sword-&-shield",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon TCG Classic: Blastoise Deck",
        "slug": "pokemon-tcg-classic-blastoise-deck",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon TCG Classic: Charizard Deck",
        "slug": "pokemon-tcg-classic-charizard-deck",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon TCG Classic: Venusaur Deck",
        "slug": "pokemon-tcg-classic-venusaur-deck",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Team Magma & Team Aqua",
        "slug": "pokemon-team-magma-&-team-aqua",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Team Rocket Returns",
        "slug": "pokemon-team-rocket-returns",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Team Up",
        "slug": "pokemon-team-up",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Temporal Forces",
        "slug": "pokemon-temporal-forces",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Trick or Trade 2022",
        "slug": "pokemon-trick-or-trade-2022",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Trick or Trade 2023",
        "slug": "pokemon-trick-or-trade-2023",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Trick or Trade 2024",
        "slug": "pokemon-trick-or-trade-2024",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Triumphant",
        "slug": "pokemon-triumphant",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Twilight Masquerade",
        "slug": "pokemon-twilight-masquerade",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Ultra Prism",
        "slug": "pokemon-ultra-prism",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Unbroken Bonds",
        "slug": "pokemon-unbroken-bonds",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Undaunted",
        "slug": "pokemon-undaunted",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Unified Minds",
        "slug": "pokemon-unified-minds",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Unleashed",
        "slug": "pokemon-unleashed",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Unseen Forces",
        "slug": "pokemon-unseen-forces",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon Vivid Voltage",
        "slug": "pokemon-vivid-voltage",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon World Championships 2019",
        "slug": "pokemon-world-championships-2019",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon World Championships 2023",
        "slug": "pokemon-world-championships-2023",
        "released": "2010-01-01"
      },
      {
        "name": "Pokemon XY",
        "slug": "pokemon-xy",
        "released": "2010-01-01"
      }
    ]
  },
  "mtg": {
    "label": "Magic: The Gathering",
    "color": "#c8a97e",
    "catUrl": "https://www.pricecharting.com/category/magic-cards",
    "sets": [
      {
        "name": "Magic Bloomburrow",
        "slug": "magic-bloomburrow",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Marvel Spider-Man",
        "slug": "magic-marvel-spider-man",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Final Fantasy",
        "slug": "magic-final-fantasy",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Lord of the Rings",
        "slug": "magic-lord-of-the-rings",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Avatar: The Last Airbender",
        "slug": "magic-avatar-the-last-airbender",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Secret Lair Drop",
        "slug": "magic-secret-lair-drop",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Lorwyn Eclipsed",
        "slug": "magic-lorwyn-eclipsed",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Alpha",
        "slug": "magic-alpha",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Final Fantasy Commander",
        "slug": "magic-final-fantasy-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Fallout",
        "slug": "magic-fallout",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Edge of Eternities",
        "slug": "magic-edge-of-eternities",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Aetherdrift",
        "slug": "magic-aetherdrift",
        "released": "2010-01-01"
      },
      {
        "name": "Magic The List Reprints",
        "slug": "magic-the-list-reprints",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Revised",
        "slug": "magic-revised",
        "released": "2010-01-01"
      },
      {
        "name": "Magic 4th Edition",
        "slug": "magic-4th-edition",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Doctor Who",
        "slug": "magic-doctor-who",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Foundations",
        "slug": "magic-foundations",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Modern Horizons 3",
        "slug": "magic-modern-horizons-3",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Tarkir: Dragonstorm",
        "slug": "magic-tarkir-dragonstorm",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander Masters",
        "slug": "magic-commander-masters",
        "released": "2010-01-01"
      },
      {
        "name": "Teenage Mutant Ninja Turtles",
        "slug": "magic-teenage-mutant-ninja-turtles",
        "released": "2010-01-01"
      },
      {
        "name": "Teenage Mutant Ninja Turtles Art Series",
        "slug": "magic-teenage-mutant-ninja-turtles-art-series",
        "released": "2010-01-01"
      },
      {
        "name": "Teenage Mutant Ninja Turtles Commander",
        "slug": "magic-teenage-mutant-ninja-turtles-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Teenage Mutant Ninja Turtles Source Material",
        "slug": "magic-teenage-mutant-ninja-turtles-source-material",
        "released": "2010-01-01"
      },
      {
        "name": "Magic 10th Edition",
        "slug": "magic-10th-edition",
        "released": "2010-01-01"
      },
      {
        "name": "Magic 30th Anniversary",
        "slug": "magic-30th-anniversary",
        "released": "2010-01-01"
      },
      {
        "name": "Magic 5th Edition",
        "slug": "magic-5th-edition",
        "released": "2010-01-01"
      },
      {
        "name": "Magic 6th Edition",
        "slug": "magic-6th-edition",
        "released": "2010-01-01"
      },
      {
        "name": "Magic 7th Edition",
        "slug": "magic-7th-edition",
        "released": "2010-01-01"
      },
      {
        "name": "Magic 8th Edition",
        "slug": "magic-8th-edition",
        "released": "2010-01-01"
      },
      {
        "name": "Magic 9th Edition",
        "slug": "magic-9th-edition",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Adventures in the Forgotten Realms",
        "slug": "magic-adventures-in-the-forgotten-realms",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Adventures in the Forgotten Realms Commander",
        "slug": "magic-adventures-in-the-forgotten-realms-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Aether Revolt",
        "slug": "magic-aether-revolt",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Aetherdrift Art Series",
        "slug": "magic-aetherdrift-art-series",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Aetherdrift Commander",
        "slug": "magic-aetherdrift-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Ajani vs Nicol Bolas",
        "slug": "magic-ajani-vs-nicol-bolas",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Alara Reborn",
        "slug": "magic-alara-reborn",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Alliances",
        "slug": "magic-alliances",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Amonkhet",
        "slug": "magic-amonkhet",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Anthologies",
        "slug": "magic-anthologies",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Antiquities",
        "slug": "magic-antiquities",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Apocalypse",
        "slug": "magic-apocalypse",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Arabian Nights",
        "slug": "magic-arabian-nights",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Archenemy",
        "slug": "magic-archenemy",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Arena League",
        "slug": "magic-arena-league",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Assassin's Creed",
        "slug": "magic-assassin's-creed",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Avacyn Restored",
        "slug": "magic-avacyn-restored",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Avatar: The Last Airbender Art Series",
        "slug": "magic-avatar-the-last-airbender-art-series",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Avatar: The Last Airbender Eternal",
        "slug": "magic-avatar-the-last-airbender-eternal",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Battle Royale",
        "slug": "magic-battle-royale",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Battle for Zendikar",
        "slug": "magic-battle-for-zendikar",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Battlebond",
        "slug": "magic-battlebond",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Beatdown Box Set",
        "slug": "magic-beatdown-box-set",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Beta",
        "slug": "magic-beta",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Betrayers of Kamigawa",
        "slug": "magic-betrayers-of-kamigawa",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Bloomburrow Art Series",
        "slug": "magic-bloomburrow-art-series",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Bloomburrow Commander",
        "slug": "magic-bloomburrow-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Born of the Gods",
        "slug": "magic-born-of-the-gods",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Brother's War",
        "slug": "magic-brother's-war",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Brother's War Commander",
        "slug": "magic-brother's-war-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Brother's War Retro Artifacts",
        "slug": "magic-brother's-war-retro-artifacts",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Champions of Kamigawa",
        "slug": "magic-champions-of-kamigawa",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Chronicles",
        "slug": "magic-chronicles",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Coldsnap",
        "slug": "magic-coldsnap",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Coldsnap Theme Decks",
        "slug": "magic-coldsnap-theme-decks",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Collector's Edition",
        "slug": "magic-collector's-edition",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander",
        "slug": "magic-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander 2013",
        "slug": "magic-commander-2013",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander 2014",
        "slug": "magic-commander-2014",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander 2015",
        "slug": "magic-commander-2015",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander 2016",
        "slug": "magic-commander-2016",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander 2017",
        "slug": "magic-commander-2017",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander 2018",
        "slug": "magic-commander-2018",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander 2019",
        "slug": "magic-commander-2019",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander 2020",
        "slug": "magic-commander-2020",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander 2021",
        "slug": "magic-commander-2021",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander Anthology",
        "slug": "magic-commander-anthology",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander Anthology Volume II",
        "slug": "magic-commander-anthology-volume-ii",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander Collection Green",
        "slug": "magic-commander-collection-green",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander Legends",
        "slug": "magic-commander-legends",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commander Legends: Battle for Baldur's Gate",
        "slug": "magic-commander-legends-battle-for-baldur's-gate",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Commanders Arsenal",
        "slug": "magic-commanders-arsenal",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Conflux",
        "slug": "magic-conflux",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Conspiracy",
        "slug": "magic-conspiracy",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Conspiracy Take the Crown",
        "slug": "magic-conspiracy-take-the-crown",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Core Set 2012",
        "slug": "magic-core-set-2012",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Core Set 2013",
        "slug": "magic-core-set-2013",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Core Set 2019",
        "slug": "magic-core-set-2019",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Core Set 2020",
        "slug": "magic-core-set-2020",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Core Set 2021",
        "slug": "magic-core-set-2021",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Dark Ascension",
        "slug": "magic-dark-ascension",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Darksteel",
        "slug": "magic-darksteel",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Dissension",
        "slug": "magic-dissension",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Dominaria",
        "slug": "magic-dominaria",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Dominaria Remastered",
        "slug": "magic-dominaria-remastered",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Dominaria United",
        "slug": "magic-dominaria-united",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Dominaria United Commander",
        "slug": "magic-dominaria-united-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Double Masters",
        "slug": "magic-double-masters",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Double Masters 2022",
        "slug": "magic-double-masters-2022",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Dragons Maze",
        "slug": "magic-dragons-maze",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Dragons of Tarkir",
        "slug": "magic-dragons-of-tarkir",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Duel Deck: Elspeth vs Kiora",
        "slug": "magic-duel-deck-elspeth-vs-kiora",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Duels of the Planeswalkers",
        "slug": "magic-duels-of-the-planeswalkers",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Duskmourn: House of Horror",
        "slug": "magic-duskmourn-house-of-horror",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Duskmourn: House of Horror Commander",
        "slug": "magic-duskmourn-house-of-horror-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Edge of Eternities Art Series",
        "slug": "magic-edge-of-eternities-art-series",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Edge of Eternities Commander",
        "slug": "magic-edge-of-eternities-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Edge of Eternities Stellar Sights",
        "slug": "magic-edge-of-eternities-stellar-sights",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Eldritch Moon",
        "slug": "magic-eldritch-moon",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Elspeth vs Tezzeret",
        "slug": "magic-elspeth-vs-tezzeret",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Elves vs Goblins",
        "slug": "magic-elves-vs-goblins",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Eternal Masters",
        "slug": "magic-eternal-masters",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Eventide",
        "slug": "magic-eventide",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Exodus",
        "slug": "magic-exodus",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Fallen Empires",
        "slug": "magic-fallen-empires",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Fate Reforged",
        "slug": "magic-fate-reforged",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Fifth Dawn",
        "slug": "magic-fifth-dawn",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Final Fantasy Art Series",
        "slug": "magic-final-fantasy-art-series",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Final Fantasy Through the Ages",
        "slug": "magic-final-fantasy-through-the-ages",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Foundations Art Series",
        "slug": "magic-foundations-art-series",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Foundations Jumpstart",
        "slug": "magic-foundations-jumpstart",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Friday Night",
        "slug": "magic-friday-night",
        "released": "2010-01-01"
      },
      {
        "name": "Magic From the Vault Annihilation",
        "slug": "magic-from-the-vault-annihilation",
        "released": "2010-01-01"
      },
      {
        "name": "Magic From the Vault Dragons",
        "slug": "magic-from-the-vault-dragons",
        "released": "2010-01-01"
      },
      {
        "name": "Magic From the Vault Exiled",
        "slug": "magic-from-the-vault-exiled",
        "released": "2010-01-01"
      },
      {
        "name": "Magic From the Vault Legends",
        "slug": "magic-from-the-vault-legends",
        "released": "2010-01-01"
      },
      {
        "name": "Magic From the Vault Lore",
        "slug": "magic-from-the-vault-lore",
        "released": "2010-01-01"
      },
      {
        "name": "Magic From the Vault Realms",
        "slug": "magic-from-the-vault-realms",
        "released": "2010-01-01"
      },
      {
        "name": "Magic From the Vault Relics",
        "slug": "magic-from-the-vault-relics",
        "released": "2010-01-01"
      },
      {
        "name": "Magic From the Vault Twenty",
        "slug": "magic-from-the-vault-twenty",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Future Sight",
        "slug": "magic-future-sight",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Game Night 2019",
        "slug": "magic-game-night-2019",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Garruk vs Liliana",
        "slug": "magic-garruk-vs-liliana",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Gatecrash",
        "slug": "magic-gatecrash",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Gateway",
        "slug": "magic-gateway",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Grand Prix",
        "slug": "magic-grand-prix",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Guildpact",
        "slug": "magic-guildpact",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Guilds of Ravnica",
        "slug": "magic-guilds-of-ravnica",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Guilds of Ravnica Guild Kits",
        "slug": "magic-guilds-of-ravnica-guild-kits",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Heroes vs Monsters",
        "slug": "magic-heroes-vs-monsters",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Homelands",
        "slug": "magic-homelands",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Hour of Devastation",
        "slug": "magic-hour-of-devastation",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Ice Age",
        "slug": "magic-ice-age",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Iconic Masters",
        "slug": "magic-iconic-masters",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Ikoria Lair of Behemoths",
        "slug": "magic-ikoria-lair-of-behemoths",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Innistrad",
        "slug": "magic-innistrad",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Innistrad Remastered",
        "slug": "magic-innistrad-remastered",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Innistrad: Crimson Vow",
        "slug": "magic-innistrad-crimson-vow",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Innistrad: Crimson Vow Commander",
        "slug": "magic-innistrad-crimson-vow-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Innistrad: Double Feature",
        "slug": "magic-innistrad-double-feature",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Innistrad: Midnight Hunt",
        "slug": "magic-innistrad-midnight-hunt",
        "released": "2010-01-01"
      },
      {
        "name": "Magic International Edition",
        "slug": "magic-international-edition",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Invasion",
        "slug": "magic-invasion",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Ixalan",
        "slug": "magic-ixalan",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Izzet vs Golgari",
        "slug": "magic-izzet-vs-golgari",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Jace vs Chandra",
        "slug": "magic-jace-vs-chandra",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Jace vs Vraska",
        "slug": "magic-jace-vs-vraska",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Journey Into Nyx",
        "slug": "magic-journey-into-nyx",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Judge Gift",
        "slug": "magic-judge-gift",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Judgment",
        "slug": "magic-judgment",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Jumpstart",
        "slug": "magic-jumpstart",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Jumpstart 2022",
        "slug": "magic-jumpstart-2022",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Junior Super Series",
        "slug": "magic-junior-super-series",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Jurassic World",
        "slug": "magic-jurassic-world",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Kaladesh",
        "slug": "magic-kaladesh",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Kaladesh Inventions",
        "slug": "magic-kaladesh-inventions",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Kaldheim",
        "slug": "magic-kaldheim",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Kaldheim Commander",
        "slug": "magic-kaldheim-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Kamigawa: Neon Dynasty",
        "slug": "magic-kamigawa-neon-dynasty",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Kamigawa: Neon Dynasty Commander",
        "slug": "magic-kamigawa-neon-dynasty-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Khans of Tarkir",
        "slug": "magic-khans-of-tarkir",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Knights vs Dragons",
        "slug": "magic-knights-vs-dragons",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Legends",
        "slug": "magic-legends",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Legions",
        "slug": "magic-legions",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Lord of the Rings Art Series",
        "slug": "magic-lord-of-the-rings-art-series",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Lord of the Rings Commander",
        "slug": "magic-lord-of-the-rings-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Lorwyn",
        "slug": "magic-lorwyn",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Lorwyn Eclipsed Commander",
        "slug": "magic-lorwyn-eclipsed-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Lost Caverns of Ixalan",
        "slug": "magic-lost-caverns-of-ixalan",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Lost Caverns of Ixalan Commander",
        "slug": "magic-lost-caverns-of-ixalan-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic M10",
        "slug": "magic-m10",
        "released": "2010-01-01"
      },
      {
        "name": "Magic M11",
        "slug": "magic-m11",
        "released": "2010-01-01"
      },
      {
        "name": "Magic M14",
        "slug": "magic-m14",
        "released": "2010-01-01"
      },
      {
        "name": "Magic M15",
        "slug": "magic-m15",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Magic Origins",
        "slug": "magic-magic-origins",
        "released": "2010-01-01"
      },
      {
        "name": "Magic March of the Machine",
        "slug": "magic-march-of-the-machine",
        "released": "2010-01-01"
      },
      {
        "name": "Magic March of the Machine Commander",
        "slug": "magic-march-of-the-machine-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic March of the Machine: The Aftermath",
        "slug": "magic-march-of-the-machine-the-aftermath",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Marvel Spider-Man Art Series",
        "slug": "magic-marvel-spider-man-art-series",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Marvel Spider-Man Eternal",
        "slug": "magic-marvel-spider-man-eternal",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Marvel Spider-Man: Marvel Universe",
        "slug": "magic-marvel-spider-man-marvel-universe",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Masterpiece Series: Amonkhet Invocations",
        "slug": "magic-masterpiece-series-amonkhet-invocations",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Masters 25",
        "slug": "magic-masters-25",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Mercadian Masques",
        "slug": "magic-mercadian-masques",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Midnight Hunt Commander",
        "slug": "magic-midnight-hunt-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Mirage",
        "slug": "magic-mirage",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Mirrodin",
        "slug": "magic-mirrodin",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Mirrodin Besieged",
        "slug": "magic-mirrodin-besieged",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Modern Horizons",
        "slug": "magic-modern-horizons",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Modern Horizons 2",
        "slug": "magic-modern-horizons-2",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Modern Horizons 3 Commander",
        "slug": "magic-modern-horizons-3-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Modern Masters",
        "slug": "magic-modern-masters",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Modern Masters 2015",
        "slug": "magic-modern-masters-2015",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Modern Masters 2017",
        "slug": "magic-modern-masters-2017",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Morningtide",
        "slug": "magic-morningtide",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Multiverse Legends",
        "slug": "magic-multiverse-legends",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Murders at Karlov Manor",
        "slug": "magic-murders-at-karlov-manor",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Murders at Karlov Manor Commander",
        "slug": "magic-murders-at-karlov-manor-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Mystery Booster",
        "slug": "magic-mystery-booster",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Mystery Booster 2",
        "slug": "magic-mystery-booster-2",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Mythic Edition",
        "slug": "magic-mythic-edition",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Nemesis",
        "slug": "magic-nemesis",
        "released": "2010-01-01"
      },
      {
        "name": "Magic New Capenna Commander",
        "slug": "magic-new-capenna-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic New Phyrexia",
        "slug": "magic-new-phyrexia",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Nissa vs Ob Nixilis",
        "slug": "magic-nissa-vs-ob-nixilis",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Oath of the Gatewatch",
        "slug": "magic-oath-of-the-gatewatch",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Odyssey",
        "slug": "magic-odyssey",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Onslaught",
        "slug": "magic-onslaught",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Outlaws of Thunder Junction",
        "slug": "magic-outlaws-of-thunder-junction",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Outlaws of Thunder Junction Breaking News",
        "slug": "magic-outlaws-of-thunder-junction-breaking-news",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Outlaws of Thunder Junction Commander",
        "slug": "magic-outlaws-of-thunder-junction-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Phyrexia vs The Coalition",
        "slug": "magic-phyrexia-vs-the-coalition",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Phyrexia: All Will Be One",
        "slug": "magic-phyrexia-all-will-be-one",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Phyrexia: All Will Be One Commander",
        "slug": "magic-phyrexia-all-will-be-one-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Planar Chaos",
        "slug": "magic-planar-chaos",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Planechase",
        "slug": "magic-planechase",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Planechase 2012",
        "slug": "magic-planechase-2012",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Planechase Anthology",
        "slug": "magic-planechase-anthology",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Planeshift",
        "slug": "magic-planeshift",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Player Rewards",
        "slug": "magic-player-rewards",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Portal",
        "slug": "magic-portal",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Portal Second Age",
        "slug": "magic-portal-second-age",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Portal Three Kingdoms",
        "slug": "magic-portal-three-kingdoms",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Premium Deck Series Graveborn",
        "slug": "magic-premium-deck-series-graveborn",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Premium Deck Series Slivers",
        "slug": "magic-premium-deck-series-slivers",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Promo",
        "slug": "magic-promo",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Prophecy",
        "slug": "magic-prophecy",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Ravnica",
        "slug": "magic-ravnica",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Ravnica Allegiance",
        "slug": "magic-ravnica-allegiance",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Ravnica Allegiance Guild Kits",
        "slug": "magic-ravnica-allegiance-guild-kits",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Ravnica Remastered",
        "slug": "magic-ravnica-remastered",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Return to Ravnica",
        "slug": "magic-return-to-ravnica",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Rise of the Eldrazi",
        "slug": "magic-rise-of-the-eldrazi",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Rivals of Ixalan",
        "slug": "magic-rivals-of-ixalan",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Saviors of Kamigawa",
        "slug": "magic-saviors-of-kamigawa",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Scars of Mirrodin",
        "slug": "magic-scars-of-mirrodin",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Scourge",
        "slug": "magic-scourge",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Secret Lair 30th Anniversary",
        "slug": "magic-secret-lair-30th-anniversary",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Secret Lair Showdown",
        "slug": "magic-secret-lair-showdown",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Shadowmoor",
        "slug": "magic-shadowmoor",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Shadows Over Innistrad",
        "slug": "magic-shadows-over-innistrad",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Shards of Alara",
        "slug": "magic-shards-of-alara",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Sorin vs Tibalt",
        "slug": "magic-sorin-vs-tibalt",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Special Guests",
        "slug": "magic-special-guests",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Speed vs Cunning",
        "slug": "magic-speed-vs-cunning",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Starter 1999",
        "slug": "magic-starter-1999",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Starter Commander Decks",
        "slug": "magic-starter-commander-decks",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Streets of New Capenna",
        "slug": "magic-streets-of-new-capenna",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Strixhaven Mystical Archive",
        "slug": "magic-strixhaven-mystical-archive",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Strixhaven School of Mages",
        "slug": "magic-strixhaven-school-of-mages",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Stronghold",
        "slug": "magic-stronghold",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Summer Edition",
        "slug": "magic-summer-edition",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Tarkir: Dragonstorm Commander",
        "slug": "magic-tarkir-dragonstorm-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Tempest",
        "slug": "magic-tempest",
        "released": "2010-01-01"
      },
      {
        "name": "Magic The Big Score",
        "slug": "magic-the-big-score",
        "released": "2010-01-01"
      },
      {
        "name": "Magic The Dark",
        "slug": "magic-the-dark",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Theros",
        "slug": "magic-theros",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Theros Beyond Death",
        "slug": "magic-theros-beyond-death",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Throne of Eldraine",
        "slug": "magic-throne-of-eldraine",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Time Spiral",
        "slug": "magic-time-spiral",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Time Spiral Remastered",
        "slug": "magic-time-spiral-remastered",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Time Spiral Timeshifted",
        "slug": "magic-time-spiral-timeshifted",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Torment",
        "slug": "magic-torment",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Transformers",
        "slug": "magic-transformers",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Ultimate Box Topper",
        "slug": "magic-ultimate-box-topper",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Ultimate Masters",
        "slug": "magic-ultimate-masters",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Unfinity",
        "slug": "magic-unfinity",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Unglued",
        "slug": "magic-unglued",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Unhinged",
        "slug": "magic-unhinged",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Unlimited",
        "slug": "magic-unlimited",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Unstable",
        "slug": "magic-unstable",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Urzas Destiny",
        "slug": "magic-urzas-destiny",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Urzas Legacy",
        "slug": "magic-urzas-legacy",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Urzas Saga",
        "slug": "magic-urzas-saga",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Venser vs Koth",
        "slug": "magic-venser-vs-koth",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Visions",
        "slug": "magic-visions",
        "released": "2010-01-01"
      },
      {
        "name": "Magic War of the Spark",
        "slug": "magic-war-of-the-spark",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Warhammer 40,000",
        "slug": "magic-warhammer-40,000",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Weatherlight",
        "slug": "magic-weatherlight",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Wilds of Eldraine",
        "slug": "magic-wilds-of-eldraine",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Wilds of Eldraine Commander",
        "slug": "magic-wilds-of-eldraine-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Wilds of Eldraine Enchanting Tales",
        "slug": "magic-wilds-of-eldraine-enchanting-tales",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Worldwake",
        "slug": "magic-worldwake",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Zendikar",
        "slug": "magic-zendikar",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Zendikar Expeditions",
        "slug": "magic-zendikar-expeditions",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Zendikar Rising",
        "slug": "magic-zendikar-rising",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Zendikar Rising Commander",
        "slug": "magic-zendikar-rising-commander",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Zendikar Rising Expeditions",
        "slug": "magic-zendikar-rising-expeditions",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Zendikar vs Eldrazi",
        "slug": "magic-zendikar-vs-eldrazi",
        "released": "2010-01-01"
      }
    ]
  },
  "yugioh": {
    "label": "Yu-Gi-Oh!",
    "color": "#7b2d8b",
    "catUrl": "https://www.pricecharting.com/category/yugioh-cards",
    "sets": [
      {
        "name": "Legend of Blue Eyes White Dragon",
        "slug": "yugioh-legend-of-blue-eyes-white-dragon",
        "released": "2010-01-01"
      },
      {
        "name": "Quarter Century Stampede",
        "slug": "yugioh-quarter-century-stampede",
        "released": "2010-01-01"
      },
      {
        "name": "Starter Deck: Kaiba",
        "slug": "yugioh-starter-deck-kaiba",
        "released": "2010-01-01"
      },
      {
        "name": "Retro Pack 2",
        "slug": "yugioh-retro-pack-2",
        "released": "2010-01-01"
      },
      {
        "name": "Starter Deck: Yugi",
        "slug": "yugioh-starter-deck-yugi",
        "released": "2010-01-01"
      },
      {
        "name": "Metal Raiders",
        "slug": "yugioh-metal-raiders",
        "released": "2010-01-01"
      },
      {
        "name": "Quarter Century Bonanza",
        "slug": "yugioh-quarter-century-bonanza",
        "released": "2010-01-01"
      },
      {
        "name": "25th Anniversary Rarity Collection II",
        "slug": "yugioh-25th-anniversary-rarity-collection-ii",
        "released": "2010-01-01"
      },
      {
        "name": "Burst Protocol",
        "slug": "yugioh-burst-protocol",
        "released": "2010-01-01"
      },
      {
        "name": "Legendary Collection Kaiba Mega Pack",
        "slug": "yugioh-legendary-collection-kaiba-mega-pack",
        "released": "2010-01-01"
      },
      {
        "name": "Starter Deck: Joey",
        "slug": "yugioh-starter-deck-joey",
        "released": "2010-01-01"
      },
      {
        "name": "Starter Deck: Yugi Evolution",
        "slug": "yugioh-starter-deck-yugi-evolution",
        "released": "2010-01-01"
      },
      {
        "name": "Battles of Legend: Monster Mayhem",
        "slug": "yugioh-battles-of-legend-monster-mayhem",
        "released": "2010-01-01"
      },
      {
        "name": "Ghosts From the Past: 2nd Haunting",
        "slug": "yugioh-ghosts-from-the-past-2nd-haunting",
        "released": "2010-01-01"
      },
      {
        "name": "Pharaoh's Servant",
        "slug": "yugioh-pharaoh's-servant",
        "released": "2010-01-01"
      },
      {
        "name": "Magic Ruler",
        "slug": "yugioh-magic-ruler",
        "released": "2010-01-01"
      },
      {
        "name": "Magician's Force",
        "slug": "yugioh-magician's-force",
        "released": "2010-01-01"
      },
      {
        "name": "25th Anniversary Tin: Dueling Mirrors",
        "slug": "yugioh-25th-anniversary-tin-dueling-mirrors",
        "released": "2010-01-01"
      },
      {
        "name": "25th Anniversary Rarity Collection",
        "slug": "yugioh-25th-anniversary-rarity-collection",
        "released": "2010-01-01"
      },
      {
        "name": "Starter Deck: Kaiba Evolution",
        "slug": "yugioh-starter-deck-kaiba-evolution",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Modern Decks 2026",
        "slug": "yugioh-legendary-modern-decks-2026",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Limit Over Collection: Heroes",
        "slug": "yugioh-japanese-limit-over-collection-heroes",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Maze of Muertos",
        "slug": "yugioh-maze-of-muertos",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Tournament Pack 30",
        "slug": "yugioh-tournament-pack-30",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 2002 Collector's Tin",
        "slug": "yugioh-2002-collector's-tin",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 2003 Collector's Tin",
        "slug": "yugioh-2003-collector's-tin",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 2014 Mega-Tin Mega Pack",
        "slug": "yugioh-2014-mega-tin-mega-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 2015 Mega-Tin Mega Pack",
        "slug": "yugioh-2015-mega-tin-mega-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 2016 Mega-Tins",
        "slug": "yugioh-2016-mega-tins",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 2017 Mega-Tin Mega Pack",
        "slug": "yugioh-2017-mega-tin-mega-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 2017 Mega-Tins",
        "slug": "yugioh-2017-mega-tins",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 2019 Gold Sarcophagus Tin",
        "slug": "yugioh-2019-gold-sarcophagus-tin",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 2019 Gold Sarcophagus Tin Mega Pack",
        "slug": "yugioh-2019-gold-sarcophagus-tin-mega-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 2020 Tin of Lost Memories Mega Pack",
        "slug": "yugioh-2020-tin-of-lost-memories-mega-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 2021 Tin of Ancient Battles Mega Pack",
        "slug": "yugioh-2021-tin-of-ancient-battles-mega-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 2022 Tin of the Pharaoh's Gods Mega Pack",
        "slug": "yugioh-2022-tin-of-the-pharaoh's-gods-mega-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 2025 Mega Pack Tin",
        "slug": "yugioh-2025-mega-pack-tin",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 25th Anniversary Tin: Dueling Heroes",
        "slug": "yugioh-25th-anniversary-tin-dueling-heroes",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 25th Anniversary Tin: Dueling Heroes Mega Pack",
        "slug": "yugioh-25th-anniversary-tin-dueling-heroes-mega-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh 25th Anniversary Ultimate Kaiba Set",
        "slug": "yugioh-25th-anniversary-ultimate-kaiba-set",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Absolute Powerforce",
        "slug": "yugioh-absolute-powerforce",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Abyss Rising",
        "slug": "yugioh-abyss-rising",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Age of Overlord",
        "slug": "yugioh-age-of-overlord",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Alliance Insight",
        "slug": "yugioh-alliance-insight",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Amazing Defenders",
        "slug": "yugioh-amazing-defenders",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Ancient Guardians",
        "slug": "yugioh-ancient-guardians",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Ancient Prophecy",
        "slug": "yugioh-ancient-prophecy",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Ancient Sanctuary",
        "slug": "yugioh-ancient-sanctuary",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Anniversary Pack",
        "slug": "yugioh-anniversary-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Battle Pack 2: War of the Giants",
        "slug": "yugioh-battle-pack-2-war-of-the-giants",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Battle Pack 3: Monster League",
        "slug": "yugioh-battle-pack-3-monster-league",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Battle Pack: Epic Dawn",
        "slug": "yugioh-battle-pack-epic-dawn",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Battle of Chaos",
        "slug": "yugioh-battle-of-chaos",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Battles of Legend: Armageddon",
        "slug": "yugioh-battles-of-legend-armageddon",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Battles of Legend: Chapter 1",
        "slug": "yugioh-battles-of-legend-chapter-1",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Battles of Legend: Crystal Revenge",
        "slug": "yugioh-battles-of-legend-crystal-revenge",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Battles of Legend: Hero's Revenge",
        "slug": "yugioh-battles-of-legend-hero's-revenge",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Battles of Legend: Light's Revenge",
        "slug": "yugioh-battles-of-legend-light's-revenge",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Battles of Legend: Monstrous Revenge",
        "slug": "yugioh-battles-of-legend-monstrous-revenge",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Battles of Legend: Relentless Revenge",
        "slug": "yugioh-battles-of-legend-relentless-revenge",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Battles of Legend: Terminal Revenge",
        "slug": "yugioh-battles-of-legend-terminal-revenge",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Blazing Vortex",
        "slug": "yugioh-blazing-vortex",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Breakers of Shadow",
        "slug": "yugioh-breakers-of-shadow",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Brothers of Legend",
        "slug": "yugioh-brothers-of-legend",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Burst of Destiny",
        "slug": "yugioh-burst-of-destiny",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Chaos Impact",
        "slug": "yugioh-chaos-impact",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Chronicles Deck: The Fallen & The Virtuous",
        "slug": "yugioh-chronicles-deck-the-fallen-&-the-virtuous",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Circuit Break",
        "slug": "yugioh-circuit-break",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Clash of Rebellions",
        "slug": "yugioh-clash-of-rebellions",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Code of the Duelist",
        "slug": "yugioh-code-of-the-duelist",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Collectible Tins 2004",
        "slug": "yugioh-collectible-tins-2004",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Collectible Tins 2005",
        "slug": "yugioh-collectible-tins-2005",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Collectible Tins 2006",
        "slug": "yugioh-collectible-tins-2006",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Collectible Tins 2008",
        "slug": "yugioh-collectible-tins-2008",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Cosmo Blazer",
        "slug": "yugioh-cosmo-blazer",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Crimson Crisis",
        "slug": "yugioh-crimson-crisis",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Crossed Souls",
        "slug": "yugioh-crossed-souls",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Crossover Breakers",
        "slug": "yugioh-crossover-breakers",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Crossroads of Chaos",
        "slug": "yugioh-crossroads-of-chaos",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Cyberdark Impact",
        "slug": "yugioh-cyberdark-impact",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Cybernetic Horizon",
        "slug": "yugioh-cybernetic-horizon",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Cybernetic Revolution",
        "slug": "yugioh-cybernetic-revolution",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Cyberstorm Access",
        "slug": "yugioh-cyberstorm-access",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Dark Beginning 1",
        "slug": "yugioh-dark-beginning-1",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Dark Beginning 2",
        "slug": "yugioh-dark-beginning-2",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Dark Crisis",
        "slug": "yugioh-dark-crisis",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Dark Duel Stories",
        "slug": "yugioh-dark-duel-stories",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Dark Legends",
        "slug": "yugioh-dark-legends",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Dark Neostorm",
        "slug": "yugioh-dark-neostorm",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Dark Revelation Volume 1",
        "slug": "yugioh-dark-revelation-volume-1",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Dark Revelation Volume 2",
        "slug": "yugioh-dark-revelation-volume-2",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Dark Revelation Volume 3",
        "slug": "yugioh-dark-revelation-volume-3",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Dark Revelation Volume 4",
        "slug": "yugioh-dark-revelation-volume-4",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Dark Saviors",
        "slug": "yugioh-dark-saviors",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Darkwing Blast",
        "slug": "yugioh-darkwing-blast",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Dawn of Majesty",
        "slug": "yugioh-dawn-of-majesty",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Dimension Force",
        "slug": "yugioh-dimension-force",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Dimension of Chaos",
        "slug": "yugioh-dimension-of-chaos",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Doom of Dimensions",
        "slug": "yugioh-doom-of-dimensions",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Dragons of Legend: The Complete Series",
        "slug": "yugioh-dragons-of-legend-the-complete-series",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Duel Master's Guide",
        "slug": "yugioh-duel-master's-guide",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Duel Monsters International",
        "slug": "yugioh-duel-monsters-international",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Duel Overload",
        "slug": "yugioh-duel-overload",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Duel Power",
        "slug": "yugioh-duel-power",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Duelist Alliance",
        "slug": "yugioh-duelist-alliance",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Duelist League",
        "slug": "yugioh-duelist-league",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Duelist Nexus",
        "slug": "yugioh-duelist-nexus",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Duelist Pack: Battle City",
        "slug": "yugioh-duelist-pack-battle-city",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Duelist Pack: Kaiba",
        "slug": "yugioh-duelist-pack-kaiba",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Duelist Pack: Yugi",
        "slug": "yugioh-duelist-pack-yugi",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Duelist Revolution",
        "slug": "yugioh-duelist-revolution",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Duelist Saga",
        "slug": "yugioh-duelist-saga",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Duelist's Advance",
        "slug": "yugioh-duelist's-advance",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Egyptian God Deck: Obelisk the Tormentor",
        "slug": "yugioh-egyptian-god-deck-obelisk-the-tormentor",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Egyptian God Deck: Slifer the Sky Dragon",
        "slug": "yugioh-egyptian-god-deck-slifer-the-sky-dragon",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Elemental Energy",
        "slug": "yugioh-elemental-energy",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Enemy of Justice",
        "slug": "yugioh-enemy-of-justice",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Eternity Code",
        "slug": "yugioh-eternity-code",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Exclusive Pack",
        "slug": "yugioh-exclusive-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Extreme Force",
        "slug": "yugioh-extreme-force",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Extreme Victory",
        "slug": "yugioh-extreme-victory",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Flames of Destruction",
        "slug": "yugioh-flames-of-destruction",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Flaming Eternity",
        "slug": "yugioh-flaming-eternity",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Forbidden Legacy",
        "slug": "yugioh-forbidden-legacy",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Forbidden Memories",
        "slug": "yugioh-forbidden-memories",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Force of the Breaker",
        "slug": "yugioh-force-of-the-breaker",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Galactic Overlord",
        "slug": "yugioh-galactic-overlord",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Generation Force",
        "slug": "yugioh-generation-force",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Genesis Impact",
        "slug": "yugioh-genesis-impact",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Ghosts From the Past",
        "slug": "yugioh-ghosts-from-the-past",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Gladiator's Assault",
        "slug": "yugioh-gladiator's-assault",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Gold Series: Haunted Mine",
        "slug": "yugioh-gold-series-haunted-mine",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Hidden Arsenal: Chapter 1",
        "slug": "yugioh-hidden-arsenal-chapter-1",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Ignition Assault",
        "slug": "yugioh-ignition-assault",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Invasion of Chaos",
        "slug": "yugioh-invasion-of-chaos",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Invasion of Chaos: 25th Anniversary",
        "slug": "yugioh-invasion-of-chaos-25th-anniversary",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Invasion: Vengeance",
        "slug": "yugioh-invasion-vengeance",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Absolute Powerforce",
        "slug": "yugioh-japanese-absolute-powerforce",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Abyss Rising",
        "slug": "yugioh-japanese-abyss-rising",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Alliance Insight",
        "slug": "yugioh-japanese-alliance-insight",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Ancient Prophecy",
        "slug": "yugioh-japanese-ancient-prophecy",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Controller of Chaos",
        "slug": "yugioh-japanese-controller-of-chaos",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Cosmo Blazer",
        "slug": "yugioh-japanese-cosmo-blazer",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Crimson Crisis",
        "slug": "yugioh-japanese-crimson-crisis",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Crossroads of Chaos",
        "slug": "yugioh-japanese-crossroads-of-chaos",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Duelist Revolution",
        "slug": "yugioh-japanese-duelist-revolution",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Duelist Road Piece of Memory: Yugi Muto",
        "slug": "yugioh-japanese-duelist-road-piece-of-memory-yugi-muto",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Extreme Victory",
        "slug": "yugioh-japanese-extreme-victory",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Galactic Overlord",
        "slug": "yugioh-japanese-galactic-overlord",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Generation Force",
        "slug": "yugioh-japanese-generation-force",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese History Archive Collection",
        "slug": "yugioh-japanese-history-archive-collection",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Judgment of the Light",
        "slug": "yugioh-japanese-judgment-of-the-light",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Legacy of the Valiant",
        "slug": "yugioh-japanese-legacy-of-the-valiant",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Lord of the Tachyon Galaxy",
        "slug": "yugioh-japanese-lord-of-the-tachyon-galaxy",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Order of Chaos",
        "slug": "yugioh-japanese-order-of-chaos",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Photon Shockwave",
        "slug": "yugioh-japanese-photon-shockwave",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Premium Pack 4",
        "slug": "yugioh-japanese-premium-pack-4",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Quarter Century Art Collection",
        "slug": "yugioh-japanese-quarter-century-art-collection",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Quarter Century Duelist Box",
        "slug": "yugioh-japanese-quarter-century-duelist-box",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Return of the Duelist",
        "slug": "yugioh-japanese-return-of-the-duelist",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Rise of the Duelist",
        "slug": "yugioh-japanese-rise-of-the-duelist",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Shadow Specters",
        "slug": "yugioh-japanese-shadow-specters",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Soul Fusion",
        "slug": "yugioh-japanese-soul-fusion",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Spell of Mask",
        "slug": "yugioh-japanese-spell-of-mask",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Stardust Overdrive",
        "slug": "yugioh-japanese-stardust-overdrive",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Starstrike Blast",
        "slug": "yugioh-japanese-starstrike-blast",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Storm of Ragnarok",
        "slug": "yugioh-japanese-storm-of-ragnarok",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Strike of Neos",
        "slug": "yugioh-japanese-strike-of-neos",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Supreme Darkness",
        "slug": "yugioh-japanese-supreme-darkness",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Tactical Evolution",
        "slug": "yugioh-japanese-tactical-evolution",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese The New Ruler",
        "slug": "yugioh-japanese-the-new-ruler",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese The Shining Darkness",
        "slug": "yugioh-japanese-the-shining-darkness",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese V Jump",
        "slug": "yugioh-japanese-v-jump",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Japanese Vol.1",
        "slug": "yugioh-japanese-vol1",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Judgment of the Light",
        "slug": "yugioh-judgment-of-the-light",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Justice Hunters",
        "slug": "yugioh-justice-hunters",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Kings Court",
        "slug": "yugioh-kings-court",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Labyrinth of Nightmare",
        "slug": "yugioh-labyrinth-of-nightmare",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legacy of Darkness",
        "slug": "yugioh-legacy-of-darkness",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legacy of Destruction",
        "slug": "yugioh-legacy-of-destruction",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legacy of the Valiant",
        "slug": "yugioh-legacy-of-the-valiant",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legend of Blue Eyes White Dragon: 25th Anniversary",
        "slug": "yugioh-legend-of-blue-eyes-white-dragon-25th-anniversary",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Collection",
        "slug": "yugioh-legendary-collection",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Collection 2: The Duel Academy Years Mega Pack",
        "slug": "yugioh-legendary-collection-2-the-duel-academy-years-mega-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Collection 3: Yugi's World",
        "slug": "yugioh-legendary-collection-3-yugi's-world",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Collection 3: Yugi's World Mega Pack",
        "slug": "yugioh-legendary-collection-3-yugi's-world-mega-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Collection 4: Joey's World Mega Pack",
        "slug": "yugioh-legendary-collection-4-joey's-world-mega-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Collection 5D's Mega Pack",
        "slug": "yugioh-legendary-collection-5d's-mega-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Collection Kaiba",
        "slug": "yugioh-legendary-collection-kaiba",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Collection: 25th Anniversary",
        "slug": "yugioh-legendary-collection-25th-anniversary",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Decks II",
        "slug": "yugioh-legendary-decks-ii",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Dragon Decks",
        "slug": "yugioh-legendary-dragon-decks",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Duelists: Duels from the Deep",
        "slug": "yugioh-legendary-duelists-duels-from-the-deep",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Duelists: Magical Hero",
        "slug": "yugioh-legendary-duelists-magical-hero",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Duelists: Rage of Ra",
        "slug": "yugioh-legendary-duelists-rage-of-ra",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Duelists: Season 1",
        "slug": "yugioh-legendary-duelists-season-1",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Duelists: Season 2",
        "slug": "yugioh-legendary-duelists-season-2",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Duelists: Season 3",
        "slug": "yugioh-legendary-duelists-season-3",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Duelists: Soulburning Volcano",
        "slug": "yugioh-legendary-duelists-soulburning-volcano",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Duelists: Synchro Storm",
        "slug": "yugioh-legendary-duelists-synchro-storm",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Legendary Hero Decks",
        "slug": "yugioh-legendary-hero-decks",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Light of Destruction",
        "slug": "yugioh-light-of-destruction",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Lightning Overdrive",
        "slug": "yugioh-lightning-overdrive",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Lord of the Tachyon Galaxy",
        "slug": "yugioh-lord-of-the-tachyon-galaxy",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Lost Art Promo",
        "slug": "yugioh-lost-art-promo",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Magnificent Mavens",
        "slug": "yugioh-magnificent-mavens",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Master Collection Volume 1",
        "slug": "yugioh-master-collection-volume-1",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Maximum Crisis",
        "slug": "yugioh-maximum-crisis",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Maximum Gold",
        "slug": "yugioh-maximum-gold",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Maximum Gold: El Dorado",
        "slug": "yugioh-maximum-gold-el-dorado",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Maze of Memories",
        "slug": "yugioh-maze-of-memories",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Maze of Millennia",
        "slug": "yugioh-maze-of-millennia",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Maze of the Master",
        "slug": "yugioh-maze-of-the-master",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh McDonald's",
        "slug": "yugioh-mcdonald's",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh McDonald's 2",
        "slug": "yugioh-mcdonald's-2",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Metal Raiders: 25th Anniversary",
        "slug": "yugioh-metal-raiders-25th-anniversary",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Movie Pack",
        "slug": "yugioh-movie-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Order of Chaos",
        "slug": "yugioh-order-of-chaos",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Phantom Darkness",
        "slug": "yugioh-phantom-darkness",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Phantom Nightmare",
        "slug": "yugioh-phantom-nightmare",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Phantom Rage",
        "slug": "yugioh-phantom-rage",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Phantom Revenge",
        "slug": "yugioh-phantom-revenge",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Pharaoh's Servant: 25th Anniversary",
        "slug": "yugioh-pharaoh's-servant-25th-anniversary",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Pharaonic Guardian",
        "slug": "yugioh-pharaonic-guardian",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Photon Hypernova",
        "slug": "yugioh-photon-hypernova",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Photon Shockwave",
        "slug": "yugioh-photon-shockwave",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Power Of The Elements",
        "slug": "yugioh-power-of-the-elements",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Power of the Duelist",
        "slug": "yugioh-power-of-the-duelist",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Premium Collection Tin",
        "slug": "yugioh-premium-collection-tin",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Premium Gold",
        "slug": "yugioh-premium-gold",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Premium Gold: Infinite Gold",
        "slug": "yugioh-premium-gold-infinite-gold",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Premium Gold: Return of the Bling",
        "slug": "yugioh-premium-gold-return-of-the-bling",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Premium Pack",
        "slug": "yugioh-premium-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Primal Origin",
        "slug": "yugioh-primal-origin",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Ra Yellow Mega Pack",
        "slug": "yugioh-ra-yellow-mega-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Rage of the Abyss",
        "slug": "yugioh-rage-of-the-abyss",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Raging Battle",
        "slug": "yugioh-raging-battle",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Raging Tempest",
        "slug": "yugioh-raging-tempest",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Retro Pack",
        "slug": "yugioh-retro-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Retro Pack 2 Reprint",
        "slug": "yugioh-retro-pack-2-reprint",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Retro Pack 2024",
        "slug": "yugioh-retro-pack-2024",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Return of the Duelist",
        "slug": "yugioh-return-of-the-duelist",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Rise of Destiny",
        "slug": "yugioh-rise-of-destiny",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Rising Rampage",
        "slug": "yugioh-rising-rampage",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Secrets of Eternity",
        "slug": "yugioh-secrets-of-eternity",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Shadow Specters",
        "slug": "yugioh-shadow-specters",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Shadow of Infinity",
        "slug": "yugioh-shadow-of-infinity",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Shining Victories",
        "slug": "yugioh-shining-victories",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Shonen Jump Promo",
        "slug": "yugioh-shonen-jump-promo",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Soul Fusion",
        "slug": "yugioh-soul-fusion",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Soul of the Duelist",
        "slug": "yugioh-soul-of-the-duelist",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Speed Duel GX: Duel Academy Box",
        "slug": "yugioh-speed-duel-gx-duel-academy-box",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Speed Duel GX: Duelists of Shadows",
        "slug": "yugioh-speed-duel-gx-duelists-of-shadows",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Speed Duel GX: Midterm Paradox",
        "slug": "yugioh-speed-duel-gx-midterm-paradox",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Speed Duel: Battle City Box",
        "slug": "yugioh-speed-duel-battle-city-box",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Speed Duel: Battle City Finals",
        "slug": "yugioh-speed-duel-battle-city-finals",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Speed Duel: Streets of Battle City",
        "slug": "yugioh-speed-duel-streets-of-battle-city",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Spell Ruler",
        "slug": "yugioh-spell-ruler",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Spell Ruler: 25th Anniversary",
        "slug": "yugioh-spell-ruler-25th-anniversary",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Stardust Overdrive",
        "slug": "yugioh-stardust-overdrive",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Starstrike Blast",
        "slug": "yugioh-starstrike-blast",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Starter Deck 2006",
        "slug": "yugioh-starter-deck-2006",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Starter Deck: Kaiba Reloaded",
        "slug": "yugioh-starter-deck-kaiba-reloaded",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Starter Deck: Pegasus",
        "slug": "yugioh-starter-deck-pegasus",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Starter Deck: Yugi Reloaded",
        "slug": "yugioh-starter-deck-yugi-reloaded",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Storm of Ragnarok",
        "slug": "yugioh-storm-of-ragnarok",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Strike of Neos",
        "slug": "yugioh-strike-of-neos",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Structure Deck: Blaze of Destruction",
        "slug": "yugioh-structure-deck-blaze-of-destruction",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Structure Deck: Blue Eyes White Destiny",
        "slug": "yugioh-structure-deck-blue-eyes-white-destiny",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Structure Deck: Dinosaur's Rage",
        "slug": "yugioh-structure-deck-dinosaur's-rage",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Structure Deck: Dragon's Roar",
        "slug": "yugioh-structure-deck-dragon's-roar",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Structure Deck: Dragons Collide",
        "slug": "yugioh-structure-deck-dragons-collide",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Structure Deck: Fury from the Deep",
        "slug": "yugioh-structure-deck-fury-from-the-deep",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Structure Deck: Invincible Fortress",
        "slug": "yugioh-structure-deck-invincible-fortress",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Structure Deck: Legend Of The Crystal Beasts",
        "slug": "yugioh-structure-deck-legend-of-the-crystal-beasts",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Structure Deck: Saga of Blue-Eyes White Dragon",
        "slug": "yugioh-structure-deck-saga-of-blue-eyes-white-dragon",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Structure Deck: Spellcaster's Judgment",
        "slug": "yugioh-structure-deck-spellcaster's-judgment",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Structure Deck: Warrior's Triumph",
        "slug": "yugioh-structure-deck-warrior's-triumph",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Structure Deck: Yugi Muto",
        "slug": "yugioh-structure-deck-yugi-muto",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Structure Deck: Zombie Madness",
        "slug": "yugioh-structure-deck-zombie-madness",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Structure Deck: Zombie World",
        "slug": "yugioh-structure-deck-zombie-world",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Supreme Darkness",
        "slug": "yugioh-supreme-darkness",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Tactical Evolution",
        "slug": "yugioh-tactical-evolution",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Tactical Masters",
        "slug": "yugioh-tactical-masters",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh The Dark Illusion",
        "slug": "yugioh-the-dark-illusion",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh The Dark Side of Dimensions Movie Pack",
        "slug": "yugioh-the-dark-side-of-dimensions-movie-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh The Dawn of Destiny",
        "slug": "yugioh-the-dawn-of-destiny",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh The Duelist Genesis",
        "slug": "yugioh-the-duelist-genesis",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh The Duelists of the Roses",
        "slug": "yugioh-the-duelists-of-the-roses",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh The Eternal Duelist Soul",
        "slug": "yugioh-the-eternal-duelist-soul",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh The Grand Creators",
        "slug": "yugioh-the-grand-creators",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh The Infinite Forbidden",
        "slug": "yugioh-the-infinite-forbidden",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh The Lost Millennium",
        "slug": "yugioh-the-lost-millennium",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh The New Challengers",
        "slug": "yugioh-the-new-challengers",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh The Sacred Cards",
        "slug": "yugioh-the-sacred-cards",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh The Shining Darkness",
        "slug": "yugioh-the-shining-darkness",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Toon Chaos",
        "slug": "yugioh-toon-chaos",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Ultimate Edition 2",
        "slug": "yugioh-ultimate-edition-2",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Valiant Smashers",
        "slug": "yugioh-valiant-smashers",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Wild Survivors",
        "slug": "yugioh-wild-survivors",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh World Championship 2025 Limited Pack",
        "slug": "yugioh-world-championship-2025-limited-pack",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Worldwide Edition: Stairway to the Destined Duel",
        "slug": "yugioh-worldwide-edition-stairway-to-the-destined-duel",
        "released": "2010-01-01"
      },
      {
        "name": "YuGiOh Yugi's Legendary Decks",
        "slug": "yugioh-yugi's-legendary-decks",
        "released": "2010-01-01"
      }
    ]
  },
  "onepiece": {
    "label": "One Piece",
    "color": "#e63946",
    "catUrl": "https://www.pricecharting.com/category/one-piece-cards",
    "sets": [
      {
        "name": "One Piece OP14",
        "slug": "one-piece-azure-sea's-seven",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece OP13",
        "slug": "one-piece-carrying-on-his-will",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece OP12",
        "slug": "one-piece-legacy-of-the-master",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese OP13",
        "slug": "one-piece-japanese-carrying-on-his-will",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece OP05",
        "slug": "one-piece-awakening-of-the-new-era",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece OP09",
        "slug": "one-piece-emperors-in-the-new-world",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece OP11",
        "slug": "one-piece-fist-of-divine-speed",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece OP01",
        "slug": "one-piece-romance-dawn",
        "released": "2010-01-01"
      },
      {
        "name": "Japanese One Piece P",
        "slug": "one-piece-japanese-promo",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese OP14",
        "slug": "one-piece-japanese-azure-sea's-seven",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece OP10",
        "slug": "one-piece-royal-blood",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Premium Booster Vol 2",
        "slug": "one-piece-premium-booster-2",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece OP07",
        "slug": "one-piece-500-years-in-the-future",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese PRB-02",
        "slug": "one-piece-japanese-premium-booster-2",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese EB03",
        "slug": "one-piece-japanese-extra-booster-heroines-edition",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Promotion",
        "slug": "one-piece-promo",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece OP08",
        "slug": "one-piece-two-legends",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece OP06",
        "slug": "one-piece-wings-of-the-captain",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece EB04",
        "slug": "one-piece-extra-booster-eb04",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese EB04",
        "slug": "one-piece-japanese-extra-booster-egghead-crisis",
        "released": "2010-01-01"
      },
      {
        "name": "Adventure on Kami's Island",
        "slug": "one-piece-adventure-on-kami's-island",
        "released": "2010-01-01"
      },
      {
        "name": "Japanese Adventure on Kami's Island",
        "slug": "one-piece-japanese-adventure-on-kami's-island",
        "released": "2010-01-01"
      },
      {
        "name": "Extra Booster Heroines Edition",
        "slug": "one-piece-extra-booster-heroines-edition",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Extra Booster Anime 25th Collection",
        "slug": "one-piece-extra-booster-anime-25th-collection",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Extra Booster Memorial Collection",
        "slug": "one-piece-extra-booster-memorial-collection",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese 500 Years in the Future",
        "slug": "one-piece-japanese-500-years-in-the-future",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Awakening of the New Era",
        "slug": "one-piece-japanese-awakening-of-the-new-era",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Emperors in the New World",
        "slug": "one-piece-japanese-emperors-in-the-new-world",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Extra Booster Anime 25th Collection",
        "slug": "one-piece-japanese-extra-booster-anime-25th-collection",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Extra Booster Memorial Collection",
        "slug": "one-piece-japanese-extra-booster-memorial-collection",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Fist of Divine Speed",
        "slug": "one-piece-japanese-fist-of-divine-speed",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Kingdoms of Intrigue",
        "slug": "one-piece-japanese-kingdoms-of-intrigue",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Legacy of the Master",
        "slug": "one-piece-japanese-legacy-of-the-master",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Paramount War",
        "slug": "one-piece-japanese-paramount-war",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Pillars of Strength",
        "slug": "one-piece-japanese-pillars-of-strength",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Premium Booster",
        "slug": "one-piece-japanese-premium-booster",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Romance Dawn",
        "slug": "one-piece-japanese-romance-dawn",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Royal Blood",
        "slug": "one-piece-japanese-royal-blood",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 11: Uta",
        "slug": "one-piece-japanese-starter-deck-11-uta",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 12",
        "slug": "one-piece-japanese-starter-deck-12",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 14: 3D2Y",
        "slug": "one-piece-japanese-starter-deck-14-3d2y",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 15: Edward Newgate",
        "slug": "one-piece-japanese-starter-deck-15-edward-newgate",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 16: Uta",
        "slug": "one-piece-japanese-starter-deck-16-uta",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 17: Donquixote Donflamingo",
        "slug": "one-piece-japanese-starter-deck-17-donquixote-donflamingo",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 18: Monkey.D.Luffy",
        "slug": "one-piece-japanese-starter-deck-18-monkeydluffy",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 19: Smoker",
        "slug": "one-piece-japanese-starter-deck-19-smoker",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 1: Straw Hat Crew",
        "slug": "one-piece-japanese-starter-deck-1-straw-hat-crew",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 20: Charlotte Katakuri",
        "slug": "one-piece-japanese-starter-deck-20-charlotte-katakuri",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 21: Gear5",
        "slug": "one-piece-japanese-starter-deck-21-gear5",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 22: Ace & Newgate",
        "slug": "one-piece-japanese-starter-deck-22-ace-&-newgate",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 23: Red Shanks",
        "slug": "one-piece-japanese-starter-deck-23-red-shanks",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 24: Green Jewelry Bonney",
        "slug": "one-piece-japanese-starter-deck-24-green-jewelry-bonney",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 25: Blue Buggy",
        "slug": "one-piece-japanese-starter-deck-25-blue-buggy",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 26: Purple Monkey.D.Luffy",
        "slug": "one-piece-japanese-starter-deck-26-purple-monkeydluffy",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 27: Black Marshall.D.Teach",
        "slug": "one-piece-japanese-starter-deck-27-black-marshalldteach",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 28: Yellow Yamato",
        "slug": "one-piece-japanese-starter-deck-28-yellow-yamato",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 29: Egghead Arc",
        "slug": "one-piece-japanese-starter-deck-29-egghead-arc",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 2: Worst Generation",
        "slug": "one-piece-japanese-starter-deck-2-worst-generation",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 3: The Seven Warlords of the Sea",
        "slug": "one-piece-japanese-starter-deck-3-the-seven-warlords-of-the-sea",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 4: Animal Kingdom Pirates",
        "slug": "one-piece-japanese-starter-deck-4-animal-kingdom-pirates",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 5: Film Edition",
        "slug": "one-piece-japanese-starter-deck-5-film-edition",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 6: Absolute Justice",
        "slug": "one-piece-japanese-starter-deck-6-absolute-justice",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 7: Big Mom Pirates",
        "slug": "one-piece-japanese-starter-deck-7-big-mom-pirates",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 8: Monkey.D.Luffy",
        "slug": "one-piece-japanese-starter-deck-8-monkeydluffy",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Starter Deck 9: Yamato",
        "slug": "one-piece-japanese-starter-deck-9-yamato",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Two Legends",
        "slug": "one-piece-japanese-two-legends",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Ultra Deck: The Three Brothers",
        "slug": "one-piece-japanese-ultra-deck-the-three-brothers",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Ultra Deck: The Three Captains",
        "slug": "one-piece-japanese-ultra-deck-the-three-captains",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Japanese Wings of the Captain",
        "slug": "one-piece-japanese-wings-of-the-captain",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Kingdoms of Intrigue",
        "slug": "one-piece-kingdoms-of-intrigue",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Learn Together Deck Set",
        "slug": "one-piece-learn-together-deck-set",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Paramount War",
        "slug": "one-piece-paramount-war",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Passage to the Grand Line",
        "slug": "one-piece-passage-to-the-grand-line",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Pillars of Strength",
        "slug": "one-piece-pillars-of-strength",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Premium Booster",
        "slug": "one-piece-premium-booster",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Seven Warlords of the Sea Binder Set",
        "slug": "one-piece-seven-warlords-of-the-sea-binder-set",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 11: Uta",
        "slug": "one-piece-starter-deck-11-uta",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 12",
        "slug": "one-piece-starter-deck-12",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 14: 3D2Y",
        "slug": "one-piece-starter-deck-14-3d2y",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 15: Edward Newgate",
        "slug": "one-piece-starter-deck-15-edward-newgate",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 16: Uta",
        "slug": "one-piece-starter-deck-16-uta",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 17: Donquixote Donflamingo",
        "slug": "one-piece-starter-deck-17-donquixote-donflamingo",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 18: Monkey.D.Luffy",
        "slug": "one-piece-starter-deck-18-monkeydluffy",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 19: Smoker",
        "slug": "one-piece-starter-deck-19-smoker",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 1: Straw Hat Crew",
        "slug": "one-piece-starter-deck-1-straw-hat-crew",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 20: Charlotte Katakuri",
        "slug": "one-piece-starter-deck-20-charlotte-katakuri",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 21: Gear5",
        "slug": "one-piece-starter-deck-21-gear5",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 22: Ace & Newgate",
        "slug": "one-piece-starter-deck-22-ace-&-newgate",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 23: Red Shanks",
        "slug": "one-piece-starter-deck-23-red-shanks",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 24: Green Jewelry Bonney",
        "slug": "one-piece-starter-deck-24-green-jewelry-bonney",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 25: Blue Buggy",
        "slug": "one-piece-starter-deck-25-blue-buggy",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 26: Purple Monkey.D.Luffy",
        "slug": "one-piece-starter-deck-26-purple-monkeydluffy",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 27: Black Marshall.D.Teach",
        "slug": "one-piece-starter-deck-27-black-marshalldteach",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 28: Yellow Yamato",
        "slug": "one-piece-starter-deck-28-yellow-yamato",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 29: Egghead",
        "slug": "one-piece-starter-deck-29-egghead",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 2: Worst Generation",
        "slug": "one-piece-starter-deck-2-worst-generation",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 3: The Seven Warlords of the Sea",
        "slug": "one-piece-starter-deck-3-the-seven-warlords-of-the-sea",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 4: Animal Kingdom Pirates",
        "slug": "one-piece-starter-deck-4-animal-kingdom-pirates",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 5: Film Edition",
        "slug": "one-piece-starter-deck-5-film-edition",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 6: Absolute Justice",
        "slug": "one-piece-starter-deck-6-absolute-justice",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 7: Big Mom Pirates",
        "slug": "one-piece-starter-deck-7-big-mom-pirates",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 8: Monkey.D.Luffy",
        "slug": "one-piece-starter-deck-8-monkeydluffy",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Starter Deck 9: Yamato",
        "slug": "one-piece-starter-deck-9-yamato",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece The Quest Begins",
        "slug": "one-piece-the-quest-begins",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Tin Pack Set Vol 1",
        "slug": "one-piece-tin-pack-set-vol-1",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Ultra Deck: The Three Brothers",
        "slug": "one-piece-ultra-deck-the-three-brothers",
        "released": "2010-01-01"
      },
      {
        "name": "One Piece Ultra Deck: The Three Captains",
        "slug": "one-piece-ultra-deck-the-three-captains",
        "released": "2010-01-01"
      }
    ]
  },
  "lorcana": {
    "label": "Disney Lorcana",
    "color": "#5b8dee",
    "catUrl": "https://www.pricecharting.com/category/lorcana-cards",
    "sets": [
      {
        "name": "Lorcana Fabled",
        "slug": "lorcana-fabled",
        "released": "2010-01-01"
      },
      {
        "name": "Lorcana First Chapter",
        "slug": "lorcana-first-chapter",
        "released": "2010-01-01"
      },
      {
        "name": "Lorcana Whispers in the Well",
        "slug": "lorcana-whispers-in-the-well",
        "released": "2010-01-01"
      },
      {
        "name": "Lorcana Promo",
        "slug": "lorcana-promo",
        "released": "2010-01-01"
      },
      {
        "name": "Lorcana Reign of Jafar",
        "slug": "lorcana-reign-of-jafar",
        "released": "2010-01-01"
      },
      {
        "name": "Lorcana Archazia's Island",
        "slug": "lorcana-archazia's-island",
        "released": "2010-01-01"
      },
      {
        "name": "Lorcana Rise of the Floodborn",
        "slug": "lorcana-rise-of-the-floodborn",
        "released": "2010-01-01"
      },
      {
        "name": "Lorcana Azurite Sea",
        "slug": "lorcana-azurite-sea",
        "released": "2010-01-01"
      },
      {
        "name": "Lorcana Shimmering Skies",
        "slug": "lorcana-shimmering-skies",
        "released": "2010-01-01"
      },
      {
        "name": "Lorcana Into the Inklands",
        "slug": "lorcana-into-the-inklands",
        "released": "2010-01-01"
      },
      {
        "name": "Winterspell",
        "slug": "lorcana-winterspell",
        "released": "2010-01-01"
      },
      {
        "name": "Lorcana Ursula's Return",
        "slug": "lorcana-ursula's-return",
        "released": "2010-01-01"
      }
    ]
  },
  "digimon": {
    "label": "Digimon",
    "color": "#3a86ff",
    "catUrl": "https://www.pricecharting.com/category/digimon-cards",
    "sets": [
      {
        "name": "Digimon Promo",
        "slug": "digimon-promotion",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon EX11",
        "slug": "digimon-dawn-of-liberator",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon EX10",
        "slug": "digimon-sinister-order",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon BT21",
        "slug": "digimon-world-convergence",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon EX7",
        "slug": "digimon-liberator",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon BT22",
        "slug": "digimon-cyber-eden",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon BT19",
        "slug": "digimon-special-booster-25",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon BT12",
        "slug": "digimon-across-time",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon BT17",
        "slug": "digimon-secret-crisis",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon EX8",
        "slug": "digimon-chain-of-liberation",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon BT15",
        "slug": "digimon-exceed-apocalypse",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon BT8",
        "slug": "digimon-new-awakening",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon BT14",
        "slug": "digimon-blast-ace",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon EX9",
        "slug": "digimon-versus-monsters",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon EX6",
        "slug": "digimon-infernal-ascension",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon BT16",
        "slug": "digimon-beginning-observer",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon BT11",
        "slug": "digimon-dimensional-phase",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon BT7",
        "slug": "digimon-next-adventure",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon EX1",
        "slug": "digimon-classic-collection",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon BT13",
        "slug": "digimon-versus-royal-knights",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon 1999 Upper Deck Exclusive Preview",
        "slug": "digimon-1999-upper-deck-exclusive-preview",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Alternative Being",
        "slug": "digimon-alternative-being",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Animal Colosseum",
        "slug": "digimon-animal-colosseum",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Battle of Omni",
        "slug": "digimon-battle-of-omni",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon CCG",
        "slug": "digimon-ccg",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Digital Hazard",
        "slug": "digimon-digital-hazard",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Double Diamond",
        "slug": "digimon-double-diamond",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Draconic Roar",
        "slug": "digimon-draconic-roar",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Elemental Successor",
        "slug": "digimon-elemental-successor",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Great Legend",
        "slug": "digimon-great-legend",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon New Evolution",
        "slug": "digimon-new-evolution",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Over the X",
        "slug": "digimon-over-the-x",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Resurgence Booster 1",
        "slug": "digimon-resurgence-booster-1",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Revision Pack",
        "slug": "digimon-revision-pack",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Special Release Ver 1.5",
        "slug": "digimon-special-release-ver-15",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 01: Gaia Red",
        "slug": "digimon-starter-deck-01-gaia-red",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 02: Cocytus Blue",
        "slug": "digimon-starter-deck-02-cocytus-blue",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 03: Heaven's Yellow",
        "slug": "digimon-starter-deck-03-heaven's-yellow",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 04: Giga Green",
        "slug": "digimon-starter-deck-04-giga-green",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 05: Machine Black",
        "slug": "digimon-starter-deck-05-machine-black",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 06: Venomous Violet",
        "slug": "digimon-starter-deck-06-venomous-violet",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 07: Gallantmon",
        "slug": "digimon-starter-deck-07-gallantmon",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 08: Ulforce Veedramon",
        "slug": "digimon-starter-deck-08-ulforce-veedramon",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 09: Ultimate Ancient Dragon",
        "slug": "digimon-starter-deck-09-ultimate-ancient-dragon",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 10: Parallel World Tacticia",
        "slug": "digimon-starter-deck-10-parallel-world-tacticia",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 12: Jesmon",
        "slug": "digimon-starter-deck-12-jesmon",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 13: Ragnaloardmon",
        "slug": "digimon-starter-deck-13-ragnaloardmon",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 14: Beelzemon Advanced",
        "slug": "digimon-starter-deck-14-beelzemon-advanced",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 15: Dragon of Courage",
        "slug": "digimon-starter-deck-15-dragon-of-courage",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 16: Wolf of Friendship",
        "slug": "digimon-starter-deck-16-wolf-of-friendship",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 17: Double Typhoon Advanced",
        "slug": "digimon-starter-deck-17-double-typhoon-advanced",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 18: Guardian Vortex",
        "slug": "digimon-starter-deck-18-guardian-vortex",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 19: Fable Waltz",
        "slug": "digimon-starter-deck-19-fable-waltz",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 20: Protector of Light",
        "slug": "digimon-starter-deck-20-protector-of-light",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Starter Deck 21: Hero of Hope",
        "slug": "digimon-starter-deck-21-hero-of-hope",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Ultimate Power",
        "slug": "digimon-ultimate-power",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon X Record",
        "slug": "digimon-x-record",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Xros Encounter",
        "slug": "digimon-xros-encounter",
        "released": "2010-01-01"
      },
      {
        "name": "Digimon Xros Evolution",
        "slug": "digimon-xros-evolution",
        "released": "2010-01-01"
      }
    ]
  },
  "dragonball": {
    "label": "Dragon Ball Super",
    "color": "#f77f00",
    "catUrl": "https://www.pricecharting.com/category/dragon-ball-cards",
    "sets": [
      {
        "name": "Dragon Ball FB04",
        "slug": "dragon-ball-fusion-world-ultra-limit",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball FB07",
        "slug": "dragon-ball-super-wish-for-shenron",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball SB02",
        "slug": "dragon-ball-fusion-world-manga-booster-02",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball FB08",
        "slug": "dragon-ball-fusion-world-saiyan's-pride",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball SB01",
        "slug": "dragon-ball-fusion-world-manga-booster-01",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball BT29",
        "slug": "dragon-ball-super-fearsome-rivals",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball FB02",
        "slug": "dragon-ball-fusion-world-blazing-aura",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball FB01",
        "slug": "dragon-ball-fusion-world-awakened-pulse",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball FB03",
        "slug": "dragon-ball-fusion-world-raging-roar",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball FB05",
        "slug": "dragon-ball-fusion-world-new-adventure",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super BT28",
        "slug": "dragon-ball-super-prismatic-clash",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super FB06",
        "slug": "dragon-ball-super-rivals-clash",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Promo",
        "slug": "dragon-ball-fusion-world-promos",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super BT27",
        "slug": "dragon-ball-super-history-of-z",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super BT23",
        "slug": "dragon-ball-super-perfect-combination",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super BT26",
        "slug": "dragon-ball-super-ultimate-advent",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super BT20",
        "slug": "dragon-ball-super-power-absorbed",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super BT22",
        "slug": "dragon-ball-super-critical-blow",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super BT24",
        "slug": "dragon-ball-super-beyond-generations",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super DB2P",
        "slug": "dragon-ball-super-divine-multiverse-release-promos",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Dual Evolution",
        "slug": "dragon-ball-fusion-world-dual-evolution",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Energy Markers",
        "slug": "dragon-ball-fusion-world-energy-markers",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Judge Promo",
        "slug": "dragon-ball-fusion-world-judge-promo",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Raging Roar Promo",
        "slug": "dragon-ball-fusion-world-raging-roar-promo",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Special Tournament Promo",
        "slug": "dragon-ball-fusion-world-special-tournament-promo",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Bardock",
        "slug": "dragon-ball-fusion-world-starter-deck-bardock",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Broly",
        "slug": "dragon-ball-fusion-world-starter-deck-broly",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Frieza",
        "slug": "dragon-ball-fusion-world-starter-deck-frieza",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Giblet",
        "slug": "dragon-ball-fusion-world-starter-deck-giblet",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Shallot",
        "slug": "dragon-ball-fusion-world-starter-deck-shallot",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Son Goku",
        "slug": "dragon-ball-fusion-world-starter-deck-son-goku",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Son Goku Mini",
        "slug": "dragon-ball-fusion-world-starter-deck-son-goku-mini",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Vegeta",
        "slug": "dragon-ball-fusion-world-starter-deck-vegeta",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Vegeta Mini",
        "slug": "dragon-ball-fusion-world-starter-deck-vegeta-mini",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Vegeta Mini Super Saiyan 3",
        "slug": "dragon-ball-fusion-world-starter-deck-vegeta-mini-super-saiyan-3",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Fusion World Unnumbered Promo",
        "slug": "dragon-ball-fusion-world-unnumbered-promo",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Assault of the Saiyans",
        "slug": "dragon-ball-super-assault-of-the-saiyans",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Battle Evolution Booster",
        "slug": "dragon-ball-super-battle-evolution-booster",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Clash of Fates",
        "slug": "dragon-ball-super-clash-of-fates",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Collector's Selection Vol.1",
        "slug": "dragon-ball-super-collector's-selection-vol1",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Collector's Selection Vol.2",
        "slug": "dragon-ball-super-collector's-selection-vol2",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Collector's Selection Vol.3",
        "slug": "dragon-ball-super-collector's-selection-vol3",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Colossal Warfare",
        "slug": "dragon-ball-super-colossal-warfare",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Cross Spirits",
        "slug": "dragon-ball-super-cross-spirits",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Cross Worlds",
        "slug": "dragon-ball-super-cross-worlds",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Dawn of the Z-Legends",
        "slug": "dragon-ball-super-dawn-of-the-z-legends",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Destroyer Kings",
        "slug": "dragon-ball-super-destroyer-kings",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Divine Multiverse",
        "slug": "dragon-ball-super-divine-multiverse",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Dragon Brawl",
        "slug": "dragon-ball-super-dragon-brawl",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Dragon Brawl Release Promos",
        "slug": "dragon-ball-super-dragon-brawl-release-promos",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: 5th Anniversary Set",
        "slug": "dragon-ball-super-expansion-set-5th-anniversary-set",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Battle Advanced",
        "slug": "dragon-ball-super-expansion-set-battle-advanced",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Battle Enhanced",
        "slug": "dragon-ball-super-expansion-set-battle-enhanced",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Dark Demon's Villains",
        "slug": "dragon-ball-super-expansion-set-dark-demon's-villains",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Mighty Heroes",
        "slug": "dragon-ball-super-expansion-set-mighty-heroes",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Namekian Boost",
        "slug": "dragon-ball-super-expansion-set-namekian-boost",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Namekian Surge",
        "slug": "dragon-ball-super-expansion-set-namekian-surge",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Saiyan Boost",
        "slug": "dragon-ball-super-expansion-set-saiyan-boost",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Saiyan Surge",
        "slug": "dragon-ball-super-expansion-set-saiyan-surge",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Special Anniversary Box",
        "slug": "dragon-ball-super-expansion-set-special-anniversary-box",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Special Anniversary Box 2020",
        "slug": "dragon-ball-super-expansion-set-special-anniversary-box-2020",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Special Anniversary Box 2021",
        "slug": "dragon-ball-super-expansion-set-special-anniversary-box-2021",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Ultimate Box",
        "slug": "dragon-ball-super-expansion-set-ultimate-box",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Ultimate Deck",
        "slug": "dragon-ball-super-expansion-set-ultimate-deck",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Ultimate Deck 2022",
        "slug": "dragon-ball-super-expansion-set-ultimate-deck-2022",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Ultimate Deck 2023",
        "slug": "dragon-ball-super-expansion-set-ultimate-deck-2023",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Unity of Destruction",
        "slug": "dragon-ball-super-expansion-set-unity-of-destruction",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Unity of Saiyans",
        "slug": "dragon-ball-super-expansion-set-unity-of-saiyans",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Universe 11 Unison",
        "slug": "dragon-ball-super-expansion-set-universe-11-unison",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Universe 7 Unison",
        "slug": "dragon-ball-super-expansion-set-universe-7-unison",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expert Deck: Android Duality",
        "slug": "dragon-ball-super-expert-deck-android-duality",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expert Deck: The Ultimate Life Form",
        "slug": "dragon-ball-super-expert-deck-the-ultimate-life-form",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Expert Deck: Universe 6 Assailants",
        "slug": "dragon-ball-super-expert-deck-universe-6-assailants",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Fighter's Ambition",
        "slug": "dragon-ball-super-fighter's-ambition",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Galactic Battle",
        "slug": "dragon-ball-super-galactic-battle",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Giant Force",
        "slug": "dragon-ball-super-giant-force",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Judge Promotion",
        "slug": "dragon-ball-super-judge-promotion",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Legend of the Dragon Balls",
        "slug": "dragon-ball-super-legend-of-the-dragon-balls",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Magnificent Collection Forsaken Warrior",
        "slug": "dragon-ball-super-magnificent-collection-forsaken-warrior",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Magnificent Collection Fusion Hero",
        "slug": "dragon-ball-super-magnificent-collection-fusion-hero",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Malicious Machinations",
        "slug": "dragon-ball-super-malicious-machinations",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Malicious Machinations: Pre-Release Promos",
        "slug": "dragon-ball-super-malicious-machinations-pre-release-promos",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Miraculous Revival",
        "slug": "dragon-ball-super-miraculous-revival",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Mythic Booster",
        "slug": "dragon-ball-super-mythic-booster",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Premium Anniversary Box 2023",
        "slug": "dragon-ball-super-premium-anniversary-box-2023",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Premium Anniversary Box 2024",
        "slug": "dragon-ball-super-premium-anniversary-box-2024",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Premium Anniversary Box 2025",
        "slug": "dragon-ball-super-premium-anniversary-box-2025",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Promos: Blazing Aura [Fusion World]",
        "slug": "dragon-ball-super-promos-blazing-aura-fusion-world",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Realm of the Gods",
        "slug": "dragon-ball-super-realm-of-the-gods",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Rise of the Unison Warrior",
        "slug": "dragon-ball-super-rise-of-the-unison-warrior",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Rise of the Unison Warrior: Pre-Release Promos",
        "slug": "dragon-ball-super-rise-of-the-unison-warrior-pre-release-promos",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Saiyan Showdown",
        "slug": "dragon-ball-super-saiyan-showdown",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Series 6 Pre-Release Promos",
        "slug": "dragon-ball-super-series-6-pre-release-promos",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Series 7 Pre-Release Promos",
        "slug": "dragon-ball-super-series-7-pre-release-promos",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Blue Future",
        "slug": "dragon-ball-super-starter-deck-blue-future",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Clan Collusion",
        "slug": "dragon-ball-super-starter-deck-clan-collusion",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Darkness Reborn",
        "slug": "dragon-ball-super-starter-deck-darkness-reborn",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Final Radiance",
        "slug": "dragon-ball-super-starter-deck-final-radiance",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Green Fusion",
        "slug": "dragon-ball-super-starter-deck-green-fusion",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Instinct Surpassed",
        "slug": "dragon-ball-super-starter-deck-instinct-surpassed",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Parasitic Overlord",
        "slug": "dragon-ball-super-starter-deck-parasitic-overlord",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Pride of the Saiyans",
        "slug": "dragon-ball-super-starter-deck-pride-of-the-saiyans",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Proud Warrior",
        "slug": "dragon-ball-super-starter-deck-proud-warrior",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Red Rage",
        "slug": "dragon-ball-super-starter-deck-red-rage",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Resurrected Fusion",
        "slug": "dragon-ball-super-starter-deck-resurrected-fusion",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Rising Broly",
        "slug": "dragon-ball-super-starter-deck-rising-broly",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Saiyan Legacy",
        "slug": "dragon-ball-super-starter-deck-saiyan-legacy",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Saiyan Wonder",
        "slug": "dragon-ball-super-starter-deck-saiyan-wonder",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Shenron's Advent",
        "slug": "dragon-ball-super-starter-deck-shenron's-advent",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Spirit of Potara",
        "slug": "dragon-ball-super-starter-deck-spirit-of-potara",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: The Crimson Saiyan",
        "slug": "dragon-ball-super-starter-deck-the-crimson-saiyan",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: The Dark Invasion",
        "slug": "dragon-ball-super-starter-deck-the-dark-invasion",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: The Extreme Evolution",
        "slug": "dragon-ball-super-starter-deck-the-extreme-evolution",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: The Guardians of Namekians",
        "slug": "dragon-ball-super-starter-deck-the-guardians-of-namekians",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Ultimate Awakened Power",
        "slug": "dragon-ball-super-starter-deck-ultimate-awakened-power",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Yellow Transformation",
        "slug": "dragon-ball-super-starter-deck-yellow-transformation",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Supreme Rivalry",
        "slug": "dragon-ball-super-supreme-rivalry",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super The Tournament of Power",
        "slug": "dragon-ball-super-the-tournament-of-power",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Theme Selection: History of Son Goku",
        "slug": "dragon-ball-super-theme-selection-history-of-son-goku",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Theme Selection: History of Vegeta",
        "slug": "dragon-ball-super-theme-selection-history-of-vegeta",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Ultimate Squad",
        "slug": "dragon-ball-super-ultimate-squad",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Union Force",
        "slug": "dragon-ball-super-union-force",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Universal Onslaught",
        "slug": "dragon-ball-super-universal-onslaught",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Universal Onslaught: Pre-Release Promos",
        "slug": "dragon-ball-super-universal-onslaught-pre-release-promos",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Vault Power Up Pack",
        "slug": "dragon-ball-super-vault-power-up-pack",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Vault Power Up Pack 2020",
        "slug": "dragon-ball-super-vault-power-up-pack-2020",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Vault Power Up Pack 2021",
        "slug": "dragon-ball-super-vault-power-up-pack-2021",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Vermilion Bloodline",
        "slug": "dragon-ball-super-vermilion-bloodline",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Vicious Rejuvenation",
        "slug": "dragon-ball-super-vicious-rejuvenation",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super Wild Resurgence",
        "slug": "dragon-ball-super-wild-resurgence",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Super World Martial Arts Tournament",
        "slug": "dragon-ball-super-world-martial-arts-tournament",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Android Saga",
        "slug": "dragon-ball-z-android-saga",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Awakening",
        "slug": "dragon-ball-z-awakening",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Babidi Saga",
        "slug": "dragon-ball-z-babidi-saga",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Baby Saga",
        "slug": "dragon-ball-z-baby-saga",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Buu Saga",
        "slug": "dragon-ball-z-buu-saga",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Cell Games Saga",
        "slug": "dragon-ball-z-cell-games-saga",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Cell Saga",
        "slug": "dragon-ball-z-cell-saga",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Evolution",
        "slug": "dragon-ball-z-evolution",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Frieza Saga",
        "slug": "dragon-ball-z-frieza-saga",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Fusion Saga",
        "slug": "dragon-ball-z-fusion-saga",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Heroes and Villians",
        "slug": "dragon-ball-z-heroes-and-villians",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z JPP/Amada Series 1",
        "slug": "dragon-ball-z-jppamada-series-1",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z JPP/Amada Series 2",
        "slug": "dragon-ball-z-jppamada-series-2",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Kid Buu Saga",
        "slug": "dragon-ball-z-kid-buu-saga",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Movie Collection",
        "slug": "dragon-ball-z-movie-collection",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Organized Play Promo",
        "slug": "dragon-ball-z-organized-play-promo",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Perfection",
        "slug": "dragon-ball-z-perfection",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Premier Set",
        "slug": "dragon-ball-z-premier-set",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Saiyan Saga",
        "slug": "dragon-ball-z-saiyan-saga",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Super 17 Saga",
        "slug": "dragon-ball-z-super-17-saga",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Trunks Saga",
        "slug": "dragon-ball-z-trunks-saga",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z Vengeance",
        "slug": "dragon-ball-z-vengeance",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z World Games Saga",
        "slug": "dragon-ball-z-world-games-saga",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z World Games Saga 2002",
        "slug": "dragon-ball-z-world-games-saga-2002",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z World Games Saga 2002 Babadi Preview",
        "slug": "dragon-ball-z-world-games-saga-2002-babadi-preview",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z World Games Saga 2002 Battle Simulator",
        "slug": "dragon-ball-z-world-games-saga-2002-battle-simulator",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z World Games Saga 2002 Collector's Club",
        "slug": "dragon-ball-z-world-games-saga-2002-collector's-club",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z World Games Saga 2002 Scoring Zone",
        "slug": "dragon-ball-z-world-games-saga-2002-scoring-zone",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z: Arrival",
        "slug": "dragon-ball-z-arrival",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z: Revelation",
        "slug": "dragon-ball-z-revelation",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z: Showdown",
        "slug": "dragon-ball-z-showdown",
        "released": "2010-01-01"
      },
      {
        "name": "Dragon Ball Z: Transformation",
        "slug": "dragon-ball-z-transformation",
        "released": "2010-01-01"
      }
    ]
  },
  "gundam": {
    "label": "Gundam Card Game",
    "color": "#e63f3f",
    "catUrl": "https://www.pricecharting.com/category/other-tcg-cards",
    "sets": [
      {
        "name": "Gundam GD01",
        "slug": "gundam-newtype-rising",
        "released": "2010-01-01"
      },
      {
        "name": "Gundam GD03",
        "slug": "gundam-steel-requiem",
        "released": "2010-01-01"
      },
      {
        "name": "Gundam GD02",
        "slug": "gundam-dual-impact",
        "released": "2010-01-01"
      },
      {
        "name": "Gundam Beta",
        "slug": "gundam-edition-beta",
        "released": "2010-01-01"
      },
      {
        "name": "Gundam Starter Deck 09: Destiny Ignition",
        "slug": "gundam-starter-deck-09-destiny-ignition",
        "released": "2010-01-01"
      },
      {
        "name": "Gundam Celestial Drive",
        "slug": "gundam-celestial-drive",
        "released": "2010-01-01"
      },
      {
        "name": "Gundam EX Resource Token Promo",
        "slug": "gundam-ex-resource-token-promo",
        "released": "2010-01-01"
      },
      {
        "name": "Gundam Promo",
        "slug": "gundam-promo",
        "released": "2010-01-01"
      },
      {
        "name": "Gundam Starter Deck 01: Heroic Beginnings",
        "slug": "gundam-starter-deck-01-heroic-beginnings",
        "released": "2010-01-01"
      },
      {
        "name": "Gundam Starter Deck 02: Wings of Advance",
        "slug": "gundam-starter-deck-02-wings-of-advance",
        "released": "2010-01-01"
      },
      {
        "name": "Gundam Starter Deck 03: Zeon's Rush",
        "slug": "gundam-starter-deck-03-zeon's-rush",
        "released": "2010-01-01"
      },
      {
        "name": "Gundam Starter Deck 04: SEED Strike",
        "slug": "gundam-starter-deck-04-seed-strike",
        "released": "2010-01-01"
      },
      {
        "name": "Gundam Starter Deck 05: Iron Bloom",
        "slug": "gundam-starter-deck-05-iron-bloom",
        "released": "2010-01-01"
      },
      {
        "name": "Gundam Starter Deck 06: Clan Unity",
        "slug": "gundam-starter-deck-06-clan-unity",
        "released": "2010-01-01"
      },
      {
        "name": "Gundam Starter Deck 08: Flash of Radiance",
        "slug": "gundam-starter-deck-08-flash-of-radiance",
        "released": "2010-01-01"
      }
    ]
  },
  "swu": {
    "label": "Star Wars Unlimited",
    "color": "#ffe81f",
    "catUrl": "https://www.pricecharting.com/category/star-wars-cards",
    "sets": [
      {
        "name": "Star Wars Unlimited JTL",
        "slug": "star-wars-unlimited-jump-to-lightspeed",
        "released": "2010-01-01"
      },
      {
        "name": "Star Wars Unlimited: SOR",
        "slug": "star-wars-unlimited-spark-of-rebellion",
        "released": "2010-01-01"
      },
      {
        "name": "Star Wars Unlimited: SEC",
        "slug": "star-wars-unlimited-secrets-of-power",
        "released": "2010-01-01"
      },
      {
        "name": "Star Wars Unlimited: SHD",
        "slug": "star-wars-unlimited-shadows-of-the-galaxy",
        "released": "2010-01-01"
      },
      {
        "name": "Star Wars Unlimited: Lawless Time",
        "slug": "star-wars-unlimited-lawless-time",
        "released": "2010-01-01"
      },
      {
        "name": "Star Wars Unlimited: Legends of the Force",
        "slug": "star-wars-unlimited-legends-of-the-force",
        "released": "2010-01-01"
      },
      {
        "name": "Star Wars Unlimited: Twilight of the Republic",
        "slug": "star-wars-unlimited-twilight-of-the-republic",
        "released": "2010-01-01"
      }
    ]
  },
  "riftbound": {
    "label": "Riftbound",
    "color": "#00d4aa",
    "catUrl": "https://www.pricecharting.com/category/other-tcg-cards",
    "sets": [
      {
        "name": "Riftbound Origins",
        "slug": "riftbound-origins",
        "released": "2010-01-01"
      },
      {
        "name": "Riftbound Origins: Proving Grounds",
        "slug": "riftbound-origins-proving-grounds",
        "released": "2010-01-01"
      },
      {
        "name": "Riftbound Spiritforged",
        "slug": "riftbound-spiritforged",
        "released": "2010-01-01"
      },
      {
        "name": "Riftbound Promo",
        "slug": "riftbound-promo",
        "released": "2010-01-01"
      }
    ]
  }
};

// ── Hourly Set Cache ──────────────────────────────────────────────────────
// Refreshes all game category pages every hour to pick up new sets
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
let setsCache = {}; // key: game key → { sets, fetchedAt }
let tcgGamesSetCache = null; // { games, fetchedAt } — cached TCGPlayer games/sets to avoid launching Puppeteer on every request

function htmlDecode(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#\d+;/g, '');
}

const CONSOLE_NOISE = new Set([
  'nes','super-nintendo','nintendo-64','gamecube','wii','wii-u','nintendo-switch',
  'nintendo-switch-2','gameboy','gameboy-color','gameboy-advance','nintendo-ds',
  'nintendo-3ds','virtual-boy','game-&-watch','famicom','super-famicom',
  'jp-nintendo-64','jp-gamecube','jp-wii','jp-wii-u','jp-nintendo-switch',
  'jp-nintendo-switch-2','jp-gameboy','jp-gameboy-color','jp-gameboy-advance',
  'jp-nintendo-ds','jp-nintendo-3ds','jp-virtual-boy','atari-2600','atari-5200',
  'atari-7800','atari-400','atari-lynx','jaguar','neo-geo-mvs','neo-geo-aes',
  'neo-geo-cd','neo-geo-pocket-color','playstation','playstation-2','playstation-3',
  'playstation-4','playstation-5','psp','playstation-vita','sega-master-system',
  'sega-genesis','sega-cd','sega-32x','sega-saturn','sega-dreamcast','sega-game-gear',
  'sega-pico','xbox','xbox-360','xbox-one','xbox-series-x','amiibo','skylanders',
  'disney-infinity','lego-dimensions','starlink','strategy-guide','nintendo-power','amiibo-cards',
]);

const SLUG_PREFIXES = {
  pokemon:    'pokemon',
  mtg:        'magic',
  yugioh:     'yugioh',
  onepiece:   'one-piece',
  lorcana:    'lorcana',
  digimon:    'digimon',
  dragonball: 'dragon-ball',
  gundam:     'gundam',
  swu:        'star-wars-unlimited',
  riftbound:  'riftbound',
};

// ── HTTP Helpers ──────────────────────────────────────────────────────────
function httpGet(urlStr) {
  return new Promise((resolve, reject) => {
    // Add throttle delay before request
    const delay = 500 + Math.random() * 1000; // 500-1500ms random throttle
    setTimeout(() => {
      const opts = { timeout: 30000 };
      https.get(urlStr, opts, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    }, delay);
  });
}

function httpPost(urlStr, postData) {
  return new Promise((resolve, reject) => {
    // Add throttle delay before request
    const delay = 500 + Math.random() * 1000; // 500-1500ms random throttle
    setTimeout(() => {
      const parsedUrl = new URL(urlStr);
      const body = new URLSearchParams(postData).toString();
      const opts = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 30000,
      };
      https.request(opts, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject).end(body);
    }, delay);
  });
}

// ── Scrape live sets from a category page ──────────────────────────────────
async function scrapeSetsFromCategory(gameKey) {
  const gd = GAME_DATA[gameKey];
  if (!gd) return GAME_DATA[gameKey]?.sets || [];

  const prefix = SLUG_PREFIXES[gameKey];
  try {
    const html = await httpGet(gd.catUrl);
    const linkRegex = /href="\/console\/([^"#?]+)"[^>]*>\s*([^<\n]+?)\s*<\/a>/g;
    const seen = new Map();
    let m;
    while ((m = linkRegex.exec(html)) !== null) {
      let slug = htmlDecode(m[1]).replace(/%27/g,"'").replace(/%26/g,'&').replace(/%3A/g,':').replace(/%2F/g,'/');
      slug = decodeURIComponent(slug.replace(/%(?![0-9a-fA-F]{2})/g, '%25'));
      if (CONSOLE_NOISE.has(slug)) continue;
      if (prefix && !slug.startsWith(prefix)) continue;
      const name = htmlDecode(m[2].replace(/\s+/g,' ').trim());
      if (!name || name.length < 2) continue;
      if (!seen.has(slug)) seen.set(slug, name);
    }
    const sets = [...seen.entries()].map(([slug, name]) => ({ name, slug }));
    if (sets.length > 0) return sets;
  } catch (e) {
  }
  // Fall back to bundled data
  return gd.sets || [];
}

async function initSetsCache() {
  for (const gameKey of Object.keys(GAME_DATA)) {
    try {
      const sets = await scrapeSetsFromCategory(gameKey);
      setsCache[gameKey] = { sets, fetchedAt: Date.now() };
    } catch (e) {
      setsCache[gameKey] = { sets: GAME_DATA[gameKey]?.sets || [], fetchedAt: Date.now() };
    }
    await new Promise(r => setTimeout(r, 400));
  }
  scheduleHourlyRefresh();
}

function scheduleHourlyRefresh() {
  setInterval(async () => {
    for (const gameKey of Object.keys(GAME_DATA)) {
      try {
        const sets = await scrapeSetsFromCategory(gameKey);
        setsCache[gameKey] = { sets, fetchedAt: Date.now() };
      } catch (e) {
      }
      await new Promise(r => setTimeout(r, 400));
    }
  }, CACHE_TTL_MS);
}

function getGameSets(gameKey) {
  if (setsCache[gameKey]?.sets?.length > 0) return setsCache[gameKey].sets;
  return GAME_DATA[gameKey]?.sets || [];
}

// ── Sealed product detection ─────────────────────────────────────────────
const SEALED_RE = /\b(booster\s+box|booster\s+case|booster\s+display|booster\s+pack|booster\s+bundle|blister|starter\s+(set|deck|kit)|theme\s+deck|prerelease|pre-release|display\s+box|collector('s)?\s+(box|pack|bundle|edition)|elite\s+trainer\s+box|etb|binder|gift\s+box|two-player\s+starter|2-player\s+starter|draft\s+(set|booster)|build\s+(&|and)\s+battle|booster\s+draft|fat\s+pack|bundle\s+box|v\s+box|vmax\s+box|ex\s+box|gx\s+box|mega\s+box|premium\s+collection|special\s+collection|super\s+premium|premium\s+figure|treasure\s+chest|advent\s+calendar|special\s+edition\s+box|double\s+pack|booster\s+set|sealed\s+case|case\s+break|6-box|12-box|display\s+case|play\s+mat|sealed\s+product|promo\s+pack|starter\s+box|starter\s+bundle|league\s+battle\s+deck|league\s+starter|commander\s+deck|draft\s+pack|deck)\b/i;

function isSealed(name) {
  // A '#123' style card number anywhere in the name means it's an individual card
  if (/#\d+/.test(name)) return false;
  // Also catch standalone 'Booster Box', 'Booster Case' etc. without word-boundary issues
  if (SEALED_RE.test(name)) return true;
  // Catch names that ARE the sealed product (no card number like #123 at end)
  if (/^(Booster|Starter|Blister|Theme|Prerelease|Display|Draft|Bundle|Collection|Gift|Deck)\b/i.test(name)) return true;
  return false;
}

// ── Card page parser ───────────────────────────────────────────────────────
function parseRows(html) {
  const cards = [];
  const rowRegex = /<tr[^>]*id="product-(\d+)"[^>]*>([\s\S]*?)<\/tr>/g;
  let rowMatch;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const productId = rowMatch[1];
    const rowHtml = rowMatch[2];
    const titleMatch = /<td[^>]*class="[^"]*title[^"]*"[^>]*>[\s\S]*?<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/i.exec(rowHtml);
    if (!titleMatch) continue;
    const cardUrl = titleMatch[1].startsWith('http') ? titleMatch[1] : `https://www.pricecharting.com${titleMatch[1]}`;
    const cardName = htmlDecode(titleMatch[2].trim());
    const imgMatch = /<img[^>]*src="([^"]+)"[^>]*>/i.exec(rowHtml);
    const imgUrl = imgMatch ? imgMatch[1].replace(/\/60\.jpg$/, '/1600.jpg') : '';
    const extractPrice = (cls) => {
      const re = new RegExp(`<td[^>]*class="[^"]*${cls}[^"]*"[^>]*>[\\s\\S]*?<span[^>]*class="[^"]*js-price[^"]*"[^>]*>([^<]+)<\\/span>`, 'i');
      const mx = re.exec(rowHtml);
      return mx ? mx[1].trim() : '—';
    };
    cards.push({
      id: productId,
      name: cardName,
      url: cardUrl,
      img: imgUrl,
      sealed: isSealed(cardName),
      ungraded: extractPrice('used_price'),
      grade9: extractPrice('cib_price'),
      psa10: extractPrice('new_price'),
    });
  }
  return cards;
}

function parseNextCursor(html) {
  const cursorMatch = /name="cursor"\s+value="(\d+)"/.exec(html);
  const whenMatch = /name="when"\s+value="([^"]*)"/.exec(html);
  const dateMatch = /name="release-date"\s+value="([^"]*)"/.exec(html);
  const sortMatch = /name="sort"\s+value="([^"]*)"/.exec(html);
  if (cursorMatch) {
    return {
      cursor: cursorMatch[1],
      when: whenMatch ? whenMatch[1] : 'none',
      'release-date': dateMatch ? dateMatch[1] : '',
      sort: sortMatch ? sortMatch[1] : '',
    };
  }
  return null;
}

// ── Card set cache (per-set, 1 hour TTL, 50k entry limit with LRU eviction) ──
const cardCache = new Map(); // slug → { data, fetchedAt }
const CARD_CACHE_MAX_SIZE = 50000;

function setCacheEntry(slug, entry) {
  // If cache is at max size, evict the oldest entry (LRU)
  if (cardCache.size >= CARD_CACHE_MAX_SIZE) {
    let oldestSlug = null;
    let oldestTime = Infinity;
    for (const [key, val] of cardCache.entries()) {
      if (val.fetchedAt < oldestTime) {
        oldestTime = val.fetchedAt;
        oldestSlug = key;
      }
    }
    if (oldestSlug) cardCache.delete(oldestSlug);
  }
  cardCache.set(slug, entry);
}

async function fetchSetPages(slug) {
  // Check card cache
  const cached = cardCache.get(slug);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { ...cached.data, fromCache: true, cachedAt: cached.fetchedAt };
  }

  const baseUrl = `https://www.pricecharting.com/console/${slug}`;
  const allCards = [];
  let html1;
  try {
    html1 = await httpGet(baseUrl);
  } catch (err) {
    const cached = cardCache.get(slug);
    if (cached) return { ...cached.data, fromCache: true, cachedAt: cached.fetchedAt };
    return { error: err.message, cards: [], count: 0 };
  }

  const titleMatch = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html1);
  const title = titleMatch ? htmlDecode(titleMatch[1].replace(/<[^>]+>/g, '').trim()) : slug;
  const page1Cards = parseRows(html1);
  allCards.push(...page1Cards);

  let nextData = parseNextCursor(html1);

  let page = 2;
  while (nextData) {
    try {
      const pageHtml = await httpPost(baseUrl, {
        sort: nextData.sort || '',
        when: nextData.when || 'none',
        'release-date': nextData['release-date'] || '',
        cursor: nextData.cursor,
      });

      const newCards = parseRows(pageHtml);

      if (newCards.length === 0) {
        break;
      }

      allCards.push(...newCards);
      nextData = parseNextCursor(pageHtml);

      page++;
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      break;
    }
  }

  const sealedItems = allCards.filter(c => c.sealed);
  const result = { slug, title, cards: allCards, count: allCards.length, sealedCount: sealedItems.length, source: baseUrl };
  if (allCards.length > 0) {
    setCacheEntry(slug, { data: result, fetchedAt: Date.now() });
  }
  return result;
}

async function fetchSetPagesFresh(slug) {
  const baseUrl = `https://www.pricecharting.com/console/${slug}`;
  const allCards = [];
  let html1;
  try {
    html1 = await httpGet(baseUrl);
  } catch (err) {
    const cached = cardCache.get(slug);
    if (cached) return { ...cached.data, fromCache: true, cachedAt: cached.fetchedAt };
    return { error: err.message, cards: [], count: 0 };
  }

  const titleMatch = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html1);
  const title = titleMatch ? htmlDecode(titleMatch[1].replace(/<[^>]+>/g, '').trim()) : slug;
  const page1Cards = parseRows(html1);
  allCards.push(...page1Cards);

  let nextData = parseNextCursor(html1);

  let page = 2;
  while (nextData) {
    try {
      const pageHtml = await httpPost(baseUrl, {
        sort: nextData.sort || '',
        when: nextData.when || 'none',
        'release-date': nextData['release-date'] || '',
        cursor: nextData.cursor,
      });

      const newCards = parseRows(pageHtml);

      if (newCards.length === 0) {
        break;
      }

      allCards.push(...newCards);
      nextData = parseNextCursor(pageHtml);

      page++;
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      break;
    }
  }

  const sealedItems = allCards.filter(c => c.sealed);
  const result = { slug, title, cards: allCards, count: allCards.length, sealedCount: sealedItems.length, source: baseUrl };
  if (allCards.length > 0) {
    setCacheEntry(slug, { data: result, fetchedAt: Date.now() });
  }
  return result;
}

// ── TCGPlayer Data ────────────────────────────────────────────────────────
// TCGPlayer games/sets and products are now fetched on-demand via API endpoints

function slugToGame(slug) {
  for (const [gameKey, prefix] of Object.entries(SLUG_PREFIXES)) {
    if (slug.startsWith(prefix + '-') || slug === prefix) return gameKey;
  }
  return null;
}

function httpGetTCG(urlStr) {
  return new Promise((resolve, reject) => {
    const delay = 100 + Math.random() * 300; // Reduced from 500-1500ms to 100-400ms
    setTimeout(() => {
      const opts = {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'identity',
        },
      };
      const req = https.get(urlStr, opts, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(httpGetTCG(res.headers.location));
          return;
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
    }, delay);
  });
}

function parseTCGNextData(html) {
  const cards = [];
  try {
    // Save sample HTML for debugging
    if (!fs.existsSync('/tmp/tcgplayer-sample.html')) {
      fs.writeFileSync('/tmp/tcgplayer-sample.html', html.slice(0, 10000));
    }

    const m = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/.exec(html);
    if (!m) {
      // Check what scripts are in the page
      const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
      return cards;
    }
    const json = JSON.parse(m[1]);
    const results =
      json?.props?.pageProps?.searchResults?.results ||
      json?.props?.pageProps?.results ||
      json?.props?.pageProps?.initialSearchState?.results ||
      [];
    for (const item of results) {
      const name = item.productName || item.name || '';
      if (!name) continue;
      const productId = String(item.productId || item.id || '');
      const productUrl = item.productUrl
        ? (item.productUrl.startsWith('http') ? item.productUrl : `https://www.tcgplayer.com/${item.productUrl}`)
        : `https://www.tcgplayer.com/product/${productId}`;
      const img = item.imageUrl || item.image || '';
      const market   = item.marketPrice   ?? item?.prices?.nearMintNormal?.marketPrice  ?? null;
      const low      = item.lowestPrice   ?? item?.prices?.nearMintNormal?.lowPrice     ?? null;
      const high     = item?.prices?.nearMintNormal?.highPrice ?? null;
      const fmtP = v => (v != null ? `$${Number(v).toFixed(2)}` : '—');
      cards.push({
        id: productId,
        name: htmlDecode(name.trim()),
        url: productUrl,
        img,
        sealed: isSealed(name),
        ungraded: fmtP(market),
        grade9:   fmtP(low),
        psa10:    fmtP(high),
      });
    }
  } catch (_) {}
  return cards;
}

let puppeteerBrowser = null;

async function getPuppeteerBrowser() {
  if (!puppeteerBrowser) {
    puppeteerBrowser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return puppeteerBrowser;
}

// Normalize set names to a canonical form that works for both PriceCharting and TCGPlayer
// Examples: "SV: Scarlet & Violet Base Set" → "scarlet-violet"
//           "Scarlet & Violet" → "scarlet-violet"
//           "SV01: Scarlet & Violet Base Set" → "scarlet-violet"
function normalizeSetName(name) {
  let normalized = name.toLowerCase();

  // Remove common suffixes and prefixes
  normalized = normalized
    .replace(/\b(base\s+set|promo\s+cards?|promotional|pre-?release|promos?)\b/gi, '')
    .replace(/^[a-z0-9]+[:\s-]+/i, '') // Remove prefixes like "SV:", "SV01:", "ME01:"
    .replace(/\s*[-&]\s*\d+\/\d+.*$/i, ''); // Remove card numbers and variants

  // Remove special characters and normalize spacing
  normalized = normalized
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Collapse multiple dashes
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
    .trim();

  return normalized || name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20); // Fallback
}

// Create a paramName from original name: alphanumeric + dashes only
// Special case: ampersands become the word "and"
// Examples: "SV: Scarlet & Violet Base Set" → "sv-scarlet-and-violet-base-set"
//           "SV01: Scarlet & Violet" → "sv01-scarlet-and-violet"
function normalizeToParamName(name) {
  return name
    .toLowerCase()
    .replace(/\s*&\s*/g, ' and ') // Replace & with " and "
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Collapse multiple dashes
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
    .trim();
}

// ── Server-side scraping queue (one set at a time) ──────────────────────────
let _scrapingQueue = [];
let _scrapingInProgress = false;

async function enqueueScrape(gameSlug, setParamName, setOriginalName, socketServer) {
  return new Promise((resolve) => {
    _scrapingQueue.push({ gameSlug, setParamName, setOriginalName, socketServer, resolve });
    processScrapingQueue();
  });
}

async function processScrapingQueue() {
  if (_scrapingInProgress || _scrapingQueue.length === 0) return;

  _scrapingInProgress = true;
  const { gameSlug, setParamName, setOriginalName, socketServer, resolve } = _scrapingQueue.shift();


  try {
    const result = await scrapeTCGPlayerGameSet(gameSlug, setParamName, setOriginalName, socketServer);
    resolve(result);
  } catch (err) {
    console.error(`[Queue] Error during scrape:`, err.message);
    resolve([]);
  } finally {
    _scrapingInProgress = false;
    // Process next item in queue
    if (_scrapingQueue.length > 0) {
      setImmediate(() => processScrapingQueue());
    }
  }
}

// Scrape products for a specific TCGPlayer game/set combination
// gameSlug: canonical game key (e.g., "pokemon")
// setParamName: paramName of the set (e.g., "sv-scarlet-and-violet-151")
// setOriginalName: original TCGPlayer set name (e.g., "Scarlet & Violet: 151")
// socketServer: optional socket.io server to emit page-scraped events
async function scrapeTCGPlayerGameSet(gameSlug, setParamName, setOriginalName, socketServer = null) {
  const allProducts = [];
  try {
    const browser = await getPuppeteerBrowser();
    let page = 1;
    let maxPages = 3; // Default fallback

    // Fetch first page and extract max pages from pagination
    const firstPageUrl = `https://www.tcgplayer.com/search/${gameSlug}/${setParamName}?productLineName=${gameSlug}&view=grid&setName=${setParamName}&page=1`;

    const browserPage = await browser.newPage();

    // Capture browser console logs
    browserPage.on('console', msg => {});

    await browserPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await browserPage.goto(firstPageUrl, {
      waitUntil: 'domcontentloaded', // Faster than networkidle2, DOM is ready for extraction
      timeout: 45000
    });

    // Wait for pagination to render
    try {
      await browserPage.waitForFunction(
        () => document.querySelector('.tcg-pagination__pages'),
        { timeout: 60000 }
      );
    } catch (e) {
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract max page number from pagination
    maxPages = await browserPage.evaluate(() => {
      const paginationDiv = document.querySelector('.tcg-pagination__pages');
      if (!paginationDiv) return 3;

      // Find all span elements with page numbers
      const spans = Array.from(paginationDiv.querySelectorAll('.tcg-standard-button__content'));
      if (spans.length === 0) return 3;

      // Extract numeric values from text content
      const pageNumbers = spans
        .map(span => parseInt(span.textContent.trim(), 10))
        .filter(n => !isNaN(n) && n > 0);

      if (pageNumbers.length === 0) return 3;

      return Math.max(...pageNumbers);
    });


    // Scrape first page products
    const firstPageProducts = await scrapeTCGPlayerProductsPage(browser, firstPageUrl);
    if (firstPageProducts.length > 0) {
      allProducts.push(...firstPageProducts);
      // Emit socket event for first page
      if (socketServer) {
        // Log sample to verify prices are extracted
        if (firstPageProducts.length > 0) {
          const sample = firstPageProducts[0];
        }
        socketServer.emit('tcgplayer:page-scraped', {
          game: gameSlug,
          slug: setParamName,
          setOriginalName: setOriginalName,
          page: 1,
          cards: firstPageProducts
        });
      } else {
      }
    }
    await browserPage.close();

    // Scrape remaining pages
    page = 2;
    while (page <= maxPages) {
      const url = `https://www.tcgplayer.com/search/${gameSlug}/${setParamName}?productLineName=${gameSlug}&view=grid&setName=${setParamName}&page=${page}`;

      const pageProducts = await scrapeTCGPlayerProductsPage(browser, url);
      if (pageProducts.length === 0) {
        break;
      }

      allProducts.push(...pageProducts);

      // Emit socket event for this page
      if (socketServer) {
        socketServer.emit('tcgplayer:page-scraped', {
          game: gameSlug,
          slug: setParamName,
          setOriginalName: setOriginalName,
          page: page,
          cards: pageProducts
        });
      }

      page++;

      // Rate limiting and allow page to be fully ready before next request
      await new Promise(resolve => setTimeout(resolve, 1000));
    }


    // Emit completion event so client knows scraping is done
    if (socketServer) {
      socketServer.emit('tcgplayer:scrape-complete', {
        game: gameSlug,
        slug: setParamName,
        setOriginalName: setOriginalName,
        productCount: allProducts.length
      });
    }

    return allProducts;
  } catch (err) {
    console.error(`[TCGPlayer Game/Set] Error scraping ${gameSlug}/${setParamName}:`, err.message);

    // Emit completion event even on error so client isn't waiting forever
    if (socketServer) {
      socketServer.emit('tcgplayer:scrape-complete', {
        game: gameSlug,
        slug: setParamName,
        setOriginalName: setOriginalName,
        productCount: allProducts.length,
        error: err.message
      });
    }

    return allProducts;
  }
}

// Fetch games and sets from TCGPlayer - games first, then sets for each game
async function fetchTCGPlayerGamesAndSets() {
  try {
    // Use static game list (TCGPlayer page structure changed, no need to scrape)
    const gameMapping = {
      'pokemon': { name: 'Pokémon', key: 'pokemon' },
      'pokemon-japan': { name: 'Pokémon Japanese', key: 'pokemon-japan' },
      'mtg': { name: 'Magic: The Gathering', key: 'mtg' },
      'yugioh': { name: 'Yu-Gi-Oh!', key: 'yugioh' },
      'digimon': { name: 'Digimon Card Game', key: 'digimon' },
      'onepiece': { name: 'One Piece Card Game', key: 'onepiece' },
      'dragonball': { name: 'Dragon Ball Super', key: 'dragonball' },
      'lorcana': { name: 'Disney Lorcana', key: 'lorcana' },
      'swu': { name: 'Star Wars Unlimited', key: 'swu' },
      'riftbound': { name: 'Riftbound: League of Legends TCG', key: 'riftbound' },
      'gundam': { name: 'Gundam Card Game', key: 'gundam' },
    };

    const games = Object.values(gameMapping).map(g => ({ name: g.name, id: g.key }));

    const browser = await getPuppeteerBrowser();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const result = {};
    const supportedGames = new Set(['pokemon','pokemon-japan','mtg','yugioh','onepiece','lorcana','digimon','dragonball','gundam','swu','riftbound']);

    // Step 1: For each game, fetch its sets (only for supported games)
    for (const game of games) {
      const gameKey = game.id;

      // Skip games we don't support
      if (!supportedGames.has(gameKey)) {
        continue;
      }

      result[gameKey] = { gameName: game.name, sets: [] };

      try {

        // Navigate to game-specific URL to load that game's sets
        const gameUrl = `https://www.tcgplayer.com/search/${gameKey}/product?productLineName=${gameKey}&view=grid`;
        await page.goto(gameUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Click on the Set filter button to expand the dropdown
        try {
          // Wait for the Set filter button to appear
          await page.waitForSelector('[data-testid="filterBar-Set"]', { timeout: 3000 });

          const setButton = await page.$('[data-testid="filterBar-Set"]');
          if (setButton) {
            await setButton.click();
            // Wait for the popover content to become visible
            await page.waitForFunction(() => {
              const popoverContent = document.querySelector('.tcg-popover__content');
              if (!popoverContent) return false;
              const style = window.getComputedStyle(popoverContent);
              return style.display !== 'none';
            }, { timeout: 3000 }).catch(() => {
              // Popover may not have become visible, continue anyway
            });
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch (e) {
        }

        // Extract sets from Set dropdown for this game
        const gameSets = await page.evaluate(() => {
          const sets = [];
          // Look for the popover content area or the Set filter container
          let setDiv = document.querySelector('[data-testid="filterBar-Set"]')?.closest('.tcg-popover');
          if (!setDiv) {
            setDiv = document.querySelector('.tcg-popover__content');
          }
          if (!setDiv) {
            setDiv = document.querySelector('[data-name="setName"]');
          }

          if (setDiv) {
            // Search for all checkboxes and their labels within the container
            const filterElements = setDiv.querySelectorAll('[id^="hfb-Set-"][id$="-filter"]');

            const labels = setDiv.querySelectorAll('label');

            // Extract sets from labels with checkboxes
            const extractedSets = [];
            labels.forEach(label => {
              const checkbox = label.querySelector('input[type="checkbox"]');
              if (checkbox) {
                const setLabel = label.querySelector('.tcg-input-checkbox__label-text')?.textContent.trim();
                if (setLabel) extractedSets.push(setLabel);
              }
            });

            extractedSets.forEach(name => sets.push({ name }));
          } else {
            // Debug: show what's available
            const popoverContent = document.querySelector('.tcg-popover__content');
            if (popoverContent) {
              const labels = popoverContent.querySelectorAll('label');
            }
          }
          return sets;
        });

        // Filter out Promo variants - prefer main sets over promotional variants
        const setsByCanonical = {};
        for (const set of gameSets) {
          const canonical = normalizeSetName(set.name);
          if (!setsByCanonical[canonical]) {
            setsByCanonical[canonical] = [];
          }
          setsByCanonical[canonical].push(set);
        }

        // For each canonical name, prefer non-promo variants
        const filteredSets = [];
        for (const canonical in setsByCanonical) {
          const variants = setsByCanonical[canonical];
          // Sort so non-promo variants come first
          variants.sort((a, b) => {
            const aIsPromo = /\b(promo|promotional|pre-?release)\s*$/i.test(a.name);
            const bIsPromo = /\b(promo|promotional|pre-?release)\s*$/i.test(b.name);
            if (aIsPromo === bIsPromo) return 0;
            return aIsPromo ? 1 : -1; // Non-promo comes first
          });
          filteredSets.push(variants[0]); // Keep only the first (non-promo preferred)
        }

        // Normalize set names to canonical and param forms
        filteredSets.forEach(set => {
          set.canonical = normalizeSetName(set.name);
          set.paramName = normalizeToParamName(set.name);
          set.slug = set.canonical; // Use canonical as the URL slug
        });

        result[gameKey].sets = filteredSets;
        const sampleSets = filteredSets.slice(0, 3).map(s => s.name);

        // Rate limiting between games
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`[TCGPlayer Games/Sets] Error fetching sets for ${game.name}:`, err.message);
      }
    }

    await page.close();

    // Merge pokemon and pokemon-japan into a single 'pokemon' game
    if (result['pokemon'] && result['pokemon-japan']) {
      const pokemonSets = result['pokemon'].sets || [];
      const pokemonJapanSets = result['pokemon-japan'].sets || [];

      // Merge sets, avoiding duplicates by slug
      const seenSlugs = new Set(pokemonSets.map(s => s.slug));
      for (const set of pokemonJapanSets) {
        if (!seenSlugs.has(set.slug)) {
          pokemonSets.push(set);
          seenSlugs.add(set.slug);
        }
      }

      result['pokemon'].sets = pokemonSets;
      delete result['pokemon-japan'];
    } else if (result['pokemon-japan']) {
      // If only pokemon-japan exists, rename it to pokemon
      result['pokemon'] = result['pokemon-japan'];
      delete result['pokemon-japan'];
    }

    return { games: result };
  } catch (err) {
    console.error('[TCGPlayer Games/Sets] Error:', err.message);
    return { games: {} };
  }
}


async function scrapeTCGPlayerProductsPage(browser, pageUrl) {
  const products = [];
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });

    // Wait for page to be fully interactive
    await new Promise(resolve => setTimeout(resolve, 750));

    // Wait for product cards to render
    try {
      await page.waitForFunction(
        () => document.querySelectorAll('[class*="product-card"]').length > 0,
        { timeout: 30000 }
      );
    } catch (e) {

      // Debug: check what's on the page
      const pageContent = await page.evaluate(() => {
        return {
          hasCards: !!document.querySelector('[class*="product-card"]'),
          cardCount: document.querySelectorAll('[class*="product-card"]').length,
          bodyText: document.body.innerText.slice(0, 500),
          divCount: document.querySelectorAll('div').length
        };
      });

      await page.close();
      return products;
    }

    // Extract all product metadata from the page
    const pageProducts = await page.evaluate(() => {
      const results = [];
      const seen = new Set();

      document.querySelectorAll('[class*="product-card"]').forEach(card => {
        try {
          const link = card.querySelector('a[href*="/product/"]');
          if (!link) return;

          const url = link.href;
          const id = url.match(/\/product\/(\d+)/)?.[1];
          if (!id || seen.has(id)) return;
          seen.add(id);

          // Extract each field carefully from DOM structure
          let set = null;
          let cardName = null;
          let cardNumber = null;
          let rarity = null;
          let lowPrice = null;
          let marketPrice = null;
          let listings = null;
          let foil = null;

          // Build structured data by extracting specific text patterns
          // Split by common delimiters that appear in product cards
          const textParts = card.textContent.split(/\n|,(?=\s*[A-Z#])/);

          // Process each text part to extract fields
          for (const part of textParts) {
            const trimmed = part.trim();

            // Check for market price
            if (!marketPrice) {
              const marketMatch = trimmed.match(/Market Price[:\s]*\$([0-9.]+)/i);
              if (marketMatch) marketPrice = parseFloat(marketMatch[1]);
            }

            // Check for price pattern "$X.XX"
            if (!lowPrice) {
              const priceMatch = trimmed.match(/^\$([0-9.]+)$/);
              if (priceMatch) lowPrice = parseFloat(priceMatch[1]);
            }

            // Check for listings count
            if (!listings) {
              const listingsMatch = trimmed.match(/^(\d+)\s*listings?$/i);
              if (listingsMatch) listings = parseInt(listingsMatch[1], 10);
            }

            // Check for foil status
            if (!foil && trimmed.match(/^(Foil|Non-?Foil)$/i)) {
              foil = trimmed.toLowerCase().replace(/\s+/g, '-');
            }

            // Check for rarity (multi-word patterns first)
            if (!rarity) {
              const rarityMatch = trimmed.match(/(Double\s+Rare|Illustration\s+Rare|Secret\s+Rare|Ultra\s+Rare|Full\s+Art|Holo\s+Rare|Rare\s+Holo|Radiant\s+Rare|Hollow\s+Rare|Promo)/i);
              if (rarityMatch) {
                rarity = rarityMatch[0];
              } else if (trimmed.match(/^(Holo|Rare|Uncommon|Common)$/i)) {
                rarity = trimmed;
              }
            }

            // Check for card number pattern
            if (!cardNumber) {
              const numberMatch = trimmed.match(/^#?(\d+\/\d+)$/);
              if (numberMatch) cardNumber = numberMatch[1];
            }
          }

          // For set and card name, use more complex extraction from full text
          const fullText = card.textContent;

          // Extract card number if not found yet (might have extra spaces)
          if (!cardNumber) {
            const numberMatch = fullText.match(/#?(\d+\/\d+)/);
            if (numberMatch) cardNumber = numberMatch[1];
          }

          // Extract rarity if not found yet (might be in different format)
          if (!rarity) {
            const rarityPatterns = /(Double\s+Rare|Illustration\s+Rare|Secret\s+Rare|Ultra\s+Rare|Full\s+Art|Holo\s+Rare|Rare\s+Holo|Radiant\s+Rare|Hollow\s+Rare|Holo|Rare|Uncommon|Common|Promo)/i;
            const rarityMatch = fullText.match(rarityPatterns);
            if (rarityMatch) rarity = rarityMatch[0];
          }

          // Extract set: Usually first line or before rarity
          // Look for set code at the beginning (e.g., "ME02: Phantasmal Flames")
          const setMatch = fullText.match(/^([A-Z0-9]+[A-Za-z0-9\s:.-]*?)(?:Double|Illustration|Common|Uncommon|Holo|Rare|Secret|#|Promo)/);
          if (setMatch) set = setMatch[1].trim();

          // Extract card name: The structure is usually: Set, Rarity, Number, CardName, Listings, Prices
          // CardName appears AFTER the card number and BEFORE "listings" keyword
          if (cardNumber) {
            const numberPos = fullText.indexOf(cardNumber);
            if (numberPos >= 0) {
              // Get text after card number
              const afterNumber = fullText.substring(numberPos + cardNumber.length);
              // Extract everything after the number until we hit "listings", "Market Price", "from $", or digits followed by space
              // This regex is greedy to capture multi-word names like "Battle Cage"
              const nameMatch = afterNumber.match(/^\s*([A-Za-z\s&'\-]+?)(?:\s*[-–]?\s*\d+\/\d+|\d+\s*listings?|Market\s+Price|from\s+\$)/i);
              if (nameMatch) {
                cardName = nameMatch[1].trim();
                // Clean up any trailing punctuation or weird chars
                cardName = cardName.replace(/[\s\-–,#]+$/g, '').trim();
              }
            }
          }

          // Fallback: if still no card name, try extracting multi-word names from text after card number
          if (!cardName && cardNumber) {
            const numberPos = fullText.indexOf(cardNumber);
            if (numberPos >= 0) {
              const afterNumber = fullText.substring(numberPos + cardNumber.length);
              // Extract capitalized words that are not numbers, prices, or common keywords
              // Split by "listings" or price keywords to isolate the name portion
              const beforeListings = afterNumber.split(/\d+\s*listings?|Market\s+Price|from\s+\$/i)[0];
              // Get all capitalized word sequences
              const nameWords = beforeListings.match(/([A-Z][a-z]*(?:\s+[A-Z][a-z]*)*)/g);
              if (nameWords && nameWords.length > 0) {
                // Filter out rarity and set-related keywords, prefer longer sequences
                const filtered = nameWords
                  .filter(n => !n.match(/Rare|Uncommon|Common|Foil|Holo|Promo|Double|Illustration|Secret|Ultra|Full|Hollow|Radiant|Mega|ex|EX|V|VMAX|Vstar|Phantasmal|Scarlet|Violet|Crown/i))
                  .sort((a, b) => b.length - a.length);
                if (filtered.length > 0) {
                  cardName = filtered[0].trim();
                }
              }
            }
          }

          const title = fullText.trim();

          if (title && title.length > 2) {
            results.push({
              id,
              title,
              set: set || null,
              cardName: cardName || null,
              cardNumber: cardNumber || null,
              rarity: rarity || null,
              foil: foil || null,
              listings,
              lowPrice,
              marketPrice,
              url,
            });
          }
        } catch (e) {
          // Skip this card and continue
        }
      });

      return results;
    });

    await page.close();
    products.push(...pageProducts);
  } catch (err) {
    console.error('[Puppeteer All Products] Page scrape failed:', err.message);
  }

  return products;
}

// ── HTTP Server ────────────────────────────────────────────────────────────
// Helper to read POST body
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const parsed = url.parse(req.url, true);
  const reqPath = parsed.pathname;
  const query = parsed.query;

  // ── Auth Routes ────────────────────────────────────────────────────────

  // POST /api/auth/register
  if (reqPath === '/api/auth/register' && req.method === 'POST') {
    try {
      const { email, password } = await readBody(req);
      if (!email || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Email and password required' }));
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Insert user
      const result = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, is_admin',
        [email, passwordHash]
      );

      const userId = result.rows[0].id;
      const isAdmin = result.rows[0].is_admin;
      const token = jwt.sign({ userId, email, isAdmin }, JWT_SECRET, { expiresIn: '7d' });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ token, userId, isAdmin }));
    } catch (err) {
      if (err.code === '23505') { // Unique constraint error
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Email already registered' }));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    }
    return;
  }

  // POST /api/auth/login
  if (reqPath === '/api/auth/login' && req.method === 'POST') {
    try {
      const { email, password } = await readBody(req);
      if (!email || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Email and password required' }));
        return;
      }

      // Find user
      const result = await pool.query('SELECT id, password_hash, is_admin FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid email or password' }));
        return;
      }

      const user = result.rows[0];

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid email or password' }));
        return;
      }

      const isAdmin = user.is_admin;
      const token = jwt.sign({ userId: user.id, email, isAdmin }, JWT_SECRET, { expiresIn: '7d' });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ token, userId: user.id, isAdmin }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── /api/games ─────────────────────────────────────────────────────────
  if (reqPath === '/api/games') {
    const result = {};
    for (const [key, val] of Object.entries(GAME_DATA)) {
      result[key] = {
        label: val.label,
        color: val.color,
        catUrl: val.catUrl,
        sets: getGameSets(key),
        setCacheAge: setsCache[key] ? Math.round((Date.now() - setsCache[key].fetchedAt) / 1000) : null,
      };
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // ── /api/tcgplayer/games-sets ──────────────────────────────────────────
  if (reqPath === '/api/tcgplayer/games-sets') {
    try {
      // Check cache first — return cached data if recent (24 hours)
      const now = Date.now();
      const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
      if (tcgGamesSetCache && (now - tcgGamesSetCache.fetchedAt) < CACHE_TTL) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(tcgGamesSetCache.data));
        return;
      }
      // Cache miss or stale — fetch fresh data (launches Puppeteer)
      const gamesSets = await fetchTCGPlayerGamesAndSets();
      // Store in cache
      tcgGamesSetCache = { data: gamesSets, fetchedAt: now };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(gamesSets));
    } catch (err) {
      // If fetch fails, return cached data if available (even if stale)
      if (tcgGamesSetCache) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(tcgGamesSetCache.data));
        return;
      }
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message, games: {}, sets: [] }));
    }
    return;
  }

  // ── POST /api/tcgplayer/scrape-game-set ────────────────────────────────
  if (reqPath === '/api/tcgplayer/scrape-game-set' && req.method === 'POST') {
    try {
      const { gameSlug, setParamName, setOriginalName } = await readBody(req);
      if (!gameSlug || !setParamName) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'gameSlug and setParamName required' }));
        return;
      }

      // Return immediately with 202 Accepted
      res.writeHead(202, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'accepted', message: 'Scraping started in background' }));

      // Enqueue for processing (one set at a time)
      enqueueScrape(gameSlug, setParamName, setOriginalName, io).catch(err => {
        console.error(`[Background Scrape] Error scraping ${gameSlug}/${setParamName}:`, err.message);
      });
    } catch (err) {
      console.error(`[API] Error in scrape-game-set:`, err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── /api/set?slug=... ──────────────────────────────────────────────────
  if (reqPath === '/api/set') {
    const slug = query.slug;
    if (!slug) { res.writeHead(400); res.end(JSON.stringify({ error: 'slug required' })); return; }
    const force = query.force === 'true';
    try {
      const data = force ? await fetchSetPagesFresh(slug) : await fetchSetPages(slug);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message, cards: [] }));
    }
    return;
  }

  // ── /api/cache-status ─────────────────────────────────────────────────
  if (reqPath === '/api/cache-status') {
    const status = {};
    for (const key of Object.keys(GAME_DATA)) {
      const sc = setsCache[key];
      status[key] = {
        sets: sc ? sc.sets.length : 0,
        ageSeconds: sc ? Math.round((Date.now() - sc.fetchedAt) / 1000) : null,
        nextRefreshIn: sc ? Math.round((CACHE_TTL_MS - (Date.now() - sc.fetchedAt)) / 1000) : null,
      };
    }
    status.cardCache = {
      entries: cardCache.size,
      slugs: [...cardCache.keys()],
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status, null, 2));
    return;
  }

  // ── /api/refresh-cache?game=... ────────────────────────────────────────
  if (reqPath === '/api/refresh-cache') {
    const gameKey = query.game;
    if (!gameKey || !GAME_DATA[gameKey]) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid game key' }));
      return;
    }
    // Trigger refresh in background, don't wait for it
    (async () => {
      try {
        const sets = await scrapeSetsFromCategory(gameKey);
        setsCache[gameKey] = { sets, fetchedAt: Date.now() };
      } catch (e) {
      }
    })();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'refreshing', game: gameKey }));
    return;
  }

  // ── Cart Routes ────────────────────────────────────────────────────────

  // GET /api/cart - get user's cart
  if (reqPath === '/api/cart' && req.method === 'GET') {
    try {
      const token = getAuthToken(req);
      const auth = await verifyAuth(token);
      if (!auth) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      const result = await pool.query(
        `SELECT c.*, COALESCE(i.price_cents, 0) as price_cents FROM cart_items c
         LEFT JOIN inventory i ON c.game = i.game AND c.set_slug = i.set_slug AND CAST(c.card_number AS TEXT) = CAST(i.card_number AS TEXT) AND c.grading = i.grading
         WHERE c.user_id = $1`,
        [auth.userId]
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // POST /api/cart/add - add card to cart
  if (reqPath === '/api/cart/add' && req.method === 'POST') {
    try {
      const token = getAuthToken(req);
      const auth = await verifyAuth(token);
      if (!auth) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      const { game, set_slug, card_number, grading, quantity } = await readBody(req);
      if (!game || !set_slug || !card_number || grading === undefined || !quantity) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required fields' }));
        return;
      }

      // Upsert into cart (insert or update)
      const result = await pool.query(
        `INSERT INTO cart_items (user_id, game, set_slug, card_number, grading, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, game, set_slug, card_number, grading)
         DO UPDATE SET quantity = cart_items.quantity + $6
         RETURNING *`,
        [auth.userId, game, set_slug, card_number, grading, quantity]
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows[0]));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // DELETE /api/cart/remove - remove card from cart
  if (reqPath === '/api/cart/remove' && req.method === 'DELETE') {
    try {
      const token = getAuthToken(req);
      const auth = await verifyAuth(token);
      if (!auth) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      const { game, set_slug, card_number, grading } = await readBody(req);
      if (!game || !set_slug || !card_number || grading === undefined) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required fields' }));
        return;
      }

      await pool.query(
        'DELETE FROM cart_items WHERE user_id = $1 AND game = $2 AND set_slug = $3 AND card_number = $4 AND grading = $5',
        [auth.userId, game, set_slug, card_number, grading]
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // PUT /api/cart/update - update cart item quantity
  if (reqPath === '/api/cart/update' && req.method === 'PUT') {
    try {
      const token = getAuthToken(req);
      const auth = await verifyAuth(token);
      if (!auth) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      const { game, set_slug, card_number, grading, quantity } = await readBody(req);
      if (!game || !set_slug || !card_number || grading === undefined || quantity === undefined) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required fields' }));
        return;
      }

      const result = await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND game = $3 AND set_slug = $4 AND card_number = $5 AND grading = $6 RETURNING *',
        [quantity, auth.userId, game, set_slug, card_number, grading]
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows[0] || { error: 'Not found' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── Checkout Routes ────────────────────────────────────────────────────

  // POST /api/checkout/session - create Stripe checkout session
  if (reqPath === '/api/checkout/session' && req.method === 'POST') {
    try {
      const token = getAuthToken(req);
      const user = await verifyAuth(token);
      if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      const body = await readBody(req);
      const { items } = JSON.parse(body);
      if (!items || !Array.isArray(items)) throw new Error('items required');

      // Verify cart items belong to user and calculate total
      const cartResult = await pool.query('SELECT * FROM cart_items WHERE user_id = $1', [user.id]);
      let total = 0;
      const orderItems = [];

      for (const item of items) {
        const cartItem = cartResult.rows.find(c =>
          c.game === item.game &&
          c.set_slug === item.set_slug &&
          c.card_number === item.card_number &&
          c.grading === item.grading
        );
        if (!cartItem) throw new Error('Cart item not found');

        const invResult = await pool.query(
          'SELECT * FROM inventory WHERE game=$1 AND set_slug=$2 AND card_number=$3 AND grading=$4',
          [item.game, item.set_slug, item.card_number, item.grading]
        );
        if (!invResult.rows[0]) throw new Error('Inventory item not found');

        const invItem = invResult.rows[0];
        total += invItem.price_cents * cartItem.quantity;
        orderItems.push({
          game: item.game,
          set_slug: item.set_slug,
          card_number: item.card_number,
          grading: item.grading,
          quantity: cartItem.quantity,
          price_cents: invItem.price_cents
        });
      }

      // Create order in database
      const orderResult = await pool.query(
        'INSERT INTO orders (user_id, status, total_cents) VALUES ($1, $2, $3) RETURNING id',
        [user.id, 'pending', total]
      );
      const orderId = orderResult.rows[0].id;

      // Insert order items
      for (const item of orderItems) {
        await pool.query(
          'INSERT INTO order_items (order_id, game, set_slug, card_number, grading, quantity, price_cents) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [orderId, item.game, item.set_slug, item.card_number, item.grading, item.quantity, item.price_cents]
        );
      }

      // Create Stripe session
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: orderItems.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${item.game} - ${item.set_slug} #${item.card_number}${item.grading ? ` Grade ${item.grading}` : ''}`
            },
            unit_amount: item.price_cents
          },
          quantity: item.quantity
        })),
        mode: 'payment',
        success_url: `${process.env.BASE_URL || 'http://localhost:3847'}/checkout?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL || 'http://localhost:3847'}`,
        metadata: { orderId: String(orderId) }
      });

      // Update order with session ID
      await pool.query('UPDATE orders SET stripe_session_id = $1 WHERE id = $2', [session.id, orderId]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ sessionId: session.id, url: session.url }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // POST /api/checkout/webhook - Stripe webhook
  if (reqPath === '/api/checkout/webhook' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const sig = req.headers['stripe-signature'];
      const event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = parseInt(session.metadata.orderId, 10);

        // Get order details
        const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if (!orderResult.rows[0]) throw new Error('Order not found');

        const order = orderResult.rows[0];

        // Get order items
        const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);

        // Decrease inventory for each item
        for (const item of itemsResult.rows) {
          await pool.query(
            'UPDATE inventory SET quantity_available = quantity_available - $1 WHERE game=$2 AND set_slug=$3 AND card_number=$4 AND grading=$5',
            [item.quantity, item.game, item.set_slug, item.card_number, item.grading]
          );
        }

        // Mark order as completed
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['completed', orderId]);

        // Clear user's cart
        const userId = order.user_id;
        await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ received: true }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── Public Store Inventory ────────────────────────────────────────────

  // GET /api/store-inventory?game=X&set_slug=Y - public stock check for a set
  if (reqPath === '/api/store-inventory' && req.method === 'GET') {
    try {
      const { game, set_slug } = query;
      if (!game || !set_slug) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'game and set_slug required' }));
        return;
      }
      const result = await pool.query(
        'SELECT card_number, grading, quantity_available, price_cents FROM inventory WHERE game = $1 AND set_slug = $2 AND quantity_available > 0',
        [game, set_slug]
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── Admin Auth Helper ─────────────────────────────────────────────────
  async function isAdminRequest(req) {
    const apiKey = req.headers['x-api-key'] || '';
    if (apiKey === ADMIN_API_KEY) return true;
    try {
      const token = getAuthToken(req);
      if (!token) return false;
      const payload = await verifyAuth(token);
      return payload.isAdmin === true;
    } catch { return false; }
  }

  // ── Public Inventory (On Sale) ────────────────────────────────────────────

  // GET /api/inventory - list all on-sale items with calculated available stock
  if (reqPath === '/api/inventory' && req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT
          i.*,
          COALESCE(SUM(c.quantity), 0) as reserved_qty,
          i.quantity_available - COALESCE(SUM(c.quantity), 0) as available_stock
        FROM inventory i
        LEFT JOIN cart_items c ON (
          i.game = c.game AND
          i.set_slug = c.set_slug AND
          i.card_number = c.card_number AND
          i.grading = c.grading
        )
        WHERE i.price_cents > 0
        GROUP BY i.id, i.game, i.set_slug, i.card_number, i.grading, i.quantity_available, i.price_cents
        ORDER BY i.game, i.set_slug, i.card_number
      `);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── Admin Inventory Routes ────────────────────────────────────────────

  // GET /api/admin/inventory - list all inventory
  if (reqPath === '/api/admin/inventory' && req.method === 'GET') {
    try {
      if (!await isAdminRequest(req)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      const result = await pool.query('SELECT * FROM inventory ORDER BY game, set_slug, card_number');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // POST /api/admin/inventory/add - add/update inventory item
  if (reqPath === '/api/admin/inventory/add' && req.method === 'POST') {
    try {
      if (!await isAdminRequest(req)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      const { game, set_slug, card_number, grading, quantity_available, price_cents, card_name } = await readBody(req);
      if (!game || !set_slug || !card_number || grading === undefined) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required fields' }));
        return;
      }

      const result = await pool.query(
        `INSERT INTO inventory (game, set_slug, card_number, grading, quantity_available, price_cents, card_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (game, set_slug, card_number, grading)
         DO UPDATE SET quantity_available = $5, price_cents = $6, card_name = $7
         RETURNING *`,
        [game, set_slug, card_number, grading, quantity_available || 0, price_cents || 0, card_name || '']
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows[0]));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // DELETE /api/admin/inventory/remove - remove inventory item
  if (reqPath === '/api/admin/inventory/remove' && req.method === 'DELETE') {
    try {
      if (!await isAdminRequest(req)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      const { game, set_slug, card_number, grading } = await readBody(req);
      if (!game || !set_slug || !card_number || grading === undefined) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required fields' }));
        return;
      }

      await pool.query(
        'DELETE FROM inventory WHERE game = $1 AND set_slug = $2 AND card_number = $3 AND grading = $4',
        [game, set_slug, card_number, grading]
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── Static files ───────────────────────────────────────────────────────
  let filePath = nodePath.join(SITE_DIR, reqPath === '/' ? 'index.html' : reqPath);
  // Prevent directory traversal
  if (!filePath.startsWith(SITE_DIR)) { res.writeHead(403); res.end('Forbidden'); return; }
  const ext = nodePath.extname(filePath);
  const mime = MIME[ext] || 'text/plain';
  if (fs.existsSync(filePath)) {
    res.writeHead(200, { 'Content-Type': mime });
    res.end(fs.readFileSync(filePath));
  } else {
    // For SPA routing: serve index.html for any non-existent non-API route
    const indexPath = nodePath.join(SITE_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(indexPath));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  }
});

// Set up Socket.io for real-time events
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

let connectedClients = {};
io.on('connection', (socket) => {
  connectedClients[socket.id] = socket;

  socket.on('disconnect', () => {
    delete connectedClients[socket.id];
  });
});

// Emit calls
const originalEmit = io.emit.bind(io);
io.emit = function(event, ...args) {
  return originalEmit(event, ...args);
};

server.listen(PORT, '127.0.0.1', async () => {
  // Initialize PriceCharting cache only on startup
  // TCGPlayer games/sets are now fetched on-demand via API endpoint
  await initSetsCache().catch(() => {});
});