import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Purple Palette - Main Brand Colors
        primary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7", // Main purple
          600: "#9333ea", // Darker purple
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3f0f5c",
        },

        // Background Colors
        bg: {
          primary: "#faf5ff", // Light purple-tinted background
          secondary: "#f3e8ff", // Slightly darker light purple
          tertiary: "#ede9fe", // Even darker shade
          dark: "#2d1b4e", // Dark purple for dark mode
          card: "#ffffff", // Card backgrounds
          hover: "#f8f5ff", // Hover state background
        },

        // Text Colors
        text: {
          primary: "#1e1b4b", // Dark text for main content
          secondary: "#4c1d95", // Medium purple-dark text
          tertiary: "#6b7280", // Light gray text
          accent: "#a855f7", // Purple accent text
          light: "#f5f3ff", // Light text for dark backgrounds
        },

        // Heading Colors
        heading: {
          primary: "#581c87", // Dark purple for main headings
          secondary: "#7e22ce", // Medium purple for subheadings
          accent: "#a855f7", // Purple for accent headings
        },

        // Border & Divider Colors
        border: {
          light: "#e9d5ff", // Light purple border
          primary: "#d8b4fe", // Medium purple border
          dark: "#a855f7", // Dark purple border
        },

        // Button Colors
        button: {
          primary: "#a855f7", // Main button color
          primaryHover: "#9333ea", // Darker on hover
          secondary: "#f3e8ff", // Secondary button
          secondaryHover: "#e9d5ff", // Secondary hover
          disabled: "#d8b4fe", // Disabled state
        },

        // Status Colors
        status: {
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#a855f7", // Using primary purple for info
        },
      },

      backgroundColor: {
        base: "rgb(var(--bg-primary) / <alpha-value>)",
      },

      textColor: {
        base: "rgb(var(--text-primary) / <alpha-value>)",
      },

      borderColor: {
        base: "rgb(var(--border-primary) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};

export default config;
