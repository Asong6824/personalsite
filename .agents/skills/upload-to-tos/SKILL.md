---
name: upload-to-tos
description: 使用 tosutil CLI 将本地图片/文件上传到火山引擎 TOS 对象存储。触发词："上传图片到TOS"、"tosutil上传"、"火山引擎上传"、"TOS上传"、"传图到对象存储"、"批量上传图片"。
---

# Upload to TOS — 火山引擎对象存储上传

## 适用场景

- 本地开发时批量上传图片素材到 TOS
- 将项目 `public/images` 目录同步到对象存储
- 替换手动在 TOS 控制台网页上传的流程
- 自动化脚本中集成文件上传（构建产物、静态资源等）

> ⚠️ **安全原则**：本 Skill 不携带任何敏感信息（AK/SK、bucket 名、endpoint）。实际使用时请从火山引擎控制台获取并替换占位符。

## 前置条件

1. 已开通火山引擎 TOS 服务并创建存储桶
2. 已获取 Access Key ID 和 Secret Access Key（控制台 → 账号 → API 访问密钥）
3. 已知存储桶的 Region 和 Endpoint（控制台 → 存储桶概览）

## 步骤一：下载并安装 tosutil

tosutil 是火山引擎官方命令行工具，兼容 Linux / macOS / Windows。

### macOS (Apple Silicon / Intel)

```bash
# Apple Silicon (ARM64)
curl -L -o tosutil "https://tos-tools.tos-cn-beijing.volces.com/darwin/arm64/tosutil"

# Intel (x86_64) — 或作为通用备用
curl -L -o tosutil "https://tos-tools.tos-cn-beijing.volces.com/darwin/tosutil"

chmod +x tosutil
sudo mv tosutil /usr/local/bin/
# 或放入 ~/.local/bin 并加入 PATH
```

### Linux

```bash
wget https://tos-tools.tos-cn-beijing.volces.com/linux/tosutil
chmod +x tosutil
sudo mv tosutil /usr/local/bin/
```

### 验证安装

```bash
tosutil version
# 期望输出类似：tosutil version: v4.1.7
```

## 步骤二：初始化配置

执行一次即可，配置会加密保存到 `~/.tosutilconfig`。

```bash
tosutil config -i <AccessKeyId> -k <SecretAccessKey> -e <Endpoint> -re <Region>
```

**参数说明：**

| 参数 | 来源 | 示例 |
|------|------|------|
| `-i` | 火山引擎控制台 → API 访问密钥 | `AKLTxxxxxxxxxxxx` |
| `-k` | 同上 | `Wm1RNVlXSTR...` |
| `-e` | 存储桶概览 → TOS 协议域名 | `tos-cn-beijing.volces.com` |
| `-re` | 存储桶概览 → Region | `cn-beijing` |

> 🔴 **注意**：必须使用 **TOS 协议域名**（如 `tos-cn-beijing.volces.com`），不要用带 `-s3-` 的 S3 兼容域名。

### 验证连通性

```bash
tosutil ls
```

期望输出包含 `Bucket number is: N` 及你的存储桶列表。如果返回 `Http status [403]`，说明密钥或权限有误。

## 步骤三：上传图片

### 上传单张图片

```bash
tosutil cp ~/Desktop/photo.jpg tos://<bucket-name>/images/photo.jpg
```

### 上传整个文件夹（递归）

```bash
# 上传 public/images 目录到存储桶的 static/images 路径下
tosutil cp ./public/images tos://<bucket-name>/static/images -r
```

### 增量上传（跳过未改动的文件）

```bash
tosutil cp ./public/images tos://<bucket-name>/static/images -r -u
```

### 设置公开可读（如图片需外网直接访问）

```bash
tosutil cp ./hero.png tos://<bucket-name>/images/hero.png --acl public-read
```

### 常用参数速查

| 参数 | 作用 |
|------|------|
| `-r` | 递归上传/下载文件夹 |
| `-u` | 增量上传（对比本地与云端，只传新增/变更） |
| `-j=N` | 批量并发数，默认 1，文件夹上传时建议 4-8 |
| `-p=N` | 分片并发数，大文件上传时调整 |
| `--acl public-read` | 设置对象访问权限为公开可读 |
| `-f` | 强制覆盖，不提示确认 |

## 常用操作

### 列出存储桶内容

```bash
# 列出根目录
tosutil ls tos://<bucket-name> -s

# 列出指定前缀
tosutil ls tos://<bucket-name>/images -s
```

### 删除文件

```bash
# 删除单个文件
tosutil rm tos://<bucket-name>/images/old-photo.jpg

# 删除整个目录（递归）
tosutil rm tos://<bucket-name>/images/temp-folder -r -f
```

### 下载文件

```bash
# 下载单张图片到本地
tosutil cp tos://<bucket-name>/images/photo.jpg ./downloads/photo.jpg

# 下载整个目录
tosutil cp tos://<bucket-name>/static/images ./local-images -r
```

## 与项目集成（Node.js SDK）

如需在代码中集成（如构建脚本自动上传），使用 `@volcengine/tos-sdk`：

```bash
npm i @volcengine/tos-sdk
```

```js
const { TosClient } = require('@volcengine/tos-sdk');
const fs = require('fs');

const client = new TosClient({
  accessKeyId: process.env.TOS_AK,
  accessKeySecret: process.env.TOS_SK,
  region: 'cn-beijing',
  endpoint: 'tos-cn-beijing.volces.com',
  bucket: '<bucket-name>',
});

async function upload(filePath, key) {
  const body = fs.createReadStream(filePath);
  await client.putObject({ key, body });
  console.log(`上传成功: ${key}`);
}
```

> ⚠️ **安全提示**：代码中不要硬编码 AK/SK，使用环境变量（如 `TOS_AK`、`TOS_SK`），并确保 `.env.local` 和密钥文件已加入 `.gitignore`。

## 安全建议

- [ ] AK/SK 文件（如 `AccessKey.txt`）必须加入 `.gitignore`
- [ ] 生产环境建议使用 **STS 临时凭证** 替代永久 AK/SK
- [ ] 公开访问的图片建议通过 CDN 域名访问，而非直接暴露 TOS 外网域名
- [ ] 定期在控制台轮换 Access Key

## 故障排查

| 现象 | 原因 | 解决 |
|------|------|------|
| `Http status [403]` | AK/SK 错误或权限不足 | 检查密钥，确认账号有 `tos:PutObject` 权限 |
| `A connection attempt failed` | 网络不通 | 检查 VPN/代理，或尝试内网 endpoint |
| `Invalid endpoint` | 使用了 S3 协议域名 | 换成 `tos-xxx.volces.com` 格式 |
| 上传速度极慢 | 单线程默认 | 加 `-j=4 -p=4` 提升并发 |
| 文件已存在不覆盖 | 默认行为 | 加 `-f` 强制覆盖，或加 `-u` 增量更新 |
