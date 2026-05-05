/**
 * Navigation links untuk Navbar dan Footer
 */
export const navigationLinks = [
  {
    name: "Home",
    href: "/",
    label: "Go to homepage",
  },
  {
    name: "Tournament",
    href: "/tournament",
    label: "View tournaments and competitions",
  },
  {
    name: "Help",
    href: "/help",
    label: "Get help and support",
  }
];

/**
 * Footer links untuk informasi dan bantuan
 */
export const footerLinks = {
  product: [
    { name: "Deck Builder", href: "/deck-builder" },
    { name: "Card Explorer", href: "/card-explorer" },
    { name: "Tournament", href: "/tournament" },
  ],
  resources: [
    { name: "Dokumentasi", href: "/docs" },
    { name: "Tutorial", href: "/tutorials" },
    { name: "FAQ", href: "/faq" },
  ],
  community: [
    { name: "Forum", href: "/forum" },
    { name: "Discord", href: "https://discord.gg/mtg" },
    { name: "Twitter", href: "https://twitter.com/deckbuilder" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Contact", href: "/contact" },
  ],
};

/**
 * Informasi perusahaan
 */
export const companyInfo = {
  name: "SpellScribe",
  description: "A fan-made MTG deck builder tool to help players create and manage their decks with ease.",
  year: new Date().getFullYear(),
};

export const authedLinks = [
  { name: "Your Deck", href: "/decks/personal", label: "View your saved decks" },
  { name: "Collection", href: "/collection", label: "View your card collection" },
  { name: "Wishlist", href: "/wishlist", label: "View your wishlist" },
];

export const profileLinks = [
  { name: "Your Deck", href: "/decks/personal" },
  { name: "Collection", href: "/collection" },
  { name: "Wishlist", href: "/wishlist" },
  { name: "Account", href: "/account/settings" },
]

export const createItems = [
  {
    name: "New Deck",
    description: "Start a fresh brew from a commander, archetype, or blank slate.",
  },
  {
    name: "New Package",
    description: "Group a reusable set of cards for ramp, removal, or synergy cores.",
  },
  {
    name: "New List",
    description: "Track pickups, sideboards, or testing piles in a lightweight list.",
  },
]

/**
 * Format Deck
 */
export const formatDecks = [
  {
    name: "Alchemy",
    commander: false,
    minDeckSize: 60,
    maxDuplicates: 4,
    sideboardSize: 15,
    specialRules: "Format digital MTG Arena dengan kartu yang di-rebalance."
  },
  {
    name: "Alpha 40",
    commander: false,
    minDeckSize: 40,
    maxDuplicates: "Tak Terbatas", // Sesuai aturan liga Alpha 40 asli
    sideboardSize: 0,
    specialRules: "Hanya menggunakan kartu dari set Alpha. Aturan duplikat kartu mengikuti aturan tahun 1993."
  },
  {
    name: "Archon",
    commander: false, // Format 1v1 berbasis poin
    minDeckSize: 60,
    maxDuplicates: 1,
    sideboardSize: 15,
    specialRules: "Format Singleton 60 kartu dengan sistem poin untuk membatasi kartu overpower."
  },
  {
    name: "Australian Highlander",
    commander: false,
    minDeckSize: 60,
    maxDuplicates: 1,
    sideboardSize: 15,
    specialRules: "Singleton 60 kartu dengan daftar poin khusus (7-point system)."
  },
  {
    name: "Brawl",
    commander: true,
    minDeckSize: 60,
    maxDuplicates: 1,
    sideboardSize: 0,
    specialRules: "Commander versi Standard (60 kartu). Mengizinkan Planeswalker sebagai Commander."
  },
  {
    name: "Canadian Highlander",
    commander: false,
    minDeckSize: 100,
    maxDuplicates: 1,
    sideboardSize: 0,
    specialRules: "Singleton 100 kartu tanpa Commander. Menggunakan sistem 10 poin."
  },
  {
    name: "Centurion",
    commander: true,
    minDeckSize: 100,
    maxDuplicates: 1,
    sideboardSize: 0,
    specialRules: "Varian Commander 1v1 asal Italia dengan banlist khusus untuk kompetitif."
  },
  {
    name: "Commander / EDH",
    commander: true,
    minDeckSize: 100,
    maxDuplicates: 1,
    sideboardSize: 0,
    specialRules: "100 kartu singleton. Harus ada Legendary Creature sebagai Commander."
  },
  {
    name: "Conquest",
    commander: true,
    minDeckSize: 80,
    maxDuplicates: 1,
    sideboardSize: 0,
    specialRules: "Varian Commander komunitas dengan total 80 kartu dan 30 nyawa awal."
  },
  {
    name: "Duel Commander",
    commander: true,
    minDeckSize: 100,
    maxDuplicates: 1,
    sideboardSize: 0,
    specialRules: "Format 1v1 kompetitif dengan banlist agresif dan 20 nyawa awal."
  },
  {
    name: "Gladiator",
    commander: false,
    minDeckSize: 100,
    maxDuplicates: 1,
    sideboardSize: 0,
    specialRules: "Format singleton 100 kartu khusus MTG Arena (tanpa Commander/Sideboard)."
  },
  {
    name: "Historic",
    commander: false,
    minDeckSize: 60,
    maxDuplicates: 4,
    sideboardSize: 15,
    specialRules: "Format non-rotasi digital di MTG Arena."
  },
  {
    name: "Historic Brawl",
    commander: true,
    minDeckSize: 100,
    maxDuplicates: 1,
    sideboardSize: 0,
    specialRules: "Varian Brawl 100 kartu di Arena menggunakan pool kartu Historic."
  },
  {
    name: "Legacy",
    commander: false,
    minDeckSize: 60,
    maxDuplicates: 4,
    sideboardSize: 15,
    specialRules: "Menggunakan hampir semua kartu sejak awal MTG (Eternal)."
  },
  {
    name: "Modern",
    commander: false,
    minDeckSize: 60,
    maxDuplicates: 4,
    sideboardSize: 15,
    specialRules: "Kartu dari Mirrodin/Eighth Edition ke atas."
  },
  {
    name: "Old School 93/94",
    commander: false,
    minDeckSize: 60,
    maxDuplicates: 4,
    sideboardSize: 15,
    specialRules: "Hanya kartu yang dirilis pada tahun 1993 dan 1994."
  },
  {
    name: "Pauper",
    commander: false,
    minDeckSize: 60,
    maxDuplicates: 4,
    sideboardSize: 15,
    specialRules: "Hanya kartu dengan kelangkaan Common."
  },
  {
    name: "Pauper EDH",
    commander: true,
    minDeckSize: 100,
    maxDuplicates: 1,
    sideboardSize: 0,
    specialRules: "Commander harus kartu Uncommon (tidak harus Legend). 99 kartu lain harus Common."
  },
  {
    name: "Pioneer",
    commander: false,
    minDeckSize: 60,
    maxDuplicates: 4,
    sideboardSize: 15,
    specialRules: "Kartu dari Return to Ravnica (2012) ke atas."
  },
  {
    name: "Premodern",
    commander: false,
    minDeckSize: 60,
    maxDuplicates: 4,
    sideboardSize: 15,
    specialRules: "Kartu dari periode 1995 hingga 2003 (Fourth Edition - Scourge)."
  },
  {
    name: "Standard",
    commander: false,
    minDeckSize: 60,
    maxDuplicates: 4,
    sideboardSize: 15,
    specialRules: "Format rotasi set utama (saat ini periode 3 tahun)."
  },
  {
    name: "Timeless",
    commander: false,
    minDeckSize: 60,
    maxDuplicates: 4,
    sideboardSize: 15,
    specialRules: "Format terkuat di Arena, menggunakan sistem 'Restricted' alih-alih Ban."
  },
  {
    name: "Vintage",
    commander: false,
    minDeckSize: 60,
    maxDuplicates: 4,
    sideboardSize: 15,
    specialRules: "Satu-satunya format yang mengizinkan kartu Power Nine (dengan limit 1 copy)."
  }
];

