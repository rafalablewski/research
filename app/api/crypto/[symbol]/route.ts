import { NextResponse } from "next/server";
import { fetchLiveCrypto } from "@/lib/api/coingecko";
import { getAssetBySymbol } from "@/data";

/**
 * GET /api/crypto/[symbol]
 * Single crypto asset with live CoinGecko quote overlaid; falls back to mock.
 *
 * Response: { source: "coingecko" | "mock", asset: Asset } | 404
 */
export const revalidate = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  const mock = getAssetBySymbol(symbol);

  if (!mock || mock.assetClass !== "crypto") {
    return NextResponse.json({ error: "Unknown crypto symbol" }, { status: 404 });
  }

  try {
    const asset = await fetchLiveCrypto(symbol);
    return NextResponse.json({ source: "coingecko", asset: asset ?? mock });
  } catch (err) {
    console.warn(`[api/crypto/${symbol}] live fetch failed, serving mock:`, (err as Error).message);
    return NextResponse.json({ source: "mock", asset: mock });
  }
}
