/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic tokens
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
        // App-specific surface scale
        surface: {
          0: "#0a0a0a",
          1: "#111111",
          2: "#181818",
          3: "#222222",
          4: "#2c2c2c",
        },
        // Inline text colors
        ink: {
          primary:   "#fafafa",
          secondary: "#a1a1aa",
          tertiary:  "#71717a",
          disabled:  "#3f3f46",
        },
        // Semantic accents
        blue: {
          DEFAULT: "#2563eb",
          light:   "#3b82f6",
          dim:     "rgba(37,99,235,0.12)",
        },
        green: {
          DEFAULT: "#16a34a",
          dim:     "rgba(22,163,74,0.12)",
        },
        red: {
          DEFAULT: "#dc2626",
          dim:     "rgba(220,38,38,0.12)",
        },
        amber: {
          DEFAULT: "#d97706",
          dim:     "rgba(217,119,6,0.1)",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm:  "0.375rem",
        md:  "0.5rem",
        lg:  "0.75rem",
        xl:  "1rem",
        "2xl": "1.25rem",
        full: "9999px",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      boxShadow: {
        "sm":       "0 1px 2px rgba(0,0,0,0.5)",
        "md":       "0 4px 12px rgba(0,0,0,0.4)",
        "lg":       "0 8px 24px rgba(0,0,0,0.45)",
        "xl":       "0 16px 40px rgba(0,0,0,0.5)",
        "card":     "0 0 0 1px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.4)",
        "dropdown": "0 0 0 1px rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.6)",
        "inset":    "inset 0 1px 0 rgba(255,255,255,0.06)",
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
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out both",
        "fade-up": "fade-up 0.35s ease-out both",
        "shimmer": "shimmer 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
