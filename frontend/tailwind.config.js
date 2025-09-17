export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF8B20",
        "primary-hover": "#FBBF24",
        "bg-primary": "#E0E7FF",
        "bg-card": "#FFFFFF",
        "bg-input": "#E0E7FF",
        "text-primary": "#1F2937",
        "text-secondary": "#6B7280",
        "text-muted": "#9CA3AF",
        "border-primary": "#D1D5DB",
        orange: {
          500: "#FF8B20",
        },
        yellow: {
          400: "#FBBF24",
        },
        green: {
          500: "#10B981",
        },
        red: {
          500: "#EF4444",
        },
      },
      backgroundColor: {
        lavender: "#E0E7FF",
      },
    },
  },
  plugins: [],
};
