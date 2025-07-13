import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
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
        // Safari/Animal colors
        "safari-green": {
          "100": "hsl(var(--safari-green-100))",
          "200": "hsl(var(--safari-green-200))",
          "300": "hsl(var(--safari-green-300))",
          "400": "hsl(var(--safari-green-400))",
          "500": "hsl(var(--safari-green-500))",
          "600": "hsl(var(--safari-green-600))",
        },
        "safari-brown": {
          "100": "hsl(var(--safari-brown-100))",
          "200": "hsl(var(--safari-brown-200))",
          "300": "hsl(var(--safari-brown-300))",
          "400": "hsl(var(--safari-brown-400))",
          "500": "hsl(var(--safari-brown-500))",
          "600": "hsl(var(--safari-brown-600))",
        },
        "safari-beige": {
          "100": "hsl(var(--safari-beige-100))",
          "200": "hsl(var(--safari-beige-200))",
          "300": "hsl(var(--safari-beige-300))",
          "400": "hsl(var(--safari-beige-400))",
          "500": "hsl(var(--safari-beige-500))",
          "600": "hsl(var(--safari-beige-600))",
        },
        "soft-gray": {
          "100": "hsl(var(--soft-gray-100))",
          "200": "hsl(var(--soft-gray-200))",
          "300": "hsl(var(--soft-gray-300))",
          "400": "hsl(var(--soft-gray-400))",
          "500": "hsl(var(--soft-gray-500))",
          "600": "hsl(var(--soft-gray-600))",
          "700": "hsl(var(--soft-gray-700))",
          "800": "hsl(var(--soft-gray-800))",
          "900": "hsl(var(--soft-gray-900))",
        },
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
