import { readFile } from "node:fs/promises";
import path from "node:path";

import type {
  MarketStudyArtifact,
  MarketStudyCatalog,
  MarketStudyCatalogEntry,
} from "./market-study-schema";

const projectRoot = process.cwd();
const catalogPath = path.join(projectRoot, ".generated", "finance", "catalog.json");

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

export async function getMarketStudyCatalog(): Promise<MarketStudyCatalog> {
  try {
    return await readJson<MarketStudyCatalog>(catalogPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { schemaVersion: 1, generatedAt: new Date(0).toISOString(), studies: [] };
    }
    throw error;
  }
}

export async function getFeaturedMarketStudy(): Promise<MarketStudyArtifact | null> {
  const catalog = await getMarketStudyCatalog();
  const entry = catalog.studies.find(({ featured }) => featured) ?? catalog.studies[0];
  return entry ? loadMarketStudyEntry(entry) : null;
}

export async function getMarketStudy(
  studyId: string,
): Promise<MarketStudyArtifact | null> {
  const catalog = await getMarketStudyCatalog();
  const entry = catalog.studies.find(({ id }) => id === studyId);
  return entry ? loadMarketStudyEntry(entry) : null;
}

async function loadMarketStudyEntry(
  entry: MarketStudyCatalogEntry,
): Promise<MarketStudyArtifact> {
  const relativePath = entry.publicPath.replace(/^\//, "");
  const artifactPath = path.join(projectRoot, "public", relativePath);
  return readJson<MarketStudyArtifact>(artifactPath);
}
