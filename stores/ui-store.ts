"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebar: (v: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  /** Display-currency preference. Conversion (FX) is a documented plug-in seam. */
  currency: string;
  setCurrency: (c: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebar: (v) => set({ sidebarCollapsed: v }),
      commandOpen: false,
      setCommandOpen: (v) => set({ commandOpen: v }),
      currency: "USD",
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "strata-ui",
      version: 2,
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, currency: s.currency }),
    },
  ),
);
