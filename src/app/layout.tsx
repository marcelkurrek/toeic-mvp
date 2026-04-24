import type { Metadata } from 'next'
import './globals.css'
import './sidebar-spacing.css'
import { LanguageProvider } from '@/lib/i18n/client'
import { ThemeProvider } from '@/lib/theme/client'

export const metadata: Metadata = {
  title: 'TOEIC Prep',
  description: 'Personal TOEIC preparation platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        {/* Apply stored theme before first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}` }} />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
