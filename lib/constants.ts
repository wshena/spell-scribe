/**
 * Navigation links untuk Navbar dan Footer
 * Digunakan di seluruh aplikasi untuk konsistensi
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
