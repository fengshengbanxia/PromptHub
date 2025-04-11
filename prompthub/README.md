# PromptHub - 提示词管理系统

PromptHub是一个简单高效的提示词管理系统，使用React构建前端，Cloudflare Workers和KV存储构建后端。

## 功能特点

- 提示词管理：添加、编辑、删除和查看提示词
- 搜索功能：快速查找提示词
- 标签系统：通过标签对提示词分类和筛选
- 响应式设计：适配移动设备和桌面设备
- 数据导入导出：支持以JSON格式导入和导出提示词
- 离线可用：所有数据保存在Cloudflare KV中

## 技术栈

- 前端：React + Tailwind CSS
- 后端：Cloudflare Workers
- 数据存储：Cloudflare KV
- 部署：Cloudflare Pages

## 本地开发

### 前端开发

1. 安装依赖

```bash
cd prompthub
npm install
```

2. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 http://localhost:3000 启动。

### 后端开发

1. 安装Wrangler CLI

```bash
npm install -g wrangler
```

2. 登录Cloudflare

```bash
wrangler login
```

3. 创建KV命名空间

```bash
wrangler kv:namespace create PROMPTS_KV
```

记录下输出的id，并更新`prompthub-api/wrangler.toml`中的KV配置。

4. 创建开发环境KV命名空间

```bash
wrangler kv:namespace create PROMPTS_KV --preview
```

记录下输出的preview_id，并更新`prompthub-api/wrangler.toml`中的KV配置。

5. 本地开发

```bash
cd prompthub-api
wrangler dev
```

## 部署

### 前端部署

1. 构建前端代码

```bash
cd prompthub
npm run build
```

2. 部署到Cloudflare Pages

```bash
wrangler pages deploy dist
```

### 后端部署

1. 部署Workers

```bash
cd prompthub-api
wrangler publish
```

2. 更新前端API基础URL

部署后，更新`prompthub/src/api/promptApi.js`中的`API_BASE_URL`为你的Workers URL。

## 项目结构

```
prompthub/
├── src/
│   ├── api/           # API调用函数
│   ├── components/    # React组件
│   ├── context/       # React Context
│   └── styles/        # CSS样式文件
├── public/            # 静态资源
└── index.html         # HTML模板

prompthub-api/
├── src/
│   └── index.js       # Workers主文件
└── wrangler.toml      # Workers配置
```

## 贡献指南

欢迎提交问题和PR来改进项目！

## 许可证

MIT 