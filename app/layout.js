import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: 'Airer 1.0 - AI Character Chat',
  description: 'Create and chat with AI characters with unique personalities',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Airer',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
