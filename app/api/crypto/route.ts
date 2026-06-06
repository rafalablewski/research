import { NextResponse } from "next/server";
import { fetchLiveCryptos } from "@/lib/api/coingecko";
import { CRYPTOS } from "@/data/cryptos";

/**
 * GET /api/crypto
 * Returns the crypto universe with live CoinGecko quotes overlaid, falling back
 * to curated mock data if the upstream call fails (e.g. host not allowlisted).
 *
 * Response: { source: "coingecko" | "mock", assets: Asset[] }
 */
export const revalidate = 60;

export async function GET() {
  try {
    const assets = await fetchLiveCryptos();
    return NextResponse.json({ source: "coingecko", assets });
  } catch (err) {
    console.warn("[api/crypto] live fetch failed, serving mock:", (err as Error).message);
    return NextResponse.json({ source: "mock", assets: CRYPTOS });
  }
}
