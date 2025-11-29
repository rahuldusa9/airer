import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata = {
  title: 'Airer 1.0 - AI Character Chat',
  description: 'Create and chat with AI characters with unique personalities',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme-storage');
                if (theme) {
                  const themeData = JSON.parse(theme);
                  if (themeData.state && themeData.state.theme === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.style.colorScheme = 'light';
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-black text-white transition-colors duration-300" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
