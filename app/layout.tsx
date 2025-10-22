// app/layout.tsx
import "./globals.css";
import { Audiowide, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { SettingsProvider } from "@/contexts/settings-context"; // Import SettingsProvider
import type React from "react";

const audiowide = Audiowide({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-audiowide",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "GATE 2026 ECE Study Dashboard",
  description:
    "Comprehensive study dashboard for GATE 2026 Electronics and Communication Engineering preparation",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${audiowide.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ConvexClientProvider>
            {/* Move SettingsProvider to wrap TooltipProvider and the main layout */}
            <SettingsProvider>
              <TooltipProvider delayDuration={0}>
                <div className="min-h-screen flex">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden"> {/* Added flex flex-col */}
                    <TopNav />
                    <div className="flex-1 overflow-y-auto"> {/* Added flex-1 and overflow */}
                      <div className="container mx-auto p-6 max-w-7xl">
                        <main className="w-full">{children}</main>
                      </div>
                    </div>
                  </div>
                </div>
              </TooltipProvider>
            </SettingsProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}