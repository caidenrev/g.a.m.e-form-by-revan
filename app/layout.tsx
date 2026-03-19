import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import StructuredData from '@/components/StructuredData'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'GSA Alumni Portal',
    template: '%s | GSA Alumni Portal'
  },
  description: 'Platform eksklusif bagi alumni Google Student Ambassador (GSA) untuk tetap terkoneksi, berbagi program baru, dan tips berkembang di ekosistem Google.',
  keywords: [
    'GSA Alumni',
    'Google Student Ambassador',
    'Alumni Portal',
    'Google Developer',
    'Tech Community',
    'Student Ambassador Indonesia',
    'Google for Education',
    'Developer Community'
  ],
  authors: [{ name: 'GSA Alumni Team' }],
  creator: 'GSA Alumni Team',
  publisher: 'GSA Alumni Portal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://googlestudentambassador-alumni25.my.id'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://googlestudentambassador-alumni25.my.id',
    title: 'GSA Alumni Portal',
    description: 'Platform eksklusif bagi alumni Google Student Ambassador (GSA) untuk tetap terkoneksi, berbagi program baru, dan tips berkembang di ekosistem Google.',
    siteName: 'GSA Alumni Portal',
    images: [
      {
        url: '/images/og-image.png', // Buat image ini nanti
        width: 1200,
        height: 630,
        alt: 'GSA Alumni Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GSA Alumni Portal',
    description: 'Platform eksklusif bagi alumni Google Student Ambassador (GSA) untuk tetap terkoneksi, berbagi program baru, dan tips berkembang di ekosistem Google.',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'KYPaJ-L7huVY-EcX4US30rmGbQPAcCVHVUnQnXgzZjY',
  },
  icons: {
    icon: '/images/site-icon.png',
    shortcut: '/images/site-icon.png',
    apple: '/images/site-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
