'use client';

import ThemeProvider from '@/components/ThemeProvider';

export default function ClientLayout({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
