/**
 * Navigation links untuk Navbar dan Footer
 * Digunakan di seluruh aplikasi untuk konsistensi
 */
export const navigationLinks = [
  {
    name: "Beranda",
    href: "/",
    label: "Kembali ke halaman utama",
  },
  {
    name: "Deck Builder",
    href: "/deck-builder",
    label: "Buat dan edit deck",
  },
  {
    name: "Koleksi",
    href: "/collection",
    label: "Lihat koleksi kartu Anda",
  },
  {
    name: "Tournament",
    href: "/tournament",
    label: "Lihat turnamen dan kompetisi",
  },
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
  name: "MTG Deckbuilder",
  description: "Platform terpadu untuk membangun dan mengelola deck Magic: The Gathering",
  year: new Date().getFullYear(),
};
