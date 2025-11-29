'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import useThemeStore from '@/store/themeStore';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2.5 rounded-lg bg-white/5 border border-white/10 transition-all duration-300"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-yellow-400" />
      ) : (
        <Moon size={20} className="text-slate-700 dark:text-purple-600" />
      )}
    </button>
  );
}
