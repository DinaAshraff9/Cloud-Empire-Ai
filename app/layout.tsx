import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cloud Empire AI · Infrastructure control plane',
  description: 'Operate cloud infrastructure with clarity, automation, and an AI copilot.',
  generator: 'Cloud Empire AI',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f5f7fa',
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
