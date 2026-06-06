/**
 * Theme registry.
 *
 * `mode` themes (light/dark/system) are handled by next-themes via the `class`
 * attribute. `brand` themes are an orthogonal layer applied through the
 * `data-theme` attribute (see ThemeProvider + globals.css), so any brand can be
 * combined with light or dark.
 *
 * To add a brand theme: add an entry here AND a matching `[data-theme="id"]`
 * block in app/globals.css. That's it.
 */

export interface BrandTheme {
  id: string;
  label: string;
  /** Swatch shown in the theme switcher (any CSS colour). */
  swatch: string;
}

export const BRAND_THEMES: BrandTheme[] = [
  { id: "default", label: "Strata Blue", swatch: "hsl(221 83% 53%)" },
  { id: "ocean", label: "Ocean", swatch: "hsl(187 92% 38%)" },
  { id: "violet", label: "Violet", swatch: "hsl(262 83% 58%)" },
];

export const DEFAULT_BRAND = "default";
export const BRAND_STORAGE_KEY = "strata-brand";
