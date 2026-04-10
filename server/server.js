
const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');
const nodePath = require('path');

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

// ── Game Data ─────────────────────────────────────────────────────────────
const GAME_DATA = {
  "pokemon": {
    "label": "Pokémon",
    "color": "#ffcb05",
    "catUrl": "https://www.pricecharting.com/category/pokemon-cards",
    "sets": [
      {
        "name": "Pokemon Promo",
        "slug": "pokemon-promo"
      },
      {
        "name": "Pokemon Phantasmal Flames",
        "slug": "pokemon-phantasmal-flames"
      },
      {
        "name": "Pokemon Mega Evolution",
        "slug": "pokemon-mega-evolution"
      },
      {
        "name": "Pokemon Destined Rivals",
        "slug": "pokemon-destined-rivals"
      },
      {
        "name": "Pokemon Base Set",
        "slug": "pokemon-base-set"
      },
      {
        "name": "Pokemon Prismatic Evolutions",
        "slug": "pokemon-prismatic-evolutions"
      },
      {
        "name": "Pokemon Scarlet & Violet 151",
        "slug": "pokemon-scarlet-&-violet-151"
      },
      {
        "name": "Pokemon Journey Together",
        "slug": "pokemon-journey-together"
      },
      {
        "name": "Pokemon Surging Sparks",
        "slug": "pokemon-surging-sparks"
      },
      {
        "name": "Pokemon Japanese Mega Dream ex",
        "slug": "pokemon-japanese-mega-dream-ex"
      },
      {
        "name": "Pokemon Japanese Promo",
        "slug": "pokemon-japanese-promo"
      },
      {
        "name": "Pokemon Celebrations",
        "slug": "pokemon-celebrations"
      },
      {
        "name": "Pokemon Crown Zenith",
        "slug": "pokemon-crown-zenith"
      },
      {
        "name": "Pokemon Ascended Heroes",
        "slug": "pokemon-ascended-heroes"
      },
      {
        "name": "Pokemon Evolving Skies",
        "slug": "pokemon-evolving-skies"
      },
      {
        "name": "Pokemon Evolutions",
        "slug": "pokemon-evolutions"
      },
      {
        "name": "Pokemon Black Bolt",
        "slug": "pokemon-black-bolt"
      },
      {
        "name": "Pokemon Paldean Fates",
        "slug": "pokemon-paldean-fates"
      },
      {
        "name": "Pokemon Team Rocket",
        "slug": "pokemon-team-rocket"
      },
      {
        "name": "Pokemon White Flare",
        "slug": "pokemon-white-flare"
      },
      {
        "name": "Perfect Order",
        "slug": "pokemon-perfect-order"
      },
      {
        "name": "Japanese Ninja Spinner",
        "slug": "pokemon-japanese-ninja-spinner"
      },
      {
        "name": "Chinese CSV8C",
        "slug": "pokemon-chinese-csv8c"
      },
      {
        "name": "Chinese Gem Pack 4",
        "slug": "pokemon-chinese-gem-pack-4"
      },
      {
        "name": "Pokemon 1999 Topps Movie",
        "slug": "pokemon-1999-topps-movie"
      },
      {
        "name": "Pokemon 1999 Topps Movie Evolution",
        "slug": "pokemon-1999-topps-movie-evolution"
      },
      {
        "name": "Pokemon 1999 Topps TV",
        "slug": "pokemon-1999-topps-tv"
      },
      {
        "name": "Pokemon 2000 Topps Chrome",
        "slug": "pokemon-2000-topps-chrome"
      },
      {
        "name": "Pokemon 2000 Topps TV",
        "slug": "pokemon-2000-topps-tv"
      },
      {
        "name": "Pokemon 2020 Battle Academy",
        "slug": "pokemon-2020-battle-academy"
      },
      {
        "name": "Pokemon Ancient Origins",
        "slug": "pokemon-ancient-origins"
      },
      {
        "name": "Pokemon Aquapolis",
        "slug": "pokemon-aquapolis"
      },
      {
        "name": "Pokemon Arceus",
        "slug": "pokemon-arceus"
      },
      {
        "name": "Pokemon Astral Radiance",
        "slug": "pokemon-astral-radiance"
      },
      {
        "name": "Pokemon BREAKpoint",
        "slug": "pokemon-breakpoint"
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
        "slug": "pokemon-battle-styles"
      },
      {
        "name": "Pokemon Best of Game",
        "slug": "pokemon-best-of-game"
      },
      {
        "name": "Pokemon Black & White",
        "slug": "pokemon-black-&-white"
      },
      {
        "name": "Pokemon Boundaries Crossed",
        "slug": "pokemon-boundaries-crossed"
      },
      {
        "name": "Pokemon Brilliant Stars",
        "slug": "pokemon-brilliant-stars"
      },
      {
        "name": "Pokemon Burger King",
        "slug": "pokemon-burger-king"
      },
      {
        "name": "Pokemon Burning Shadows",
        "slug": "pokemon-burning-shadows"
      },
      {
        "name": "Pokemon Call of Legends",
        "slug": "pokemon-call-of-legends"
      },
      {
        "name": "Pokemon Celestial Storm",
        "slug": "pokemon-celestial-storm"
      },
      {
        "name": "Pokemon Champion's Path",
        "slug": "pokemon-champion's-path"
      },
      {
        "name": "Pokemon Chilling Reign",
        "slug": "pokemon-chilling-reign"
      },
      {
        "name": "Pokemon Chinese 151 Collect",
        "slug": "pokemon-chinese-151-collect"
      },
      {
        "name": "Pokemon Chinese CS4aC",
        "slug": "pokemon-chinese-cs4ac"
      },
      {
        "name": "Pokemon Chinese CS4bC",
        "slug": "pokemon-chinese-cs4bc"
      },
      {
        "name": "Pokemon Chinese CSM2aC",
        "slug": "pokemon-chinese-csm2ac"
      },
      {
        "name": "Pokemon Chinese CSM2bC",
        "slug": "pokemon-chinese-csm2bc"
      },
      {
        "name": "Pokemon Chinese CSM2cC",
        "slug": "pokemon-chinese-csm2cc"
      },
      {
        "name": "Pokemon Chinese CSV4C",
        "slug": "pokemon-chinese-csv4c"
      },
      {
        "name": "Pokemon Chinese Gem Pack",
        "slug": "pokemon-chinese-gem-pack"
      },
      {
        "name": "Pokemon Chinese Gem Pack 2",
        "slug": "pokemon-chinese-gem-pack-2"
      },
      {
        "name": "Pokemon Chinese Gem Pack 3",
        "slug": "pokemon-chinese-gem-pack-3"
      },
      {
        "name": "Pokemon Chinese Promo",
        "slug": "pokemon-chinese-promo"
      },
      {
        "name": "Pokemon Chinese m2F",
        "slug": "pokemon-chinese-m2f"
      },
      {
        "name": "Pokemon Cosmic Eclipse",
        "slug": "pokemon-cosmic-eclipse"
      },
      {
        "name": "Pokemon Crimson Invasion",
        "slug": "pokemon-crimson-invasion"
      },
      {
        "name": "Pokemon Crystal Guardians",
        "slug": "pokemon-crystal-guardians"
      },
      {
        "name": "Pokemon Dark Explorers",
        "slug": "pokemon-dark-explorers"
      },
      {
        "name": "Pokemon Darkness Ablaze",
        "slug": "pokemon-darkness-ablaze"
      },
      {
        "name": "Pokemon Delta Species",
        "slug": "pokemon-delta-species"
      },
      {
        "name": "Pokemon Deoxys",
        "slug": "pokemon-deoxys"
      },
      {
        "name": "Pokemon Detective Pikachu",
        "slug": "pokemon-detective-pikachu"
      },
      {
        "name": "Pokemon Diamond & Pearl",
        "slug": "pokemon-diamond-&-pearl"
      },
      {
        "name": "Pokemon Double Crisis",
        "slug": "pokemon-double-crisis"
      },
      {
        "name": "Pokemon Dragon",
        "slug": "pokemon-dragon"
      },
      {
        "name": "Pokemon Dragon Frontiers",
        "slug": "pokemon-dragon-frontiers"
      },
      {
        "name": "Pokemon Dragon Majesty",
        "slug": "pokemon-dragon-majesty"
      },
      {
        "name": "Pokemon Dragon Vault",
        "slug": "pokemon-dragon-vault"
      },
      {
        "name": "Pokemon Dragons Exalted",
        "slug": "pokemon-dragons-exalted"
      },
      {
        "name": "Pokemon EX Latias & Latios",
        "slug": "pokemon-ex-latias-&-latios"
      },
      {
        "name": "Pokemon Emerald",
        "slug": "pokemon-emerald"
      },
      {
        "name": "Pokemon Emerging Powers",
        "slug": "pokemon-emerging-powers"
      },
      {
        "name": "Pokemon Expedition",
        "slug": "pokemon-expedition"
      },
      {
        "name": "Pokemon Fates Collide",
        "slug": "pokemon-fates-collide"
      },
      {
        "name": "Pokemon Fire Red & Leaf Green",
        "slug": "pokemon-fire-red-&-leaf-green"
      },
      {
        "name": "Pokemon Flashfire",
        "slug": "pokemon-flashfire"
      },
      {
        "name": "Pokemon Forbidden Light",
        "slug": "pokemon-forbidden-light"
      },
      {
        "name": "Pokemon Fossil",
        "slug": "pokemon-fossil"
      },
      {
        "name": "Pokemon Furious Fists",
        "slug": "pokemon-furious-fists"
      },
      {
        "name": "Pokemon Fusion Strike",
        "slug": "pokemon-fusion-strike"
      },
      {
        "name": "Pokemon Generations",
        "slug": "pokemon-generations"
      },
      {
        "name": "Pokemon Go",
        "slug": "pokemon-go"
      },
      {
        "name": "Pokemon Great Encounters",
        "slug": "pokemon-great-encounters"
      },
      {
        "name": "Pokemon Guardians Rising",
        "slug": "pokemon-guardians-rising"
      },
      {
        "name": "Pokemon Gym Challenge",
        "slug": "pokemon-gym-challenge"
      },
      {
        "name": "Pokemon Gym Heroes",
        "slug": "pokemon-gym-heroes"
      },
      {
        "name": "Pokemon HeartGold & SoulSilver",
        "slug": "pokemon-heartgold-&-soulsilver"
      },
      {
        "name": "Pokemon Hidden Fates",
        "slug": "pokemon-hidden-fates"
      },
      {
        "name": "Pokemon Hidden Legends",
        "slug": "pokemon-hidden-legends"
      },
      {
        "name": "Pokemon Holon Phantoms",
        "slug": "pokemon-holon-phantoms"
      },
      {
        "name": "Pokemon Japanese 10th Movie Commemoration Promo",
        "slug": "pokemon-japanese-10th-movie-commemoration-promo"
      },
      {
        "name": "Pokemon Japanese 1996 Carddass",
        "slug": "pokemon-japanese-1996-carddass"
      },
      {
        "name": "Pokemon Japanese 1997 Carddass",
        "slug": "pokemon-japanese-1997-carddass"
      },
      {
        "name": "Pokemon Japanese 2002 McDonald's",
        "slug": "pokemon-japanese-2002-mcdonald's"
      },
      {
        "name": "Pokemon Japanese 2005 Gift Box",
        "slug": "pokemon-japanese-2005-gift-box"
      },
      {
        "name": "Pokemon Japanese 20th Anniversary",
        "slug": "pokemon-japanese-20th-anniversary"
      },
      {
        "name": "Pokemon Japanese 25th Anniversary Collection",
        "slug": "pokemon-japanese-25th-anniversary-collection"
      },
      {
        "name": "Pokemon Japanese 25th Anniversary Golden Box",
        "slug": "pokemon-japanese-25th-anniversary-golden-box"
      },
      {
        "name": "Pokemon Japanese 25th Anniversary Promo",
        "slug": "pokemon-japanese-25th-anniversary-promo"
      },
      {
        "name": "Pokemon Japanese Alter Genesis",
        "slug": "pokemon-japanese-alter-genesis"
      },
      {
        "name": "Pokemon Japanese Ancient Roar",
        "slug": "pokemon-japanese-ancient-roar"
      },
      {
        "name": "Pokemon Japanese Awakening Legends",
        "slug": "pokemon-japanese-awakening-legends"
      },
      {
        "name": "Pokemon Japanese Awakening Psychic King",
        "slug": "pokemon-japanese-awakening-psychic-king"
      },
      {
        "name": "Pokemon Japanese Bandit Ring",
        "slug": "pokemon-japanese-bandit-ring"
      },
      {
        "name": "Pokemon Japanese Battle Partners",
        "slug": "pokemon-japanese-battle-partners"
      },
      {
        "name": "Pokemon Japanese Battle Region",
        "slug": "pokemon-japanese-battle-region"
      },
      {
        "name": "Pokemon Japanese Best of XY",
        "slug": "pokemon-japanese-best-of-xy"
      },
      {
        "name": "Pokemon Japanese Black Bolt",
        "slug": "pokemon-japanese-black-bolt"
      },
      {
        "name": "Pokemon Japanese Blue Sky Stream",
        "slug": "pokemon-japanese-blue-sky-stream"
      },
      {
        "name": "Pokemon Japanese CD Promo",
        "slug": "pokemon-japanese-cd-promo"
      },
      {
        "name": "Pokemon Japanese Challenge from the Darkness",
        "slug": "pokemon-japanese-challenge-from-the-darkness"
      },
      {
        "name": "Pokemon Japanese Charizard VMAX Starter Set",
        "slug": "pokemon-japanese-charizard-vmax-starter-set"
      },
      {
        "name": "Pokemon Japanese Clash of the Blue Sky",
        "slug": "pokemon-japanese-clash-of-the-blue-sky"
      },
      {
        "name": "Pokemon Japanese Classic: Blastoise",
        "slug": "pokemon-japanese-classic-blastoise"
      },
      {
        "name": "Pokemon Japanese Classic: Charizard",
        "slug": "pokemon-japanese-classic-charizard"
      },
      {
        "name": "Pokemon Japanese Classic: Venusaur",
        "slug": "pokemon-japanese-classic-venusaur"
      },
      {
        "name": "Pokemon Japanese Clay Burst",
        "slug": "pokemon-japanese-clay-burst"
      },
      {
        "name": "Pokemon Japanese Crimson Haze",
        "slug": "pokemon-japanese-crimson-haze"
      },
      {
        "name": "Pokemon Japanese Crossing the Ruins",
        "slug": "pokemon-japanese-crossing-the-ruins"
      },
      {
        "name": "Pokemon Japanese Cyber Judge",
        "slug": "pokemon-japanese-cyber-judge"
      },
      {
        "name": "Pokemon Japanese Dark Phantasma",
        "slug": "pokemon-japanese-dark-phantasma"
      },
      {
        "name": "Pokemon Japanese Darkness, and to Light",
        "slug": "pokemon-japanese-darkness-and-to-light"
      },
      {
        "name": "Pokemon Japanese Double Blaze",
        "slug": "pokemon-japanese-double-blaze"
      },
      {
        "name": "Pokemon Japanese Double Crisis",
        "slug": "pokemon-japanese-double-crisis"
      },
      {
        "name": "Pokemon Japanese Dream League",
        "slug": "pokemon-japanese-dream-league"
      },
      {
        "name": "Pokemon Japanese Dream Shine Collection",
        "slug": "pokemon-japanese-dream-shine-collection"
      },
      {
        "name": "Pokemon Japanese Eevee Heroes",
        "slug": "pokemon-japanese-eevee-heroes"
      },
      {
        "name": "Pokemon Japanese Emerald Break",
        "slug": "pokemon-japanese-emerald-break"
      },
      {
        "name": "Pokemon Japanese Expansion Pack",
        "slug": "pokemon-japanese-expansion-pack"
      },
      {
        "name": "Pokemon Japanese Expedition Expansion Pack",
        "slug": "pokemon-japanese-expedition-expansion-pack"
      },
      {
        "name": "Pokemon Japanese Fusion Arts",
        "slug": "pokemon-japanese-fusion-arts"
      },
      {
        "name": "Pokemon Japanese Future Flash",
        "slug": "pokemon-japanese-future-flash"
      },
      {
        "name": "Pokemon Japanese GG End",
        "slug": "pokemon-japanese-gg-end"
      },
      {
        "name": "Pokemon Japanese GX Ultra Shiny",
        "slug": "pokemon-japanese-gx-ultra-shiny"
      },
      {
        "name": "Pokemon Japanese Gengar Vmax High-Class",
        "slug": "pokemon-japanese-gengar-vmax-high-class"
      },
      {
        "name": "Pokemon Japanese Glory of Team Rocket",
        "slug": "pokemon-japanese-glory-of-team-rocket"
      },
      {
        "name": "Pokemon Japanese Go",
        "slug": "pokemon-japanese-go"
      },
      {
        "name": "Pokemon Japanese Gold, Silver, New World",
        "slug": "pokemon-japanese-gold-silver-new-world"
      },
      {
        "name": "Pokemon Japanese Golden Sky, Silvery Ocean",
        "slug": "pokemon-japanese-golden-sky-silvery-ocean"
      },
      {
        "name": "Pokemon Japanese Heat Wave Arena",
        "slug": "pokemon-japanese-heat-wave-arena"
      },
      {
        "name": "Pokemon Japanese Holon Phantom",
        "slug": "pokemon-japanese-holon-phantom"
      },
      {
        "name": "Pokemon Japanese Holon Research",
        "slug": "pokemon-japanese-holon-research"
      },
      {
        "name": "Pokemon Japanese Incandescent Arcana",
        "slug": "pokemon-japanese-incandescent-arcana"
      },
      {
        "name": "Pokemon Japanese Inferno X",
        "slug": "pokemon-japanese-inferno-x"
      },
      {
        "name": "Pokemon Japanese Intense Fight in the Destroyed Sky",
        "slug": "pokemon-japanese-intense-fight-in-the-destroyed-sky"
      },
      {
        "name": "Pokemon Japanese Jungle",
        "slug": "pokemon-japanese-jungle"
      },
      {
        "name": "Pokemon Japanese Leaders' Stadium",
        "slug": "pokemon-japanese-leaders'-stadium"
      },
      {
        "name": "Pokemon Japanese Legendary Shine Collection",
        "slug": "pokemon-japanese-legendary-shine-collection"
      },
      {
        "name": "Pokemon Japanese Lost Abyss",
        "slug": "pokemon-japanese-lost-abyss"
      },
      {
        "name": "Pokemon Japanese Mask of Change",
        "slug": "pokemon-japanese-mask-of-change"
      },
      {
        "name": "Pokemon Japanese Matchless Fighter",
        "slug": "pokemon-japanese-matchless-fighter"
      },
      {
        "name": "Pokemon Japanese Mega Brave",
        "slug": "pokemon-japanese-mega-brave"
      },
      {
        "name": "Pokemon Japanese Mega Starter Deck Gengar Ex",
        "slug": "pokemon-japanese-mega-starter-deck-gengar-ex"
      },
      {
        "name": "Pokemon Japanese Mega Symphonia",
        "slug": "pokemon-japanese-mega-symphonia"
      },
      {
        "name": "Pokemon Japanese Miracle Twins",
        "slug": "pokemon-japanese-miracle-twins"
      },
      {
        "name": "Pokemon Japanese Mysterious Mountains",
        "slug": "pokemon-japanese-mysterious-mountains"
      },
      {
        "name": "Pokemon Japanese Mystery of the Fossils",
        "slug": "pokemon-japanese-mystery-of-the-fossils"
      },
      {
        "name": "Pokemon Japanese Neo Premium File",
        "slug": "pokemon-japanese-neo-premium-file"
      },
      {
        "name": "Pokemon Japanese Night Unison",
        "slug": "pokemon-japanese-night-unison"
      },
      {
        "name": "Pokemon Japanese Night Wanderer",
        "slug": "pokemon-japanese-night-wanderer"
      },
      {
        "name": "Pokemon Japanese Nihil Zero",
        "slug": "pokemon-japanese-nihil-zero"
      },
      {
        "name": "Pokemon Japanese Offense and Defense of the Furthest Ends",
        "slug": "pokemon-japanese-offense-and-defense-of-the-furthest-ends"
      },
      {
        "name": "Pokemon Japanese Old Maid",
        "slug": "pokemon-japanese-old-maid"
      },
      {
        "name": "Pokemon Japanese Paradigm Trigger",
        "slug": "pokemon-japanese-paradigm-trigger"
      },
      {
        "name": "Pokemon Japanese Paradise Dragona",
        "slug": "pokemon-japanese-paradise-dragona"
      },
      {
        "name": "Pokemon Japanese Phantom Gate",
        "slug": "pokemon-japanese-phantom-gate"
      },
      {
        "name": "Pokemon Japanese Player's Club",
        "slug": "pokemon-japanese-player's-club"
      },
      {
        "name": "Pokemon Japanese PokeKyun Collection",
        "slug": "pokemon-japanese-pokekyun-collection"
      },
      {
        "name": "Pokemon Japanese Raging Surf",
        "slug": "pokemon-japanese-raging-surf"
      },
      {
        "name": "Pokemon Japanese Remix Bout",
        "slug": "pokemon-japanese-remix-bout"
      },
      {
        "name": "Pokemon Japanese Rising Fist",
        "slug": "pokemon-japanese-rising-fist"
      },
      {
        "name": "Pokemon Japanese Rocket Gang",
        "slug": "pokemon-japanese-rocket-gang"
      },
      {
        "name": "Pokemon Japanese Rocket Gang Strikes Back",
        "slug": "pokemon-japanese-rocket-gang-strikes-back"
      },
      {
        "name": "Pokemon Japanese Ruler of the Black Flame",
        "slug": "pokemon-japanese-ruler-of-the-black-flame"
      },
      {
        "name": "Pokemon Japanese SVG Special Set",
        "slug": "pokemon-japanese-svg-special-set"
      },
      {
        "name": "Pokemon Japanese Scarlet & Violet 151",
        "slug": "pokemon-japanese-scarlet-&-violet-151"
      },
      {
        "name": "Pokemon Japanese Scarlet Ex",
        "slug": "pokemon-japanese-scarlet-ex"
      },
      {
        "name": "Pokemon Japanese Shining Darkness",
        "slug": "pokemon-japanese-shining-darkness"
      },
      {
        "name": "Pokemon Japanese Shining Legends",
        "slug": "pokemon-japanese-shining-legends"
      },
      {
        "name": "Pokemon Japanese Shiny Collection",
        "slug": "pokemon-japanese-shiny-collection"
      },
      {
        "name": "Pokemon Japanese Shiny Star V",
        "slug": "pokemon-japanese-shiny-star-v"
      },
      {
        "name": "Pokemon Japanese Shiny Treasure ex",
        "slug": "pokemon-japanese-shiny-treasure-ex"
      },
      {
        "name": "Pokemon Japanese Sky Legend",
        "slug": "pokemon-japanese-sky-legend"
      },
      {
        "name": "Pokemon Japanese Snow Hazard",
        "slug": "pokemon-japanese-snow-hazard"
      },
      {
        "name": "Pokemon Japanese Southern Islands",
        "slug": "pokemon-japanese-southern-islands"
      },
      {
        "name": "Pokemon Japanese Split Earth",
        "slug": "pokemon-japanese-split-earth"
      },
      {
        "name": "Pokemon Japanese Star Birth",
        "slug": "pokemon-japanese-star-birth"
      },
      {
        "name": "Pokemon Japanese Start Deck 100",
        "slug": "pokemon-japanese-start-deck-100"
      },
      {
        "name": "Pokemon Japanese Start Deck 100 Battle Collection",
        "slug": "pokemon-japanese-start-deck-100-battle-collection"
      },
      {
        "name": "Pokemon Japanese Stellar Miracle",
        "slug": "pokemon-japanese-stellar-miracle"
      },
      {
        "name": "Pokemon Japanese Super Electric Breaker",
        "slug": "pokemon-japanese-super-electric-breaker"
      },
      {
        "name": "Pokemon Japanese Tag All Stars",
        "slug": "pokemon-japanese-tag-all-stars"
      },
      {
        "name": "Pokemon Japanese Tag Bolt",
        "slug": "pokemon-japanese-tag-bolt"
      },
      {
        "name": "Pokemon Japanese Tag Team Starter Set",
        "slug": "pokemon-japanese-tag-team-starter-set"
      },
      {
        "name": "Pokemon Japanese Terastal Festival",
        "slug": "pokemon-japanese-terastal-festival"
      },
      {
        "name": "Pokemon Japanese The Town on No Map",
        "slug": "pokemon-japanese-the-town-on-no-map"
      },
      {
        "name": "Pokemon Japanese Time Gazer",
        "slug": "pokemon-japanese-time-gazer"
      },
      {
        "name": "Pokemon Japanese Topsun",
        "slug": "pokemon-japanese-topsun"
      },
      {
        "name": "Pokemon Japanese Triplet Beat",
        "slug": "pokemon-japanese-triplet-beat"
      },
      {
        "name": "Pokemon Japanese VMAX Climax",
        "slug": "pokemon-japanese-vmax-climax"
      },
      {
        "name": "Pokemon Japanese VS",
        "slug": "pokemon-japanese-vs"
      },
      {
        "name": "Pokemon Japanese VSTAR Universe",
        "slug": "pokemon-japanese-vstar-universe"
      },
      {
        "name": "Pokemon Japanese Vending",
        "slug": "pokemon-japanese-vending"
      },
      {
        "name": "Pokemon Japanese Violet Ex",
        "slug": "pokemon-japanese-violet-ex"
      },
      {
        "name": "Pokemon Japanese Web",
        "slug": "pokemon-japanese-web"
      },
      {
        "name": "Pokemon Japanese White Flare",
        "slug": "pokemon-japanese-white-flare"
      },
      {
        "name": "Pokemon Japanese Wild Blaze",
        "slug": "pokemon-japanese-wild-blaze"
      },
      {
        "name": "Pokemon Japanese Wild Force",
        "slug": "pokemon-japanese-wild-force"
      },
      {
        "name": "Pokemon Japanese Wind from the Sea",
        "slug": "pokemon-japanese-wind-from-the-sea"
      },
      {
        "name": "Pokemon Japanese World Championships 2023",
        "slug": "pokemon-japanese-world-championships-2023"
      },
      {
        "name": "Pokemon Japanese Yamabuki City Gym",
        "slug": "pokemon-japanese-yamabuki-city-gym"
      },
      {
        "name": "Pokemon Jungle",
        "slug": "pokemon-jungle"
      },
      {
        "name": "Pokemon Korean Eevee Heroes",
        "slug": "pokemon-korean-eevee-heroes"
      },
      {
        "name": "Pokemon Korean Glory Of Team Rocket",
        "slug": "pokemon-korean-glory-of-team-rocket"
      },
      {
        "name": "Pokemon Korean Promo",
        "slug": "pokemon-korean-promo"
      },
      {
        "name": "Pokemon Korean Scarlet & Violet 151",
        "slug": "pokemon-korean-scarlet-&-violet-151"
      },
      {
        "name": "Pokemon Korean Terastal Festival ex",
        "slug": "pokemon-korean-terastal-festival-ex"
      },
      {
        "name": "Pokemon Legend Maker",
        "slug": "pokemon-legend-maker"
      },
      {
        "name": "Pokemon Legendary Collection",
        "slug": "pokemon-legendary-collection"
      },
      {
        "name": "Pokemon Legendary Treasures",
        "slug": "pokemon-legendary-treasures"
      },
      {
        "name": "Pokemon Legends Awakened",
        "slug": "pokemon-legends-awakened"
      },
      {
        "name": "Pokemon Lost Origin",
        "slug": "pokemon-lost-origin"
      },
      {
        "name": "Pokemon Lost Thunder",
        "slug": "pokemon-lost-thunder"
      },
      {
        "name": "Pokemon Majestic Dawn",
        "slug": "pokemon-majestic-dawn"
      },
      {
        "name": "Pokemon McDonalds 2018",
        "slug": "pokemon-mcdonalds-2018"
      },
      {
        "name": "Pokemon McDonalds 2019",
        "slug": "pokemon-mcdonalds-2019"
      },
      {
        "name": "Pokemon McDonalds 2021",
        "slug": "pokemon-mcdonalds-2021"
      },
      {
        "name": "Pokemon McDonalds 2022",
        "slug": "pokemon-mcdonalds-2022"
      },
      {
        "name": "Pokemon McDonalds 2023",
        "slug": "pokemon-mcdonalds-2023"
      },
      {
        "name": "Pokemon McDonalds 2024",
        "slug": "pokemon-mcdonalds-2024"
      },
      {
        "name": "Pokemon Mysterious Treasures",
        "slug": "pokemon-mysterious-treasures"
      },
      {
        "name": "Pokemon Neo Destiny",
        "slug": "pokemon-neo-destiny"
      },
      {
        "name": "Pokemon Neo Discovery",
        "slug": "pokemon-neo-discovery"
      },
      {
        "name": "Pokemon Neo Genesis",
        "slug": "pokemon-neo-genesis"
      },
      {
        "name": "Pokemon Neo Revelation",
        "slug": "pokemon-neo-revelation"
      },
      {
        "name": "Pokemon Next Destinies",
        "slug": "pokemon-next-destinies"
      },
      {
        "name": "Pokemon Noble Victories",
        "slug": "pokemon-noble-victories"
      },
      {
        "name": "Pokemon Obsidian Flames",
        "slug": "pokemon-obsidian-flames"
      },
      {
        "name": "Pokemon POP Series 1",
        "slug": "pokemon-pop-series-1"
      },
      {
        "name": "Pokemon POP Series 2",
        "slug": "pokemon-pop-series-2"
      },
      {
        "name": "Pokemon POP Series 3",
        "slug": "pokemon-pop-series-3"
      },
      {
        "name": "Pokemon POP Series 4",
        "slug": "pokemon-pop-series-4"
      },
      {
        "name": "Pokemon POP Series 5",
        "slug": "pokemon-pop-series-5"
      },
      {
        "name": "Pokemon POP Series 6",
        "slug": "pokemon-pop-series-6"
      },
      {
        "name": "Pokemon POP Series 9",
        "slug": "pokemon-pop-series-9"
      },
      {
        "name": "Pokemon Paldea Evolved",
        "slug": "pokemon-paldea-evolved"
      },
      {
        "name": "Pokemon Paradox Rift",
        "slug": "pokemon-paradox-rift"
      },
      {
        "name": "Pokemon Phantom Forces",
        "slug": "pokemon-phantom-forces"
      },
      {
        "name": "Pokemon Pikachu Libre & Suicune",
        "slug": "pokemon-pikachu-libre-&-suicune"
      },
      {
        "name": "Pokemon Plasma Blast",
        "slug": "pokemon-plasma-blast"
      },
      {
        "name": "Pokemon Plasma Freeze",
        "slug": "pokemon-plasma-freeze"
      },
      {
        "name": "Pokemon Plasma Storm",
        "slug": "pokemon-plasma-storm"
      },
      {
        "name": "Pokemon Platinum",
        "slug": "pokemon-platinum"
      },
      {
        "name": "Pokemon Power Keepers",
        "slug": "pokemon-power-keepers"
      },
      {
        "name": "Pokemon Primal Clash",
        "slug": "pokemon-primal-clash"
      },
      {
        "name": "Pokemon Rebel Clash",
        "slug": "pokemon-rebel-clash"
      },
      {
        "name": "Pokemon Rising Rivals",
        "slug": "pokemon-rising-rivals"
      },
      {
        "name": "Pokemon Roaring Skies",
        "slug": "pokemon-roaring-skies"
      },
      {
        "name": "Pokemon Ruby & Sapphire",
        "slug": "pokemon-ruby-&-sapphire"
      },
      {
        "name": "Pokemon Rumble",
        "slug": "pokemon-rumble"
      },
      {
        "name": "Pokemon Sandstorm",
        "slug": "pokemon-sandstorm"
      },
      {
        "name": "Pokemon Scarlet & Violet",
        "slug": "pokemon-scarlet-&-violet"
      },
      {
        "name": "Pokemon Scarlet & Violet Energy",
        "slug": "pokemon-scarlet-&-violet-energy"
      },
      {
        "name": "Pokemon Secret Wonders",
        "slug": "pokemon-secret-wonders"
      },
      {
        "name": "Pokemon Shining Fates",
        "slug": "pokemon-shining-fates"
      },
      {
        "name": "Pokemon Shining Legends",
        "slug": "pokemon-shining-legends"
      },
      {
        "name": "Pokemon Shrouded Fable",
        "slug": "pokemon-shrouded-fable"
      },
      {
        "name": "Pokemon Silver Tempest",
        "slug": "pokemon-silver-tempest"
      },
      {
        "name": "Pokemon Skyridge",
        "slug": "pokemon-skyridge"
      },
      {
        "name": "Pokemon Southern Islands",
        "slug": "pokemon-southern-islands"
      },
      {
        "name": "Pokemon Steam Siege",
        "slug": "pokemon-steam-siege"
      },
      {
        "name": "Pokemon Stellar Crown",
        "slug": "pokemon-stellar-crown"
      },
      {
        "name": "Pokemon Stormfront",
        "slug": "pokemon-stormfront"
      },
      {
        "name": "Pokemon Sun & Moon",
        "slug": "pokemon-sun-&-moon"
      },
      {
        "name": "Pokemon Supreme Victors",
        "slug": "pokemon-supreme-victors"
      },
      {
        "name": "Pokemon Sword & Shield",
        "slug": "pokemon-sword-&-shield"
      },
      {
        "name": "Pokemon TCG Classic: Blastoise Deck",
        "slug": "pokemon-tcg-classic-blastoise-deck"
      },
      {
        "name": "Pokemon TCG Classic: Charizard Deck",
        "slug": "pokemon-tcg-classic-charizard-deck"
      },
      {
        "name": "Pokemon TCG Classic: Venusaur Deck",
        "slug": "pokemon-tcg-classic-venusaur-deck"
      },
      {
        "name": "Pokemon Team Magma & Team Aqua",
        "slug": "pokemon-team-magma-&-team-aqua"
      },
      {
        "name": "Pokemon Team Rocket Returns",
        "slug": "pokemon-team-rocket-returns"
      },
      {
        "name": "Pokemon Team Up",
        "slug": "pokemon-team-up"
      },
      {
        "name": "Pokemon Temporal Forces",
        "slug": "pokemon-temporal-forces"
      },
      {
        "name": "Pokemon Trick or Trade 2022",
        "slug": "pokemon-trick-or-trade-2022"
      },
      {
        "name": "Pokemon Trick or Trade 2023",
        "slug": "pokemon-trick-or-trade-2023"
      },
      {
        "name": "Pokemon Trick or Trade 2024",
        "slug": "pokemon-trick-or-trade-2024"
      },
      {
        "name": "Pokemon Triumphant",
        "slug": "pokemon-triumphant"
      },
      {
        "name": "Pokemon Twilight Masquerade",
        "slug": "pokemon-twilight-masquerade"
      },
      {
        "name": "Pokemon Ultra Prism",
        "slug": "pokemon-ultra-prism"
      },
      {
        "name": "Pokemon Unbroken Bonds",
        "slug": "pokemon-unbroken-bonds"
      },
      {
        "name": "Pokemon Undaunted",
        "slug": "pokemon-undaunted"
      },
      {
        "name": "Pokemon Unified Minds",
        "slug": "pokemon-unified-minds"
      },
      {
        "name": "Pokemon Unleashed",
        "slug": "pokemon-unleashed"
      },
      {
        "name": "Pokemon Unseen Forces",
        "slug": "pokemon-unseen-forces"
      },
      {
        "name": "Pokemon Vivid Voltage",
        "slug": "pokemon-vivid-voltage"
      },
      {
        "name": "Pokemon World Championships 2019",
        "slug": "pokemon-world-championships-2019"
      },
      {
        "name": "Pokemon World Championships 2023",
        "slug": "pokemon-world-championships-2023"
      },
      {
        "name": "Pokemon XY",
        "slug": "pokemon-xy"
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
        "slug": "magic-bloomburrow"
      },
      {
        "name": "Magic Marvel Spider-Man",
        "slug": "magic-marvel-spider-man"
      },
      {
        "name": "Magic Final Fantasy",
        "slug": "magic-final-fantasy"
      },
      {
        "name": "Magic Lord of the Rings",
        "slug": "magic-lord-of-the-rings"
      },
      {
        "name": "Magic Avatar: The Last Airbender",
        "slug": "magic-avatar-the-last-airbender"
      },
      {
        "name": "Magic Secret Lair Drop",
        "slug": "magic-secret-lair-drop"
      },
      {
        "name": "Magic Lorwyn Eclipsed",
        "slug": "magic-lorwyn-eclipsed"
      },
      {
        "name": "Magic Alpha",
        "slug": "magic-alpha"
      },
      {
        "name": "Magic Final Fantasy Commander",
        "slug": "magic-final-fantasy-commander"
      },
      {
        "name": "Magic Fallout",
        "slug": "magic-fallout"
      },
      {
        "name": "Magic Edge of Eternities",
        "slug": "magic-edge-of-eternities"
      },
      {
        "name": "Magic Aetherdrift",
        "slug": "magic-aetherdrift"
      },
      {
        "name": "Magic The List Reprints",
        "slug": "magic-the-list-reprints"
      },
      {
        "name": "Magic Revised",
        "slug": "magic-revised"
      },
      {
        "name": "Magic 4th Edition",
        "slug": "magic-4th-edition"
      },
      {
        "name": "Magic Doctor Who",
        "slug": "magic-doctor-who"
      },
      {
        "name": "Magic Foundations",
        "slug": "magic-foundations"
      },
      {
        "name": "Magic Modern Horizons 3",
        "slug": "magic-modern-horizons-3"
      },
      {
        "name": "Magic Tarkir: Dragonstorm",
        "slug": "magic-tarkir-dragonstorm"
      },
      {
        "name": "Magic Commander Masters",
        "slug": "magic-commander-masters"
      },
      {
        "name": "Teenage Mutant Ninja Turtles",
        "slug": "magic-teenage-mutant-ninja-turtles"
      },
      {
        "name": "Teenage Mutant Ninja Turtles Art Series",
        "slug": "magic-teenage-mutant-ninja-turtles-art-series"
      },
      {
        "name": "Teenage Mutant Ninja Turtles Commander",
        "slug": "magic-teenage-mutant-ninja-turtles-commander"
      },
      {
        "name": "Teenage Mutant Ninja Turtles Source Material",
        "slug": "magic-teenage-mutant-ninja-turtles-source-material"
      },
      {
        "name": "Magic 10th Edition",
        "slug": "magic-10th-edition"
      },
      {
        "name": "Magic 30th Anniversary",
        "slug": "magic-30th-anniversary"
      },
      {
        "name": "Magic 5th Edition",
        "slug": "magic-5th-edition"
      },
      {
        "name": "Magic 6th Edition",
        "slug": "magic-6th-edition"
      },
      {
        "name": "Magic 7th Edition",
        "slug": "magic-7th-edition"
      },
      {
        "name": "Magic 8th Edition",
        "slug": "magic-8th-edition"
      },
      {
        "name": "Magic 9th Edition",
        "slug": "magic-9th-edition"
      },
      {
        "name": "Magic Adventures in the Forgotten Realms",
        "slug": "magic-adventures-in-the-forgotten-realms"
      },
      {
        "name": "Magic Adventures in the Forgotten Realms Commander",
        "slug": "magic-adventures-in-the-forgotten-realms-commander"
      },
      {
        "name": "Magic Aether Revolt",
        "slug": "magic-aether-revolt"
      },
      {
        "name": "Magic Aetherdrift Art Series",
        "slug": "magic-aetherdrift-art-series"
      },
      {
        "name": "Magic Aetherdrift Commander",
        "slug": "magic-aetherdrift-commander"
      },
      {
        "name": "Magic Ajani vs Nicol Bolas",
        "slug": "magic-ajani-vs-nicol-bolas"
      },
      {
        "name": "Magic Alara Reborn",
        "slug": "magic-alara-reborn"
      },
      {
        "name": "Magic Alliances",
        "slug": "magic-alliances"
      },
      {
        "name": "Magic Amonkhet",
        "slug": "magic-amonkhet"
      },
      {
        "name": "Magic Anthologies",
        "slug": "magic-anthologies"
      },
      {
        "name": "Magic Antiquities",
        "slug": "magic-antiquities"
      },
      {
        "name": "Magic Apocalypse",
        "slug": "magic-apocalypse"
      },
      {
        "name": "Magic Arabian Nights",
        "slug": "magic-arabian-nights"
      },
      {
        "name": "Magic Archenemy",
        "slug": "magic-archenemy"
      },
      {
        "name": "Magic Arena League",
        "slug": "magic-arena-league"
      },
      {
        "name": "Magic Assassin's Creed",
        "slug": "magic-assassin's-creed"
      },
      {
        "name": "Magic Avacyn Restored",
        "slug": "magic-avacyn-restored"
      },
      {
        "name": "Magic Avatar: The Last Airbender Art Series",
        "slug": "magic-avatar-the-last-airbender-art-series"
      },
      {
        "name": "Magic Avatar: The Last Airbender Eternal",
        "slug": "magic-avatar-the-last-airbender-eternal"
      },
      {
        "name": "Magic Battle Royale",
        "slug": "magic-battle-royale"
      },
      {
        "name": "Magic Battle for Zendikar",
        "slug": "magic-battle-for-zendikar"
      },
      {
        "name": "Magic Battlebond",
        "slug": "magic-battlebond"
      },
      {
        "name": "Magic Beatdown Box Set",
        "slug": "magic-beatdown-box-set"
      },
      {
        "name": "Magic Beta",
        "slug": "magic-beta"
      },
      {
        "name": "Magic Betrayers of Kamigawa",
        "slug": "magic-betrayers-of-kamigawa"
      },
      {
        "name": "Magic Bloomburrow Art Series",
        "slug": "magic-bloomburrow-art-series"
      },
      {
        "name": "Magic Bloomburrow Commander",
        "slug": "magic-bloomburrow-commander"
      },
      {
        "name": "Magic Born of the Gods",
        "slug": "magic-born-of-the-gods"
      },
      {
        "name": "Magic Brother's War",
        "slug": "magic-brother's-war"
      },
      {
        "name": "Magic Brother's War Commander",
        "slug": "magic-brother's-war-commander"
      },
      {
        "name": "Magic Brother's War Retro Artifacts",
        "slug": "magic-brother's-war-retro-artifacts"
      },
      {
        "name": "Magic Champions of Kamigawa",
        "slug": "magic-champions-of-kamigawa"
      },
      {
        "name": "Magic Chronicles",
        "slug": "magic-chronicles"
      },
      {
        "name": "Magic Coldsnap",
        "slug": "magic-coldsnap"
      },
      {
        "name": "Magic Coldsnap Theme Decks",
        "slug": "magic-coldsnap-theme-decks"
      },
      {
        "name": "Magic Collector's Edition",
        "slug": "magic-collector's-edition"
      },
      {
        "name": "Magic Commander",
        "slug": "magic-commander"
      },
      {
        "name": "Magic Commander 2013",
        "slug": "magic-commander-2013"
      },
      {
        "name": "Magic Commander 2014",
        "slug": "magic-commander-2014"
      },
      {
        "name": "Magic Commander 2015",
        "slug": "magic-commander-2015"
      },
      {
        "name": "Magic Commander 2016",
        "slug": "magic-commander-2016"
      },
      {
        "name": "Magic Commander 2017",
        "slug": "magic-commander-2017"
      },
      {
        "name": "Magic Commander 2018",
        "slug": "magic-commander-2018"
      },
      {
        "name": "Magic Commander 2019",
        "slug": "magic-commander-2019"
      },
      {
        "name": "Magic Commander 2020",
        "slug": "magic-commander-2020"
      },
      {
        "name": "Magic Commander 2021",
        "slug": "magic-commander-2021"
      },
      {
        "name": "Magic Commander Anthology",
        "slug": "magic-commander-anthology"
      },
      {
        "name": "Magic Commander Anthology Volume II",
        "slug": "magic-commander-anthology-volume-ii"
      },
      {
        "name": "Magic Commander Collection Green",
        "slug": "magic-commander-collection-green"
      },
      {
        "name": "Magic Commander Legends",
        "slug": "magic-commander-legends"
      },
      {
        "name": "Magic Commander Legends: Battle for Baldur's Gate",
        "slug": "magic-commander-legends-battle-for-baldur's-gate"
      },
      {
        "name": "Magic Commanders Arsenal",
        "slug": "magic-commanders-arsenal"
      },
      {
        "name": "Magic Conflux",
        "slug": "magic-conflux"
      },
      {
        "name": "Magic Conspiracy",
        "slug": "magic-conspiracy"
      },
      {
        "name": "Magic Conspiracy Take the Crown",
        "slug": "magic-conspiracy-take-the-crown"
      },
      {
        "name": "Magic Core Set 2012",
        "slug": "magic-core-set-2012"
      },
      {
        "name": "Magic Core Set 2013",
        "slug": "magic-core-set-2013"
      },
      {
        "name": "Magic Core Set 2019",
        "slug": "magic-core-set-2019"
      },
      {
        "name": "Magic Core Set 2020",
        "slug": "magic-core-set-2020"
      },
      {
        "name": "Magic Core Set 2021",
        "slug": "magic-core-set-2021"
      },
      {
        "name": "Magic Dark Ascension",
        "slug": "magic-dark-ascension"
      },
      {
        "name": "Magic Darksteel",
        "slug": "magic-darksteel"
      },
      {
        "name": "Magic Dissension",
        "slug": "magic-dissension"
      },
      {
        "name": "Magic Dominaria",
        "slug": "magic-dominaria"
      },
      {
        "name": "Magic Dominaria Remastered",
        "slug": "magic-dominaria-remastered"
      },
      {
        "name": "Magic Dominaria United",
        "slug": "magic-dominaria-united"
      },
      {
        "name": "Magic Dominaria United Commander",
        "slug": "magic-dominaria-united-commander"
      },
      {
        "name": "Magic Double Masters",
        "slug": "magic-double-masters"
      },
      {
        "name": "Magic Double Masters 2022",
        "slug": "magic-double-masters-2022"
      },
      {
        "name": "Magic Dragons Maze",
        "slug": "magic-dragons-maze"
      },
      {
        "name": "Magic Dragons of Tarkir",
        "slug": "magic-dragons-of-tarkir"
      },
      {
        "name": "Magic Duel Deck: Elspeth vs Kiora",
        "slug": "magic-duel-deck-elspeth-vs-kiora"
      },
      {
        "name": "Magic Duels of the Planeswalkers",
        "slug": "magic-duels-of-the-planeswalkers"
      },
      {
        "name": "Magic Duskmourn: House of Horror",
        "slug": "magic-duskmourn-house-of-horror"
      },
      {
        "name": "Magic Duskmourn: House of Horror Commander",
        "slug": "magic-duskmourn-house-of-horror-commander"
      },
      {
        "name": "Magic Edge of Eternities Art Series",
        "slug": "magic-edge-of-eternities-art-series"
      },
      {
        "name": "Magic Edge of Eternities Commander",
        "slug": "magic-edge-of-eternities-commander"
      },
      {
        "name": "Magic Edge of Eternities Stellar Sights",
        "slug": "magic-edge-of-eternities-stellar-sights"
      },
      {
        "name": "Magic Eldritch Moon",
        "slug": "magic-eldritch-moon"
      },
      {
        "name": "Magic Elspeth vs Tezzeret",
        "slug": "magic-elspeth-vs-tezzeret"
      },
      {
        "name": "Magic Elves vs Goblins",
        "slug": "magic-elves-vs-goblins"
      },
      {
        "name": "Magic Eternal Masters",
        "slug": "magic-eternal-masters"
      },
      {
        "name": "Magic Eventide",
        "slug": "magic-eventide"
      },
      {
        "name": "Magic Exodus",
        "slug": "magic-exodus"
      },
      {
        "name": "Magic Fallen Empires",
        "slug": "magic-fallen-empires"
      },
      {
        "name": "Magic Fate Reforged",
        "slug": "magic-fate-reforged"
      },
      {
        "name": "Magic Fifth Dawn",
        "slug": "magic-fifth-dawn"
      },
      {
        "name": "Magic Final Fantasy Art Series",
        "slug": "magic-final-fantasy-art-series"
      },
      {
        "name": "Magic Final Fantasy Through the Ages",
        "slug": "magic-final-fantasy-through-the-ages"
      },
      {
        "name": "Magic Foundations Art Series",
        "slug": "magic-foundations-art-series"
      },
      {
        "name": "Magic Foundations Jumpstart",
        "slug": "magic-foundations-jumpstart"
      },
      {
        "name": "Magic Friday Night",
        "slug": "magic-friday-night"
      },
      {
        "name": "Magic From the Vault Annihilation",
        "slug": "magic-from-the-vault-annihilation"
      },
      {
        "name": "Magic From the Vault Dragons",
        "slug": "magic-from-the-vault-dragons"
      },
      {
        "name": "Magic From the Vault Exiled",
        "slug": "magic-from-the-vault-exiled"
      },
      {
        "name": "Magic From the Vault Legends",
        "slug": "magic-from-the-vault-legends"
      },
      {
        "name": "Magic From the Vault Lore",
        "slug": "magic-from-the-vault-lore"
      },
      {
        "name": "Magic From the Vault Realms",
        "slug": "magic-from-the-vault-realms"
      },
      {
        "name": "Magic From the Vault Relics",
        "slug": "magic-from-the-vault-relics"
      },
      {
        "name": "Magic From the Vault Twenty",
        "slug": "magic-from-the-vault-twenty"
      },
      {
        "name": "Magic Future Sight",
        "slug": "magic-future-sight"
      },
      {
        "name": "Magic Game Night 2019",
        "slug": "magic-game-night-2019"
      },
      {
        "name": "Magic Garruk vs Liliana",
        "slug": "magic-garruk-vs-liliana"
      },
      {
        "name": "Magic Gatecrash",
        "slug": "magic-gatecrash"
      },
      {
        "name": "Magic Gateway",
        "slug": "magic-gateway"
      },
      {
        "name": "Magic Grand Prix",
        "slug": "magic-grand-prix"
      },
      {
        "name": "Magic Guildpact",
        "slug": "magic-guildpact"
      },
      {
        "name": "Magic Guilds of Ravnica",
        "slug": "magic-guilds-of-ravnica"
      },
      {
        "name": "Magic Guilds of Ravnica Guild Kits",
        "slug": "magic-guilds-of-ravnica-guild-kits"
      },
      {
        "name": "Magic Heroes vs Monsters",
        "slug": "magic-heroes-vs-monsters"
      },
      {
        "name": "Magic Homelands",
        "slug": "magic-homelands"
      },
      {
        "name": "Magic Hour of Devastation",
        "slug": "magic-hour-of-devastation"
      },
      {
        "name": "Magic Ice Age",
        "slug": "magic-ice-age"
      },
      {
        "name": "Magic Iconic Masters",
        "slug": "magic-iconic-masters"
      },
      {
        "name": "Magic Ikoria Lair of Behemoths",
        "slug": "magic-ikoria-lair-of-behemoths"
      },
      {
        "name": "Magic Innistrad",
        "slug": "magic-innistrad"
      },
      {
        "name": "Magic Innistrad Remastered",
        "slug": "magic-innistrad-remastered"
      },
      {
        "name": "Magic Innistrad: Crimson Vow",
        "slug": "magic-innistrad-crimson-vow"
      },
      {
        "name": "Magic Innistrad: Crimson Vow Commander",
        "slug": "magic-innistrad-crimson-vow-commander"
      },
      {
        "name": "Magic Innistrad: Double Feature",
        "slug": "magic-innistrad-double-feature"
      },
      {
        "name": "Magic Innistrad: Midnight Hunt",
        "slug": "magic-innistrad-midnight-hunt"
      },
      {
        "name": "Magic International Edition",
        "slug": "magic-international-edition"
      },
      {
        "name": "Magic Invasion",
        "slug": "magic-invasion"
      },
      {
        "name": "Magic Ixalan",
        "slug": "magic-ixalan"
      },
      {
        "name": "Magic Izzet vs Golgari",
        "slug": "magic-izzet-vs-golgari"
      },
      {
        "name": "Magic Jace vs Chandra",
        "slug": "magic-jace-vs-chandra"
      },
      {
        "name": "Magic Jace vs Vraska",
        "slug": "magic-jace-vs-vraska"
      },
      {
        "name": "Magic Journey Into Nyx",
        "slug": "magic-journey-into-nyx"
      },
      {
        "name": "Magic Judge Gift",
        "slug": "magic-judge-gift"
      },
      {
        "name": "Magic Judgment",
        "slug": "magic-judgment"
      },
      {
        "name": "Magic Jumpstart",
        "slug": "magic-jumpstart"
      },
      {
        "name": "Magic Jumpstart 2022",
        "slug": "magic-jumpstart-2022"
      },
      {
        "name": "Magic Junior Super Series",
        "slug": "magic-junior-super-series"
      },
      {
        "name": "Magic Jurassic World",
        "slug": "magic-jurassic-world"
      },
      {
        "name": "Magic Kaladesh",
        "slug": "magic-kaladesh"
      },
      {
        "name": "Magic Kaladesh Inventions",
        "slug": "magic-kaladesh-inventions"
      },
      {
        "name": "Magic Kaldheim",
        "slug": "magic-kaldheim"
      },
      {
        "name": "Magic Kaldheim Commander",
        "slug": "magic-kaldheim-commander"
      },
      {
        "name": "Magic Kamigawa: Neon Dynasty",
        "slug": "magic-kamigawa-neon-dynasty"
      },
      {
        "name": "Magic Kamigawa: Neon Dynasty Commander",
        "slug": "magic-kamigawa-neon-dynasty-commander"
      },
      {
        "name": "Magic Khans of Tarkir",
        "slug": "magic-khans-of-tarkir"
      },
      {
        "name": "Magic Knights vs Dragons",
        "slug": "magic-knights-vs-dragons"
      },
      {
        "name": "Magic Legends",
        "slug": "magic-legends"
      },
      {
        "name": "Magic Legions",
        "slug": "magic-legions"
      },
      {
        "name": "Magic Lord of the Rings Art Series",
        "slug": "magic-lord-of-the-rings-art-series"
      },
      {
        "name": "Magic Lord of the Rings Commander",
        "slug": "magic-lord-of-the-rings-commander"
      },
      {
        "name": "Magic Lorwyn",
        "slug": "magic-lorwyn"
      },
      {
        "name": "Magic Lorwyn Eclipsed Commander",
        "slug": "magic-lorwyn-eclipsed-commander"
      },
      {
        "name": "Magic Lost Caverns of Ixalan",
        "slug": "magic-lost-caverns-of-ixalan"
      },
      {
        "name": "Magic Lost Caverns of Ixalan Commander",
        "slug": "magic-lost-caverns-of-ixalan-commander"
      },
      {
        "name": "Magic M10",
        "slug": "magic-m10"
      },
      {
        "name": "Magic M11",
        "slug": "magic-m11"
      },
      {
        "name": "Magic M14",
        "slug": "magic-m14"
      },
      {
        "name": "Magic M15",
        "slug": "magic-m15"
      },
      {
        "name": "Magic Magic Origins",
        "slug": "magic-magic-origins"
      },
      {
        "name": "Magic March of the Machine",
        "slug": "magic-march-of-the-machine"
      },
      {
        "name": "Magic March of the Machine Commander",
        "slug": "magic-march-of-the-machine-commander"
      },
      {
        "name": "Magic March of the Machine: The Aftermath",
        "slug": "magic-march-of-the-machine-the-aftermath"
      },
      {
        "name": "Magic Marvel Spider-Man Art Series",
        "slug": "magic-marvel-spider-man-art-series"
      },
      {
        "name": "Magic Marvel Spider-Man Eternal",
        "slug": "magic-marvel-spider-man-eternal"
      },
      {
        "name": "Magic Marvel Spider-Man: Marvel Universe",
        "slug": "magic-marvel-spider-man-marvel-universe"
      },
      {
        "name": "Magic Masterpiece Series: Amonkhet Invocations",
        "slug": "magic-masterpiece-series-amonkhet-invocations"
      },
      {
        "name": "Magic Masters 25",
        "slug": "magic-masters-25"
      },
      {
        "name": "Magic Mercadian Masques",
        "slug": "magic-mercadian-masques"
      },
      {
        "name": "Magic Midnight Hunt Commander",
        "slug": "magic-midnight-hunt-commander"
      },
      {
        "name": "Magic Mirage",
        "slug": "magic-mirage"
      },
      {
        "name": "Magic Mirrodin",
        "slug": "magic-mirrodin"
      },
      {
        "name": "Magic Mirrodin Besieged",
        "slug": "magic-mirrodin-besieged"
      },
      {
        "name": "Magic Modern Horizons",
        "slug": "magic-modern-horizons"
      },
      {
        "name": "Magic Modern Horizons 2",
        "slug": "magic-modern-horizons-2"
      },
      {
        "name": "Magic Modern Horizons 3 Commander",
        "slug": "magic-modern-horizons-3-commander"
      },
      {
        "name": "Magic Modern Masters",
        "slug": "magic-modern-masters"
      },
      {
        "name": "Magic Modern Masters 2015",
        "slug": "magic-modern-masters-2015"
      },
      {
        "name": "Magic Modern Masters 2017",
        "slug": "magic-modern-masters-2017"
      },
      {
        "name": "Magic Morningtide",
        "slug": "magic-morningtide"
      },
      {
        "name": "Magic Multiverse Legends",
        "slug": "magic-multiverse-legends"
      },
      {
        "name": "Magic Murders at Karlov Manor",
        "slug": "magic-murders-at-karlov-manor"
      },
      {
        "name": "Magic Murders at Karlov Manor Commander",
        "slug": "magic-murders-at-karlov-manor-commander"
      },
      {
        "name": "Magic Mystery Booster",
        "slug": "magic-mystery-booster"
      },
      {
        "name": "Magic Mystery Booster 2",
        "slug": "magic-mystery-booster-2"
      },
      {
        "name": "Magic Mythic Edition",
        "slug": "magic-mythic-edition"
      },
      {
        "name": "Magic Nemesis",
        "slug": "magic-nemesis"
      },
      {
        "name": "Magic New Capenna Commander",
        "slug": "magic-new-capenna-commander"
      },
      {
        "name": "Magic New Phyrexia",
        "slug": "magic-new-phyrexia"
      },
      {
        "name": "Magic Nissa vs Ob Nixilis",
        "slug": "magic-nissa-vs-ob-nixilis"
      },
      {
        "name": "Magic Oath of the Gatewatch",
        "slug": "magic-oath-of-the-gatewatch"
      },
      {
        "name": "Magic Odyssey",
        "slug": "magic-odyssey"
      },
      {
        "name": "Magic Onslaught",
        "slug": "magic-onslaught"
      },
      {
        "name": "Magic Outlaws of Thunder Junction",
        "slug": "magic-outlaws-of-thunder-junction"
      },
      {
        "name": "Magic Outlaws of Thunder Junction Breaking News",
        "slug": "magic-outlaws-of-thunder-junction-breaking-news"
      },
      {
        "name": "Magic Outlaws of Thunder Junction Commander",
        "slug": "magic-outlaws-of-thunder-junction-commander"
      },
      {
        "name": "Magic Phyrexia vs The Coalition",
        "slug": "magic-phyrexia-vs-the-coalition"
      },
      {
        "name": "Magic Phyrexia: All Will Be One",
        "slug": "magic-phyrexia-all-will-be-one"
      },
      {
        "name": "Magic Phyrexia: All Will Be One Commander",
        "slug": "magic-phyrexia-all-will-be-one-commander"
      },
      {
        "name": "Magic Planar Chaos",
        "slug": "magic-planar-chaos"
      },
      {
        "name": "Magic Planechase",
        "slug": "magic-planechase"
      },
      {
        "name": "Magic Planechase 2012",
        "slug": "magic-planechase-2012"
      },
      {
        "name": "Magic Planechase Anthology",
        "slug": "magic-planechase-anthology"
      },
      {
        "name": "Magic Planeshift",
        "slug": "magic-planeshift"
      },
      {
        "name": "Magic Player Rewards",
        "slug": "magic-player-rewards"
      },
      {
        "name": "Magic Portal",
        "slug": "magic-portal"
      },
      {
        "name": "Magic Portal Second Age",
        "slug": "magic-portal-second-age"
      },
      {
        "name": "Magic Portal Three Kingdoms",
        "slug": "magic-portal-three-kingdoms"
      },
      {
        "name": "Magic Premium Deck Series Graveborn",
        "slug": "magic-premium-deck-series-graveborn"
      },
      {
        "name": "Magic Premium Deck Series Slivers",
        "slug": "magic-premium-deck-series-slivers"
      },
      {
        "name": "Magic Promo",
        "slug": "magic-promo"
      },
      {
        "name": "Magic Prophecy",
        "slug": "magic-prophecy"
      },
      {
        "name": "Magic Ravnica",
        "slug": "magic-ravnica"
      },
      {
        "name": "Magic Ravnica Allegiance",
        "slug": "magic-ravnica-allegiance"
      },
      {
        "name": "Magic Ravnica Allegiance Guild Kits",
        "slug": "magic-ravnica-allegiance-guild-kits"
      },
      {
        "name": "Magic Ravnica Remastered",
        "slug": "magic-ravnica-remastered"
      },
      {
        "name": "Magic Return to Ravnica",
        "slug": "magic-return-to-ravnica"
      },
      {
        "name": "Magic Rise of the Eldrazi",
        "slug": "magic-rise-of-the-eldrazi"
      },
      {
        "name": "Magic Rivals of Ixalan",
        "slug": "magic-rivals-of-ixalan"
      },
      {
        "name": "Magic Saviors of Kamigawa",
        "slug": "magic-saviors-of-kamigawa"
      },
      {
        "name": "Magic Scars of Mirrodin",
        "slug": "magic-scars-of-mirrodin"
      },
      {
        "name": "Magic Scourge",
        "slug": "magic-scourge"
      },
      {
        "name": "Magic Secret Lair 30th Anniversary",
        "slug": "magic-secret-lair-30th-anniversary"
      },
      {
        "name": "Magic Secret Lair Showdown",
        "slug": "magic-secret-lair-showdown"
      },
      {
        "name": "Magic Shadowmoor",
        "slug": "magic-shadowmoor"
      },
      {
        "name": "Magic Shadows Over Innistrad",
        "slug": "magic-shadows-over-innistrad"
      },
      {
        "name": "Magic Shards of Alara",
        "slug": "magic-shards-of-alara"
      },
      {
        "name": "Magic Sorin vs Tibalt",
        "slug": "magic-sorin-vs-tibalt"
      },
      {
        "name": "Magic Special Guests",
        "slug": "magic-special-guests"
      },
      {
        "name": "Magic Speed vs Cunning",
        "slug": "magic-speed-vs-cunning"
      },
      {
        "name": "Magic Starter 1999",
        "slug": "magic-starter-1999"
      },
      {
        "name": "Magic Starter Commander Decks",
        "slug": "magic-starter-commander-decks"
      },
      {
        "name": "Magic Streets of New Capenna",
        "slug": "magic-streets-of-new-capenna"
      },
      {
        "name": "Magic Strixhaven Mystical Archive",
        "slug": "magic-strixhaven-mystical-archive"
      },
      {
        "name": "Magic Strixhaven School of Mages",
        "slug": "magic-strixhaven-school-of-mages"
      },
      {
        "name": "Magic Stronghold",
        "slug": "magic-stronghold"
      },
      {
        "name": "Magic Summer Edition",
        "slug": "magic-summer-edition"
      },
      {
        "name": "Magic Tarkir: Dragonstorm Commander",
        "slug": "magic-tarkir-dragonstorm-commander"
      },
      {
        "name": "Magic Tempest",
        "slug": "magic-tempest"
      },
      {
        "name": "Magic The Big Score",
        "slug": "magic-the-big-score"
      },
      {
        "name": "Magic The Dark",
        "slug": "magic-the-dark"
      },
      {
        "name": "Magic Theros",
        "slug": "magic-theros"
      },
      {
        "name": "Magic Theros Beyond Death",
        "slug": "magic-theros-beyond-death"
      },
      {
        "name": "Magic Throne of Eldraine",
        "slug": "magic-throne-of-eldraine"
      },
      {
        "name": "Magic Time Spiral",
        "slug": "magic-time-spiral"
      },
      {
        "name": "Magic Time Spiral Remastered",
        "slug": "magic-time-spiral-remastered"
      },
      {
        "name": "Magic Time Spiral Timeshifted",
        "slug": "magic-time-spiral-timeshifted"
      },
      {
        "name": "Magic Torment",
        "slug": "magic-torment"
      },
      {
        "name": "Magic Transformers",
        "slug": "magic-transformers"
      },
      {
        "name": "Magic Ultimate Box Topper",
        "slug": "magic-ultimate-box-topper"
      },
      {
        "name": "Magic Ultimate Masters",
        "slug": "magic-ultimate-masters"
      },
      {
        "name": "Magic Unfinity",
        "slug": "magic-unfinity"
      },
      {
        "name": "Magic Unglued",
        "slug": "magic-unglued"
      },
      {
        "name": "Magic Unhinged",
        "slug": "magic-unhinged"
      },
      {
        "name": "Magic Unlimited",
        "slug": "magic-unlimited"
      },
      {
        "name": "Magic Unstable",
        "slug": "magic-unstable"
      },
      {
        "name": "Magic Urzas Destiny",
        "slug": "magic-urzas-destiny"
      },
      {
        "name": "Magic Urzas Legacy",
        "slug": "magic-urzas-legacy"
      },
      {
        "name": "Magic Urzas Saga",
        "slug": "magic-urzas-saga"
      },
      {
        "name": "Magic Venser vs Koth",
        "slug": "magic-venser-vs-koth"
      },
      {
        "name": "Magic Visions",
        "slug": "magic-visions"
      },
      {
        "name": "Magic War of the Spark",
        "slug": "magic-war-of-the-spark"
      },
      {
        "name": "Magic Warhammer 40,000",
        "slug": "magic-warhammer-40,000"
      },
      {
        "name": "Magic Weatherlight",
        "slug": "magic-weatherlight"
      },
      {
        "name": "Magic Wilds of Eldraine",
        "slug": "magic-wilds-of-eldraine"
      },
      {
        "name": "Magic Wilds of Eldraine Commander",
        "slug": "magic-wilds-of-eldraine-commander"
      },
      {
        "name": "Magic Wilds of Eldraine Enchanting Tales",
        "slug": "magic-wilds-of-eldraine-enchanting-tales"
      },
      {
        "name": "Magic Worldwake",
        "slug": "magic-worldwake"
      },
      {
        "name": "Magic Zendikar",
        "slug": "magic-zendikar"
      },
      {
        "name": "Magic Zendikar Expeditions",
        "slug": "magic-zendikar-expeditions"
      },
      {
        "name": "Magic Zendikar Rising",
        "slug": "magic-zendikar-rising"
      },
      {
        "name": "Magic Zendikar Rising Commander",
        "slug": "magic-zendikar-rising-commander"
      },
      {
        "name": "Magic Zendikar Rising Expeditions",
        "slug": "magic-zendikar-rising-expeditions"
      },
      {
        "name": "Magic Zendikar vs Eldrazi",
        "slug": "magic-zendikar-vs-eldrazi"
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
        "slug": "yugioh-legend-of-blue-eyes-white-dragon"
      },
      {
        "name": "Quarter Century Stampede",
        "slug": "yugioh-quarter-century-stampede"
      },
      {
        "name": "Starter Deck: Kaiba",
        "slug": "yugioh-starter-deck-kaiba"
      },
      {
        "name": "Retro Pack 2",
        "slug": "yugioh-retro-pack-2"
      },
      {
        "name": "Starter Deck: Yugi",
        "slug": "yugioh-starter-deck-yugi"
      },
      {
        "name": "Metal Raiders",
        "slug": "yugioh-metal-raiders"
      },
      {
        "name": "Quarter Century Bonanza",
        "slug": "yugioh-quarter-century-bonanza"
      },
      {
        "name": "25th Anniversary Rarity Collection II",
        "slug": "yugioh-25th-anniversary-rarity-collection-ii"
      },
      {
        "name": "Burst Protocol",
        "slug": "yugioh-burst-protocol"
      },
      {
        "name": "Legendary Collection Kaiba Mega Pack",
        "slug": "yugioh-legendary-collection-kaiba-mega-pack"
      },
      {
        "name": "Starter Deck: Joey",
        "slug": "yugioh-starter-deck-joey"
      },
      {
        "name": "Starter Deck: Yugi Evolution",
        "slug": "yugioh-starter-deck-yugi-evolution"
      },
      {
        "name": "Battles of Legend: Monster Mayhem",
        "slug": "yugioh-battles-of-legend-monster-mayhem"
      },
      {
        "name": "Ghosts From the Past: 2nd Haunting",
        "slug": "yugioh-ghosts-from-the-past-2nd-haunting"
      },
      {
        "name": "Pharaoh's Servant",
        "slug": "yugioh-pharaoh's-servant"
      },
      {
        "name": "Magic Ruler",
        "slug": "yugioh-magic-ruler"
      },
      {
        "name": "Magician's Force",
        "slug": "yugioh-magician's-force"
      },
      {
        "name": "25th Anniversary Tin: Dueling Mirrors",
        "slug": "yugioh-25th-anniversary-tin-dueling-mirrors"
      },
      {
        "name": "25th Anniversary Rarity Collection",
        "slug": "yugioh-25th-anniversary-rarity-collection"
      },
      {
        "name": "Starter Deck: Kaiba Evolution",
        "slug": "yugioh-starter-deck-kaiba-evolution"
      },
      {
        "name": "YuGiOh Legendary Modern Decks 2026",
        "slug": "yugioh-legendary-modern-decks-2026"
      },
      {
        "name": "YuGiOh Japanese Limit Over Collection: Heroes",
        "slug": "yugioh-japanese-limit-over-collection-heroes"
      },
      {
        "name": "YuGiOh Maze of Muertos",
        "slug": "yugioh-maze-of-muertos"
      },
      {
        "name": "YuGiOh Tournament Pack 30",
        "slug": "yugioh-tournament-pack-30"
      },
      {
        "name": "YuGiOh 2002 Collector's Tin",
        "slug": "yugioh-2002-collector's-tin"
      },
      {
        "name": "YuGiOh 2003 Collector's Tin",
        "slug": "yugioh-2003-collector's-tin"
      },
      {
        "name": "YuGiOh 2014 Mega-Tin Mega Pack",
        "slug": "yugioh-2014-mega-tin-mega-pack"
      },
      {
        "name": "YuGiOh 2015 Mega-Tin Mega Pack",
        "slug": "yugioh-2015-mega-tin-mega-pack"
      },
      {
        "name": "YuGiOh 2016 Mega-Tins",
        "slug": "yugioh-2016-mega-tins"
      },
      {
        "name": "YuGiOh 2017 Mega-Tin Mega Pack",
        "slug": "yugioh-2017-mega-tin-mega-pack"
      },
      {
        "name": "YuGiOh 2017 Mega-Tins",
        "slug": "yugioh-2017-mega-tins"
      },
      {
        "name": "YuGiOh 2019 Gold Sarcophagus Tin",
        "slug": "yugioh-2019-gold-sarcophagus-tin"
      },
      {
        "name": "YuGiOh 2019 Gold Sarcophagus Tin Mega Pack",
        "slug": "yugioh-2019-gold-sarcophagus-tin-mega-pack"
      },
      {
        "name": "YuGiOh 2020 Tin of Lost Memories Mega Pack",
        "slug": "yugioh-2020-tin-of-lost-memories-mega-pack"
      },
      {
        "name": "YuGiOh 2021 Tin of Ancient Battles Mega Pack",
        "slug": "yugioh-2021-tin-of-ancient-battles-mega-pack"
      },
      {
        "name": "YuGiOh 2022 Tin of the Pharaoh's Gods Mega Pack",
        "slug": "yugioh-2022-tin-of-the-pharaoh's-gods-mega-pack"
      },
      {
        "name": "YuGiOh 2025 Mega Pack Tin",
        "slug": "yugioh-2025-mega-pack-tin"
      },
      {
        "name": "YuGiOh 25th Anniversary Tin: Dueling Heroes",
        "slug": "yugioh-25th-anniversary-tin-dueling-heroes"
      },
      {
        "name": "YuGiOh 25th Anniversary Tin: Dueling Heroes Mega Pack",
        "slug": "yugioh-25th-anniversary-tin-dueling-heroes-mega-pack"
      },
      {
        "name": "YuGiOh 25th Anniversary Ultimate Kaiba Set",
        "slug": "yugioh-25th-anniversary-ultimate-kaiba-set"
      },
      {
        "name": "YuGiOh Absolute Powerforce",
        "slug": "yugioh-absolute-powerforce"
      },
      {
        "name": "YuGiOh Abyss Rising",
        "slug": "yugioh-abyss-rising"
      },
      {
        "name": "YuGiOh Age of Overlord",
        "slug": "yugioh-age-of-overlord"
      },
      {
        "name": "YuGiOh Alliance Insight",
        "slug": "yugioh-alliance-insight"
      },
      {
        "name": "YuGiOh Amazing Defenders",
        "slug": "yugioh-amazing-defenders"
      },
      {
        "name": "YuGiOh Ancient Guardians",
        "slug": "yugioh-ancient-guardians"
      },
      {
        "name": "YuGiOh Ancient Prophecy",
        "slug": "yugioh-ancient-prophecy"
      },
      {
        "name": "YuGiOh Ancient Sanctuary",
        "slug": "yugioh-ancient-sanctuary"
      },
      {
        "name": "YuGiOh Anniversary Pack",
        "slug": "yugioh-anniversary-pack"
      },
      {
        "name": "YuGiOh Battle Pack 2: War of the Giants",
        "slug": "yugioh-battle-pack-2-war-of-the-giants"
      },
      {
        "name": "YuGiOh Battle Pack 3: Monster League",
        "slug": "yugioh-battle-pack-3-monster-league"
      },
      {
        "name": "YuGiOh Battle Pack: Epic Dawn",
        "slug": "yugioh-battle-pack-epic-dawn"
      },
      {
        "name": "YuGiOh Battle of Chaos",
        "slug": "yugioh-battle-of-chaos"
      },
      {
        "name": "YuGiOh Battles of Legend: Armageddon",
        "slug": "yugioh-battles-of-legend-armageddon"
      },
      {
        "name": "YuGiOh Battles of Legend: Chapter 1",
        "slug": "yugioh-battles-of-legend-chapter-1"
      },
      {
        "name": "YuGiOh Battles of Legend: Crystal Revenge",
        "slug": "yugioh-battles-of-legend-crystal-revenge"
      },
      {
        "name": "YuGiOh Battles of Legend: Hero's Revenge",
        "slug": "yugioh-battles-of-legend-hero's-revenge"
      },
      {
        "name": "YuGiOh Battles of Legend: Light's Revenge",
        "slug": "yugioh-battles-of-legend-light's-revenge"
      },
      {
        "name": "YuGiOh Battles of Legend: Monstrous Revenge",
        "slug": "yugioh-battles-of-legend-monstrous-revenge"
      },
      {
        "name": "YuGiOh Battles of Legend: Relentless Revenge",
        "slug": "yugioh-battles-of-legend-relentless-revenge"
      },
      {
        "name": "YuGiOh Battles of Legend: Terminal Revenge",
        "slug": "yugioh-battles-of-legend-terminal-revenge"
      },
      {
        "name": "YuGiOh Blazing Vortex",
        "slug": "yugioh-blazing-vortex"
      },
      {
        "name": "YuGiOh Breakers of Shadow",
        "slug": "yugioh-breakers-of-shadow"
      },
      {
        "name": "YuGiOh Brothers of Legend",
        "slug": "yugioh-brothers-of-legend"
      },
      {
        "name": "YuGiOh Burst of Destiny",
        "slug": "yugioh-burst-of-destiny"
      },
      {
        "name": "YuGiOh Chaos Impact",
        "slug": "yugioh-chaos-impact"
      },
      {
        "name": "YuGiOh Chronicles Deck: The Fallen & The Virtuous",
        "slug": "yugioh-chronicles-deck-the-fallen-&-the-virtuous"
      },
      {
        "name": "YuGiOh Circuit Break",
        "slug": "yugioh-circuit-break"
      },
      {
        "name": "YuGiOh Clash of Rebellions",
        "slug": "yugioh-clash-of-rebellions"
      },
      {
        "name": "YuGiOh Code of the Duelist",
        "slug": "yugioh-code-of-the-duelist"
      },
      {
        "name": "YuGiOh Collectible Tins 2004",
        "slug": "yugioh-collectible-tins-2004"
      },
      {
        "name": "YuGiOh Collectible Tins 2005",
        "slug": "yugioh-collectible-tins-2005"
      },
      {
        "name": "YuGiOh Collectible Tins 2006",
        "slug": "yugioh-collectible-tins-2006"
      },
      {
        "name": "YuGiOh Collectible Tins 2008",
        "slug": "yugioh-collectible-tins-2008"
      },
      {
        "name": "YuGiOh Cosmo Blazer",
        "slug": "yugioh-cosmo-blazer"
      },
      {
        "name": "YuGiOh Crimson Crisis",
        "slug": "yugioh-crimson-crisis"
      },
      {
        "name": "YuGiOh Crossed Souls",
        "slug": "yugioh-crossed-souls"
      },
      {
        "name": "YuGiOh Crossover Breakers",
        "slug": "yugioh-crossover-breakers"
      },
      {
        "name": "YuGiOh Crossroads of Chaos",
        "slug": "yugioh-crossroads-of-chaos"
      },
      {
        "name": "YuGiOh Cyberdark Impact",
        "slug": "yugioh-cyberdark-impact"
      },
      {
        "name": "YuGiOh Cybernetic Horizon",
        "slug": "yugioh-cybernetic-horizon"
      },
      {
        "name": "YuGiOh Cybernetic Revolution",
        "slug": "yugioh-cybernetic-revolution"
      },
      {
        "name": "YuGiOh Cyberstorm Access",
        "slug": "yugioh-cyberstorm-access"
      },
      {
        "name": "YuGiOh Dark Beginning 1",
        "slug": "yugioh-dark-beginning-1"
      },
      {
        "name": "YuGiOh Dark Beginning 2",
        "slug": "yugioh-dark-beginning-2"
      },
      {
        "name": "YuGiOh Dark Crisis",
        "slug": "yugioh-dark-crisis"
      },
      {
        "name": "YuGiOh Dark Duel Stories",
        "slug": "yugioh-dark-duel-stories"
      },
      {
        "name": "YuGiOh Dark Legends",
        "slug": "yugioh-dark-legends"
      },
      {
        "name": "YuGiOh Dark Neostorm",
        "slug": "yugioh-dark-neostorm"
      },
      {
        "name": "YuGiOh Dark Revelation Volume 1",
        "slug": "yugioh-dark-revelation-volume-1"
      },
      {
        "name": "YuGiOh Dark Revelation Volume 2",
        "slug": "yugioh-dark-revelation-volume-2"
      },
      {
        "name": "YuGiOh Dark Revelation Volume 3",
        "slug": "yugioh-dark-revelation-volume-3"
      },
      {
        "name": "YuGiOh Dark Revelation Volume 4",
        "slug": "yugioh-dark-revelation-volume-4"
      },
      {
        "name": "YuGiOh Dark Saviors",
        "slug": "yugioh-dark-saviors"
      },
      {
        "name": "YuGiOh Darkwing Blast",
        "slug": "yugioh-darkwing-blast"
      },
      {
        "name": "YuGiOh Dawn of Majesty",
        "slug": "yugioh-dawn-of-majesty"
      },
      {
        "name": "YuGiOh Dimension Force",
        "slug": "yugioh-dimension-force"
      },
      {
        "name": "YuGiOh Dimension of Chaos",
        "slug": "yugioh-dimension-of-chaos"
      },
      {
        "name": "YuGiOh Doom of Dimensions",
        "slug": "yugioh-doom-of-dimensions"
      },
      {
        "name": "YuGiOh Dragons of Legend: The Complete Series",
        "slug": "yugioh-dragons-of-legend-the-complete-series"
      },
      {
        "name": "YuGiOh Duel Master's Guide",
        "slug": "yugioh-duel-master's-guide"
      },
      {
        "name": "YuGiOh Duel Monsters International",
        "slug": "yugioh-duel-monsters-international"
      },
      {
        "name": "YuGiOh Duel Overload",
        "slug": "yugioh-duel-overload"
      },
      {
        "name": "YuGiOh Duel Power",
        "slug": "yugioh-duel-power"
      },
      {
        "name": "YuGiOh Duelist Alliance",
        "slug": "yugioh-duelist-alliance"
      },
      {
        "name": "YuGiOh Duelist League",
        "slug": "yugioh-duelist-league"
      },
      {
        "name": "YuGiOh Duelist Nexus",
        "slug": "yugioh-duelist-nexus"
      },
      {
        "name": "YuGiOh Duelist Pack: Battle City",
        "slug": "yugioh-duelist-pack-battle-city"
      },
      {
        "name": "YuGiOh Duelist Pack: Kaiba",
        "slug": "yugioh-duelist-pack-kaiba"
      },
      {
        "name": "YuGiOh Duelist Pack: Yugi",
        "slug": "yugioh-duelist-pack-yugi"
      },
      {
        "name": "YuGiOh Duelist Revolution",
        "slug": "yugioh-duelist-revolution"
      },
      {
        "name": "YuGiOh Duelist Saga",
        "slug": "yugioh-duelist-saga"
      },
      {
        "name": "YuGiOh Duelist's Advance",
        "slug": "yugioh-duelist's-advance"
      },
      {
        "name": "YuGiOh Egyptian God Deck: Obelisk the Tormentor",
        "slug": "yugioh-egyptian-god-deck-obelisk-the-tormentor"
      },
      {
        "name": "YuGiOh Egyptian God Deck: Slifer the Sky Dragon",
        "slug": "yugioh-egyptian-god-deck-slifer-the-sky-dragon"
      },
      {
        "name": "YuGiOh Elemental Energy",
        "slug": "yugioh-elemental-energy"
      },
      {
        "name": "YuGiOh Enemy of Justice",
        "slug": "yugioh-enemy-of-justice"
      },
      {
        "name": "YuGiOh Eternity Code",
        "slug": "yugioh-eternity-code"
      },
      {
        "name": "YuGiOh Exclusive Pack",
        "slug": "yugioh-exclusive-pack"
      },
      {
        "name": "YuGiOh Extreme Force",
        "slug": "yugioh-extreme-force"
      },
      {
        "name": "YuGiOh Extreme Victory",
        "slug": "yugioh-extreme-victory"
      },
      {
        "name": "YuGiOh Flames of Destruction",
        "slug": "yugioh-flames-of-destruction"
      },
      {
        "name": "YuGiOh Flaming Eternity",
        "slug": "yugioh-flaming-eternity"
      },
      {
        "name": "YuGiOh Forbidden Legacy",
        "slug": "yugioh-forbidden-legacy"
      },
      {
        "name": "YuGiOh Forbidden Memories",
        "slug": "yugioh-forbidden-memories"
      },
      {
        "name": "YuGiOh Force of the Breaker",
        "slug": "yugioh-force-of-the-breaker"
      },
      {
        "name": "YuGiOh Galactic Overlord",
        "slug": "yugioh-galactic-overlord"
      },
      {
        "name": "YuGiOh Generation Force",
        "slug": "yugioh-generation-force"
      },
      {
        "name": "YuGiOh Genesis Impact",
        "slug": "yugioh-genesis-impact"
      },
      {
        "name": "YuGiOh Ghosts From the Past",
        "slug": "yugioh-ghosts-from-the-past"
      },
      {
        "name": "YuGiOh Gladiator's Assault",
        "slug": "yugioh-gladiator's-assault"
      },
      {
        "name": "YuGiOh Gold Series: Haunted Mine",
        "slug": "yugioh-gold-series-haunted-mine"
      },
      {
        "name": "YuGiOh Hidden Arsenal: Chapter 1",
        "slug": "yugioh-hidden-arsenal-chapter-1"
      },
      {
        "name": "YuGiOh Ignition Assault",
        "slug": "yugioh-ignition-assault"
      },
      {
        "name": "YuGiOh Invasion of Chaos",
        "slug": "yugioh-invasion-of-chaos"
      },
      {
        "name": "YuGiOh Invasion of Chaos: 25th Anniversary",
        "slug": "yugioh-invasion-of-chaos-25th-anniversary"
      },
      {
        "name": "YuGiOh Invasion: Vengeance",
        "slug": "yugioh-invasion-vengeance"
      },
      {
        "name": "YuGiOh Japanese Absolute Powerforce",
        "slug": "yugioh-japanese-absolute-powerforce"
      },
      {
        "name": "YuGiOh Japanese Abyss Rising",
        "slug": "yugioh-japanese-abyss-rising"
      },
      {
        "name": "YuGiOh Japanese Alliance Insight",
        "slug": "yugioh-japanese-alliance-insight"
      },
      {
        "name": "YuGiOh Japanese Ancient Prophecy",
        "slug": "yugioh-japanese-ancient-prophecy"
      },
      {
        "name": "YuGiOh Japanese Controller of Chaos",
        "slug": "yugioh-japanese-controller-of-chaos"
      },
      {
        "name": "YuGiOh Japanese Cosmo Blazer",
        "slug": "yugioh-japanese-cosmo-blazer"
      },
      {
        "name": "YuGiOh Japanese Crimson Crisis",
        "slug": "yugioh-japanese-crimson-crisis"
      },
      {
        "name": "YuGiOh Japanese Crossroads of Chaos",
        "slug": "yugioh-japanese-crossroads-of-chaos"
      },
      {
        "name": "YuGiOh Japanese Duelist Revolution",
        "slug": "yugioh-japanese-duelist-revolution"
      },
      {
        "name": "YuGiOh Japanese Duelist Road Piece of Memory: Yugi Muto",
        "slug": "yugioh-japanese-duelist-road-piece-of-memory-yugi-muto"
      },
      {
        "name": "YuGiOh Japanese Extreme Victory",
        "slug": "yugioh-japanese-extreme-victory"
      },
      {
        "name": "YuGiOh Japanese Galactic Overlord",
        "slug": "yugioh-japanese-galactic-overlord"
      },
      {
        "name": "YuGiOh Japanese Generation Force",
        "slug": "yugioh-japanese-generation-force"
      },
      {
        "name": "YuGiOh Japanese History Archive Collection",
        "slug": "yugioh-japanese-history-archive-collection"
      },
      {
        "name": "YuGiOh Japanese Judgment of the Light",
        "slug": "yugioh-japanese-judgment-of-the-light"
      },
      {
        "name": "YuGiOh Japanese Legacy of the Valiant",
        "slug": "yugioh-japanese-legacy-of-the-valiant"
      },
      {
        "name": "YuGiOh Japanese Lord of the Tachyon Galaxy",
        "slug": "yugioh-japanese-lord-of-the-tachyon-galaxy"
      },
      {
        "name": "YuGiOh Japanese Order of Chaos",
        "slug": "yugioh-japanese-order-of-chaos"
      },
      {
        "name": "YuGiOh Japanese Photon Shockwave",
        "slug": "yugioh-japanese-photon-shockwave"
      },
      {
        "name": "YuGiOh Japanese Premium Pack 4",
        "slug": "yugioh-japanese-premium-pack-4"
      },
      {
        "name": "YuGiOh Japanese Quarter Century Art Collection",
        "slug": "yugioh-japanese-quarter-century-art-collection"
      },
      {
        "name": "YuGiOh Japanese Quarter Century Duelist Box",
        "slug": "yugioh-japanese-quarter-century-duelist-box"
      },
      {
        "name": "YuGiOh Japanese Return of the Duelist",
        "slug": "yugioh-japanese-return-of-the-duelist"
      },
      {
        "name": "YuGiOh Japanese Rise of the Duelist",
        "slug": "yugioh-japanese-rise-of-the-duelist"
      },
      {
        "name": "YuGiOh Japanese Shadow Specters",
        "slug": "yugioh-japanese-shadow-specters"
      },
      {
        "name": "YuGiOh Japanese Soul Fusion",
        "slug": "yugioh-japanese-soul-fusion"
      },
      {
        "name": "YuGiOh Japanese Spell of Mask",
        "slug": "yugioh-japanese-spell-of-mask"
      },
      {
        "name": "YuGiOh Japanese Stardust Overdrive",
        "slug": "yugioh-japanese-stardust-overdrive"
      },
      {
        "name": "YuGiOh Japanese Starstrike Blast",
        "slug": "yugioh-japanese-starstrike-blast"
      },
      {
        "name": "YuGiOh Japanese Storm of Ragnarok",
        "slug": "yugioh-japanese-storm-of-ragnarok"
      },
      {
        "name": "YuGiOh Japanese Strike of Neos",
        "slug": "yugioh-japanese-strike-of-neos"
      },
      {
        "name": "YuGiOh Japanese Supreme Darkness",
        "slug": "yugioh-japanese-supreme-darkness"
      },
      {
        "name": "YuGiOh Japanese Tactical Evolution",
        "slug": "yugioh-japanese-tactical-evolution"
      },
      {
        "name": "YuGiOh Japanese The New Ruler",
        "slug": "yugioh-japanese-the-new-ruler"
      },
      {
        "name": "YuGiOh Japanese The Shining Darkness",
        "slug": "yugioh-japanese-the-shining-darkness"
      },
      {
        "name": "YuGiOh Japanese V Jump",
        "slug": "yugioh-japanese-v-jump"
      },
      {
        "name": "YuGiOh Japanese Vol.1",
        "slug": "yugioh-japanese-vol1"
      },
      {
        "name": "YuGiOh Judgment of the Light",
        "slug": "yugioh-judgment-of-the-light"
      },
      {
        "name": "YuGiOh Justice Hunters",
        "slug": "yugioh-justice-hunters"
      },
      {
        "name": "YuGiOh Kings Court",
        "slug": "yugioh-kings-court"
      },
      {
        "name": "YuGiOh Labyrinth of Nightmare",
        "slug": "yugioh-labyrinth-of-nightmare"
      },
      {
        "name": "YuGiOh Legacy of Darkness",
        "slug": "yugioh-legacy-of-darkness"
      },
      {
        "name": "YuGiOh Legacy of Destruction",
        "slug": "yugioh-legacy-of-destruction"
      },
      {
        "name": "YuGiOh Legacy of the Valiant",
        "slug": "yugioh-legacy-of-the-valiant"
      },
      {
        "name": "YuGiOh Legend of Blue Eyes White Dragon: 25th Anniversary",
        "slug": "yugioh-legend-of-blue-eyes-white-dragon-25th-anniversary"
      },
      {
        "name": "YuGiOh Legendary Collection",
        "slug": "yugioh-legendary-collection"
      },
      {
        "name": "YuGiOh Legendary Collection 2: The Duel Academy Years Mega Pack",
        "slug": "yugioh-legendary-collection-2-the-duel-academy-years-mega-pack"
      },
      {
        "name": "YuGiOh Legendary Collection 3: Yugi's World",
        "slug": "yugioh-legendary-collection-3-yugi's-world"
      },
      {
        "name": "YuGiOh Legendary Collection 3: Yugi's World Mega Pack",
        "slug": "yugioh-legendary-collection-3-yugi's-world-mega-pack"
      },
      {
        "name": "YuGiOh Legendary Collection 4: Joey's World Mega Pack",
        "slug": "yugioh-legendary-collection-4-joey's-world-mega-pack"
      },
      {
        "name": "YuGiOh Legendary Collection 5D's Mega Pack",
        "slug": "yugioh-legendary-collection-5d's-mega-pack"
      },
      {
        "name": "YuGiOh Legendary Collection Kaiba",
        "slug": "yugioh-legendary-collection-kaiba"
      },
      {
        "name": "YuGiOh Legendary Collection: 25th Anniversary",
        "slug": "yugioh-legendary-collection-25th-anniversary"
      },
      {
        "name": "YuGiOh Legendary Decks II",
        "slug": "yugioh-legendary-decks-ii"
      },
      {
        "name": "YuGiOh Legendary Dragon Decks",
        "slug": "yugioh-legendary-dragon-decks"
      },
      {
        "name": "YuGiOh Legendary Duelists: Duels from the Deep",
        "slug": "yugioh-legendary-duelists-duels-from-the-deep"
      },
      {
        "name": "YuGiOh Legendary Duelists: Magical Hero",
        "slug": "yugioh-legendary-duelists-magical-hero"
      },
      {
        "name": "YuGiOh Legendary Duelists: Rage of Ra",
        "slug": "yugioh-legendary-duelists-rage-of-ra"
      },
      {
        "name": "YuGiOh Legendary Duelists: Season 1",
        "slug": "yugioh-legendary-duelists-season-1"
      },
      {
        "name": "YuGiOh Legendary Duelists: Season 2",
        "slug": "yugioh-legendary-duelists-season-2"
      },
      {
        "name": "YuGiOh Legendary Duelists: Season 3",
        "slug": "yugioh-legendary-duelists-season-3"
      },
      {
        "name": "YuGiOh Legendary Duelists: Soulburning Volcano",
        "slug": "yugioh-legendary-duelists-soulburning-volcano"
      },
      {
        "name": "YuGiOh Legendary Duelists: Synchro Storm",
        "slug": "yugioh-legendary-duelists-synchro-storm"
      },
      {
        "name": "YuGiOh Legendary Hero Decks",
        "slug": "yugioh-legendary-hero-decks"
      },
      {
        "name": "YuGiOh Light of Destruction",
        "slug": "yugioh-light-of-destruction"
      },
      {
        "name": "YuGiOh Lightning Overdrive",
        "slug": "yugioh-lightning-overdrive"
      },
      {
        "name": "YuGiOh Lord of the Tachyon Galaxy",
        "slug": "yugioh-lord-of-the-tachyon-galaxy"
      },
      {
        "name": "YuGiOh Lost Art Promo",
        "slug": "yugioh-lost-art-promo"
      },
      {
        "name": "YuGiOh Magnificent Mavens",
        "slug": "yugioh-magnificent-mavens"
      },
      {
        "name": "YuGiOh Master Collection Volume 1",
        "slug": "yugioh-master-collection-volume-1"
      },
      {
        "name": "YuGiOh Maximum Crisis",
        "slug": "yugioh-maximum-crisis"
      },
      {
        "name": "YuGiOh Maximum Gold",
        "slug": "yugioh-maximum-gold"
      },
      {
        "name": "YuGiOh Maximum Gold: El Dorado",
        "slug": "yugioh-maximum-gold-el-dorado"
      },
      {
        "name": "YuGiOh Maze of Memories",
        "slug": "yugioh-maze-of-memories"
      },
      {
        "name": "YuGiOh Maze of Millennia",
        "slug": "yugioh-maze-of-millennia"
      },
      {
        "name": "YuGiOh Maze of the Master",
        "slug": "yugioh-maze-of-the-master"
      },
      {
        "name": "YuGiOh McDonald's",
        "slug": "yugioh-mcdonald's"
      },
      {
        "name": "YuGiOh McDonald's 2",
        "slug": "yugioh-mcdonald's-2"
      },
      {
        "name": "YuGiOh Metal Raiders: 25th Anniversary",
        "slug": "yugioh-metal-raiders-25th-anniversary"
      },
      {
        "name": "YuGiOh Movie Pack",
        "slug": "yugioh-movie-pack"
      },
      {
        "name": "YuGiOh Order of Chaos",
        "slug": "yugioh-order-of-chaos"
      },
      {
        "name": "YuGiOh Phantom Darkness",
        "slug": "yugioh-phantom-darkness"
      },
      {
        "name": "YuGiOh Phantom Nightmare",
        "slug": "yugioh-phantom-nightmare"
      },
      {
        "name": "YuGiOh Phantom Rage",
        "slug": "yugioh-phantom-rage"
      },
      {
        "name": "YuGiOh Phantom Revenge",
        "slug": "yugioh-phantom-revenge"
      },
      {
        "name": "YuGiOh Pharaoh's Servant: 25th Anniversary",
        "slug": "yugioh-pharaoh's-servant-25th-anniversary"
      },
      {
        "name": "YuGiOh Pharaonic Guardian",
        "slug": "yugioh-pharaonic-guardian"
      },
      {
        "name": "YuGiOh Photon Hypernova",
        "slug": "yugioh-photon-hypernova"
      },
      {
        "name": "YuGiOh Photon Shockwave",
        "slug": "yugioh-photon-shockwave"
      },
      {
        "name": "YuGiOh Power Of The Elements",
        "slug": "yugioh-power-of-the-elements"
      },
      {
        "name": "YuGiOh Power of the Duelist",
        "slug": "yugioh-power-of-the-duelist"
      },
      {
        "name": "YuGiOh Premium Collection Tin",
        "slug": "yugioh-premium-collection-tin"
      },
      {
        "name": "YuGiOh Premium Gold",
        "slug": "yugioh-premium-gold"
      },
      {
        "name": "YuGiOh Premium Gold: Infinite Gold",
        "slug": "yugioh-premium-gold-infinite-gold"
      },
      {
        "name": "YuGiOh Premium Gold: Return of the Bling",
        "slug": "yugioh-premium-gold-return-of-the-bling"
      },
      {
        "name": "YuGiOh Premium Pack",
        "slug": "yugioh-premium-pack"
      },
      {
        "name": "YuGiOh Primal Origin",
        "slug": "yugioh-primal-origin"
      },
      {
        "name": "YuGiOh Ra Yellow Mega Pack",
        "slug": "yugioh-ra-yellow-mega-pack"
      },
      {
        "name": "YuGiOh Rage of the Abyss",
        "slug": "yugioh-rage-of-the-abyss"
      },
      {
        "name": "YuGiOh Raging Battle",
        "slug": "yugioh-raging-battle"
      },
      {
        "name": "YuGiOh Raging Tempest",
        "slug": "yugioh-raging-tempest"
      },
      {
        "name": "YuGiOh Retro Pack",
        "slug": "yugioh-retro-pack"
      },
      {
        "name": "YuGiOh Retro Pack 2 Reprint",
        "slug": "yugioh-retro-pack-2-reprint"
      },
      {
        "name": "YuGiOh Retro Pack 2024",
        "slug": "yugioh-retro-pack-2024"
      },
      {
        "name": "YuGiOh Return of the Duelist",
        "slug": "yugioh-return-of-the-duelist"
      },
      {
        "name": "YuGiOh Rise of Destiny",
        "slug": "yugioh-rise-of-destiny"
      },
      {
        "name": "YuGiOh Rising Rampage",
        "slug": "yugioh-rising-rampage"
      },
      {
        "name": "YuGiOh Secrets of Eternity",
        "slug": "yugioh-secrets-of-eternity"
      },
      {
        "name": "YuGiOh Shadow Specters",
        "slug": "yugioh-shadow-specters"
      },
      {
        "name": "YuGiOh Shadow of Infinity",
        "slug": "yugioh-shadow-of-infinity"
      },
      {
        "name": "YuGiOh Shining Victories",
        "slug": "yugioh-shining-victories"
      },
      {
        "name": "YuGiOh Shonen Jump Promo",
        "slug": "yugioh-shonen-jump-promo"
      },
      {
        "name": "YuGiOh Soul Fusion",
        "slug": "yugioh-soul-fusion"
      },
      {
        "name": "YuGiOh Soul of the Duelist",
        "slug": "yugioh-soul-of-the-duelist"
      },
      {
        "name": "YuGiOh Speed Duel GX: Duel Academy Box",
        "slug": "yugioh-speed-duel-gx-duel-academy-box"
      },
      {
        "name": "YuGiOh Speed Duel GX: Duelists of Shadows",
        "slug": "yugioh-speed-duel-gx-duelists-of-shadows"
      },
      {
        "name": "YuGiOh Speed Duel GX: Midterm Paradox",
        "slug": "yugioh-speed-duel-gx-midterm-paradox"
      },
      {
        "name": "YuGiOh Speed Duel: Battle City Box",
        "slug": "yugioh-speed-duel-battle-city-box"
      },
      {
        "name": "YuGiOh Speed Duel: Battle City Finals",
        "slug": "yugioh-speed-duel-battle-city-finals"
      },
      {
        "name": "YuGiOh Speed Duel: Streets of Battle City",
        "slug": "yugioh-speed-duel-streets-of-battle-city"
      },
      {
        "name": "YuGiOh Spell Ruler",
        "slug": "yugioh-spell-ruler"
      },
      {
        "name": "YuGiOh Spell Ruler: 25th Anniversary",
        "slug": "yugioh-spell-ruler-25th-anniversary"
      },
      {
        "name": "YuGiOh Stardust Overdrive",
        "slug": "yugioh-stardust-overdrive"
      },
      {
        "name": "YuGiOh Starstrike Blast",
        "slug": "yugioh-starstrike-blast"
      },
      {
        "name": "YuGiOh Starter Deck 2006",
        "slug": "yugioh-starter-deck-2006"
      },
      {
        "name": "YuGiOh Starter Deck: Kaiba Reloaded",
        "slug": "yugioh-starter-deck-kaiba-reloaded"
      },
      {
        "name": "YuGiOh Starter Deck: Pegasus",
        "slug": "yugioh-starter-deck-pegasus"
      },
      {
        "name": "YuGiOh Starter Deck: Yugi Reloaded",
        "slug": "yugioh-starter-deck-yugi-reloaded"
      },
      {
        "name": "YuGiOh Storm of Ragnarok",
        "slug": "yugioh-storm-of-ragnarok"
      },
      {
        "name": "YuGiOh Strike of Neos",
        "slug": "yugioh-strike-of-neos"
      },
      {
        "name": "YuGiOh Structure Deck: Blaze of Destruction",
        "slug": "yugioh-structure-deck-blaze-of-destruction"
      },
      {
        "name": "YuGiOh Structure Deck: Blue Eyes White Destiny",
        "slug": "yugioh-structure-deck-blue-eyes-white-destiny"
      },
      {
        "name": "YuGiOh Structure Deck: Dinosaur's Rage",
        "slug": "yugioh-structure-deck-dinosaur's-rage"
      },
      {
        "name": "YuGiOh Structure Deck: Dragon's Roar",
        "slug": "yugioh-structure-deck-dragon's-roar"
      },
      {
        "name": "YuGiOh Structure Deck: Dragons Collide",
        "slug": "yugioh-structure-deck-dragons-collide"
      },
      {
        "name": "YuGiOh Structure Deck: Fury from the Deep",
        "slug": "yugioh-structure-deck-fury-from-the-deep"
      },
      {
        "name": "YuGiOh Structure Deck: Invincible Fortress",
        "slug": "yugioh-structure-deck-invincible-fortress"
      },
      {
        "name": "YuGiOh Structure Deck: Legend Of The Crystal Beasts",
        "slug": "yugioh-structure-deck-legend-of-the-crystal-beasts"
      },
      {
        "name": "YuGiOh Structure Deck: Saga of Blue-Eyes White Dragon",
        "slug": "yugioh-structure-deck-saga-of-blue-eyes-white-dragon"
      },
      {
        "name": "YuGiOh Structure Deck: Spellcaster's Judgment",
        "slug": "yugioh-structure-deck-spellcaster's-judgment"
      },
      {
        "name": "YuGiOh Structure Deck: Warrior's Triumph",
        "slug": "yugioh-structure-deck-warrior's-triumph"
      },
      {
        "name": "YuGiOh Structure Deck: Yugi Muto",
        "slug": "yugioh-structure-deck-yugi-muto"
      },
      {
        "name": "YuGiOh Structure Deck: Zombie Madness",
        "slug": "yugioh-structure-deck-zombie-madness"
      },
      {
        "name": "YuGiOh Structure Deck: Zombie World",
        "slug": "yugioh-structure-deck-zombie-world"
      },
      {
        "name": "YuGiOh Supreme Darkness",
        "slug": "yugioh-supreme-darkness"
      },
      {
        "name": "YuGiOh Tactical Evolution",
        "slug": "yugioh-tactical-evolution"
      },
      {
        "name": "YuGiOh Tactical Masters",
        "slug": "yugioh-tactical-masters"
      },
      {
        "name": "YuGiOh The Dark Illusion",
        "slug": "yugioh-the-dark-illusion"
      },
      {
        "name": "YuGiOh The Dark Side of Dimensions Movie Pack",
        "slug": "yugioh-the-dark-side-of-dimensions-movie-pack"
      },
      {
        "name": "YuGiOh The Dawn of Destiny",
        "slug": "yugioh-the-dawn-of-destiny"
      },
      {
        "name": "YuGiOh The Duelist Genesis",
        "slug": "yugioh-the-duelist-genesis"
      },
      {
        "name": "YuGiOh The Duelists of the Roses",
        "slug": "yugioh-the-duelists-of-the-roses"
      },
      {
        "name": "YuGiOh The Eternal Duelist Soul",
        "slug": "yugioh-the-eternal-duelist-soul"
      },
      {
        "name": "YuGiOh The Grand Creators",
        "slug": "yugioh-the-grand-creators"
      },
      {
        "name": "YuGiOh The Infinite Forbidden",
        "slug": "yugioh-the-infinite-forbidden"
      },
      {
        "name": "YuGiOh The Lost Millennium",
        "slug": "yugioh-the-lost-millennium"
      },
      {
        "name": "YuGiOh The New Challengers",
        "slug": "yugioh-the-new-challengers"
      },
      {
        "name": "YuGiOh The Sacred Cards",
        "slug": "yugioh-the-sacred-cards"
      },
      {
        "name": "YuGiOh The Shining Darkness",
        "slug": "yugioh-the-shining-darkness"
      },
      {
        "name": "YuGiOh Toon Chaos",
        "slug": "yugioh-toon-chaos"
      },
      {
        "name": "YuGiOh Ultimate Edition 2",
        "slug": "yugioh-ultimate-edition-2"
      },
      {
        "name": "YuGiOh Valiant Smashers",
        "slug": "yugioh-valiant-smashers"
      },
      {
        "name": "YuGiOh Wild Survivors",
        "slug": "yugioh-wild-survivors"
      },
      {
        "name": "YuGiOh World Championship 2025 Limited Pack",
        "slug": "yugioh-world-championship-2025-limited-pack"
      },
      {
        "name": "YuGiOh Worldwide Edition: Stairway to the Destined Duel",
        "slug": "yugioh-worldwide-edition-stairway-to-the-destined-duel"
      },
      {
        "name": "YuGiOh Yugi's Legendary Decks",
        "slug": "yugioh-yugi's-legendary-decks"
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
        "slug": "one-piece-azure-sea's-seven"
      },
      {
        "name": "One Piece OP13",
        "slug": "one-piece-carrying-on-his-will"
      },
      {
        "name": "One Piece OP12",
        "slug": "one-piece-legacy-of-the-master"
      },
      {
        "name": "One Piece Japanese OP13",
        "slug": "one-piece-japanese-carrying-on-his-will"
      },
      {
        "name": "One Piece OP05",
        "slug": "one-piece-awakening-of-the-new-era"
      },
      {
        "name": "One Piece OP09",
        "slug": "one-piece-emperors-in-the-new-world"
      },
      {
        "name": "One Piece OP11",
        "slug": "one-piece-fist-of-divine-speed"
      },
      {
        "name": "One Piece OP01",
        "slug": "one-piece-romance-dawn"
      },
      {
        "name": "Japanese One Piece P",
        "slug": "one-piece-japanese-promo"
      },
      {
        "name": "One Piece Japanese OP14",
        "slug": "one-piece-japanese-azure-sea's-seven"
      },
      {
        "name": "One Piece OP10",
        "slug": "one-piece-royal-blood"
      },
      {
        "name": "One Piece Premium Booster Vol 2",
        "slug": "one-piece-premium-booster-2"
      },
      {
        "name": "One Piece OP07",
        "slug": "one-piece-500-years-in-the-future"
      },
      {
        "name": "One Piece Japanese PRB-02",
        "slug": "one-piece-japanese-premium-booster-2"
      },
      {
        "name": "One Piece Japanese EB03",
        "slug": "one-piece-japanese-extra-booster-heroines-edition"
      },
      {
        "name": "One Piece Promotion",
        "slug": "one-piece-promo"
      },
      {
        "name": "One Piece OP08",
        "slug": "one-piece-two-legends"
      },
      {
        "name": "One Piece OP06",
        "slug": "one-piece-wings-of-the-captain"
      },
      {
        "name": "One Piece EB04",
        "slug": "one-piece-extra-booster-eb04"
      },
      {
        "name": "One Piece Japanese EB04",
        "slug": "one-piece-japanese-extra-booster-egghead-crisis"
      },
      {
        "name": "Adventure on Kami's Island",
        "slug": "one-piece-adventure-on-kami's-island"
      },
      {
        "name": "Japanese Adventure on Kami's Island",
        "slug": "one-piece-japanese-adventure-on-kami's-island"
      },
      {
        "name": "Extra Booster Heroines Edition",
        "slug": "one-piece-extra-booster-heroines-edition"
      },
      {
        "name": "One Piece Extra Booster Anime 25th Collection",
        "slug": "one-piece-extra-booster-anime-25th-collection"
      },
      {
        "name": "One Piece Extra Booster Memorial Collection",
        "slug": "one-piece-extra-booster-memorial-collection"
      },
      {
        "name": "One Piece Japanese 500 Years in the Future",
        "slug": "one-piece-japanese-500-years-in-the-future"
      },
      {
        "name": "One Piece Japanese Awakening of the New Era",
        "slug": "one-piece-japanese-awakening-of-the-new-era"
      },
      {
        "name": "One Piece Japanese Emperors in the New World",
        "slug": "one-piece-japanese-emperors-in-the-new-world"
      },
      {
        "name": "One Piece Japanese Extra Booster Anime 25th Collection",
        "slug": "one-piece-japanese-extra-booster-anime-25th-collection"
      },
      {
        "name": "One Piece Japanese Extra Booster Memorial Collection",
        "slug": "one-piece-japanese-extra-booster-memorial-collection"
      },
      {
        "name": "One Piece Japanese Fist of Divine Speed",
        "slug": "one-piece-japanese-fist-of-divine-speed"
      },
      {
        "name": "One Piece Japanese Kingdoms of Intrigue",
        "slug": "one-piece-japanese-kingdoms-of-intrigue"
      },
      {
        "name": "One Piece Japanese Legacy of the Master",
        "slug": "one-piece-japanese-legacy-of-the-master"
      },
      {
        "name": "One Piece Japanese Paramount War",
        "slug": "one-piece-japanese-paramount-war"
      },
      {
        "name": "One Piece Japanese Pillars of Strength",
        "slug": "one-piece-japanese-pillars-of-strength"
      },
      {
        "name": "One Piece Japanese Premium Booster",
        "slug": "one-piece-japanese-premium-booster"
      },
      {
        "name": "One Piece Japanese Romance Dawn",
        "slug": "one-piece-japanese-romance-dawn"
      },
      {
        "name": "One Piece Japanese Royal Blood",
        "slug": "one-piece-japanese-royal-blood"
      },
      {
        "name": "One Piece Japanese Starter Deck 11: Uta",
        "slug": "one-piece-japanese-starter-deck-11-uta"
      },
      {
        "name": "One Piece Japanese Starter Deck 12",
        "slug": "one-piece-japanese-starter-deck-12"
      },
      {
        "name": "One Piece Japanese Starter Deck 14: 3D2Y",
        "slug": "one-piece-japanese-starter-deck-14-3d2y"
      },
      {
        "name": "One Piece Japanese Starter Deck 15: Edward Newgate",
        "slug": "one-piece-japanese-starter-deck-15-edward-newgate"
      },
      {
        "name": "One Piece Japanese Starter Deck 16: Uta",
        "slug": "one-piece-japanese-starter-deck-16-uta"
      },
      {
        "name": "One Piece Japanese Starter Deck 17: Donquixote Donflamingo",
        "slug": "one-piece-japanese-starter-deck-17-donquixote-donflamingo"
      },
      {
        "name": "One Piece Japanese Starter Deck 18: Monkey.D.Luffy",
        "slug": "one-piece-japanese-starter-deck-18-monkeydluffy"
      },
      {
        "name": "One Piece Japanese Starter Deck 19: Smoker",
        "slug": "one-piece-japanese-starter-deck-19-smoker"
      },
      {
        "name": "One Piece Japanese Starter Deck 1: Straw Hat Crew",
        "slug": "one-piece-japanese-starter-deck-1-straw-hat-crew"
      },
      {
        "name": "One Piece Japanese Starter Deck 20: Charlotte Katakuri",
        "slug": "one-piece-japanese-starter-deck-20-charlotte-katakuri"
      },
      {
        "name": "One Piece Japanese Starter Deck 21: Gear5",
        "slug": "one-piece-japanese-starter-deck-21-gear5"
      },
      {
        "name": "One Piece Japanese Starter Deck 22: Ace & Newgate",
        "slug": "one-piece-japanese-starter-deck-22-ace-&-newgate"
      },
      {
        "name": "One Piece Japanese Starter Deck 23: Red Shanks",
        "slug": "one-piece-japanese-starter-deck-23-red-shanks"
      },
      {
        "name": "One Piece Japanese Starter Deck 24: Green Jewelry Bonney",
        "slug": "one-piece-japanese-starter-deck-24-green-jewelry-bonney"
      },
      {
        "name": "One Piece Japanese Starter Deck 25: Blue Buggy",
        "slug": "one-piece-japanese-starter-deck-25-blue-buggy"
      },
      {
        "name": "One Piece Japanese Starter Deck 26: Purple Monkey.D.Luffy",
        "slug": "one-piece-japanese-starter-deck-26-purple-monkeydluffy"
      },
      {
        "name": "One Piece Japanese Starter Deck 27: Black Marshall.D.Teach",
        "slug": "one-piece-japanese-starter-deck-27-black-marshalldteach"
      },
      {
        "name": "One Piece Japanese Starter Deck 28: Yellow Yamato",
        "slug": "one-piece-japanese-starter-deck-28-yellow-yamato"
      },
      {
        "name": "One Piece Japanese Starter Deck 29: Egghead Arc",
        "slug": "one-piece-japanese-starter-deck-29-egghead-arc"
      },
      {
        "name": "One Piece Japanese Starter Deck 2: Worst Generation",
        "slug": "one-piece-japanese-starter-deck-2-worst-generation"
      },
      {
        "name": "One Piece Japanese Starter Deck 3: The Seven Warlords of the Sea",
        "slug": "one-piece-japanese-starter-deck-3-the-seven-warlords-of-the-sea"
      },
      {
        "name": "One Piece Japanese Starter Deck 4: Animal Kingdom Pirates",
        "slug": "one-piece-japanese-starter-deck-4-animal-kingdom-pirates"
      },
      {
        "name": "One Piece Japanese Starter Deck 5: Film Edition",
        "slug": "one-piece-japanese-starter-deck-5-film-edition"
      },
      {
        "name": "One Piece Japanese Starter Deck 6: Absolute Justice",
        "slug": "one-piece-japanese-starter-deck-6-absolute-justice"
      },
      {
        "name": "One Piece Japanese Starter Deck 7: Big Mom Pirates",
        "slug": "one-piece-japanese-starter-deck-7-big-mom-pirates"
      },
      {
        "name": "One Piece Japanese Starter Deck 8: Monkey.D.Luffy",
        "slug": "one-piece-japanese-starter-deck-8-monkeydluffy"
      },
      {
        "name": "One Piece Japanese Starter Deck 9: Yamato",
        "slug": "one-piece-japanese-starter-deck-9-yamato"
      },
      {
        "name": "One Piece Japanese Two Legends",
        "slug": "one-piece-japanese-two-legends"
      },
      {
        "name": "One Piece Japanese Ultra Deck: The Three Brothers",
        "slug": "one-piece-japanese-ultra-deck-the-three-brothers"
      },
      {
        "name": "One Piece Japanese Ultra Deck: The Three Captains",
        "slug": "one-piece-japanese-ultra-deck-the-three-captains"
      },
      {
        "name": "One Piece Japanese Wings of the Captain",
        "slug": "one-piece-japanese-wings-of-the-captain"
      },
      {
        "name": "One Piece Kingdoms of Intrigue",
        "slug": "one-piece-kingdoms-of-intrigue"
      },
      {
        "name": "One Piece Learn Together Deck Set",
        "slug": "one-piece-learn-together-deck-set"
      },
      {
        "name": "One Piece Paramount War",
        "slug": "one-piece-paramount-war"
      },
      {
        "name": "One Piece Passage to the Grand Line",
        "slug": "one-piece-passage-to-the-grand-line"
      },
      {
        "name": "One Piece Pillars of Strength",
        "slug": "one-piece-pillars-of-strength"
      },
      {
        "name": "One Piece Premium Booster",
        "slug": "one-piece-premium-booster"
      },
      {
        "name": "One Piece Seven Warlords of the Sea Binder Set",
        "slug": "one-piece-seven-warlords-of-the-sea-binder-set"
      },
      {
        "name": "One Piece Starter Deck 11: Uta",
        "slug": "one-piece-starter-deck-11-uta"
      },
      {
        "name": "One Piece Starter Deck 12",
        "slug": "one-piece-starter-deck-12"
      },
      {
        "name": "One Piece Starter Deck 14: 3D2Y",
        "slug": "one-piece-starter-deck-14-3d2y"
      },
      {
        "name": "One Piece Starter Deck 15: Edward Newgate",
        "slug": "one-piece-starter-deck-15-edward-newgate"
      },
      {
        "name": "One Piece Starter Deck 16: Uta",
        "slug": "one-piece-starter-deck-16-uta"
      },
      {
        "name": "One Piece Starter Deck 17: Donquixote Donflamingo",
        "slug": "one-piece-starter-deck-17-donquixote-donflamingo"
      },
      {
        "name": "One Piece Starter Deck 18: Monkey.D.Luffy",
        "slug": "one-piece-starter-deck-18-monkeydluffy"
      },
      {
        "name": "One Piece Starter Deck 19: Smoker",
        "slug": "one-piece-starter-deck-19-smoker"
      },
      {
        "name": "One Piece Starter Deck 1: Straw Hat Crew",
        "slug": "one-piece-starter-deck-1-straw-hat-crew"
      },
      {
        "name": "One Piece Starter Deck 20: Charlotte Katakuri",
        "slug": "one-piece-starter-deck-20-charlotte-katakuri"
      },
      {
        "name": "One Piece Starter Deck 21: Gear5",
        "slug": "one-piece-starter-deck-21-gear5"
      },
      {
        "name": "One Piece Starter Deck 22: Ace & Newgate",
        "slug": "one-piece-starter-deck-22-ace-&-newgate"
      },
      {
        "name": "One Piece Starter Deck 23: Red Shanks",
        "slug": "one-piece-starter-deck-23-red-shanks"
      },
      {
        "name": "One Piece Starter Deck 24: Green Jewelry Bonney",
        "slug": "one-piece-starter-deck-24-green-jewelry-bonney"
      },
      {
        "name": "One Piece Starter Deck 25: Blue Buggy",
        "slug": "one-piece-starter-deck-25-blue-buggy"
      },
      {
        "name": "One Piece Starter Deck 26: Purple Monkey.D.Luffy",
        "slug": "one-piece-starter-deck-26-purple-monkeydluffy"
      },
      {
        "name": "One Piece Starter Deck 27: Black Marshall.D.Teach",
        "slug": "one-piece-starter-deck-27-black-marshalldteach"
      },
      {
        "name": "One Piece Starter Deck 28: Yellow Yamato",
        "slug": "one-piece-starter-deck-28-yellow-yamato"
      },
      {
        "name": "One Piece Starter Deck 29: Egghead",
        "slug": "one-piece-starter-deck-29-egghead"
      },
      {
        "name": "One Piece Starter Deck 2: Worst Generation",
        "slug": "one-piece-starter-deck-2-worst-generation"
      },
      {
        "name": "One Piece Starter Deck 3: The Seven Warlords of the Sea",
        "slug": "one-piece-starter-deck-3-the-seven-warlords-of-the-sea"
      },
      {
        "name": "One Piece Starter Deck 4: Animal Kingdom Pirates",
        "slug": "one-piece-starter-deck-4-animal-kingdom-pirates"
      },
      {
        "name": "One Piece Starter Deck 5: Film Edition",
        "slug": "one-piece-starter-deck-5-film-edition"
      },
      {
        "name": "One Piece Starter Deck 6: Absolute Justice",
        "slug": "one-piece-starter-deck-6-absolute-justice"
      },
      {
        "name": "One Piece Starter Deck 7: Big Mom Pirates",
        "slug": "one-piece-starter-deck-7-big-mom-pirates"
      },
      {
        "name": "One Piece Starter Deck 8: Monkey.D.Luffy",
        "slug": "one-piece-starter-deck-8-monkeydluffy"
      },
      {
        "name": "One Piece Starter Deck 9: Yamato",
        "slug": "one-piece-starter-deck-9-yamato"
      },
      {
        "name": "One Piece The Quest Begins",
        "slug": "one-piece-the-quest-begins"
      },
      {
        "name": "One Piece Tin Pack Set Vol 1",
        "slug": "one-piece-tin-pack-set-vol-1"
      },
      {
        "name": "One Piece Ultra Deck: The Three Brothers",
        "slug": "one-piece-ultra-deck-the-three-brothers"
      },
      {
        "name": "One Piece Ultra Deck: The Three Captains",
        "slug": "one-piece-ultra-deck-the-three-captains"
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
        "slug": "lorcana-fabled"
      },
      {
        "name": "Lorcana First Chapter",
        "slug": "lorcana-first-chapter"
      },
      {
        "name": "Lorcana Whispers in the Well",
        "slug": "lorcana-whispers-in-the-well"
      },
      {
        "name": "Lorcana Promo",
        "slug": "lorcana-promo"
      },
      {
        "name": "Lorcana Reign of Jafar",
        "slug": "lorcana-reign-of-jafar"
      },
      {
        "name": "Lorcana Archazia's Island",
        "slug": "lorcana-archazia's-island"
      },
      {
        "name": "Lorcana Rise of the Floodborn",
        "slug": "lorcana-rise-of-the-floodborn"
      },
      {
        "name": "Lorcana Azurite Sea",
        "slug": "lorcana-azurite-sea"
      },
      {
        "name": "Lorcana Shimmering Skies",
        "slug": "lorcana-shimmering-skies"
      },
      {
        "name": "Lorcana Into the Inklands",
        "slug": "lorcana-into-the-inklands"
      },
      {
        "name": "Winterspell",
        "slug": "lorcana-winterspell"
      },
      {
        "name": "Lorcana Ursula's Return",
        "slug": "lorcana-ursula's-return"
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
        "slug": "digimon-promotion"
      },
      {
        "name": "Digimon EX11",
        "slug": "digimon-dawn-of-liberator"
      },
      {
        "name": "Digimon EX10",
        "slug": "digimon-sinister-order"
      },
      {
        "name": "Digimon BT21",
        "slug": "digimon-world-convergence"
      },
      {
        "name": "Digimon EX7",
        "slug": "digimon-liberator"
      },
      {
        "name": "Digimon BT22",
        "slug": "digimon-cyber-eden"
      },
      {
        "name": "Digimon BT19",
        "slug": "digimon-special-booster-25"
      },
      {
        "name": "Digimon BT12",
        "slug": "digimon-across-time"
      },
      {
        "name": "Digimon BT17",
        "slug": "digimon-secret-crisis"
      },
      {
        "name": "Digimon EX8",
        "slug": "digimon-chain-of-liberation"
      },
      {
        "name": "Digimon BT15",
        "slug": "digimon-exceed-apocalypse"
      },
      {
        "name": "Digimon BT8",
        "slug": "digimon-new-awakening"
      },
      {
        "name": "Digimon BT14",
        "slug": "digimon-blast-ace"
      },
      {
        "name": "Digimon EX9",
        "slug": "digimon-versus-monsters"
      },
      {
        "name": "Digimon EX6",
        "slug": "digimon-infernal-ascension"
      },
      {
        "name": "Digimon BT16",
        "slug": "digimon-beginning-observer"
      },
      {
        "name": "Digimon BT11",
        "slug": "digimon-dimensional-phase"
      },
      {
        "name": "Digimon BT7",
        "slug": "digimon-next-adventure"
      },
      {
        "name": "Digimon EX1",
        "slug": "digimon-classic-collection"
      },
      {
        "name": "Digimon BT13",
        "slug": "digimon-versus-royal-knights"
      },
      {
        "name": "Digimon 1999 Upper Deck Exclusive Preview",
        "slug": "digimon-1999-upper-deck-exclusive-preview"
      },
      {
        "name": "Digimon Alternative Being",
        "slug": "digimon-alternative-being"
      },
      {
        "name": "Digimon Animal Colosseum",
        "slug": "digimon-animal-colosseum"
      },
      {
        "name": "Digimon Battle of Omni",
        "slug": "digimon-battle-of-omni"
      },
      {
        "name": "Digimon CCG",
        "slug": "digimon-ccg"
      },
      {
        "name": "Digimon Digital Hazard",
        "slug": "digimon-digital-hazard"
      },
      {
        "name": "Digimon Double Diamond",
        "slug": "digimon-double-diamond"
      },
      {
        "name": "Digimon Draconic Roar",
        "slug": "digimon-draconic-roar"
      },
      {
        "name": "Digimon Elemental Successor",
        "slug": "digimon-elemental-successor"
      },
      {
        "name": "Digimon Great Legend",
        "slug": "digimon-great-legend"
      },
      {
        "name": "Digimon New Evolution",
        "slug": "digimon-new-evolution"
      },
      {
        "name": "Digimon Over the X",
        "slug": "digimon-over-the-x"
      },
      {
        "name": "Digimon Resurgence Booster 1",
        "slug": "digimon-resurgence-booster-1"
      },
      {
        "name": "Digimon Revision Pack",
        "slug": "digimon-revision-pack"
      },
      {
        "name": "Digimon Special Release Ver 1.5",
        "slug": "digimon-special-release-ver-15"
      },
      {
        "name": "Digimon Starter Deck 01: Gaia Red",
        "slug": "digimon-starter-deck-01-gaia-red"
      },
      {
        "name": "Digimon Starter Deck 02: Cocytus Blue",
        "slug": "digimon-starter-deck-02-cocytus-blue"
      },
      {
        "name": "Digimon Starter Deck 03: Heaven's Yellow",
        "slug": "digimon-starter-deck-03-heaven's-yellow"
      },
      {
        "name": "Digimon Starter Deck 04: Giga Green",
        "slug": "digimon-starter-deck-04-giga-green"
      },
      {
        "name": "Digimon Starter Deck 05: Machine Black",
        "slug": "digimon-starter-deck-05-machine-black"
      },
      {
        "name": "Digimon Starter Deck 06: Venomous Violet",
        "slug": "digimon-starter-deck-06-venomous-violet"
      },
      {
        "name": "Digimon Starter Deck 07: Gallantmon",
        "slug": "digimon-starter-deck-07-gallantmon"
      },
      {
        "name": "Digimon Starter Deck 08: Ulforce Veedramon",
        "slug": "digimon-starter-deck-08-ulforce-veedramon"
      },
      {
        "name": "Digimon Starter Deck 09: Ultimate Ancient Dragon",
        "slug": "digimon-starter-deck-09-ultimate-ancient-dragon"
      },
      {
        "name": "Digimon Starter Deck 10: Parallel World Tacticia",
        "slug": "digimon-starter-deck-10-parallel-world-tacticia"
      },
      {
        "name": "Digimon Starter Deck 12: Jesmon",
        "slug": "digimon-starter-deck-12-jesmon"
      },
      {
        "name": "Digimon Starter Deck 13: Ragnaloardmon",
        "slug": "digimon-starter-deck-13-ragnaloardmon"
      },
      {
        "name": "Digimon Starter Deck 14: Beelzemon Advanced",
        "slug": "digimon-starter-deck-14-beelzemon-advanced"
      },
      {
        "name": "Digimon Starter Deck 15: Dragon of Courage",
        "slug": "digimon-starter-deck-15-dragon-of-courage"
      },
      {
        "name": "Digimon Starter Deck 16: Wolf of Friendship",
        "slug": "digimon-starter-deck-16-wolf-of-friendship"
      },
      {
        "name": "Digimon Starter Deck 17: Double Typhoon Advanced",
        "slug": "digimon-starter-deck-17-double-typhoon-advanced"
      },
      {
        "name": "Digimon Starter Deck 18: Guardian Vortex",
        "slug": "digimon-starter-deck-18-guardian-vortex"
      },
      {
        "name": "Digimon Starter Deck 19: Fable Waltz",
        "slug": "digimon-starter-deck-19-fable-waltz"
      },
      {
        "name": "Digimon Starter Deck 20: Protector of Light",
        "slug": "digimon-starter-deck-20-protector-of-light"
      },
      {
        "name": "Digimon Starter Deck 21: Hero of Hope",
        "slug": "digimon-starter-deck-21-hero-of-hope"
      },
      {
        "name": "Digimon Ultimate Power",
        "slug": "digimon-ultimate-power"
      },
      {
        "name": "Digimon X Record",
        "slug": "digimon-x-record"
      },
      {
        "name": "Digimon Xros Encounter",
        "slug": "digimon-xros-encounter"
      },
      {
        "name": "Digimon Xros Evolution",
        "slug": "digimon-xros-evolution"
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
        "slug": "dragon-ball-fusion-world-ultra-limit"
      },
      {
        "name": "Dragon Ball FB07",
        "slug": "dragon-ball-super-wish-for-shenron"
      },
      {
        "name": "Dragon Ball SB02",
        "slug": "dragon-ball-fusion-world-manga-booster-02"
      },
      {
        "name": "Dragon Ball FB08",
        "slug": "dragon-ball-fusion-world-saiyan's-pride"
      },
      {
        "name": "Dragon Ball SB01",
        "slug": "dragon-ball-fusion-world-manga-booster-01"
      },
      {
        "name": "Dragon Ball BT29",
        "slug": "dragon-ball-super-fearsome-rivals"
      },
      {
        "name": "Dragon Ball FB02",
        "slug": "dragon-ball-fusion-world-blazing-aura"
      },
      {
        "name": "Dragon Ball FB01",
        "slug": "dragon-ball-fusion-world-awakened-pulse"
      },
      {
        "name": "Dragon Ball FB03",
        "slug": "dragon-ball-fusion-world-raging-roar"
      },
      {
        "name": "Dragon Ball FB05",
        "slug": "dragon-ball-fusion-world-new-adventure"
      },
      {
        "name": "Dragon Ball Super BT28",
        "slug": "dragon-ball-super-prismatic-clash"
      },
      {
        "name": "Dragon Ball Super FB06",
        "slug": "dragon-ball-super-rivals-clash"
      },
      {
        "name": "Dragon Ball Fusion World Promo",
        "slug": "dragon-ball-fusion-world-promos"
      },
      {
        "name": "Dragon Ball Super BT27",
        "slug": "dragon-ball-super-history-of-z"
      },
      {
        "name": "Dragon Ball Super BT23",
        "slug": "dragon-ball-super-perfect-combination"
      },
      {
        "name": "Dragon Ball Super BT26",
        "slug": "dragon-ball-super-ultimate-advent"
      },
      {
        "name": "Dragon Ball Super BT20",
        "slug": "dragon-ball-super-power-absorbed"
      },
      {
        "name": "Dragon Ball Super BT22",
        "slug": "dragon-ball-super-critical-blow"
      },
      {
        "name": "Dragon Ball Super BT24",
        "slug": "dragon-ball-super-beyond-generations"
      },
      {
        "name": "Dragon Ball Super DB2P",
        "slug": "dragon-ball-super-divine-multiverse-release-promos"
      },
      {
        "name": "Dragon Ball Fusion World Dual Evolution",
        "slug": "dragon-ball-fusion-world-dual-evolution"
      },
      {
        "name": "Dragon Ball Fusion World Energy Markers",
        "slug": "dragon-ball-fusion-world-energy-markers"
      },
      {
        "name": "Dragon Ball Fusion World Judge Promo",
        "slug": "dragon-ball-fusion-world-judge-promo"
      },
      {
        "name": "Dragon Ball Fusion World Raging Roar Promo",
        "slug": "dragon-ball-fusion-world-raging-roar-promo"
      },
      {
        "name": "Dragon Ball Fusion World Special Tournament Promo",
        "slug": "dragon-ball-fusion-world-special-tournament-promo"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Bardock",
        "slug": "dragon-ball-fusion-world-starter-deck-bardock"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Broly",
        "slug": "dragon-ball-fusion-world-starter-deck-broly"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Frieza",
        "slug": "dragon-ball-fusion-world-starter-deck-frieza"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Giblet",
        "slug": "dragon-ball-fusion-world-starter-deck-giblet"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Shallot",
        "slug": "dragon-ball-fusion-world-starter-deck-shallot"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Son Goku",
        "slug": "dragon-ball-fusion-world-starter-deck-son-goku"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Son Goku Mini",
        "slug": "dragon-ball-fusion-world-starter-deck-son-goku-mini"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Vegeta",
        "slug": "dragon-ball-fusion-world-starter-deck-vegeta"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Vegeta Mini",
        "slug": "dragon-ball-fusion-world-starter-deck-vegeta-mini"
      },
      {
        "name": "Dragon Ball Fusion World Starter Deck: Vegeta Mini Super Saiyan 3",
        "slug": "dragon-ball-fusion-world-starter-deck-vegeta-mini-super-saiyan-3"
      },
      {
        "name": "Dragon Ball Fusion World Unnumbered Promo",
        "slug": "dragon-ball-fusion-world-unnumbered-promo"
      },
      {
        "name": "Dragon Ball Super Assault of the Saiyans",
        "slug": "dragon-ball-super-assault-of-the-saiyans"
      },
      {
        "name": "Dragon Ball Super Battle Evolution Booster",
        "slug": "dragon-ball-super-battle-evolution-booster"
      },
      {
        "name": "Dragon Ball Super Clash of Fates",
        "slug": "dragon-ball-super-clash-of-fates"
      },
      {
        "name": "Dragon Ball Super Collector's Selection Vol.1",
        "slug": "dragon-ball-super-collector's-selection-vol1"
      },
      {
        "name": "Dragon Ball Super Collector's Selection Vol.2",
        "slug": "dragon-ball-super-collector's-selection-vol2"
      },
      {
        "name": "Dragon Ball Super Collector's Selection Vol.3",
        "slug": "dragon-ball-super-collector's-selection-vol3"
      },
      {
        "name": "Dragon Ball Super Colossal Warfare",
        "slug": "dragon-ball-super-colossal-warfare"
      },
      {
        "name": "Dragon Ball Super Cross Spirits",
        "slug": "dragon-ball-super-cross-spirits"
      },
      {
        "name": "Dragon Ball Super Cross Worlds",
        "slug": "dragon-ball-super-cross-worlds"
      },
      {
        "name": "Dragon Ball Super Dawn of the Z-Legends",
        "slug": "dragon-ball-super-dawn-of-the-z-legends"
      },
      {
        "name": "Dragon Ball Super Destroyer Kings",
        "slug": "dragon-ball-super-destroyer-kings"
      },
      {
        "name": "Dragon Ball Super Divine Multiverse",
        "slug": "dragon-ball-super-divine-multiverse"
      },
      {
        "name": "Dragon Ball Super Dragon Brawl",
        "slug": "dragon-ball-super-dragon-brawl"
      },
      {
        "name": "Dragon Ball Super Dragon Brawl Release Promos",
        "slug": "dragon-ball-super-dragon-brawl-release-promos"
      },
      {
        "name": "Dragon Ball Super Expansion Set: 5th Anniversary Set",
        "slug": "dragon-ball-super-expansion-set-5th-anniversary-set"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Battle Advanced",
        "slug": "dragon-ball-super-expansion-set-battle-advanced"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Battle Enhanced",
        "slug": "dragon-ball-super-expansion-set-battle-enhanced"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Dark Demon's Villains",
        "slug": "dragon-ball-super-expansion-set-dark-demon's-villains"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Mighty Heroes",
        "slug": "dragon-ball-super-expansion-set-mighty-heroes"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Namekian Boost",
        "slug": "dragon-ball-super-expansion-set-namekian-boost"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Namekian Surge",
        "slug": "dragon-ball-super-expansion-set-namekian-surge"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Saiyan Boost",
        "slug": "dragon-ball-super-expansion-set-saiyan-boost"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Saiyan Surge",
        "slug": "dragon-ball-super-expansion-set-saiyan-surge"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Special Anniversary Box",
        "slug": "dragon-ball-super-expansion-set-special-anniversary-box"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Special Anniversary Box 2020",
        "slug": "dragon-ball-super-expansion-set-special-anniversary-box-2020"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Special Anniversary Box 2021",
        "slug": "dragon-ball-super-expansion-set-special-anniversary-box-2021"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Ultimate Box",
        "slug": "dragon-ball-super-expansion-set-ultimate-box"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Ultimate Deck",
        "slug": "dragon-ball-super-expansion-set-ultimate-deck"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Ultimate Deck 2022",
        "slug": "dragon-ball-super-expansion-set-ultimate-deck-2022"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Ultimate Deck 2023",
        "slug": "dragon-ball-super-expansion-set-ultimate-deck-2023"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Unity of Destruction",
        "slug": "dragon-ball-super-expansion-set-unity-of-destruction"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Unity of Saiyans",
        "slug": "dragon-ball-super-expansion-set-unity-of-saiyans"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Universe 11 Unison",
        "slug": "dragon-ball-super-expansion-set-universe-11-unison"
      },
      {
        "name": "Dragon Ball Super Expansion Set: Universe 7 Unison",
        "slug": "dragon-ball-super-expansion-set-universe-7-unison"
      },
      {
        "name": "Dragon Ball Super Expert Deck: Android Duality",
        "slug": "dragon-ball-super-expert-deck-android-duality"
      },
      {
        "name": "Dragon Ball Super Expert Deck: The Ultimate Life Form",
        "slug": "dragon-ball-super-expert-deck-the-ultimate-life-form"
      },
      {
        "name": "Dragon Ball Super Expert Deck: Universe 6 Assailants",
        "slug": "dragon-ball-super-expert-deck-universe-6-assailants"
      },
      {
        "name": "Dragon Ball Super Fighter's Ambition",
        "slug": "dragon-ball-super-fighter's-ambition"
      },
      {
        "name": "Dragon Ball Super Galactic Battle",
        "slug": "dragon-ball-super-galactic-battle"
      },
      {
        "name": "Dragon Ball Super Giant Force",
        "slug": "dragon-ball-super-giant-force"
      },
      {
        "name": "Dragon Ball Super Judge Promotion",
        "slug": "dragon-ball-super-judge-promotion"
      },
      {
        "name": "Dragon Ball Super Legend of the Dragon Balls",
        "slug": "dragon-ball-super-legend-of-the-dragon-balls"
      },
      {
        "name": "Dragon Ball Super Magnificent Collection Forsaken Warrior",
        "slug": "dragon-ball-super-magnificent-collection-forsaken-warrior"
      },
      {
        "name": "Dragon Ball Super Magnificent Collection Fusion Hero",
        "slug": "dragon-ball-super-magnificent-collection-fusion-hero"
      },
      {
        "name": "Dragon Ball Super Malicious Machinations",
        "slug": "dragon-ball-super-malicious-machinations"
      },
      {
        "name": "Dragon Ball Super Malicious Machinations: Pre-Release Promos",
        "slug": "dragon-ball-super-malicious-machinations-pre-release-promos"
      },
      {
        "name": "Dragon Ball Super Miraculous Revival",
        "slug": "dragon-ball-super-miraculous-revival"
      },
      {
        "name": "Dragon Ball Super Mythic Booster",
        "slug": "dragon-ball-super-mythic-booster"
      },
      {
        "name": "Dragon Ball Super Premium Anniversary Box 2023",
        "slug": "dragon-ball-super-premium-anniversary-box-2023"
      },
      {
        "name": "Dragon Ball Super Premium Anniversary Box 2024",
        "slug": "dragon-ball-super-premium-anniversary-box-2024"
      },
      {
        "name": "Dragon Ball Super Premium Anniversary Box 2025",
        "slug": "dragon-ball-super-premium-anniversary-box-2025"
      },
      {
        "name": "Dragon Ball Super Promos: Blazing Aura [Fusion World]",
        "slug": "dragon-ball-super-promos-blazing-aura-fusion-world"
      },
      {
        "name": "Dragon Ball Super Realm of the Gods",
        "slug": "dragon-ball-super-realm-of-the-gods"
      },
      {
        "name": "Dragon Ball Super Rise of the Unison Warrior",
        "slug": "dragon-ball-super-rise-of-the-unison-warrior"
      },
      {
        "name": "Dragon Ball Super Rise of the Unison Warrior: Pre-Release Promos",
        "slug": "dragon-ball-super-rise-of-the-unison-warrior-pre-release-promos"
      },
      {
        "name": "Dragon Ball Super Saiyan Showdown",
        "slug": "dragon-ball-super-saiyan-showdown"
      },
      {
        "name": "Dragon Ball Super Series 6 Pre-Release Promos",
        "slug": "dragon-ball-super-series-6-pre-release-promos"
      },
      {
        "name": "Dragon Ball Super Series 7 Pre-Release Promos",
        "slug": "dragon-ball-super-series-7-pre-release-promos"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Blue Future",
        "slug": "dragon-ball-super-starter-deck-blue-future"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Clan Collusion",
        "slug": "dragon-ball-super-starter-deck-clan-collusion"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Darkness Reborn",
        "slug": "dragon-ball-super-starter-deck-darkness-reborn"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Final Radiance",
        "slug": "dragon-ball-super-starter-deck-final-radiance"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Green Fusion",
        "slug": "dragon-ball-super-starter-deck-green-fusion"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Instinct Surpassed",
        "slug": "dragon-ball-super-starter-deck-instinct-surpassed"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Parasitic Overlord",
        "slug": "dragon-ball-super-starter-deck-parasitic-overlord"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Pride of the Saiyans",
        "slug": "dragon-ball-super-starter-deck-pride-of-the-saiyans"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Proud Warrior",
        "slug": "dragon-ball-super-starter-deck-proud-warrior"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Red Rage",
        "slug": "dragon-ball-super-starter-deck-red-rage"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Resurrected Fusion",
        "slug": "dragon-ball-super-starter-deck-resurrected-fusion"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Rising Broly",
        "slug": "dragon-ball-super-starter-deck-rising-broly"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Saiyan Legacy",
        "slug": "dragon-ball-super-starter-deck-saiyan-legacy"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Saiyan Wonder",
        "slug": "dragon-ball-super-starter-deck-saiyan-wonder"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Shenron's Advent",
        "slug": "dragon-ball-super-starter-deck-shenron's-advent"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Spirit of Potara",
        "slug": "dragon-ball-super-starter-deck-spirit-of-potara"
      },
      {
        "name": "Dragon Ball Super Starter Deck: The Crimson Saiyan",
        "slug": "dragon-ball-super-starter-deck-the-crimson-saiyan"
      },
      {
        "name": "Dragon Ball Super Starter Deck: The Dark Invasion",
        "slug": "dragon-ball-super-starter-deck-the-dark-invasion"
      },
      {
        "name": "Dragon Ball Super Starter Deck: The Extreme Evolution",
        "slug": "dragon-ball-super-starter-deck-the-extreme-evolution"
      },
      {
        "name": "Dragon Ball Super Starter Deck: The Guardians of Namekians",
        "slug": "dragon-ball-super-starter-deck-the-guardians-of-namekians"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Ultimate Awakened Power",
        "slug": "dragon-ball-super-starter-deck-ultimate-awakened-power"
      },
      {
        "name": "Dragon Ball Super Starter Deck: Yellow Transformation",
        "slug": "dragon-ball-super-starter-deck-yellow-transformation"
      },
      {
        "name": "Dragon Ball Super Supreme Rivalry",
        "slug": "dragon-ball-super-supreme-rivalry"
      },
      {
        "name": "Dragon Ball Super The Tournament of Power",
        "slug": "dragon-ball-super-the-tournament-of-power"
      },
      {
        "name": "Dragon Ball Super Theme Selection: History of Son Goku",
        "slug": "dragon-ball-super-theme-selection-history-of-son-goku"
      },
      {
        "name": "Dragon Ball Super Theme Selection: History of Vegeta",
        "slug": "dragon-ball-super-theme-selection-history-of-vegeta"
      },
      {
        "name": "Dragon Ball Super Ultimate Squad",
        "slug": "dragon-ball-super-ultimate-squad"
      },
      {
        "name": "Dragon Ball Super Union Force",
        "slug": "dragon-ball-super-union-force"
      },
      {
        "name": "Dragon Ball Super Universal Onslaught",
        "slug": "dragon-ball-super-universal-onslaught"
      },
      {
        "name": "Dragon Ball Super Universal Onslaught: Pre-Release Promos",
        "slug": "dragon-ball-super-universal-onslaught-pre-release-promos"
      },
      {
        "name": "Dragon Ball Super Vault Power Up Pack",
        "slug": "dragon-ball-super-vault-power-up-pack"
      },
      {
        "name": "Dragon Ball Super Vault Power Up Pack 2020",
        "slug": "dragon-ball-super-vault-power-up-pack-2020"
      },
      {
        "name": "Dragon Ball Super Vault Power Up Pack 2021",
        "slug": "dragon-ball-super-vault-power-up-pack-2021"
      },
      {
        "name": "Dragon Ball Super Vermilion Bloodline",
        "slug": "dragon-ball-super-vermilion-bloodline"
      },
      {
        "name": "Dragon Ball Super Vicious Rejuvenation",
        "slug": "dragon-ball-super-vicious-rejuvenation"
      },
      {
        "name": "Dragon Ball Super Wild Resurgence",
        "slug": "dragon-ball-super-wild-resurgence"
      },
      {
        "name": "Dragon Ball Super World Martial Arts Tournament",
        "slug": "dragon-ball-super-world-martial-arts-tournament"
      },
      {
        "name": "Dragon Ball Z Android Saga",
        "slug": "dragon-ball-z-android-saga"
      },
      {
        "name": "Dragon Ball Z Awakening",
        "slug": "dragon-ball-z-awakening"
      },
      {
        "name": "Dragon Ball Z Babidi Saga",
        "slug": "dragon-ball-z-babidi-saga"
      },
      {
        "name": "Dragon Ball Z Baby Saga",
        "slug": "dragon-ball-z-baby-saga"
      },
      {
        "name": "Dragon Ball Z Buu Saga",
        "slug": "dragon-ball-z-buu-saga"
      },
      {
        "name": "Dragon Ball Z Cell Games Saga",
        "slug": "dragon-ball-z-cell-games-saga"
      },
      {
        "name": "Dragon Ball Z Cell Saga",
        "slug": "dragon-ball-z-cell-saga"
      },
      {
        "name": "Dragon Ball Z Evolution",
        "slug": "dragon-ball-z-evolution"
      },
      {
        "name": "Dragon Ball Z Frieza Saga",
        "slug": "dragon-ball-z-frieza-saga"
      },
      {
        "name": "Dragon Ball Z Fusion Saga",
        "slug": "dragon-ball-z-fusion-saga"
      },
      {
        "name": "Dragon Ball Z Heroes and Villians",
        "slug": "dragon-ball-z-heroes-and-villians"
      },
      {
        "name": "Dragon Ball Z JPP/Amada Series 1",
        "slug": "dragon-ball-z-jppamada-series-1"
      },
      {
        "name": "Dragon Ball Z JPP/Amada Series 2",
        "slug": "dragon-ball-z-jppamada-series-2"
      },
      {
        "name": "Dragon Ball Z Kid Buu Saga",
        "slug": "dragon-ball-z-kid-buu-saga"
      },
      {
        "name": "Dragon Ball Z Movie Collection",
        "slug": "dragon-ball-z-movie-collection"
      },
      {
        "name": "Dragon Ball Z Organized Play Promo",
        "slug": "dragon-ball-z-organized-play-promo"
      },
      {
        "name": "Dragon Ball Z Perfection",
        "slug": "dragon-ball-z-perfection"
      },
      {
        "name": "Dragon Ball Z Premier Set",
        "slug": "dragon-ball-z-premier-set"
      },
      {
        "name": "Dragon Ball Z Saiyan Saga",
        "slug": "dragon-ball-z-saiyan-saga"
      },
      {
        "name": "Dragon Ball Z Super 17 Saga",
        "slug": "dragon-ball-z-super-17-saga"
      },
      {
        "name": "Dragon Ball Z Trunks Saga",
        "slug": "dragon-ball-z-trunks-saga"
      },
      {
        "name": "Dragon Ball Z Vengeance",
        "slug": "dragon-ball-z-vengeance"
      },
      {
        "name": "Dragon Ball Z World Games Saga",
        "slug": "dragon-ball-z-world-games-saga"
      },
      {
        "name": "Dragon Ball Z World Games Saga 2002",
        "slug": "dragon-ball-z-world-games-saga-2002"
      },
      {
        "name": "Dragon Ball Z World Games Saga 2002 Babadi Preview",
        "slug": "dragon-ball-z-world-games-saga-2002-babadi-preview"
      },
      {
        "name": "Dragon Ball Z World Games Saga 2002 Battle Simulator",
        "slug": "dragon-ball-z-world-games-saga-2002-battle-simulator"
      },
      {
        "name": "Dragon Ball Z World Games Saga 2002 Collector's Club",
        "slug": "dragon-ball-z-world-games-saga-2002-collector's-club"
      },
      {
        "name": "Dragon Ball Z World Games Saga 2002 Scoring Zone",
        "slug": "dragon-ball-z-world-games-saga-2002-scoring-zone"
      },
      {
        "name": "Dragon Ball Z: Arrival",
        "slug": "dragon-ball-z-arrival"
      },
      {
        "name": "Dragon Ball Z: Revelation",
        "slug": "dragon-ball-z-revelation"
      },
      {
        "name": "Dragon Ball Z: Showdown",
        "slug": "dragon-ball-z-showdown"
      },
      {
        "name": "Dragon Ball Z: Transformation",
        "slug": "dragon-ball-z-transformation"
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
        "slug": "gundam-newtype-rising"
      },
      {
        "name": "Gundam GD03",
        "slug": "gundam-steel-requiem"
      },
      {
        "name": "Gundam GD02",
        "slug": "gundam-dual-impact"
      },
      {
        "name": "Gundam Beta",
        "slug": "gundam-edition-beta"
      },
      {
        "name": "Gundam Starter Deck 09: Destiny Ignition",
        "slug": "gundam-starter-deck-09-destiny-ignition"
      },
      {
        "name": "Gundam Celestial Drive",
        "slug": "gundam-celestial-drive"
      },
      {
        "name": "Gundam EX Resource Token Promo",
        "slug": "gundam-ex-resource-token-promo"
      },
      {
        "name": "Gundam Promo",
        "slug": "gundam-promo"
      },
      {
        "name": "Gundam Starter Deck 01: Heroic Beginnings",
        "slug": "gundam-starter-deck-01-heroic-beginnings"
      },
      {
        "name": "Gundam Starter Deck 02: Wings of Advance",
        "slug": "gundam-starter-deck-02-wings-of-advance"
      },
      {
        "name": "Gundam Starter Deck 03: Zeon's Rush",
        "slug": "gundam-starter-deck-03-zeon's-rush"
      },
      {
        "name": "Gundam Starter Deck 04: SEED Strike",
        "slug": "gundam-starter-deck-04-seed-strike"
      },
      {
        "name": "Gundam Starter Deck 05: Iron Bloom",
        "slug": "gundam-starter-deck-05-iron-bloom"
      },
      {
        "name": "Gundam Starter Deck 06: Clan Unity",
        "slug": "gundam-starter-deck-06-clan-unity"
      },
      {
        "name": "Gundam Starter Deck 08: Flash of Radiance",
        "slug": "gundam-starter-deck-08-flash-of-radiance"
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
        "slug": "star-wars-unlimited-jump-to-lightspeed"
      },
      {
        "name": "Star Wars Unlimited: SOR",
        "slug": "star-wars-unlimited-spark-of-rebellion"
      },
      {
        "name": "Star Wars Unlimited: SEC",
        "slug": "star-wars-unlimited-secrets-of-power"
      },
      {
        "name": "Star Wars Unlimited: SHD",
        "slug": "star-wars-unlimited-shadows-of-the-galaxy"
      },
      {
        "name": "Star Wars Unlimited: Lawless Time",
        "slug": "star-wars-unlimited-lawless-time"
      },
      {
        "name": "Star Wars Unlimited: Legends of the Force",
        "slug": "star-wars-unlimited-legends-of-the-force"
      },
      {
        "name": "Star Wars Unlimited: Twilight of the Republic",
        "slug": "star-wars-unlimited-twilight-of-the-republic"
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
        "slug": "riftbound-origins"
      },
      {
        "name": "Riftbound Origins: Proving Grounds",
        "slug": "riftbound-origins-proving-grounds"
      },
      {
        "name": "Riftbound Spiritforged",
        "slug": "riftbound-spiritforged"
      },
      {
        "name": "Riftbound Promo",
        "slug": "riftbound-promo"
      }
    ]
  }
};

