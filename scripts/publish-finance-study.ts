#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseMarketStudyCsv } from "../src/lib/finance/market-study-csv";
import { sha256 } from "../src/lib/finance/market-study-materializer";

function readArgument(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

function requireArgument(name: string): string {
  const value = readArgument(name);
  if (!value) throw new Error(`Missing --${name}=...`);
  return value;
}

function requireEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

function safeSegment(value: string, name: string): string {
  if (!/^[A-Za-z0-9._-]+$/.test(value)) {
    throw new Error(`${name} may only contain letters, numbers, dot, underscore, and dash`);
  }
  return value;
}

function upload(
  executable: string,
  localPath: string,
  destination: string,
  options: { publicRead: boolean },
) {
  const args = [
    "cp",
    localPath,
    destination,
    "-vchecksum",
    "-contentType=text/csv; charset=utf-8",
    `-e=${requireEnvironment("TOS_ENDPOINT")}`,
    `-re=${requireEnvironment("TOS_REGION")}`,
    `-i=${requireEnvironment("TOS_AK")}`,
    `-k=${requireEnvironment("TOS_SK")}`,
  ];
  if (options.publicRead) {
    args.push("-acl=public-read", "-cacheControl=public, max-age=31536000, immutable");
  } else {
    args.push("-acl=private");
  }
  const result = spawnSync(executable, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`tosutil upload failed for ${destination}`);
}

async function main() {
  const filePath = path.resolve(requireArgument("file"));
  const studyId = safeSegment(requireArgument("study"), "study");
  const symbol = safeSegment(requireArgument("symbol"), "symbol");
  const periodStart = requireArgument("start");
  const periodEnd = requireArgument("end");
  const bucket = safeSegment(requireEnvironment("TOS_BUCKET"), "TOS_BUCKET");
  const publicBaseUrl = requireEnvironment("TOS_PUBLIC_BASE_URL").replace(/\/$/, "");
  const executable = process.env.TOSUTIL_PATH || "tosutil";

  const source = await readFile(filePath);
  parseMarketStudyCsv(source.toString("utf8"), {
    label: `${periodStart} - ${periodEnd}`,
    start: periodStart,
    end: periodEnd,
  });
  const digest = sha256(source);
  const filename = `${symbol.toLowerCase()}-${digest.slice(0, 16)}.csv`;
  const rawKey = `finance/raw/${studyId}/${filename}`;
  const publishedKey = `finance/published/${studyId}/${filename}`;

  upload(executable, filePath, `tos://${bucket}/${rawKey}`, { publicRead: false });
  upload(executable, filePath, `tos://${bucket}/${publishedKey}`, { publicRead: true });

  console.log("\nStudy input:");
  console.log(
    JSON.stringify(
      {
        uri: `${publicBaseUrl}/${publishedKey}`,
        sha256: digest,
        format: "csv",
      },
      null,
      2,
    ),
  );
  console.log(`Private archive: tos://${bucket}/${rawKey}`);
}

main().catch((error) => {
  console.error("[finance] publish failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
