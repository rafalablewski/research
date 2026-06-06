import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { SearchCommand } from "@/components/layout/search-command";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Strata — Investment Research", template: "%s · Strata" },
  description:
    "Strata is a modern investment research platform for stocks and crypto — Snowflake scores, portfolio analytics, screeners and beautiful charts.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      {/* Apply the saved brand theme before paint to avoid a flash of default colours. */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var b=localStorage.getItem('strata-brand');if(b)document.documentElement.setAttribute('data-theme',b);}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <div className="hidden lg:block">
              <Sidebar />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <Navbar />
              <main className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">{children}</div>
              </main>
            </div>
          </div>
          <SearchCommand />
        </Providers>
      </body>
    </html>
  );
}
