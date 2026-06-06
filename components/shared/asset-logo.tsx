import { cn } from "@/lib/utils";
import type { Asset } from "@/types";

/**
 * Monogram chip used in place of real logos in the mock build.
 * Swap for <Image src={asset.logoUrl} /> once a provider supplies logo URLs.
 */
export function AssetLogo({
  asset,
  size = "md",
  className,
}: {
  asset: Pick<Asset, "symbol" | "name" | "logoColor">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-14 w-14 text-base",
  }[size];

  const initials = asset.symbol.slice(0, 2).toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-sm ring-1 ring-black/5",
        dims,
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${asset.logoColor}, ${asset.logoColor}cc)`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