// ── Hourly Set Cache ──────────────────────────────────────────────────────
// Refreshes all game category pages every hour to pick up new sets
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
let setsCache = {}; // key: game key → { sets, fetchedAt }
let setCacheTimers = {};

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

const HEADERS_OUT = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'identity',
  'Cache-Control': 'no-cache',
};

const HTTP_TIMEOUT_MS = 20000; // 20 s per request to PriceCharting

function httpGet(targetUrl) {
  return new Promise((resolve, reject) => {
    const req = https.get(targetUrl, { headers: HEADERS_OUT }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location.startsWith('http')
          ? res.headers.location
          : `https://www.pricecharting.com${res.headers.location}`;
        httpGet(loc).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ html: data, status: res.statusCode }));
    });
    req.setTimeout(HTTP_TIMEOUT_MS, () => { req.destroy(new Error('Request timed out')); });
    req.on('error', reject);
  });
}

// Retry wrappers: 3 attempts, 1–1.5s random delay between, only give up after all fail
async function httpGetRetry(targetUrl, label = '') {
  let lastStatus = 0, lastHtml = '', lastErr = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { html, status } = await httpGet(targetUrl);
      if (status === 200) return { html, status };
      lastStatus = status; lastHtml = html; lastErr = null;
      console.warn(`[http-retry] ${label || targetUrl} — attempt ${attempt}/3 got HTTP ${status}`);
    } catch (err) {
      lastStatus = 0; lastHtml = ''; lastErr = err;
      console.warn(`[http-retry] ${label || targetUrl} — attempt ${attempt}/3 threw: ${err.message}`);
    }
    if (attempt < 3) await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));
  }
  if (lastErr) throw lastErr;
  return { html: lastHtml, status: lastStatus };
}

