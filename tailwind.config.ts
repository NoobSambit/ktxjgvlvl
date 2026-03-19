import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

const config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "2rem"
      },
      screens: {
        "2xl": "1800px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        bts: {
          purple: "hsl(var(--bts-purple))",
          pink: "hsl(var(--bts-pink))",
          deep: "hsl(var(--bts-deep))"
        },
        india: {
          saffron: "hsl(var(--india-saffron))",
          teal: "hsl(var(--india-teal))",
          marigold: "hsl(var(--india-marigold))",
          turmeric: "hsl(var(--india-turmeric))"
        }
      },
      fontFamily: {
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        "purple-glow": "0 0 40px -10px hsl(var(--bts-purple) / 0.4)",
        "saffron-glow": "0 0 30px -8px hsl(var(--india-saffron) / 0.3)",
        "card-soft": "0 4px 24px -8px rgba(0, 0, 0, 0.08), 0 2px 8px -4px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 12px 40px -16px rgba(0, 0, 0, 0.15), 0 4px 12px -6px rgba(0, 0, 0, 0.08)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px -5px hsl(var(--bts-purple) / 0.3)" },
          "50%": { boxShadow: "0 0 30px -5px hsl(var(--bts-purple) / 0.5)" }
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "mandala-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "diagonal-stripes": "repeating-linear-gradient(45deg, transparent, transparent 10px, hsl(var(--bts-purple) / 0.03) 10px, hsl(var(--bts-purple) / 0.03) 20px)",
        "mandala-pattern": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cpath fill='none' stroke='%237651CD' stroke-width='0.5' d='M100 100m0 0a40 40 0 1 0 0 80 40 40 0 1 0 0-80m0 0a20 20 0 1 0 0 40 20 20 0 1 0 0-40'/%3E%3C/svg%3E\")"
      }
    }
  },
  plugins: [animate]
} satisfies Config

export default config
