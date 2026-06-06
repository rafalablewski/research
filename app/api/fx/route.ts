import { NextResponse } from "next/server";
import { fetchRates } from "@/lib/api/fx";

/**
 * GET /api/fx — USD-based FX rates for display-currency conversion.
 * Response: { source: "live" | "static", rates: Record<string, number> }
 */
export const revalidate = 3600;

export async function GET() {
  const data = await fetchRates();
  return NextResponse.json(data);
}
