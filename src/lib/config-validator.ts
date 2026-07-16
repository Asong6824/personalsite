import type { ChannelsConfig, Post } from "@/types";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PostValidationResult extends ValidationResult {
  warnings: string[];
}

export interface ConfigSummary {
  totalChannels: number;
  totalColumns: number;
  channels: Array<{
    key: string;
    name: string;
    columnCount: number;
    columnKeys: string[];
  }>;
}

export interface PostsValidationResult extends ValidationResult {
  totalPosts: number;
  validPosts: number;
  warnings: string[];
}

export function validateChannelsConfig(
  channelsConfig: ChannelsConfig | unknown
): ValidationResult {
  const errors: string[] = [];

  if (!channelsConfig || typeof channelsConfig !== "object") {
    errors.push("CHANNELS_CONFIG must be a valid object");
    return { isValid: false, errors };
  }

  const config = channelsConfig as ChannelsConfig;
  const requiredChannelFields = ["name", "description", "columns"];
  const requiredColumnFields = ["name", "description"];

  Object.entries(config).forEach(([channelKey, channelConfig]) => {
    requiredChannelFields.forEach((field) => {
      if (!(field in (channelConfig as Record<string, unknown>))) {
        errors.push(
          `Channel '${channelKey}' is missing required field: ${field}`
        );
      }
    });

    if (
      channelConfig.name &&
      typeof channelConfig.name !== "string"
    ) {
      errors.push(`Channel '${channelKey}' name must be a string`);
    }

    if (
      channelConfig.description &&
      typeof channelConfig.description !== "string"
    ) {
      errors.push(`Channel '${channelKey}' description must be a string`);
    }

    if (channelConfig.columns) {
      if (typeof channelConfig.columns !== "object") {
        errors.push(`Channel '${channelKey}' columns must be an object`);
      } else {
        Object.entries(channelConfig.columns).forEach(
          ([columnKey, columnConfig]: [string, any]) => {
            requiredColumnFields.forEach((field) => {
              if (!(field in (columnConfig as Record<string, unknown>))) {
                errors.push(
                  `Column '${channelKey}.${columnKey}' is missing required field: ${field}`
                );
              }
            });

            if (
              columnConfig.name &&
              typeof columnConfig.name !== "string"
            ) {
              errors.push(
                `Column '${channelKey}.${columnKey}' name must be a string`
              );
            }

            if (
              columnConfig.description &&
              typeof columnConfig.description !== "string"
            ) {
              errors.push(
                `Column '${channelKey}.${columnKey}' description must be a string`
              );
            }

          }
        );
      }
    }
  });

  return { isValid: errors.length === 0, errors };
}

export function validateChannelExists(
  channelsConfig: ChannelsConfig | unknown,
  channelKey: string
): boolean {
  return (
    !!channelsConfig &&
    typeof channelsConfig === "object" &&
    channelKey in (channelsConfig as ChannelsConfig)
  );
}

export function validateColumnExists(
  channelsConfig: ChannelsConfig,
  channelKey: string,
  columnKey: string
): boolean {
  if (!validateChannelExists(channelsConfig, channelKey)) {
    return false;
  }
  const channelConfig = channelsConfig[channelKey];
  return (
    !!channelConfig.columns &&
    typeof channelConfig.columns === "object" &&
    columnKey in channelConfig.columns
  );
}

export function getConfigSummary(
  channelsConfig: ChannelsConfig | unknown
): ConfigSummary {
  if (!channelsConfig || typeof channelsConfig !== "object") {
    return { totalChannels: 0, totalColumns: 0, channels: [] };
  }

  const config = channelsConfig as ChannelsConfig;
  const channels = Object.entries(config).map(([channelKey, channelConfig]) => {
    const columnCount = channelConfig.columns
      ? Object.keys(channelConfig.columns).length
      : 0;
    const columnKeys = channelConfig.columns
      ? Object.keys(channelConfig.columns)
      : [];
    return { key: channelKey, name: channelConfig.name || "Unknown", columnCount, columnKeys };
  });

  const totalColumns = channels.reduce((sum, ch) => sum + ch.columnCount, 0);

  return { totalChannels: channels.length, totalColumns, channels };
}

export function validatePostClassification(
  post: Post | unknown,
  channelsConfig: ChannelsConfig
): PostValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!post || typeof post !== "object") {
    errors.push("Post must be a valid object");
    return { isValid: false, errors, warnings };
  }

  const p = post as Post;
  const { channel, column, slug } = p;
  const postIdentifier = slug || "unknown post";

  if (channel) {
    if (typeof channel !== "string") {
      errors.push(`Post '${postIdentifier}': channel must be a string`);
    } else if (!validateChannelExists(channelsConfig, channel)) {
      errors.push(
        `Post '${postIdentifier}': channel '${channel}' does not exist`
      );
    }
  }

  if (column) {
    if (typeof column !== "string") {
      errors.push(`Post '${postIdentifier}': column must be a string`);
    } else if (channel && !validateColumnExists(channelsConfig, channel, column)) {
      errors.push(
        `Post '${postIdentifier}': column '${column}' does not exist in channel '${channel}'`
      );
    } else if (!channel) {
      warnings.push(
        `Post '${postIdentifier}': column '${column}' specified without channel`
      );
    }
  }

  if (!channel) {
    errors.push(
      `Post '${postIdentifier}': channel is required`
    );
  }

  if (!column) {
    errors.push(
      `Post '${postIdentifier}': column is required`
    );
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validatePostsClassification(
  posts: unknown[],
  channelsConfig: ChannelsConfig
): PostsValidationResult {
  if (!Array.isArray(posts)) {
    return {
      isValid: false,
      totalPosts: 0,
      validPosts: 0,
      errors: ["Posts must be an array"],
      warnings: [],
    };
  }

  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  let validPosts = 0;

  posts.forEach((post) => {
    const validation = validatePostClassification(post, channelsConfig);
    if (validation.isValid) validPosts++;
    allErrors.push(...validation.errors);
    allWarnings.push(...validation.warnings);
  });

  return {
    isValid: allErrors.length === 0,
    totalPosts: posts.length,
    validPosts,
    errors: allErrors,
    warnings: allWarnings,
  };
}

export function validateConfigInDevelopment(channelsConfig: ChannelsConfig) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const validation = validateChannelsConfig(channelsConfig);
  const summary = getConfigSummary(channelsConfig);

  console.log("🔍 CHANNELS_CONFIG Validation Summary:");
  console.log(`📊 Total Channels: ${summary.totalChannels}`);
  console.log(`📚 Total Columns: ${summary.totalColumns}`);

  summary.channels.forEach((channel) => {
    console.log(
      `📁 ${channel.name} (${channel.key}): ${channel.columnCount} columns`
    );
    channel.columnKeys.forEach((columnKey) => {
      console.log(`  └── ${columnKey}`);
    });
  });

  if (!validation.isValid) {
    console.warn("⚠️  CHANNELS_CONFIG Validation Errors:");
    validation.errors.forEach((error) => {
      console.warn(`  ❌ ${error}`);
    });
  } else {
    console.log("✅ CHANNELS_CONFIG validation passed!");
  }
}
