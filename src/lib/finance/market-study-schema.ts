export const MARKET_STUDY_SCHEMA_VERSION = 1 as const;

export type MarketStudyStatus = "draft" | "published";
export type InstrumentRole = "equity" | "benchmark" | "index";
export type PriceAdjustment = "raw" | "split" | "total-return";

export interface MarketStudyPeriod {
  label: string;
  start: string;
  end: string;
}

export interface MarketStudySourceDisclosure {
  provider: string;
  title: string;
  url?: string;
  license?: string;
  retrievedAt: string;
  notes?: string;
}

export interface MarketStudyInput {
  uri: string;
  sha256: string;
  format: "csv";
  mock?: boolean;
}

export interface MarketStudyInstrumentDefinition {
  id: string;
  symbol: string;
  name: string;
  role: InstrumentRole;
  market: string;
  currency: string;
  color: string;
  input: MarketStudyInput;
}

export interface MarketStudyEvent {
  date: string;
  title: string;
  description?: string;
}

export interface MarketStudyDefinition {
  schemaVersion: typeof MARKET_STUDY_SCHEMA_VERSION;
  id: string;
  version: string;
  status: MarketStudyStatus;
  featured?: boolean;
  title: string;
  subtitle: string;
  summary: string;
  thesis?: string;
  period: MarketStudyPeriod;
  timezone: string;
  adjustment: PriceAdjustment;
  source: MarketStudySourceDisclosure;
  instruments: MarketStudyInstrumentDefinition[];
  events?: MarketStudyEvent[];
  disclaimer: string;
}

export interface MarketStudyPoint {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  adjustedClose: number;
  volume: number | null;
}

export interface MarketStudyMetrics {
  startPrice: number;
  endPrice: number;
  totalReturn: number;
  annualizedReturn: number | null;
  annualizedVolatility: number | null;
  maxDrawdown: number;
  tradingDays: number;
}

export interface MarketStudyInstrumentArtifact
  extends Omit<MarketStudyInstrumentDefinition, "input"> {
  metrics: MarketStudyMetrics;
  points: MarketStudyPoint[];
}

export interface MarketStudyArtifact
  extends Omit<MarketStudyDefinition, "status" | "featured" | "instruments"> {
  instruments: MarketStudyInstrumentArtifact[];
}

export interface MarketStudyCatalogEntry {
  id: string;
  version: string;
  title: string;
  subtitle: string;
  summary: string;
  featured: boolean;
  period: MarketStudyPeriod;
  symbols: string[];
  publicPath: string;
}

