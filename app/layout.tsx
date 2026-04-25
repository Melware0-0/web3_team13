import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Web3Provider } from '@/components/web3-provider'

export const metadata: Metadata = {
  title: 'L2Earn — Learn-to-Earn for the Great Handover',
  description:
    'Watch a short video, pass an AI-tutored quiz, get paid in dNZD. One campaign, two audiences — humans learn, agents index.',
  generator: 'L2Earn',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <Web3Provider>{children}</Web3Provider>
        <Analytics />
      </body>
    </html>
  )
}
