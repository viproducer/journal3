import './globals.css'
import { Inter, Kalam } from 'next/font/google'
import { Metadata } from 'next'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })
const kalam = Kalam({ 
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-kalam',
})

export const metadata: Metadata = {
  title: 'Journal App',
  description: 'A modern journaling application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} ${kalam.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
