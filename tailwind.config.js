/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  safelist: [
    // Avatar gradient colors
    'from-blue-600', 'to-cyan-500',
    'from-green-600', 'to-emerald-500',
    'from-orange-600', 'to-red-500',
    'from-pink-600', 'to-rose-500',
    'from-purple-600', 'to-indigo-500',
    'from-yellow-600', 'to-amber-500',
    'from-teal-600', 'to-cyan-500',
    'from-indigo-600', 'to-blue-500',
    'from-red-600', 'to-orange-500',
    'from-cyan-600', 'to-teal-500',
    'from-emerald-600', 'to-green-500',
    'from-rose-600', 'to-red-500',
    'from-amber-600', 'to-orange-500',
    'from-violet-600', 'to-fuchsia-500',
    'from-lime-600', 'to-emerald-500',
    'from-fuchsia-600', 'to-purple-500',
    'from-sky-600', 'to-blue-500',
    'from-slate-600', 'to-gray-500',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          blue: "#00f3ff",
          purple: "#bf00ff",
          pink: "#ff006e",
          green: "#39ff14",
        },
      },
      backgroundColor: {
        'primary': 'var(--bg-primary)',
        'secondary': 'var(--bg-secondary)',
        'tertiary': 'var(--bg-tertiary)',
      },
      textColor: {
        'primary': 'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
        'tertiary': 'var(--text-tertiary)',
      },
      borderColor: {
        'default': 'var(--border-color)',
      },
      animation: {
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px currentColor" },
          "50%": { opacity: "0.8", boxShadow: "0 0 40px currentColor" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};
