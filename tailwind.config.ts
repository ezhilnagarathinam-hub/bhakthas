import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
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
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        admin: {
          bg: "hsl(var(--admin-bg))",
          surface: "hsl(var(--admin-surface))",
          border: "hsl(var(--admin-border))",
          accent: "hsl(var(--admin-accent))",
          "accent-light": "hsl(var(--admin-accent-light))",
          text: "hsl(var(--admin-text))",
          "text-muted": "hsl(var(--admin-text-muted))",
        },
      },
      backgroundImage: {
        "gradient-sacred": "var(--gradient-sacred)",
        "gradient-divine": "var(--gradient-divine)",
        "gradient-temple": "var(--gradient-temple)",
        "gradient-mystic": "var(--gradient-mystic)",
        "gradient-enlighten": "var(--gradient-enlighten)",
        "gradient-admin": "var(--gradient-admin)",
      },
      boxShadow: {
        "sacred": "var(--shadow-sacred)",
        "divine": "var(--shadow-divine)",
        "glow": "var(--shadow-glow)",
        "admin": "var(--shadow-admin)",
      },
      transitionTimingFunction: {
        "sacred": "var(--transition-sacred)",
        "divine": "var(--transition-divine)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'cinzel': ['Cinzel', 'serif'],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "glow-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 20px hsl(45 100% 50% / 0.5), 0 0 40px hsl(0 85% 55% / 0.3)",
            opacity: "1"
          },
          "50%": { 
            boxShadow: "0 0 40px hsl(45 100% 50% / 0.8), 0 0 60px hsl(0 85% 55% / 0.5)",
            opacity: "0.9"
          },
        },
        "divine-shine": {
          "0%": { 
            backgroundPosition: "0% 50%",
            transform: "scale(1)"
          },
          "50%": { 
            backgroundPosition: "100% 50%",
            transform: "scale(1.05)"
          },
          "100%": { 
            backgroundPosition: "0% 50%",
            transform: "scale(1)"
          },
        },
        "prayer-hands": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "75%": { transform: "rotate(5deg)" },
        },
        "om-rotate": {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(180deg) scale(1.1)" },
          "100%": { transform: "rotate(360deg) scale(1)" },
        },
        "blessing-fall": {
          "0%": { 
            transform: "translateY(-100%) rotate(0deg)",
            opacity: "0"
          },
          "50%": { opacity: "1" },
          "100%": { 
            transform: "translateY(100vh) rotate(360deg)",
            opacity: "0"
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "divine-shine": "divine-shine 4s ease-in-out infinite",
        "prayer-hands": "prayer-hands 2s ease-in-out infinite",
        "om-rotate": "om-rotate 8s linear infinite",
        "blessing-fall": "blessing-fall 8s linear infinite",
        "fade-in": "fade-in 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
