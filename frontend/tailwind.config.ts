import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Primary (Azul Royal)
        primary: {
          DEFAULT: "#1D4ED8",
          hover: "#1E40AF",
          container: "#DBEAFE",
          fixed: "#DCE1FF",
          fixedDim: "#B7C4FF",
          onPrimary: "#FFFFFF",
          onContainer: "#0039B5",
        },
        // Brand Secondary (Verde Esmeralda)
        secondary: {
          DEFAULT: "#059669",
          hover: "#047857",
          container: "#D1FAE5",
          fixed: "#85F8C4",
          onSecondary: "#FFFFFF",
          onContainer: "#00714E",
        },
        // Brand Tertiary (Ámbar / Alerta)
        tertiary: {
          DEFAULT: "#D97706",
          hover: "#B45309",
          container: "#FEF3C7",
          onTertiary: "#FFFFFF",
          onContainer: "#8D4B00",
        },
        // Error / Danger
        error: {
          DEFAULT: "#BA1A1A",
          hover: "#93000A",
          container: "#FFDAD6",
          onError: "#FFFFFF",
          onContainer: "#93000A",
        },
        // Surface & Canvas Layers
        canvas: "#FAF8FF",
        surface: {
          DEFAULT: "#FAF8FF",
          bright: "#FAF8FF",
          dim: "#D2D9F4",
          lowest: "#FFFFFF", // cards, dialogs, inputs
          low: "#F2F3FF",
          container: "#EAEDFF",
          high: "#E2E7FF",
          highest: "#DAE2FD",
        },
        // Text / Typography colors
        content: {
          primary: "#0F172A",
          secondary: "#434655",
          muted: "#64748B",
          inverted: "#EEF0FF",
        },
        // Borders & Outlines
        border: {
          DEFAULT: "#E2E8F0",
          outline: "#747686",
          variant: "#C4C5D7",
          focus: "#1D4ED8",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        sm: "0.25rem", // 4px
        DEFAULT: "0.5rem", // 8px (rounded-lg)
        lg: "0.5rem", // 8px (Estándar FindJob)
        xl: "0.75rem", // 12px (Cards modulares)
        "2xl": "1rem", // 16px (Banners hero)
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.05)",
        md: "0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.08)",
        xl: "0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
