import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import CharacterAssistantToggle from "@/components/character-assistant-toggle"
import NotificationBell from "@/components/notification-bell"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "レジェンドオブ課題 - 課題をゲームに",
  description: "課題提出をゲーム化して友達と競い合える学習ミッション化システム",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <div className="relative">
            <div className="fixed top-4 right-4 z-50">
              <NotificationBell />
            </div>
            {children}
          </div>
          <Toaster />
          <CharacterAssistantToggle />
        </ThemeProvider>
      </body>
    </html>
  )
}
