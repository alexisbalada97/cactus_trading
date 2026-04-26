/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 35px rgba(59, 130, 246, 0.16)",
        violet: "0 0 30px rgba(139, 92, 246, 0.18)"
      }
    }
  },
  plugins: []
};
