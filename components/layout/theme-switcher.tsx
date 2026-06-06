"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, Palette, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBrandTheme } from "./theme-provider";
import { BRAND_THEMES } from "@/lib/themes";

/** Combined mode (light/dark/system) + brand-theme picker. */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { brand, setBrand } = useBrandTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const modes = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme settings">
          {mounted && theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        {modes.map((m) => (
          <DropdownMenuItem key={m.id} onClick={() => setTheme(m.id)}>
            <m.icon className="h-4 w-4" />
            {m.label}
            {mounted && theme === m.id && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5" /> Brand theme
        </DropdownMenuLabel>
        {BRAND_THEMES.map((b) => (
          <DropdownMenuItem key={b.id} onClick={() => setBrand(b.id)}>
            <span className="h-4 w-4 rounded-full ring-1 ring-border" style={{ background: b.swatch }} />
            {b.label}
            {brand === b.id && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Inline swatch row, used on a settings surface if desired. */
export function BrandSwatches({ className }: { className?: string }) {
  const { brand, setBrand } = useBrandTheme();
  return (
    <div className={cn("flex gap-2", className)}>
      {BRAND_THEMES.map((b) => (
        <button
          key={b.id}
          onClick={() => setBrand(b.id)}
          className={cn(
            "h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-background transition",
            brand === b.id ? "ring-foreground" : "ring-transparent hover:ring-border",
          )}
          style={{ background: b.swatch }}
          aria-label={b.label}
        />
      ))}
    </div>
  );
}
