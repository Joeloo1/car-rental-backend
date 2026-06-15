/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (CSS variable–based, kept for compatibility)
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // ── Surface scale — deep charcoal with warm undertones ─────────────
        surface: {
          0: "#0D0D0F",
          1: "#161618",
          2: "#1C1C1E",
          3: "#222224",
          4: "#2A2A2C",
        },

        // ── Text / ink — warm white scale ──────────────────────────────────
        ink: {
          primary:   "#F2F0EC",
          secondary: "#ABABAB",
          tertiary:  "#6B6B6B",
          disabled:  "#3A3A3A",
        },

        // ── Interactive blue (kept for auth, links, notifications) ─────────
        blue: {
          DEFAULT: "#2563eb",
          light:   "#3b82f6",
          dim:     "rgba(37,99,235,0.12)",
        },

        // ── Primary brand accent — amber gold ──────────────────────────────
        gold: {
          DEFAULT: "#F5A623",
          light:   "#FFB84D",
          dark:    "#E8831A",
          dim:     "rgba(245,166,35,0.12)",
        },

        // ── Secondary accent — electric teal (availability, live status) ───
        teal: {
          DEFAULT: "#00C9B1",
          light:   "#00E5CC",
          dark:    "#00A896",
          dim:     "rgba(0,201,177,0.12)",
        },

        // ── Semantic status colors ─────────────────────────────────────────
        green: {
          DEFAULT: "#16a34a",
          dim:     "rgba(22,163,74,0.12)",
        },
        red: {
          DEFAULT: "#FF4D4D",
          muted:   "#dc2626",
          dim:     "rgba(255,77,77,0.12)",
        },
        amber: {
          DEFAULT: "#d97706",
          dim:     "rgba(217,119,6,0.1)",
        },
      },

      fontFamily: {
        sans:    ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        heading: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        price:   ['"JetBrains Mono"', "Space Grotesk", "monospace"],
        mono:    ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },

      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },

      borderRadius: {
        DEFAULT: "0.5rem",
        sm:    "0.375rem",
        md:    "0.5rem",
        lg:    "0.75rem",
        xl:    "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        full:  "9999px",
      },

      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },

      boxShadow: {
        "sm":        "0 1px 2px rgba(0,0,0,0.5)",
        "md":        "0 4px 12px rgba(0,0,0,0.4)",
        "lg":        "0 8px 24px rgba(0,0,0,0.45)",
        "xl":        "0 16px 40px rgba(0,0,0,0.5)",
        "card":      "0 0 0 1px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.4)",
        "card-lift": "0 0 0 1px rgba(245,166,35,0.20), 0 20px 50px rgba(0,0,0,0.7)",
        "dropdown":  "0 0 0 1px rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.6)",
        "inset":     "inset 0 1px 0 rgba(255,255,255,0.06)",
        "gold-glow": "0 0 0 3px rgba(245,166,35,0.10), 0 0 0 1px rgba(245,166,35,0.30)",
        "teal-glow": "0 0 0 3px rgba(0,201,177,0.10), 0 0 0 1px rgba(0,201,177,0.30)",
      },

      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "progress-bar": {
          "0%":   { transform: "scaleX(0)", transformOrigin: "left" },
          "100%": { transform: "scaleX(1)", transformOrigin: "left" },
        },
      },

      animation: {
        "fade-in":     "fade-in 0.2s ease-out both",
        "fade-up":     "fade-up 0.35s ease-out both",
        "shimmer":     "shimmer 1.4s ease-in-out infinite",
        "slide-up":    "slide-up 0.18s ease-out both",
      },
    },
  },
  plugins: [],
};
