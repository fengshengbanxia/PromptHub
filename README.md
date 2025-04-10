# PromptHub
一个基于 Cloudflare 的个人提示词管理网站，简单高效地存储、搜索和复制 AI 提示词。

## 项目介绍

PromptHub 是一个轻量级的个人提示词管理工具，使用 Cloudflare Workers 和 KV 存储构建，无需传统服务器即可部署和运行。它提供了以下功能：

- ✨ 创建和存储提示词，支持标题、内容和标签
- 🔍 快速搜索提示词内容和标签
- 🏷️ 通过标签分类和过滤提示词
- 📋 一键复制提示词内容到剪贴板
- 📱 响应式设计，在各种设备上都能良好工作

## 技术栈

- 前端：HTML, CSS, JavaScript (原生)
- 后端：Cloudflare Workers
- 数据存储：Cloudflare KV
- 部署：Cloudflare Pages

## 安装与部署

### 前提条件

- [Node.js](https://nodejs.org/) (v16 或更高版本)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/) (Cloudflare Workers 命令行工具)
- Cloudflare 账号

### 部署步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/prompthub.git
   cd prompthub
   ```

2. 安装依赖
   ```bash
   npm install -g wrangler
   ```

3. 登录到你的 Cloudflare 账号
   ```bash
   wrangler login
   ```

4. 创建 KV 命名空间
   ```bash
   wrangler kv:namespace create "PROMPTS_KV"
   wrangler kv:namespace create "PROMPTS_KV" --preview
   ```

5. 更新 `wrangler.toml` 文件，替换 KV 命名空间 ID
   ```toml
   kv_namespaces = [
     { binding = "PROMPTS_KV", id = "你的KV命名空间ID", preview_id = "你的预览KV命名空间ID" }
   ]
   ```

6. 部署到 Cloudflare Workers
   ```bash
   wrangler publish
   ```

## 本地开发

1. 安装依赖
   ```bash
   npm install -g wrangler
   ```

2. 启动本地开发服务器
   ```bash
   wrangler dev
   ```

3. 在浏览器中访问 http://localhost:8787

## 项目结构

```
prompthub/
├── public/              # 静态资源
│   ├── css/             # 样式文件
│   ├── js/              # JavaScript 文件
│   └── index.html       # 主页面
├── src/                 # 源代码
│   └── worker.js        # Cloudflare Worker 代码
├── wrangler.toml        # Wrangler 配置文件
└── README.md            # 项目说明文档
```

## 使用方法

1. 打开网站后，点击"新建提示词"按钮创建你的第一个提示词
2. 填写标题、内容和标签（用逗号分隔多个标签）
3. 点击保存即可添加到你的提示词库
4. 使用搜索框查找特定提示词，或通过标签筛选相关提示词
5. 点击提示词卡片查看详情，可以复制、编辑或删除提示词

## 许可证

MIT
