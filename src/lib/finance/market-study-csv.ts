import type { MarketStudyPeriod, MarketStudyPoint } from "./market-study-schema";

const REQUIRED_COLUMNS = ["date", "open", "high", "low", "close"] as const;

function parseCsvRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === ",") {
      row.push(field.trim());
      field = "";
    } else if (character === "\n") {
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else if (character !== "\r") field += character;
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted field");
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function parseFiniteNumber(value: string, path: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${path} must be a finite number`);
  return parsed;
}

export function parseMarketStudyCsv(
  input: string,
  period: MarketStudyPeriod,
): MarketStudyPoint[] {
  const rows = parseCsvRows(input);
  if (rows.length < 2) throw new Error("CSV must include a header and at least one data row");

  const headers = rows[0].map((header) => header.toLowerCase().replaceAll(" ", "_"));
  for (const column of REQUIRED_COLUMNS) {
    if (!headers.includes(column)) throw new Error(`CSV is missing required column: ${column}`);
  }
  const column = (name: string) => headers.indexOf(name);
  const points: MarketStudyPoint[] = rows.slice(1).map((row, rowIndex) => {
    const path = `CSV row ${rowIndex + 2}`;
    const date = row[column("date")];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`${path}.date must be YYYY-MM-DD`);
    const open = parseFiniteNumber(row[column("open")], `${path}.open`);
    const high = parseFiniteNumber(row[column("high")], `${path}.high`);
    const low = parseFiniteNumber(row[column("low")], `${path}.low`);
    const close = parseFiniteNumber(row[column("close")], `${path}.close`);
    const adjustedCloseIndex = column("adjusted_close");
    const volumeIndex = column("volume");
    const adjustedClose =
      adjustedCloseIndex >= 0 && row[adjustedCloseIndex] !== ""
        ? parseFiniteNumber(row[adjustedCloseIndex], `${path}.adjusted_close`)
        : close;
    const volume =
      volumeIndex >= 0 && row[volumeIndex] !== ""
        ? parseFiniteNumber(row[volumeIndex], `${path}.volume`)
        : null;

    if ([open, high, low, close, adjustedClose].some((value) => value <= 0)) {
      throw new Error(`${path} prices must be greater than zero`);
    }
    if (high < Math.max(open, close, low) || low > Math.min(open, close, high)) {
      throw new Error(`${path} violates OHLC price bounds`);
    }
    if (volume !== null && volume < 0) throw new Error(`${path}.volume cannot be negative`);

    return {
      date,
      timestamp: Date.parse(`${date}T00:00:00Z`),
      open,
      high,
      low,
      close,
      adjustedClose,
      volume,
    };
  });

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    if (point.date < period.start || point.date > period.end) {
      throw new Error(`CSV date ${point.date} is outside study period ${period.start}..${period.end}`);
    }
    if (index > 0 && point.timestamp <= points[index - 1].timestamp) {
      throw new Error("CSV dates must be unique and strictly ascending");
    }
  }

  return points;
}
