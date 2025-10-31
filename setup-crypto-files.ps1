# Setup PowerShell script for crypto intel + payments features
# Run this after setup-crypto-dirs.bat

Write-Host "Creating crypto intelligence API routes..." -ForegroundColor Cyan

# Crypto Intel API Route
$cryptoIntelRoute = @'
// app/api/crypto-intel/route.ts
import { NextRequest, NextResponse } from "next/server";

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price";
const CRYPTOPANIC_API = "https://cryptopanic.com/api/v1/posts/";

export const runtime = "edge";
export const revalidate = 30;

export async function GET(req: NextRequest) {
  try {
    const symbols = ["bitcoin", "ethereum", "solana"];
    const priceUrl = `${COINGECKO_API}?ids=${symbols.join(",")}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24h_vol=true`;

    const [pricesRes, newsRes] = await Promise.all([
      fetch(priceUrl, { next: { revalidate: 30 } }),
      fetch(`${CRYPTOPANIC_API}?auth_token=free&filter=rising`, {
        next: { revalidate: 60 },
      }).catch(() => null),
    ]);

    const prices = await pricesRes.json();
    const news = newsRes ? await newsRes.json().catch(() => null) : null;

    const topNews = news?.results?.slice(0, 5).map((n: any) => ({
      title: n.title || "",
      url: n.url || "",
      votes: n.votes || {},
    })) || [];

    const sentiment = calculateSentiment(prices);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      prices,
      topNews,
      sentiment,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch crypto intel" },
      { status: 500 }
    );
  }
}

function calculateSentiment(prices: Record<string, any>): string {
  const changes = Object.values(prices).map((p: any) => p.usd_24h_change || 0);
  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;

  if (avgChange > 3) return "🚀 Bullish momentum";
  if (avgChange > 0) return "📈 Cautiously optimistic";
  if (avgChange > -3) return "📊 Sideways consolidation";
  return "🐻 Bearish pressure";
}
'@

Set-Content -Path "app\api\crypto-intel\route.ts" -Value $cryptoIntelRoute -Encoding UTF8
Write-Host "✓ Created crypto-intel/route.ts" -ForegroundColor Green

# Crypto Intel History API Route
$cryptoHistoryRoute = @'
// app/api/crypto-intel/history/route.ts
import { NextRequest, NextResponse } from "next/server";

type Sample = { t: number; p: number };

function sampleArray(prices: number[][], points: number): Sample[] {
  if (!prices || prices.length === 0) return [];
  const n = prices.length;
  if (n <= points) {
    return prices.map(([t, p]) => ({ t, p }));
  }
  const sampled: Sample[] = [];
  for (let i = 0; i < points; i++) {
    const idx = Math.round((i * (n - 1)) / (points - 1));
    const [t, p] = prices[idx];
    sampled.push({ t, p });
  }
  return sampled;
}

export const runtime = "edge";
export const revalidate = 60;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const idsParam = url.searchParams.get("ids") ?? "bitcoin,ethereum,solana";
    const days = url.searchParams.get("days") ?? "1";
    const points = Number(url.searchParams.get("points") ?? "60");

    const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const results: Record<string, { samples: Sample[] }> = {};

    await Promise.all(
      ids.map(async (id) => {
        const cgUrl = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(
          id
        )}/market_chart?vs_currency=usd&days=${encodeURIComponent(days)}`;
        
        const res = await fetch(cgUrl, { next: { revalidate: 60 } });
        if (!res.ok) {
          results[id] = { samples: [] };
          return;
        }
        
        const body = await res.json();
        const prices: number[][] = body.prices ?? [];
        const samples = sampleArray(prices, Math.max(2, points));
        results[id] = { samples };
      })
    );

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ids,
      points,
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
'@

Set-Content -Path "app\api\crypto-intel\history\route.ts" -Value $cryptoHistoryRoute -Encoding UTF8
Write-Host "✓ Created crypto-intel/history/route.ts" -ForegroundColor Green

Write-Host "`nCrypto intel API routes created successfully!" -ForegroundColor Green
Write-Host "`nNext: Run 'npm i' then 'npm run dev' to test" -ForegroundColor Yellow
