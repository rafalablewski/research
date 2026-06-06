import { NextResponse } from "next/server";
import { fetchLiveStocks } from "@/lib/api/fmp";
import { STOCKS } from "@/data/stocks";

/**
 * GET /api/stocks
 * Stock universe with live FMP quotes overlaid; falls back to mock when the
 * provider is unreachable or no FMP_API_KEY is configured.
 *
 * Response: { source: "fmp" | "mock", assets: Asset[] }
 */
export const revalidate = 60;

export async function GET() {
  try {
    const assets = await fetchLiveStocks();
    return NextResponse.json({ source: "fmp", assets });
  } catch (err) {
    console.warn("[api/stocks] live fetch failed, serving mock:", (err as Error).message);
    return NextResponse.json({ source: "mock", assets: STOCKS });
  }
}