export interface MarketStudyCatalog {
  schemaVersion: typeof MARKET_STUDY_SCHEMA_VERSION;
  generatedAt: string;
  studies: MarketStudyCatalogEntry[];
}

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VERSION_PATTERN = /^\d{4}\.\d{2}\.\d{2}(?:\.\d+)?$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const HEX_COLOR_PATTERN = /^#[a-fA-F0-9]{6}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(
  value: unknown,
  path: string,
  errors: string[],
): value is string {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${path} must be a non-empty string`);
    return false;
  }
  return true;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateMarketStudyDefinition(
  value: unknown,
): MarketStudyDefinition {
  const errors: string[] = [];
  if (!isRecord(value)) {
    throw new Error("Market study definition must be an object");
  }

  if (value.schemaVersion !== MARKET_STUDY_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${MARKET_STUDY_SCHEMA_VERSION}`);
  }
  if (requireString(value.id, "id", errors) && !ID_PATTERN.test(value.id)) {
    errors.push("id must be a lowercase kebab-case identifier");
  }
  if (
    requireString(value.version, "version", errors) &&
    !VERSION_PATTERN.test(value.version)
  ) {
    errors.push("version must use YYYY.MM.DD or YYYY.MM.DD.N format");
  }
  if (value.status !== "draft" && value.status !== "published") {
    errors.push('status must be "draft" or "published"');
  }
  requireString(value.title, "title", errors);
  requireString(value.subtitle, "subtitle", errors);
  requireString(value.summary, "summary", errors);
  requireString(value.timezone, "timezone", errors);
  requireString(value.disclaimer, "disclaimer", errors);
  if (
    value.adjustment !== "raw" &&
    value.adjustment !== "split" &&
    value.adjustment !== "total-return"
  ) {
    errors.push("adjustment must be raw, split, or total-return");
  }

  if (!isRecord(value.period)) {
    errors.push("period must be an object");
  } else {
    requireString(value.period.label, "period.label", errors);
    if (!isIsoDate(value.period.start)) errors.push("period.start must be YYYY-MM-DD");
    if (!isIsoDate(value.period.end)) errors.push("period.end must be YYYY-MM-DD");
    if (
      isIsoDate(value.period.start) &&
      isIsoDate(value.period.end) &&
      value.period.start > value.period.end
    ) {
      errors.push("period.start must not be after period.end");
    }
  }

  if (!isRecord(value.source)) {
    errors.push("source must be an object");
  } else {
    requireString(value.source.provider, "source.provider", errors);
    requireString(value.source.title, "source.title", errors);
    if (!isIsoDate(value.source.retrievedAt)) {
      errors.push("source.retrievedAt must be YYYY-MM-DD");
    }
  }

  if (!Array.isArray(value.instruments) || value.instruments.length === 0) {
    errors.push("instruments must contain at least one instrument");
  } else {
    const ids = new Set<string>();
    for (const [index, candidate] of value.instruments.entries()) {
      const path = `instruments[${index}]`;
      if (!isRecord(candidate)) {
        errors.push(`${path} must be an object`);
        continue;
      }
      if (requireString(candidate.id, `${path}.id`, errors)) {
        if (!ID_PATTERN.test(candidate.id)) errors.push(`${path}.id must be kebab-case`);
        if (ids.has(candidate.id)) errors.push(`${path}.id must be unique`);
        ids.add(candidate.id);
      }
      requireString(candidate.symbol, `${path}.symbol`, errors);
      requireString(candidate.name, `${path}.name`, errors);
      requireString(candidate.market, `${path}.market`, errors);
      requireString(candidate.currency, `${path}.currency`, errors);
      if (!HEX_COLOR_PATTERN.test(String(candidate.color))) {
        errors.push(`${path}.color must be a six-digit hex color`);
      }
      if (!['equity', 'benchmark', 'index'].includes(String(candidate.role))) {
        errors.push(`${path}.role is invalid`);
      }
      if (!isRecord(candidate.input)) {
        errors.push(`${path}.input must be an object`);
      } else {
        requireString(candidate.input.uri, `${path}.input.uri`, errors);
        if (!SHA256_PATTERN.test(String(candidate.input.sha256))) {
          errors.push(`${path}.input.sha256 must be a lowercase SHA-256 digest`);
        }
        if (candidate.input.format !== "csv") {
          errors.push(`${path}.input.format must be csv`);
        }
        if (value.status === "published" && candidate.input.mock === true) {
          errors.push(`${path}.input.mock cannot be true for a published study`);
        }
      }
    }
  }

  if (Array.isArray(value.events)) {
    for (const [index, event] of value.events.entries()) {
      if (!isRecord(event)) {
        errors.push(`events[${index}] must be an object`);
        continue;
      }
      if (!isIsoDate(event.date)) errors.push(`events[${index}].date must be YYYY-MM-DD`);
      requireString(event.title, `events[${index}].title`, errors);
      if (
        isIsoDate(event.date) &&
        isRecord(value.period) &&
        isIsoDate(value.period.start) &&
        isIsoDate(value.period.end) &&
        (event.date < value.period.start || event.date > value.period.end)
      ) {
        errors.push(`events[${index}].date must fall within the study period`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid market study definition:\n- ${errors.join("\n- ")}`);
  }

  return value as unknown as MarketStudyDefinition;
}
