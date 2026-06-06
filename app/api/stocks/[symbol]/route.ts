import { NextResponse } from "next/server";
import { fetchLiveStock } from "@/lib/api/fmp";
import { getAssetBySymbol } from "@/data";

/**
 * GET /api/stocks/[symbol]
 * Single stock with live FMP quote overlaid; falls back to mock.
 *
 * Response: { source: "fmp" | "mock", asset: Asset } | 404
 */
export const revalidate = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  const mock = getAssetBySymbol(symbol);

  if (!mock || mock.assetClass !== "stock") {
    return NextResponse.json({ error: "Unknown stock symbol" }, { status: 404 });
  }

  try {
    const asset = await fetchLiveStock(symbol);
    return NextResponse.json({ source: "fmp", asset: asset ?? mock });
  } catch (err) {
    console.warn(`[api/stocks/${symbol}] live fetch failed, serving mock:`, (err as Error).message);
    return NextResponse.json({ source: "mock", asset: mock });
  }
}
