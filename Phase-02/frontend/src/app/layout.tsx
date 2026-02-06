import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Todo App - Authentication',
  description: 'Secure authentication for your todo application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
