import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseMarketStudyCsv } from "./market-study-csv";
import { calculateMarketStudyMetrics } from "./market-study-metrics";
import {
  MARKET_STUDY_SCHEMA_VERSION,
  type MarketStudyArtifact,
  type MarketStudyCatalogEntry,
  type MarketStudyDefinition,
} from "./market-study-schema";

export function sha256(input: string | Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}

async function readInput(uri: string, definitionPath: string): Promise<Buffer> {
  if (/^https?:\/\//.test(uri)) {
    const response = await fetch(uri, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Failed to download ${uri}: HTTP ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  }
  if (uri.startsWith("file:")) return readFile(fileURLToPath(uri));
  return readFile(path.resolve(path.dirname(definitionPath), uri));
}

export async function materializeMarketStudy(
  definition: MarketStudyDefinition,
  definitionPath: string,
): Promise<{ artifact: MarketStudyArtifact; catalogEntry: MarketStudyCatalogEntry }> {
  if (definition.status !== "published") {
    throw new Error(`Study ${definition.id} is not published`);
  }

  const instruments = await Promise.all(
    definition.instruments.map(async ({ input, ...instrument }) => {
      if (input.mock) throw new Error(`Published study ${definition.id} cannot use mock input`);
      const source = await readInput(input.uri, definitionPath);
      const digest = sha256(source);
      if (digest !== input.sha256) {
        throw new Error(
          `SHA-256 mismatch for ${definition.id}/${instrument.symbol}: expected ${input.sha256}, received ${digest}`,
        );
      }
      const points = parseMarketStudyCsv(source.toString("utf8"), definition.period);
      return { ...instrument, metrics: calculateMarketStudyMetrics(points), points };
    }),
  );

  const { status: _status, featured: _featured, instruments: _inputs, ...study } = definition;
  const publicPath = `/generated/finance/studies/${definition.id}/${definition.version}.json`;
  const artifact: MarketStudyArtifact = { ...study, instruments };
  return {
    artifact,
    catalogEntry: {
      id: definition.id,
      version: definition.version,
      title: definition.title,
      subtitle: definition.subtitle,
      summary: definition.summary,
      featured: definition.featured === true,
      period: definition.period,
      symbols: definition.instruments.map(({ symbol }) => symbol),
      publicPath,
    },
  };
}

export function createEmptyCatalog() {
  return {
    schemaVersion: MARKET_STUDY_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    studies: [],
  };
}
