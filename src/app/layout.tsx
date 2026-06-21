import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://chronos-rho-six.vercel.app'),
  title: 'Chronos Cloud — Timeline intelligence for teams that ship',
  description:
    'Chronos Cloud helps teams plan launches, map research, and run collaborative timelines in one focused workspace.',
  manifest: '/manifest.json',
  applicationName: 'Chronos Cloud',
  openGraph: {
    title: 'Chronos Cloud',
    description:
      'Plan launches, map research, and run collaborative timelines in one focused product.',
    url: 'https://chronos-rho-six.vercel.app',
    siteName: 'Chronos Cloud',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chronos Cloud',
    description:
      'Timeline intelligence for teams that ship — shared planning, research, and delivery in one product.',
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Chronos' },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
