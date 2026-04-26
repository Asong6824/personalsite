# 博客音乐播放器使用说明

## 功能概述

博客音乐播放器已集成到文章页面中，位于目录组件上方，为读者提供优雅的背景音乐体验。

## 配置方法

### 在文章frontmatter中添加音乐

在MDX文件的frontmatter中添加`music`字段：

```yaml
---
title: "文章标题"
date: "2025-01-15"
# 其他字段...
music: [
  "https://your-cdn.com/music/song1.mp3",
  "https://your-cdn.com/music/song2.mp3"
]
---
```

### 支持的配置格式

1. **多首歌曲（数组格式）**：
```yaml
music: [
  "https://example.com/song1.mp3",
  "https://example.com/song2.mp3",
  "https://example.com/song3.mp3"
]
```

2. **单首歌曲（字符串格式）**：
```yaml
music: "https://example.com/single-song.mp3"
```

3. **无音乐配置**：
如果文章没有配置`music`字段，将使用默认播放列表。

## 播放器功能

- ✅ 播放/暂停控制
- ✅ 上一首/下一首切换
- ✅ 音量调节
- ✅ 静音功能
- ✅ 进度条显示和拖拽
- ✅ 播放列表显示
- ✅ 响应式设计
- ✅ 深色模式支持

## 音频文件要求

1. **格式支持**：MP3、WAV、OGG等主流音频格式
2. **文件大小**：建议单个文件不超过10MB
3. **CORS配置**：确保音频文件服务器支持跨域访问
4. **CDN推荐**：使用云厂商对象存储服务（如阿里云OSS、腾讯云COS等）

## 最佳实践

1. **音乐选择**：选择轻柔、不干扰阅读的背景音乐
2. **文件优化**：使用适当的音频压缩，平衡音质和文件大小
3. **加载性能**：音频文件采用懒加载，不影响页面首次加载速度
4. **用户体验**：播放器默认静音，由用户主动开启

## 示例配置

```yaml
---
title: "技术分享：Go语言最佳实践"
date: "2025-01-15"
slug: "go-best-practices"
author: "作者名"
tags: ["Go", "编程"]
excerpt: "分享Go语言开发中的最佳实践和经验总结"
coverImage: "https://cdn.example.com/cover.jpg"
music: [
  "https://cdn.example.com/music/coding-ambient.mp3",
  "https://cdn.example.com/music/focus-music.mp3"
]
---
```

## 技术实现

- 基于React Hooks构建
- 使用HTML5 Audio API
- Tailwind CSS样式
- 支持键盘快捷键（空格键播放/暂停）
- 自动记忆音量设置

## 注意事项

1. 音频文件需要配置正确的CORS头
2. 某些浏览器需要用户交互后才能播放音频
3. 移动设备可能有音频播放限制
4. 建议提供音频文件的备用链接