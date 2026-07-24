#!/usr/bin/env node
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { materializeMarketStudy } from "../src/lib/finance/market-study-materializer";
import {
  MARKET_STUDY_SCHEMA_VERSION,
  type MarketStudyCatalog,
  validateMarketStudyDefinition,
} from "../src/lib/finance/market-study-schema";

const projectRoot = process.cwd();
const definitionsDirectory = path.join(projectRoot, "data", "finance", "studies");
const serverOutputDirectory = path.join(projectRoot, ".generated", "finance");
const publicOutputDirectory = path.join(projectRoot, "public", "generated", "finance");

async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value)}\n`, "utf8");
}

async function main() {
  await rm(serverOutputDirectory, { recursive: true, force: true });
  await rm(publicOutputDirectory, { recursive: true, force: true });

  let filenames: string[] = [];
  try {
    filenames = (await readdir(definitionsDirectory))
      .filter((filename) => filename.endsWith(".study.json"))
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const studies: MarketStudyCatalog["studies"] = [];
  const publishedIds = new Set<string>();
  for (const filename of filenames) {
    const definitionPath = path.join(definitionsDirectory, filename);
    const definition = validateMarketStudyDefinition(
      JSON.parse(await readFile(definitionPath, "utf8")),
    );
    if (definition.status !== "published") continue;
    if (publishedIds.has(definition.id)) {
      throw new Error(`Multiple published definitions found for study ${definition.id}`);
    }
    publishedIds.add(definition.id);

    const { artifact, catalogEntry } = await materializeMarketStudy(
      definition,
      definitionPath,
    );
    studies.push(catalogEntry);
    await writeJson(path.join(projectRoot, "public", catalogEntry.publicPath), artifact);
    console.log(`[finance] materialized ${definition.id}@${definition.version}`);
  }

  studies.sort((left, right) => {
    if (left.featured !== right.featured) return left.featured ? -1 : 1;
    return right.period.end.localeCompare(left.period.end);
  });
  const catalog: MarketStudyCatalog = {
    schemaVersion: MARKET_STUDY_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    studies,
  };
  await writeJson(path.join(serverOutputDirectory, "catalog.json"), catalog);
  await writeJson(path.join(publicOutputDirectory, "catalog.json"), catalog);
  console.log(`[finance] catalog contains ${studies.length} published studies`);
}

main().catch((error) => {
  console.error("[finance] build failed:", error);
  process.exit(1);
});
