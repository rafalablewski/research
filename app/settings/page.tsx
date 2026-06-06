"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun, Check } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrandSwatches } from "@/components/layout/theme-switcher";
import { BRAND_THEMES } from "@/lib/themes";
import { useBrandTheme } from "@/components/layout/theme-provider";
import { DataSourceStatus } from "@/components/settings/data-source-status";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY"];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { brand } = useBrandTheme();
  const currency = useUIStore((s) => s.currency);
  const setCurrency = useUIStore((s) => s.setCurrency);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const modes = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <PageHeader title="Settings" subtitle="Appearance, preferences and live data sources." />

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Mode and brand theme are independent layers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Mode</Label>
            <div className="grid grid-cols-3 gap-2 sm:max-w-md">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setTheme(m.id)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition-colors",
                    mounted && theme === m.id ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent",
                  )}
                >
                  <m.icon className="h-4 w-4" /> {m.label}
                  {mounted && theme === m.id && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Brand theme</Label>
            <div className="flex items-center gap-4">
              <BrandSwatches />
              <span className="text-sm text-muted-foreground">
                {BRAND_THEMES.find((b) => b.id === brand)?.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Add a theme: a <code className="rounded bg-muted px-1">[data-theme]</code> block in
              <code className="mx-1 rounded bg-muted px-1">app/globals.css</code> + an entry in
              <code className="mx-1 rounded bg-muted px-1">lib/themes.ts</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:max-w-xs">
          <Label>Display currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Stored preference. Live FX conversion plugs in at a <code className="rounded bg-muted px-1">lib/api/fx</code>
            {" "}seam; values are currently shown in USD.
          </p>
        </CardContent>
      </Card>

      <DataSourceStatus />
    </div>
  );
}