async function httpPostRetry(targetUrl, postData, label = '') {
  let lastStatus = 0, lastHtml = '', lastErr = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { html, status } = await httpPost(targetUrl, postData);
      if (status === 200) return { html, status };
      lastStatus = status; lastHtml = html; lastErr = null;
      console.warn(`[http-retry] ${label || targetUrl} — attempt ${attempt}/3 got HTTP ${status}`);
    } catch (err) {
      lastStatus = 0; lastHtml = ''; lastErr = err;
      console.warn(`[http-retry] ${label || targetUrl} — attempt ${attempt}/3 threw: ${err.message}`);
    }
    if (attempt < 3) await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));
  }
  if (lastErr) throw lastErr;
  return { html: lastHtml, status: lastStatus };
}

function httpPost(targetUrl, postData) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const body = querystring.stringify(postData);
    const options = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        ...HEADERS_OUT,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'Referer': targetUrl,
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ html: data, status: res.statusCode }));
    });
    req.setTimeout(HTTP_TIMEOUT_MS, () => { req.destroy(new Error('Request timed out')); });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Scrape live sets from a category page ──────────────────────────────────
async function scrapeSetsFromCategory(gameKey) {
  const gd = GAME_DATA[gameKey];
  if (!gd) return GAME_DATA[gameKey]?.sets || [];
  
  const prefix = SLUG_PREFIXES[gameKey];
  try {
    const { html } = await httpGet(gd.catUrl);
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
    if (sets.length > 0) {
      console.log(`[cache] Refreshed ${gameKey}: ${sets.length} sets`);
      return sets;
    }
  } catch (e) {
    console.error(`[cache] Error refreshing ${gameKey}: ${e.message}`);
  }
  // Fall back to bundled data
  return gd.sets || [];
}

