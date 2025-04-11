# PromptHub API

PromptHub API 是基于Cloudflare Workers的后端服务，为PromptHub提供数据存储和检索功能。

## 技术栈

- Cloudflare Workers
- Cloudflare KV

## API 端点

### 获取所有提示词

```
GET /api/prompts
```

返回所有存储的提示词。

### 获取单个提示词

```
GET /api/prompts/:id
```

返回指定ID的提示词。

### 创建提示词

```
POST /api/prompts
```

创建新的提示词。请求体需要包含以下字段：

```json
{
  "title": "提示词标题",
  "content": "提示词内容",
  "description": "提示词描述（可选）",
  "tags": ["标签1", "标签2"]（可选）
}
```

### 更新提示词

```
PUT /api/prompts/:id
```

更新指定ID的提示词。请求体格式同创建提示词。

### 删除提示词

```
DELETE /api/prompts/:id
```

删除指定ID的提示词。

## 本地开发

1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

2. 登录到 Cloudflare 账户

```bash
wrangler login
```

3. 创建 KV 命名空间

```bash
wrangler kv:namespace create PROMPTS_KV
```

记下生成的 ID 并将其更新到 `wrangler.toml` 文件。

4. 为开发环境创建 KV 命名空间

```bash
wrangler kv:namespace create PROMPTS_KV --preview
```

记下生成的 ID 并将其作为 `preview_id` 更新到 `wrangler.toml` 文件。

5. 启动本地开发服务器

```bash
wrangler dev
```

## 部署

1. 编辑 `wrangler.toml` 文件，确保 KV 命名空间 ID 正确配置

2. 部署 Workers

```bash
wrangler publish
```

部署完成后，Wrangler 将输出 Workers 的 URL，将此 URL 更新到前端的 API 配置中。

## 配置

在部署前，请确保更新 `wrangler.toml` 中的以下设置：

1. KV 命名空间 ID
2. 允许的跨域来源 (ALLOWED_ORIGINS) 。