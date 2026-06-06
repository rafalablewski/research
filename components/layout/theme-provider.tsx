"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { BRAND_STORAGE_KEY, DEFAULT_BRAND } from "@/lib/themes";

/**
 * Brand-theme layer sitting *on top of* next-themes' light/dark mode.
 *
 * next-themes owns the `class` (light/dark). This context owns the orthogonal
 * `data-theme` attribute on <html>, so any brand can combine with either mode.
 * Persisted to localStorage and applied before paint to avoid a flash.
 */
interface BrandContext {
  brand: string;
  setBrand: (id: string) => void;
}
const BrandThemeContext = React.createContext<BrandContext | null>(null);

export function useBrandTheme() {
  const ctx = React.useContext(BrandThemeContext);
  if (!ctx) throw new Error("useBrandTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrandState] = React.useState(DEFAULT_BRAND);

  React.useEffect(() => {
    const saved = localStorage.getItem(BRAND_STORAGE_KEY);
    if (saved) {
      setBrandState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const setBrand = React.useCallback((id: string) => {
    setBrandState(id);
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem(BRAND_STORAGE_KEY, id);
  }, []);

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <BrandThemeContext.Provider value={{ brand, setBrand }}>{children}</BrandThemeContext.Provider>
    </NextThemesProvider>
  );
}