// ── Initialize + schedule hourly refresh for all games ────────────────────
async function initSetsCache() {
  console.log('[cache] Initial set load...');
  for (const gameKey of Object.keys(GAME_DATA)) {
    try {
      const sets = await scrapeSetsFromCategory(gameKey);
      setsCache[gameKey] = { sets, fetchedAt: Date.now() };
    } catch (e) {
      setsCache[gameKey] = { sets: GAME_DATA[gameKey]?.sets || [], fetchedAt: Date.now() };
    }
    await new Promise(r => setTimeout(r, 400)); // gentle rate limiting
  }
  console.log('[cache] Initial load complete.');
  scheduleHourlyRefresh();
}

function scheduleHourlyRefresh() {
  setInterval(async () => {
    console.log('[cache] Hourly refresh started...');
    for (const gameKey of Object.keys(GAME_DATA)) {
      try {
        const sets = await scrapeSetsFromCategory(gameKey);
        setsCache[gameKey] = { sets, fetchedAt: Date.now() };
      } catch (e) {
        console.error(`[cache] Refresh error ${gameKey}: ${e.message}`);
      }
      await new Promise(r => setTimeout(r, 400));
    }
    console.log('[cache] Hourly refresh complete.');
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

// ── Card set cache (per-set, 1 hour TTL) ──────────────────────────────────
const cardCache = new Map(); // slug → { data, fetchedAt }

async function fetchSetPages(slug) {
  // Check card cache
  const cached = cardCache.get(slug);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    console.log(`[card-cache] HIT ${slug} (${cached.data.count} items)`);
    return { ...cached.data, fromCache: true, cachedAt: cached.fetchedAt };
  }

  const baseUrl = `https://www.pricecharting.com/console/${slug}`;
  const allCards = [];
  const { html: html1, status: s1 } = await httpGetRetry(baseUrl, `${slug} p1`);
  if (s1 !== 200) {
    console.error(`[card-fetch] FAIL ${slug} — page 1 HTTP ${s1} — url: ${baseUrl} — body snippet: ${html1.slice(0, 200)}`);
    if (s1 === 404 || s1 === 403) return { error: 'Set not found', cards: [], count: 0 };
    return { error: `HTTP ${s1}`, cards: [], count: 0 };
  }

  const titleMatch = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html1);
  const title = titleMatch ? htmlDecode(titleMatch[1].replace(/<[^>]+>/g, '').trim()) : slug;
  allCards.push(...parseRows(html1));

  let nextData = parseNextCursor(html1);
  let page = 2;
  const MAX_PAGES = 60; // safety cap (~3,000 items max per set)
  while (nextData && page <= MAX_PAGES) {
    try {
      const { html: pageHtml, status: sp } = await httpPostRetry(baseUrl, {
        sort: nextData.sort || '',
        when: nextData.when || 'none',
        'release-date': nextData['release-date'] || '',
        cursor: nextData.cursor,
      }, `${slug} p${page}`);
      if (sp !== 200) {
        console.error(`[card-fetch] FAIL ${slug} — page ${page} HTTP ${sp} — url: ${baseUrl} — body snippet: ${pageHtml.slice(0, 200)}`);
        break;
      }
      const newCards = parseRows(pageHtml);
      if (newCards.length === 0) break;
      allCards.push(...newCards);
      nextData = parseNextCursor(pageHtml);
      page++;
      // Throttle between pages to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));
    } catch (err) {
      console.error(`[card-fetch] FAIL ${slug} — page ${page} threw: ${err.message}`);
      break;
    }
  }

  if (allCards.length === 0) {
    console.error(`[card-fetch] EMPTY ${slug} — 0 cards parsed after ${page - 1} page(s) — url: ${baseUrl}`);
  }

  const sealedItems = allCards.filter(c => c.sealed);
  const result = { slug, title, cards: allCards, count: allCards.length, sealedCount: sealedItems.length, source: baseUrl };
  if (allCards.length > 0) {
    cardCache.set(slug, { data: result, fetchedAt: Date.now() });
  }
  console.log(`[card-cache] FETCHED ${slug} (${allCards.length} items, ${sealedItems.length} sealed, ${page-1} pages)`);
  return result;
}

// ── HTTP Server ────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const parsed = url.parse(req.url, true);
  const reqPath = parsed.pathname;
  const query = parsed.query;

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

  // ── /api/set?slug=... ──────────────────────────────────────────────────
  if (reqPath === '/api/set') {
    const slug = query.slug;
    if (!slug) { res.writeHead(400); res.end(JSON.stringify({ error: 'slug required' })); return; }
    if (query.force === 'true') {
      cardCache.delete(slug);
      console.log(`[card-cache] BUSTED ${slug}`);
    }
    try {
      const data = await fetchSetPages(slug);
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
        // Clear card cache for all sets in this game
        const gameSetSlugs = sets.map(s => s.slug);
        for (const slug of gameSetSlugs) {
          if (cardCache.has(slug)) {
            cardCache.delete(slug);
          }
        }
        console.log(`[cache] Refreshed ${gameKey}: ${sets.length} sets, cleared ${gameSetSlugs.length} card caches`);
      } catch (e) {
        console.error(`[cache] Refresh error for ${gameKey}: ${e.message}`);
      }
    })();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'refreshing', game: gameKey }));
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
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, async () => {
  console.log(`TCG Price Index running on http://localhost:${PORT}`);
  console.log(`Games: ${Object.keys(GAME_DATA).join(', ')}`);
  // Start cache init in background (don't block server startup)
  initSetsCache().catch(e => console.error('[cache] Init error:', e));
});