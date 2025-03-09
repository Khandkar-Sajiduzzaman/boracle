"use client"

import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import NavigationBar from "@/components/navbar/navigation-bar";
import { SessionProvider } from "next-auth/react";
import { ModeToggle } from "@/components/light-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children, pageProps = {} }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={pageProps.session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <NavigationBar />
            {children}
           <div className="fixed bottom-4 right-4">
            <ModeToggle />
          </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}