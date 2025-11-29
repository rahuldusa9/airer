'use client';

import { useEffect, useState } from 'react';
import useThemeStore from '@/store/themeStore';

export default function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  const theme = useThemeStore((state) => (mounted ? state.theme : 'dark'));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.style.colorScheme = 'light';
    } else {
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    }
  }, [theme, mounted]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
