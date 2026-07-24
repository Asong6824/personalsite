import type {
  MarketStudyMetrics,
  MarketStudyPoint,
} from "./market-study-schema";

const MILLISECONDS_PER_DAY = 86_400_000;
const TRADING_DAYS_PER_YEAR = 252;

function adjustedPrice(point: MarketStudyPoint): number {
  return point.adjustedClose || point.close;
}

export function normalizeToBase100(points: MarketStudyPoint[]): [number, number][] {
  if (points.length === 0) return [];
  const base = adjustedPrice(points[0]);
  return points.map((point) => [point.timestamp, (adjustedPrice(point) / base) * 100]);
}

export function calculateDrawdownSeries(
  points: MarketStudyPoint[],
): [number, number][] {
  let peak = Number.NEGATIVE_INFINITY;
  return points.map((point) => {
    const price = adjustedPrice(point);
    peak = Math.max(peak, price);
    return [point.timestamp, ((price / peak) - 1) * 100];
  });
}

export function calculateMarketStudyMetrics(
  points: MarketStudyPoint[],
): MarketStudyMetrics {
  if (points.length === 0) {
    throw new Error("Cannot calculate metrics for an empty series");
  }

  const startPrice = adjustedPrice(points[0]);
  const endPrice = adjustedPrice(points.at(-1)!);
  const totalReturn = (endPrice / startPrice) - 1;
  const elapsedDays = Math.max(
    0,
    (points.at(-1)!.timestamp - points[0].timestamp) / MILLISECONDS_PER_DAY,
  );
  const annualizedReturn =
    elapsedDays >= 30
      ? Math.pow(endPrice / startPrice, 365.25 / elapsedDays) - 1
      : null;

  const dailyReturns: number[] = [];
  for (let index = 1; index < points.length; index += 1) {
    dailyReturns.push(
      (adjustedPrice(points[index]) / adjustedPrice(points[index - 1])) - 1,
    );
  }
  let annualizedVolatility: number | null = null;
  if (dailyReturns.length >= 2) {
    const mean = dailyReturns.reduce((sum, value) => sum + value, 0) / dailyReturns.length;
    const variance =
      dailyReturns.reduce((sum, value) => sum + ((value - mean) ** 2), 0) /
      (dailyReturns.length - 1);
    annualizedVolatility = Math.sqrt(variance) * Math.sqrt(TRADING_DAYS_PER_YEAR);
  }

  const drawdowns = calculateDrawdownSeries(points).map(([, value]) => value / 100);

  return {
    startPrice,
    endPrice,
    totalReturn,
    annualizedReturn,
    annualizedVolatility,
    maxDrawdown: Math.min(...drawdowns),
    tradingDays: points.length,
  };
}
