// src/lib/config-validator.js
// 配置验证工具，确保CHANNELS_CONFIG的完整性和一致性

/**
 * 验证频道配置的结构和完整性
 * @param {Object} channelsConfig - 频道配置对象
 * @returns {Object} 验证结果 { isValid: boolean, errors: string[] }
 */
export function validateChannelsConfig(channelsConfig) {
    const errors = [];
    
    if (!channelsConfig || typeof channelsConfig !== 'object') {
        errors.push('CHANNELS_CONFIG must be a valid object');
        return { isValid: false, errors };
    }
    
    const requiredChannelFields = ['name', 'description', 'columns'];
    const requiredColumnFields = ['name', 'description', 'tags'];
    
    // 验证每个频道
    Object.entries(channelsConfig).forEach(([channelKey, channelConfig]) => {
        // 验证频道基本结构
        requiredChannelFields.forEach(field => {
            if (!channelConfig[field]) {
                errors.push(`Channel '${channelKey}' is missing required field: ${field}`);
            }
        });
        
        // 验证频道名称和描述类型
        if (channelConfig.name && typeof channelConfig.name !== 'string') {
            errors.push(`Channel '${channelKey}' name must be a string`);
        }
        
        if (channelConfig.description && typeof channelConfig.description !== 'string') {
            errors.push(`Channel '${channelKey}' description must be a string`);
        }
        
        // 验证专栏配置
        if (channelConfig.columns) {
            if (typeof channelConfig.columns !== 'object') {
                errors.push(`Channel '${channelKey}' columns must be an object`);
            } else {
                Object.entries(channelConfig.columns).forEach(([columnKey, columnConfig]) => {
                    // 验证专栏基本结构
                    requiredColumnFields.forEach(field => {
                        if (!columnConfig[field]) {
                            errors.push(`Column '${channelKey}.${columnKey}' is missing required field: ${field}`);
                        }
                    });
                    
                    // 验证专栏名称和描述类型
                    if (columnConfig.name && typeof columnConfig.name !== 'string') {
                        errors.push(`Column '${channelKey}.${columnKey}' name must be a string`);
                    }
                    
                    if (columnConfig.description && typeof columnConfig.description !== 'string') {
                        errors.push(`Column '${channelKey}.${columnKey}' description must be a string`);
                    }
                    
                    // 验证标签数组
                    if (columnConfig.tags) {
                        if (!Array.isArray(columnConfig.tags)) {
                            errors.push(`Column '${channelKey}.${columnKey}' tags must be an array`);
                        } else {
                            columnConfig.tags.forEach((tag, index) => {
                                if (typeof tag !== 'string') {
                                    errors.push(`Column '${channelKey}.${columnKey}' tag at index ${index} must be a string`);
                                }
                            });
                        }
                    }
                });
            }
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * 验证频道键是否存在
 * @param {Object} channelsConfig - 频道配置对象
 * @param {string} channelKey - 频道键
 * @returns {boolean}
 */
export function validateChannelExists(channelsConfig, channelKey) {
    return channelsConfig && typeof channelsConfig === 'object' && channelKey in channelsConfig;
}

/**
 * 验证专栏键是否存在于指定频道中
 * @param {Object} channelsConfig - 频道配置对象
 * @param {string} channelKey - 频道键
 * @param {string} columnKey - 专栏键
 * @returns {boolean}
 */
export function validateColumnExists(channelsConfig, channelKey, columnKey) {
    if (!validateChannelExists(channelsConfig, channelKey)) {
        return false;
    }
    
    const channelConfig = channelsConfig[channelKey];
    return channelConfig.columns && typeof channelConfig.columns === 'object' && columnKey in channelConfig.columns;
}

/**
 * 获取配置验证摘要
 * @param {Object} channelsConfig - 频道配置对象
 * @returns {Object} 配置摘要
 */
export function getConfigSummary(channelsConfig) {
    if (!channelsConfig || typeof channelsConfig !== 'object') {
        return {
            totalChannels: 0,
            totalColumns: 0,
            channels: []
        };
    }
    
    const channels = Object.entries(channelsConfig).map(([channelKey, channelConfig]) => {
        const columnCount = channelConfig.columns ? Object.keys(channelConfig.columns).length : 0;
        const columnKeys = channelConfig.columns ? Object.keys(channelConfig.columns) : [];
        
        return {
            key: channelKey,
            name: channelConfig.name || 'Unknown',
            columnCount,
            columnKeys
        };
    });
    
    const totalColumns = channels.reduce((sum, channel) => sum + channel.columnCount, 0);
    
    return {
        totalChannels: channels.length,
        totalColumns,
        channels
    };
}

/**
 * 验证文章的手动分类字段
 * @param {Object} post - 文章对象
 * @param {Object} channelsConfig - 频道配置对象
 * @returns {Object} 验证结果 { isValid: boolean, errors: string[], warnings: string[] }
 */
export function validatePostClassification(post, channelsConfig) {
    const errors = [];
    const warnings = [];
    
    if (!post || typeof post !== 'object') {
        errors.push('Post must be a valid object');
        return { isValid: false, errors, warnings };
    }
    
    const { channel, column, tags, slug } = post;
    const postIdentifier = slug || 'unknown post';
    
    // 如果指定了频道，验证频道是否存在
    if (channel) {
        if (typeof channel !== 'string') {
            errors.push(`Post '${postIdentifier}': channel must be a string`);
        } else if (!validateChannelExists(channelsConfig, channel)) {
            errors.push(`Post '${postIdentifier}': channel '${channel}' does not exist`);
        }
    }
    
    // 如果指定了专栏，验证专栏是否存在
    if (column) {
        if (typeof column !== 'string') {
            errors.push(`Post '${postIdentifier}': column must be a string`);
        } else if (channel && !validateColumnExists(channelsConfig, channel, column)) {
            errors.push(`Post '${postIdentifier}': column '${column}' does not exist in channel '${channel}'`);
        } else if (!channel) {
            warnings.push(`Post '${postIdentifier}': column '${column}' specified without channel`);
        }
    }
    
    // 如果既没有手动分类也没有标签，发出警告
    if (!channel && !column && (!tags || !Array.isArray(tags) || tags.length === 0)) {
        warnings.push(`Post '${postIdentifier}': no classification method available (no channel/column or tags)`);
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * 批量验证多篇文章的分类
 * @param {Array} posts - 文章数组
 * @param {Object} channelsConfig - 频道配置对象
 * @returns {Object} 验证结果汇总
 */
export function validatePostsClassification(posts, channelsConfig) {
    if (!Array.isArray(posts)) {
        return {
            isValid: false,
            totalPosts: 0,
            validPosts: 0,
            errors: ['Posts must be an array'],
            warnings: []
        };
    }
    
    const allErrors = [];
    const allWarnings = [];
    let validPosts = 0;
    
    posts.forEach((post, index) => {
        const validation = validatePostClassification(post, channelsConfig);
        
        if (validation.isValid) {
            validPosts++;
        }
        
        allErrors.push(...validation.errors);
        allWarnings.push(...validation.warnings);
    });
    
    return {
        isValid: allErrors.length === 0,
        totalPosts: posts.length,
        validPosts,
        errors: allErrors,
        warnings: allWarnings
    };
}

/**
 * 在开发环境中验证配置并输出警告
 * @param {Object} channelsConfig - 频道配置对象
 */
export function validateConfigInDevelopment(channelsConfig) {
    if (process.env.NODE_ENV !== 'development') {
        return;
    }
    
    const validation = validateChannelsConfig(channelsConfig);
    const summary = getConfigSummary(channelsConfig);
    
    console.log('🔍 CHANNELS_CONFIG Validation Summary:');
    console.log(`📊 Total Channels: ${summary.totalChannels}`);
    console.log(`📚 Total Columns: ${summary.totalColumns}`);
    
    summary.channels.forEach(channel => {
        console.log(`📁 ${channel.name} (${channel.key}): ${channel.columnCount} columns`);
        channel.columnKeys.forEach(columnKey => {
            console.log(`  └── ${columnKey}`);
        });
    });
    
    if (!validation.isValid) {
        console.warn('⚠️  CHANNELS_CONFIG Validation Errors:');
        validation.errors.forEach(error => {
            console.warn(`  ❌ ${error}`);
        });
    } else {
        console.log('✅ CHANNELS_CONFIG validation passed!');
    }
}