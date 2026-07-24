import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { parseMarketStudyCsv } from "../market-study-csv";
import { materializeMarketStudy, sha256 } from "../market-study-materializer";
import {
  calculateDrawdownSeries,
  calculateMarketStudyMetrics,
  normalizeToBase100,
} from "../market-study-metrics";
import {
  type MarketStudyDefinition,
  validateMarketStudyDefinition,
} from "../market-study-schema";

const CSV = `date,open,high,low,close,adjusted_close,volume
2024-01-02,100,103,99,102,100,1000
2024-01-03,102,122,101,120,120,1400
2024-02-02,120,121,89,90,90,1600
2024-12-31,90,112,88,110,110,1800
`;

const period = { label: "2024", start: "2024-01-01", end: "2024-12-31" };
const temporaryDirectories: string[] = [];

function definition(inputPath: string, digest = sha256(CSV)): MarketStudyDefinition {
  return {
    schemaVersion: 1,
    id: "sample-stage",
    version: "2026.07.22",
    status: "published",
    featured: true,
    title: "Sample stage",
    subtitle: "A fixed-period comparison",
    summary: "Summary",
    period: { ...period },
    timezone: "America/New_York",
    adjustment: "split",
    source: {
      provider: "Fixture provider",
      title: "Fixture OHLCV",
      retrievedAt: "2026-07-22",
    },
    instruments: [
      {
        id: "sample",
        symbol: "SAMPLE",
        name: "Sample Company",
        role: "equity",
        market: "TEST",
        currency: "USD",
        color: "#176B5B",
        input: { uri: inputPath, sha256: digest, format: "csv" },
      },
    ],
    disclaimer: "Fixture only.",
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("market study definition", () => {
  it("accepts a complete published definition", () => {
    expect(validateMarketStudyDefinition(definition("./sample.csv")).id).toBe("sample-stage");
  });

  it("fails closed when published data is marked as mock", () => {
    const candidate = definition("./sample.csv");
    candidate.instruments[0].input.mock = true;
    expect(() => validateMarketStudyDefinition(candidate)).toThrow(/mock cannot be true/);
  });

  it("rejects duplicate instrument ids and invalid periods", () => {
    const candidate = definition("./sample.csv") as any;
    candidate.period.start = "2025-01-01";
    candidate.instruments.push({ ...candidate.instruments[0] });
    expect(() => validateMarketStudyDefinition(candidate)).toThrow(/period.start.*after|id must be unique/);
  });
});

describe("market study CSV and metrics", () => {
  it("parses OHLCV and computes stage metrics", () => {
    const points = parseMarketStudyCsv(CSV, period);
    expect(points).toHaveLength(4);
    expect(normalizeToBase100(points).map(([, value]) => value)).toEqual([
      100,
      120,
      90,
      expect.closeTo(110),
    ]);
    expect(calculateDrawdownSeries(points)[2][1]).toBeCloseTo(-25);

    const metrics = calculateMarketStudyMetrics(points);
    expect(metrics.totalReturn).toBeCloseTo(0.1);
    expect(metrics.maxDrawdown).toBeCloseTo(-0.25);
    expect(metrics.tradingDays).toBe(4);
    expect(metrics.annualizedReturn).not.toBeNull();
  });

  it("rejects invalid OHLC bounds, out-of-period rows, and duplicate dates", () => {
    expect(() => parseMarketStudyCsv(CSV.replace("100,103,99,102", "100,101,99,102"), period)).toThrow(/OHLC/);
    expect(() => parseMarketStudyCsv(CSV, { ...period, start: "2024-02-01" })).toThrow(/outside study period/);
    expect(() => parseMarketStudyCsv(CSV.replace("2024-01-03", "2024-01-02"), period)).toThrow(/strictly ascending/);
  });
});

describe("market study materialization contract", () => {
  it("verifies the hash and strips storage input details from the artifact", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "market-study-"));
    temporaryDirectories.push(directory);
    const csvPath = path.join(directory, "sample.csv");
    const definitionPath = path.join(directory, "sample.study.json");
    await writeFile(csvPath, CSV);

    const result = await materializeMarketStudy(
      definition("./sample.csv"),
      definitionPath,
    );
    expect(result.catalogEntry.publicPath).toBe("/generated/finance/studies/sample-stage/2026.07.22.json");
    expect(result.artifact.instruments[0].points).toHaveLength(4);
    expect(result.artifact).not.toHaveProperty("status");
    expect(result.artifact.instruments[0]).not.toHaveProperty("input");
  });

  it("rejects impossible calendar dates and events outside the period", () => {
    const impossibleDate = definition("./sample.csv") as any;
    impossibleDate.source.retrievedAt = "2024-02-31";
    expect(() => validateMarketStudyDefinition(impossibleDate)).toThrow(/source.retrievedAt/);

    const outsideEvent = definition("./sample.csv") as any;
    outsideEvent.events = [{ date: "2025-01-01", title: "Outside" }];
    expect(() => validateMarketStudyDefinition(outsideEvent)).toThrow(/within the study period/);
  });

  it("rejects a changed source file", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "market-study-"));
    temporaryDirectories.push(directory);
    await writeFile(path.join(directory, "sample.csv"), CSV);
    await expect(
      materializeMarketStudy(
        definition("./sample.csv", "f".repeat(64)),
        path.join(directory, "sample.study.json"),
      ),
    ).rejects.toThrow(/SHA-256 mismatch/);
  });
});
