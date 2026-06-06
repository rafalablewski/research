import type { NewsItem, Alert, ActivityEvent } from "@/types";

/** Mock news feed. Plug in: Finnhub, Benzinga, CryptoPanic, or NewsAPI. */
export const NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "NVIDIA unveils next-gen accelerators, raises data-centre guidance",
    source: "Reuters",
    publishedAt: "2026-06-06T11:20:00Z",
    url: "#",
    sentiment: "positive",
    relatedSymbols: ["NVDA", "MSFT"],
    summary:
      "The chipmaker projected another quarter of record data-centre revenue as hyperscaler AI capex shows no sign of slowing.",
  },
  {
    id: "n2",
    title: "Bitcoin ETFs see largest weekly inflow of the year",
    source: "Bloomberg",
    publishedAt: "2026-06-06T08:05:00Z",
    url: "#",
    sentiment: "positive",
    relatedSymbols: ["BTC", "ETH"],
    summary:
      "Spot Bitcoin ETFs absorbed over $2.3B last week, with institutional allocators citing the asset as a portfolio diversifier.",
  },
  {
    id: "n3",
    title: "Ethereum staking ratio hits new high after Pectra upgrade",
    source: "The Block",
    publishedAt: "2026-06-05T19:42:00Z",
    url: "#",
    sentiment: "positive",
    relatedSymbols: ["ETH"],
    summary:
      "More than 30% of ETH supply is now staked as validators benefit from streamlined operations and stable yields.",
  },
  {
    id: "n4",
    title: "Tesla deliveries miss estimates amid pricing pressure in Europe",
    source: "CNBC",
    publishedAt: "2026-06-05T15:10:00Z",
    url: "#",
    sentiment: "negative",
    relatedSymbols: ["TSLA"],
    summary:
      "Quarterly deliveries came in below consensus, reviving concerns about demand elasticity and margin compression.",
  },
  {
    id: "n5",
    title: "Alphabet's Gemini gains enterprise share, Cloud backlog swells",
    source: "Wall Street Journal",
    publishedAt: "2026-06-05T13:00:00Z",
    url: "#",
    sentiment: "positive",
    relatedSymbols: ["GOOGL"],
    summary:
      "Google Cloud signed several nine-figure AI deals this quarter, narrowing the gap with larger rivals.",
  },
  {
    id: "n6",
    title: "Solana network sets record on daily active addresses",
    source: "CoinDesk",
    publishedAt: "2026-06-04T22:30:00Z",
    url: "#",
    sentiment: "positive",
    relatedSymbols: ["SOL"],
    summary:
      "Consumer apps and stablecoin payments drove Solana to an all-time high in active addresses, outpacing competing L1s.",
  },
  {
    id: "n7",
    title: "Fed holds rates steady, signals data-dependent path",
    source: "Financial Times",
    publishedAt: "2026-06-04T18:00:00Z",
    url: "#",
    sentiment: "neutral",
    relatedSymbols: ["JPM", "V", "BTC"],
    summary:
      "Policymakers left the benchmark rate unchanged, keeping markets focused on upcoming inflation prints.",
  },
  {
    id: "n8",
    title: "Palantir wins expanded defence contract, shares surge",
    source: "Barron's",
    publishedAt: "2026-06-04T14:20:00Z",
    url: "#",
    sentiment: "positive",
    relatedSymbols: ["PLTR"],
    summary:
      "A multi-year award broadens Palantir's government footprint, though analysts flag a stretched valuation.",
  },
];

/** Mock alerts shown in the navbar / dashboard. */
export const ALERTS: Alert[] = [
  {
    id: "a1",
    type: "price",
    severity: "success",
    title: "NVDA up 2.95% today",
    body: "Crossed above your $132 target.",
    createdAt: "2026-06-06T12:00:00Z",
    symbol: "NVDA",
  },
  {
    id: "a2",
    type: "score",
    severity: "info",
    title: "GOOGL value score improved",
    body: "Snowflake value rose to 4/5 after the latest DCF refresh.",
    createdAt: "2026-06-06T09:30:00Z",
    symbol: "GOOGL",
  },
  {
    id: "a3",
    type: "news",
    severity: "warning",
    title: "TSLA delivery miss",
    body: "Negative headline detected for a holding.",
    createdAt: "2026-06-05T15:15:00Z",
    symbol: "TSLA",
  },
];

/** Insider trades (stocks) + whale transactions (crypto). */
export const ACTIVITY: ActivityEvent[] = [
  { id: "e1", symbol: "AAPL", actor: "T. Cook (CEO)", action: "sell", amount: 41_000_000, date: "2026-05-28" },
  { id: "e2", symbol: "NVDA", actor: "J. Huang (CEO)", action: "sell", amount: 28_500_000, date: "2026-05-22" },
  { id: "e3", symbol: "BTC", actor: "Whale 0x7f…3a2", action: "buy", amount: 64_000_000, date: "2026-06-03" },
  { id: "e4", symbol: "ETH", actor: "Whale 0x9c…11d", action: "transfer", amount: 23_400_000, date: "2026-06-02" },
  { id: "e5", symbol: "GOOGL", actor: "R. Porat (Director)", action: "buy", amount: 3_200_000, date: "2026-05-19" },
  { id: "e6", symbol: "SOL", actor: "Whale 0x4d…87e", action: "buy", amount: 12_100_000, date: "2026-06-04" },
];
